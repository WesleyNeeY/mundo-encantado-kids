/* Conteúdo do Lumi: 6 mundos, 60 fases (aulas de palavras + fases de jogo), comidas e acessórios */
(function () {
  // "Inglês|português|emoji"  (emoji começando com # vira número/texto na figura)
  const W = (list) => list.map((s) => { const [en, pt, img] = s.split('|'); return img[0] === '#' ? { en, pt, txt: img.slice(1) } : { en, pt, img }; });
  const L = (id, name, icon, words) => ({ id, type: 'lesson', name, icon, words: W(words) });
  const G = (id, name, game, pool) => ({ id, type: 'game', game, name, icon: { balloon: '🎈', simon: '🙌', feed: '🍽️', memory: '🃏', yesno: '👍' }[game], pool });

  const worlds = [
    { id: 'ilha', name: 'Ilha do Lumi', icon: '🏝️', color: '#2f86ff', welcome: 'Bem-vindo à Ilha do Lumi!', units: [
      L('first', 'Primeiras palavras', '🌟', ['Sun|sol|☀️', 'Moon|lua|🌙', 'Star|estrela|⭐', 'Ball|bola|⚽', 'Book|livro|📚', 'House|casa|🏠']),
      L('greet', 'Saudações', '👋', ['Hello|olá|👋', 'Good morning|bom dia|🌅', 'Good night|boa noite|😴', 'Thank you|obrigado|🙏', 'Yes|sim|👍', 'No|não|👎', 'I love you|eu te amo|🥰']),
      L('colors', 'Cores', '🎨', ['Red|vermelho|🔴', 'Blue|azul|🔵', 'Green|verde|🟢', 'Yellow|amarelo|🟡', 'Orange|laranja|🟠', 'Purple|roxo|🟣', 'Black|preto|⚫', 'White|branco|⚪', 'Brown|marrom|🟤']),
      L('numbers', 'Números 1 a 6', '🔢', ['One|um|#1', 'Two|dois|#2', 'Three|três|#3', 'Four|quatro|#4', 'Five|cinco|#5', 'Six|seis|#6']),
      G('g-balloon-1', 'Estoura balão', 'balloon', ['colors', 'numbers']),
      L('body', 'Meu corpo', '👀', ['Eyes|olhos|👀', 'Ear|orelha|👂', 'Nose|nariz|👃', 'Mouth|boca|👄', 'Hand|mão|✋', 'Foot|pé|🦶', 'Teeth|dentes|🦷', 'Tongue|língua|👅']),
      L('family', 'Família', '🏡', ['Mom|mamãe|👩', 'Dad|papai|👨', 'Baby|bebê|👶', 'Grandma|vovó|👵', 'Grandpa|vovô|👴', 'Brother|irmão|👦', 'Sister|irmã|👧']),
      L('toys', 'Brinquedos', '🧸', ['Teddy bear|ursinho|🧸', 'Car|carro|🚗', 'Kite|pipa|🪁', 'Balloon|balão|🎈', 'Drum|tambor|🥁', 'Robot|robô|🤖', 'Puzzle|quebra-cabeça|🧩']),
      L('numbers2', 'Números 7 a 12', '🔟', ['Seven|sete|#7', 'Eight|oito|#8', 'Nine|nove|#9', 'Ten|dez|#10', 'Eleven|onze|#11', 'Twelve|doze|#12']),
      G('g-simon-1', 'Lumi diz', 'simon', ['basic']),
    ] },
    { id: 'fazenda', name: 'Fazenda', icon: '🐮', color: '#2fb35a', welcome: 'Bem-vindo à Fazenda!', units: [
      L('animals', 'Animais', '🐶', ['Dog|cachorro|🐶', 'Cat|gato|🐱', 'Bird|pássaro|🐦', 'Fish|peixe|🐟', 'Cow|vaca|🐮', 'Duck|pato|🦆', 'Lion|leão|🦁', 'Rabbit|coelho|🐰']),
      L('fruits', 'Frutas', '🍎', ['Apple|maçã|🍎', 'Banana|banana|🍌', 'Grapes|uva|🍇', 'Strawberry|morango|🍓', 'Orange|laranja|🍊', 'Watermelon|melancia|🍉', 'Pineapple|abacaxi|🍍']),
      L('farm', 'Bichos da fazenda', '🐷', ['Pig|porco|🐷', 'Horse|cavalo|🐴', 'Chicken|galinha|🐔', 'Sheep|ovelha|🐑', 'Goat|bode|🐐', 'Rooster|galo|🐓', 'Turkey|peru|🦃', 'Mouse|rato|🐭']),
      L('veggies', 'Legumes', '🥕', ['Carrot|cenoura|🥕', 'Corn|milho|🌽', 'Tomato|tomate|🍅', 'Potato|batata|🥔', 'Broccoli|brócolis|🥦', 'Pepper|pimentão|🫑', 'Onion|cebola|🧅', 'Cucumber|pepino|🥒']),
      G('g-feed-1', 'Dar comida', 'feed', ['fruits', 'veggies']),
      L('nature', 'Natureza', '🌳', ['Tree|árvore|🌳', 'Flower|flor|🌸', 'Rain|chuva|🌧️', 'Cloud|nuvem|☁️', 'Rainbow|arco-íris|🌈', 'Mountain|montanha|⛰️']),
      L('fruits2', 'Mais frutas', '🍒', ['Lemon|limão|🍋', 'Cherries|cerejas|🍒', 'Pear|pera|🍐', 'Peach|pêssego|🍑', 'Mango|manga|🥭', 'Coconut|coco|🥥', 'Kiwi|kiwi|🥝', 'Melon|melão|🍈']),
      L('weather', 'O tempo', '⛈️', ['Hot|calor|🥵', 'Cold|frio|🥶', 'Snow|neve|❄️', 'Wind|vento|🌬️', 'Storm|tempestade|⛈️', 'Lightning|raio|⚡', 'Snowman|boneco de neve|⛄', 'Umbrella|guarda-chuva|☂️']),
      L('bugs', 'Bichinhos', '🐞', ['Bee|abelha|🐝', 'Butterfly|borboleta|🦋', 'Ant|formiga|🐜', 'Ladybug|joaninha|🐞', 'Spider|aranha|🕷️', 'Snail|caracol|🐌', 'Worm|minhoca|🪱', 'Caterpillar|lagarta|🐛']),
      G('g-memory-1', 'Certo ou errado', 'yesno', ['animals', 'farm', 'bugs']),
    ] },
    { id: 'casa', name: 'Casa', icon: '🏠', color: '#ff8a1f', welcome: 'Bem-vindo à Casa do Lumi!', units: [
      L('house', 'Minha casa', '🚪', ['Door|porta|🚪', 'Window|janela|🪟', 'Bed|cama|🛏️', 'Chair|cadeira|🪑', 'Sofa|sofá|🛋️', 'Toilet|privada|🚽', 'Bathtub|banheira|🛁', 'Mirror|espelho|🪞']),
      L('kitchen', 'Cozinha', '🥄', ['Cup|xícara|☕', 'Plate|prato|🍽️', 'Spoon|colher|🥄', 'Knife|faca|🔪', 'Bowl|tigela|🥣', 'Teapot|bule|🫖']),
      L('breakfast', 'Café da manhã', '🥛', ['Bread|pão|🍞', 'Milk|leite|🥛', 'Egg|ovo|🥚', 'Cheese|queijo|🧀', 'Butter|manteiga|🧈', 'Juice|suco|🧃', 'Cookie|biscoito|🍪', 'Cake|bolo|🍰']),
      L('clothes', 'Roupas', '👕', ['Shirt|camiseta|👕', 'Pants|calça|👖', 'Dress|vestido|👗', 'Shoes|tênis|👟', 'Cap|boné|🧢', 'Socks|meias|🧦', 'Coat|casaco|🧥', 'Gloves|luvas|🧤']),
      G('g-balloon-2', 'Certo ou errado', 'yesno', ['house', 'kitchen', 'clothes']),
      L('meals', 'Comidas', '🍕', ['Pizza|pizza|🍕', 'Hamburger|hambúrguer|🍔', 'Sandwich|sanduíche|🥪', 'Rice|arroz|🍚', 'Soup|sopa|🍲', 'Ice cream|sorvete|🍦', 'Candy|bala|🍬', 'Chocolate|chocolate|🍫', 'Popcorn|pipoca|🍿']),
      L('things', 'Coisas de casa', '⏰', ['Clock|relógio|⏰', 'Key|chave|🔑', 'Phone|telefone|📱', 'Television|televisão|📺', 'Light bulb|lâmpada|💡', 'Gift|presente|🎁', 'Camera|câmera|📷', 'Bag|bolsa|👜']),
      L('clean', 'Hora do banho', '🧼', ['Toothbrush|escova de dente|🪥', 'Soap|sabonete|🧼', 'Shower|chuveiro|🚿', 'Sponge|esponja|🧽', 'Broom|vassoura|🧹', 'Bucket|balde|🪣', 'Basket|cesto|🧺']),
      L('shapes', 'Formas', '🔺', ['Circle|círculo|⭕', 'Square|quadrado|🟦', 'Triangle|triângulo|🔺', 'Heart|coração|❤️', 'Diamond|losango|🔷', 'Star|estrela|⭐']),
      G('g-feed-2', 'Dar comida', 'feed', ['breakfast', 'meals', 'fruits']),
    ] },
    { id: 'escola', name: 'Escola', icon: '🏫', color: '#8a55ff', welcome: 'Bem-vindo à Escola!', units: [
      L('school', 'Material escolar', '✏️', ['Pencil|lápis|✏️', 'Crayon|giz de cera|🖍️', 'Scissors|tesoura|✂️', 'Backpack|mochila|🎒', 'Ruler|régua|📏', 'Notebook|caderno|📓', 'Paintbrush|pincel|🖌️', 'Teacher|professora|🧑‍🏫']),
      L('actions', 'Ações', '🏃', ['Run|correr|🏃', 'Swim|nadar|🏊', 'Dance|dançar|💃', 'Sing|cantar|🎤', 'Read|ler|📖', 'Write|escrever|✍️', 'Sleep|dormir|🛌', 'Climb|escalar|🧗']),
      L('feelings', 'Sentimentos', '😀', ['Happy|feliz|😀', 'Sad|triste|😢', 'Angry|bravo|😠', 'Scared|com medo|😨', 'Tired|cansado|😫', 'Surprised|surpreso|😮', 'Sick|doente|🤒', 'Silly|bobinho|🤪']),
      L('numbers3', 'Números 13 a 20', '🔢', ['Thirteen|treze|#13', 'Fourteen|catorze|#14', 'Fifteen|quinze|#15', 'Sixteen|dezesseis|#16', 'Seventeen|dezessete|#17', 'Eighteen|dezoito|#18', 'Nineteen|dezenove|#19', 'Twenty|vinte|#20']),
      G('g-simon-2', 'Lumi diz', 'simon', ['basic', 'more']),
      L('music', 'Música', '🎸', ['Guitar|violão|🎸', 'Piano|piano|🎹', 'Trumpet|trompete|🎺', 'Violin|violino|🎻', 'Saxophone|saxofone|🎷', 'Bell|sino|🔔']),
      L('sports', 'Esportes', '🏀', ['Basketball|basquete|🏀', 'Tennis|tênis|🎾', 'Baseball|beisebol|⚾', 'Volleyball|vôlei|🏐', 'Bike|bicicleta|🚲', 'Skateboard|skate|🛹', 'Medal|medalha|🏅', 'Trophy|troféu|🏆']),
      L('jobs', 'Profissões', '👩‍⚕️', ['Doctor|médica|🧑‍⚕️', 'Police officer|policial|👮', 'Firefighter|bombeiro|🧑‍🚒', 'Cook|cozinheiro|🧑‍🍳', 'Farmer|fazendeiro|🧑‍🌾', 'Astronaut|astronauta|🧑‍🚀', 'Artist|artista|🧑‍🎨', 'Pilot|piloto|🧑‍✈️']),
      L('seasons', 'Estações e festas', '🎂', ['Spring|primavera|🌷', 'Summer|verão|🏖️', 'Autumn|outono|🍂', 'Winter|inverno|☃️', 'Birthday|aniversário|🎂', 'Party|festa|🎉', 'Christmas|natal|🎄', 'Fireworks|fogos|🎆']),
      G('g-memory-2', 'Jogo da memória', 'memory', ['school', 'music', 'sports']),
    ] },
    { id: 'selva', name: 'Mar e Selva', icon: '🐳', color: '#10b5c9', welcome: 'Bem-vindo ao Mar e à Selva!', units: [
      L('sea', 'Fundo do mar', '🐳', ['Whale|baleia|🐳', 'Dolphin|golfinho|🐬', 'Shark|tubarão|🦈', 'Octopus|polvo|🐙', 'Crab|caranguejo|🦀', 'Turtle|tartaruga|🐢', 'Seal|foca|🦭', 'Shell|concha|🐚']),
      L('beach', 'Praia', '🏖️', ['Wave|onda|🌊', 'Boat|barco|⛵', 'Island|ilha|🏝️', 'Sunglasses|óculos escuros|🕶️', 'Swimsuit|maiô|🩱', 'Palm tree|coqueiro|🌴', 'Anchor|âncora|⚓', 'Castle|castelo|🏰']),
      L('jungle', 'Selva', '🐒', ['Tiger|tigre|🐯', 'Elephant|elefante|🐘', 'Monkey|macaco|🐒', 'Giraffe|girafa|🦒', 'Zebra|zebra|🦓', 'Snake|cobra|🐍', 'Crocodile|jacaré|🐊', 'Parrot|papagaio|🦜']),
      L('transport', 'Transportes', '🚌', ['Bus|ônibus|🚌', 'Train|trem|🚂', 'Airplane|avião|✈️', 'Helicopter|helicóptero|🚁', 'Truck|caminhão|🚚', 'Ship|navio|🚢', 'Motorcycle|moto|🏍️', 'Taxi|táxi|🚕']),
      G('g-balloon-3', 'Estoura balão', 'balloon', ['sea', 'jungle', 'transport']),
      L('forest', 'Floresta', '🦊', ['Bear|urso|🐻', 'Fox|raposa|🦊', 'Wolf|lobo|🐺', 'Owl|coruja|🦉', 'Deer|veado|🦌', 'Squirrel|esquilo|🐿️', 'Frog|sapo|🐸', 'Hedgehog|ouriço|🦔']),
      L('zoo', 'Zoológico', '🐼', ['Penguin|pinguim|🐧', 'Koala|coala|🐨', 'Panda|panda|🐼', 'Kangaroo|canguru|🦘', 'Camel|camelo|🐪', 'Flamingo|flamingo|🦩', 'Peacock|pavão|🦚', 'Hippo|hipopótamo|🦛']),
      L('places', 'Lugares', '🏥', ['Hospital|hospital|🏥', 'School|escola|🏫', 'Store|loja|🏪', 'Tent|barraca|⛺', 'Bridge|ponte|🌉', 'Fountain|chafariz|⛲', 'Ferris wheel|roda-gigante|🎡', 'Church|igreja|⛪']),
      L('fantasy', 'Fantasia', '🦄', ['Dinosaur|dinossauro|🦕', 'Dragon|dragão|🐉', 'Unicorn|unicórnio|🦄', 'Volcano|vulcão|🌋', 'Cactus|cacto|🌵', 'Ghost|fantasma|👻', 'Alien|alienígena|👽', 'Fairy|fada|🧚']),
      G('g-memory-3', 'Jogo da memória', 'memory', ['forest', 'zoo', 'fantasy']),
    ] },
    { id: 'espaco', name: 'Espaço', icon: '🚀', color: '#3b3fd1', welcome: 'Bem-vindo ao Espaço!', units: [
      L('space', 'Espaço', '🚀', ['Rocket|foguete|🚀', 'Planet|planeta|🪐', 'Earth|Terra|🌍', 'Comet|cometa|☄️', 'Satellite|satélite|🛰️', 'Telescope|telescópio|🔭', 'UFO|disco voador|🛸', 'Galaxy|galáxia|🌌']),
      L('bignumbers', 'Números grandes', '💯', ['Thirty|trinta|#30', 'Forty|quarenta|#40', 'Fifty|cinquenta|#50', 'Sixty|sessenta|#60', 'Seventy|setenta|#70', 'Eighty|oitenta|#80', 'Ninety|noventa|#90', 'One hundred|cem|#100']),
      L('phrases', 'Frases educadas', '🙏', ['Please|por favor|🥺', 'Sorry|desculpa|😔', 'Excuse me|com licença|🙋', "Let's play|vamos brincar|🎮", 'Good job|muito bem|👏', "I'm hungry|estou com fome|😋", "I'm sleepy|estou com sono|🥱", 'Goodbye|tchau|👋']),
      L('desserts', 'Doces', '🧁', ['Donut|rosquinha|🍩', 'Cupcake|bolinho|🧁', 'Pie|torta|🥧', 'Honey|mel|🍯', 'Lollipop|pirulito|🍭', 'Pancakes|panquecas|🥞', 'Waffle|waffle|🧇', 'Pretzel|pretzel|🥨']),
      G('g-feed-3', 'Certo ou errado', 'yesno', ['desserts', 'breakfast', 'fruits2']),
      L('explorer', 'Kit do explorador', '🧭', ['Map|mapa|🗺️', 'Compass|bússola|🧭', 'Flashlight|lanterna|🔦', 'Magnet|ímã|🧲', 'Hammer|martelo|🔨', 'Ladder|escada|🪜', 'Lock|cadeado|🔒', 'Rope|corda|🪢']),
      L('elements', 'Elementos', '🔥', ['Fire|fogo|🔥', 'Water|água|💧', 'Ice|gelo|🧊', 'Rock|pedra|🪨', 'Leaf|folha|🍃', 'Sunflower|girassol|🌻', 'Rose|rosa|🌹', 'Seed|semente|🌱']),
      L('body2', 'Mais do corpo', '💪', ['Arm|braço|💪', 'Leg|perna|🦵', 'Brain|cérebro|🧠', 'Bone|osso|🦴', 'Finger|dedo|☝️', 'Footprints|pegadas|👣']),
      L('fun', 'Diversão', '🎪', ['Circus|circo|🎪', 'Clown|palhaço|🤡', 'Magic wand|varinha mágica|🪄', 'Dice|dado|🎲', 'Piñata|piñata|🪅', 'Confetti|confete|🎊', 'Yo-yo|ioiô|🪀']),
      G('g-balloon-4', 'Grande final', 'balloon', ['space', 'desserts', 'elements', 'fun']),
    ] },
  ];

  // comandos do "Lumi diz" (act = animação do Lumi 3D; key = palavra que o microfone procura)
  const simon = {
    basic: [
      { en: 'Jump!', pt: 'Pula!', img: '🦘', act: 'jump', key: 'jump' },
      { en: 'Clap your hands!', pt: 'Bate palmas!', img: '👏', act: 'clap', key: 'clap' },
      { en: 'Wave hello!', pt: 'Dá tchauzinho!', img: '👋', act: 'wave', key: 'wave' },
      { en: 'Turn around!', pt: 'Dá uma voltinha!', img: '🔄', act: 'spin', key: 'turn' },
      { en: 'Touch your nose!', pt: 'Toca no nariz!', img: '👃', act: 'nose', key: 'nose' },
      { en: 'Touch your head!', pt: 'Toca na cabeça!', img: '🙆', act: 'head', key: 'head' },
      { en: 'Dance!', pt: 'Dança!', img: '💃', act: 'dance', key: 'dance' },
      { en: 'Sleep!', pt: 'Dorme!', img: '😴', act: 'sleep', key: 'sleep' },
    ],
    more: [
      { en: 'Run!', pt: 'Corre!', img: '🏃', act: 'run', key: 'run' },
      { en: 'Stomp your feet!', pt: 'Bate os pés!', img: '🦶', act: 'stomp', key: 'stomp' },
      { en: 'Sit down!', pt: 'Senta!', img: '🪑', act: 'sit', key: 'sit' },
      { en: 'Stretch!', pt: 'Espreguiça!', img: '🙌', act: 'stretch', key: 'stretch' },
      { en: 'Wiggle!', pt: 'Rebola!', img: '🕺', act: 'wiggle', key: 'wiggle' },
      { en: 'Eat!', pt: 'Come!', img: '😋', act: 'eat', key: 'eat' },
    ],
  };
  // cor real dos balões das cores
  const colorHex = { Red: '#ff3b4e', Blue: '#2f7bff', Green: '#2fc46a', Yellow: '#ffd21f', Orange: '#ff8a1f', Purple: '#9a55ff', Black: '#2a2a35', White: '#ffffff', Brown: '#9a5b2e' };

  const units = [];
  worlds.forEach((w, wi) => w.units.forEach((u, ui) => { u.world = w.id; u.wi = wi; u.num = units.length + 1; units.push(u); }));
  units.forEach((u) => { if (u.words) u.words.forEach((x) => { if (u.id === 'colors' && colorHex[x.en]) x.color = colorHex[x.en]; }); });

  window.LUMI_DATA = {
    worlds, units, simon, colorHex,
    foods: [
      { id: 'apple', en: 'Apple', pt: 'Maçã', img: '🍎', price: 20, energy: 20 },
      { id: 'banana', en: 'Banana', pt: 'Banana', img: '🍌', price: 15, energy: 15 },
      { id: 'cookie', en: 'Cookie', pt: 'Biscoito', img: '🍪', price: 10, energy: 10 },
      { id: 'milk', en: 'Milk', pt: 'Leite', img: '🥛', price: 15, energy: 15 },
      { id: 'carrot', en: 'Carrot', pt: 'Cenoura', img: '🥕', price: 10, energy: 12 },
      { id: 'cake', en: 'Cake', pt: 'Bolo', img: '🍰', price: 40, energy: 40 },
    ],
    shop: {
      costume: [
        { id: 'none', pt: 'Sem fantasia', en: '', price: 0 },
        { id: 'bear', pt: 'Ursinho', en: 'Bear costume', price: 180 },
        { id: 'bunny', pt: 'Coelhinho', en: 'Bunny costume', price: 180 },
        { id: 'cat', pt: 'Gatinho', en: 'Cat costume', price: 180 },
        { id: 'frog', pt: 'Sapinho', en: 'Frog costume', price: 200 },
        { id: 'chick', pt: 'Pintinho', en: 'Chick costume', price: 200 },
        { id: 'panda', pt: 'Panda', en: 'Panda costume', price: 250 },
        { id: 'tiger', pt: 'Tigre', en: 'Tiger costume', price: 250 },
        { id: 'dino', pt: 'Dinossauro', en: 'Dinosaur costume', price: 300 },
        { id: 'shark', pt: 'Tubarão', en: 'Shark costume', price: 300 },
        { id: 'unicorn', pt: 'Unicórnio', en: 'Unicorn costume', price: 350 },
      ],
      body: [
        { id: 'none', pt: 'Sem camiseta', en: '', price: 0 },
        { id: 'tee-red', pt: 'Camiseta de estrela', en: 'Red T-shirt', price: 40 },
        { id: 'tee-yellow', pt: 'Camiseta do raio', en: 'Yellow T-shirt', price: 40 },
        { id: 'tee-green', pt: 'Camiseta listrada', en: 'Striped T-shirt', price: 50 },
        { id: 'tee-pink', pt: 'Camiseta de coração', en: 'Pink T-shirt', price: 50 },
        { id: 'jersey', pt: 'Camisa de futebol', en: 'Soccer shirt', price: 90 },
        { id: 'tee-rainbow', pt: 'Camiseta arco-íris', en: 'Rainbow T-shirt', price: 90 },
        { id: 'pajama', pt: 'Pijama', en: 'Pajamas', price: 80 },
        { id: 'hoodie', pt: 'Moletom', en: 'Hoodie', price: 110 },
        { id: 'dress', pt: 'Vestido', en: 'Dress', price: 120 },
        { id: 'hero', pt: 'Roupa de herói', en: 'Superhero suit', price: 150 },
      ],
      legs: [
        { id: 'none', pt: 'Sem calça', en: '', price: 0 },
        { id: 'shorts', pt: 'Bermuda', en: 'Shorts', price: 40 },
        { id: 'jeans', pt: 'Calça jeans', en: 'Jeans', price: 60 },
        { id: 'skirt', pt: 'Saia', en: 'Skirt', price: 60 },
        { id: 'pj-pants', pt: 'Calça de pijama', en: 'Pajama pants', price: 60 },
        { id: 'tutu', pt: 'Saia de bailarina', en: 'Tutu', price: 90 },
        { id: 'overalls', pt: 'Jardineira', en: 'Overalls', price: 100 },
      ],
      head: [
        { id: 'none', pt: 'Sem chapéu', en: '', price: 0 },
        { id: 'bow', pt: 'Laço', en: 'Bow', price: 40 },
        { id: 'cap', pt: 'Boné azul', en: 'Cap', price: 50 },
        { id: 'party', pt: 'Chapéu de festa', en: 'Party hat', price: 60 },
        { id: 'flowers', pt: 'Coroa de flores', en: 'Flower crown', price: 70 },
        { id: 'explorer', pt: 'Chapéu de explorador', en: 'Explorer hat', price: 80 },
        { id: 'chef', pt: 'Chapéu de chef', en: 'Chef hat', price: 90 },
        { id: 'headphones', pt: 'Fone de ouvido', en: 'Headphones', price: 90 },
        { id: 'pirate', pt: 'Chapéu de pirata', en: 'Pirate hat', price: 100 },
        { id: 'cowboy', pt: 'Chapéu de caubói', en: 'Cowboy hat', price: 110 },
        { id: 'propeller', pt: 'Boné de hélice', en: 'Propeller hat', price: 120 },
        { id: 'wizard', pt: 'Chapéu de mago', en: 'Wizard hat', price: 120 },
        { id: 'tiara', pt: 'Tiara de princesa', en: 'Tiara', price: 130 },
        { id: 'crown', pt: 'Coroa', en: 'Crown', price: 150 },
        { id: 'astronaut', pt: 'Capacete de astronauta', en: 'Space helmet', price: 220 },
      ],
      face: [
        { id: 'none', pt: 'Sem óculos', en: '', price: 0 },
        { id: 'mustache', pt: 'Bigode', en: 'Mustache', price: 50 },
        { id: 'glasses', pt: 'Óculos', en: 'Glasses', price: 70 },
        { id: 'hearts', pt: 'Óculos de coração', en: 'Heart glasses', price: 80 },
        { id: 'stars', pt: 'Óculos de estrela', en: 'Star glasses', price: 80 },
        { id: 'sunglasses', pt: 'Óculos escuros', en: 'Sunglasses', price: 90 },
        { id: 'mask', pt: 'Máscara de herói', en: 'Hero mask', price: 100 },
      ],
      back: [
        { id: 'none', pt: 'Nada nas costas', en: '', price: 0 },
        { id: 'backpack', pt: 'Mochila', en: 'Backpack', price: 80 },
        { id: 'cape-red', pt: 'Capa de herói', en: 'Hero cape', price: 120 },
        { id: 'cape-purple', pt: 'Capa de mago', en: 'Wizard cape', price: 140 },
        { id: 'turtle', pt: 'Casco de tartaruga', en: 'Turtle shell', price: 150 },
        { id: 'wings-fairy', pt: 'Asas de fada', en: 'Fairy wings', price: 180 },
        { id: 'wings-angel', pt: 'Asas de anjo', en: 'Angel wings', price: 180 },
        { id: 'wings-bat', pt: 'Asas de morcego', en: 'Bat wings', price: 180 },
        { id: 'jetpack', pt: 'Mochila foguete', en: 'Jetpack', price: 260 },
      ],
      neck: [
        { id: 'none', pt: 'Nada', en: '', price: 0 },
        { id: 'bowtie', pt: 'Gravata borboleta', en: 'Bow tie', price: 50 },
        { id: 'tie', pt: 'Gravata', en: 'Tie', price: 50 },
        { id: 'scarf', pt: 'Cachecol', en: 'Scarf', price: 60 },
        { id: 'lei', pt: 'Colar de flores', en: 'Flower necklace', price: 70 },
        { id: 'medal', pt: 'Medalha', en: 'Medal', price: 90 },
      ],
    },
    // coleções lendárias: não estão à venda, só saem em baús
    legendary: [
      { id: 'princess', name: 'Princesa das Estrelas', icon: '✨', fx: 'sparkle', fxName: 'brilho de estrelas', items: [
        { slot: 'head', id: 'crystal-tiara', pt: 'Tiara de cristal', en: 'Crystal tiara', rarity: 'raro' },
        { slot: 'neck', id: 'star-necklace', pt: 'Colar de estrela', en: 'Star necklace', rarity: 'raro' },
        { slot: 'body', id: 'star-dress', pt: 'Vestido das estrelas', en: 'Star dress', rarity: 'epico' },
        { slot: 'back', id: 'light-wings', pt: 'Asas de luz', en: 'Wings of light', rarity: 'lendario' } ] },
      { id: 'hero', name: 'Herói Relâmpago', icon: '⚡', fx: 'bolt', fxName: 'raios em volta', items: [
        { slot: 'face', id: 'bolt-mask', pt: 'Máscara relâmpago', en: 'Lightning mask', rarity: 'raro' },
        { slot: 'legs', id: 'hero-boots', pt: 'Botas de herói', en: 'Hero boots', rarity: 'raro' },
        { slot: 'body', id: 'bolt-suit', pt: 'Uniforme relâmpago', en: 'Lightning suit', rarity: 'epico' },
        { slot: 'back', id: 'glow-cape', pt: 'Capa brilhante', en: 'Shining cape', rarity: 'lendario' } ] },
      { id: 'pirate', name: 'Pirata dos Mares', icon: '🏴‍☠️', fx: 'coins', fxName: 'moedas de ouro', items: [
        { slot: 'face', id: 'eyepatch', pt: 'Tapa-olho', en: 'Eye patch', rarity: 'raro' },
        { slot: 'body', id: 'pirate-coat', pt: 'Casaco de capitão', en: 'Captain coat', rarity: 'epico' },
        { slot: 'head', id: 'captain-hat', pt: 'Chapéu de capitão', en: 'Captain hat', rarity: 'epico' },
        { slot: 'back', id: 'parrot', pt: 'Papagaio amigo', en: 'Parrot friend', rarity: 'lendario' } ] },
      { id: 'space', name: 'Astronauta Galáctico', icon: '🚀', fx: 'planets', fxName: 'planetas girando', items: [
        { slot: 'neck', id: 'comet-pendant', pt: 'Pingente de cometa', en: 'Comet pendant', rarity: 'raro' },
        { slot: 'body', id: 'space-suit', pt: 'Traje espacial', en: 'Space suit', rarity: 'epico' },
        { slot: 'back', id: 'rocket-pack', pt: 'Foguete nas costas', en: 'Rocket pack', rarity: 'epico' },
        { slot: 'head', id: 'galaxy-helmet', pt: 'Capacete da galáxia', en: 'Galaxy helmet', rarity: 'lendario' } ] },
      { id: 'ninja', name: 'Ninja da Folha', icon: '🥷', fx: 'leaves', fxName: 'redemoinho de folhas', items: [
        { slot: 'head', id: 'ninja-band', pt: 'Faixa ninja', en: 'Ninja headband', rarity: 'raro' },
        { slot: 'face', id: 'ninja-mask', pt: 'Máscara ninja', en: 'Ninja mask', rarity: 'epico' },
        { slot: 'body', id: 'ninja-gi', pt: 'Roupa ninja', en: 'Ninja suit', rarity: 'epico' },
        { slot: 'back', id: 'leaf-cape', pt: 'Capa de folhas', en: 'Leaf cape', rarity: 'lendario' } ] },
      { id: 'mermaid', name: 'Sereia do Mar', icon: '🧜', fx: 'bubbles', fxName: 'bolhas mágicas', items: [
        { slot: 'head', id: 'shell-crown', pt: 'Coroa de conchas', en: 'Shell crown', rarity: 'raro' },
        { slot: 'neck', id: 'pearl-necklace', pt: 'Colar de pérolas', en: 'Pearl necklace', rarity: 'raro' },
        { slot: 'body', id: 'shell-top', pt: 'Blusa de conchas', en: 'Shell top', rarity: 'epico' },
        { slot: 'legs', id: 'mermaid-tail', pt: 'Cauda de sereia', en: 'Mermaid tail', rarity: 'lendario' } ] },
      { id: 'dragon', name: 'Dragão de Fogo', icon: '🐉', fx: 'fire', fxName: 'faíscas de fogo', items: [
        { slot: 'neck', id: 'dragon-amulet', pt: 'Amuleto do dragão', en: 'Dragon amulet', rarity: 'epico' },
        { slot: 'costume', id: 'fire-dragon', pt: 'Fantasia de dragão', en: 'Fire dragon costume', rarity: 'lendario' } ] },
      { id: 'robot', name: 'Robô Turbo', icon: '🤖', fx: 'lights', fxName: 'luzes piscando', items: [
        { slot: 'face', id: 'robot-visor', pt: 'Visor de robô', en: 'Robot visor', rarity: 'raro' },
        { slot: 'head', id: 'robot-helmet', pt: 'Capacete de robô', en: 'Robot helmet', rarity: 'epico' },
        { slot: 'body', id: 'robot-chest', pt: 'Peito de robô', en: 'Robot chest', rarity: 'epico' },
        { slot: 'back', id: 'gear-pack', pt: 'Engrenagens turbo', en: 'Turbo gears', rarity: 'lendario' } ] },
    ],
    rarity: { raro: { name: 'Rara', color: '#2f86ff' }, epico: { name: 'Épica', color: '#9a55ff' }, lendario: { name: 'Lendária', color: '#ffb000' } },
    // o Lumi cresce conforme as fases completas
    grow: [
      { min: 0, name: 'Bebê', icon: '🍼' },
      { min: 4, name: 'Pequeno', icon: '🌱' },
      { min: 12, name: 'Criança', icon: '🌟' },
      { min: 25, name: 'Grande', icon: '💪' },
      { min: 45, name: 'Super Lumi', icon: '👑' },
    ],
  };
})();
