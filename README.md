# Simulador Uva Maker Hacker Space

Laboratório maker em 3D, interativo e didático. Funciona direto no navegador.

## Como abrir

- **Versão publicada** (para orientadores, celular e qualquer computador): https://claude.ai/artifact/9hMQPQEQnuXfDYN4Kcxv5g. O layout arrastado no modo "Editar layout" fica salvo nesse link.
- **Local:** dê dois cliques em `index.html` (precisa de internet, porque a biblioteca 3D Three.js vem de um CDN). Aqui o layout editado fica salvo só no navegador.

## Continuar em outro computador

1. No GitHub Desktop: **File → Clone repository** e escolha `uva-maker-simulador`.
2. Abra a pasta no VS Code com o Claude Code e peça o que quiser mudar.
3. Ao terminar, faça commit e **Push** no GitHub Desktop.

Para republicar no mesmo link, peça ao Claude para "publicar de novo no link https://claude.ai/artifact/9hMQPQEQnuXfDYN4Kcxv5g".

Links diretos, úteis para mandar a alunos:

- `index.html#item=impressora-3d` abre o card de um equipamento
- `index.html#zona=eletronica` abre uma estação
- `index.html#sim=cortadora-laser` abre e já roda a simulação

## Estrutura

| Arquivo | O que tem |
|---|---|
| `js/dados.js` | **Todo o conteúdo**: zonas, equipamentos, materiais, projetos da vitrine, móveis |
| `js/modelos.js` | Os modelos 3D (feitos em código, estilo cartoon) e as animações das máquinas |
| `js/app.js` | Cena, câmera, cliques, cards, trilha guiada, simulações e progresso |
| `css/estilo.css` | Visual da interface |

## Como adicionar um item novo

Em `js/dados.js`, acrescente um objeto na lista `itens`:

```js
{
  id: 'furadeira', zona: 'ferramentas', nome: 'Furadeira', icone: '🔩',
  modelo: 'generico', opcoes: { cor: '#e76f51', tamanho: [0.5, 0.3, 0.2] },
  pos: [-8.6, 1.4, 1.8],
  descricao: '...', aprender: '...', dica: '...'
}
```

- Tudo é em **metros**, na escala real da sala (7,54 × 5,29 m). `pos` é `[x, y, z]`: x vai de -3,77 a 3,77 e z de -2,645 a 2,645. Use `y = 0.9` para apoiar o item no tampo dos balcões.
- `parede` (`cinza`, `azul`, `janela` ou `quadro`) vira o objeto de frente para a sala. Use `fixo: true` para objetos presos na parede, que somem quando a parede é "cortada".
- `modelo: 'generico'` desenha um bloco colorido. Para um modelo próprio, crie uma função em `js/modelos.js` e exporte no `return` do final.
- Para um projeto da vitrine, use o campo `projeto` (autor, objetivo, materiais, tecnologias) e remova `exemplo: true`.

## Próximos passos

- Confirmar as medidas estimadas: pé-direito (2,80 m), altura do peitoril da janela (0,80 m) e posição da porta
- Completar autoria e objetivo dos projetos da vitrine (hoje "a confirmar")
- Arrastar materiais da zona de sustentabilidade para a bancada e montar protótipos
