# Graph Report - uva-maker-simulador  (2026-10-14)

## Corpus Check
- 5 files · ~16,802 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .css 1)

## Summary
- 153 nodes · 421 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- atualizarBarraEdicao
- app.js
- modelos.js
- selecionar
- em
- Simulador UVA Maker Hacker Space
- mostrarItem
- cilindro
- textura
- Simulador UVA Maker Hacker Space
- protoboard
- aplicarEstado
- removerSelecionado

## God Nodes (most connected - your core abstractions)
1. `caixa()` - 39 edges
2. `em()` - 32 edges
3. `cilindro()` - 22 edges
4. `material()` - 12 edges
5. `textura()` - 11 edges
6. `selecionar()` - 10 edges
7. `esfera()` - 10 edges
8. `cabe()` - 9 edges
9. `atualizarBarraEdicao()` - 9 edges
10. `avaliar()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Como o código está organizado` --references--> `superficie()`  [INFERRED]
  CLAUDE.md → js/app.js
- `Como o código está organizado` --references--> `parede()`  [INFERRED]
  CLAUDE.md → js/modelos.js

## Import Cycles
- None detected.

## Communities (14 total, 1 thin omitted)

### Community 0 - "atualizarBarraEdicao"
Cohesion: 0.28
Nodes (13): atualizarBarraEdicao(), avaliar(), cabe(), cantos(), dentroDe(), ehDescendente(), girar(), lugarLivre() (+5 more)

### Community 1 - "app.js"
Cohesion: 0.21
Nodes (11): animar(), atualizarParedes(), atualizarUISim(), definirHora(), iniciarArrasto(), itemEm(), mirar(), movelEm() (+3 more)

### Community 2 - "modelos.js"
Cohesion: 0.18
Nodes (21): arCondicionado(), armario(), balcao(), blocoPostit(), cadeira(), caixa(), colaQuente(), generico() (+13 more)

### Community 3 - "selecionar"
Cohesion: 0.31
Nodes (11): abrirArquivo(), adicionarDoCatalogo(), destacarGrupo(), estadoAtual(), nomeArquivo(), sairEdicao(), salvarArquivo(), salvarLayout() (+3 more)

### Community 4 - "em"
Cohesion: 0.29
Nodes (10): chaveFenda(), conteudoArmario(), drone(), em(), esfera(), gaveteiro(), kit(), lhama() (+2 more)

### Community 5 - "Simulador UVA Maker Hacker Space"
Cohesion: 0.25
Nodes (7): A confirmar, Abrir no próprio computador, Como adicionar um tipo de objeto novo ao catálogo, Continuar em outro computador, Estrutura, O que dá para fazer, Simulador UVA Maker Hacker Space

### Community 6 - "mostrarItem"
Cohesion: 0.13
Nodes (22): abrirPainel(), atualizarProgresso(), avisar(), corDaZona(), definirSobMouse(), destacar(), entrarEdicao(), fecharPainel() (+14 more)

### Community 7 - "cilindro"
Cohesion: 0.38
Nodes (9): cameraFoto(), caneta3d(), cilindro(), Espiral, impressora3d(), material(), oculosVR(), sombra() (+1 more)

### Community 8 - "textura"
Cohesion: 0.17
Nodes (16): colaBranca(), computador(), lixeiras(), logoUVA(), painelPerfurado(), plano(), quadroBranco(), relogio() (+8 more)

### Community 9 - "Simulador UVA Maker Hacker Space"
Cohesion: 0.25
Nodes (7): Como o código está organizado, Medidas reais, Pendências, Publicação, Simulador UVA Maker Hacker Space, parede(), nova()

### Community 10 - "protoboard"
Cohesion: 0.29
Nodes (7): acender(), arduino(), laser(), leds(), potesLuz(), protoboard(), semDestaque()

### Community 11 - "aplicarEstado"
Cohesion: 0.47
Nodes (6): anexar(), aplicarEstado(), construirPadrao(), criarObjeto(), definicao(), voltarAoOriginal()

### Community 12 - "removerSelecionado"
Cohesion: 1.00
Nodes (3): descendentes(), removerObjeto(), removerSelecionado()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Como o código está organizado` connect `Simulador UVA Maker Hacker Space` to `atualizarBarraEdicao`?**
  _High betweenness centrality (0.475) - this node is a cross-community bridge._
- **Should `mostrarItem` be split into smaller, more focused modules?**
  _Cohesion score 0.1341991341991342 - nodes in this community are weakly interconnected._
- **Why does `superficie()` connect `atualizarBarraEdicao` to `Simulador UVA Maker Hacker Space`, `app.js`?**
  _High betweenness centrality (0.445) - this node is a cross-community bridge._
- **Why does `parede()` connect `Simulador UVA Maker Hacker Space` to `modelos.js`?**
  _High betweenness centrality (0.445) - this node is a cross-community bridge._