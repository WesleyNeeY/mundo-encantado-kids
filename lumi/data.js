/* Conteúdo do Lumi: unidades do mapa, comidas e acessórios */
window.LUMI_DATA = {
  units: [
    { id: 'first', name: 'Primeiras palavras', icon: '🌟', words: [
      { en: 'Sun', pt: 'sol', img: '☀️' }, { en: 'Moon', pt: 'lua', img: '🌙' }, { en: 'Star', pt: 'estrela', img: '⭐' },
      { en: 'Ball', pt: 'bola', img: '⚽' }, { en: 'Book', pt: 'livro', img: '📚' }, { en: 'House', pt: 'casa', img: '🏠' } ] },
    { id: 'greet', name: 'Saudações', icon: '👋', words: [
      { en: 'Hello', pt: 'olá', img: '👋' }, { en: 'Good morning', pt: 'bom dia', img: '🌅' }, { en: 'Good night', pt: 'boa noite', img: '😴' },
      { en: 'Thank you', pt: 'obrigado', img: '🙏' }, { en: 'Yes', pt: 'sim', img: '👍' }, { en: 'No', pt: 'não', img: '👎' }, { en: 'I love you', pt: 'eu te amo', img: '🥰' } ] },
    { id: 'animals', name: 'Animais', icon: '🐶', words: [
      { en: 'Dog', pt: 'cachorro', img: '🐶' }, { en: 'Cat', pt: 'gato', img: '🐱' }, { en: 'Bird', pt: 'pássaro', img: '🐦' },
      { en: 'Fish', pt: 'peixe', img: '🐟' }, { en: 'Cow', pt: 'vaca', img: '🐮' }, { en: 'Duck', pt: 'pato', img: '🦆' },
      { en: 'Lion', pt: 'leão', img: '🦁' }, { en: 'Rabbit', pt: 'coelho', img: '🐰' } ] },
    { id: 'colors', name: 'Cores', icon: '🎨', words: [
      { en: 'Red', pt: 'vermelho', img: '🔴' }, { en: 'Blue', pt: 'azul', img: '🔵' }, { en: 'Green', pt: 'verde', img: '🟢' },
      { en: 'Yellow', pt: 'amarelo', img: '🟡' }, { en: 'Orange', pt: 'laranja', img: '🟠' }, { en: 'Purple', pt: 'roxo', img: '🟣' },
      { en: 'Black', pt: 'preto', img: '⚫' }, { en: 'White', pt: 'branco', img: '⚪' } ] },
    { id: 'numbers', name: 'Números', icon: '🔢', words: [
      { en: 'One', pt: 'um', txt: '1' }, { en: 'Two', pt: 'dois', txt: '2' }, { en: 'Three', pt: 'três', txt: '3' },
      { en: 'Four', pt: 'quatro', txt: '4' }, { en: 'Five', pt: 'cinco', txt: '5' }, { en: 'Six', pt: 'seis', txt: '6' } ] },
    { id: 'fruits', name: 'Frutas', icon: '🍎', words: [
      { en: 'Apple', pt: 'maçã', img: '🍎' }, { en: 'Banana', pt: 'banana', img: '🍌' }, { en: 'Grapes', pt: 'uva', img: '🍇' },
      { en: 'Strawberry', pt: 'morango', img: '🍓' }, { en: 'Orange', pt: 'laranja', img: '🍊' }, { en: 'Watermelon', pt: 'melancia', img: '🍉' },
      { en: 'Pineapple', pt: 'abacaxi', img: '🍍' } ] },
    { id: 'body', name: 'Meu corpo', icon: '👀', words: [
      { en: 'Eyes', pt: 'olhos', img: '👀' }, { en: 'Ear', pt: 'orelha', img: '👂' }, { en: 'Nose', pt: 'nariz', img: '👃' },
      { en: 'Mouth', pt: 'boca', img: '👄' }, { en: 'Hand', pt: 'mão', img: '✋' }, { en: 'Foot', pt: 'pé', img: '🦶' } ] },
    { id: 'family', name: 'Família', icon: '🏡', words: [
      { en: 'Mom', pt: 'mamãe', img: '👩' }, { en: 'Dad', pt: 'papai', img: '👨' }, { en: 'Baby', pt: 'bebê', img: '👶' },
      { en: 'Grandma', pt: 'vovó', img: '👵' }, { en: 'Grandpa', pt: 'vovô', img: '👴' }, { en: 'Brother', pt: 'irmão', img: '👦' },
      { en: 'Sister', pt: 'irmã', img: '👧' } ] },
    { id: 'toys', name: 'Brinquedos', icon: '🧸', words: [
      { en: 'Teddy bear', pt: 'ursinho', img: '🧸' }, { en: 'Car', pt: 'carro', img: '🚗' }, { en: 'Kite', pt: 'pipa', img: '🪁' },
      { en: 'Balloon', pt: 'balão', img: '🎈' }, { en: 'Drum', pt: 'tambor', img: '🥁' }, { en: 'Robot', pt: 'robô', img: '🤖' } ] },
    { id: 'nature', name: 'Natureza', icon: '🌳', words: [
      { en: 'Tree', pt: 'árvore', img: '🌳' }, { en: 'Flower', pt: 'flor', img: '🌸' }, { en: 'Rain', pt: 'chuva', img: '🌧️' },
      { en: 'Cloud', pt: 'nuvem', img: '☁️' }, { en: 'Rainbow', pt: 'arco-íris', img: '🌈' }, { en: 'Mountain', pt: 'montanha', img: '⛰️' } ] },
  ],
  foods: [
    { id: 'apple', en: 'Apple', pt: 'Maçã', img: '🍎', price: 20, energy: 20 },
    { id: 'banana', en: 'Banana', pt: 'Banana', img: '🍌', price: 15, energy: 15 },
    { id: 'cookie', en: 'Cookie', pt: 'Biscoito', img: '🍪', price: 10, energy: 10 },
    { id: 'milk', en: 'Milk', pt: 'Leite', img: '🥛', price: 15, energy: 15 },
    { id: 'carrot', en: 'Carrot', pt: 'Cenoura', img: '🥕', price: 10, energy: 12 },
    { id: 'cake', en: 'Cake', pt: 'Bolo', img: '🍰', price: 40, energy: 40 },
  ],
  shop: {
    head: [
      { id: 'none', pt: 'Sem chapéu', en: '', price: 0 },
      { id: 'cap', pt: 'Boné azul', en: 'Cap', price: 50 },
      { id: 'bow', pt: 'Laço', en: 'Bow', price: 40 },
      { id: 'party', pt: 'Chapéu de festa', en: 'Party hat', price: 60 },
      { id: 'explorer', pt: 'Chapéu de explorador', en: 'Explorer hat', price: 80 },
      { id: 'wizard', pt: 'Chapéu de mago', en: 'Wizard hat', price: 120 },
      { id: 'crown', pt: 'Coroa', en: 'Crown', price: 150 },
    ],
    face: [
      { id: 'none', pt: 'Sem óculos', en: '', price: 0 },
      { id: 'glasses', pt: 'Óculos', en: 'Glasses', price: 70 },
      { id: 'sunglasses', pt: 'Óculos escuros', en: 'Sunglasses', price: 90 },
    ],
    neck: [
      { id: 'none', pt: 'Nada', en: '', price: 0 },
      { id: 'bowtie', pt: 'Gravata borboleta', en: 'Bow tie', price: 50 },
      { id: 'scarf', pt: 'Cachecol', en: 'Scarf', price: 60 },
    ],
  },
};
