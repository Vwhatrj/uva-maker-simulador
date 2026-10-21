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
  - `cinza` (z = -Z): gaveteiros no canto, armário 37-48, bancada branca da eletrônica, banner ODS, coração de fios, selos e certificados (Selo ODS 2023 em acrílico e um painel pequeno com os Selos ODS Edebê e 2025, Parceiro da Inclusão e Menção Honrosa RRD Rio), coluna turquesa, mesa de projetos, painéis de ferramentas com letras UVA e bancada azul (Fercar) com Bambu Lab A1, cortadora NEJE e impressora de perfis pretos.
  - `janela` (x = +X): armário 25-36 no canto (costas na parede, de frente para a bancada azul), coluna rosa, janela para o corredor e bancada com computadores; ar-condicionado de teto.
  - `azul` (z = +Z): porta dupla de vidro com película "UVA MAKER HACKER SPACE" (sala A109; de dentro aparece espelhada) e letras UVA acima, split, prateleiras brancas da vitrine, armário baixo branco, coluna amarela, 3 computadores e, no canto da janela, a bancada dos materiais.
  - `quadro` (x = -X): quadro branco, tela de projeção (projetor no teto) e painel de chaveiros perto da porta.
  - Centro: mesas brancas com cadeiras coloridas e um balcão branco com portas na ponta perto da janela. Coluna turquesa é redonda.
- Piso vinílico xadrez azul/branco/cinza; cadeiras plásticas coloridas; corredor de ladrilhos sextavados do lado de fora.
- Os armários têm nomes de pessoas nas portas: no site só aparecem os números.
- **Estimativas pelas fotos:** painéis de ferramentas com 0,92 x 0,56 m cada, base a 1,25 m do chão.

## Como o código está organizado
- `js/dados.js`: `zonas`, `catalogo` (tipos: modelo, `base` [w, d] em metros, `apoio`, `superficie`, card) e `objetos` (instâncias: `id`, `tipo` ou `modelo`, `pos` no mundo, `parede`, `rot`, `sobre`, `preso`, `fixo`). Campos da instância sobrescrevem os do catálogo.
- `js/modelos.js`: modelos 3D feitos em código; frente para +z, base em y = 0, centrados na origem.
- `js/app.js`: cena, paredes em corte, cards, trilha, simulações, cotas, hora do dia e modo "Editar layout".
- No celular em pé, a câmera enquadra o objeto na parte de cima da tela (acima do card); durante uma simulação o card encolhe (`minimizarPainel`) e "Ver texto" o traz de volta.
- Ao abrir o card de um objeto, `ocultarObstrucoes` (app.js) esconde os objetos e colunas que tapam a vista; tudo volta ao fechar. Portas do armário (`preso`) nunca somem.
- Modo de edição: arrasta objetos com `base`; objetos pequenos (`apoio: 'ambos'`) podem ir para o tampo de móveis com `superficie`; colisão por retângulos girados (SAT) contra irmãos no mesmo apoio e colunas; o que está `sobre` um móvel é filho dele na cena.
- Layout do usuário: `localStorage` `uva-maker-layout-v2` e arquivo `.json` (`{tipo: "uva-maker-layout", versao: 2, objetos: [{id, tipo, x, y, z, rot, sobre}], removidos: [ids]}`). Para tornar um layout o padrão, gravar as posições do arquivo em `objetos` de `js/dados.js`. **Sempre que mudar posições em `objetos`, trocar `layoutPadrao` em `js/dados.js`** (data do dia): layouts salvos com outra data são descartados com aviso, senão misturam posições antigas e novas.
- `img/nitep.png` (logo completo, na tela de boas-vindas) e `img/nitep-simbolo.png` (só o símbolo, no topo): logo do NITeP enviado pelo usuário em 2026-10-21.
- `index.html` usa scripts clássicos (não módulos) para funcionar abrindo o arquivo direto no navegador.

## Contato e mural de ideias
- Contatos do NITeP (do quadro do laboratório): nitep@uva.br e Instagram @nitep_uva, em `contato` de `js/dados.js`. Botão "✉️ Contato" no rodapé e no card do quadro branco; cada assunto (usar o espaço, visita técnica, projeto) abre um e-mail já preenchido. Regra do laboratório: o pedido ao NITeP é feito por um(a) professor(a); "Sou aluno(a)" abre o e-mail para o professor do aluno (destinatário em branco), pedindo que ele encaminhe.
- Mural de ideias no quadro branco: o post-it fica salvo só no navegador do visitante (`localStorage` `uva-maker-postits`, até 6) e aparece nas vagas do quadro 3D. A equipe só recebe se o visitante clicar em "Enviar para a equipe" (e-mail). Um mural compartilhado entre visitantes precisaria de um banco de dados (ex.: Firebase/Supabase) e moderação.

## Relatório anônimo (Formulário Google)
- `registro` em `js/dados.js`: com `url` e `campos` preenchidos, cada post-it colado e cada visita (uma por sessão do navegador) são enviados por `fetch` 'no-cors' a um Formulário Google; as respostas vão para a planilha ligada ao formulário. Com `url` vazia fica desligado e o mural volta a oferecer o envio por e-mail.
- Perguntas do formulário: Tipo ('visita' ou 'post-it'), Texto, Dispositivo ('celular' ou 'computador'), Página. Os `entry.N` saem do "link preenchido" do formulário. O formulário NÃO pode exigir login nem coletar e-mail, senão o envio falha.
- Ligado em 2026-10-21 com o formulário "Mural de Simulador do UVA Maker" (conta do NITeP). Só envia no site publicado; em localhost ou arquivo local fica desligado (não suja a planilha com testes).
- Sem dados pessoais; aviso de privacidade aparece na boas-vindas quando o registro está ligado. Limite de um post-it enviado a cada 20 s por navegador.

## Pendências
- Vitrine: as 6 peças de exemplo (lhama, raposa etc.) foram retiradas em 2026-10-15 porque não tinham autoria real. Só adicionar peças novas com autor e objetivo confirmados (campo `projeto` em `js/dados.js`). As fotos mostram maquetes de arquitetura, tendas amarelas e esculturas de madeira nas prateleiras.
- Onde ficam de verdade os insumos (papel, E.V.A., Lego...): hoje estão nas portas do armário 25-36.
- O banner "UVA Maker e os ODS" não aparece nas fotos; está provisoriamente na parede do quadro.
