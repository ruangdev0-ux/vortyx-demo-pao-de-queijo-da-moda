/*
 * Cardápio do Pão de Queijo da Moda — transcrito das fotos do cardápio físico.
 * Preços em centavos. `preco: null` = preço em branco/ilegível no cardápio → "A confirmar".
 * `conferir: true` = preço manuscrito lido com menor confiança (vale confirmar com a loja).
 * Nada aqui foi inventado: itens e valores vêm somente do material enviado.
 */
window.LOJA = {
  nome: 'Pão de Queijo da Moda',
  instagram: '@paodequeijodamoda',
  delivery: '(35) 98709-1650',
  frase: 'Aproveite cada segundo'
};

window.CATEGORIAS = [
  { id: 'tradicional', nome: 'Pão de Queijo', icone: 'pao' },
  { id: 'doces',       nome: 'Recheios Doces', icone: 'doce' },
  { id: 'adicionais',  nome: 'Adicionais',    icone: 'mais' },
  { id: 'salgados',    nome: 'Salgados',      icone: 'salgado' },
  { id: 'bebidas',     nome: 'Bebidas',       icone: 'bebida' },
  { id: 'sucos',       nome: 'Sucos',         icone: 'suco' },
  { id: 'outros',      nome: 'Outros',        icone: 'pacote' }
];

/* Adicionais que podem ser escolhidos ao tocar num pão de queijo */
window.ADICIONAIS = [
  { id: 'add-requeijao',    nome: 'Requeijão',    preco: 400 },
  { id: 'add-cream-cheese', nome: 'Cream Cheese', preco: 400 },
  { id: 'add-cheddar',      nome: 'Cheddar',      preco: 400 }
];

window.PRODUTOS = [
  // Pão de Queijo
  { id: 'pq-tradicional', cat: 'tradicional', nome: 'Pão de queijo sem recheio', curto: 'Tradicional', sub: 'sem recheio', preco: 600, adicionais: true },

  // Recheados salgados (no cardápio ficam na mesma seção "Pão de Queijo")
  { id: 'pq-requeijao', cat: 'tradicional', nome: 'Pão de queijo requeijão', curto: 'Requeijão', sub: 'recheado', preco: 1200, adicionais: true },
  { id: 'pq-pernil',    cat: 'tradicional', nome: 'Pão de queijo pernil', curto: 'Pernil', sub: 'recheado', preco: 1200, adicionais: true },
  { id: 'pq-frango',    cat: 'tradicional', nome: 'Pão de queijo frango', curto: 'Frango', sub: 'recheado', preco: 1200, adicionais: true },
  { id: 'pq-carne',     cat: 'tradicional', nome: 'Pão de queijo carne de panela', curto: 'Carne de panela', sub: 'recheado', preco: 1500, adicionais: true },
  { id: 'pq-linguica',  cat: 'tradicional', nome: 'Pão de queijo linguiça artesanal', curto: 'Linguiça artesanal', sub: 'recheado', preco: 1700, adicionais: true },

  // Recheios doces
  { id: 'pq-doce-leite', cat: 'doces', nome: 'Pão de queijo doce de leite', curto: 'Doce de leite', preco: 1200 },
  { id: 'pq-nutella',    cat: 'doces', nome: 'Pão de queijo de Nutella', curto: 'Nutella', preco: 1500 },

  // Adicionais avulsos
  { id: 'av-requeijao',    cat: 'adicionais', nome: 'Adicional Requeijão',    curto: 'Requeijão',    sub: 'adicional', preco: 400 },
  { id: 'av-cream-cheese', cat: 'adicionais', nome: 'Adicional Cream Cheese', curto: 'Cream Cheese', sub: 'adicional', preco: 400 },
  { id: 'av-cheddar',      cat: 'adicionais', nome: 'Adicional Cheddar',      curto: 'Cheddar',      sub: 'adicional', preco: 400 },

  // Salgados
  { id: 'sg-coxinha', cat: 'salgados', nome: 'Coxinha', curto: 'Coxinha', preco: null },
  { id: 'sg-empada',  cat: 'salgados', nome: 'Empada gourmet', curto: 'Empada gourmet', preco: 1000 },

  // Bebidas
  { id: 'bb-lata',      cat: 'bebidas', nome: 'Refrigerante lata', curto: 'Refri lata', preco: 700, conferir: true },
  { id: 'bb-ks',        cat: 'bebidas', nome: 'Refrigerante KS', curto: 'Refri KS', preco: 600 },
  { id: 'bb-1l',        cat: 'bebidas', nome: 'Refrigerante 1 litro', curto: 'Refri 1 litro', preco: 1200 },
  { id: 'bb-2l',        cat: 'bebidas', nome: 'Refrigerante 2 litros', curto: 'Refri 2 litros', preco: 1700 },
  { id: 'bb-agua',      cat: 'bebidas', nome: 'Água sem gás', curto: 'Água sem gás', preco: 400 },
  { id: 'bb-agua-gas',  cat: 'bebidas', nome: 'Água com gás', curto: 'Água com gás', preco: 500, conferir: true },
  { id: 'bb-agua-sab',  cat: 'bebidas', nome: 'Água saborizada', curto: 'Água saborizada', preco: 700 },

  // Sucos
  { id: 'sc-laranja',    cat: 'sucos', nome: 'Suco de laranja', curto: 'Laranja', preco: 700, conferir: true },
  { id: 'sc-morango',    cat: 'sucos', nome: 'Suco de morango', curto: 'Morango', preco: 700 },
  { id: 'sc-lar-morango', cat: 'sucos', nome: 'Suco de laranja c/ morango', curto: 'Laranja c/ morango', preco: 800 },

  // Outros
  { id: 'ot-massa-1kg', cat: 'outros', nome: 'Massa de pão de queijo congelada 1 kg', curto: 'Massa congelada', sub: '1 kg', preco: null }
];
