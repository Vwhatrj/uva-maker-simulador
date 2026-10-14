/*
 * Conteúdo do simulador Uva Maker Hacker Space.
 *
 * Tudo em METROS. A sala mede 7,54 m (eixo x, de -3,77 a 3,77) por 5,29 m (eixo z, de -2,645 a 2,645).
 *   Parede "cinza"  (z = -2,645): banners, logo UVA, painéis de ferramentas, balcões e armários
 *   Parede "azul"   (z = +2,645): prateleiras, computadores e porta de vidro
 *   Parede "janela" (x = +3,77):  abertura de 2,31 x 1,90 m
 *   Parede "quadro" (x = -3,77):  quadro branco e gaveteiros
 *
 * Para incluir um novo equipamento ou material, adicione um objeto em `itens`:
 *   - `zona`:   id de uma das zonas abaixo
 *   - `modelo`: nome de um modelo 3D de js/modelos.js (ou 'generico' para um bloco colorido)
 *   - `pos`:    [x, y, z]; y = 0.9 é o tampo dos balcões e y = 0.74 o das mesas
 *   - `parede`: parede mais próxima (gira o objeto de frente para a sala e orienta a câmera)
 *   - `fixo`:   true para objetos presos na parede (somem junto quando a parede é "cortada")
 *   - `escala`: ajusta o tamanho do modelo (opcional)
 * Campos opcionais do card: `aprender`, `dica`, `vira` (lista), `sim` (simulação), `projeto`.
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
      icone: '🔨', cor: '#e76f51', parede: 'cinza', centro: [0.45, 1.2, -2.5], rotulo: [-0.05, 1.78, -2.5],
      descricao: 'Painéis perfurados com ferramentas manuais para ajuste, montagem e acabamento dos protótipos.',
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

  itens: [
    // ---------- A. Sustentabilidade: portas do armário (abrem ao clicar) ----------
    {
      id: 'papel', zona: 'sustentabilidade', nome: 'Papel', icone: '📄',
      modelo: 'portaArmario', opcoes: { conteudo: 'papel' }, pos: [2.0, 1.22, -2.195], parede: 'cinza', sobre: 'armario',
      descricao: 'Folhas usadas, revistas e sobras de impressão.',
      aprender: 'Papel é ótimo para rascunhar ideias em 3D: dobraduras, moldes e protótipos de baixa fidelidade ajudam a testar formas antes de gastar material nobre. A lhama da vitrine é um exemplo!',
      vira: ['Moldes e gabaritos', 'Papercraft low-poly', 'Protótipos de embalagem'],
      dica: 'Separe o papel limpo do sujo: só o limpo volta para a bancada.'
    },
    {
      id: 'eva', zona: 'sustentabilidade', nome: 'E.V.A.', icone: '🎨',
      modelo: 'portaArmario', opcoes: { conteudo: 'eva' }, pos: [2.3, 1.22, -2.195], parede: 'cinza', sobre: 'armario',
      descricao: 'Retalhos coloridos de E.V.A. que sobraram de outros projetos.',
      aprender: 'Flexível, colorido e macio: perfeito para acabamentos, articulações, proteções e protótipos de produtos vestíveis.',
      vira: ['Acabamentos', 'Dobradiças flexíveis', 'Jogos pedagógicos'],
      dica: 'Guarde até os retalhos pequenos: eles viram detalhes, botões e etiquetas.'
    },
    {
      id: 'lego', zona: 'sustentabilidade', nome: 'Lego', icone: '🧱',
      modelo: 'portaArmario', opcoes: { conteudo: 'lego' }, pos: [2.6, 1.22, -2.195], parede: 'cinza', sobre: 'armario',
      descricao: 'Peças de encaixe para prototipar mecanismos rapidamente.',
      aprender: 'Com blocos de encaixe dá para testar engrenagens, alavancas e estruturas em minutos e desmontar sem desperdício nenhum.',
      vira: ['Mecanismos e engrenagens', 'Estruturas de teste', 'Robôs educacionais'],
      dica: 'Monte, teste, desmonte, repita. Errar rápido é aprender rápido!'
    },
    {
      id: 'papelao', zona: 'sustentabilidade', nome: 'Papelão', icone: '📦',
      modelo: 'portaArmario', opcoes: { conteudo: 'papelao' }, pos: [2.0, 0.64, -2.195], parede: 'cinza', sobre: 'armario',
      descricao: 'Caixas de entrega, tubos e embalagens.',
      aprender: 'Resistente e fácil de cortar, o papelão é o "MDF do maker iniciante": dá para construir maquetes habitacionais, móveis em escala e carcaças de robôs.',
      vira: ['Maquetes habitacionais', 'Carcaças de robôs', 'Organizadores'],
      dica: 'Corte sempre com a lâmina se afastando do corpo e use uma base de corte.'
    },
    {
      id: 'isopor', zona: 'sustentabilidade', nome: 'Isopor', icone: '🧊',
      modelo: 'portaArmario', opcoes: { conteudo: 'isopor' }, pos: [2.3, 0.64, -2.195], parede: 'cinza', sobre: 'armario',
      descricao: 'Bandejas, blocos de proteção de eletrônicos e placas.',
      aprender: 'Leve e fácil de modelar, é ideal para volumes de maquetes, relevos e protótipos que flutuam.',
      vira: ['Volumes de maquete', 'Relevos e topografia', 'Protótipos flutuantes'],
      dica: 'Cola quente muito quente e colas com solvente derretem o isopor! Prefira cola branca ou cola própria para isopor.'
    },
    {
      id: 'blocos', zona: 'sustentabilidade', nome: 'Blocos de montagem', icone: '🔷',
      modelo: 'portaArmario', opcoes: { conteudo: 'blocos' }, pos: [2.6, 0.64, -2.195], parede: 'cinza', sobre: 'armario',
      descricao: 'Blocos de madeira e plástico em formas geométricas.',
      aprender: 'Ajudam a pensar em volumes, equilíbrio e proporção, que são o primeiro passo de qualquer maquete.',
      vira: ['Estudos de forma', 'Maquetes rápidas'],
      dica: 'Experimente montar a mesma ideia de três jeitos diferentes antes de escolher um.'
    },
    {
      id: 'sucata', zona: 'sustentabilidade', nome: 'Sucata eletrônica', icone: '🔩',
      modelo: 'portaArmario', opcoes: { conteudo: 'sucata' }, pos: [2.0, 0.06, -2.195], parede: 'cinza', sobre: 'armario',
      descricao: 'Placas, motores e peças retiradas de aparelhos que iam para o lixo.',
      aprender: 'Desmontar um aparelho velho é uma aula de engenharia reversa, e muitas peças voltam à vida em novos projetos.',
      vira: ['Motores para robôs', 'Peças de reposição', 'Arte com circuitos'],
      dica: 'Nunca desmonte aparelhos ligados na tomada nem baterias estufadas.'
    },
    {
      id: 'coleta-seletiva', zona: 'sustentabilidade', nome: 'Coleta seletiva', icone: '🗑️',
      modelo: 'lixeiras', escala: 0.45, pos: [-3.65, 0, 2.0], parede: 'quadro',
      descricao: 'Lixeiras separadas por tipo de material: papel, plástico, vidro e metal.',
      aprender: 'A economia circular começa na separação: material bem separado pode voltar para a bancada ou seguir para a reciclagem.',
      dica: 'Antes de descartar, pergunte: "isso ainda pode virar outro projeto?"'
    },

    // ---------- B. Ferramentas ----------
    {
      id: 'painel-ferramentas', zona: 'ferramentas', nome: 'Painéis de ferramentas', icone: '🧰',
      modelo: 'painelPerfurado', pos: [0.45, 1.05, -2.645], parede: 'cinza', fixo: true,
      descricao: 'Painéis perfurados onde cada ferramenta tem o seu lugar.',
      aprender: 'Organização também se aprende: um espaço maker compartilhado só funciona quando todos encontram e devolvem as ferramentas.',
      dica: 'Devolver a ferramenta ao painel é cuidar do espaço coletivo.'
    },
    {
      id: 'martelo', zona: 'ferramentas', nome: 'Martelo', icone: '🔨',
      modelo: 'martelo', escala: 0.4, rotX: Math.PI / 2, pos: [0.15, 1.33, -2.6], parede: 'cinza', fixo: true,
      descricao: 'Ferramenta de impacto para pregar, encaixar e ajustar peças.',
      aprender: 'Usar o martelo ensina física na prática: alavanca, impulso e transferência de energia.',
      dica: 'Segure pela ponta do cabo, mantenha os dedos longe e use óculos de proteção.'
    },
    {
      id: 'chave-fenda', zona: 'ferramentas', nome: 'Chaves de fenda', icone: '🪛',
      modelo: 'chaveFenda', escala: 0.4, rotX: Math.PI / 2, pos: [0.55, 1.2, -2.6], parede: 'cinza', fixo: true,
      descricao: 'Chaves de fenda e Phillips de vários tamanhos.',
      aprender: 'Montar e desmontar com parafusos permite reaproveitar peças, fazer manutenção e entender como os objetos são construídos.',
      dica: 'Use a ponta do tamanho exato do parafuso para não espaná-lo.'
    },
    {
      id: 'caixa-ferramentas', zona: 'ferramentas', nome: 'Caixa de ferramentas', icone: '🧰',
      modelo: 'portaArmario', opcoes: { conteudo: 'ferramentas' }, pos: [2.3, 0.06, -2.195], parede: 'cinza', sobre: 'armario',
      descricao: 'Serrote, lixas, trena, alicates e estilete para marcenaria educacional.',
      aprender: 'Medir, serrar e lixar desenvolve precisão e paciência, e transforma retalhos de madeira em estruturas para os protótipos.',
      dica: 'Meça duas vezes, corte uma. E sempre com óculos de proteção!'
    },

    // ---------- C. Fabricação digital ----------
    {
      id: 'impressora-3d', zona: 'fabricacao', nome: 'Impressora 3D', icone: '🖨️',
      modelo: 'impressora3d', escala: 0.3, pos: [0.95, 0.9, -2.42], parede: 'cinza', sobre: 'balcao-fabricacao',
      descricao: 'Constrói objetos camada por camada derretendo filamento plástico (PLA).',
      aprender: 'Do modelo digital ao objeto físico: o estudante aprende modelagem 3D, fatiamento e geometria, e conhece as limitações reais da fabricação (suportes, preenchimento, tempo).',
      dica: 'Prefira o PLA, um plástico de origem vegetal, e reaproveite impressões que falharam como material de teste.',
      sim: {
        acao: 'Imprimir um vaso', tempo: '≈ 2h 30min', duracao: 9,
        passos: ['Modelando no computador…', 'Fatiando em camadas…', 'Aquecendo o bico a 200 °C…', 'Imprimindo camada por camada…', 'Esfriando a peça…']
      }
    },
    {
      id: 'cortadora-laser', zona: 'fabricacao', nome: 'Mini cortadora a laser', icone: '✨',
      modelo: 'laser', escala: 0.24, pos: [0.4, 0.9, -2.2], parede: 'cinza', sobre: 'balcao-fabricacao',
      descricao: 'Corta e grava madeira fina, papelão e acrílico com um feixe de luz concentrado.',
      aprender: 'Ensina desenho vetorial (2D), precisão e encaixes: com chapas planas se constroem objetos 3D, como o porquinho fatiado da vitrine.',
      dica: 'Nunca olhe diretamente para o feixe, mantenha a tampa fechada e não deixe a máquina ligada sozinha.',
      sim: {
        acao: 'Gravar uma estrela', tempo: '≈ 12 min', duracao: 8,
        passos: ['Desenhando o vetor…', 'Ajustando potência e velocidade…', 'Gravando a peça…', 'Retirando a peça…']
      }
    },
    {
      id: 'caneta-3d', zona: 'fabricacao', nome: 'Caneta 3D', icone: '🖊️',
      modelo: 'caneta3d', escala: 0.3, pos: [-0.12, 0.9, -2.2], parede: 'cinza', sobre: 'balcao-fabricacao',
      descricao: 'Uma "impressora 3D de mão" que desenha no ar com plástico derretido.',
      aprender: 'Desenvolve coordenação e criatividade, serve para reparos rápidos e mostra o princípio da impressão 3D sem computador.',
      dica: 'O bico esquenta! Use uma superfície protegida e não toque no plástico logo depois que ele sai.',
      sim: {
        acao: 'Desenhar uma espiral', tempo: '≈ 5 min', duracao: 7,
        passos: ['Aquecendo…', 'Desenhando no ar…', 'Esfriando…']
      }
    },
    {
      id: 'estacoes-computador', zona: 'fabricacao', nome: 'Estações de computador', icone: '🖥️',
      modelo: 'computadores', opcoes: { xs: [1.7, 0.6, -0.3, -1.7, -2.8] }, pos: [0, 0.74, 2.645], parede: 'azul', sobre: 'bancada-computadores',
      descricao: 'Cinco computadores para modelagem 3D, desenho vetorial, programação e pesquisa.',
      aprender: 'O computador é a ponte entre a imaginação e as máquinas: o desenho digital (ex.: Tinkercad, Inkscape) vira instruções para a impressora e a cortadora.',
      dica: 'Salve versões do arquivo (v1, v2, v3…). Uma ideia antiga pode salvar o projeto!'
    },

    // ---------- D. Eletrônica, robótica e tecnologias ----------
    {
      id: 'arduino', zona: 'eletronica', nome: 'Placa Arduino', icone: '🔌',
      modelo: 'arduino', escala: 0.25, pos: [-2.45, 0.9, -2.2], parede: 'cinza', sobre: 'balcao-eletronica',
      descricao: 'Microcontrolador programável: o "cérebro" de robôs e projetos interativos.',
      aprender: 'Conecta o mundo físico ao digital: o estudante programa (lógica, variáveis, laços) e vê o resultado acendendo LEDs, girando motores e lendo sensores.',
      dica: 'Desconecte o cabo USB antes de mexer nos fios do circuito.',
      sim: {
        acao: 'Rodar o código do semáforo', tempo: '≈ 30 min para montar e programar', duracao: 7,
        passos: ['Escrevendo o código…', 'Enviando para a placa…', 'Executando: verde → amarelo → vermelho!']
      }
    },
    {
      id: 'protoboard', zona: 'eletronica', nome: 'Circuitos e protoboard', icone: '🔋',
      modelo: 'protoboard', escala: 0.25, pos: [-1.95, 0.9, -2.2], parede: 'cinza', sobre: 'balcao-eletronica',
      descricao: 'Placa de ensaio para montar circuitos sem solda.',
      aprender: 'Permite experimentar, trocar componentes, errar e corrigir sem estragar nada. É ideal para entender corrente, tensão e resistência.',
      dica: 'Confira a polaridade do LED: a perna mais longa é o positivo (+).'
    },
    {
      id: 'kit-eletronico', zona: 'eletronica', nome: 'Kit de componentes', icone: '🧪',
      modelo: 'portaArmario', opcoes: { conteudo: 'kit' }, pos: [2.6, 0.06, -2.195], parede: 'cinza', sobre: 'armario',
      descricao: 'LEDs, resistores, botões, sensores, motores e jumpers organizados.',
      aprender: 'Conhecer cada componente é como aprender o alfabeto da eletrônica: combinados, eles formam qualquer projeto.',
      dica: 'Brinquedos e impressoras velhas guardam motores e sensores que podem ser reaproveitados!'
    },
    {
      id: 'drone-branco', zona: 'eletronica', nome: 'Drone com câmera', icone: '🛸',
      modelo: 'drone', opcoes: { cor: '#f1f3f5', detalhe: '#ffbe0b' }, pos: [-2.0, 0.9, -2.47], parede: 'cinza', sobre: 'balcao-eletronica',
      descricao: 'Drone compacto com câmera para fotos aéreas e mapeamento.',
      aprender: 'Drones juntam física (sustentação, equilíbrio), eletrônica e programação, e servem para registrar projetos de arquitetura e urbanismo vistos de cima.',
      dica: 'Voe sempre em área aberta e permitida, longe de pessoas e com a bateria carregada.'
    },
    {
      id: 'drone-vermelho', zona: 'eletronica', nome: 'Drone quadricóptero', icone: '🚁',
      modelo: 'drone', opcoes: { cor: '#1b1b1b', detalhe: '#e63946' }, pos: [-0.15, 0.9, -2.47], parede: 'cinza', sobre: 'balcao-fabricacao',
      descricao: 'Quadricóptero para estudar voo, controle e estabilização.',
      aprender: 'Quatro hélices girando em sentidos opostos equilibram o drone: um ótimo jeito de ver na prática as leis de Newton e o controle automático.',
      dica: 'Antes de decolar, confira hélices, bateria e o espaço ao redor.',
      sim: {
        acao: 'Simular um voo', tempo: '≈ 20 min de voo por bateria', duracao: 7,
        passos: ['Checando hélices e bateria…', 'Decolando…', 'Pairando e filmando…', 'Pousando com segurança…']
      }
    },
    {
      id: 'oculos-vr', zona: 'eletronica', nome: 'Óculos de realidade virtual', icone: '🥽',
      modelo: 'oculosVR', pos: [0.4, 0.9, -2.47], parede: 'cinza', sobre: 'balcao-fabricacao',
      descricao: 'Óculos e controles para experiências imersivas em realidade virtual.',
      aprender: 'Permitem "entrar" em maquetes e ambientes digitais antes de construí-los, como este simulador!',
      dica: 'Faça pausas a cada 20 minutos e use em um espaço livre de obstáculos.'
    },
    {
      id: 'camera', zona: 'eletronica', nome: 'Câmera fotográfica', icone: '📷',
      modelo: 'cameraFoto', pos: [-1.5, 0.9, -2.42], parede: 'cinza', sobre: 'balcao-eletronica',
      descricao: 'Câmera com tripé flexível para registrar o processo e os resultados dos projetos.',
      aprender: 'Documentar é parte do método maker: fotos e vídeos contam a história do projeto e ajudam outras pessoas a reproduzi-lo.',
      dica: 'Fotografe o "antes, durante e depois", e não só o resultado final.'
    },
    {
      id: 'tablet', zona: 'eletronica', nome: 'Tablet', icone: '📱',
      modelo: 'tablet', pos: [-2.6, 0.9, -2.47], parede: 'cinza', sobre: 'balcao-eletronica',
      descricao: 'Tablet para apresentações, apps educativos e controle de dispositivos.',
      aprender: 'Serve de controle remoto para drones e robôs e de vitrine digital para os projetos.',
      dica: 'Mantenha o tablet carregado e com os apps do laboratório atualizados.'
    },

    // ---------- E. Colagem e ideias ----------
    {
      id: 'quadro-branco', zona: 'colagem', nome: 'Quadro branco e mural de post-its', icone: '🗒️',
      modelo: 'quadroBranco', opcoes: { w: 3.0, h: 1.45 }, pos: [-3.77, 0.85, 0], parede: 'quadro', fixo: true,
      descricao: 'Quadro para aulas, brainstorms e recados, com um mural de notas autoadesivas.',
      aprender: 'Organizar ideias visualmente faz parte do design thinking e do trabalho em equipe. No quadro está uma aula de dilatação térmica: a física também vira projeto!',
      dica: 'Uma ideia por post-it! Assim dá para agrupar, reorganizar e votar nas melhores.'
    },
    {
      id: 'cola-branca', zona: 'colagem', nome: 'Cola branca', icone: '🥛',
      modelo: 'colaBranca', escala: 0.35, pos: [-3.5, 0.64, -1.05], parede: 'quadro', sobre: 'gaveteiro-colas',
      descricao: 'Cola atóxica à base d\'água.',
      aprender: 'Ideal para papel, papelão e madeira. Ensina paciência: a secagem leva tempo, mas a união fica forte.',
      dica: 'Use pouca cola e espalhe bem: o excesso deixa o papelão empenado.'
    },
    {
      id: 'cola-quente', zona: 'colagem', nome: 'Pistola de cola quente', icone: '🔥',
      modelo: 'colaQuente', escala: 0.35, pos: [-3.5, 0.64, -0.75], parede: 'quadro', sobre: 'gaveteiro-colas',
      descricao: 'Derrete bastões de cola para uma união quase instantânea.',
      aprender: 'Perfeita para prototipagem rápida: une materiais diferentes em segundos (papelão + E.V.A. + plástico).',
      dica: 'Apoie a pistola no suporte e cuidado com os fios de cola, que queimam! Atenção redobrada com isopor.'
    },
    {
      id: 'post-its', zona: 'colagem', nome: 'Notas autoadesivas (Post-it)', icone: '📝',
      modelo: 'blocoPostit', pos: [-3.5, 0.64, 0.9], parede: 'quadro', sobre: 'gaveteiro-postits',
      descricao: 'Blocos de post-it e canetas para registrar ideias e recados.',
      aprender: 'Escrever e colar ideias torna o pensamento visível e facilita a colaboração.',
      dica: 'Escreva com letra grande: o post-it precisa ser lido de longe.'
    },
    {
      id: 'mesas-colaborativas', zona: 'colagem', nome: 'Mesas colaborativas', icone: '🪑',
      modelo: 'mesasColaborativas', pos: [0.2, 0, -0.2],
      descricao: 'Quatro mesas unidas com dez lugares, no centro da sala.',
      aprender: 'É aqui que as equipes se encontram para planejar, recortar, colar e montar os protótipos juntas.',
      dica: 'Proteja a mesa com uma base de corte ou papelão antes de usar estilete ou cola quente.'
    },

    // ---------- F. Vitrine ----------
    {
      id: 'proj-lhama', zona: 'vitrine', nome: 'Lhama low-poly', icone: '🦙',
      modelo: 'lhama', escala: 0.8, pos: [-1.5, 1.435, 2.515], parede: 'azul', fixo: true,
      descricao: 'Escultura de papel em estilo low-poly (papercraft).',
      projeto: {
        exemplo: true,
        autor: 'Autoria a confirmar',
        objetivo: 'Transformar um modelo 3D digital em peça física usando apenas papel planificado.',
        materiais: ['Papel', 'Cola branca'],
        tecnologias: ['Modelagem 3D', 'Planificação']
      }
    },
    {
      id: 'proj-raposa', zona: 'vitrine', nome: 'Raposa low-poly', icone: '🦊',
      modelo: 'raposa', pos: [-0.85, 1.435, 2.515], parede: 'azul', fixo: true,
      descricao: 'Outra escultura facetada em papel, do mesmo estudo de formas.',
      projeto: {
        exemplo: true,
        autor: 'Autoria a confirmar',
        objetivo: 'Estudar geometria e planificação de sólidos com papel reaproveitado.',
        materiais: ['Papel', 'Cola branca'],
        tecnologias: ['Modelagem 3D', 'Planificação']
      }
    },
    {
      id: 'proj-potes', zona: 'vitrine', nome: 'Potes de luz', icone: '✨',
      modelo: 'potesLuz', pos: [-0.1, 1.435, 2.515], parede: 'azul', fixo: true,
      descricao: 'Luminárias feitas com potes de vidro reaproveitados e fios de LED.',
      projeto: {
        exemplo: true,
        autor: 'Autoria a confirmar',
        objetivo: 'Dar nova vida a embalagens de vidro com um circuito simples de iluminação.',
        materiais: ['Potes de vidro', 'Rolhas', 'Fio de LED'],
        tecnologias: ['Circuitos simples']
      }
    },
    {
      id: 'proj-relogio', zona: 'vitrine', nome: 'Relógio digital', icone: '⏰',
      modelo: 'relogio', pos: [-0.6, 1.835, 2.515], parede: 'azul', fixo: true,
      descricao: 'Relógio com caixa de madeira. Ele mostra a hora de verdade!',
      projeto: {
        exemplo: true,
        autor: 'Autoria a confirmar',
        objetivo: 'Integrar marcenaria e eletrônica em um objeto do dia a dia.',
        materiais: ['Madeira', 'Display', 'Componentes eletrônicos'],
        tecnologias: ['Arduino', 'Cortadora a laser']
      }
    },
    {
      id: 'proj-porquinho', zona: 'vitrine', nome: 'Porquinho fatiado', icone: '🐷',
      modelo: 'porquinho', pos: [1.8, 1.435, 2.515], parede: 'azul', fixo: true,
      descricao: 'Escultura montada com fatias de MDF encaixadas.',
      projeto: {
        exemplo: true,
        autor: 'Autoria a confirmar',
        objetivo: 'Aprender a fatiar um modelo 3D em camadas planas que se encaixam.',
        materiais: ['MDF reaproveitado'],
        tecnologias: ['Cortadora a laser', 'Modelagem 3D']
      }
    },
    {
      id: 'proj-triangulos', zona: 'vitrine', nome: 'Escultura de triângulos', icone: '🔺',
      modelo: 'triangulos', pos: [2.7, 1.435, 2.515], parede: 'azul', fixo: true,
      descricao: 'Peça decorativa com ripas em ziguezague.',
      projeto: {
        exemplo: true,
        autor: 'Autoria a confirmar',
        objetivo: 'Explorar ritmo, repetição e encaixes com ripas de madeira.',
        materiais: ['Retalhos de madeira'],
        tecnologias: ['Ferramentas manuais']
      }
    },
    {
      id: 'banner-ods', zona: 'vitrine', nome: 'Banner: ODS na comunidade acadêmica', icone: '🌍',
      modelo: 'poster', opcoes: { titulo: 'PROMOÇÃO DOS ODS NA COMUNIDADE ACADÊMICA: COMPROMISSO DA UNIVERSIDADE VEIGA DE ALMEIDA COM O PACTO GLOBAL DA ONU' },
      pos: [-2.4, 1.2, -2.645], parede: 'cinza', fixo: true,
      descricao: 'Banner de pesquisa sobre a promoção dos Objetivos de Desenvolvimento Sustentável (ODS) na universidade.',
      aprender: 'Os 17 ODS da ONU orientam os projetos do UVA Maker: cada protótipo pode responder a um desafio real de sustentabilidade.',
      dica: 'Ao começar um projeto, escolha qual ODS ele ajuda a alcançar.'
    },
    {
      id: 'banner-uva-maker', zona: 'vitrine', nome: 'Banner: UVA Maker e os ODS', icone: '📜',
      modelo: 'poster', opcoes: { titulo: 'UVA MAKER: FORMAÇÃO DE PROFISSIONAIS ENGAJADOS COM OS OBJETIVOS DO DESENVOLVIMENTO SUSTENTÁVEL' },
      pos: [-1.65, 1.2, -2.645], parede: 'cinza', fixo: true,
      descricao: 'Banner de pesquisa sobre o UVA Maker e a formação de profissionais engajados com o desenvolvimento sustentável.',
      aprender: 'Mostra como a cultura maker, com Feira Maker, oficinas e projetos, aproxima a formação acadêmica dos desafios da sociedade.',
      dica: 'Os resultados de pesquisa também são um projeto: compartilhe o que você aprendeu!'
    }
  ],

  // Mobiliário e decoração (não clicáveis). `parede` gira o objeto de frente para a sala.
  // Móveis com `id` (e sem `fixo`) podem ser arrastados no modo "Editar layout";
  // itens com `sobre: '<id do móvel>'` vão junto com ele.
  moveis: [
    { id: 'balcao-eletronica', nome: 'Balcão da eletrônica', tipo: 'balcao', pos: [-2.0, 0, -2.345], parede: 'cinza', w: 1.6 },
    { id: 'balcao-fabricacao', nome: 'Balcão da fabricação', tipo: 'balcao', pos: [0.45, 0, -2.345], parede: 'cinza', w: 1.6 },
    { id: 'armario', nome: 'Armário de insumos', tipo: 'armario', pos: [2.3, 0, -2.42], parede: 'cinza' },
    { tipo: 'logoUVA', pos: [-0.1, 2.2, -2.645], parede: 'cinza', fixo: true },
    { tipo: 'arCondicionado', pos: [-3.25, 2.3, -2.645], parede: 'cinza', fixo: true },
    { id: 'gaveteiro-colas', nome: 'Gaveteiro das colas', tipo: 'gaveteiro', pos: [-3.5, 0, -0.9], parede: 'quadro' },
    { id: 'gaveteiro-postits', nome: 'Gaveteiro dos post-its', tipo: 'gaveteiro', pos: [-3.5, 0, 0.9], parede: 'quadro' },
    { id: 'bancada-computadores', nome: 'Bancada dos computadores', tipo: 'bancadaComputadores', pos: [0, 0, 2.645], parede: 'azul', segmentos: [[-0.75, 2.2], [-3.55, -1.15]] },
    { id: 'cadeira-pc-1', nome: 'Cadeira azul', tipo: 'cadeira', pos: [-1.7, 0, 1.8], cor: '#3f86c6' },
    { id: 'cadeira-pc-2', nome: 'Cadeira azul', tipo: 'cadeira', pos: [-0.6, 0, 1.8], cor: '#3f86c6' },
    { id: 'cadeira-pc-3', nome: 'Cadeira azul', tipo: 'cadeira', pos: [0.3, 0, 1.8], cor: '#3f86c6' },
    { id: 'cadeira-pc-4', nome: 'Cadeira azul', tipo: 'cadeira', pos: [1.7, 0, 1.8], cor: '#3f86c6' },
    { id: 'cadeira-pc-5', nome: 'Cadeira azul', tipo: 'cadeira', pos: [2.8, 0, 1.8], cor: '#3f86c6' },
    { tipo: 'prateleiraParede', pos: [-0.6, 0, 2.645], parede: 'azul', fixo: true, w: 2.7, alturas: [1.4, 1.8, 2.2] },
    { tipo: 'prateleiraParede', pos: [2.275, 0, 2.645], parede: 'azul', fixo: true, w: 2.25, alturas: [1.4, 1.8, 2.2] },
    { tipo: 'vaso', pos: [-1.5, 2.235, 2.515], parede: 'azul', fixo: true },
    { tipo: 'telaTripe', pos: [-0.3, 2.235, 2.515], parede: 'azul', fixo: true },
    { tipo: 'luminaria', pos: [2.0, 2.235, 2.515], parede: 'azul', fixo: true }
  ]
};
