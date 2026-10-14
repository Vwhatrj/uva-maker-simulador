# Simulador UVA Maker Hacker Space

Simulador 3D (Three.js 0.160 via CDN, sem build) do laboratório maker da Universidade Veiga de Almeida.
Feito por Guilherme para os orientadores (entre eles o Thiago, professor e chefe do laboratório). Textos e código em português.
Guilherme está começando em programação e GitHub: explicar passos em linguagem simples.

## Publicação
- Só pelo GitHub: repositório público `Vwhatrj/uva-maker-simulador`, site em https://vwhatrj.github.io/uva-maker-simulador/ (GitHub Pages, branch `main`, raiz).
- O claude.ai não é mais usado (decisão do usuário em 2026-10-14).
- Ao mudar arquivos, aumentar o `?v=N` dos `<link>`/`<script>` em `index.html` para o navegador não usar versão antiga em cache.
- Fluxo: commit no repositório; o usuário dá **Push origin** no GitHub Desktop (git embutido em `%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`).

## Medidas reais
- Sala: 7,54 x 5,29 m (informado pelo Thiago). Abertura/janela de 2,31 x 1,90 m na parede menor.
- **Estimativas a confirmar:** pé-direito 2,80 m, peitoril 0,80 m, posição e medida da porta, conteúdo de cada porta do armário.
- As imagens de referência mostram um layout antigo do laboratório.
- Fotos reais de 2026-10 (enviadas no chat, não estão no repositório): impressora **Bambu Lab A1**, cortadora **NEJE** e os painéis de ferramentas. Esses modelos 3D foram refeitos em tamanho real (sem `escala`).
- **Estimativas pelas fotos:** painéis de ferramentas com 0,92 x 0,56 m cada, base a 1,25 m do chão; tampo das bancadas azul.

## Como o código está organizado
- `js/dados.js`: `zonas`, `catalogo` (tipos: modelo, `base` [w, d] em metros, `apoio`, `superficie`, card) e `objetos` (instâncias: `id`, `tipo` ou `modelo`, `pos` no mundo, `parede`, `rot`, `sobre`, `preso`, `fixo`). Campos da instância sobrescrevem os do catálogo.
- `js/modelos.js`: modelos 3D feitos em código; frente para +z, base em y = 0, centrados na origem.
- `js/app.js`: cena, paredes em corte, cards, trilha, simulações, cotas, hora do dia e modo "Editar layout".
- Modo de edição: arrasta objetos com `base`; objetos pequenos (`apoio: 'ambos'`) podem ir para o tampo de móveis com `superficie`; colisão por retângulos girados (SAT) contra irmãos no mesmo apoio e colunas; o que está `sobre` um móvel é filho dele na cena.
- Layout do usuário: `localStorage` `uva-maker-layout-v2` e arquivo `.json` (`{tipo: "uva-maker-layout", versao: 2, objetos: [{id, tipo, x, y, z, rot, sobre}], removidos: [ids]}`). Para tornar um layout o padrão, gravar as posições do arquivo em `objetos` de `js/dados.js`.
- `index.html` usa scripts clássicos (não módulos) para funcionar abrindo o arquivo direto no navegador.

## Pendências
- Autoria e objetivo reais dos projetos da vitrine (hoje "Autoria a confirmar").
