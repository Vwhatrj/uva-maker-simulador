# Graph Report - uva-maker-simulador  (2026-10-14)

## Corpus Check
- 4 files · ~12,470 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 99 nodes · 264 edges · 10 communities (8 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- modelos.js
- sala
- mostrarItem
- em
- textura
- passoTrilha
- visaoGeral
- Espiral

## God Nodes (most connected - your core abstractions)
1. `caixa()` - 39 edges
2. `em()` - 31 edges
3. `cilindro()` - 21 edges
4. `material()` - 12 edges
5. `textura()` - 11 edges
6. `esfera()` - 9 edges
7. `plano()` - 9 edges
8. `sombra()` - 7 edges
9. `sala()` - 7 edges
10. `conteudoArmario()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Como adicionar um item novo` --references--> `parede()`  [INFERRED]
  README.md → js/modelos.js

## Import Cycles
- None detected.

## Communities (10 total, 2 thin omitted)

### Community 1 - "app.js"
Cohesion: 0.25
Nodes (6): animar(), atualizarParedes(), atualizarUISim(), itemEm(), terminarSim(), visivel()

### Community 2 - "modelos.js"
Cohesion: 0.17
Nodes (23): acender(), arCondicionado(), arduino(), armario(), balcao(), bancadaComputadores(), cadeira(), caixa() (+15 more)

### Community 5 - "sala"
Cohesion: 0.22
Nodes (8): parede(), sala(), nova(), Como abrir, Como adicionar um item novo, Estrutura, Próximos passos, Simulador Uva Maker Hacker Space

### Community 6 - "mostrarItem"
Cohesion: 0.38
Nodes (7): abrirPainel(), definirSobMouse(), destacar(), iniciarTrilha(), mostrarItem(), mostrarZona(), soltarAberto()

### Community 7 - "em"
Cohesion: 0.20
Nodes (22): blocoPostit(), cameraFoto(), caneta3d(), chaveFenda(), cilindro(), colaQuente(), conteudoArmario(), drone() (+14 more)

### Community 8 - "textura"
Cohesion: 0.21
Nodes (14): colaBranca(), computadores(), lixeiras(), logoUVA(), plano(), quadroBranco(), relogio(), desenhar() (+6 more)

### Community 10 - "passoTrilha"
Cohesion: 0.40
Nodes (5): atualizarProgresso(), avisar(), fecharPainel(), marcarVisitado(), passoTrilha()

### Community 11 - "visaoGeral"
Cohesion: 0.50
Nodes (4): visaoGeral(), visaoInicial(), voarAte(), voarPara()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `caixa()` connect `modelos.js` to `textura`, `sala`, `em`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `parede()` connect `sala` to `modelos.js`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._