/*
 * Lógica do simulador: cena 3D, câmera, paredes em corte, cliques (hotspots), cards,
 * trilha guiada, simulações das máquinas, medidas e progresso de exploração.
 */
window.UVA_APP = function (THREE, OrbitControls, CSS2DRenderer, CSS2DObject) {
  'use strict';

  const DADOS = window.UVA_DATA;
  const M = window.UVA_MODELOS(THREE);
  const { X, Z } = M.SALA;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const zonaPorId = Object.fromEntries(DADOS.zonas.map((z) => [z.id, z]));

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
    return { pos: new THREE.Vector3(-5.6, 6.6, 8.0).multiplyScalar(fator), alvo: new THREE.Vector3(0.3, 0.5, -0.4) };
  }
  const inicio = visaoInicial();
  camera.position.copy(inicio.pos);
  controles.target.copy(inicio.alvo);

  // ---------- Luz ----------
  cena.add(new THREE.HemisphereLight('#ffffff', '#b9c2d6', 1.7));
  cena.add(new THREE.AmbientLight('#ffffff', 0.45));
  const sol = new THREE.DirectionalLight('#fff6e8', 2.2);
  sol.position.set(4, 9, 3);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 25 });
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.02;
  cena.add(sol);
  const luzJanela = new THREE.PointLight('#dceeff', 3, 6);
  luzJanela.position.set(X - 0.5, 1.8, M.JANELA.centro);
  cena.add(luzJanela);

  // ---------- Sala ----------
  const sala = M.sala();
  cena.add(sala.grupo);
  const paredePorId = Object.fromEntries(sala.paredes.map((p) => [p.id, p]));
  const ROTACAO_PAREDE = { cinza: 0, azul: Math.PI, janela: -Math.PI / 2, quadro: Math.PI / 2 };

  function posicionar(grupo, d) {
    const [x = 0, y = 0, z = 0] = d.pos || [];
    grupo.position.set(x, y, z);
    const rotY = d.rot !== undefined ? d.rot : (ROTACAO_PAREDE[d.parede] || 0);
    grupo.rotation.set(d.rotX || 0, rotY, 0);
    if (d.escala) grupo.scale.setScalar(d.escala);
    if (d.fixo && paredePorId[d.parede]) paredePorId[d.parede].anexos.push(grupo);
  }

  // Móveis que podem ser arrastados no modo de edição (id -> registro).
  const moviveis = new Map();
  function registrarMovel(id, nome, grupo) {
    grupo.userData.movelId = id;
    moviveis.set(id, { id, nome, grupo, original: { x: grupo.position.x, z: grupo.position.z, rot: grupo.rotation.y } });
  }

  DADOS.moveis.forEach((m) => {
    const b = (M[m.tipo] || M.generico)(m);
    posicionar(b.grupo, m);
    cena.add(b.grupo);
    if (m.id && !m.fixo) registrarMovel(m.id, m.nome || m.tipo, b.grupo);
  });

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
    const mat = new THREE.LineBasicMaterial({ color: '#1f5fbf' });
    const dir = b.clone().sub(a).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.12);
    const pts = [a, b, a.clone().add(perp), a.clone().sub(perp), b.clone().add(perp), b.clone().sub(perp)];
    const geo = new THREE.BufferGeometry().setFromPoints([pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]]);
    const linhas = new THREE.LineSegments(geo, mat);
    const el = document.createElement('div');
    el.className = 'cota';
    el.textContent = texto;
    const rotulo = new CSS2DObject(el);
    rotulo.position.copy(a.clone().add(b).multiplyScalar(0.5)).add(new THREE.Vector3(0, alturaTexto, 0));
    cena.add(linhas, rotulo);
    cotas.push(linhas, rotulo);
  }
  const yc = -0.08;
  cota(new THREE.Vector3(-X, yc, -Z - 0.32), new THREE.Vector3(X, yc, -Z - 0.32), '7,54 m');
  cota(new THREE.Vector3(-X - 0.32, yc, -Z), new THREE.Vector3(-X - 0.32, yc, Z), '5,29 m');
  const J = M.JANELA;
  cota(new THREE.Vector3(X + 0.05, J.base + J.h + 0.12, J.centro - J.w / 2), new THREE.Vector3(X + 0.05, J.base + J.h + 0.12, J.centro + J.w / 2), 'Janela 2,31 × 1,90 m', 0.15);
  let medidasVisiveis = false;
  function mostrarMedidas(on) {
    medidasVisiveis = on;
    cotas.forEach((o) => { o.visible = on; });
    $('#btn-medidas').classList.toggle('ativo', on);
  }
  mostrarMedidas(false);

  // ---------- Itens clicáveis ----------
  const registros = new Map();
  const clicaveis = [];
  DADOS.itens.forEach((item) => {
    const construtor = M[item.modelo] || M.generico;
    const obj = construtor(item.opcoes || {}, item);
    posicionar(obj.grupo, item);
    obj.grupo.userData.itemId = item.id;
    cena.add(obj.grupo);
    registros.set(item.id, { item, obj, grupo: obj.grupo, sim: null });
    clicaveis.push(obj.grupo);
    if (!item.fixo && !item.sobre) registrarMovel(item.id, item.nome, obj.grupo);
  });
  // Itens apoiados num móvel passam a ser filhos dele (mantendo a posição) e se movem junto.
  cena.updateMatrixWorld(true);
  registros.forEach((r) => {
    const pai = r.item.sobre && moviveis.get(r.item.sobre);
    if (pai) pai.grupo.attach(r.grupo);
  });
  function medirItem(r) {
    const b = new THREE.Box3().setFromObject(r.grupo);
    r.centro = b.getCenter(new THREE.Vector3());
    r.raio = b.getSize(new THREE.Vector3()).length() / 2;
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

  // ---------- Destaque ao passar o mouse ----------
  let sobMouse = null;
  let aberto = null;          // item com card aberto
  function destacar(id, ligar) {
    const r = registros.get(id);
    if (r) destacarGrupo(r.grupo, zonaPorId[r.item.zona].cor, ligar);
  }
  function destacarGrupo(grupo, corBase, ligar) {
    const cor = new THREE.Color(corBase).multiplyScalar(0.45);
    grupo.traverse((o) => {
      if (!o.isMesh || o.userData.semDestaque || Array.isArray(o.material) || !o.material.emissive) return;
      if (o.userData.emissivaOriginal === undefined) o.userData.emissivaOriginal = o.material.emissive.getHex();
      if (ligar) o.material.emissive.copy(cor);
      else o.material.emissive.setHex(o.userData.emissivaOriginal);
    });
  }
  function definirSobMouse(id) {
    if (id === sobMouse) return;
    if (sobMouse && sobMouse !== aberto) destacar(sobMouse, false);
    sobMouse = id;
    if (id) destacar(id, true);
    renderer.domElement.style.cursor = id ? 'pointer' : '';
  }

  // ---------- Seleção por clique/toque ----------
  const raycaster = new THREE.Raycaster();
  const ponteiro = new THREE.Vector2();
  const obstaculos = sala.paredes.map((p) => p.grupo);
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
      let o = hit.object;
      while (o && !o.userData.itemId && !o.userData.ehParede) o = o.parent;
      if (!o) continue;
      return o.userData.itemId || null;    // uma parede na frente bloqueia o clique
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
      const it = registros.get(id).item;
      dica.innerHTML = `${it.icone} ${esc(it.nome)}${visitados.has(id) ? ' <span class="ok">✓</span>' : ''}`;
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

  // ---------- Modo "Editar layout": arrastar móveis pelo chão ----------
  const { X: LX, Z: LZ } = M.SALA;
  const chao = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const COR_EDICAO = '#1f5fbf';
  let editando = false, selecionado = null, arrasto = null;
  let layout = {};                       // id -> { x, z, rot } só dos móveis que saíram do lugar original
  const cm = (v) => Math.round(v * 100) / 100;
  const metros = (v) => `${v.toFixed(2).replace('.', ',')} m`;

  function movelEm(ev) {
    mirar(ev);
    const alvos = [...moviveis.values()].map((m) => m.grupo).concat(obstaculos);
    for (const hit of raycaster.intersectObjects(alvos, true)) {
      if (!visivel(hit.object)) continue;
      for (let o = hit.object; o; o = o.parent) {
        if (o.userData.movelId) return o.userData.movelId;
        if (o.userData.ehParede) return null;
      }
    }
    return null;
  }
  function pontoNoChao(ev) {
    mirar(ev);
    return raycaster.ray.intersectPlane(chao, new THREE.Vector3());
  }
  function aplicarLayout(novo) {
    layout = novo && typeof novo === 'object' ? novo : {};
    moviveis.forEach((m) => {
      const p = layout[m.id] || m.original;
      m.grupo.position.x = p.x;
      m.grupo.position.z = p.z;
      m.grupo.rotation.y = p.rot;
    });
    atualizarBarraEdicao();
  }
  function registrarPosicao(m) {
    layout[m.id] = { x: cm(m.grupo.position.x), z: cm(m.grupo.position.z), rot: Math.round(m.grupo.rotation.y * 1000) / 1000 };
  }
  function selecionarMovel(id) {
    if (selecionado && moviveis.has(selecionado)) destacarGrupo(moviveis.get(selecionado).grupo, COR_EDICAO, false);
    selecionado = id;
    if (id) destacarGrupo(moviveis.get(id).grupo, COR_EDICAO, true);
    atualizarBarraEdicao();
  }
  function atualizarBarraEdicao() {
    const m = selecionado && moviveis.get(selecionado);
    ['#be-girar-esq', '#be-girar-dir', '#be-original'].forEach((s) => { $(s).disabled = !m; });
    if (!m) {
      $('#be-nome').textContent = 'Nenhum móvel selecionado';
      $('#be-pos').textContent = 'Clique e arraste um móvel pelo chão. Use Q e E para girar 15°.';
      return;
    }
    const p = m.grupo.position;
    const graus = Math.round(((m.grupo.rotation.y * 180) / Math.PI % 360 + 360) % 360);
    $('#be-nome').textContent = m.nome;
    $('#be-pos').textContent = `${metros(p.x + LX)} da parede do quadro · ${metros(p.z + LZ)} da parede cinza · ${graus}°`;
  }
  function iniciarArrasto(ev) {
    const id = movelEm(ev);
    selecionarMovel(id);
    if (!id) return false;
    const p = pontoNoChao(ev);
    if (!p) return false;
    const g = moviveis.get(id).grupo;
    arrasto = { id, dx: g.position.x - p.x, dz: g.position.z - p.z, moveu: false };
    controles.enabled = false;
    return true;
  }
  function moverArrasto(ev) {
    if (!arrasto) {
      renderer.domElement.style.cursor = movelEm(ev) ? 'grab' : '';
      return;
    }
    const p = pontoNoChao(ev);
    if (!p) return;
    const g = moviveis.get(arrasto.id).grupo;
    const passo = 0.05;                   // encaixa a cada 5 cm
    g.position.x = Math.min(LX - 0.1, Math.max(-LX + 0.1, Math.round((p.x + arrasto.dx) / passo) * passo));
    g.position.z = Math.min(LZ - 0.1, Math.max(-LZ + 0.1, Math.round((p.z + arrasto.dz) / passo) * passo));
    arrasto.moveu = true;
    renderer.domElement.style.cursor = 'grabbing';
    atualizarBarraEdicao();
  }
  function terminarArrasto() {
    if (!arrasto) return;
    const { id, moveu } = arrasto;
    arrasto = null;
    controles.enabled = true;
    if (moveu) { registrarPosicao(moviveis.get(id)); salvarLayout(); }
  }
  function girar(graus) {
    const m = selecionado && moviveis.get(selecionado);
    if (!m) return;
    m.grupo.rotation.y += (graus * Math.PI) / 180;
    registrarPosicao(m);
    atualizarBarraEdicao();
    salvarLayout();
  }
  // Captura antes do OrbitControls: ao pegar um móvel, a câmera não gira.
  palco.addEventListener('pointerdown', (ev) => {
    if (editando && ev.target === renderer.domElement) iniciarArrasto(ev);
  }, true);
  window.addEventListener('pointerup', () => { if (editando) terminarArrasto(); });
  document.addEventListener('keydown', (ev) => {
    if (!editando || ev.target.closest('input, textarea')) return;
    if (ev.key === 'q' || ev.key === 'Q') girar(15);
    if (ev.key === 'e' || ev.key === 'E') girar(-15);
  });

  function entrarEdicao() {
    fecharPainel();
    editando = true;
    document.body.classList.add('editando');
    $('#barra-edicao').hidden = false;
    $('#btn-editar').classList.add('ativo');
    dica.hidden = true;
    definirSobMouse(null);
    voarPara(new THREE.Vector3(0, 9, 4.2), new THREE.Vector3(0, 0, -0.2));
    atualizarBarraEdicao();
    statusEdicao(textoModoEdicao());
  }
  function sairEdicao() {
    terminarArrasto();
    selecionarMovel(null);
    editando = false;
    document.body.classList.remove('editando');
    $('#barra-edicao').hidden = true;
    $('#btn-editar').classList.remove('ativo');
    renderer.domElement.style.cursor = '';
  }
  $('#btn-editar').addEventListener('click', () => (editando ? sairEdicao() : entrarEdicao()));
  $('#be-concluir').addEventListener('click', sairEdicao);
  $('#be-girar-esq').addEventListener('click', () => girar(90));
  $('#be-girar-dir').addEventListener('click', () => girar(-90));
  $('#be-original').addEventListener('click', () => {
    if (!selecionado) return;
    delete layout[selecionado];
    aplicarLayout(layout);
    salvarLayout();
  });
  let confirmarReset = null;
  $('#be-resetar').addEventListener('click', (ev) => {
    const btn = ev.currentTarget;
    if (!confirmarReset) {
      btn.textContent = 'Clique de novo para confirmar';
      confirmarReset = setTimeout(() => { btn.textContent = 'Restaurar tudo'; confirmarReset = null; }, 3000);
      return;
    }
    clearTimeout(confirmarReset);
    confirmarReset = null;
    btn.textContent = 'Restaurar tudo';
    restaurarTudo();
  });

  // ---------- Onde o layout fica salvo ----------
  // - Dono e editores do artifact no claude.ai: no banco do artifact. É o layout oficial, que todos veem.
  // - Todas as outras pessoas (site público, arquivo local, visitantes do artifact): no próprio navegador,
  //   e em arquivo .json pelos botões "Salvar arquivo" e "Abrir arquivo".
  const CHAVE_LAYOUT = 'uva-maker-layout';
  let docLayout = null, salvando = false, salvarDeNovo = false;
  let temLayoutPessoal = false, ultimoOficial = {};
  function statusEdicao(texto) { $('#be-status').textContent = texto; }
  function lerLayoutPessoal() {
    try {
      const v = JSON.parse(localStorage.getItem(CHAVE_LAYOUT) || 'null');
      return v && typeof v === 'object' ? v : null;
    } catch (e) { return null; }
  }
  async function salvarLayout() {
    if (!docLayout) {
      temLayoutPessoal = true;
      try {
        localStorage.setItem(CHAVE_LAYOUT, JSON.stringify(layout));
        statusEdicao('Salvo neste navegador. Use "Salvar arquivo" para guardar uma cópia ou enviar para alguém.');
      } catch (e) {
        statusEdicao('Este navegador não deixou salvar. Use "Salvar arquivo" para não perder o layout.');
      }
      return;
    }
    if (salvando) { salvarDeNovo = true; return; }
    salvando = true;
    statusEdicao('Salvando…');
    try {
      await docLayout.set({ posicoes: JSON.parse(JSON.stringify(layout)) });
      statusEdicao('Salvo como layout oficial. Quem abrir o simulador vê este layout.');
    } catch (e) {
      statusEdicao('Não foi possível salvar agora. Mova o móvel de novo em alguns segundos.');
    }
    salvando = false;
    if (salvarDeNovo) { salvarDeNovo = false; salvarLayout(); }
  }
  function restaurarTudo() {
    if (docLayout) { aplicarLayout({}); salvarLayout(); return; }
    try { localStorage.removeItem(CHAVE_LAYOUT); } catch (e) { /* sem armazenamento */ }
    temLayoutPessoal = false;
    aplicarLayout(ultimoOficial);
    statusEdicao('Voltou ao layout original do laboratório.');
  }
  function textoModoEdicao() {
    return docLayout
      ? 'Você está editando o layout oficial: todos que abrirem o simulador verão as mudanças.'
      : 'Suas mudanças ficam salvas neste navegador. Use "Salvar arquivo" para guardar uma cópia.';
  }

  // Arquivo de layout (.json)
  function nomeArquivo() {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return `layout-uva-maker-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
  }
  async function salvarArquivo() {
    const conteudo = JSON.stringify({ tipo: 'uva-maker-layout', versao: 1, salvoEm: new Date().toISOString(), posicoes: layout }, null, 2);
    const claude = window.claude;
    if (claude && typeof claude.use === 'function') {
      const downloads = await claude.use('downloads');
      if (!downloads) { statusEdicao('Esta visualização não permite baixar arquivos.'); return; }
      try {
        await downloads.save({ filename: nomeArquivo(), data: conteudo });
        statusEdicao('Arquivo salvo.');
      } catch (e) {
        statusEdicao(e && e.code === 'declined' ? 'Download cancelado.' : 'Não foi possível baixar o arquivo aqui.');
      }
      return;
    }
    const url = URL.createObjectURL(new Blob([conteudo], { type: 'application/json' }));
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
    leitor.onload = async () => {
      let dados = null;
      try { dados = JSON.parse(leitor.result); } catch (e) { /* tratado abaixo */ }
      const posicoes = dados && dados.tipo === 'uva-maker-layout' ? dados.posicoes : null;
      if (!posicoes || typeof posicoes !== 'object') {
        statusEdicao(`"${arquivo.name}" não é um layout do simulador. Abra um arquivo criado com "Salvar arquivo".`);
        return;
      }
      const limpo = {};
      Object.keys(posicoes).forEach((id) => {
        const p = posicoes[id];
        if (!moviveis.has(id) || !p || ![p.x, p.z, p.rot].every(Number.isFinite)) return;
        limpo[id] = {
          x: Math.min(LX - 0.1, Math.max(-LX + 0.1, p.x)),
          z: Math.min(LZ - 0.1, Math.max(-LZ + 0.1, p.z)),
          rot: p.rot
        };
      });
      selecionarMovel(null);
      aplicarLayout(limpo);
      await salvarLayout();
      statusEdicao(`Layout "${arquivo.name}" aberto. ${docLayout ? 'Ele agora é o layout oficial.' : 'Ficou salvo neste navegador.'}`);
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

  async function iniciarArmazenamento() {
    $('#btn-editar').hidden = false;
    const pessoal = lerLayoutPessoal();
    const claude = window.claude;
    if (!claude || typeof claude.use !== 'function') {
      if (pessoal) { temLayoutPessoal = true; aplicarLayout(pessoal); }
      return;
    }
    const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
    const oficial = Boolean(db && user && await user.canEdit());
    if (db) {
      const doc = db.doc('layout/atual');
      if (oficial) docLayout = doc;
      doc.onSnapshot((snap) => {
        ultimoOficial = (snap.exists && (snap.data() || {}).posicoes) || {};
        if (arrasto || temLayoutPessoal) return;
        aplicarLayout(ultimoOficial);
      }, () => { /* mantém o último layout recebido */ });
    }
    if (!oficial && pessoal) { temLayoutPessoal = true; aplicarLayout(pessoal); }
    if (editando) statusEdicao(textoModoEdicao());
  }
  iniciarArmazenamento();

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
    if (p) dir = p.normal.clone().negate().add(new THREE.Vector3(0, 0.55, 0));
    else {
      dir = camera.position.clone().sub(controles.target);
      dir.y = Math.max(dir.y, 0.5 * Math.hypot(dir.x, dir.z));
    }
    dir.normalize();
    const pos = centro.clone().add(dir.clone().multiplyScalar(dist));
    const alvo = centro.clone();
    // No computador o card ocupa a direita da tela: desloca o enquadramento para o objeto ficar à esquerda.
    if (camera.aspect > 1.2) {
      const direita = new THREE.Vector3().crossVectors(dir.negate(), new THREE.Vector3(0, 1, 0)).normalize();
      const desvio = direita.multiplyScalar(dist * 0.28);
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
  const CHAVE = 'uva-maker-visitados';
  let visitados = new Set();
  try { visitados = new Set(JSON.parse(localStorage.getItem(CHAVE) || '[]').filter((id) => registros.has(id))); } catch (e) { /* sem armazenamento */ }
  function marcarVisitado(id) {
    if (visitados.has(id)) return;
    visitados.add(id);
    try { localStorage.setItem(CHAVE, JSON.stringify([...visitados])); } catch (e) { /* sem armazenamento */ }
    atualizarProgresso();
    if (visitados.size === registros.size) avisar('🎉 Parabéns! Você explorou todo o Uva Maker Hacker Space!', 5000);
  }
  function atualizarProgresso() {
    $('#progresso-texto').textContent = `${visitados.size} de ${registros.size} explorados`;
    $('#progresso-barra').style.width = `${(visitados.size / registros.size) * 100}%`;
    document.querySelectorAll('.chip-zona').forEach((b) => {
      const ids = DADOS.itens.filter((i) => i.zona === b.dataset.zona).map((i) => i.id);
      b.classList.toggle('completa', ids.every((id) => visitados.has(id)));
    });
  }

  // ---------- Painel (cards) ----------
  const painel = $('#painel');
  const conteudo = $('#painel-conteudo');
  let trilha = null;          // índice da estação na trilha guiada

  function soltarAberto() {
    if (!aberto) return;
    const r = registros.get(aberto);
    if (r.obj.selecionar) r.obj.selecionar(false);
    if (aberto !== sobMouse) destacar(aberto, false);
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
    const r = registros.get(id);
    if (!r) return;
    if (aberto !== id) soltarAberto();
    aberto = id;
    trilha = null;
    destacar(id, true);
    if (r.obj.selecionar) r.obj.selecionar(true);
    marcarVisitado(id);
    medirItem(r);
    voarAte(r.centro, Math.min(3.4, Math.max(1.5, r.raio * 4)), r.item.parede);

    const it = r.item, z = zonaPorId[it.zona];
    let h = `<div class="cab" style="--cor:${z.cor}">
      <div class="icone">${it.icone}</div>
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
    voarAte(new THREE.Vector3().fromArray(z.centro), camera.aspect < 1 ? 4.5 : 3.6, z.parede);
    const itens = DADOS.itens.filter((i) => i.zona === zid);
    let h = `<div class="cab" style="--cor:${z.cor}">
      <div class="icone">${z.icone}</div>
      <div><span class="etiqueta">Estação</span><h2>${esc(z.nome)}</h2></div>
    </div>
    <p class="desc">${esc(z.descricao)}</p>
    ${secao('🎯 Objetivo', z.objetivo)}
    <h3>🔎 Clique para explorar</h3>
    <div class="lista-itens">${itens.map((i) => `<button class="item-btn${visitados.has(i.id) ? ' visto' : ''}" data-item="${i.id}">
      <span>${i.icone}</span>${esc(i.nome)}${visitados.has(i.id) ? '<em>✓</em>' : ''}</button>`).join('')}</div>`;
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
    const alvo = ev.target.closest('[data-item],[data-zona],[data-trilha],#sim-btn');
    if (!alvo) return;
    if (alvo.dataset.item) mostrarItem(alvo.dataset.item);
    else if (alvo.dataset.zona) mostrarZona(alvo.dataset.zona);
    else if (alvo.dataset.trilha) passoTrilha(Number(alvo.dataset.trilha));
    else if (alvo.id === 'sim-btn' && aberto) iniciarSim(aberto);
  });

  // ---------- Simulações ----------
  function iniciarSim(id) {
    const r = registros.get(id);
    if (!r || !r.item.sim || r.sim) return;
    r.sim = { inicio: relogio.elapsedTime, dur: r.item.sim.duracao || 8 };
    const btn = $('#sim-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⚙️ Trabalhando…'; }
  }
  function atualizarUISim(r, p) {
    const barra = $('#sim-barra'), passo = $('#sim-passo');
    if (!barra) return;
    barra.style.width = `${p * 100}%`;
    const passos = r.item.sim.passos || [];
    if (passos.length) passo.textContent = passos[Math.min(passos.length - 1, Math.floor(p * passos.length))];
  }
  function terminarSim(r) {
    if (aberto !== r.item.id) return;
    const barra = $('#sim-barra'), passo = $('#sim-passo'), btn = $('#sim-btn');
    if (barra) barra.style.width = '100%';
    if (passo) passo.innerHTML = `✅ Pronto! Aqui foi rápido, mas na vida real: <b>${esc(r.item.sim.tempo)}</b>.`;
    if (btn) { btn.disabled = false; btn.textContent = '↻ Simular de novo'; }
  }

  // ---------- Interface fixa ----------
  const nav = $('#zonas');
  DADOS.zonas.forEach((z) => {
    const b = document.createElement('button');
    b.className = 'chip-zona';
    b.dataset.zona = z.id;
    b.style.setProperty('--cor', z.cor);
    b.innerHTML = `<span>${z.icone}</span>${esc(z.curto)}`;
    b.addEventListener('click', () => { trilha = null; mostrarZona(z.id); });
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

  atualizarProgresso();

  // ---------- Laço principal ----------
  const relogio = new THREE.Clock();
  const suave = (x) => x * x * (3 - 2 * x);
  function animar() {
    requestAnimationFrame(animar);
    relogio.getDelta();
    const t = relogio.elapsedTime;

    if (voo) {
      const fracao = Math.min(1, (performance.now() - voo.inicio) / 1100);
      const k = suave(fracao);
      camera.position.lerpVectors(voo.dePos, voo.pos, k);
      controles.target.lerpVectors(voo.deAlvo, voo.alvo, k);
      if (fracao === 1) voo = null;
    }

    registros.forEach((r) => {
      if (!r.obj.atualizar) return;
      let p = null;
      if (r.sim) {
        p = Math.min(1, (t - r.sim.inicio) / r.sim.dur);
        if (aberto === r.item.id) atualizarUISim(r, p);
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

  // Links diretos: #impressora-3d (item), #eletronica (zona), #medidas.
  // No arquivo local também valem #item=..., #zona=... e #sim=... (a versão publicada só repassa #palavra).
  const hash = decodeURIComponent(location.hash.slice(1));
  let [chave, valor] = hash.split('=');
  if (valor === undefined && registros.has(hash)) [chave, valor] = ['item', hash];
  else if (valor === undefined && zonaPorId[hash]) [chave, valor] = ['zona', hash];
  if (chave === 'medidas') { $('#boas-vindas').hidden = true; mostrarMedidas(true); }
  if (valor && (registros.has(valor) || zonaPorId[valor])) {
    $('#boas-vindas').hidden = true;
    if (chave === 'zona') mostrarZona(valor);
    else if (registros.has(valor)) {
      mostrarItem(valor);
      if (chave === 'sim') setTimeout(() => iniciarSim(valor), 1200);
    }
  }
};
