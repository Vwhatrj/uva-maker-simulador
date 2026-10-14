/*
 * Conteúdo do simulador UVA Maker Hacker Space.
 *
 * Tudo em METROS. A sala mede 7,54 m (eixo x, de -3,77 a 3,77) por 5,29 m (eixo z, de -2,645 a 2,645).
 *   Parede "cinza"  (z = -2,645): banners, logo UVA, painéis de ferramentas, balcões e armário
 *   Parede "azul"   (z = +2,645): prateleiras, computadores e porta de vidro
 *   Parede "janela" (x = +3,77):  abertura de 2,31 x 1,90 m
 *   Parede "quadro" (x = -3,77):  quadro branco e gaveteiros
 *
 * `catalogo`: os TIPOS de objeto. Cada tipo diz o modelo 3D, o espaço que ocupa no chão (`base`: [largura, profundidade]),
 *   onde pode ficar (`apoio`: 'chao', 'superficie' ou 'ambos'), a altura do tampo se outros objetos podem ficar
 *   em cima (`superficie`) e, opcionalmente, o card que aparece ao clicar (zona, descricao, aprender, dica, sim...).
 *   Os tipos sem `noCatalogo` aparecem no botão "Adicionar objeto" do modo de edição.
 * `objetos`: o que está na sala. Cada objeto tem `id`, `tipo` (ou `modelo`), `pos` [x, y, z] e, se for o caso:
 *   `parede` (vira o objeto de frente para a sala), `rot`, `sobre` (id do móvel onde está apoiado),
 *   `preso` (parte de outro objeto, como as portas do armário), `fixo` (preso na parede, não se move)
 *   e campos de card próprios, que substituem os do catálogo.
 */
