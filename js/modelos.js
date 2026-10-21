/*
 * Modelos 3D do simulador, em METROS (1 unidade = 1 m).
 * Cada construtor recebe (opcoes, item) e devolve { grupo, atualizar?, selecionar? }.
 *   atualizar(t, p): chamado a cada quadro. t = tempo em segundos;
 *                    p = progresso da simulação (0 a 1) ou null quando parado.
 *   selecionar(on):  chamado quando o card do item abre/fecha (ex.: abrir a porta do armário).
 * A base de cada modelo fica em y = 0 e a frente aponta para +z (para dentro da sala).
 * Os modelos das máquinas foram desenhados maiores; o campo `escala` em dados.js ajusta o tamanho.
 */
window.UVA_MODELOS = function (THREE) {
  'use strict';

  // Medidas reais do Uva Maker: 7,54 m x 5,29 m. Pé-direito estimado.
  // Pelas fotos: no canto, o armário 25-36 encostado na parede da janela; depois a coluna rosa e a janela.
  // A porta dupla de vidro fica perto do canto do quadro.
  const SALA = { X: 7.54 / 2, Z: 5.29 / 2, H: 3.0, E: 0.15 };
  const JANELA = { centro: -0.05, w: 2.31, h: 1.9, base: 0.8 };  // na parede menor (x = +X), virada para o corredor
  const PORTA = { centro: -2.5, w: 1.5, h: 2.1 };               // porta dupla na parede azul (z = +Z)

  // ---------- Utilitários ----------
  function material(cor, extra) {
    return new THREE.MeshStandardMaterial(Object.assign({ color: cor, roughness: 0.72, metalness: 0.04 }, extra || {}));
  }
  function sombra(m) { m.castShadow = true; m.receiveShadow = true; return m; }
  // Caixa apoiada pela base: (x, y, z) é o centro da face de baixo.
  function caixa(w, h, d, cor, x = 0, y = 0, z = 0, extra) {
    const m = sombra(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(cor, extra)));
    m.position.set(x, y + h / 2, z);
    return m;
  }
  // Cilindro e esfera centralizados na origem (posicione com `em`).
  function cilindro(rTopo, rBase, h, cor, seg = 24, extra) {
    return sombra(new THREE.Mesh(new THREE.CylinderGeometry(rTopo, rBase, h, seg), material(cor, extra)));
  }
  function esfera(r, cor, extra) {
    return sombra(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), material(cor, extra)));
  }
  function em(obj, x, y, z) { obj.position.set(x, y, z); return obj; }
  // Partes que acendem sozinhas (LEDs) não recebem o brilho de destaque do mouse.
  function semDestaque(m) { m.userData.semDestaque = true; return m; }
  const poli = (geo, cor) => sombra(new THREE.Mesh(geo, material(cor, { flatShading: true })));

  function textura(w, h, desenhar) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    desenhar(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  function texturaTexto(texto, { fundo = '#ffffff', cor = '#222222', w = 256, h = 128, px = 40 } = {}) {
    return textura(w, h, (c) => {
      c.fillStyle = fundo; c.fillRect(0, 0, w, h);
      c.fillStyle = cor;
      c.font = `bold ${px}px "Nunito", Arial, sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      const linhas = texto.split('\n');
      linhas.forEach((l, i) => c.fillText(l, w / 2, h / 2 + (i - (linhas.length - 1) / 2) * px * 1.15));
    });
  }
  function plano(w, h, tex, extra) {
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial(Object.assign({ map: tex, toneMapped: false }, extra || {})));
  }
  function quebrarTexto(c, texto, largura) {
    const linhas = [];
    let atual = '';
    texto.split(' ').forEach((p) => {
      const teste = atual ? `${atual} ${p}` : p;
      if (c.measureText(teste).width > largura && atual) { linhas.push(atual); atual = p; } else atual = teste;
    });
    if (atual) linhas.push(atual);
    return linhas;
  }

  // ---------- Texturas ----------
  let porDoSol = null;
  function texturaPorDoSol() {
    if (porDoSol) return porDoSol;
    porDoSol = textura(256, 160, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#3b2a6b'); g.addColorStop(0.45, '#f2683c'); g.addColorStop(0.58, '#ffb347');
      g.addColorStop(0.6, '#2a1f3d'); g.addColorStop(1, '#d9603b');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = '#1b1530';
      for (let i = 0; i < 12; i++) c.fillRect(i * 22, h * 0.56 - (i % 3) * 4, 15, h * 0.05 + (i % 3) * 4);
    });
    return porDoSol;
  }
  function texturaTablet() {
    return textura(256, 160, (c, w, h) => {
      c.fillStyle = '#120d1f'; c.fillRect(0, 0, w, h);
      ['#ff9f1c', '#ffd166', '#ef476f', '#ffbf69'].forEach((cor, i) => {
        for (let k = 0; k < 6; k++) {
          c.globalAlpha = 0.5; c.fillStyle = cor;
          c.beginPath(); c.arc((i * 61 + k * 43) % w, 30 + ((i * 17 + k * 29) % 90), 6 + (k % 3) * 5, 0, Math.PI * 2); c.fill();
        }
      });
      c.globalAlpha = 1; c.fillStyle = '#000';
      for (let i = 0; i < 9; i++) c.fillRect(10 + i * 28, h - 40 - (i % 3) * 8, 18, 60);
    });
  }
  const CORES_ODS = ['#e5243b', '#dda63a', '#4c9f38', '#c5192d', '#ff3a21', '#26bde2', '#fcc30b', '#a21942', '#fd6925',
    '#dd1367', '#fd9d24', '#bf8b2e', '#3f7e44', '#0a97d9', '#56c02b', '#00689d', '#19486a'];
  function texturaPoster(titulo) {
    return textura(512, 726, (c, w, h) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#0d2b6b'; c.font = 'bold 25px Arial, sans-serif'; c.textAlign = 'center';
      const linhas = quebrarTexto(c, titulo, w - 60);
      linhas.forEach((l, i) => c.fillText(l, w / 2, 48 + i * 29));
      let y = 48 + linhas.length * 29;
      c.fillStyle = '#8a93a6'; c.font = '13px Arial, sans-serif';
      c.fillText('Universidade Veiga de Almeida', w / 2, y);
      y += 16;
      c.fillStyle = '#0d2b6b'; c.fillRect(30, y, w - 60, 2);
      // coluna de texto
      ['Introdução', 'Objetivo', 'Metodologia', 'Resultados'].forEach((tit, s) => {
        const y0 = y + 20 + s * 140;
        c.fillStyle = '#0d47a1'; c.font = 'bold 15px Arial, sans-serif'; c.textAlign = 'left';
        c.fillText(tit, 30, y0 + 12);
        c.fillStyle = '#c4c9d4';
        for (let i = 0; i < 7; i++) c.fillRect(30, y0 + 24 + i * 14, 200 - ((i * 37 + s * 11) % 60), 6);
      });
      // coluna de imagens e ODS
      const fotos = ['#7a8fb5', '#c9a27e', '#6b9080', '#a26769', '#8e7dbe', '#d9a441'];
      fotos.forEach((cor, i) => { c.fillStyle = cor; c.fillRect(262 + (i % 2) * 112, y + 22 + Math.floor(i / 2) * 82, 104, 74); });
      CORES_ODS.forEach((cor, i) => { c.fillStyle = cor; c.fillRect(262 + (i % 6) * 36, y + 280 + Math.floor(i / 6) * 36, 32, 32); });
      // logos do rodapé
      c.textAlign = 'center'; c.font = 'bold 22px Arial, sans-serif';
      c.fillStyle = '#0d47a1'; c.fillText('UVA', w / 2 - 6, h - 28);
      c.fillStyle = '#39b54a'; c.beginPath(); c.arc(w / 2 + 30, h - 36, 8, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e5243b'; c.fillText('NIP', w - 60, h - 28);
      c.fillStyle = '#2a9d8f'; c.fillText('SICIMA', 70, h - 28);
    });
  }
  function texturaQuadro() {
    return textura(1024, 500, (c, w, h) => {
      c.fillStyle = '#fbfcfd'; c.fillRect(0, 0, w, h);
      const escrever = (t, x, y, cor, px = 26) => {
        c.fillStyle = cor; c.font = `${px}px "Segoe Print", "Comic Sans MS", cursive`; c.fillText(t, x, y);
      };
      c.textAlign = 'left';
      escrever('Dilatação Linear', 40, 60, '#1f3a93', 30);
      escrever('ΔL = L₀ · α · ΔT', 60, 110, '#127a5a');
      escrever('Dilatação Superficial', 40, 220, '#1f3a93', 30);
      escrever('ΔS = S₀ · β · ΔT', 60, 270, '#127a5a');
      escrever('Dilatação Volumétrica', 40, 380, '#1f3a93', 30);
      escrever('ΔV = V₀ · γ · ΔT', 60, 430, '#127a5a');
      c.strokeStyle = '#127a5a'; c.lineWidth = 3;
      c.beginPath(); c.ellipse(520, 200, 125, 55, 0, 0, Math.PI * 2); c.stroke();
      [[400, 180, 300, 70], [400, 215, 340, 230], [430, 240, 340, 360]].forEach(([x1, y1, x2, y2]) => {
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      });
      c.textAlign = 'center';
      escrever('DILATAÇÃO', 520, 192, '#127a5a', 30);
      escrever('TÉRMICA', 520, 228, '#127a5a', 30);
      c.strokeStyle = '#1f3a93'; c.lineWidth = 2;
      c.strokeRect(260, 90, 90, 24);
      c.strokeRect(300, 395, 50, 50); c.strokeRect(318, 380, 50, 50);
      // mural de ideias: vagas tracejadas onde entram os post-its dos visitantes (abaixo da tela de projeção)
      c.textAlign = 'left';
      escrever('Mural de ideias:', 680, 160, '#c0392b', 24);
      c.setLineDash([8, 6]); c.strokeStyle = '#9aa3ad'; c.lineWidth = 2;
      VAGAS_MURAL.forEach(([x, y]) => c.strokeRect(x - 38, y - 38, 76, 76));
      c.setLineDash([]);
      c.textAlign = 'center';
      VAGAS_MURAL.forEach(([x, y]) => { escrever('seu', x, y - 4, '#9aa3ad', 16); escrever('post-it', x, y + 16, '#9aa3ad', 16); });
      // contatos, como no quadro de verdade
      c.textAlign = 'left';
      c.save(); c.translate(600, 410); c.rotate(-0.25);
      escrever('Contatos:', 0, 0, '#c0392b', 26);
      c.fillStyle = '#c0392b'; c.fillRect(0, 8, 118, 2);
      c.restore();
      escrever('nitep@uva.br', 730, 405, '#1f3a93', 36);
      escrever('Insta: @nitep_uva', 650, 465, '#1f3a93', 34);
    });
  }
  // Centro (em pixels da textura do quadro, 1024 x 500) de cada vaga do mural de ideias.
  const VAGAS_MURAL = [[735, 215], [845, 215], [955, 215], [735, 305], [845, 305], [955, 305]];
  function texturaPostit(texto, cor) {
    return textura(128, 128, (c, w, h) => {
      c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(6, 8, w - 8, h - 8);
      c.fillStyle = cor; c.fillRect(2, 2, w - 8, h - 8);
      c.fillStyle = '#2b2d33'; c.font = 'bold 15px "Segoe Print", "Comic Sans MS", Arial, sans-serif'; c.textAlign = 'center';
      const linhas = quebrarTexto(c, texto, w - 24).slice(0, 6);
      linhas.forEach((l, i) => c.fillText(l, w / 2 - 3, h / 2 - 3 + (i - (linhas.length - 1) / 2) * 18));
    });
  }

  // ---------- Sala (piso, paredes com aberturas, colunas, janela, porta) ----------
  function parede(comp, cor, aberturas) {
    const p = new THREE.Group();
    const { H, E } = SALA;
    const seg = (xa, xb, ya, yb) => {
      if (xb - xa > 0.001 && yb - ya > 0.001) p.add(caixa(xb - xa, yb - ya, E, cor, (xa + xb) / 2, ya, -E / 2));
    };
    let x0 = -comp / 2;
    (aberturas || []).slice().sort((a, b) => a.x - b.x).forEach((a) => {
      const xa = a.x - a.w / 2, xb = a.x + a.w / 2;
      seg(x0, xa, 0, H);
      seg(xa, xb, 0, a.base);
      seg(xa, xb, a.base + a.h, H);
      x0 = xb;
    });
    seg(x0, comp / 2, 0, H);
    p.add(caixa(comp, 0.05, E + 0.02, '#cfc8b6', 0, H, -E / 2));
    p.userData.ehParede = true;
    return p;
  }
  function sala() {
    const { X, Z, H, E } = SALA;
    const g = new THREE.Group();
    // Piso vinílico xadrez azul, branco e cinza das fotos: placas de 30 x 30 cm (4 x 4 placas por textura)
    const piso = textura(128, 128, (c) => {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          c.fillStyle = (i + j) % 2 ? '#3f6d9e' : (i % 2 ? '#f1f2ee' : '#c7ccc9');
          c.fillRect(i * 32, j * 32, 32, 32);
        }
      }
      c.fillStyle = 'rgba(0,0,0,0.05)';
      for (let i = 0; i < 40; i++) c.fillRect((i * 97) % 128, (i * 57) % 128, 2, 2);
    });
    piso.wrapS = piso.wrapT = THREE.RepeatWrapping;
    piso.repeat.set((2 * X) / 1.2, (2 * Z) / 1.2);
    g.add(caixa(2 * X, 0.1, 2 * Z, '#ffffff', 0, -0.1, 0, { map: piso }));
    g.add(caixa(2 * X + 2 * E + 0.3, 0.5, 2 * Z + 2 * E + 0.3, '#14213d', 0, -0.6, 0));

    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const paredes = [];
    function nova(id, comp, cor, pos, rotY, normal, aberturas) {
      const grupo = parede(comp, cor, aberturas);
      grupo.position.copy(pos);
      grupo.rotation.y = rotY;
      g.add(grupo);
      const reg = { id, grupo, normal, ponto: pos.clone(), anexos: [], cortada: false };
      paredes.push(reg);
      return reg;
    }
    // Cada parede é montada no plano local com +z apontando para dentro da sala.
    // As paredes são todas creme; os nomes (cinza, azul...) ficaram do layout antigo e só identificam cada parede.
    const creme = '#ebe5d6';
    const cinza = nova('cinza', 2 * X + 2 * E, creme, V(0, 0, -Z), 0, V(0, 0, -1));
    const azul = nova('azul', 2 * X + 2 * E, creme, V(0, 0, Z), Math.PI, V(0, 0, 1),
      [{ x: -PORTA.centro, w: PORTA.w, base: 0, h: PORTA.h }]);
    const janela = nova('janela', 2 * Z, creme, V(X, 0, 0), -Math.PI / 2, V(1, 0, 0),
      [{ x: JANELA.centro, w: JANELA.w, base: JANELA.base, h: JANELA.h }]);
    nova('quadro', 2 * Z, creme, V(-X, 0, 0), Math.PI / 2, V(-1, 0, 0));

    // colunas pintadas: azul-turquesa (atrás da mesa de projetos), amarela (entre as prateleiras) e rosa (canto da janela)
    // (o app esconde uma coluna quando ela tapa a vista de um objeto aberto)
    const colunas = [
      em(cilindro(0.2, 0.2, H, '#5ec4dc', 32), -0.75, H / 2, 0.12),
      caixa(0.32, H, 0.25, '#f2c94c', -0.95, 0, 0.125),
      caixa(0.3, H, 0.3, '#e0568c', -1.45, 0, 0.15)   // entre o armário 25-36 e a janela
    ];
    cinza.grupo.add(colunas[0]);
    azul.grupo.add(colunas[1]);
    janela.grupo.add(colunas[2]);

    // Moldura, vidro e porta ficam em grupos próprios que somem quando a parede abaixa
    // (achatados junto com a parede, as peças se sobreporiam e piscariam).
    const { w: jw, h: jh, base: jb, centro: jc } = JANELA;
    const moldura = '#e6e4dc';
    const detalhesJanela = new THREE.Group();
    detalhesJanela.add(caixa(jw + 0.16, 0.08, E + 0.06, moldura, jc, jb - 0.08, -E / 2 + 0.03));
    detalhesJanela.add(caixa(jw + 0.16, 0.08, E + 0.06, moldura, jc, jb + jh, -E / 2 + 0.03));
    detalhesJanela.add(caixa(0.08, jh, E + 0.06, moldura, jc - jw / 2 - 0.04, jb, -E / 2 + 0.03));
    detalhesJanela.add(caixa(0.08, jh, E + 0.06, moldura, jc + jw / 2 + 0.04, jb, -E / 2 + 0.03));
    const vidro = caixa(jw, jh, 0.02, '#cfe8ff', jc, jb, -E / 2, { transparent: true, opacity: 0.22, roughness: 0.1 });
    vidro.castShadow = false;
    detalhesJanela.add(vidro);
    janela.grupo.add(detalhesJanela);
    janela.anexos.push(detalhesJanela);

    // Porta dupla de vidro com película: folha clara com "UVA MAKER HACKER SPACE" e folha azul com "UVA".
    // No grupo da parede azul, +z aponta para dentro da sala e -z para o corredor.
    const px = -PORTA.centro, fw = PORTA.w / 2 - 0.03, fh = 1.7;
    const pelicula = (clara) => textura(256, 512, (c, w, h) => {
      const grad = c.createLinearGradient(0, 0, 0, h);
      if (clara) { grad.addColorStop(0, '#e9f1ee'); grad.addColorStop(1, '#a9c9da'); } else { grad.addColorStop(0, '#4f8ccc'); grad.addColorStop(1, '#1f4f8c'); }
      c.fillStyle = grad; c.fillRect(0, 0, w, h);
      if (clara) {
        c.fillStyle = '#f2d43a'; c.beginPath(); c.arc(0, h * 0.62, 80, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#2f5a94'; c.font = 'bold 30px Arial, sans-serif';
        c.fillText('UVA MAKER', 30, 100); c.fillText('HACKER SPACE', 30, 136);
      } else {
        c.fillStyle = '#f4f1e8'; c.font = 'bold 64px Arial, sans-serif'; c.fillText('UVA', 40, 130);
        c.fillStyle = '#e8e45a'; c.beginPath(); c.arc(205, 108, 26, 0, Math.PI * 2); c.fill();
      }
    });
    const detalhesPorta = new THREE.Group();
    detalhesPorta.add(caixa(PORTA.w, 0.06, E + 0.02, '#e2e2dc', px, PORTA.h - 0.06, -E / 2));
    [-1, 1].forEach((s) => detalhesPorta.add(caixa(0.05, PORTA.h, E + 0.02, '#e2e2dc', px + s * (PORTA.w / 2 - 0.025), 0, -E / 2)));
    // folha da esquerda para quem olha do corredor = +x local. A película é uma só (dos dois lados):
    // do corredor se lê "UVA"; de dentro da sala ela aparece espelhada ("AVU"), como na foto.
    [[1, true], [-1, false]].forEach(([s, clara]) => {
      const cx = px + s * (fw / 2 + 0.005);
      const vidro = caixa(fw, PORTA.h - 0.08, 0.012, '#d9ecf5', cx, 0.02, -E / 2, { transparent: true, opacity: 0.25, roughness: 0.1 });
      vidro.castShadow = false;
      detalhesPorta.add(vidro);
      const filme = em(plano(fw, fh, pelicula(clara), { side: THREE.DoubleSide }), cx, 0.02 + fh / 2, -E / 2 - 0.008);
      filme.rotation.y = Math.PI;
      detalhesPorta.add(filme);
    });
    // letras UVA azuis acima da porta, do lado de dentro
    detalhesPorta.add(em(plano(0.5, 0.18, texturaTexto('UVA', { fundo: creme, cor: '#1f4fae', w: 256, h: 92, px: 78 })), px, PORTA.h + 0.25, 0.004));
    [-1, 1].forEach((lado) => {
      const z = lado * (E / 2 + 0.01) - E / 2;
      detalhesPorta.add(em(esfera(0.035, '#c98a2e'), px + 0.07, 1.0, z));            // puxador de madeira
      detalhesPorta.add(caixa(0.05, 0.08, 0.012, '#b9bec5', px - 0.06, 0.96, z, { metalness: 0.6 }));
    });
    // placa da sala, do lado de fora, à esquerda da porta
    const placa = em(plano(0.36, 0.3, textura(240, 200, (c, w, h) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#16326b'; c.fillRect(6, 6, w - 12, 86); c.fillRect(6, 104, w - 12, 90);
      c.fillStyle = '#ffffff'; c.font = 'bold 60px Arial, sans-serif'; c.fillText('A109', 24, 72);
      c.font = 'bold 22px Arial, sans-serif'; c.fillText('Laboratório de', 18, 140); c.fillText('Informática 10', 18, 172);
    })), px + PORTA.w / 2 + 0.3, 1.5, -E - 0.005);
    placa.rotation.y = Math.PI;
    detalhesPorta.add(placa);
    azul.grupo.add(detalhesPorta);
    azul.anexos.push(detalhesPorta);

    // Corredor do lado de fora (piso de ladrilhos sextavados com faixa de piso tátil), em frente à porta e à janela
    const sextavado = textura(128, 112, (c, w, h) => {
      c.fillStyle = '#c9c1b2'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#a99f8e'; c.lineWidth = 3;
      const r = 16, hx = r * Math.sqrt(3);
      for (let lin = -1; lin < 5; lin++) {
        for (let col = -1; col < 6; col++) {
          const cx = col * hx + (lin % 2 ? hx / 2 : 0), cy = lin * r * 1.5;
          c.beginPath();
          for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); }
          c.closePath(); c.stroke();
        }
      }
    });
    sextavado.wrapS = sextavado.wrapT = THREE.RepeatWrapping;
    const chaoCorredor = (w, d, x, z) => {
      const t = sextavado.clone(); t.needsUpdate = true; t.repeat.set(w / 0.6, d / 0.52);
      return caixa(w, 0.08, d, '#ffffff', x, -0.18, z, { map: t, roughness: 0.6 });
    };
    const corredor = new THREE.Group();
    corredor.add(chaoCorredor(2 * X + 2 * E + 2.6, 2.4, 1.3, Z + E + 1.35));
    [-1, 1].forEach((s) => corredor.add(caixa(2 * X + 2.6, 0.01, 0.04, '#b9bec5', 1.3, -0.1, Z + E + 1.6 + s * 0.05, { metalness: 0.6 })));
    g.add(corredor);
    azul.anexos.push(corredor);

    // lado de fora da janela: corredor e, mais adiante, as árvores do pátio
    const fora = new THREE.Group();
    fora.add(chaoCorredor(2.4, 2 * Z + 2 * E + 0.3, X + E + 0.15 + 1.2, 0));
    [-1, 1].forEach((s) => fora.add(caixa(0.04, 0.01, 2 * Z, '#b9bec5', X + E + 1.5 + s * 0.05, -0.1, 0, { metalness: 0.6 })));
    fora.add(em(cilindro(0.08, 0.12, 2.4, '#6b4f3a', 10), X + 2.4, 1.1, -0.6));
    [[0, 2.5, 0, 0.75], [0.4, 2.2, 0.4, 0.55], [-0.35, 2.3, -0.3, 0.6], [0.1, 2.9, -0.2, 0.5]]
      .forEach(([x, y, z, r]) => fora.add(em(esfera(r, '#86b36a', { roughness: 0.9 }), X + 2.4 + x, y, -0.6 + z)));
    g.add(fora);
    janela.anexos.push(fora);

    return { grupo: g, paredes, colunas };
  }

  // ---------- Mobiliário ----------
  function balcao(op) {
    const g = new THREE.Group(), w = op.w || 1.6, d = 0.6, h = 0.9, azul = '#1c2a7a';
    g.add(caixa(w - 0.04, h - 0.06, d - 0.04, '#eef0f2', 0, 0.02, 0));
    const zf = d / 2 - 0.01;
    g.add(caixa(w - 0.04, 0.05, 0.02, azul, 0, 0.02, zf));
    g.add(caixa(w - 0.04, 0.03, 0.02, azul, 0, h - 0.09, zf));
    for (let i = 0; i <= 3; i++) g.add(caixa(0.03, h - 0.1, 0.02, azul, -(w - 0.04) / 2 + i * (w - 0.04) / 3, 0.04, zf));
    g.add(caixa(w, 0.05, d, op.tampo || '#2560ad', 0, h - 0.05, 0, { roughness: 0.45 }));   // tampo azul (bancada Fercar das fotos)
    return { grupo: g };
  }
  // Porta azul de armário com furinhos de ventilação e o número pintado em branco (fotos de 2026-10).
  const portasAzuis = {};
  function texturaPortaArmario(numero) {
    const chave = numero == null ? '' : String(numero);
    if (!portasAzuis[chave]) {
      portasAzuis[chave] = textura(64, 100, (c, w, h) => {
        c.fillStyle = '#2153b3'; c.fillRect(0, 0, w, h);
        c.fillStyle = '#163b85';
        for (let x = 10; x < w - 8; x += 4) { c.fillRect(x, 5, 2, 2); c.fillRect(x, 9, 2, 2); c.fillRect(x, h - 10, 2, 2); c.fillRect(x, h - 6, 2, 2); }
        if (chave) { c.fillStyle = '#f2f4f7'; c.font = 'bold 22px Arial, sans-serif'; c.fillText(chave, 8, 34); }
      });
    }
    return portasAzuis[chave];
  }
  // Fechadura clara à esquerda da porta (a dobradiça fica à direita).
  function fechadura(x, y, z) {
    const f = new THREE.Group();
    f.add(caixa(0.045, 0.085, 0.012, '#e9e6dc', 0, 0, 0));
    f.add(caixa(0.018, 0.03, 0.012, '#b9bec5', 0, 0.03, 0.01, { metalness: 0.7, roughness: 0.3 }));
    return em(f, x, y, z);
  }
  // Armário de aço com 3 colunas x 4 linhas de portas azuis numeradas (de cima para baixo em cada coluna).
  // `portas: true` desenha as 12 portas fechadas; `portas: 'baixo'` só a linha de baixo
  // (as outras são objetos clicáveis à parte, portaArmario). `numero` é o número da primeira porta.
  const ARMARIO = { W: 0.9, H: 1.9, D: 0.45, linha: 0.45, base: 0.06 };
  function armario(op) {
    const g = new THREE.Group(), cor = '#dcdfda';
    const { W, H, D, linha, base } = ARMARIO;
    g.add(caixa(W, H, 0.02, cor, 0, 0, -D / 2 + 0.01));
    [-1, 1].forEach((s) => g.add(caixa(0.02, H, D, cor, s * (W / 2 - 0.01), 0, 0)));
    for (let r = 0; r <= 4; r++) g.add(caixa(W, 0.02, D, cor, 0, base - 0.02 + r * linha, 0));
    for (let c = 1; c <= 2; c++) g.add(caixa(0.02, H - 0.04, D, cor, -W / 2 + c * 0.3, 0.04, 0));
    g.add(caixa(W, 0.04, D - 0.04, '#9aa0a6'));
    g.add(caixa(W, H - (base + 4 * linha), D, cor, 0, base + 4 * linha, 0));
    const portas = op && op.portas;
    if (portas) {
      for (let r = 0; r < 4; r++) {
        if (portas === 'baixo' && r > 0) continue;
        for (let c = 0; c < 3; c++) {
          const numero = op.numero != null ? op.numero + c * 4 + (3 - r) : null;
          g.add(caixa(0.28, 0.43, 0.02, '#ffffff', -0.3 + c * 0.3, base + 0.005 + r * linha, D / 2 + 0.012, { map: texturaPortaArmario(numero) }));
          g.add(fechadura(-0.3 + c * 0.3 - 0.09, base + 0.22 + r * linha, D / 2 + 0.028));
        }
      }
    }
    return { grupo: g };
  }
  function gaveteiro() {
    const g = new THREE.Group(), verde = '#6cc417', cinza = '#d0d4d9';
    g.add(caixa(0.5, 0.56, 0.42, '#f1f3f5', 0, 0.06, 0));
    [[verde, -0.125, 0.44, 0.14], [cinza, 0.125, 0.44, 0.14], [cinza, -0.125, 0.1, 0.32], [verde, 0.125, 0.1, 0.32]]
      .forEach(([cor, x, y, h]) => {
        g.add(caixa(0.235, h, 0.01, cor, x, y, 0.215));
        g.add(em(esfera(0.012, '#9aa0a6'), x, y + h - 0.04, 0.225));
      });
    g.add(caixa(0.52, 0.02, 0.44, '#ffffff', 0, 0.62, 0));
    [[0.2, 0.17], [-0.2, 0.17], [0.2, -0.17], [-0.2, -0.17]].forEach(([x, z]) => g.add(em(esfera(0.03, '#333'), x, 0.03, z)));
    return { grupo: g };
  }
  function cadeira(op) {
    const g = new THREE.Group(), cor = op.cor || '#2a2c31';
    g.add(caixa(0.44, 0.05, 0.42, cor, 0, 0.44, 0.02));
    const encosto = caixa(0.44, 0.4, 0.04, cor);
    encosto.position.set(0, 0.7, -0.2);
    encosto.rotation.x = -0.12;
    g.add(encosto);
    [[0.18, 0.17], [-0.18, 0.17], [0.18, -0.17], [-0.18, -0.17]].forEach(([x, z]) => g.add(em(cilindro(0.012, 0.012, 0.44, '#111', 6), x, 0.22, z)));
    return { grupo: g };
  }
  // Mesa branca; tampo a 0,755 m.
  function mesaColaborativa() {
    const g = new THREE.Group();
    g.add(caixa(1.48, 0.035, 0.74, '#f2f3f5', 0, 0.72, 0));
    [[0.68, 0.33], [-0.68, 0.33], [0.68, -0.33], [-0.68, -0.33]].forEach(([x, z]) => g.add(caixa(0.04, 0.72, 0.04, '#c9ccd1', x, 0, z)));
    return { grupo: g };
  }
  // Módulo da bancada branca dos computadores; tampo a 0,74 m, fundo em -z.
  function mesaComputador(op) {
    const g = new THREE.Group(), w = op.w || 1.05, cinza = '#d3d6d9';
    g.add(caixa(w, 0.04, 0.6, '#f4f5f7', 0, 0.7, 0));
    g.add(caixa(w - 0.06, 0.32, 0.03, cinza, 0, 0.38, -0.27));
    [-1, 1].forEach((s) => g.add(caixa(0.04, 0.7, 0.55, cinza, s * (w / 2 - 0.02), 0, 0)));
    return { grupo: g };
  }
  function planta() {
    const g = new THREE.Group();
    g.add(em(cilindro(0.17, 0.13, 0.32, '#e76f51'), 0, 0.16, 0));
    g.add(em(cilindro(0.16, 0.16, 0.02, '#5c3d2e'), 0, 0.31, 0));
    [[0, 0.62, 0, 0.22], [0.13, 0.5, 0.05, 0.16], [-0.12, 0.54, -0.05, 0.17], [0.03, 0.82, -0.03, 0.14]]
      .forEach(([x, y, z, r]) => g.add(em(esfera(r, '#52b788'), x, y, z)));
    return { grupo: g };
  }
  function prateleiraParede(op) {
    const g = new THREE.Group();
    // prateleiras brancas com borda de madeira e mãos-francesas, como nas fotos
    const w = op.w || 2;
    (op.alturas || [1.4]).forEach((y) => {
      g.add(caixa(w, 0.03, 0.3, '#f1f0ec', 0, y, 0.15));
      g.add(caixa(w, 0.03, 0.006, '#c99a68', 0, y, 0.303));
      [-w / 2 + 0.15, w / 2 - 0.15].forEach((x) => {
        const mao = caixa(0.015, 0.2, 0.015, '#e3e3df', x, y - 0.17, 0.12);
        mao.rotation.x = -0.75;
        g.add(mao);
      });
    });
    return { grupo: g };
  }

  // ---------- Itens de parede ----------
  // Sobre os painéis de ferramentas (fotos de 2026-10): duas treliças de MDF, um painel voronoi,
  // a plaquinha azul "UVA" e as letras UVA de metal. A origem é o centro do topo dos painéis.
  function letreiroUVA() {
    const g = new THREE.Group(), mdf = '#c99a68';
    const recorte = (tex) => new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85 });
    const trelica = textura(256, 256, (c, w) => {
      c.strokeStyle = mdf; c.lineWidth = 8;
      c.strokeRect(6, 6, w - 12, w - 12);
      [44, 212].forEach((p) => {
        c.beginPath(); c.moveTo(p, 6); c.lineTo(p, w - 6); c.stroke();
        c.beginPath(); c.moveTo(6, p); c.lineTo(w - 6, p); c.stroke();
      });
      c.beginPath(); c.arc(128, 128, 42, 0, Math.PI * 2); c.stroke();
      [[128, 44, 128, 86], [128, 170, 128, 212], [44, 128, 86, 128], [170, 128, 212, 128]].forEach(([a, b, x, y]) => {
        c.beginPath(); c.moveTo(a, b); c.lineTo(x, y); c.stroke();
      });
    });
    [-0.72, -0.34].forEach((x) => g.add(em(new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), recorte(trelica)), x, 0.185, 0.008)));
    // painel voronoi: pontos fixos (sementes) e a linha onde duas células se encontram
    const voronoi = textura(256, 128, (c, w, h) => {
      let s = 7;
      const aleatorio = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const pts = Array.from({ length: 34 }, () => [aleatorio() * w, aleatorio() * h]);
      const img = c.createImageData(w, h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let d1 = 1e9, d2 = 1e9;
          pts.forEach(([px, py]) => {
            const d = Math.hypot(x - px, y - py);
            if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
          });
          const borda = x < 5 || y < 5 || x > w - 6 || y > h - 6;
          if (borda || d2 - d1 < 3.2) { const i = (y * w + x) * 4; img.data.set([201, 154, 104, 255], i); }
        }
      }
      c.putImageData(img, 0, 0);
    });
    g.add(em(new THREE.Mesh(new THREE.PlaneGeometry(0.39, 0.2), recorte(voronoi)), 0.06, 0.105, 0.008));
    // plaquinha azul em leque
    const leque = textura(256, 160, (c, w, h) => {
      c.fillStyle = '#1f3f8f';
      c.beginPath(); c.moveTo(20, 10); c.quadraticCurveTo(w / 2, -10, w - 20, 10); c.lineTo(w / 2 + 12, h - 6); c.lineTo(w / 2 - 12, h - 6); c.closePath(); c.fill();
      c.fillStyle = '#ffffff'; c.font = 'bold 44px Arial, sans-serif'; c.textAlign = 'center'; c.fillText('UVA', w / 2 - 12, 62);
      c.fillStyle = '#f5c400'; c.beginPath(); c.arc(w / 2 + 56, 47, 12, 0, Math.PI * 2); c.fill();
    });
    g.add(em(new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.106), recorte(leque)), -0.4, 0.03, 0.03));
    // letras UVA de metal escuro
    const letras = textura(512, 200, (c) => {
      c.font = '900 190px "Arial Black", Arial, sans-serif'; c.textBaseline = 'alphabetic';
      c.fillStyle = '#1f2226'; c.fillText('UVA', 14, 186);
      c.fillStyle = '#4a4f57'; c.fillText('UVA', 6, 180);
    });
    g.add(em(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.164), recorte(letras)), 0.48, 0.082, 0.012));
    return { grupo: g };
  }
  function poster(op) {
    const g = new THREE.Group();
    g.add(caixa(0.64, 0.9, 0.01, '#ffffff', 0, 0, 0.005));
    g.add(em(plano(0.62, 0.88, texturaPoster(op.titulo || 'UVA MAKER')), 0, 0.45, 0.012));
    return { grupo: g };
  }
  function quadroBranco(op) {
    const g = new THREE.Group(), w = op.w || 3, h = op.h || 1.45;
    g.add(caixa(w + 0.06, h + 0.06, 0.03, '#c0c4c8', 0, -0.03, 0.015));
    g.add(em(plano(w, h, texturaQuadro()), 0, h / 2, 0.032));
    g.add(caixa(w * 0.6, 0.03, 0.07, '#c0c4c8', 0, -0.05, 0.05));
    // post-its dos visitantes nas vagas do mural (os 6 mais recentes)
    const notas = new THREE.Group();
    g.add(notas);
    return {
      grupo: g,
      definirNotas(lista) {
        notas.children.slice().forEach((m) => { m.material.map.dispose(); m.material.dispose(); m.geometry.dispose(); notas.remove(m); });
        lista.slice(-VAGAS_MURAL.length).forEach((n, i) => {
          const [px, py] = VAGAS_MURAL[i];
          const m = em(plano(0.21, 0.21, texturaPostit(n.texto, n.cor)), -w / 2 + (px / 1024) * w, h - (py / 500) * h, 0.036);
          m.rotation.z = ((i * 7) % 5 - 2) * 0.04;
          notas.add(m);
        });
      }
    };
  }
  // Dois painéis perfurados cinza-escuros (0,92 x 0,56 m cada, medida estimada pelas fotos),
  // com as ferramentas na posição das fotos. Origem: centro da borda de baixo dos painéis.
  function painelPerfurado() {
    const g = new THREE.Group(), W = 0.92, H = 0.56, z = 0.03;
    const metal = { metalness: 0.65, roughness: 0.35 };
    const furos = textura(32, 32, (c, w, h) => {
      c.fillStyle = '#4b4f56'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#23262b'; c.beginPath(); c.arc(w / 2, h / 2, 5, 0, Math.PI * 2); c.fill();
    });
    furos.wrapS = furos.wrapT = THREE.RepeatWrapping;
    furos.repeat.set(W / 0.025, H / 0.025);
    [-(W / 2 + 0.01), W / 2 + 0.01].forEach((x) => g.add(caixa(W, H, 0.018, '#ffffff', x, 0, 0.009, { map: furos })));

    // tesouras
    [[-0.87, '#2b4f9e'], [-0.79, '#1e1f22']].forEach(([x, cor]) => {
      const t = new THREE.Group();
      [-1, 1].forEach((s) => {
        const lamina = caixa(0.01, 0.11, 0.004, '#c9ced4', 0, 0.04, 0, metal);
        lamina.rotation.z = s * 0.07;
        t.add(lamina);
        t.add(em(new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.005, 6, 16), material(cor)), s * 0.014, 0.025, 0));
      });
      g.add(em(t, x, 0.34, z));
    });
    // alicates
    [[-0.82, '#2f5fbf'], [-0.74, '#1e1f22'], [-0.66, '#c0392b']].forEach(([x, cor]) => {
      const a = new THREE.Group();
      a.add(caixa(0.02, 0.035, 0.008, '#8e949b', 0, 0.075, 0, metal));
      [-1, 1].forEach((s) => {
        const cabo = caixa(0.011, 0.08, 0.008, cor, s * 0.01, 0, 0);
        cabo.rotation.z = -s * 0.14;
        a.add(cabo);
      });
      g.add(em(a, x, 0.2, z));
    });
    // suportes laranja impressos (formato de tronco de pirâmide)
    [[0.37, 0.16], [0.02, 0.22]].forEach(([y, h]) => {
      const cone = poli(new THREE.CylinderGeometry(0.03, 0.055, h, 4, 1), '#f07a1a');
      cone.rotation.y = Math.PI / 4;
      cone.scale.z = 0.45;
      g.add(em(cone, -0.47, y + h / 2, z + 0.005));
    });
    // grampos C
    [[-0.31, '#c62828'], [-0.21, '#1e1f22'], [-0.11, '#c62828']].forEach(([x, cor]) => {
      const c = new THREE.Group();
      const arco = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 8, 20, Math.PI * 1.4), material(cor));
      arco.rotation.z = Math.PI * 0.3;
      c.add(arco);
      c.add(em(cilindro(0.004, 0.004, 0.08, '#b9bec5', 8, metal), 0.022, 0, 0));
      g.add(em(c, x, 0.46, z));
    });
    // rolo de arame
    [0.045, 0.038].forEach((r) => g.add(em(new THREE.Mesh(new THREE.TorusGeometry(r, 0.0035, 6, 32), material('#a7adb4', metal)), -0.13, 0.3, z)));
    // prateleirinha laranja com chaves amarelas
    g.add(caixa(0.11, 0.02, 0.05, '#f07a1a', -0.32, 0.15, 0.04));
    [-0.355, -0.33, -0.305, -0.28].forEach((x) => g.add(em(cilindro(0.007, 0.007, 0.05, '#f2c200', 8), x, 0.195, 0.04)));
    // grampos de barra (preto e laranja)
    [0.38, 0.21].forEach((y) => {
      g.add(caixa(0.26, 0.014, 0.01, '#1e1f22', 0.1, y, z));
      g.add(caixa(0.022, 0.06, 0.022, '#f07a1a', -0.02, y - 0.045, z));
      g.add(caixa(0.022, 0.06, 0.022, '#f07a1a', 0.12, y - 0.045, z));
      g.add(caixa(0.03, 0.07, 0.022, '#1e1f22', 0.155, y - 0.07, z));
    });
    // cartaz da Feira Maker e fotos
    const cartaz = textura(160, 230, (c, w, h) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#4d7cc0'; c.fillRect(8, 8, w - 16, 70);
      const grad = c.createLinearGradient(0, 80, 0, 200);
      grad.addColorStop(0, '#1b8f8a'); grad.addColorStop(1, '#2fb34a');
      c.fillStyle = grad; c.fillRect(8, 82, w - 16, 120);
      c.fillStyle = '#ffffff'; c.textAlign = 'center';
      c.font = 'bold 22px Arial, sans-serif'; c.fillText('FEIRA MAKER', w / 2, 112);
      c.font = '10px Arial, sans-serif'; c.fillText('VIRTUAL E PRESENCIAL', w / 2, 128);
      c.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 4; i++) c.fillRect(24, 140 + i * 9, w - 48, 3);
      c.fillStyle = '#ffffff'; c.font = 'bold 16px Arial, sans-serif'; c.fillText('UVA', w / 2 - 20, 194);
    });
    g.add(em(plano(0.12, 0.17, cartaz), 0.38, 0.33, 0.02));
    [[0.47, 0.44, '#7b5e57'], [0.49, 0.32, '#8a6f9e'], [0.47, 0.22, '#b5654a']].forEach(([x, y, cor]) => g.add(caixa(0.05, 0.065, 0.004, cor, x, y, 0.02)));
    // amostra vermelha impressa (grade de texturas)
    const grade = textura(64, 64, (c, w, h) => {
      c.fillStyle = '#c8232c'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#8f141b'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) c.fillRect(4 + i * 15, 4 + j * 15, 11, 11);
    });
    g.add(caixa(0.12, 0.1, 0.012, '#ffffff', 0.33, 0.06, 0.02, { map: grade }));
    // cabo enrolado, cordões azuis e escova
    g.add(em(new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.005, 6, 24), material('#151619')), 0.62, 0.45, z));
    for (let i = 0; i < 5; i++) g.add(caixa(0.012, 0.28 - i * 0.02, 0.004, i % 2 ? '#2a4fb3' : '#1d3a8a', 0.72 + i * 0.014, 0.25 + i * 0.02, 0.025));
    g.add(caixa(0.02, 0.1, 0.02, '#8e949b', 0.67, 0.04, z));
    g.add(caixa(0.07, 0.05, 0.03, '#1e1f22', 0.67, -0.01, z));
    return { grupo: g };
  }
  // `tipo: 'teto'`: aparelho piso-teto preso no teto, encostado na parede; senão, split de parede. Ambos brancos.
  function arCondicionado(op) {
    const g = new THREE.Group();
    if (op && op.tipo === 'teto') {
      g.add(caixa(1.25, 0.23, 0.65, '#f1f1ed', 0, 0, 0.42));
      g.add(caixa(1.05, 0.05, 0.02, '#9aa0a6', 0, 0.04, 0.75));
      return { grupo: g };
    }
    g.add(caixa(0.9, 0.3, 0.22, '#f1f1ed', 0, 0, 0.11));
    g.add(caixa(0.78, 0.04, 0.01, '#5a5f66', 0, 0.03, 0.222));
    return { grupo: g };
  }

  // ---------- Armário com portas que abrem (insumos) ----------
  function conteudoArmario(tipo) {
    const g = new THREE.Group();
    switch (tipo) {
      case 'papel':
        ['#ffffff', '#f1f3f5', '#ffe5ec', '#ffffff', '#e2eafc', '#ffffff', '#fff3bf', '#ffffff'].forEach((cor, i) => {
          const f = caixa(0.21, 0.012, 0.29, cor, 0, i * 0.013, 0);
          f.rotation.y = ((i % 3) - 1) * 0.06;
          g.add(f);
        });
        break;
      case 'papelao':
        g.add(caixa(0.22, 0.11, 0.28, '#c8a27a'));
        g.add(caixa(0.18, 0.09, 0.22, '#b88b5e', 0, 0.11, 0));
        {
          const tubo = em(cilindro(0.035, 0.035, 0.2, '#a97c50'), 0, 0.24, 0);
          tubo.rotation.z = Math.PI / 2;
          g.add(tubo);
        }
        break;
      case 'isopor':
        g.add(caixa(0.22, 0.12, 0.25, '#ffffff'));
        g.add(caixa(0.14, 0.09, 0.14, '#f8f9fa', -0.03, 0.12, 0));
        g.add(em(esfera(0.05, '#ffffff'), 0.06, 0.26, 0.05));
        break;
      case 'eva':
        ['#ff006e', '#3a86ff', '#ffbe0b', '#8338ec', '#06d6a0', '#fb5607'].forEach((cor, i) => {
          const f = caixa(0.22, 0.32, 0.012, cor, 0, 0, -0.14 + i * 0.05);
          f.rotation.x = -0.15;
          g.add(f);
        });
        break;
      case 'lego': {
        const cores = ['#e63946', '#ffd166', '#06d6a0', '#118ab2', '#ffffff', '#ff70a6'];
        for (let i = 0; i < 16; i++) {
          const cor = cores[i % cores.length];
          const b = new THREE.Group();
          b.add(caixa(0.064, 0.032, 0.032, cor));
          [-0.016, 0.016].forEach((x) => b.add(em(cilindro(0.008, 0.008, 0.01, cor, 8), x, 0.037, 0)));
          b.position.set(((i * 37) % 7) / 7 * 0.18 - 0.09, Math.floor(i / 6) * 0.034, ((i * 53) % 5) / 5 * 0.28 - 0.14);
          b.rotation.y = i * 0.8;
          g.add(b);
        }
        break;
      }
      case 'blocos': {
        g.add(caixa(0.08, 0.08, 0.08, '#ef476f', -0.06, 0, 0));
        g.add(caixa(0.08, 0.08, 0.08, '#ffd166', -0.06, 0.08, 0));
        g.add(em(cilindro(0.04, 0.04, 0.12, '#118ab2'), 0.05, 0.06, 0.05));
        g.add(em(poli(new THREE.ConeGeometry(0.05, 0.09, 3), '#06d6a0'), 0.05, 0.045, -0.08));
        break;
      }
      case 'sucata':
        g.add(caixa(0.2, 0.1, 0.24, '#8d939b'));
        g.add(caixa(0.14, 0.01, 0.1, '#1b7a3a', 0, 0.1, 0.03));
        g.add(caixa(0.03, 0.02, 0.03, '#222', 0.03, 0.11, 0.03));
        g.add(em(cilindro(0.03, 0.03, 0.05, '#c0c4c8'), -0.05, 0.14, -0.06));
        break;
      case 'ferramentas':
        g.add(caixa(0.24, 0.12, 0.15, '#d62828'));
        g.add(caixa(0.24, 0.02, 0.15, '#9d0208', 0, 0.12, 0));
        g.add(caixa(0.12, 0.04, 0.02, '#222', 0, 0.14, 0));
        break;
      case 'kit': {
        const k = kit().grupo;
        k.scale.setScalar(0.27);
        g.add(k);
        break;
      }
    }
    return g;
  }
  function portaArmario(op) {
    const g = new THREE.Group();
    const conteudo = conteudoArmario(op.conteudo);
    conteudo.position.set(0, 0.01, -0.22);
    g.add(conteudo);
    const pivo = new THREE.Group();
    pivo.position.set(0.14, 0, 0.012);   // dobradiça à direita
    pivo.add(caixa(0.28, 0.43, 0.02, '#ffffff', -0.14, 0.005, 0, { map: texturaPortaArmario(op.numero) }));
    pivo.add(fechadura(-0.23, 0.22, 0.016));
    g.add(pivo);
    let alvo = 0, angulo = 0;
    return {
      grupo: g,
      selecionar(ligado) { alvo = ligado ? 1.9 : 0; },
      atualizar() { angulo += (alvo - angulo) * 0.12; pivo.rotation.y = angulo; }
    };
  }

  // ---------- Coleta seletiva ----------
  function lixeiras() {
    const g = new THREE.Group();
    [['#1d70b8', 'PAPEL'], ['#d62828', 'PLÁSTICO'], ['#2a9d8f', 'VIDRO'], ['#e9b10b', 'METAL']].forEach(([cor, nome], i) => {
      const x = -0.825 + i * 0.55;
      g.add(caixa(0.48, 0.8, 0.48, cor, x, 0, 0));
      g.add(caixa(0.52, 0.06, 0.52, cor, x, 0.8, 0, { roughness: 0.4 }));
      g.add(em(plano(0.4, 0.2, texturaTexto(nome, { fundo: '#ffffff', cor, w: 256, h: 128, px: 44 })), x, 0.5, 0.245));
    });
    return { grupo: g };
  }

  // ---------- Ferramentas ----------
  // Ferramentas de parede: frente para +z, pendurados no painel. Medidas reais, em metros.
  function martelo() {
    const g = new THREE.Group(), metal = { metalness: 0.65, roughness: 0.35 };
    [-0.055, 0.055].forEach((x) => {
      g.add(caixa(0.024, 0.19, 0.024, '#1e1f22', x, 0, 0.035));              // cabo emborrachado
      g.add(caixa(0.014, 0.06, 0.014, '#b9bec5', x, 0.19, 0.035, metal));     // haste
      g.add(caixa(0.1, 0.026, 0.026, '#8e949b', x - 0.012, 0.24, 0.035, metal)); // cabeça
      const unha = caixa(0.035, 0.02, 0.022, '#8e949b', x + 0.05, 0.245, 0.035, metal);
      unha.rotation.z = -0.35;
      g.add(unha);
    });
    return { grupo: g };
  }
  function chaveFenda() {
    const g = new THREE.Group(), metal = { metalness: 0.65, roughness: 0.3 };
    g.add(caixa(0.3, 0.035, 0.05, '#f07a1a', 0, 0.09, 0.03));   // suporte laranja impresso
    ['#f2c200', '#f2c200', '#1e1f22', '#1e1f22', '#1e1f22', '#1e1f22', '#1e1f22'].forEach((cor, i) => {
      const x = -0.12 + i * 0.04;
      g.add(em(cilindro(0.011, 0.013, 0.09, cor, 10), x, 0.17, 0.035));
      g.add(em(cilindro(0.003, 0.003, 0.11, '#c3c8ce', 6, metal), x, 0.07, 0.035));
    });
    return { grupo: g };
  }

  // ---------- Fabricação digital ----------
  // Bambu Lab A1 (fotos de 2026-10), em tamanho real: mesa que anda para frente e para trás (eixo Y),
  // pórtico prateado que sobe (Z) com a cabeça que anda para os lados (X), bobina azul em cima e tela na frente.
  function impressora3d() {
    const g = new THREE.Group();
    const branco = '#eceef1', aluminio = { metalness: 0.6, roughness: 0.35 };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    // base, colunas e barra de cima
    g.add(caixa(0.3, 0.075, 0.38, branco, 0, 0, 0.02, { roughness: 0.5 }));
    [-0.175, 0.175].forEach((x) => g.add(caixa(0.045, 0.34, 0.045, '#b4b9c0', x, 0, -0.13, aluminio)));
    g.add(caixa(0.395, 0.04, 0.05, '#b4b9c0', 0, 0.335, -0.13, aluminio));
    g.add(caixa(0.06, 0.06, 0.07, '#6c727a', -0.175, 0, -0.1));               // motor do eixo Z
    // mesa com chapa texturizada (PEI)
    const mesa = new THREE.Group();
    mesa.position.y = 0.075;
    mesa.add(caixa(0.26, 0.012, 0.26, '#d9dce0'));
    mesa.add(caixa(0.256, 0.003, 0.256, '#6b5238', 0, 0.012, 0, { roughness: 0.9 }));
    g.add(mesa);
    const TOPO = 0.09, ALTURA_PECA = 0.1;
    const perfil = [[0, 0], [0.032, 0], [0.04, 0.018], [0.027, 0.054], [0.022, 0.076], [0.031, 0.1]].map(([x, y]) => new THREE.Vector2(x, y));
    const peca = sombra(new THREE.Mesh(new THREE.LatheGeometry(perfil, 28), material('#2563d9', { side: THREE.DoubleSide })));
    peca.position.y = TOPO - mesa.position.y;
    mesa.add(peca);
    // pórtico (sobe e desce) e cabeça de impressão (anda em X); a origem do pórtico é a ponta do bico
    const portico = new THREE.Group();
    portico.add(caixa(0.35, 0.03, 0.03, '#c9cdd2', 0, 0.06, -0.07, aluminio));
    portico.add(caixa(0.05, 0.05, 0.06, branco, 0.2, 0.05, -0.1));
    portico.add(caixa(0.04, 0.045, 0.05, '#7d838b', -0.19, 0.05, -0.1));
    const cabeca = new THREE.Group();
    cabeca.add(em(cilindro(0.009, 0.003, 0.014, '#c47a2c', 12, { metalness: 0.7, roughness: 0.3 }), 0, 0.007, 0));
    cabeca.add(caixa(0.03, 0.012, 0.03, '#3a3d42', 0, 0.012, 0));
    cabeca.add(caixa(0.06, 0.085, 0.075, branco, 0, 0.024, -0.0175));
    const ventoinha = em(cilindro(0.014, 0.014, 0.004, '#c8ccd1', 20), 0, 0.07, 0.021);
    ventoinha.rotation.x = Math.PI / 2;
    cabeca.add(ventoinha);
    portico.add(cabeca);
    g.add(portico);
    // tela de toque na frente, à direita
    const tela = textura(128, 96, (c, w, h) => {
      c.fillStyle = '#14171c'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#2fd1c5'; [[8, 8], [8, 40], [8, 72]].forEach(([x, y]) => c.fillRect(x, y, 16, 16));
      c.fillStyle = '#e8eaee'; c.font = 'bold 15px Arial, sans-serif';
      c.fillText('220 °C', 40, 22); c.fillText('65 °C', 40, 54); c.fillText('100 %', 40, 86);
    });
    const painel = new THREE.Group();
    painel.position.set(0.2, 0.06, 0.16);
    painel.rotation.x = -0.5;
    painel.add(caixa(0.085, 0.065, 0.012, branco));
    painel.add(em(plano(0.072, 0.052, tela), 0, 0.0325, 0.0065));
    g.add(painel);
    // suporte da bobina e bobina de filamento azul
    g.add(caixa(0.03, 0.13, 0.03, branco, 0.06, 0.375, -0.13));
    const eixo = em(cilindro(0.012, 0.012, 0.09, branco, 12), 0.105, 0.47, -0.13);
    eixo.rotation.z = Math.PI / 2;
    g.add(eixo);
    const bobina = new THREE.Group();
    [-0.033, 0.033].forEach((x) => bobina.add(em(cilindro(0.1, 0.1, 0.006, '#1b1c1f', 32), x, 0, 0)));
    bobina.add(cilindro(0.085, 0.085, 0.06, '#2563d9', 32));
    bobina.rotation.z = Math.PI / 2;
    g.add(em(bobina, 0.12, 0.47, -0.13));
    // suporte azul impresso na barra de cima
    g.add(caixa(0.025, 0.16, 0.025, '#2563d9', -0.11, 0.375, -0.13));
    [0.44, 0.52].forEach((y) => {
      const braco = em(cilindro(0.011, 0.011, 0.17, '#2563d9', 10), -0.11, y, -0.13);
      braco.rotation.z = Math.PI / 2;
      g.add(braco);
    });
    // tubo de filamento (branco) e cabo (preto): acompanham a cabeça
    const flexivel = (cor, r) => {
      const m = new THREE.Mesh(new THREE.BufferGeometry(), material(cor, { roughness: 0.5 }));
      m.userData.r = r;
      g.add(m);
      return m;
    };
    const tuboFilamento = flexivel('#eef3f8', 0.003), cabo = flexivel('#18191c', 0.0035);
    const curvar = (m, pts) => {
      m.geometry.dispose();
      m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, m.userData.r, 6, false);
    };
    let ultimo = '';
    return {
      grupo: g,
      atualizar(t, p) {
        const prog = p == null ? 1 : p;
        peca.scale.y = Math.max(0.02, prog);
        portico.position.y = TOPO + ALTURA_PECA * prog + 0.006;
        cabeca.position.x = p == null ? 0 : Math.sin(t * 9) * 0.035;
        mesa.position.z = p == null ? 0 : -Math.cos(t * 7) * 0.035;   // a peça vai junto com a mesa
        const cx = cabeca.position.x, cy = portico.position.y, chave = `${cx.toFixed(3)}|${cy.toFixed(3)}`;
        if (chave === ultimo) return;
        ultimo = chave;
        curvar(tuboFilamento, [V(0.075, 0.5, -0.115), V(0.05, 0.49, -0.04), V(cx + 0.01, cy + 0.2, -0.02), V(cx, cy + 0.11, -0.02)]);
        curvar(cabo, [V(-0.14, 0.355, -0.11), V(-0.12, 0.46, -0.05), V(cx - 0.02, cy + 0.24, -0.035), V(cx - 0.015, cy + 0.11, -0.035)]);
      }
    };
  }
  // Mini gravadora/cortadora a laser NEJE (fotos de 2026-10), em tamanho real: caixa de acrílico preto
  // com janela verde (filtra a luz do laser). A mesa anda para frente e para trás e o laser anda para os lados.
  function laser() {
    const g = new THREE.Group();
    const W = 0.16, H = 0.2, D = 0.155, preto = '#121316', acr = { roughness: 0.18, metalness: 0.1 };
    const zf = D / 2, xs = W / 2;
    g.add(caixa(W, 0.008, D, preto, 0, 0, 0, acr));
    g.add(caixa(W, 0.008, D, preto, 0, H - 0.008, 0, acr));
    g.add(caixa(W, H, 0.006, preto, 0, 0, -zf + 0.003, acr));
    // laterais vazadas
    [-1, 1].forEach((s) => {
      const x = s * (xs - 0.003);
      g.add(caixa(0.006, 0.05, D, preto, x, 0, 0, acr));
      g.add(caixa(0.006, 0.03, D, preto, x, H - 0.03, 0, acr));
      g.add(caixa(0.006, H, 0.025, preto, x, 0, zf - 0.0125, acr));
      g.add(caixa(0.006, H, 0.025, preto, x, 0, -zf + 0.0125, acr));
    });
    // frente: moldura preta, janela verde, etiqueta de aviso e a marca
    g.add(caixa(W, 0.045, 0.006, preto, 0, 0, zf - 0.003, acr));
    g.add(caixa(W, 0.018, 0.006, preto, 0, H - 0.018, zf - 0.003, acr));
    [-1, 1].forEach((s) => g.add(caixa(0.014, H, 0.006, preto, s * (xs - 0.007), 0, zf - 0.003, acr)));
    const janela = caixa(W - 0.028, H - 0.063, 0.003, '#6dff2e', 0, 0.045, zf + 0.002, { transparent: true, opacity: 0.42, roughness: 0.1 });
    janela.castShadow = false;
    g.add(janela);
    g.add(em(plano(0.07, 0.02, texturaTexto('NEJE', { fundo: preto, cor: '#e8e8e8', w: 256, h: 72, px: 56 })), 0, 0.022, zf + 0.001));
    g.add(em(plano(0.06, 0.014, texturaTexto('⚠ LASER', { fundo: '#f4d03f', cor: '#222222', w: 256, h: 60, px: 34 })), 0.02, H - 0.04, zf + 0.0045));
    g.add(em(cilindro(0.008, 0.008, 0.006, '#d62828', 16), 0.05, H + 0.003, -0.04));   // botão vermelho
    // mecânica: guia da mesa, placa verde e trilho do laser
    g.add(caixa(0.1, 0.012, 0.11, '#2b2d31', 0, 0.048, 0));
    g.add(caixa(0.11, 0.06, 0.004, '#2e7d32', 0, 0.12, -zf + 0.01));
    const trilho = em(cilindro(0.002, 0.002, 0.12, '#b0b5bb', 8, { metalness: 0.7 }), 0, 0.165, -0.015);
    trilho.rotation.z = Math.PI / 2;
    g.add(trilho);
    // mesa móvel com uma chapa de MDF
    const mesa = new THREE.Group();
    mesa.position.y = 0.06;
    mesa.add(caixa(0.095, 0.004, 0.095, '#c4562f'));
    mesa.add(caixa(0.08, 0.003, 0.08, '#d6b48a', 0, 0.004, 0));
    g.add(mesa);
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 === 0 ? 0.03 : 0.012;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0.0075, Math.sin(a) * r));
    }
    const caminho = new THREE.CurvePath();
    for (let i = 0; i < 10; i++) caminho.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
    const tubo = new THREE.TubeGeometry(caminho, 300, 0.0012, 6, false);
    mesa.add(new THREE.Mesh(tubo, material('#3b2412', { roughness: 1 })));
    const total = tubo.index.count;
    // módulo do laser
    const Y_LASER = 0.125, Y_MDF = 0.0675;
    const cabeca = new THREE.Group();
    cabeca.add(caixa(0.022, 0.04, 0.022, '#1d1e22'));
    cabeca.add(em(cilindro(0.005, 0.005, 0.006, '#9aa0a8', 10, { metalness: 0.7 }), 0, -0.003, 0));
    cabeca.position.y = Y_LASER;
    g.add(cabeca);
    const luz = new THREE.MeshBasicMaterial({ color: '#7f6bff', toneMapped: false });
    const feixe = semDestaque(new THREE.Mesh(new THREE.CylinderGeometry(0.0008, 0.0008, Y_LASER - Y_MDF, 6), luz));
    const ponto = semDestaque(new THREE.Mesh(new THREE.SphereGeometry(0.0025, 8, 6), luz));
    g.add(feixe, ponto);
    return {
      grupo: g,
      atualizar(t, p) {
        tubo.setDrawRange(0, p == null ? total : Math.floor(p * total / 6) * 6);
        feixe.visible = ponto.visible = p != null;
        if (p == null) { cabeca.position.x = 0.035; mesa.position.z = 0; return; }
        const pt = caminho.getPointAt(Math.min(p, 0.999));
        cabeca.position.x = pt.x;
        mesa.position.z = -pt.z;                      // a mesa traz o ponto da estrela para baixo do laser
        feixe.position.set(pt.x, (Y_LASER + Y_MDF) / 2, 0);
        ponto.position.set(pt.x, Y_MDF, 0);
      }
    };
  }
  // Impressora 3D maior, de estrutura aberta em perfis de alumínio pretos (ao lado dos armários 25-36).
  function impressoraGrande() {
    const g = new THREE.Group();
    const perfil = '#1b1c1f', metal = { metalness: 0.7, roughness: 0.3 };
    const W = 0.46, D = 0.46, H = 0.62;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => g.add(caixa(0.025, H, 0.025, perfil, sx * (W / 2 - 0.0125), 0, sz * (D / 2 - 0.0125))));
    [0, H - 0.025].forEach((y) => {
      [-1, 1].forEach((s) => {
        g.add(caixa(W, 0.025, 0.025, perfil, 0, y, s * (D / 2 - 0.0125)));
        g.add(caixa(0.025, 0.025, D, perfil, s * (W / 2 - 0.0125), y, 0));
      });
    });
    // fusos e guias verticais, motores, mesa de alumínio e pórtico com a cabeça
    [-1, 1].forEach((s) => {
      g.add(em(cilindro(0.004, 0.004, H - 0.05, '#c3c8ce', 8, metal), s * 0.17, H / 2, -0.17));
      g.add(caixa(0.042, 0.042, 0.042, '#2a2c30', s * 0.17, 0.025, -0.17));
    });
    g.add(caixa(0.3, 0.006, 0.3, '#b9bec5', 0, 0.2, 0, metal));
    g.add(caixa(0.4, 0.02, 0.02, perfil, 0, 0.42, -0.1));
    g.add(caixa(0.05, 0.06, 0.05, '#2a2c30', 0.05, 0.38, -0.07));
    // carretel de filamento azul no alto
    const carretel = new THREE.Group();
    [-0.025, 0.025].forEach((x) => carretel.add(em(cilindro(0.09, 0.09, 0.005, '#1b1c1f', 28), x, 0, 0)));
    carretel.add(cilindro(0.075, 0.075, 0.045, '#2563d9', 28));
    carretel.rotation.z = Math.PI / 2;
    g.add(em(carretel, -0.1, H + 0.09, 0));
    g.add(caixa(0.025, 0.06, 0.025, perfil, -0.1, H, 0));
    return { grupo: g };
  }
  // Mesa branca com tampo de feltro roxo coberta de peças impressas em 3D e cortadas a laser.
  // A distribuição das peças é sorteada sempre do mesmo jeito (semente fixa).
  function mesaVitrine() {
    const g = new THREE.Group();
    const W = 0.95, D = 0.55, H = 0.86;
    g.add(caixa(W, 0.45, D, '#eeeee9', 0, 0, 0));
    [-1, 1].forEach((s) => g.add(caixa(0.02, H, D, '#eeeee9', s * (W / 2 - 0.01), 0, 0)));
    g.add(caixa(W, 0.02, D, '#eeeee9', 0, 0.45, 0));
    [-0.23, 0.23].forEach((x) => g.add(caixa(0.44, 0.42, 0.01, '#f4f4f0', x, 0.02, D / 2 + 0.005)));
    g.add(caixa(W, 0.03, D + 0.04, '#f4f4f0', 0, H - 0.03, 0.02));
    g.add(caixa(W - 0.04, 0.004, D - 0.02, '#4b3d8f', 0, H, 0.02));
    // prateleira de baixo: chapas de MDF, filamentos e caixas
    g.add(caixa(0.6, 0.06, 0.4, '#c99a68', -0.12, 0.47, 0));
    [0.22, 0.34].forEach((x) => {
      const rolo = em(cilindro(0.09, 0.09, 0.06, '#e8c84a', 20), x, 0.56, 0.02);
      rolo.rotation.x = Math.PI / 2;
      g.add(rolo);
    });
    g.add(caixa(0.22, 0.12, 0.16, '#dfe7ee', 0.0, 0.53, 0.1, { transparent: true, opacity: 0.7 }));
    // peças em cima do tampo
    let s = 11;
    const sorte = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const cores = ['#2563d9', '#2563d9', '#d62828', '#f1f1ee', '#e8dcb5', '#2563d9'];
    const topo = H + 0.004;
    for (let i = 0; i < 26; i++) {
      const x = -0.42 + sorte() * 0.5, z = -0.2 + sorte() * 0.42, cor = cores[i % cores.length];
      const t = 0.03 + sorte() * 0.06;
      const forma = i % 3;
      const peca = forma === 0 ? caixa(t * 1.4, t, t, cor, x, topo, z)
        : forma === 1 ? em(cilindro(t / 2, t / 1.6, t * 1.2, cor, 12), x, topo + t * 0.6, z)
          : em(esfera(t / 2, cor), x, topo + t / 2, z);
      peca.rotation.y = sorte() * Math.PI;
      g.add(peca);
    }
    // peças maiores ao fundo: busto claro e torre preta rendada
    g.add(em(cilindro(0.05, 0.07, 0.2, '#e8dcb5', 14), -0.18, topo + 0.1, -0.16));
    g.add(em(esfera(0.055, '#e8dcb5'), -0.18, topo + 0.24, -0.16));
    g.add(caixa(0.09, 0.22, 0.09, '#1e1f22', -0.34, topo, -0.18));
    // à direita, peças de MDF cortadas a laser (chaveiros, porta-celular, placas "UVA")
    for (let i = 0; i < 9; i++) {
      const placa = caixa(0.05 + sorte() * 0.06, 0.08 + sorte() * 0.12, 0.006, i % 3 ? '#c99a68' : '#b98a58', 0.18 + (i % 3) * 0.08, topo, -0.18 + Math.floor(i / 3) * 0.15);
      placa.rotation.x = -0.25 - sorte() * 0.3;
      placa.rotation.y = (sorte() - 0.5) * 0.6;
      g.add(placa);
    }
    return { grupo: g };
  }
  // Armário baixo branco de duas portas (embaixo das prateleiras e na ponta das mesas do centro).
  function armarioBaixo(op) {
    const g = new THREE.Group(), w = op.w || 1.0, h = op.h || 0.8, d = op.d || 0.5;
    g.add(caixa(w, h - 0.03, d, '#e9e9e4', 0, 0, 0));
    g.add(caixa(w + 0.02, 0.03, d + 0.02, '#f4f4f0', 0, h - 0.03, 0));
    [-1, 1].forEach((s) => {
      g.add(caixa(w / 2 - 0.02, h - 0.1, 0.012, '#f1f1ec', s * w / 4, 0.04, d / 2 + 0.006));
      g.add(caixa(0.015, 0.12, 0.02, '#9aa0a6', s * 0.04, h - 0.3, d / 2 + 0.02, { metalness: 0.6 }));
    });
    return { grupo: g };
  }
  // Painelzinho preto com chaveiros impressos em 3D e cortados a laser (ao lado da porta).
  function painelChaveiros() {
    const g = new THREE.Group();
    g.add(caixa(0.3, 0.36, 0.015, '#1e1f22', 0, 0, 0.008));
    [[-0.08, 0.26, '#2563d9', 0.035], [0.05, 0.24, '#c99a68', 0.03], [-0.04, 0.12, '#2563d9', 0.045], [0.09, 0.1, '#c99a68', 0.03], [-0.1, 0.06, '#f2c200', 0.025]]
      .forEach(([x, y, cor, r]) => {
        const ch = em(cilindro(r, r, 0.006, cor, 18), x, y, 0.03);
        ch.rotation.x = Math.PI / 2;
        g.add(ch);
      });
    return { grupo: g };
  }
  // Projetor pendurado no teto por uma haste (a origem é o topo da haste, no teto).
  function projetor() {
    const g = new THREE.Group();
    g.add(em(cilindro(0.012, 0.012, 0.25, '#2a2c30', 8), 0, -0.125, 0));
    g.add(caixa(0.3, 0.1, 0.25, '#1e1f22', 0, -0.35, 0));
    const lente = em(cilindro(0.03, 0.03, 0.02, '#3d4a5c', 16), 0.06, -0.3, 0.13);
    lente.rotation.x = Math.PI / 2;
    g.add(lente);
    return { grupo: g };
  }
  // Tela de projeção enrolável presa no alto da parede (a origem é o topo do estojo).
  function telaProjecao(op) {
    const g = new THREE.Group(), w = op.w || 1.5, h = op.h || 0.9;
    g.add(caixa(w + 0.1, 0.07, 0.08, '#2a2c30', 0, -0.07, 0.06));
    g.add(caixa(w, h, 0.004, '#fbfbf8', 0, -0.07 - h, 0.06));
    g.add(caixa(w, 0.025, 0.02, '#2a2c30', 0, -0.07 - h - 0.02, 0.06));
    return { grupo: g };
  }
  // Coração de fios vermelhos esticados entre preguinhos (arte em fios, low-poly), na parede.
  function coracaoFios() {
    const g = new THREE.Group();
    const p = (x, y) => new THREE.Vector3(x, y, 0.02);
    const pts = [p(0, 0), p(-0.3, 0.33), p(-0.25, 0.55), p(-0.13, 0.6), p(0, 0.5), p(0.13, 0.6), p(0.25, 0.55), p(0.3, 0.33),
      p(-0.14, 0.3), p(0.14, 0.3), p(0, 0.25)];
    const ligacoes = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [1, 8], [8, 0], [8, 10], [10, 0], [10, 9], [9, 0], [9, 7],
      [2, 8], [3, 8], [4, 8], [4, 10], [4, 9], [5, 9], [6, 9]];
    const fio = material('#c62828');
    ligacoes.forEach(([a, b]) => {
      const dir = new THREE.Vector3().subVectors(pts[b], pts[a]), len = dir.length();
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, len, 5), fio);
      m.position.copy(pts[a]).addScaledVector(dir, 0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      g.add(m);
    });
    pts.forEach((q) => g.add(em(esfera(0.008, '#b9bec5', { metalness: 0.7 }), q.x, q.y, 0.022)));
    return { grupo: g };
  }
  class Espiral extends THREE.Curve {
    getPoint(t, alvo = new THREE.Vector3()) {
      const a = t * Math.PI * 6, r = 0.16 - t * 0.06;
      return alvo.set(Math.cos(a) * r, 0.03 + t * 0.4, Math.sin(a) * r);
    }
  }
  function caneta3d() {
    const g = new THREE.Group();
    g.add(caixa(0.6, 0.02, 0.6, '#3a86ff'));
    const curva = new Espiral();
    const tubo = new THREE.TubeGeometry(curva, 200, 0.022, 8, false);
    g.add(sombra(new THREE.Mesh(tubo, material('#ff006e'))));
    const total = tubo.index.count;
    const caneta = new THREE.Group();
    caneta.add(em(cilindro(0.045, 0.035, 0.5, '#4cc9f0', 16), 0, 0.3, 0));
    caneta.add(em(cilindro(0.035, 0.006, 0.06, '#adb5bd', 12), 0, 0.03, 0));
    g.add(caneta);
    return {
      grupo: g,
      atualizar(t, p) {
        tubo.setDrawRange(0, p == null ? total : Math.floor(p * total / 6) * 6);
        if (p == null) {
          caneta.position.set(-0.05, 0.065, 0.42);
          caneta.rotation.set(0, 0, -Math.PI / 2);
          return;
        }
        caneta.position.copy(curva.getPoint(p));
        caneta.rotation.set(0, 0, -0.5);
      }
    };
  }
  // Uma estação: monitor, gabinete, teclado e mouse (ocupa 0,80 x 0,50 m).
  function computador() {
    const g = new THREE.Group();
    g.add(caixa(0.18, 0.01, 0.14, '#c9ccd1', -0.1, 0, -0.12));
    g.add(caixa(0.04, 0.2, 0.03, '#c9ccd1', -0.1, 0.01, -0.15));
    g.add(caixa(0.5, 0.33, 0.03, '#c9ccd1', -0.1, 0.17, -0.13));
    g.add(em(plano(0.46, 0.29, texturaPorDoSol()), -0.1, 0.335, -0.114));
    g.add(caixa(0.18, 0.42, 0.4, '#16181c', 0.3, 0, -0.05));
    g.add(caixa(0.4, 0.015, 0.13, '#f1f3f5', -0.1, 0, 0.15));
    g.add(caixa(0.05, 0.015, 0.08, '#f1f3f5', 0.18, 0, 0.15));
    return { grupo: g };
  }

  // ---------- Eletrônica, robótica e tecnologias ----------
  function leds(cores, r = 0.045) {
    return cores.map((cor) => semDestaque(esfera(r, cor, { emissive: cor, emissiveIntensity: 0.05 })));
  }
  function acender(led, ligado) { led.material.emissiveIntensity = ligado ? 2.2 : 0.05; }
  function arduino() {
    const g = new THREE.Group();
    g.add(caixa(0.9, 0.05, 0.65, '#00878f'));
    g.add(caixa(0.35, 0.06, 0.12, '#1b1b1b', 0.05, 0.05, 0));
    g.add(caixa(0.18, 0.12, 0.16, '#ced4da', -0.42, 0.05, 0.16, { metalness: 0.6, roughness: 0.3 }));
    g.add(caixa(0.16, 0.12, 0.12, '#1b1b1b', -0.42, 0.05, -0.16));
    g.add(caixa(0.6, 0.08, 0.06, '#1b1b1b', 0.1, 0.05, 0.27));
    g.add(caixa(0.5, 0.08, 0.06, '#1b1b1b', 0.15, 0.05, -0.27));
    const [verde, amarelo, vermelho] = leds(['#38b000', '#ffbe0b', '#ef233c']);
    em(verde, 0.36, 0.1, -0.12); em(amarelo, 0.36, 0.1, 0); em(vermelho, 0.36, 0.1, 0.12);
    g.add(verde, amarelo, vermelho);
    const cabo = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.5, 0.11, 0.16), new THREE.Vector3(-0.8, 0.05, 0.3), new THREE.Vector3(-0.9, 0.0, 0.6)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cabo, 20, 0.02, 6), material('#495057')));
    return {
      grupo: g,
      atualizar(t, p) {
        if (p == null) {
          acender(verde, Math.floor(t * 1.5) % 2 === 0); acender(amarelo, false); acender(vermelho, false);
          return;
        }
        const fase = Math.min(2, Math.floor(p * 3));
        acender(verde, fase === 0); acender(amarelo, fase === 1); acender(vermelho, fase === 2);
      }
    };
  }
  function protoboard() {
    const g = new THREE.Group();
    g.add(caixa(1.1, 0.08, 0.5, '#f8f9fa'));
    g.add(caixa(1.0, 0.005, 0.02, '#e63946', 0, 0.08, 0.2));
    g.add(caixa(1.0, 0.005, 0.02, '#118ab2', 0, 0.08, -0.2));
    [['#e63946', -0.35, 0.05], ['#06d6a0', -0.1, 0.25], ['#ffd166', 0.15, 0.12], ['#118ab2', 0.35, 0.3]].forEach(([cor, x, alt]) => {
      const c = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 0.08, -0.15), new THREE.Vector3(x + 0.08, 0.08 + alt, 0), new THREE.Vector3(x + 0.15, 0.08, 0.15)]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 16, 0.012, 5), material(cor)));
    });
    const [led] = leds(['#ff006e'], 0.05);
    g.add(em(led, -0.42, 0.16, 0.05));
    acender(led, true);
    g.add(caixa(0.22, 0.14, 0.38, '#ffbe0b', 0.75, 0, 0));
    g.add(caixa(0.22, 0.02, 0.06, '#1b1b1b', 0.75, 0.14, 0.12));
    return { grupo: g };
  }
  function kit() {
    const g = new THREE.Group();
    g.add(caixa(0.85, 0.06, 0.6, '#ced4da'));
    const tampa = caixa(0.85, 0.16, 0.6, '#ffffff', 0, 0.06, 0, { transparent: true, opacity: 0.35 });
    tampa.castShadow = false;
    g.add(tampa);
    ['#e63946', '#ffd166', '#06d6a0', '#118ab2', '#8338ec', '#ff70a6'].forEach((cor, i) => {
      const x = -0.27 + (i % 3) * 0.27, z = i < 3 ? -0.14 : 0.14;
      for (let k = 0; k < 3; k++) g.add(em(cilindro(0.025, 0.025, 0.1, cor, 8), x - 0.06 + k * 0.06, 0.12, z));
    });
    return { grupo: g };
  }
  function drone(op) {
    const g = new THREE.Group(), cor = op.cor || '#f1f3f5', detalhe = op.detalhe || '#e63946';
    const corpo = new THREE.Group();
    corpo.add(caixa(0.1, 0.045, 0.15, cor, 0, 0.03, 0));
    corpo.add(em(esfera(0.022, '#222'), 0, 0.045, 0.08));
    corpo.add(caixa(0.03, 0.02, 0.02, detalhe, 0, 0.05, -0.075));
    [-0.04, 0.04].forEach((z) => corpo.add(caixa(0.12, 0.008, 0.01, '#333', 0, 0, z)));
    [[-0.04, -0.04], [0.04, -0.04], [-0.04, 0.04], [0.04, 0.04]].forEach(([x, z]) => corpo.add(caixa(0.008, 0.03, 0.008, '#333', x, 0, z)));
    const helices = [];
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
      const braco = caixa(0.15, 0.012, 0.018, cor);
      braco.position.set(sx * 0.055, 0.055, sz * 0.055);
      braco.rotation.y = -Math.atan2(sz, sx);
      corpo.add(braco);
      corpo.add(em(cilindro(0.014, 0.014, 0.025, '#333', 10), sx * 0.11, 0.065, sz * 0.11));
      const h = new THREE.Group();
      h.position.set(sx * 0.11, 0.08, sz * 0.11);
      h.add(caixa(0.13, 0.003, 0.014, '#2b2d42'));
      h.add(caixa(0.014, 0.003, 0.13, '#2b2d42'));
      corpo.add(h);
      helices.push(h);
    });
    g.add(corpo);
    return {
      grupo: g,
      atualizar(t, p) {
        const voando = p != null;
        helices.forEach((h, i) => { h.rotation.y = voando ? t * 40 * (i % 2 ? 1 : -1) : 0.4 * i; });
        corpo.position.y = voando ? Math.sin(p * Math.PI) * 0.3 + Math.sin(t * 3) * 0.01 : 0;
        corpo.rotation.z = voando ? Math.sin(t * 2) * 0.05 : 0;
      }
    };
  }
  function oculosVR() {
    const g = new THREE.Group();
    g.add(caixa(0.19, 0.1, 0.11, '#f2c500', 0, 0.01, 0));
    g.add(caixa(0.17, 0.08, 0.01, '#1b1b1b', 0, 0.02, 0.056));
    const alca = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 8, 24, Math.PI), material('#1b1b1b'));
    alca.rotation.x = -Math.PI / 2;
    g.add(em(alca, 0, 0.06, -0.05));
    [-0.2, -0.27].forEach((x, i) => {
      g.add(em(cilindro(0.018, 0.022, 0.12, i ? '#1b1b1b' : '#f2c500', 12), x, 0.06, 0.03));
      const anel = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 8, 20), material('#f2c500'));
      anel.rotation.x = Math.PI / 2;
      g.add(em(anel, x, 0.13, 0.03));
    });
    return { grupo: g };
  }
  function cameraFoto() {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      const perna = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.11, 0),
        new THREE.Vector3(Math.cos(a) * 0.05, 0.06, Math.sin(a) * 0.05),
        new THREE.Vector3(Math.cos(a) * 0.09, 0.005, Math.sin(a) * 0.09)
      ]);
      g.add(sombra(new THREE.Mesh(new THREE.TubeGeometry(perna, 12, 0.009, 6), material('#c0392b'))));
    }
    g.add(caixa(0.12, 0.08, 0.06, '#1b1b1b', 0, 0.11, 0));
    g.add(caixa(0.03, 0.07, 0.07, '#111', 0.05, 0.11, 0));
    g.add(caixa(0.04, 0.03, 0.04, '#1b1b1b', -0.01, 0.19, 0));
    const lente = em(cilindro(0.03, 0.03, 0.06, '#222'), -0.01, 0.15, 0.06);
    lente.rotation.x = Math.PI / 2;
    g.add(lente);
    return { grupo: g };
  }
  function tablet() {
    const g = new THREE.Group();
    g.add(caixa(0.12, 0.01, 0.1, '#222', 0, 0, -0.04));
    const tela = new THREE.Group();
    tela.add(caixa(0.3, 0.19, 0.012, '#111'));
    tela.add(em(plano(0.28, 0.17, texturaTablet()), 0, 0.095, 0.007));
    tela.rotation.x = -0.35;
    tela.position.set(0, 0.01, 0);
    g.add(tela);
    return { grupo: g };
  }

  // ---------- Colagem ----------
  function colaBranca() {
    const g = new THREE.Group();
    g.add(em(cilindro(0.12, 0.14, 0.45, '#ffffff'), 0, 0.225, 0));
    g.add(em(cilindro(0.06, 0.1, 0.1, '#f77f00'), 0, 0.5, 0));
    g.add(em(cilindro(0.01, 0.04, 0.1, '#f77f00', 12), 0, 0.6, 0));
    g.add(em(plano(0.2, 0.16, texturaTexto('COLA', { fundo: '#2a9d8f', cor: '#ffffff', w: 128, h: 96, px: 34 })), 0, 0.24, 0.135));
    g.add(em(cilindro(0.08, 0.09, 0.28, '#ffffff'), 0.3, 0.14, 0.1));
    g.add(em(cilindro(0.05, 0.07, 0.07, '#f77f00'), 0.3, 0.31, 0.1));
    return { grupo: g };
  }
  function colaQuente() {
    const g = new THREE.Group();
    g.add(caixa(0.3, 0.04, 0.25, '#495057'));
    const pistola = new THREE.Group();
    pistola.add(caixa(0.5, 0.18, 0.14, '#ffbe0b'));
    const cabo = caixa(0.13, 0.32, 0.12, '#ffbe0b', -0.12, -0.3, 0);
    cabo.rotation.z = 0.25;
    pistola.add(cabo);
    const bico = em(cilindro(0.015, 0.045, 0.14, '#6c757d', 12), 0.31, 0.09, 0);
    bico.rotation.z = -Math.PI / 2;
    pistola.add(bico);
    g.add(em(pistola, 0.05, 0.36, 0));
    [0, 0.06, 0.12].forEach((z) => {
      const b = em(cilindro(0.025, 0.025, 0.4, '#f1faee', 10, { transparent: true, opacity: 0.85 }), 0.1, 0.025, 0.3 + z);
      b.rotation.z = Math.PI / 2;
      g.add(b);
    });
    return { grupo: g };
  }
  function blocoPostit() {
    const g = new THREE.Group();
    [['#ffd166', -0.07, 0.03], ['#ff8fab', 0.03, 0.025], ['#90be6d', 0.1, 0.02]].forEach(([cor, x, h]) => {
      const b = caixa(0.076, h, 0.076, cor, x, 0, 0);
      b.rotation.y = x * 3;
      g.add(b);
    });
    g.add(caixa(0.21, 0.002, 0.15, '#ffffff', 0.02, 0, 0.12));
    [['#1d3557', -0.05], ['#e63946', 0.0]].forEach(([cor, z]) => {
      const caneta = em(cilindro(0.006, 0.006, 0.14, cor, 8), 0.02, 0.008, 0.1 + z);
      caneta.rotation.z = Math.PI / 2;
      g.add(caneta);
    });
    return { grupo: g };
  }


  // ---------- Vitrine: objetos decorativos nas prateleiras ----------
  function vaso() {
    const g = new THREE.Group();
    const perfil = [[0, 0], [0.06, 0], [0.075, 0.08], [0.06, 0.2], [0.04, 0.26]].map(([x, y]) => new THREE.Vector2(x, y));
    const v = new THREE.Mesh(new THREE.LatheGeometry(perfil, 20), material('#dfe9f2', { transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    g.add(v);
    g.add(em(cilindro(0.068, 0.06, 0.06, '#c9a227'), 0, 0.03, 0));
    return { grupo: g };
  }
  function luminaria() {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const perna = caixa(0.008, 0.22, 0.008, '#111');
      const a = i * Math.PI * 2 / 3;
      perna.position.set(Math.cos(a) * 0.04, 0.1, Math.sin(a) * 0.04);
      perna.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3);
      g.add(perna);
    }
    const cupula = em(cilindro(0.02, 0.07, 0.09, '#111', 20), 0, 0.25, 0.02);
    cupula.rotation.x = 0.6;
    g.add(cupula);
    return { grupo: g };
  }
  function telaTripe() {
    const g = new THREE.Group();
    [-0.05, 0.05].forEach((x) => { const p = caixa(0.008, 0.14, 0.008, '#111', x, 0, 0); p.rotation.z = x * 3; g.add(p); });
    g.add(caixa(0.22, 0.16, 0.01, '#3a3f47', 0, 0.13, 0));
    return { grupo: g };
  }

  function generico(op) {
    const g = new THREE.Group();
    const [w, h, d] = op.tamanho || [0.3, 0.3, 0.3];
    g.add(caixa(w, h, d, op.cor || '#bdb2ff'));
    return { grupo: g };
  }

  return {
    SALA, JANELA, PORTA,
    sala, balcao, armario, gaveteiro, cadeira, mesaColaborativa, mesaComputador, planta, prateleiraParede,
    letreiroUVA, poster, quadroBranco, painelPerfurado, arCondicionado,
    portaArmario, lixeiras, martelo, chaveFenda,
    impressora3d, impressoraGrande, laser, caneta3d, computador, mesaVitrine, coracaoFios,
    armarioBaixo, painelChaveiros, projetor, telaProjecao,
    arduino, protoboard, kit, drone, oculosVR, cameraFoto, tablet,
    colaBranca, colaQuente, blocoPostit,
    vaso, luminaria, telaTripe,
    generico
  };
};
