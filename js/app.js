/*
 * Lógica do simulador: cena 3D, câmera, paredes em corte, cliques (cards), trilha guiada,
 * simulações, cotas, ciclo de dia e noite e o modo "Editar layout" (arrastar, girar,
 * adicionar e remover objetos, sem sobreposição).
 */
window.UVA_APP = function (THREE, OrbitControls, CSS2DRenderer, CSS2DObject) {
  'use strict';

  const DADOS = window.UVA_DATA;
  const CATALOGO = DADOS.catalogo;
  const M = window.UVA_MODELOS(THREE);
  const { X, Z } = M.SALA;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const zonaPorId = Object.fromEntries(DADOS.zonas.map((z) => [z.id, z]));
  const cm = (v) => Math.round(v * 100) / 100;
  const metros = (v) => `${v.toFixed(2).replace('.', ',')} m`;

  // ---------- Renderização ----------
  const palco = $('#palco');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  palco.appendChild(renderer.domElement);

  const camadaRotulos = new CSS2DRenderer();
  camadaRotulos.setSize(window.innerWidth, window.innerHeight);
  camadaRotulos.domElement.className = 'camada-rotulos';
  palco.appendChild(camadaRotulos.domElement);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.05, 100);
  const controles = new OrbitControls(camera, renderer.domElement);
  controles.enableDamping = true;
  controles.maxPolarAngle = Math.PI * 0.49;
  controles.minDistance = 0.6;
  controles.maxDistance = 25;

  function visaoInicial() {
    const fator = camera.aspect < 1 ? 1.8 : 1;
    return { pos: V(-5.6, 6.6, 8.0).multiplyScalar(fator), alvo: V(0.3, 0.5, -0.4) };
  }
  const inicio = visaoInicial();
  camera.position.copy(inicio.pos);
  controles.target.copy(inicio.alvo);

  // ---------- Luz (o sol e as lâmpadas mudam com a hora do dia) ----------
  const hemi = new THREE.HemisphereLight('#ffffff', '#b9c2d6', 1.7);
  const ambiente = new THREE.AmbientLight('#ffffff', 0.45);
  const sol = new THREE.DirectionalLight('#fff6e8', 2.2);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.02;
  const luzJanela = new THREE.PointLight('#dceeff', 3, 6);
  luzJanela.position.set(X - 0.5, 1.8, M.JANELA.centro);
  const lampadas = [[-2, -1.2], [2, -1.2], [-2, 1.2], [2, 1.2]].map(([x, z]) => {
    const l = new THREE.PointLight('#ffe9c7', 0, 7, 1.5);
    l.position.set(x, 2.65, z);
    return l;
  });
  cena.add(hemi, ambiente, sol, luzJanela, ...lampadas);

  // ---------- Sala ----------
  const sala = M.sala();
  cena.add(sala.grupo);
  sala.paredes.forEach((p) => { p.anexosBase = p.anexos.slice(); });
  const paredePorId = Object.fromEntries(sala.paredes.map((p) => [p.id, p]));
  const ROTACAO_PAREDE = { cinza: 0, azul: Math.PI, janela: -Math.PI / 2, quadro: Math.PI / 2 };
  const obstaculos = sala.paredes.map((p) => p.grupo);

  // ---------- Placas flutuantes das zonas ----------
  DADOS.zonas.forEach((z) => {
    const el = document.createElement('button');
    el.className = 'rotulo-zona';
    el.style.setProperty('--cor', z.cor);
    el.innerHTML = `<span>${z.icone}</span>${esc(z.curto)}`;
    el.addEventListener('click', () => mostrarZona(z.id));
    const rotulo = new CSS2DObject(el);
    rotulo.position.fromArray(z.rotulo || z.centro);
    cena.add(rotulo);
  });

  // ---------- Cotas (medidas reais) ----------
  const cotas = [];
  function cota(a, b, texto, alturaTexto = 0) {
    const dir = b.clone().sub(a).normalize();
    const perp = V(-dir.z, 0, dir.x).multiplyScalar(0.12);
    const geo = new THREE.BufferGeometry().setFromPoints([a, b, a.clone().add(perp), a.clone().sub(perp), b.clone().add(perp), b.clone().sub(perp)]);
    const linhas = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#1f5fbf' }));
    const el = document.createElement('div');
    el.className = 'cota';
    el.textContent = texto;
    const rotulo = new CSS2DObject(el);
    rotulo.position.copy(a.clone().add(b).multiplyScalar(0.5)).add(V(0, alturaTexto, 0));
    cena.add(linhas, rotulo);
    cotas.push(linhas, rotulo);
  }
  const J = M.JANELA;
  cota(V(-X, -0.08, -Z - 0.32), V(X, -0.08, -Z - 0.32), '7,54 m');
  cota(V(-X - 0.32, -0.08, -Z), V(-X - 0.32, -0.08, Z), '5,29 m');
  cota(V(X + 0.05, J.base + J.h + 0.12, J.centro - J.w / 2), V(X + 0.05, J.base + J.h + 0.12, J.centro + J.w / 2), 'Janela 2,31 × 1,90 m', 0.15);
  let medidasVisiveis = false;
  function mostrarMedidas(on) {
    medidasVisiveis = on;
    cotas.forEach((o) => { o.visible = on; });
    $('#btn-medidas').classList.toggle('ativo', on);
  }
  mostrarMedidas(false);

  // ---------- Objetos da sala ----------
  // Cada objeto junta o tipo do catálogo com os campos próprios (os próprios têm prioridade).
  const objetos = new Map();       // id -> registro
  const clicaveis = [];
  function definicao(dados) {
    const tipo = (dados.tipo && CATALOGO[dados.tipo]) || {};
    return Object.assign({}, tipo, dados, { opcoes: Object.assign({}, tipo.opcoes, dados.opcoes) });
  }
  function criarObjeto(dados) {
    const d = definicao(dados);
    const obj = (M[d.modelo] || M.generico)(d.opcoes, d);
    const g = obj.grupo;
    const [x = 0, y = 0, z = 0] = d.pos || [];
    g.position.set(x, y, z);
    g.rotation.set(d.rotX || 0, d.rot !== undefined ? d.rot : (ROTACAO_PAREDE[d.parede] || 0), 0);
    if (d.escala) g.scale.setScalar(d.escala);
    g.userData.objId = d.id;
    const r = {
      id: d.id, d, obj, grupo: g, pai: null, sim: null,
      clicavel: Boolean(d.descricao),
      movel: !d.fixo && !d.preso && Array.isArray(d.base),
      // Objetos iguais (ex.: 5 computadores) contam uma vez só no progresso.
      chave: dados.descricao ? d.id : `tipo:${d.tipo}`
    };
    cena.add(g);
    if (d.fixo && paredePorId[d.parede]) paredePorId[d.parede].anexos.push(g);
    objetos.set(r.id, r);
    if (r.clicavel) clicaveis.push(g);
    return r;
  }
  function anexar(r, paiId) {
    const pai = paiId && objetos.get(paiId);
    if (pai && !ehDescendente(pai.grupo, r.grupo)) { pai.grupo.attach(r.grupo); r.pai = pai.id; }
    else { cena.attach(r.grupo); r.pai = null; }
  }
  function ehDescendente(g, ancestral) {
    for (let o = g; o; o = o.parent) if (o === ancestral) return true;
    return false;
  }
  function descendentes(r) {
    return [...objetos.values()].filter((o) => o !== r && ehDescendente(o.grupo, r.grupo));
  }
  function removerObjeto(id) {
    const r = objetos.get(id);
    if (!r) return;
    [r, ...descendentes(r)].forEach((o) => {
      objetos.delete(o.id);
      const i = clicaveis.indexOf(o.grupo);
      if (i >= 0) clicaveis.splice(i, 1);
    });
    if (r.grupo.parent) r.grupo.parent.remove(r.grupo);
  }
  function limparTudo() {
    soltarAberto();
    objetos.forEach((r) => { if (r.grupo.parent) r.grupo.parent.remove(r.grupo); });
    objetos.clear();
    clicaveis.length = 0;
    sala.paredes.forEach((p) => { p.anexos = p.anexosBase.slice(); p.cortada = null; });
  }
  function construirPadrao() {
    DADOS.objetos.forEach(criarObjeto);
    cena.updateMatrixWorld(true);
    DADOS.objetos.forEach((dd) => { if (dd.sobre) anexar(objetos.get(dd.id), dd.sobre); });
  }
  function rotacaoMundo(g) {
    return new THREE.Euler().setFromQuaternion(g.getWorldQuaternion(new THREE.Quaternion()), 'YXZ').y;
  }
  function medirItem(r) {
    const b = new THREE.Box3().setFromObject(r.grupo);
    r.centro = b.getCenter(V());
    r.raio = b.getSize(V()).length() / 2;
  }

  // ---------- Paredes em corte: a parede entre a câmera e a sala abaixa ----------
  function atualizarParedes() {
    sala.paredes.forEach((p) => {
      const fora = camera.position.clone().sub(p.ponto).dot(p.normal) > 0;
      if (fora === p.cortada) return;
      p.cortada = fora;
      p.grupo.scale.y = fora ? 0.08 : 1;
      p.anexos.forEach((o) => { o.visible = !fora; });
    });
  }

  // ---------- Destaque ----------
  let sobMouse = null;
  let aberto = null;          // objeto com card aberto
  function destacarGrupo(grupo, corBase, ligar) {
    const cor = new THREE.Color(corBase).multiplyScalar(0.45);
    grupo.traverse((o) => {
      if (!o.isMesh || o.userData.semDestaque || Array.isArray(o.material) || !o.material.emissive) return;
      if (o.userData.emissivaOriginal === undefined) o.userData.emissivaOriginal = o.material.emissive.getHex();
      if (ligar) o.material.emissive.copy(cor);
      else o.material.emissive.setHex(o.userData.emissivaOriginal);
    });
  }
  function corDaZona(r) { return (zonaPorId[r.d.zona] || {}).cor || '#1f5fbf'; }
  function destacar(id, ligar) {
    const r = objetos.get(id);
    if (r) destacarGrupo(r.grupo, corDaZona(r), ligar);
  }
  function definirSobMouse(id) {
    if (id === sobMouse) return;
    if (sobMouse && sobMouse !== aberto) destacar(sobMouse, false);
    sobMouse = id;
    if (id) destacar(id, true);
    renderer.domElement.style.cursor = id ? 'pointer' : '';
  }

  // ---------- Clique/toque ----------
  const raycaster = new THREE.Raycaster();
  const ponteiro = new THREE.Vector2();
  function visivel(o) {
    for (; o; o = o.parent) if (!o.visible) return false;
    return true;
  }
  function mirar(ev) {
    const ret = renderer.domElement.getBoundingClientRect();
    ponteiro.set(((ev.clientX - ret.left) / ret.width) * 2 - 1, -((ev.clientY - ret.top) / ret.height) * 2 + 1);
    raycaster.setFromCamera(ponteiro, camera);
  }
  function itemEm(ev) {
    mirar(ev);
    for (const hit of raycaster.intersectObjects(clicaveis.concat(obstaculos), true)) {
      if (!visivel(hit.object)) continue;
      for (let o = hit.object; o; o = o.parent) {
        if (o.userData.ehParede) return null;    // uma parede na frente bloqueia o clique
        const r = o.userData.objId && objetos.get(o.userData.objId);
        if (r && r.clicavel) return r.id;
      }
    }
    return null;
  }
  const dica = $('#dica-flutuante');
  renderer.domElement.addEventListener('pointermove', (ev) => {
    if (editando) { moverArrasto(ev); return; }
    if (ev.pointerType !== 'mouse' || ev.buttons) { dica.hidden = true; return; }
    const id = itemEm(ev);
    definirSobMouse(id);
    if (id) {
      const r = objetos.get(id);
      dica.innerHTML = `${r.d.icone || ''} ${esc(r.d.nome)}${visitados.has(r.chave) ? ' <span class="ok">✓</span>' : ''}`;
      dica.style.transform = `translate(${ev.clientX + 16}px, ${ev.clientY + 16}px)`;
      dica.hidden = false;
    } else {
      dica.hidden = true;
    }
  });
  renderer.domElement.addEventListener('pointerleave', () => { definirSobMouse(null); dica.hidden = true; });
  let inicioToque = null;
  renderer.domElement.addEventListener('pointerdown', (ev) => { inicioToque = { x: ev.clientX, y: ev.clientY }; });
  renderer.domElement.addEventListener('pointerup', (ev) => {
    if (editando) { terminarArrasto(); return; }
    if (!inicioToque || Math.hypot(ev.clientX - inicioToque.x, ev.clientY - inicioToque.y) > 6) return;
    const id = itemEm(ev);
    if (id) mostrarItem(id);
  });

  // ---------- Voo de câmera ----------
  let voo = null;
  controles.addEventListener('start', () => { voo = null; });
  function voarPara(pos, alvo) {
    voo = { dePos: camera.position.clone(), deAlvo: controles.target.clone(), pos, alvo, inicio: performance.now() };
  }
  // Olha para o alvo de dentro da sala, de frente para a parede indicada.
  function voarAte(centro, dist, paredeId) {
    let dir;
    const p = paredePorId[paredeId];
    if (p) dir = p.normal.clone().negate().add(V(0, 0.55, 0));
    else {
      dir = camera.position.clone().sub(controles.target);
      dir.y = Math.max(dir.y, 0.5 * Math.hypot(dir.x, dir.z));
    }
    dir.normalize();
    const pos = centro.clone().add(dir.clone().multiplyScalar(dist));
    const alvo = centro.clone();
    // No computador o card ocupa a direita da tela: desloca o enquadramento para o objeto ficar à esquerda.
    if (camera.aspect > 1.2) {
      const desvio = V().crossVectors(dir.negate(), V(0, 1, 0)).normalize().multiplyScalar(dist * 0.28);
      pos.add(desvio);
      alvo.add(desvio);
    }
    voarPara(pos, alvo);
  }
  function visaoGeral() {
    const v = visaoInicial();
    voarPara(v.pos, v.alvo);
  }

  // ---------- Progresso de exploração ----------
  const CHAVE_VISITADOS = 'uva-maker-visitados';
  let visitados = new Set();
  try { visitados = new Set(JSON.parse(localStorage.getItem(CHAVE_VISITADOS) || '[]')); } catch (e) { /* sem armazenamento */ }
  function representantes(zonaId) {
    const vistos = new Map();
    objetos.forEach((r) => {
      if (r.clicavel && (!zonaId || r.d.zona === zonaId) && !vistos.has(r.chave)) vistos.set(r.chave, r);
    });
    return [...vistos.values()];
  }
  function marcarVisitado(r) {
    if (visitados.has(r.chave)) return;
    visitados.add(r.chave);
    try { localStorage.setItem(CHAVE_VISITADOS, JSON.stringify([...visitados])); } catch (e) { /* sem armazenamento */ }
    atualizarProgresso();
    const todos = representantes();
    if (todos.every((o) => visitados.has(o.chave))) avisar('🎉 Parabéns! Você explorou todo o UVA Maker Hacker Space!', 5000);
  }
  function atualizarProgresso() {
    const todos = representantes();
    const feitos = todos.filter((o) => visitados.has(o.chave)).length;
    $('#progresso-texto').textContent = `${feitos} de ${todos.length} explorados`;
    $('#progresso-barra').style.width = `${todos.length ? (feitos / todos.length) * 100 : 0}%`;
    document.querySelectorAll('.chip-zona').forEach((b) => {
      const lista = representantes(b.dataset.zona);
      b.classList.toggle('completa', lista.length > 0 && lista.every((o) => visitados.has(o.chave)));
    });
  }

  // ---------- Painel (cards) ----------
  const painel = $('#painel');
  const conteudo = $('#painel-conteudo');
  let trilha = null;          // índice da estação na trilha guiada

  function soltarAberto() {
    if (!aberto) return;
    const r = objetos.get(aberto);
    if (r) {
      if (r.obj.selecionar) r.obj.selecionar(false);
      if (aberto !== sobMouse) destacar(aberto, false);
    }
    aberto = null;
  }
  function abrirPainel(html) {
    conteudo.innerHTML = html;
    painel.hidden = false;
    painel.scrollTop = 0;
    requestAnimationFrame(() => painel.classList.add('aberto'));
  }
  function fecharPainel() {
    painel.classList.remove('aberto');
    painel.hidden = true;
    soltarAberto();
    trilha = null;
  }
  $('#painel-fechar').addEventListener('click', fecharPainel);
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') fecharPainel(); });

  const chips = (titulo, lista) => lista && lista.length
    ? `<h3>${titulo}</h3><div class="chips">${lista.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>` : '';
  const secao = (titulo, texto) => texto ? `<h3>${titulo}</h3><p>${esc(texto)}</p>` : '';

  function mostrarItem(id) {
    const r = objetos.get(id);
    if (!r || !r.clicavel) return;
    if (aberto !== id) soltarAberto();
    aberto = id;
    trilha = null;
    destacar(id, true);
    if (r.obj.selecionar) r.obj.selecionar(true);
    marcarVisitado(r);
    medirItem(r);
    voarAte(r.centro, Math.min(3.4, Math.max(1.5, r.raio * 4)), r.d.parede);

    const it = r.d, z = zonaPorId[it.zona] || { id: '', nome: '', icone: '', cor: '#1f5fbf' };
    let h = `<div class="cab" style="--cor:${z.cor}">
      <div class="icone">${it.icone || ''}</div>
      <div><button class="etiqueta" data-zona="${z.id}">${z.icone} ${esc(z.nome)}</button><h2>${esc(it.nome)}</h2></div>
    </div>`;
    if (it.projeto && it.projeto.exemplo) h += `<p class="aviso-exemplo">Informações de exemplo: complete com os dados reais do projeto em <code>js/dados.js</code>.</p>`;
    h += `<p class="desc">${esc(it.descricao)}</p>`;
    if (it.projeto) {
      const p = it.projeto;
      h += secao('🎯 Objetivo pedagógico', p.objetivo);
      h += `<p class="autor"><b>Autoria:</b> ${esc(p.autor)}</p>`;
      h += chips('🧱 Materiais', p.materiais) + chips('⚙️ Tecnologias', p.tecnologias);
    }
    h += secao('💡 O que se aprende aqui', it.aprender);
    h += chips('♻️ Pode virar…', it.vira);
    if (it.sim) {
      h += `<div class="sim">
        <button class="btn primario" id="sim-btn">▶ ${esc(it.sim.acao)}</button>
        <div class="barra"><div id="sim-barra"></div></div>
        <p id="sim-passo" class="passo">Clique para ver a máquina trabalhando.</p>
        <p class="tempo">⏱️ Na vida real: <b>${esc(it.sim.tempo)}</b></p>
      </div>`;
    }
    if (it.dica) h += `<div class="dica"><b>🛡️ Dica maker:</b> ${esc(it.dica)}</div>`;
    abrirPainel(h);
  }

  function mostrarZona(zid) {
    const z = zonaPorId[zid];
    if (!z) return;
    soltarAberto();
    voarAte(V().fromArray(z.centro), camera.aspect < 1 ? 4.5 : 3.6, z.parede);
    const itens = representantes(zid);
    let h = `<div class="cab" style="--cor:${z.cor}">
      <div class="icone">${z.icone}</div>
      <div><span class="etiqueta">Estação</span><h2>${esc(z.nome)}</h2></div>
    </div>
    <p class="desc">${esc(z.descricao)}</p>
    ${secao('🎯 Objetivo', z.objetivo)}
    <h3>🔎 Clique para explorar</h3>
    <div class="lista-itens">${itens.map((r) => `<button class="item-btn${visitados.has(r.chave) ? ' visto' : ''}" data-item="${r.id}">
      <span>${r.d.icone || ''}</span>${esc(r.d.nome)}${visitados.has(r.chave) ? '<em>✓</em>' : ''}</button>`).join('')}</div>`;
    if (trilha !== null) {
      const n = DADOS.zonas.length, ultima = trilha === n - 1;
      h += `<div class="trilha-nav">
        <button class="btn" data-trilha="-1" ${trilha === 0 ? 'disabled' : ''}>← Anterior</button>
        <span>Estação ${trilha + 1} de ${n}</span>
        <button class="btn primario" data-trilha="1">${ultima ? 'Concluir 🎉' : 'Próxima →'}</button>
      </div>`;
    }
    abrirPainel(h);
  }

  function iniciarTrilha() {
    if (editando) sairEdicao();
    trilha = 0;
    mostrarZona(DADOS.zonas[0].id);
  }
  function passoTrilha(delta) {
    const prox = trilha + delta;
    if (prox >= DADOS.zonas.length) {
      fecharPainel();
      visaoGeral();
      avisar('Trilha concluída! Agora explore livremente: clique em qualquer objeto. 🚀', 4500);
      return;
    }
    trilha = Math.max(0, prox);
    mostrarZona(DADOS.zonas[trilha].id);
  }

  conteudo.addEventListener('click', (ev) => {
    const alvo = ev.target.closest('[data-item],[data-zona],[data-trilha],[data-adicionar],#sim-btn');
    if (!alvo) return;
    if (alvo.dataset.adicionar) adicionarDoCatalogo(alvo.dataset.adicionar);
    else if (alvo.dataset.item) mostrarItem(alvo.dataset.item);
    else if (alvo.dataset.zona) mostrarZona(alvo.dataset.zona);
    else if (alvo.dataset.trilha) passoTrilha(Number(alvo.dataset.trilha));
    else if (alvo.id === 'sim-btn' && aberto) iniciarSim(aberto);
  });

  // ---------- Simulações ----------
  function iniciarSim(id) {
    const r = objetos.get(id);
    if (!r || !r.d.sim || r.sim) return;
    r.sim = { inicio: relogio.elapsedTime, dur: r.d.sim.duracao || 8 };
    const btn = $('#sim-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⚙️ Trabalhando…'; }
  }
  function atualizarUISim(r, p) {
    const barra = $('#sim-barra'), passo = $('#sim-passo');
    if (!barra) return;
    barra.style.width = `${p * 100}%`;
    const passos = r.d.sim.passos || [];
    if (passos.length) passo.textContent = passos[Math.min(passos.length - 1, Math.floor(p * passos.length))];
  }
  function terminarSim(r) {
    if (aberto !== r.id) return;
    const barra = $('#sim-barra'), passo = $('#sim-passo'), btn = $('#sim-btn');
    if (barra) barra.style.width = '100%';
    if (passo) passo.innerHTML = `✅ Pronto! Aqui foi rápido, mas na vida real: <b>${esc(r.d.sim.tempo)}</b>.`;
    if (btn) { btn.disabled = false; btn.textContent = '↻ Simular de novo'; }
  }

  // ---------- Espaço ocupado e colisões (pegadas retangulares no chão, giradas) ----------
  const AREA_SALA = { x: 0, z: 0, w: 2 * X, d: 2 * Z, rot: 0 };
  // Colunas e pilares que avançam para dentro da sala.
  const OBSTACULOS = [
    { x: -0.9, z: -Z + 0.11, w: 0.46, d: 0.24, rot: 0 },
    { x: 0.95, z: Z - 0.125, w: 0.32, d: 0.25, rot: 0 },
    { x: X - 0.09, z: -1.45, w: 0.18, d: 0.3, rot: 0 }
  ];
  function pegada(r, x, z, rot) {
    const p = r.grupo.getWorldPosition(V());
    return {
      x: x !== undefined ? x : p.x, z: z !== undefined ? z : p.z,
      w: r.d.base[0], d: r.d.base[1], rot: rot !== undefined ? rot : rotacaoMundo(r.grupo)
    };
  }
  function superficie(r) {
    const p = r.grupo.getWorldPosition(V());
    const [w, d] = r.d.area || r.d.base;
    return { x: p.x, z: p.z, w, d, rot: rotacaoMundo(r.grupo), y: p.y + r.d.superficie };
  }
  function cantos(f) {
    const c = Math.cos(f.rot), s = Math.sin(f.rot), hw = f.w / 2, hd = f.d / 2;
    return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([a, b]) => [f.x + a * c + b * s, f.z - a * s + b * c]);
  }
  function pontoDentro(px, pz, area, folga = 0.005) {
    const dx = px - area.x, dz = pz - area.z, c = Math.cos(area.rot), s = Math.sin(area.rot);
    const lx = dx * c - dz * s, lz = dx * s + dz * c;
    return Math.abs(lx) <= area.w / 2 + folga && Math.abs(lz) <= area.d / 2 + folga;
  }
  function dentroDe(f, area) { return cantos(f).every(([px, pz]) => pontoDentro(px, pz, area)); }
  function sobrepoe(a, b) {
    const pa = cantos(a), pb = cantos(b);
    const eixos = [pa[1], pa[3], pb[1], pb[3]].map((p, i) => {
      const o = i < 2 ? pa[0] : pb[0];
      return [p[0] - o[0], p[1] - o[1]];
    });
    for (const [ex, ez] of eixos) {
      const proj = (pts) => pts.map(([px, pz]) => px * ex + pz * ez);
      const qa = proj(pa), qb = proj(pb);
      const tol = 0.002 * Math.hypot(ex, ez);
      if (Math.max(...qa) <= Math.min(...qb) + tol || Math.max(...qb) <= Math.min(...qa) + tol) return false;
    }
    return true;
  }
  // O objeto `r` caberia com a pegada `f` sobre `apoio` (um móvel com tampo, ou null = chão)?
  function cabe(r, f, apoio) {
    if (!dentroDe(f, apoio ? superficie(apoio) : AREA_SALA)) return false;
    const apoioId = apoio ? apoio.id : null;
    for (const o of objetos.values()) {
      if (o === r || !Array.isArray(o.d.base) || o.d.fixo || (o.pai || null) !== apoioId) continue;
      if (r && ehDescendente(o.grupo, r.grupo)) continue;
      if (sobrepoe(f, pegada(o))) return false;
    }
    if (!apoio && OBSTACULOS.some((ob) => sobrepoe(f, ob))) return false;
    return true;
  }

  // ---------- Modo "Editar layout" ----------
  const COR_EDICAO = '#1f5fbf', COR_ERRO = '#e63946';
  const PASSO = 0.05;                      // encaixa a cada 5 cm
  const encaixar = (v) => Math.round(v / PASSO) * PASSO;
  let editando = false, selecionado = null, arrasto = null;

  function statusEdicao(texto) { $('#be-status').textContent = texto; }
  function movelEm(ev) {
    mirar(ev);
    const alvos = [...objetos.values()].filter((r) => !r.pai && !r.d.fixo).map((r) => r.grupo).concat(obstaculos);
    for (const hit of raycaster.intersectObjects(alvos, true)) {
      if (!visivel(hit.object)) continue;
      for (let o = hit.object; o; o = o.parent) {
        if (o.userData.ehParede) return null;
        const r = o.userData.objId && objetos.get(o.userData.objId);
        if (r && r.movel) return r;
      }
    }
    return null;
  }
  function selecionar(r) {
    const atual = selecionado && objetos.get(selecionado);
    if (atual) destacarGrupo(atual.grupo, COR_EDICAO, false);
    selecionado = r ? r.id : null;
    if (r) destacarGrupo(r.grupo, COR_EDICAO, true);
    atualizarBarraEdicao();
  }
  function atualizarBarraEdicao() {
    const r = selecionado && objetos.get(selecionado);
    ['#be-girar-esq', '#be-girar-dir', '#be-remover'].forEach((s) => { $(s).disabled = !r; });
    $('#be-original').disabled = !r || !DADOS.objetos.some((o) => o.id === r.id);
    if (!r) {
      $('#be-nome').textContent = 'Nenhum objeto selecionado';
      $('#be-pos').textContent = 'Clique e arraste um objeto. Use Q e E para girar 15°.';
      return;
    }
    const p = r.grupo.getWorldPosition(V());
    const graus = Math.round((((rotacaoMundo(r.grupo) * 180) / Math.PI) % 360 + 360) % 360);
    const pai = r.pai && objetos.get(r.pai);
    $('#be-nome').textContent = r.d.nome;
    $('#be-pos').textContent = `${metros(p.x + X)} da parede do quadro · ${metros(p.z + Z)} da parede cinza · ${graus}°`
      + (pai ? ` · sobre: ${pai.d.nome}` : '');
  }

  const chao = new THREE.Plane(V(0, 1, 0), 0);
  function iniciarArrasto(ev) {
    const r = movelEm(ev);
    selecionar(r);
    if (!r) return;
    const posInicial = r.grupo.getWorldPosition(V());
    const p = raycaster.ray.intersectPlane(new THREE.Plane(V(0, 1, 0), -posInicial.y), V());
    if (!p) return;
    arrasto = {
      r, dx: posInicial.x - p.x, dz: posInicial.z - p.z, moveu: false, ultimo: null,
      inicio: { pos: posInicial, rot: rotacaoMundo(r.grupo), pai: r.pai }
    };
    cena.attach(r.grupo);
    controles.enabled = false;
  }
  // Procura onde o objeto vai parar: no tampo mais alto sob o cursor (se ele pode ir em superfície) ou no chão.
  function avaliar(ev) {
    const { r } = arrasto;
    mirar(ev);
    let apoio = null, ponto = null;
    if (r.d.apoio !== 'chao') {
      const tampos = [...objetos.values()]
        .filter((s) => s.d.superficie && s !== r && !ehDescendente(s.grupo, r.grupo))
        .map((s) => ({ s, area: superficie(s) }))
        .sort((a, b) => b.area.y - a.area.y);
      for (const { s, area } of tampos) {
        const p = raycaster.ray.intersectPlane(new THREE.Plane(V(0, 1, 0), -area.y), V());
        if (p && pontoDentro(p.x, p.z, area, 0)) { apoio = s; ponto = p; break; }
      }
    }
    if (!ponto) {
      if (r.d.apoio === 'superficie') return null;
      ponto = raycaster.ray.intersectPlane(chao, V());
      if (!ponto) return null;
    }
    const x = encaixar(ponto.x + arrasto.dx), z = encaixar(ponto.z + arrasto.dz);
    const y = apoio ? superficie(apoio).y : 0;
    const f = pegada(r, x, z, rotacaoMundo(r.grupo));
    return { apoio, x, y, z, valido: cabe(r, f, apoio) };
  }
  function moverArrasto(ev) {
    if (!arrasto) {
      renderer.domElement.style.cursor = movelEm(ev) ? 'grab' : '';
      return;
    }
    const a = avaliar(ev);
    if (!a) return;
    arrasto.ultimo = a;
    arrasto.moveu = true;
    arrasto.r.grupo.position.set(a.x, a.y, a.z);
    destacarGrupo(arrasto.r.grupo, a.valido ? COR_EDICAO : COR_ERRO, true);
    renderer.domElement.style.cursor = a.valido ? 'grabbing' : 'not-allowed';
    atualizarBarraEdicao();
  }
  function terminarArrasto() {
    if (!arrasto) return;
    const { r, inicio, ultimo, moveu } = arrasto;
    arrasto = null;
    controles.enabled = true;
    destacarGrupo(r.grupo, COR_EDICAO, true);
    if (moveu && ultimo && ultimo.valido) {
      anexar(r, ultimo.apoio ? ultimo.apoio.id : null);
      salvarLayout(`${r.d.nome} ${ultimo.apoio ? `foi para cima de: ${ultimo.apoio.d.nome}` : 'foi movido'}.`);
    } else {
      r.grupo.position.copy(inicio.pos);
      r.grupo.rotation.set(0, inicio.rot, 0);
      anexar(r, inicio.pai);
      if (moveu) statusEdicao('Não cabe ali: o lugar está ocupado ou fora da sala. O objeto voltou para onde estava.');
    }
    atualizarBarraEdicao();
  }
  function girar(graus) {
    const r = selecionado && objetos.get(selecionado);
    if (!r) return;
    const novaRot = rotacaoMundo(r.grupo) + (graus * Math.PI) / 180;
    const apoio = r.pai && objetos.get(r.pai);
    if (!cabe(r, pegada(r, undefined, undefined, novaRot), apoio || null)) {
      statusEdicao('Girado assim ele não cabe: encostaria em outro objeto ou na parede.');
      return;
    }
    r.grupo.rotation.y += (graus * Math.PI) / 180;
    atualizarBarraEdicao();
    salvarLayout(`${r.d.nome} girado.`);
  }

  // Captura antes do OrbitControls: ao pegar um objeto, a câmera não gira.
  palco.addEventListener('pointerdown', (ev) => {
    if (editando && ev.target === renderer.domElement) iniciarArrasto(ev);
  }, true);
  window.addEventListener('pointerup', () => { if (editando) terminarArrasto(); });
  document.addEventListener('keydown', (ev) => {
    if (!editando || ev.target.closest('input, textarea')) return;
    if (ev.key === 'q' || ev.key === 'Q') girar(15);
    if (ev.key === 'e' || ev.key === 'E') girar(-15);
    if (ev.key === 'Delete') removerSelecionado(true);
  });

  function entrarEdicao() {
    fecharPainel();
    editando = true;
    document.body.classList.add('editando');
    $('#barra-edicao').hidden = false;
    $('#btn-editar').classList.add('ativo');
    dica.hidden = true;
    definirSobMouse(null);
    voarPara(V(0, 9, 4.2), V(0, 0, -0.2));
    atualizarBarraEdicao();
    statusEdicao('Suas mudanças ficam salvas neste navegador. Use "Salvar arquivo" para guardar uma cópia.');
  }
  function sairEdicao() {
    terminarArrasto();
    selecionar(null);
    editando = false;
    document.body.classList.remove('editando');
    $('#barra-edicao').hidden = true;
    $('#btn-editar').classList.remove('ativo');
    if (!painel.hidden && conteudo.querySelector('.catalogo')) fecharPainel();
    renderer.domElement.style.cursor = '';
  }

  function voltarAoOriginal() {
    const r = selecionado && objetos.get(selecionado);
    const original = r && DADOS.objetos.find((o) => o.id === r.id);
    if (!original) return;
    const [x, y, z] = original.pos;
    cena.attach(r.grupo);
    r.grupo.position.set(x, y, z);
    r.grupo.rotation.set(0, original.rot !== undefined ? original.rot : (ROTACAO_PAREDE[original.parede] || 0), 0);
    anexar(r, original.sobre);
    atualizarBarraEdicao();
    salvarLayout(`${r.d.nome} voltou ao lugar original.`);
  }
  // Botões com confirmação em dois cliques (o navegador do simulador não usa confirm()).
  function confirmarDuasVezes(botao, textoNormal, acao) {
    let espera = null;
    botao.addEventListener('click', () => {
      if (!espera) {
        botao.textContent = 'Clique de novo para confirmar';
        espera = setTimeout(() => { botao.textContent = textoNormal; espera = null; }, 3000);
        return;
      }
      clearTimeout(espera);
      espera = null;
      botao.textContent = textoNormal;
      acao();
    });
  }
  function removerSelecionado() {
    const r = selecionado && objetos.get(selecionado);
    if (!r) return;
    const filhos = descendentes(r).filter((o) => o.movel).length;
    selecionar(null);
    removerObjeto(r.id);
    atualizarProgresso();
    salvarLayout(`${r.d.nome} removido${filhos ? ` com ${filhos} objeto(s) que estavam em cima` : ''}. "Restaurar tudo" traz de volta.`);
  }

  // ---------- Catálogo: adicionar objetos ----------
  function mostrarCatalogo() {
    const grupos = {};
    Object.entries(CATALOGO).forEach(([tipo, c]) => {
      if (c.noCatalogo) return;
      (grupos[c.categoria || 'Outros'] = grupos[c.categoria || 'Outros'] || []).push([tipo, c]);
    });
    const html = `<div class="cab" style="--cor:${COR_EDICAO}">
        <div class="icone">➕</div>
        <div><span class="etiqueta">Catálogo</span><h2>Adicionar objeto</h2></div>
      </div>
      <p class="desc">Escolha um objeto. Ele aparece num lugar livre do chão; depois é só arrastar até onde quiser.</p>
      <div class="catalogo">${Object.entries(grupos).map(([cat, itens]) => `<h3>${esc(cat)}</h3>
        <div class="lista-itens">${itens.map(([tipo, c]) => `<button class="item-btn" data-adicionar="${tipo}">
          <span>${c.icone || '📦'}</span><span class="cat-nome">${esc(c.nome)}<small>${metros(c.base[0])} × ${metros(c.base[1])}</small></span></button>`).join('')}</div>`).join('')}</div>`;
    abrirPainel(html);
  }
  function lugarLivre(base) {
    for (let raio = 0; raio <= 4; raio += 0.25) {
      const voltas = Math.max(1, Math.round(raio * 8));
      for (let k = 0; k < voltas; k++) {
        const a = (k / voltas) * Math.PI * 2;
        const f = { x: encaixar(0.3 + Math.cos(a) * raio), z: encaixar(Math.sin(a) * raio * 0.7), w: base[0], d: base[1], rot: 0 };
        if (cabe(null, f, null)) return f;
      }
    }
    return null;
  }
  function adicionarDoCatalogo(tipo) {
    const c = CATALOGO[tipo];
    if (!c) return;
    const f = lugarLivre(c.base);
    if (!f) { statusEdicao(`Não há espaço livre no chão para: ${c.nome}. Remova ou afaste algum objeto.`); return; }
    const id = `novo-${tipo}-${Date.now().toString(36)}`;
    const r = criarObjeto({ id, tipo, pos: [f.x, 0, f.z], rot: 0 });
    selecionar(r);
    atualizarProgresso();
    salvarLayout(`${c.nome} adicionado. Arraste para posicionar.`);
  }

  $('#btn-editar').addEventListener('click', () => (editando ? sairEdicao() : entrarEdicao()));
  $('#be-concluir').addEventListener('click', sairEdicao);
  $('#be-adicionar').addEventListener('click', mostrarCatalogo);
  $('#be-girar-esq').addEventListener('click', () => girar(90));
  $('#be-girar-dir').addEventListener('click', () => girar(-90));
  $('#be-original').addEventListener('click', voltarAoOriginal);
  confirmarDuasVezes($('#be-remover'), '🗑 Remover', removerSelecionado);
  confirmarDuasVezes($('#be-resetar'), 'Restaurar tudo', () => {
    selecionar(null);
    try { localStorage.removeItem(CHAVE_LAYOUT); } catch (e) { /* sem armazenamento */ }
    aplicarEstado(null);
    statusEdicao('Voltou ao layout original do laboratório.');
  });

  // ---------- Salvar e abrir o layout ----------
  // Fica salvo no navegador de cada pessoa e pode ser baixado/aberto como arquivo .json.
  const CHAVE_LAYOUT = 'uva-maker-layout-v2';
  function estadoAtual() {
    const lista = [];
    objetos.forEach((r) => {
      if (!r.movel) return;
      const p = r.grupo.getWorldPosition(V());
      lista.push({ id: r.id, tipo: r.d.tipo, x: cm(p.x), y: cm(p.y), z: cm(p.z), rot: Math.round(rotacaoMundo(r.grupo) * 1000) / 1000, sobre: r.pai || null });
    });
    const removidos = DADOS.objetos.filter((o) => !objetos.has(o.id)).map((o) => o.id);
    return { tipo: 'uva-maker-layout', versao: 2, salvoEm: new Date().toISOString(), objetos: lista, removidos };
  }
  function aplicarEstado(estado) {
    limparTudo();
    construirPadrao();
    if (estado && estado.tipo === 'uva-maker-layout' && estado.versao === 2) {
      (estado.removidos || []).forEach((id) => removerObjeto(id));
      const itens = (estado.objetos || []).filter((o) => o && typeof o.id === 'string' && [o.x, o.y, o.z, o.rot].every(Number.isFinite));
      itens.forEach((o) => {
        if (!objetos.has(o.id) && CATALOGO[o.tipo] && !CATALOGO[o.tipo].noCatalogo) criarObjeto({ id: o.id, tipo: o.tipo, pos: [o.x, o.y, o.z], rot: o.rot });
      });
      const validos = itens.filter((o) => objetos.has(o.id) && objetos.get(o.id).movel);
      validos.forEach((o) => {
        const r = objetos.get(o.id);
        cena.attach(r.grupo);
        r.grupo.position.set(Math.min(X, Math.max(-X, o.x)), o.y, Math.min(Z, Math.max(-Z, o.z)));
        r.grupo.rotation.set(0, o.rot, 0);
        r.pai = null;
      });
      cena.updateMatrixWorld(true);
      validos.forEach((o) => { if (o.sobre && o.sobre !== o.id) anexar(objetos.get(o.id), o.sobre); });
    }
    atualizarProgresso();
    if (editando) atualizarBarraEdicao();
  }
  function salvarLayout(mensagem) {
    try {
      localStorage.setItem(CHAVE_LAYOUT, JSON.stringify(estadoAtual()));
      statusEdicao(`${mensagem || 'Salvo.'} Salvo neste navegador.`);
    } catch (e) {
      statusEdicao(`${mensagem || ''} Este navegador não deixou salvar: use "Salvar arquivo" para não perder o layout.`);
    }
  }
  function nomeArquivo() {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return `layout-uva-maker-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
  }
  function salvarArquivo() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(estadoAtual(), null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    statusEdicao(`Arquivo "${a.download}" salvo na pasta de downloads.`);
  }
  function abrirArquivo(arquivo) {
    const leitor = new FileReader();
    leitor.onload = () => {
      let dados = null;
      try { dados = JSON.parse(leitor.result); } catch (e) { /* tratado abaixo */ }
      if (!dados || dados.tipo !== 'uva-maker-layout' || dados.versao !== 2) {
        statusEdicao(`"${arquivo.name}" não é um layout desta versão do simulador. Abra um arquivo criado com "Salvar arquivo".`);
        return;
      }
      selecionar(null);
      aplicarEstado(dados);
      salvarLayout(`Layout "${arquivo.name}" aberto.`);
    };
    leitor.readAsText(arquivo);
  }
  $('#be-salvar-arquivo').addEventListener('click', salvarArquivo);
  $('#be-abrir-arquivo').addEventListener('click', () => $('#be-arquivo').click());
  $('#be-arquivo').addEventListener('change', (ev) => {
    const arquivo = ev.target.files && ev.target.files[0];
    if (arquivo) abrirArquivo(arquivo);
    ev.target.value = '';
  });

  // ---------- Hora do dia ----------
  const CORES_CEU = {
    noite: [new THREE.Color('#0b1630'), new THREE.Color('#1d2b4f')],
    entardecer: [new THREE.Color('#f2a97e'), new THREE.Color('#fde3c8')],
    dia: [new THREE.Color('#cfe0f5'), new THREE.Color('#f5f8fc')]
  };
  const corSolAlto = new THREE.Color('#fff6e8'), corSolBaixo = new THREE.Color('#ff9a4d');
  const ceuDia = new THREE.Color('#ffffff'), ceuNoite = new THREE.Color('#4a5a8a');
  let hora = 10, luzesManuais = null, diaAnimado = false;
  function definirHora(h) {
    hora = h;
    const ang = ((h - 6) / 12) * Math.PI;           // 6h nasce do lado da janela; 18h se põe do lado do quadro
    const alt = Math.sin(ang);
    const dia = THREE.MathUtils.smoothstep(alt, -0.05, 0.35);
    const baixo = 1 - THREE.MathUtils.smoothstep(alt, 0.05, 0.5);
    sol.position.set(Math.cos(ang) * 9, Math.max(alt, 0.08) * 9, 3.5);
    sol.intensity = 2.6 * dia;
    sol.color.copy(corSolAlto).lerp(corSolBaixo, baixo);
    hemi.intensity = 0.25 + 1.45 * dia;
    hemi.color.copy(ceuNoite).lerp(ceuDia, dia);
    ambiente.intensity = 0.15 + 0.3 * dia;
    luzJanela.intensity = 3 * dia;
    const acesas = luzesManuais !== null ? luzesManuais : (h < 7 || h > 17.5);
    lampadas.forEach((l) => { l.intensity = acesas ? 9 : 0; });
    $('#btn-luzes').classList.toggle('ativo', acesas);
    const t1 = Math.min(1, dia * 2), t2 = Math.max(0, dia * 2 - 1);
    const [topo, base] = [0, 1].map((i) => CORES_CEU.noite[i].clone().lerp(CORES_CEU.entardecer[i], t1).lerp(CORES_CEU.dia[i], t2));
    document.body.style.background = `linear-gradient(180deg, #${topo.getHexString()}, #${base.getHexString()})`;
    document.body.classList.toggle('noite', dia < 0.35);
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    $('#hora-texto').textContent = `${String(hh).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`;
    $('#hora').value = h;
  }
  $('#hora').addEventListener('input', (ev) => { luzesManuais = null; definirHora(Number(ev.target.value)); });
  $('#btn-luzes').addEventListener('click', () => {
    luzesManuais = !$('#btn-luzes').classList.contains('ativo');
    definirHora(hora);
  });
  $('#btn-dia').addEventListener('click', () => {
    diaAnimado = !diaAnimado;
    $('#btn-dia').textContent = diaAnimado ? '⏸' : '▶';
    $('#btn-dia').setAttribute('aria-label', diaAnimado ? 'Pausar o dia' : 'Passar o dia');
  });

  // ---------- Interface fixa ----------
  const nav = $('#zonas');
  DADOS.zonas.forEach((z) => {
    const b = document.createElement('button');
    b.className = 'chip-zona';
    b.dataset.zona = z.id;
    b.style.setProperty('--cor', z.cor);
    b.innerHTML = `<span>${z.icone}</span>${esc(z.curto)}`;
    b.addEventListener('click', () => { if (editando) sairEdicao(); trilha = null; mostrarZona(z.id); });
    nav.appendChild(b);
  });
  $('#btn-trilha').addEventListener('click', iniciarTrilha);
  $('#btn-geral').addEventListener('click', () => { fecharPainel(); visaoGeral(); });
  $('#btn-medidas').addEventListener('click', () => {
    mostrarMedidas(!medidasVisiveis);
    if (medidasVisiveis) avisar('Sala de 7,54 m × 5,29 m · janela de 2,31 × 1,90 m', 3500);
  });
  $('#btn-ajuda').addEventListener('click', () => { $('#boas-vindas').hidden = false; });
  $('#bv-explorar').addEventListener('click', () => { $('#boas-vindas').hidden = true; });
  $('#bv-trilha').addEventListener('click', () => { $('#boas-vindas').hidden = true; iniciarTrilha(); });

  let temporizadorAviso = null;
  function avisar(texto, ms = 3000) {
    const el = $('#aviso');
    el.textContent = texto;
    el.classList.add('visivel');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => el.classList.remove('visivel'), ms);
  }

  // ---------- Início ----------
  let salvo = null;
  try { salvo = JSON.parse(localStorage.getItem(CHAVE_LAYOUT) || 'null'); } catch (e) { /* sem armazenamento */ }
  aplicarEstado(salvo);
  definirHora(10);

  // ---------- Laço principal ----------
  const relogio = new THREE.Clock();
  const suave = (x) => x * x * (3 - 2 * x);
  function animar() {
    requestAnimationFrame(animar);
    const dt = Math.min(relogio.getDelta(), 0.1);
    const t = relogio.elapsedTime;

    if (diaAnimado) {
      let h = hora + dt * 0.8;                       // cerca de 20 segundos para o dia inteiro
      if (h > 22) h = 5;
      definirHora(h);
    }
    if (voo) {
      const fracao = Math.min(1, (performance.now() - voo.inicio) / 1100);
      const k = suave(fracao);
      camera.position.lerpVectors(voo.dePos, voo.pos, k);
      controles.target.lerpVectors(voo.deAlvo, voo.alvo, k);
      if (fracao === 1) voo = null;
    }

    objetos.forEach((r) => {
      if (!r.obj.atualizar) return;
      let p = null;
      if (r.sim) {
        p = Math.min(1, (t - r.sim.inicio) / r.sim.dur);
        if (aberto === r.id) atualizarUISim(r, p);
        if (p >= 1) { r.sim = null; p = null; terminarSim(r); }
      }
      r.obj.atualizar(t, p);
    });

    controles.update();
    atualizarParedes();
    renderer.render(cena, camera);
    camadaRotulos.render(cena, camera);
  }
  animar();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    camadaRotulos.setSize(window.innerWidth, window.innerHeight);
  });

  const carregando = $('#carregando');
  if (carregando) carregando.remove();

  // Links diretos: #impressora-3d (objeto), #eletronica (zona), #medidas. Também #item=..., #zona=..., #sim=...
  const hash = decodeURIComponent(location.hash.slice(1));
  let [chave, valor] = hash.split('=');
  if (valor === undefined && objetos.has(hash)) [chave, valor] = ['item', hash];
  else if (valor === undefined && zonaPorId[hash]) [chave, valor] = ['zona', hash];
  if (chave === 'medidas') { $('#boas-vindas').hidden = true; mostrarMedidas(true); }
  if (chave === 'noite') { $('#boas-vindas').hidden = true; definirHora(Number(valor) || 20); }
  if (valor && (objetos.has(valor) || zonaPorId[valor])) {
    $('#boas-vindas').hidden = true;
    if (chave === 'zona') mostrarZona(valor);
    else if (objetos.has(valor)) {
      mostrarItem(valor);
      if (chave === 'sim') setTimeout(() => iniciarSim(valor), 1200);
    }
  }
};
