# Demo PDV · Pão de Queijo da Moda

Demonstração visual e funcional de frente de caixa feita pela **Vortyx** para apresentar ao Pão de Queijo da Moda.
Não é o sistema final de produção.

## Como abrir

- **Local:** abra o `index.html` no navegador (Chrome/Edge). Não precisa de instalação nem internet.
- **GitHub Pages (depois de aprovado):** Settings → Pages → *Deploy from a branch* → `main` / `(root)`.

## O que a demo mostra

1. Abertura de caixa, com fundo de troco, data e hora
2. Venda no balcão por categorias, com adicionais (Requeijão, Cream Cheese, Cheddar)
3. Pedido atual: quantidade, adicionais, remover, limpar e finalizar
4. Pagamento em Dinheiro (com troco), Pix, Cartão de Débito ou Cartão de Crédito, **simulados**
5. Abertura da gaveta, **simulada**
6. Comprovante em estilo bobina térmica, com `window.print()` em 80 mm
7. Histórico da sessão, com origem Balcão ou Keeta
8. Pedido Keeta **simulado**: chega, é aceito, entra no histórico e imprime a comanda
9. Caixa do dia e fechamento com resumo impresso
10. Botão discreto "Limpar dados da demonstração" na tela Caixa do dia

## Fora do escopo desta etapa

Integração real com Keeta, Pix, maquininha, gaveta ou impressora; emissão fiscal (NF-e/NFC-e); estoque; financeiro.

## Estrutura

```
index.html              página única do PDV
assets/css/styles.css   identidade visual e layout responsivo
assets/js/data.js       cardápio (produtos, preços e adicionais)
assets/js/app.js        lógica da demo (localStorage)
assets/fonts/           fontes locais (OFL), para funcionar offline
assets/img/             foto de pães de queijo tirada do material da loja
docs/CARDAPIO.md        transcrição do cardápio e pendências
docs/screenshots/       telas em desktop, tablet e celular
```

## Dados

Tudo fica no `localStorage` deste navegador (chave `vortyx-demo-pqm-v1`).
A demo não usa banco de dados externo nem dados reais de clientes.
