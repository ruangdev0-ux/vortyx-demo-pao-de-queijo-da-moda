/* Demo PDV — Pão de Queijo da Moda (Vortyx)
 * Sem backend: estado salvo no localStorage deste navegador.
 * Pix, cartão, gaveta, impressora e Keeta são SIMULAÇÕES.
 */
(function () {
  'use strict';

  const CHAVE = 'vortyx-demo-pqm-v1';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = (c) => 'R$ ' + (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dataHora = (iso) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const pad = (n) => String(n).padStart(3, '0');
  const parseReais = (txt) => {
    if (!txt) return 0;
    const v = parseFloat(String(txt).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
    return isNaN(v) ? 0 : Math.round(v * 100);
  };
  const PG = { dinheiro: 'Dinheiro', pix: 'Pix', cartao: 'Cartão' };
  const PROD = Object.fromEntries(PRODUTOS.map((p) => [p.id, p]));
  const ADD = Object.fromEntries(ADICIONAIS.map((a) => [a.id, a]));

  /* ---------- estado ---------- */
  const novoEstado = () => ({ caixa: null, vendas: [], keeta: [], carrinho: [], fechamentos: [] });
  let S;
  try { S = Object.assign(novoEstado(), JSON.parse(localStorage.getItem(CHAVE)) || {}); }
  catch (e) { S = novoEstado(); }
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) { /* sem storage: segue em memória */ } };

  let catAtual = 'tradicional';
  let viewAtual = 'venda';
  let filtroHist = 'todos';

  /* ---------- relógio ---------- */
  function tick() {
    const d = new Date();
    const h = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    $('#ab-hora').textContent = h;
    $('#topo-hora').textContent = h;
    const dt = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    $('#ab-data').textContent = dt.charAt(0).toUpperCase() + dt.slice(1);
  }
  setInterval(tick, 1000); tick();

  /* ---------- abertura ---------- */
  function mostrarAbertura() {
    $('#app').hidden = true;
    $('#abertura').hidden = false;
    $('#ab-fundo').value = '';
    $$('#ab-atalhos button').forEach((b) => b.classList.remove('sel'));
  }
  $('#ab-atalhos').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#ab-atalhos button').forEach((x) => x.classList.toggle('sel', x === b));
    $('#ab-fundo').value = (b.dataset.v / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  });
  $('#ab-fundo').addEventListener('input', () => $$('#ab-atalhos button').forEach((x) => x.classList.remove('sel')));
  $('#btn-abrir').addEventListener('click', () => {
    S.caixa = { aberto: true, abertoEm: new Date().toISOString(), fundo: parseReais($('#ab-fundo').value), seq: 0 };
    S.vendas = []; S.keeta = []; S.carrinho = [];
    salvar();
    entrarApp();
    toast('Caixa aberto às ' + hora(S.caixa.abertoEm) + ' · fundo de ' + brl(S.caixa.fundo));
  });

  function entrarApp() {
    $('#abertura').hidden = true;
    $('#app').hidden = false;
    catAtual = 'tradicional';
    irPara('venda');
    renderCats(); renderGrade(); renderCarrinho(); renderBadge();
  }

  /* ---------- navegação ---------- */
  function irPara(v) {
    viewAtual = v;
    $$('#abas button').forEach((b) => b.classList.toggle('ativa', b.dataset.view === v));
    $$('.view').forEach((s) => (s.hidden = s.id !== 'view-' + v));
    if (v === 'keeta') renderKeeta();
    if (v === 'historico') renderHistorico();
    if (v === 'caixa') renderCaixa();
    window.scrollTo(0, 0);
  }
  $('#abas').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) irPara(b.dataset.view); });

  /* ---------- catálogo ---------- */
  function renderCats() {
    $('#cats').innerHTML = CATEGORIAS.map((c) =>
      `<button data-cat="${c.id}" class="${c.id === catAtual ? 'ativa' : ''}"><svg><use href="#i-${c.icone}"/></svg>${esc(c.nome)}</button>`
    ).join('');
  }
  $('#cats').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    catAtual = b.dataset.cat; renderCats(); renderGrade();
  });

  function cardProduto(p) {
    const cat = CATEGORIAS.find((c) => c.id === p.cat);
    const semPreco = p.preco == null;
    return `<button class="prod ${semPreco ? 'sem-preco' : ''}" data-id="${p.id}">
      <svg><use href="#i-${cat.icone}"/></svg>
      ${p.adicionais ? '<span class="prod-tag">+ adicionais</span>' : ''}
      <span class="prod-nome">${esc(p.curto)}</span>
      ${p.sub ? `<span class="prod-sub">${esc(p.sub)}</span>` : ''}
      <span class="prod-preco">${semPreco ? 'Preço a confirmar' : brl(p.preco)}</span>
    </button>`;
  }
  function renderGrade() {
    const lista = PRODUTOS.filter((p) => p.cat === catAtual);
    let html = lista.map(cardProduto).join('');
    if (catAtual === 'adicionais') html = '<p class="secao-titulo">Adicional avulso · para escolher junto do pão de queijo, toque no próprio pão</p>' + html;
    $('#grade').innerHTML = html;
  }
  $('#grade').addEventListener('click', (e) => {
    const b = e.target.closest('.prod'); if (!b) return;
    const p = PROD[b.dataset.id];
    if (p.preco == null) {
      toast(`“${p.nome}”: preço em branco no cardápio — a confirmar com a loja.`);
      return;
    }
    if (p.adicionais) { abrirItem(p); return; }
    adicionar(p.id, [], 1);
    b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
  });

  /* ---------- carrinho ---------- */
  const chaveLinha = (id, adds) => id + '|' + [...adds].sort().join(',');
  const precoUnit = (l) => PROD[l.id].preco + l.adds.reduce((s, a) => s + ADD[a].preco, 0);
  const totalCarrinho = () => S.carrinho.reduce((s, l) => s + precoUnit(l) * l.qtd, 0);

  function adicionar(id, adds, qtd) {
    const k = chaveLinha(id, adds);
    const ex = S.carrinho.find((l) => chaveLinha(l.id, l.adds) === k);
    if (ex) ex.qtd += qtd; else S.carrinho.push({ id, adds: [...adds], qtd });
    salvar(); renderCarrinho();
    const bar = $('#barra-pedido'); bar.animate([{ transform: 'scale(1.04)' }, { transform: 'none' }], 250);
  }

  function renderCarrinho() {
    const box = $('#pedido-itens');
    if (!S.carrinho.length) {
      box.innerHTML = `<div class="vazio"><svg><use href="#i-pao"/></svg><p><b>Nenhum item ainda</b><br>Toque nos produtos para montar o pedido.</p></div>`;
    } else {
      box.innerHTML = S.carrinho.map((l, i) => {
        const p = PROD[l.id];
        return `<div class="item" data-i="${i}">
          <div><div class="item-nome">${esc(p.nome)}</div><div class="item-unit">${brl(precoUnit(l))} cada</div></div>
          <div class="item-valor">${brl(precoUnit(l) * l.qtd)}</div>
          ${l.adds.length ? `<div class="item-adds">${l.adds.map((a) => `<span>+ ${esc(ADD[a].nome)}</span>`).join('')}</div>` : ''}
          <div class="item-ctrl">
            <div class="qtd"><button data-a="menos" aria-label="Diminuir">−</button><b>${l.qtd}</b><button data-a="mais" aria-label="Aumentar">+</button></div>
            ${p.adicionais ? '<button class="editar" data-a="editar">Adicionais</button>' : ''}
            <button class="remover" data-a="remover">Remover</button>
          </div>
        </div>`;
      }).join('');
    }
    const tot = totalCarrinho();
    const qtd = S.carrinho.reduce((s, l) => s + l.qtd, 0);
    $('#ped-subtotal').textContent = brl(tot);
    $('#ped-total').textContent = brl(tot);
    $('#ped-num').textContent = '· nº ' + pad((S.caixa ? S.caixa.seq : 0) + 1);
    $('#btn-finalizar').disabled = !S.carrinho.length;
    $('#btn-limpar').disabled = !S.carrinho.length;
    $('#barra-qtd').textContent = qtd;
    $('#barra-total').textContent = brl(tot);
    $('#barra-pedido').classList.toggle('vazia', !qtd);
  }
  $('#pedido-itens').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const i = +b.closest('.item').dataset.i; const l = S.carrinho[i];
    if (b.dataset.a === 'mais') l.qtd++;
    if (b.dataset.a === 'menos') { l.qtd--; if (l.qtd < 1) S.carrinho.splice(i, 1); }
    if (b.dataset.a === 'remover') S.carrinho.splice(i, 1);
    if (b.dataset.a === 'editar') { abrirItem(PROD[l.id], i); return; }
    salvar(); renderCarrinho();
  });
  $('#btn-limpar').addEventListener('click', () => {
    if (!S.carrinho.length) return;
    confirmar('Limpar todos os itens do pedido atual?', 'Limpar pedido', () => { S.carrinho = []; salvar(); renderCarrinho(); });
  });
  $('#barra-pedido').addEventListener('click', () => $('#pedido').classList.add('aberto'));
  $('#fechar-sheet').addEventListener('click', () => $('#pedido').classList.remove('aberto'));

  /* ---------- modal genérico ---------- */
  let aoFechar = null;
  function abrirModal(html, { largo = false, onClose = null } = {}) {
    const c = $('#modal-caixa');
    c.className = 'modal-caixa' + (largo ? ' largo' : '');
    c.innerHTML = html;
    $('#modal').hidden = false;
    aoFechar = onClose;
  }
  function fecharModal() {
    $('#modal').hidden = true; $('#modal-caixa').innerHTML = ''; $('#modal-caixa').onclick = null;
    const f = aoFechar; aoFechar = null; if (f) f();
  }
  $('#modal').addEventListener('click', (e) => { if (e.target.closest('[data-fechar]')) fecharModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) fecharModal(); });

  /* ---------- item com adicionais ---------- */
  function abrirItem(p, idxEdicao) {
    const editando = idxEdicao != null;
    const linha = editando ? S.carrinho[idxEdicao] : null;
    let adds = new Set(linha ? linha.adds : []);
    let qtd = linha ? linha.qtd : 1;

    const desenhar = () => {
      const unit = p.preco + [...adds].reduce((s, a) => s + ADD[a].preco, 0);
      abrirModal(`
        <div class="m-topo"><div><h3>${esc(p.nome)}</h3><p>${brl(p.preco)} · escolha os adicionais (opcional)</p></div><button class="m-x" data-fechar aria-label="Fechar">×</button></div>
        <div class="m-corpo">
          <div class="rotulo">Adicionais</div>
          <div class="opcoes">${ADICIONAIS.map((a) => `<button class="opcao ${adds.has(a.id) ? 'sel' : ''}" data-add="${a.id}">${esc(a.nome)}<small>+ ${brl(a.preco)}</small></button>`).join('')}</div>
          <div class="rotulo">Quantidade</div>
          <div class="qtd-grande"><button data-q="-1" aria-label="Diminuir">−</button><b>${qtd}</b><button data-q="1" aria-label="Aumentar">+</button></div>
        </div>
        <div class="m-rodape">
          <button class="btn btn-claro" data-fechar>Cancelar</button>
          <button class="btn btn-vermelho btn-lg" id="m-ok">${editando ? 'Salvar' : 'Adicionar'} · ${brl(unit * qtd)}</button>
        </div>`);
      $('#modal-caixa').onclick = (e) => {
        const a = e.target.closest('[data-add]'); const q = e.target.closest('[data-q]');
        if (a) { adds.has(a.dataset.add) ? adds.delete(a.dataset.add) : adds.add(a.dataset.add); desenhar(); }
        if (q) { qtd = Math.max(1, qtd + +q.dataset.q); desenhar(); }
        if (e.target.closest('#m-ok')) {
          if (editando) S.carrinho.splice(idxEdicao, 1);
          adicionar(p.id, [...adds], qtd);
          $('#modal-caixa').onclick = null;
          fecharModal();
        }
      };
    };
    desenhar();
  }

  /* ---------- finalizar venda / pagamento ---------- */
  $('#btn-finalizar').addEventListener('click', () => {
    if (!S.carrinho.length) return;
    $('#pedido').classList.remove('aberto');
    abrirPagamento();
  });

  function abrirPagamento() {
    const total = totalCarrinho();
    let forma = null; let recebido = 0;

    const painel = () => {
      if (forma === 'dinheiro') {
        const falta = recebido < total;
        const notas = [total, 1000, 2000, 5000, 10000].filter((v, i, a) => (i === 0 || v > total) && a.indexOf(v) === i);
        return `<div class="painel-forma">
          <div class="rotulo" style="margin-top:0">Valor recebido</div>
          <div class="input-moeda claro"><b>R$</b><input id="pg-recebido" inputmode="decimal" placeholder="0,00" value="${recebido ? (recebido / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}" autocomplete="off"></div>
          <div class="atalhos claro" style="margin-top:10px">${notas.map((v, i) => `<button data-nota="${v}">${i === 0 ? 'Valor exato' : brl(v).replace(',00', '')}</button>`).join('')}</div>
          <div class="troco ${recebido ? (falta ? 'falta' : 'ok') : 'ok'}" id="pg-troco">${trocoHtml()}</div>
        </div>`;
      }
      if (forma === 'pix') return `<div class="painel-forma info-sim"><div class="grande-ico">Pix</div><div><span class="tag-sim">Simulação</span><br>Na versão final, o QR Code de cobrança aparece aqui. Nesta demo, apenas confirme que o Pix foi recebido.</div></div>`;
      if (forma === 'cartao') return `<div class="painel-forma info-sim"><div class="grande-ico">▭</div><div><span class="tag-sim">Simulação</span><br>Passe o cartão na maquininha normalmente. Nesta demo não há ligação com a maquininha — apenas confirme a aprovação.</div></div>`;
      return '';
    };
    const trocoHtml = () => {
      if (!recebido) return `<span>Troco</span><b>—</b>`;
      return recebido < total ? `<span>Faltam</span><b>${brl(total - recebido)}</b>` : `<span>Troco</span><b>${brl(recebido - total)}</b>`;
    };
    const podeConfirmar = () => forma && (forma !== 'dinheiro' || recebido >= total);

    const desenhar = () => {
      abrirModal(`
        <div class="m-topo"><div><h3>Pagamento</h3><p>Pedido nº ${pad(S.caixa.seq + 1)} · ${S.carrinho.reduce((s, l) => s + l.qtd, 0)} itens</p></div><button class="m-x" data-fechar aria-label="Fechar">×</button></div>
        <div class="m-corpo">
          <div class="total-pagar"><small>Total a pagar</small><b>${brl(total)}</b></div>
          <div class="rotulo">Forma de pagamento</div>
          <div class="formas">
            <button class="forma ${forma === 'dinheiro' ? 'sel' : ''}" data-forma="dinheiro"><span class="ico">R$</span>Dinheiro</button>
            <button class="forma ${forma === 'pix' ? 'sel' : ''}" data-forma="pix"><span class="ico">◆</span>Pix</button>
            <button class="forma ${forma === 'cartao' ? 'sel' : ''}" data-forma="cartao"><span class="ico">▭</span>Cartão</button>
          </div>
          ${painel()}
        </div>
        <div class="m-rodape">
          <button class="btn btn-claro" data-fechar>Voltar</button>
          <button class="btn btn-verde btn-lg" id="pg-ok" ${podeConfirmar() ? '' : 'disabled'}>Confirmar pagamento</button>
        </div>`);
      const inp = $('#pg-recebido');
      if (inp) {
        inp.addEventListener('input', () => {
          recebido = parseReais(inp.value);
          const t = $('#pg-troco'); t.innerHTML = trocoHtml();
          t.className = 'troco ' + (recebido && recebido < total ? 'falta' : 'ok');
          $('#pg-ok').disabled = !podeConfirmar();
        });
        if (!recebido) setTimeout(() => inp.focus(), 50);
      }
    };
    desenhar();

    $('#modal-caixa').onclick = (e) => {
      const f = e.target.closest('[data-forma]'); const n = e.target.closest('[data-nota]');
      if (f) { forma = f.dataset.forma; if (forma !== 'dinheiro') recebido = 0; desenhar(); }
      if (n) { recebido = +n.dataset.nota; desenhar(); }
      if (e.target.closest('#pg-ok') && podeConfirmar()) {
        $('#modal-caixa').onclick = null;
        const venda = registrarVenda({
          origem: 'balcao',
          itens: S.carrinho.map((l) => ({ id: l.id, adds: l.adds, qtd: l.qtd })),
          pagamento: forma,
          recebido: forma === 'dinheiro' ? recebido : null,
          troco: forma === 'dinheiro' ? recebido - total : null
        });
        S.carrinho = []; salvar(); renderCarrinho();
        if (forma === 'dinheiro') mostrarGaveta(venda); else mostrarRecibo(venda, { novaVenda: true });
      }
    };
  }

  function registrarVenda(dados) {
    S.caixa.seq += 1;
    const itens = dados.itens.map((i) => ({
      id: i.id, nome: PROD[i.id].nome, qtd: i.qtd,
      adds: i.adds.map((a) => ({ id: a, nome: ADD[a].nome, preco: ADD[a].preco })),
      unit: PROD[i.id].preco + i.adds.reduce((s, a) => s + ADD[a].preco, 0)
    }));
    const v = Object.assign({
      num: S.caixa.seq,
      quando: new Date().toISOString(),
      itens,
      total: itens.reduce((s, i) => s + i.unit * i.qtd, 0)
    }, dados, { itens });
    S.vendas.push(v); salvar();
    return v;
  }

  /* ---------- gaveta (simulação) ---------- */
  function mostrarGaveta(venda) {
    abrirModal(`
      <div class="m-topo"><div><h3>Abrir gaveta do caixa</h3><p>Venda nº ${pad(venda.num)} em dinheiro</p></div></div>
      <div class="m-corpo">
        <div class="gaveta-wrap"><div class="registradora" id="reg">
          <div class="reg-corpo"><div class="reg-visor">${brl(venda.troco).replace('R$ ', '')}</div></div>
          <div class="reg-gaveta"><i></i><i></i><i></i><i></i></div>
        </div></div>
        <div class="gaveta-msg" id="gav-msg">Abrindo gaveta…</div>
        <div class="gaveta-troco">Entregue o troco<b>${brl(venda.troco)}</b><span style="font-weight:700;font-size:.85rem">Recebido ${brl(venda.recebido)} · Total ${brl(venda.total)}</span></div>
        <p class="nota-futuro"><span class="tag-sim">Simulação</span> No sistema final, a gaveta pode abrir sozinha por comando enviado à impressora térmica.</p>
      </div>
      <div class="m-rodape"><button class="btn btn-vermelho btn-lg" id="gav-ok">Troco entregue · ver comprovante</button></div>`);
    setTimeout(() => { const r = $('#reg'); if (r) { r.classList.add('aberta'); $('#gav-msg').textContent = 'Gaveta aberta'; } }, 350);
    $('#gav-ok').onclick = () => mostrarRecibo(venda, { novaVenda: true });
  }

  /* ---------- comprovante térmico ---------- */
  function reciboHtml(v) {
    const linhas = v.itens.map((i) => `
      <div class="l"><span>${i.qtd}x ${esc(i.nome)}</span><span>${brl(i.unit * i.qtd).replace('R$ ', '')}</span></div>
      ${i.adds.map((a) => `<div class="add">+ ${esc(a.nome)} (${brl(a.preco).replace('R$ ', '')})</div>`).join('')}`).join('');
    const keeta = v.origem === 'keeta';
    return `<div class="recibo">
      <div class="c g">PÃO DE QUEIJO DA MODA</div>
      <div class="c">${esc(LOJA.instagram)}</div>
      <div class="c">Delivery ${esc(LOJA.delivery)}</div>
      <div class="sep"></div>
      ${keeta ? `<div class="c b">*** COMANDA DELIVERY ***</div><div class="c">Keeta · pedido ${esc(v.keetaId)}</div><div class="c">(simulação)</div><div class="sep"></div>` : ''}
      <div class="l"><span>PEDIDO</span><span class="b">Nº ${pad(v.num)}</span></div>
      <div class="l"><span>Data/hora</span><span>${dataHora(v.quando)}</span></div>
      <div class="l"><span>Origem</span><span>${keeta ? 'Keeta (delivery)' : 'Balcão'}</span></div>
      <div class="sep"></div>
      ${linhas}
      <div class="sep"></div>
      <div class="l tot"><span>TOTAL</span><span>${brl(v.total)}</span></div>
      <div class="l"><span>Pagamento</span><span>${PG[v.pagamento]}${keeta ? ' (app)' : ''}</span></div>
      ${v.recebido != null ? `<div class="l"><span>Recebido</span><span>${brl(v.recebido)}</span></div><div class="l b"><span>Troco</span><span>${brl(v.troco)}</span></div>` : ''}
      <div class="sep"></div>
      <div class="c">${esc(LOJA.frase)}!</div>
      <div class="c" style="margin-top:6px;font-size:11px">DOCUMENTO NÃO FISCAL<br>Demonstração Vortyx</div>
    </div>`;
  }

  function imprimir(html) {
    if (window.PDV_IMPRESSAO_SIMULADA) { toast('Enviado para a impressora térmica (simulação nesta prévia online)'); return; }
    $('#area-impressao').innerHTML = html;
    setTimeout(() => window.print(), 50);
  }

  function mostrarRecibo(v, { novaVenda = false } = {}) {
    const keeta = v.origem === 'keeta';
    abrirModal(`
      <div class="m-topo"><div><h3>${novaVenda ? (keeta ? 'Pedido aceito' : 'Venda concluída') : 'Comprovante'} · nº ${pad(v.num)}</h3><p>${brl(v.total)} · ${PG[v.pagamento]} · ${keeta ? 'Keeta' : 'Balcão'}</p></div><button class="m-x" data-fechar aria-label="Fechar">×</button></div>
      <div class="m-corpo"><div class="recibo-palco">${reciboHtml(v)}</div></div>
      <div class="m-rodape">
        <button class="btn btn-claro btn-lg" id="rc-print">${keeta ? 'Imprimir comanda' : 'Imprimir comprovante'}</button>
        <button class="btn btn-vermelho btn-lg" data-fechar>${novaVenda && !keeta ? 'Próxima venda' : 'Fechar'}</button>
      </div>`, { onClose: novaVenda && !keeta ? () => irPara('venda') : null });
    $('#rc-print').onclick = () => imprimir(reciboHtml(v));
  }

  /* ---------- Keeta (simulação) ---------- */
  const sorteia = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function gerarPedidoKeeta() {
    const vendaveis = PRODUTOS.filter((p) => p.preco != null && p.cat !== 'adicionais');
    const pqs = vendaveis.filter((p) => p.adicionais);
    const bebidas = vendaveis.filter((p) => p.cat === 'bebidas' || p.cat === 'sucos');
    const itens = [];
    const n = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const p = sorteia(pqs);
      const adds = Math.random() < 0.6 ? [sorteia(ADICIONAIS).id] : [];
      itens.push({ id: p.id, adds, qtd: 1 + Math.floor(Math.random() * 2) });
    }
    if (Math.random() < 0.85) itens.push({ id: sorteia(bebidas).id, adds: [], qtd: 1 });
    if (Math.random() < 0.3) itens.push({ id: sorteia(vendaveis.filter((p) => p.cat === 'doces')).id, adds: [], qtd: 1 });
    const total = itens.reduce((s, i) => s + (PROD[i.id].preco + i.adds.reduce((x, a) => x + ADD[a].preco, 0)) * i.qtd, 0);
    return {
      keetaId: 'KT-' + String(Math.floor(100000 + Math.random() * 900000)),
      chegou: new Date().toISOString(),
      itens, total,
      pagamento: sorteia(['pix', 'cartao', 'pix'])
    };
  }

  function bip() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.22].forEach((t) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.18);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.2);
      });
    } catch (e) { /* sem áudio */ }
  }

  $('#btn-sim-keeta').addEventListener('click', () => {
    const p = gerarPedidoKeeta();
    S.keeta.unshift(p); salvar();
    renderKeeta(); renderBadge(); bip();
    toast('Novo pedido Keeta ' + p.keetaId + ' · ' + brl(p.total));
  });

  function renderBadge() {
    const n = S.keeta.length; const b = $('#badge-keeta');
    b.hidden = !n; b.textContent = n;
  }

  function renderKeeta() {
    const box = $('#keeta-lista');
    if (!S.keeta.length) {
      box.innerHTML = `<div class="vazio-keeta"><svg><use href="#i-moto"/></svg><p>Nenhum pedido de delivery aguardando.<br>Toque em <b>“Simular novo pedido Keeta”</b> para ver como ele chega no caixa.</p></div>`;
      return;
    }
    box.innerHTML = S.keeta.map((p, i) => `
      <article class="kcard">
        <div class="kcard-topo"><b>Keeta · ${esc(p.keetaId)}</b><span class="kcard-novo">Novo pedido</span></div>
        <div class="kcard-corpo">
          <div class="kcard-meta"><span>Recebido às ${hora(p.chegou)}</span><span>Pagamento: ${PG[p.pagamento]} (pago no app · simulado)</span></div>
          ${p.itens.map((it) => `<div class="kitem"><span>${it.qtd}x ${esc(PROD[it.id].nome)}${it.adds.map((a) => `<small>+ ${esc(ADD[a].nome)}</small>`).join('')}</span><span>${brl((PROD[it.id].preco + it.adds.reduce((x, a) => x + ADD[a].preco, 0)) * it.qtd)}</span></div>`).join('')}
          <div class="ktotal"><span>Total</span><span>${brl(p.total)}</span></div>
        </div>
        <div class="kcard-acoes">
          <button class="btn btn-claro" data-recusar="${i}">Recusar</button>
          <button class="btn btn-verde btn-lg" data-aceitar="${i}">Aceitar e imprimir</button>
        </div>
      </article>`).join('');
  }
  $('#keeta-lista').addEventListener('click', (e) => {
    const a = e.target.closest('[data-aceitar]'); const r = e.target.closest('[data-recusar]');
    if (r) {
      const idx = +r.dataset.recusar;
      confirmar('Recusar este pedido simulado?', 'Recusar pedido', () => {
        S.keeta.splice(idx, 1); salvar(); renderKeeta(); renderBadge();
        toast('Pedido recusado (simulação)');
      });
    }
    if (a) {
      const p = S.keeta.splice(+a.dataset.aceitar, 1)[0];
      const v = registrarVenda({ origem: 'keeta', keetaId: p.keetaId, itens: p.itens, pagamento: p.pagamento, recebido: null, troco: null });
      salvar(); renderKeeta(); renderBadge(); renderCarrinho();
      mostrarRecibo(v, { novaVenda: true });
    }
  });

  /* ---------- histórico ---------- */
  $('#hist-filtros').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    filtroHist = b.dataset.f;
    $$('#hist-filtros button').forEach((x) => x.classList.toggle('ativo', x === b));
    renderHistorico();
  });
  function renderHistorico() {
    const lista = S.vendas.filter((v) => filtroHist === 'todos' || v.origem === filtroHist).slice().reverse();
    const tot = lista.reduce((s, v) => s + v.total, 0);
    $('#hist-resumo').innerHTML = `<span>Pedidos: <b>${lista.length}</b></span><span>Total: <b>${brl(tot)}</b></span>`;
    if (!lista.length) { $('#hist-lista').innerHTML = `<div class="vazio">Nenhuma venda ${filtroHist === 'todos' ? 'nesta sessão' : 'com essa origem'} ainda.</div>`; return; }
    $('#hist-lista').innerHTML = `<div class="hrow cab"><span>Horário</span><span>Pedido</span><span>Itens</span><span>Origem / pagamento</span><span style="text-align:right">Valor</span><span></span></div>` +
      lista.map((v) => `<button class="hrow" data-num="${v.num}">
        <span class="hora">${hora(v.quando)}</span>
        <span class="num">Nº ${pad(v.num)}</span>
        <span class="itens-resumo">${v.itens.map((i) => i.qtd + 'x ' + esc(PROD[i.id] ? PROD[i.id].curto : i.nome)).join(', ')}</span>
        <span class="origem-cel"><span class="origem ${v.origem}">${v.origem === 'keeta' ? 'Keeta' : 'Balcão'}</span> <span class="pg">${PG[v.pagamento]}</span></span>
        <span class="valor pgv">${brl(v.total)}</span>
        <span class="seta">›</span>
      </button>`).join('');
  }
  $('#hist-lista').addEventListener('click', (e) => {
    const b = e.target.closest('[data-num]'); if (!b) return;
    mostrarRecibo(S.vendas.find((v) => v.num === +b.dataset.num));
  });

  /* ---------- caixa do dia ---------- */
  function resumo() {
    const soma = (f) => S.vendas.filter(f).reduce((s, v) => s + v.total, 0);
    const conta = (f) => S.vendas.filter(f).length;
    return {
      total: soma(() => true), pedidos: S.vendas.length,
      dinheiro: soma((v) => v.pagamento === 'dinheiro'), pix: soma((v) => v.pagamento === 'pix'), cartao: soma((v) => v.pagamento === 'cartao'),
      balcao: soma((v) => v.origem === 'balcao'), keeta: soma((v) => v.origem === 'keeta'),
      nBalcao: conta((v) => v.origem === 'balcao'), nKeeta: conta((v) => v.origem === 'keeta'),
      dinheiroBalcao: soma((v) => v.pagamento === 'dinheiro' && v.origem === 'balcao')
    };
  }
  const barra = (cls, nome, val, max, extra = '') => `<div class="barra ${cls}"><div class="barra-lin"><span>${nome}${extra}</span><span>${brl(val)}</span></div><div class="barra-trilho"><i style="width:${max ? Math.round((val / max) * 100) : 0}%"></i></div></div>`;

  function renderCaixa() {
    const r = resumo();
    $('#cx-abertura').textContent = `Aberto às ${hora(S.caixa.abertoEm)} · fundo de troco ${brl(S.caixa.fundo)}`;
    $('#kpis').innerHTML = `
      <div class="kpi destaque"><small>Total vendido hoje</small><b>${brl(r.total)}</b></div>
      <div class="kpi"><small>Pedidos</small><b>${r.pedidos}</b></div>
      <div class="kpi"><small>Vendas no balcão</small><b>${brl(r.balcao)}</b></div>
      <div class="kpi"><small>Vendas delivery (Keeta)</small><b>${brl(r.keeta)}</b></div>
      <div class="kpi"><small>Dinheiro</small><b>${brl(r.dinheiro)}</b></div>
      <div class="kpi"><small>Pix</small><b>${brl(r.pix)}</b></div>
      <div class="kpi"><small>Cartão</small><b>${brl(r.cartao)}</b></div>
`;
    $('#cx-pagamentos').innerHTML = `<h3>Por forma de pagamento</h3>
      ${barra('dinheiro', 'Dinheiro', r.dinheiro, r.total)}${barra('pix', 'Pix', r.pix, r.total)}${barra('cartao', 'Cartão', r.cartao, r.total)}
      <div class="gaveta-esperada"><span>Dinheiro esperado na gaveta</span><span>${brl(S.caixa.fundo + r.dinheiroBalcao)}</span></div>`;
    $('#cx-origens').innerHTML = `<h3>Por origem</h3>
      ${barra('balcao', 'Balcão', r.balcao, r.total, ` · ${r.nBalcao} pedido${r.nBalcao === 1 ? '' : 's'}`)}
      ${barra('keeta', 'Delivery Keeta', r.keeta, r.total, ` · ${r.nKeeta} pedido${r.nKeeta === 1 ? '' : 's'}`)}
      <p class="muted" style="font-size:.85rem">Pedidos Keeta desta demo são simulados.</p>`;
  }

  function fechamentoHtml(f) {
    const r = f.resumo;
    const L = (a, b, cls = '') => `<div class="l ${cls}"><span>${a}</span><span>${b}</span></div>`;
    return `<div class="recibo">
      <div class="c g">PÃO DE QUEIJO DA MODA</div>
      <div class="c b">FECHAMENTO DE CAIXA</div>
      <div class="sep"></div>
      ${L('Abertura', dataHora(f.abertoEm))}${L('Fechamento', dataHora(f.fechadoEm))}
      <div class="sep"></div>
      ${L('Pedidos', r.pedidos)}${L('  Balcão', r.nBalcao)}${L('  Keeta', r.nKeeta)}
      <div class="sep"></div>
      ${L('Dinheiro', brl(r.dinheiro))}${L('Pix', brl(r.pix))}${L('Cartão', brl(r.cartao))}
      <div class="sep"></div>
      ${L('Balcão', brl(r.balcao))}${L('Delivery Keeta', brl(r.keeta))}
      <div class="sep"></div>
      ${L('TOTAL VENDIDO', brl(r.total), 'tot')}
      <div class="sep"></div>
      ${L('Fundo de troco', brl(f.fundo))}${L('Esperado na gaveta', brl(f.esperado), 'b')}
      ${f.contado != null ? L('Contado na gaveta', brl(f.contado)) + L('Diferença', brl(f.contado - f.esperado), 'b') : ''}
      <div class="sep"></div>
      <div class="c" style="font-size:11px">DOCUMENTO NÃO FISCAL<br>Demonstração Vortyx</div>
    </div>`;
  }

  $('#btn-fechar-caixa').addEventListener('click', () => {
    const r = resumo();
    const esperado = S.caixa.fundo + r.dinheiroBalcao;
    abrirModal(`
      <div class="m-topo"><div><h3>Fechar caixa</h3><p>${r.pedidos} pedidos · ${brl(r.total)} vendidos</p></div><button class="m-x" data-fechar aria-label="Fechar">×</button></div>
      <div class="m-corpo">
        ${S.keeta.length ? `<div class="aviso-sim" style="margin-bottom:12px"><svg><use href="#i-info"/></svg><p>Há ${S.keeta.length} pedido(s) Keeta não aceitos. Eles serão descartados.</p></div>` : ''}
        ${S.carrinho.length ? `<div class="aviso-sim" style="margin-bottom:12px"><svg><use href="#i-info"/></svg><p>O pedido em andamento será descartado.</p></div>` : ''}
        <div class="gaveta-esperada" style="margin-bottom:12px"><span>Dinheiro esperado na gaveta</span><span>${brl(esperado)}</span></div>
        <label class="campo" style="color:var(--marrom)"><span>Quanto tem na gaveta agora? <small style="color:var(--suave)">(opcional)</small></span>
          <div class="input-moeda claro"><b>R$</b><input id="fc-contado" inputmode="decimal" placeholder="0,00" autocomplete="off"></div></label>
      </div>
      <div class="m-rodape"><button class="btn btn-claro" data-fechar>Cancelar</button><button class="btn btn-vermelho btn-lg" id="fc-ok">Fechar caixa e gerar resumo</button></div>`);
    $('#fc-ok').onclick = () => {
      const txt = $('#fc-contado').value.trim();
      const f = { abertoEm: S.caixa.abertoEm, fechadoEm: new Date().toISOString(), fundo: S.caixa.fundo, esperado, contado: txt ? parseReais(txt) : null, resumo: r };
      S.fechamentos.push(f);
      S.caixa = null; S.vendas = []; S.keeta = []; S.carrinho = [];
      salvar();
      const html = fechamentoHtml(f);
      abrirModal(`
        <div class="m-topo"><div><h3>Caixa fechado</h3><p>Resumo do dia · ${brl(r.total)}</p></div></div>
        <div class="m-corpo"><div class="recibo-palco">${html}</div></div>
        <div class="m-rodape"><button class="btn btn-claro btn-lg" id="fc-print">Imprimir resumo</button><button class="btn btn-vermelho btn-lg" data-fechar>Concluir</button></div>`,
        { onClose: mostrarAbertura });
      $('#fc-print').onclick = () => imprimir(html);
    };
  });

  $('#btn-limpar-demo').addEventListener('click', () => {
    confirmar('Apagar todas as vendas, pedidos e fechamentos desta demonstração neste navegador?', 'Apagar dados', () => {
      try { localStorage.removeItem(CHAVE); } catch (e) { /* ok */ }
      S = novoEstado(); mostrarAbertura();
    });
  });

  /* ---------- confirmação dentro da página ---------- */
  function confirmar(msg, ok, acao) {
    abrirModal(`
      <div class="m-topo"><div><h3>Confirmar</h3><p>${esc(msg)}</p></div></div>
      <div class="m-rodape"><button class="btn btn-claro" data-fechar>Cancelar</button><button class="btn btn-vermelho btn-lg" id="cf-ok">${esc(ok)}</button></div>`);
    $('#cf-ok').onclick = () => { fecharModal(); acao(); };
  }

  /* ---------- toast ---------- */
  let tTimer;
  function toast(msg) {
    const t = $('#toast');
    t.innerHTML = `<span>${esc(msg)}</span>`;
    t.hidden = false;
    clearTimeout(tTimer); tTimer = setTimeout(() => (t.hidden = true), 3200);
  }

  /* ---------- início ---------- */
  if (S.caixa && S.caixa.aberto) entrarApp(); else mostrarAbertura();
})();
