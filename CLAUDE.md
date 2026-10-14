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
- **Estimativas a confirmar:** pé-direito 3,00 m (pelas fotos), peitoril 0,80 m, porta dupla de 1,50 m, conteúdo de cada porta do armário.
- Layout refeito com as fotos reais de 2026-10 (enviadas no chat, não estão no repositório). Os nomes das paredes no código vêm do layout antigo; hoje todas são creme:
  - `cinza` (z = -Z): gaveteiros no canto, armário 37-48, bancada branca da eletrônica, banner ODS, coração de fios, coluna turquesa, mesa de projetos, painéis de ferramentas com letras UVA, bancada azul (Fercar) com Bambu Lab A1 e impressora de perfis pretos, armário 25-36 e coluna rosa no canto.
  - `janela` (x = +X): coluna rosa, janela para o corredor e bancada com computadores e a cortadora NEJE; ar-condicionado de teto.
  - `azul` (z = +Z): porta dupla de vidro com película "UVA MAKER HACKER SPACE" (sala A109), split, prateleiras brancas da vitrine, coluna amarela e computadores.
  - `quadro` (x = -X): quadro branco.
- Piso vinílico xadrez azul/branco/cinza; cadeiras plásticas coloridas; corredor de ladrilhos sextavados do lado de fora.
- Os armários têm nomes de pessoas nas portas: no site só aparecem os números.
- **Estimativas pelas fotos:** painéis de ferramentas com 0,92 x 0,56 m cada, base a 1,25 m do chão.

## Como o código está organizado
- `js/dados.js`: `zonas`, `catalogo` (tipos: modelo, `base` [w, d] em metros, `apoio`, `superficie`, card) e `objetos` (instâncias: `id`, `tipo` ou `modelo`, `pos` no mundo, `parede`, `rot`, `sobre`, `preso`, `fixo`). Campos da instância sobrescrevem os do catálogo.
- `js/modelos.js`: modelos 3D feitos em código; frente para +z, base em y = 0, centrados na origem.
- `js/app.js`: cena, paredes em corte, cards, trilha, simulações, cotas, hora do dia e modo "Editar layout".
- Modo de edição: arrasta objetos com `base`; objetos pequenos (`apoio: 'ambos'`) podem ir para o tampo de móveis com `superficie`; colisão por retângulos girados (SAT) contra irmãos no mesmo apoio e colunas; o que está `sobre` um móvel é filho dele na cena.
- Layout do usuário: `localStorage` `uva-maker-layout-v2` e arquivo `.json` (`{tipo: "uva-maker-layout", versao: 2, objetos: [{id, tipo, x, y, z, rot, sobre}], removidos: [ids]}`). Para tornar um layout o padrão, gravar as posições do arquivo em `objetos` de `js/dados.js`.
- `index.html` usa scripts clássicos (não módulos) para funcionar abrindo o arquivo direto no navegador.

## Pendências
- Autoria e objetivo reais dos projetos da vitrine (hoje "Autoria a confirmar"). As fotos mostram outras peças nas prateleiras (tendas amarelas, esculturas de madeira, peças de acrílico).
- Onde ficam de verdade os insumos (papel, E.V.A., Lego...): hoje estão nas portas do armário 25-36.
- O banner "UVA Maker e os ODS" não aparece nas fotos; está provisoriamente na parede do quadro.