window.UVA_DATA = {
  zonas: [
    {
      id: 'sustentabilidade', nome: 'Sustentabilidade e Reaproveitamento', curto: 'Sustentabilidade',
      icone: '♻️', cor: '#2fb34a', parede: 'cinza', centro: [2.3, 0.9, -2.4], rotulo: [2.3, 2.1, -2.3],
      descricao: 'Os armários guardam os insumos de reaproveitamento: papel, papelão, isopor, E.V.A., Lego e blocos de montagem. Clique em cada porta para abri-la.',
      objetivo: 'Viver a economia circular na prática: reduzir, reutilizar e transformar materiais de baixo custo em protótipos funcionais.'
    },
    {
      id: 'ferramentas', nome: 'Ferramentas Manuais e Marcenaria', curto: 'Ferramentas',
      icone: '🔨', cor: '#e76f51', parede: 'cinza', centro: [0.45, 1.5, -2.5], rotulo: [-0.05, 2.35, -2.5],
      descricao: 'Painéis perfurados com tesouras, alicates, grampos, chaves de fenda e martelos para ajuste, montagem e acabamento dos protótipos. Os suportes laranja foram impressos no próprio laboratório.',
      objetivo: 'Desenvolver habilidades manuais, noção de medida e precisão, e o cuidado com a segurança no trabalho físico.'
    },
    {
      id: 'fabricacao', nome: 'Fabricação Digital', curto: 'Fabricação Digital',
      icone: '🖨️', cor: '#7b2cbf', parede: 'cinza', centro: [0.6, 1.0, -2.3], rotulo: [1.35, 1.25, -2.15],
      descricao: 'Impressora 3D, mini cortadora a laser, caneta 3D e as estações de computador onde os modelos são desenhados.',
      objetivo: 'Compreender o fluxo ideia → modelo digital → máquina → objeto, e as escolhas de tempo, material e precisão em cada etapa.'
    },
    {
      id: 'eletronica', nome: 'Eletrônica, Automação e Robótica', curto: 'Eletrônica',
      icone: '🤖', cor: '#0077b6', parede: 'cinza', centro: [-2.0, 1.0, -2.35], rotulo: [-2.0, 1.45, -2.3],
      descricao: 'Arduino, circuitos, drones, óculos de realidade virtual e câmera: tecnologia para dar vida e movimento aos projetos.',
      objetivo: 'Introduzir lógica de programação e eletrônica básica, conectando o protótipo físico ao código.'
    },
    {
      id: 'colagem', nome: 'Fixação, Colagem e Ideias', curto: 'Colagem e Ideias',
      icone: '🧴', cor: '#f4a261', parede: 'quadro', centro: [-3.4, 1.1, 0], rotulo: [-3.5, 1.05, 0],
      descricao: 'Colas e notas autoadesivas nos gaveteiros, o quadro branco para ideias e recados, e as mesas colaborativas no centro da sala.',
      objetivo: 'Escolher a união certa para cada material e organizar ideias em equipe.'
    },
    {
      id: 'vitrine', nome: 'Vitrine de Projetos', curto: 'Vitrine',
      icone: '🏆', cor: '#e63946', parede: 'azul', centro: [0.4, 1.7, 2.45], rotulo: [0.4, 2.55, 2.4],
      descricao: 'Prateleiras com trabalhos feitos no laboratório e os banners de pesquisa do UVA Maker.',
      objetivo: 'Inspirar novos projetos e valorizar a produção dos estudantes. Clique em cada peça para saber quem fez e como.'
    }
  ],

  catalogo: {
    // ---------- Móveis ----------
    balcao: {
      categoria: 'Móveis', nome: 'Balcão com portas', icone: '🗄️',
      modelo: 'balcao', opcoes: { w: 1.6 }, base: [1.6, 0.6], apoio: 'chao', superficie: 0.9
    },
    armario: {
      categoria: 'Móveis', nome: 'Armário de 9 portas', icone: '🚪',
      modelo: 'armario', opcoes: { portas: true }, base: [0.9, 0.45], apoio: 'chao'
    },
    gaveteiro: {
      categoria: 'Móveis', nome: 'Gaveteiro com rodinhas', icone: '🗃️',
      modelo: 'gaveteiro', base: [0.52, 0.44], apoio: 'chao', superficie: 0.64
    },
    mesaComputador: {
      categoria: 'Móveis', nome: 'Mesa de computador', icone: '🟦',
      modelo: 'mesaComputador', opcoes: { w: 1.05 }, base: [1.05, 0.6], apoio: 'chao', superficie: 0.74
    },
    mesaColaborativa: {
      categoria: 'Móveis', nome: 'Mesa colaborativa', icone: '⬜',
      modelo: 'mesaColaborativa', base: [1.5, 0.75], apoio: 'chao', superficie: 0.755,
      zona: 'colagem',
      descricao: 'Mesas brancas com faixa preta, unidas no centro da sala para o trabalho em equipe.',
      aprender: 'É aqui que as equipes se encontram para planejar, recortar, colar e montar os protótipos juntas.',
      dica: 'Proteja a mesa com uma base de corte ou papelão antes de usar estilete ou cola quente.'
    },
    cadeiraPreta: {
      categoria: 'Móveis', nome: 'Cadeira preta', icone: '🪑',
      modelo: 'cadeira', base: [0.46, 0.46], apoio: 'chao'
    },
    cadeiraAzul: {
      categoria: 'Móveis', nome: 'Cadeira azul', icone: '💺',
      modelo: 'cadeira', opcoes: { cor: '#3f86c6' }, base: [0.46, 0.46], apoio: 'chao'
    },
    lixeiras: {
      categoria: 'Móveis', nome: 'Coleta seletiva', icone: '🗑️',
      modelo: 'lixeiras', escala: 0.45, base: [0.96, 0.24], apoio: 'chao',
      zona: 'sustentabilidade',
      descricao: 'Lixeiras separadas por tipo de material: papel, plástico, vidro e metal.',
      aprender: 'A economia circular começa na separação: material bem separado pode voltar para a bancada ou seguir para a reciclagem.',
      dica: 'Antes de descartar, pergunte: "isso ainda pode virar outro projeto?"'
    },
    planta: {
      categoria: 'Móveis', nome: 'Vaso de planta', icone: '🪴',
      modelo: 'planta', base: [0.36, 0.36], apoio: 'ambos'
    },

    // ---------- Equipamentos ----------
    impressora3d: {
      categoria: 'Equipamentos', nome: 'Impressora 3D Bambu Lab A1', icone: '🖨️',
      modelo: 'impressora3d', base: [0.46, 0.4], apoio: 'ambos',
      zona: 'fabricacao',
      descricao: 'Constrói objetos camada por camada derretendo filamento plástico (PLA). Nesta impressora a mesa anda para frente e para trás enquanto a cabeça anda para os lados.',
      aprender: 'Do modelo digital ao objeto físico: o estudante aprende modelagem 3D, fatiamento e geometria, e conhece as limitações reais da fabricação (suportes, preenchimento, tempo).',
      dica: 'Prefira o PLA, um plástico de origem vegetal, e reaproveite impressões que falharam como material de teste.',
      sim: {
        acao: 'Imprimir um vaso', tempo: '≈ 2h 30min', duracao: 9,
        passos: ['Modelando no computador…', 'Fatiando em camadas…', 'Aquecendo o bico a 200 °C…', 'Imprimindo camada por camada…', 'Esfriando a peça…']
      }
    },
    laser: {
      categoria: 'Equipamentos', nome: 'Mini cortadora a laser NEJE', icone: '✨',
      modelo: 'laser', base: [0.17, 0.16], apoio: 'ambos',
      zona: 'fabricacao',
      descricao: 'Máquina compacta que grava madeira, MDF e papelão e corta papel e materiais finos com um feixe de luz concentrado. A janela verde filtra a luz do laser.',
      aprender: 'Ensina desenho vetorial (2D), precisão e encaixes: com chapas planas se constroem objetos 3D, como o porquinho fatiado da vitrine.',
      dica: 'Nunca olhe diretamente para o feixe, mantenha a tampa fechada e não deixe a máquina ligada sozinha.',
      sim: {
        acao: 'Gravar uma estrela', tempo: '≈ 12 min', duracao: 8,
        passos: ['Desenhando o vetor…', 'Ajustando potência e velocidade…', 'Gravando a peça…', 'Retirando a peça…']
      }
    },
    caneta3d: {
      categoria: 'Equipamentos', nome: 'Caneta 3D', icone: '🖊️',
      modelo: 'caneta3d', escala: 0.3, base: [0.2, 0.28], apoio: 'ambos',
      zona: 'fabricacao',
      descricao: 'Uma "impressora 3D de mão" que desenha no ar com plástico derretido.',
      aprender: 'Desenvolve coordenação e criatividade, serve para reparos rápidos e mostra o princípio da impressão 3D sem computador.',
      dica: 'O bico esquenta! Use uma superfície protegida e não toque no plástico logo depois que ele sai.',
      sim: {
        acao: 'Desenhar uma espiral', tempo: '≈ 5 min', duracao: 7,
        passos: ['Aquecendo…', 'Desenhando no ar…', 'Esfriando…']
      }
    },
    computador: {
      categoria: 'Equipamentos', nome: 'Estação de computador', icone: '🖥️',
      modelo: 'computador', base: [0.8, 0.5], apoio: 'ambos',
      zona: 'fabricacao',
      descricao: 'Computador para modelagem 3D, desenho vetorial, programação e pesquisa.',
      aprender: 'O computador é a ponte entre a imaginação e as máquinas: o desenho digital (ex.: Tinkercad, Inkscape) vira instruções para a impressora e a cortadora.',
      dica: 'Salve versões do arquivo (v1, v2, v3…). Uma ideia antiga pode salvar o projeto!'
    },
    arduino: {
      categoria: 'Equipamentos', nome: 'Placa Arduino', icone: '🔌',
      modelo: 'arduino', escala: 0.25, base: [0.24, 0.17], apoio: 'ambos',
      zona: 'eletronica',
      descricao: 'Microcontrolador programável: o "cérebro" de robôs e projetos interativos.',
      aprender: 'Conecta o mundo físico ao digital: o estudante programa (lógica, variáveis, laços) e vê o resultado acendendo LEDs, girando motores e lendo sensores.',
      dica: 'Desconecte o cabo USB antes de mexer nos fios do circuito.',
      sim: {
        acao: 'Rodar o código do semáforo', tempo: '≈ 30 min para montar e programar', duracao: 7,
        passos: ['Escrevendo o código…', 'Enviando para a placa…', 'Executando: verde → amarelo → vermelho!']
      }
    },
    protoboard: {
      categoria: 'Equipamentos', nome: 'Circuitos e protoboard', icone: '🔋',
      modelo: 'protoboard', escala: 0.25, base: [0.4, 0.14], apoio: 'ambos',
      zona: 'eletronica',
      descricao: 'Placa de ensaio para montar circuitos sem solda.',
      aprender: 'Permite experimentar, trocar componentes, errar e corrigir sem estragar nada. É ideal para entender corrente, tensão e resistência.',
      dica: 'Confira a polaridade do LED: a perna mais longa é o positivo (+).'
    },
    kit: {
      categoria: 'Equipamentos', nome: 'Kit de componentes', icone: '🧪',
      modelo: 'kit', escala: 0.3, base: [0.26, 0.18], apoio: 'ambos',
      zona: 'eletronica',
      descricao: 'LEDs, resistores, botões, sensores, motores e jumpers organizados.',
      aprender: 'Conhecer cada componente é como aprender o alfabeto da eletrônica: combinados, eles formam qualquer projeto.',
      dica: 'Brinquedos e impressoras velhas guardam motores e sensores que podem ser reaproveitados!'
    },
    droneCamera: {
      categoria: 'Equipamentos', nome: 'Drone com câmera', icone: '🛸',
      modelo: 'drone', opcoes: { cor: '#f1f3f5', detalhe: '#ffbe0b' }, base: [0.3, 0.3], apoio: 'ambos',
      zona: 'eletronica',
      descricao: 'Drone compacto com câmera para fotos aéreas e mapeamento.',
      aprender: 'Drones juntam física (sustentação, equilíbrio), eletrônica e programação, e servem para registrar projetos de arquitetura e urbanismo vistos de cima.',
      dica: 'Voe sempre em área aberta e permitida, longe de pessoas e com a bateria carregada.'
    },
    droneQuadricoptero: {
      categoria: 'Equipamentos', nome: 'Drone quadricóptero', icone: '🚁',
      modelo: 'drone', opcoes: { cor: '#1b1b1b', detalhe: '#e63946' }, base: [0.28, 0.28], apoio: 'ambos',
      zona: 'eletronica',
      descricao: 'Quadricóptero para estudar voo, controle e estabilização.',
      aprender: 'Quatro hélices girando em sentidos opostos equilibram o drone: um ótimo jeito de ver na prática as leis de Newton e o controle automático.',
      dica: 'Antes de decolar, confira hélices, bateria e o espaço ao redor.',
      sim: {
        acao: 'Simular um voo', tempo: '≈ 20 min de voo por bateria', duracao: 7,
        passos: ['Checando hélices e bateria…', 'Decolando…', 'Pairando e filmando…', 'Pousando com segurança…']
      }
    },
    oculosVR: {
      categoria: 'Equipamentos', nome: 'Óculos de realidade virtual', icone: '🥽',
      modelo: 'oculosVR', base: [0.5, 0.2], apoio: 'ambos',
      zona: 'eletronica',
      descricao: 'Óculos e controles para experiências imersivas em realidade virtual.',
      aprender: 'Permitem "entrar" em maquetes e ambientes digitais antes de construí-los, como este simulador!',
      dica: 'Faça pausas a cada 20 minutos e use em um espaço livre de obstáculos.'
    },
    cameraFoto: {
      categoria: 'Equipamentos', nome: 'Câmera fotográfica', icone: '📷',
      modelo: 'cameraFoto', base: [0.2, 0.2], apoio: 'ambos',
      zona: 'eletronica',
      descricao: 'Câmera com tripé flexível para registrar o processo e os resultados dos projetos.',
      aprender: 'Documentar é parte do método maker: fotos e vídeos contam a história do projeto e ajudam outras pessoas a reproduzi-lo.',
      dica: 'Fotografe o "antes, durante e depois", e não só o resultado final.'
    },
    tablet: {
      categoria: 'Equipamentos', nome: 'Tablet', icone: '📱',
      modelo: 'tablet', base: [0.3, 0.15], apoio: 'ambos',
      zona: 'eletronica',
      descricao: 'Tablet para apresentações, apps educativos e controle de dispositivos.',
      aprender: 'Serve de controle remoto para drones e robôs e de vitrine digital para os projetos.',
      dica: 'Mantenha o tablet carregado e com os apps do laboratório atualizados.'
    },

    // ---------- Materiais de colagem ----------
    colaBranca: {
      categoria: 'Materiais', nome: 'Cola branca', icone: '🥛',
      modelo: 'colaBranca', escala: 0.35, base: [0.2, 0.12], apoio: 'ambos',
      zona: 'colagem',
      descricao: 'Cola atóxica à base d\'água.',
      aprender: 'Ideal para papel, papelão e madeira. Ensina paciência: a secagem leva tempo, mas a união fica forte.',
      dica: 'Use pouca cola e espalhe bem: o excesso deixa o papelão empenado.'
    },
    colaQuente: {
      categoria: 'Materiais', nome: 'Pistola de cola quente', icone: '🔥',
      modelo: 'colaQuente', escala: 0.35, base: [0.2, 0.25], apoio: 'ambos',
      zona: 'colagem',
      descricao: 'Derrete bastões de cola para uma união quase instantânea.',
      aprender: 'Perfeita para prototipagem rápida: une materiais diferentes em segundos (papelão + E.V.A. + plástico).',
      dica: 'Apoie a pistola no suporte e cuidado com os fios de cola, que queimam! Atenção redobrada com isopor.'
    },
    blocoPostit: {
      categoria: 'Materiais', nome: 'Notas autoadesivas (Post-it)', icone: '📝',
      modelo: 'blocoPostit', base: [0.25, 0.25], apoio: 'ambos',
      zona: 'colagem',
      descricao: 'Blocos de post-it e canetas para registrar ideias e recados.',
      aprender: 'Escrever e colar ideias torna o pensamento visível e facilita a colaboração.',
      dica: 'Escreva com letra grande: o post-it precisa ser lido de longe.'
    }
  },

  objetos: [
    // ---------- Móveis da parede cinza ----------
    { id: 'balcao-eletronica', tipo: 'balcao', pos: [-2.0, 0, -2.345], parede: 'cinza' },
    { id: 'balcao-fabricacao', tipo: 'balcao', pos: [0.45, 0, -2.345], parede: 'cinza' },
    { id: 'armario', tipo: 'armario', nome: 'Armário de insumos', opcoes: { portas: false }, pos: [2.3, 0, -2.42], parede: 'cinza' },

    // ---------- Portas do armário (abrem ao clicar e vão junto com o armário) ----------
    {
      id: 'papel', modelo: 'portaArmario', opcoes: { conteudo: 'papel' }, pos: [2.0, 1.22, -2.195], parede: 'cinza', sobre: 'armario', preso: true,
      zona: 'sustentabilidade', nome: 'Papel', icone: '📄',
      descricao: 'Folhas usadas, revistas e sobras de impressão.',
      aprender: 'Papel é ótimo para rascunhar ideias em 3D: dobraduras, moldes e protótipos de baixa fidelidade ajudam a testar formas antes de gastar material nobre. A lhama da vitrine é um exemplo!',
      vira: ['Moldes e gabaritos', 'Papercraft low-poly', 'Protótipos de embalagem'],
      dica: 'Separe o papel limpo do sujo: só o limpo volta para a bancada.'
    },
    {
      id: 'eva', modelo: 'portaArmario', opcoes: { conteudo: 'eva' }, pos: [2.3, 1.22, -2.195], parede: 'cinza', sobre: 'armario', preso: true,
      zona: 'sustentabilidade', nome: 'E.V.A.', icone: '🎨',
      descricao: 'Retalhos coloridos de E.V.A. que sobraram de outros projetos.',
      aprender: 'Flexível, colorido e macio: perfeito para acabamentos, articulações, proteções e protótipos de produtos vestíveis.',
      vira: ['Acabamentos', 'Dobradiças flexíveis', 'Jogos pedagógicos'],
      dica: 'Guarde até os retalhos pequenos: eles viram detalhes, botões e etiquetas.'
    },
    {
      id: 'lego', modelo: 'portaArmario', opcoes: { conteudo: 'lego' }, pos: [2.6, 1.22, -2.195], parede: 'cinza', sobre: 'armario', preso: true,
      zona: 'sustentabilidade', nome: 'Lego', icone: '🧱',
      descricao: 'Peças de encaixe para prototipar mecanismos rapidamente.',
      aprender: 'Com blocos de encaixe dá para testar engrenagens, alavancas e estruturas em minutos e desmontar sem desperdício nenhum.',
      vira: ['Mecanismos e engrenagens', 'Estruturas de teste', 'Robôs educacionais'],
      dica: 'Monte, teste, desmonte, repita. Errar rápido é aprender rápido!'
    },
    {
      id: 'papelao', modelo: 'portaArmario', opcoes: { conteudo: 'papelao' }, pos: [2.0, 0.64, -2.195], parede: 'cinza', sobre: 'armario', preso: true,
      zona: 'sustentabilidade', nome: 'Papelão', icone: '📦',
      descricao: 'Caixas de entrega, tubos e embalagens.',
      aprender: 'Resistente e fácil de cortar, o papelão é o "MDF do maker iniciante": dá para construir maquetes habitacionais, móveis em escala e carcaças de robôs.',
      vira: ['Maquetes habitacionais', 'Carcaças de robôs', 'Organizadores'],
      dica: 'Corte sempre com a lâmina se afastando do corpo e use uma base de corte.'
    },
    {
      id: 'isopor', modelo: 'portaArmario', opcoes: { conteudo: 'isopor' }, pos: [2.3, 0.64, -2.195], parede: 'cinza', sobre: 'armario', preso: true,
      zona: 'sustentabilidade', nome: 'Isopor', icone: '🧊',
      descricao: 'Bandejas, blocos de proteção de eletrônicos e placas.',
      aprender: 'Leve e fácil de modelar, é ideal para volumes de maquetes, relevos e protótipos que flutuam.',
      vira: ['Volumes de maquete', 'Relevos e topografia', 'Protótipos flutuantes'],
      dica: 'Cola quente muito quente e colas com solvente derretem o isopor! Prefira cola branca ou cola própria para isopor.'
    },
    {
      id: 'blocos', modelo: 'portaArmario', opcoes: { conteudo: 'blocos' }, pos: [2.6, 0.64, -2.195], parede: 'cinza', sobre: 'armario', preso: true,
      zona: 'sustentabilidade', nome: 'Blocos de montagem', icone: '🔷',
      descricao: 'Blocos de madeira e plástico em formas geométricas.',
      aprender: 'Ajudam a pensar em volumes, equilíbrio e proporção, que são o primeiro passo de qualquer maquete.',
      vira: ['Estudos de forma', 'Maquetes rápidas'],
      dica: 'Experimente montar a mesma ideia de três jeitos diferentes antes de escolher um.'
    },
    {
      id: 'sucata', modelo: 'portaArmario', opcoes: { conteudo: 'sucata' }, pos: [2.0, 0.06, -2.195], parede: 'cinza', sobre: 'armario', preso: true,
      zona: 'sustentabilidade', nome: 'Sucata eletrônica', icone: '🔩',
      descricao: 'Placas, motores e peças retiradas de aparelhos que iam para o lixo.',
      aprender: 'Desmontar um aparelho velho é uma aula de engenharia reversa, e muitas peças voltam à vida em novos projetos.',
      vira: ['Motores para robôs', 'Peças de reposição', 'Arte com circuitos'],
      dica: 'Nunca desmonte aparelhos ligados na tomada nem baterias estufadas.'
    },
    {
      id: 'caixa-ferramentas', modelo: 'portaArmario', opcoes: { conteudo: 'ferramentas' }, pos: [2.3, 0.06, -2.195], parede: 'cinza', sobre: 'armario', preso: true,
      zona: 'ferramentas', nome: 'Caixa de ferramentas', icone: '🧰',
      descricao: 'Serrote, lixas, trena, alicates e estilete para marcenaria educacional.',
      aprender: 'Medir, serrar e lixar desenvolve precisão e paciência, e transforma retalhos de madeira em estruturas para os protótipos.',
      dica: 'Meça duas vezes, corte uma. E sempre com óculos de proteção!'
    },
    {
      id: 'kit-eletronico', modelo: 'portaArmario', opcoes: { conteudo: 'kit' }, pos: [2.6, 0.06, -2.195], parede: 'cinza', sobre: 'armario', preso: true,
      zona: 'eletronica', nome: 'Kit de componentes', icone: '🧪',
      descricao: 'LEDs, resistores, botões, sensores, motores e jumpers organizados.',
      aprender: 'Conhecer cada componente é como aprender o alfabeto da eletrônica: combinados, eles formam qualquer projeto.',
      dica: 'Brinquedos e impressoras velhas guardam motores e sensores que podem ser reaproveitados!'
    },

    // ---------- Sobre os balcões ----------
    { id: 'impressora-3d', tipo: 'impressora3d', pos: [0.92, 0.9, -2.39], parede: 'cinza', sobre: 'balcao-fabricacao' },
    { id: 'cortadora-laser', tipo: 'laser', pos: [0.4, 0.9, -2.2], parede: 'cinza', sobre: 'balcao-fabricacao' },
    { id: 'caneta-3d', tipo: 'caneta3d', pos: [-0.12, 0.9, -2.2], parede: 'cinza', sobre: 'balcao-fabricacao' },
    { id: 'drone-vermelho', tipo: 'droneQuadricoptero', pos: [-0.15, 0.9, -2.49], parede: 'cinza', sobre: 'balcao-fabricacao' },
    { id: 'oculos-vr', tipo: 'oculosVR', pos: [0.4, 0.9, -2.47], parede: 'cinza', sobre: 'balcao-fabricacao' },
    { id: 'arduino', tipo: 'arduino', pos: [-2.45, 0.9, -2.2], parede: 'cinza', sobre: 'balcao-eletronica' },
    { id: 'protoboard', tipo: 'protoboard', pos: [-1.95, 0.9, -2.2], parede: 'cinza', sobre: 'balcao-eletronica' },
    { id: 'drone-branco', tipo: 'droneCamera', pos: [-2.0, 0.9, -2.47], parede: 'cinza', sobre: 'balcao-eletronica' },
    { id: 'camera', tipo: 'cameraFoto', pos: [-1.5, 0.9, -2.42], parede: 'cinza', sobre: 'balcao-eletronica' },
    { id: 'tablet', tipo: 'tablet', pos: [-2.6, 0.9, -2.47], parede: 'cinza', sobre: 'balcao-eletronica' },

    // ---------- Presos na parede cinza ----------
    { id: 'letreiro-uva', modelo: 'letreiroUVA', pos: [0.45, 1.81, -2.645], parede: 'cinza', fixo: true },
    { id: 'ar-condicionado', modelo: 'arCondicionado', pos: [-3.25, 2.3, -2.645], parede: 'cinza', fixo: true },
    {
      id: 'painel-ferramentas', modelo: 'painelPerfurado', pos: [0.45, 1.25, -2.645], parede: 'cinza', fixo: true,
      zona: 'ferramentas', nome: 'Painéis de ferramentas', icone: '🧰',
      descricao: 'Painéis perfurados onde cada ferramenta tem o seu lugar.',
      aprender: 'Organização também se aprende: um espaço maker compartilhado só funciona quando todos encontram e devolvem as ferramentas.',
      dica: 'Devolver a ferramenta ao painel é cuidar do espaço coletivo.'
    },
    {
      id: 'martelo', modelo: 'martelo', pos: [1.23, 1.01, -2.645], parede: 'cinza', fixo: true,
      zona: 'ferramentas', nome: 'Martelos', icone: '🔨',
      descricao: 'Ferramenta de impacto para pregar, encaixar e ajustar peças.',
      aprender: 'Usar o martelo ensina física na prática: alavanca, impulso e transferência de energia.',
      dica: 'Segure pela ponta do cabo, mantenha os dedos longe e use óculos de proteção.'
    },
    {
      id: 'chave-fenda', modelo: 'chaveFenda', pos: [0.225, 1.17, -2.645], parede: 'cinza', fixo: true,
      zona: 'ferramentas', nome: 'Chaves de fenda', icone: '🪛',
      descricao: 'Chaves de fenda e Phillips de vários tamanhos.',
      aprender: 'Montar e desmontar com parafusos permite reaproveitar peças, fazer manutenção e entender como os objetos são construídos.',
      dica: 'Use a ponta do tamanho exato do parafuso para não espaná-lo.'
    },
    {
      id: 'banner-ods', modelo: 'poster', opcoes: { titulo: 'PROMOÇÃO DOS ODS NA COMUNIDADE ACADÊMICA: COMPROMISSO DA UNIVERSIDADE VEIGA DE ALMEIDA COM O PACTO GLOBAL DA ONU' },
      pos: [-2.4, 1.2, -2.645], parede: 'cinza', fixo: true,
      zona: 'vitrine', nome: 'Banner: ODS na comunidade acadêmica', icone: '🌍',
      descricao: 'Banner de pesquisa sobre a promoção dos Objetivos de Desenvolvimento Sustentável (ODS) na universidade.',
      aprender: 'Os 17 ODS da ONU orientam os projetos do UVA Maker: cada protótipo pode responder a um desafio real de sustentabilidade.',
      dica: 'Ao começar um projeto, escolha qual ODS ele ajuda a alcançar.'
    },
    {
      id: 'banner-uva-maker', modelo: 'poster', opcoes: { titulo: 'UVA MAKER: FORMAÇÃO DE PROFISSIONAIS ENGAJADOS COM OS OBJETIVOS DO DESENVOLVIMENTO SUSTENTÁVEL' },
      pos: [-1.65, 1.2, -2.645], parede: 'cinza', fixo: true,
      zona: 'vitrine', nome: 'Banner: UVA Maker e os ODS', icone: '📜',
      descricao: 'Banner de pesquisa sobre o UVA Maker e a formação de profissionais engajados com o desenvolvimento sustentável.',
      aprender: 'Mostra como a cultura maker, com Feira Maker, oficinas e projetos, aproxima a formação acadêmica dos desafios da sociedade.',
      dica: 'Os resultados de pesquisa também são um projeto: compartilhe o que você aprendeu!'
    },

    // ---------- Parede do quadro ----------
    {
      id: 'quadro-branco', modelo: 'quadroBranco', opcoes: { w: 3.0, h: 1.45 }, pos: [-3.77, 0.85, 0], parede: 'quadro', fixo: true,
      zona: 'colagem', nome: 'Quadro branco e mural de post-its', icone: '🗒️',
      descricao: 'Quadro para aulas, brainstorms e recados, com um mural de notas autoadesivas.',
      aprender: 'Organizar ideias visualmente faz parte do design thinking e do trabalho em equipe. No quadro está uma aula de dilatação térmica: a física também vira projeto!',
      dica: 'Uma ideia por post-it! Assim dá para agrupar, reorganizar e votar nas melhores.'
    },
    { id: 'gaveteiro-colas', tipo: 'gaveteiro', pos: [-3.5, 0, -0.9], parede: 'quadro' },
    { id: 'gaveteiro-postits', tipo: 'gaveteiro', pos: [-3.5, 0, 0.9], parede: 'quadro' },
    { id: 'cola-branca', tipo: 'colaBranca', pos: [-3.5, 0.64, -1.05], parede: 'quadro', sobre: 'gaveteiro-colas' },
    { id: 'cola-quente', tipo: 'colaQuente', pos: [-3.5, 0.64, -0.75], parede: 'quadro', sobre: 'gaveteiro-colas' },
    { id: 'post-its', tipo: 'blocoPostit', pos: [-3.5, 0.64, 0.9], parede: 'quadro', sobre: 'gaveteiro-postits' },
    { id: 'coleta-seletiva', tipo: 'lixeiras', pos: [-3.65, 0, 2.0], parede: 'quadro' },

    // ---------- Mesas e computadores da parede azul ----------
    { id: 'mesa-pc-1', tipo: 'mesaComputador', pos: [-1.875, 0, 2.345], parede: 'azul' },
    { id: 'mesa-pc-2', tipo: 'mesaComputador', pos: [-0.825, 0, 2.345], parede: 'azul' },
    { id: 'mesa-pc-3', tipo: 'mesaComputador', pos: [0.225, 0, 2.345], parede: 'azul' },
    { id: 'mesa-pc-4', tipo: 'mesaComputador', pos: [1.675, 0, 2.345], parede: 'azul' },
    { id: 'mesa-pc-5', tipo: 'mesaComputador', pos: [2.725, 0, 2.345], parede: 'azul' },
    { id: 'computador-1', tipo: 'computador', pos: [-1.875, 0.74, 2.345], parede: 'azul', sobre: 'mesa-pc-1' },
    { id: 'computador-2', tipo: 'computador', pos: [-0.825, 0.74, 2.345], parede: 'azul', sobre: 'mesa-pc-2' },
    { id: 'computador-3', tipo: 'computador', pos: [0.225, 0.74, 2.345], parede: 'azul', sobre: 'mesa-pc-3' },
    { id: 'computador-4', tipo: 'computador', pos: [1.675, 0.74, 2.345], parede: 'azul', sobre: 'mesa-pc-4' },
    { id: 'computador-5', tipo: 'computador', pos: [2.725, 0.74, 2.345], parede: 'azul', sobre: 'mesa-pc-5' },
    { id: 'cadeira-pc-1', tipo: 'cadeiraAzul', pos: [-1.875, 0, 1.8] },
    { id: 'cadeira-pc-2', tipo: 'cadeiraAzul', pos: [-0.825, 0, 1.8] },
    { id: 'cadeira-pc-3', tipo: 'cadeiraAzul', pos: [0.225, 0, 1.8] },
    { id: 'cadeira-pc-4', tipo: 'cadeiraAzul', pos: [1.675, 0, 1.8] },
    { id: 'cadeira-pc-5', tipo: 'cadeiraAzul', pos: [2.725, 0, 1.8] },

    // ---------- Centro da sala: mesas colaborativas e cadeiras (cada peça se move sozinha) ----------
    { id: 'mesa-central-1', tipo: 'mesaColaborativa', pos: [-0.55, 0, -0.575] },
    { id: 'mesa-central-2', tipo: 'mesaColaborativa', pos: [0.95, 0, -0.575] },
    { id: 'mesa-central-3', tipo: 'mesaColaborativa', pos: [-0.55, 0, 0.175], rot: Math.PI },
    { id: 'mesa-central-4', tipo: 'mesaColaborativa', pos: [0.95, 0, 0.175], rot: Math.PI },
    { id: 'cadeira-1', tipo: 'cadeiraPreta', pos: [-1.0, 0, -1.22] },
    { id: 'cadeira-2', tipo: 'cadeiraPreta', pos: [-0.4, 0, -1.22] },
    { id: 'cadeira-3', tipo: 'cadeiraPreta', pos: [0.2, 0, -1.22] },
    { id: 'cadeira-4', tipo: 'cadeiraPreta', pos: [0.8, 0, -1.22] },
    { id: 'cadeira-5', tipo: 'cadeiraPreta', pos: [1.4, 0, -1.22] },
    { id: 'cadeira-6', tipo: 'cadeiraPreta', pos: [-1.0, 0, 0.82], rot: Math.PI },
    { id: 'cadeira-7', tipo: 'cadeiraPreta', pos: [-0.4, 0, 0.82], rot: Math.PI },
    { id: 'cadeira-8', tipo: 'cadeiraPreta', pos: [0.2, 0, 0.82], rot: Math.PI },
    { id: 'cadeira-9', tipo: 'cadeiraPreta', pos: [0.8, 0, 0.82], rot: Math.PI },
    { id: 'cadeira-10', tipo: 'cadeiraPreta', pos: [1.4, 0, 0.82], rot: Math.PI },

    // ---------- Prateleiras e vitrine (presas na parede azul) ----------
    { id: 'prateleira-esquerda', modelo: 'prateleiraParede', opcoes: { w: 2.7, alturas: [1.4, 1.8, 2.2] }, pos: [-0.6, 0, 2.645], parede: 'azul', fixo: true },
    { id: 'prateleira-direita', modelo: 'prateleiraParede', opcoes: { w: 2.25, alturas: [1.4, 1.8, 2.2] }, pos: [2.275, 0, 2.645], parede: 'azul', fixo: true },
    { id: 'vaso-vidro', modelo: 'vaso', pos: [-1.5, 2.235, 2.515], parede: 'azul', fixo: true },
    { id: 'tela-tripe', modelo: 'telaTripe', pos: [-0.3, 2.235, 2.515], parede: 'azul', fixo: true },
    { id: 'luminaria-tripe', modelo: 'luminaria', pos: [2.0, 2.235, 2.515], parede: 'azul', fixo: true },
    {
      id: 'proj-lhama', modelo: 'lhama', escala: 0.8, pos: [-1.5, 1.435, 2.515], parede: 'azul', fixo: true,
      zona: 'vitrine', nome: 'Lhama low-poly', icone: '🦙',
      descricao: 'Escultura de papel em estilo low-poly (papercraft).',
      projeto: {
        exemplo: true, autor: 'Autoria a confirmar',
        objetivo: 'Transformar um modelo 3D digital em peça física usando apenas papel planificado.',
        materiais: ['Papel', 'Cola branca'], tecnologias: ['Modelagem 3D', 'Planificação']
      }
    },
    {
      id: 'proj-raposa', modelo: 'raposa', pos: [-0.85, 1.435, 2.515], parede: 'azul', fixo: true,
      zona: 'vitrine', nome: 'Raposa low-poly', icone: '🦊',
      descricao: 'Outra escultura facetada em papel, do mesmo estudo de formas.',
      projeto: {
        exemplo: true, autor: 'Autoria a confirmar',
        objetivo: 'Estudar geometria e planificação de sólidos com papel reaproveitado.',
        materiais: ['Papel', 'Cola branca'], tecnologias: ['Modelagem 3D', 'Planificação']
      }
    },
    {
      id: 'proj-potes', modelo: 'potesLuz', pos: [-0.1, 1.435, 2.515], parede: 'azul', fixo: true,
      zona: 'vitrine', nome: 'Potes de luz', icone: '✨',
      descricao: 'Luminárias feitas com potes de vidro reaproveitados e fios de LED.',
      projeto: {
        exemplo: true, autor: 'Autoria a confirmar',
        objetivo: 'Dar nova vida a embalagens de vidro com um circuito simples de iluminação.',
        materiais: ['Potes de vidro', 'Rolhas', 'Fio de LED'], tecnologias: ['Circuitos simples']
      }
    },
    {
      id: 'proj-relogio', modelo: 'relogio', pos: [-0.6, 1.835, 2.515], parede: 'azul', fixo: true,
      zona: 'vitrine', nome: 'Relógio digital', icone: '⏰',
      descricao: 'Relógio com caixa de madeira. Ele mostra a hora de verdade!',
      projeto: {
        exemplo: true, autor: 'Autoria a confirmar',
        objetivo: 'Integrar marcenaria e eletrônica em um objeto do dia a dia.',
        materiais: ['Madeira', 'Display', 'Componentes eletrônicos'], tecnologias: ['Arduino', 'Cortadora a laser']
      }
    },
    {
      id: 'proj-porquinho', modelo: 'porquinho', pos: [1.8, 1.435, 2.515], parede: 'azul', fixo: true,
      zona: 'vitrine', nome: 'Porquinho fatiado', icone: '🐷',
      descricao: 'Escultura montada com fatias de MDF encaixadas.',
      projeto: {
        exemplo: true, autor: 'Autoria a confirmar',
        objetivo: 'Aprender a fatiar um modelo 3D em camadas planas que se encaixam.',
        materiais: ['MDF reaproveitado'], tecnologias: ['Cortadora a laser', 'Modelagem 3D']
      }
    },
    {
      id: 'proj-triangulos', modelo: 'triangulos', pos: [2.7, 1.435, 2.515], parede: 'azul', fixo: true,
      zona: 'vitrine', nome: 'Escultura de triângulos', icone: '🔺',
      descricao: 'Peça decorativa com ripas em ziguezague.',
      projeto: {
        exemplo: true, autor: 'Autoria a confirmar',
        objetivo: 'Explorar ritmo, repetição e encaixes com ripas de madeira.',
        materiais: ['Retalhos de madeira'], tecnologias: ['Ferramentas manuais']
      }
    }
  ]
};
