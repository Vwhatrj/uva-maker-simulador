# Simulador UVA Maker Hacker Space

Laboratório maker da Universidade Veiga de Almeida em 3D, na escala real (7,54 × 5,29 m), interativo e didático.

**Abrir:** https://vwhatrj.github.io/uva-maker-simulador/

## O que dá para fazer

- Clicar nos objetos para ver para que servem e o que se aprende com eles
- Simular a impressora 3D, a cortadora a laser, a caneta 3D, o Arduino e o drone
- Seguir a trilha guiada pelas 6 estações
- Ver as medidas reais da sala (📏)
- Mudar a hora do dia (☀️), com sol, sombras e lâmpadas à noite
- **Editar layout (✥):** arrastar e girar cada objeto, adicionar objetos do catálogo e remover. Objetos não se sobrepõem, e o que está em cima de um móvel vai junto com ele. O layout fica salvo no navegador de cada pessoa e pode ser guardado e aberto como arquivo `.json`.

Links diretos: `#impressora-3d` (um objeto), `#eletronica` (uma estação), `#medidas`.

## Abrir no próprio computador

Dê dois cliques em `index.html` (precisa de internet, porque a biblioteca 3D Three.js vem de um CDN).

## Continuar em outro computador

1. No GitHub Desktop: **File → Clone repository** e escolha `uva-maker-simulador`.
2. Abra a pasta no VS Code com o Claude Code e peça o que quiser mudar.
3. Ao terminar: **Commit to main** e **Push origin** no GitHub Desktop. O site atualiza sozinho em 1 ou 2 minutos.

## Estrutura

| Arquivo | O que tem |
|---|---|
| `js/dados.js` | **Todo o conteúdo**: zonas, catálogo de tipos de objeto e os objetos da sala |
| `js/modelos.js` | Os modelos 3D (feitos em código) e as animações das máquinas |
| `js/app.js` | Cena, câmera, cards, trilha, simulações, edição de layout, hora do dia |
| `css/estilo.css` | Visual da interface |

## Como adicionar um tipo de objeto novo ao catálogo

Em `js/dados.js`, dentro de `catalogo`:

```js
furadeira: {
  categoria: 'Equipamentos', nome: 'Furadeira', icone: '🔩',
  modelo: 'generico', opcoes: { cor: '#e76f51', tamanho: [0.3, 0.2, 0.1] },
  base: [0.3, 0.1],          // espaço que ocupa (largura x profundidade, em metros)
  apoio: 'ambos',            // 'chao', 'superficie' ou 'ambos'
  zona: 'ferramentas', descricao: '...', aprender: '...', dica: '...'
}
```

Ele aparece no botão **➕ Adicionar objeto**. Para colocá-lo na sala desde o início, acrescente em `objetos`:
`{ id: 'furadeira-1', tipo: 'furadeira', pos: [x, y, z], sobre: 'balcao-fabricacao' }`.
A sala vai de x -3,77 a 3,77 e de z -2,645 a 2,645; y = 0,9 é o tampo dos balcões.

## A confirmar

- Pé-direito (estimado em 3,00 m pelas fotos), altura do peitoril da janela (0,80 m) e largura da porta dupla (1,50 m)
