# Simulador UVA Maker Hacker Space

Simulador 3D (Three.js 0.160 via CDN, sem build) do laboratório maker da Universidade Veiga de Almeida.
Feito por Guilherme para os orientadores (entre eles o Thiago, professor e chefe do laboratório). Textos e código em português.

## Onde está publicado
- **Site público (sem login):** GitHub Pages do repositório `Vwhatrj/uva-maker-simulador` (https://vwhatrj.github.io/uva-maker-simulador/), que mostra o layout de `js/dados.js`.
- **Artifact no claude.ai:** https://claude.ai/artifact/9hMQPQEQnuXfDYN4Kcxv5g. Republicar sempre nesse mesmo link, passando `index.html` como página e `css/estilo.css`, `js/dados.js`, `js/modelos.js`, `js/app.js` em `files`. Capabilities: `db` (regra `layout`: leitura `view`, escrita `admin`), `user` e `downloads`.
- **Modo "Editar layout":** qualquer pessoa pode arrastar os móveis. Para o dono/editores do artifact o layout é o oficial, salvo no db do artifact (documento `layout/atual`, campo `posicoes`: `{id: {x, z, rot}}`). Para todos os outros, fica no navegador da pessoa (localStorage `uva-maker-layout`) e pode ser salvo/aberto como arquivo `.json` (`{tipo: "uva-maker-layout", versao: 1, posicoes}`).
- Para tornar um layout o padrão do site público: ler o db do artifact ou o `.json` enviado pelo usuário e gravar as posições em `js/dados.js`.

## Medidas reais
- Sala: 7,54 x 5,29 m (informado pelo Thiago). Abertura/janela de 2,31 x 1,90 m na parede menor.
- **Estimativas a confirmar:** pé-direito 2,80 m, peitoril da janela 0,80 m, posição e medida da porta, conteúdo de cada porta do armário.
- As imagens de referência mostram um layout antigo do laboratório; o layout atual pode mudar.

## Como o código está organizado
- `js/dados.js`: todo o conteúdo (zonas, itens clicáveis, móveis), em metros. A sala vai de x -3,77 a 3,77 e de z -2,645 a 2,645.
- `js/modelos.js`: modelos 3D feitos em código; frente para +z, base em y = 0.
- `js/app.js`: cena, câmera, paredes em corte, cards, trilha, simulações, cotas, modo de edição.
- `index.html` não tem `<!doctype>`/`<html>`/`<body>` porque o publicador do artifact acrescenta esse esqueleto.
- Scripts clássicos (não módulos) para funcionar abrindo o arquivo direto no navegador.

## Pendências
- Autoria e objetivo reais dos projetos da vitrine (hoje "Autoria a confirmar").
- Mover objetos individualmente entre balcões (hoje só os móveis se movem, levando o que está em cima).
