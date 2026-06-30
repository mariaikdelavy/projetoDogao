const API = "http://localhost:8080";

let carrinho =
JSON.parse(localStorage.getItem("carrinho")) || [];

/* =========================
   TOAST (alertas customizados)
========================= */

function toast(mensagem, tipo = "info", titulo = null){

    let container = document.getElementById("toast-container");

    if(!container){
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const icones = {
        sucesso: "✅",
        erro: "❌",
        aviso: "⚠️",
        info: "ℹ️"
    };

    const titulos = {
        sucesso: titulo || "Sucesso",
        erro: titulo || "Ops!",
        aviso: titulo || "Atenção",
        info: titulo || "Informação"
    };

    const duracao = tipo === "erro" ? 4000 : 3000;

    const el = document.createElement("div");
    el.className = `toast toast-${tipo}`;
    el.innerHTML = `
        <span class="toast-icone">${icones[tipo]}</span>
        <div class="toast-texto">
            <div class="toast-titulo">${titulos[tipo]}</div>
            <div class="toast-msg">${mensagem}</div>
        </div>
        <button class="toast-fechar" onclick="fecharToast(this.parentElement)">✕</button>
        <div class="toast-barra" style="animation-duration:${duracao}ms"></div>
    `;

    container.appendChild(el);

    setTimeout(() => fecharToast(el), duracao);
}

function fecharToast(el){
    if(!el || el.classList.contains("saindo")) return;
    el.classList.add("saindo");
    setTimeout(() => el.remove(), 300);
}

/* =========================
   UTILITÁRIOS
========================= */

function formatarPreco(valor) {

    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/* =========================
   MENU
========================= */

function menuShow(){

    const menu =
    document.getElementById("menuMobile");

    if(menu){
        menu.classList.toggle("abrir");
    }
}

/* =========================
   CATEGORIAS
========================= */

function alterarCategoria(botaoSelecionado){

    const botoes =
    document.querySelectorAll(".categorias button");

    botoes.forEach(botao => {
        botao.classList.remove("ativo");
    });

    botaoSelecionado.classList.add("ativo");
}

/* =========================
   CARRINHO
========================= */

function atualizarContador(){

    const contador =
    document.getElementById("contadorCarrinho");

    if(!contador) return;

    let quantidadeTotal = 0;

    carrinho.forEach(item => {
        quantidadeTotal += item.quantidade;
    });

    contador.innerText = quantidadeTotal;
}

function irCarrinho(){
    window.location.href = "carrinho.html";
}

function voltar(){
    window.location.href = "index.html";
}

function mascaraTelefone(input) {

    let v = input.value.replace(/\D/g, '');

    if (v.length > 11)
        v = v.slice(0, 11);

    if (v.length > 6) {

        v = '(' +
            v.slice(0,2) +
            ') ' +
            v.slice(2,7) +
            '-' +
            v.slice(7);

    } else if (v.length > 2) {

        v = '(' +
            v.slice(0,2) +
            ') ' +
            v.slice(2);

    } else if (v.length > 0) {

        v = '(' + v;
    }

    input.value = v;

    const erro =
    document.getElementById("erroTelefone");

    const nums =
    v.replace(/\D/g,'');

    if(nums.length > 0 && nums.length < 10){

        input.classList.add("erro");

        if(erro)
            erro.classList.add("visivel");

    }else{

        input.classList.remove("erro");

        if(erro)
            erro.classList.remove("visivel");
    }
}

function toggleEndereco(select){

    const campo =
    document.getElementById("campoEndereco");

    if(!campo) return;

    if(select.value === "DELIVERY"){

        campo.classList.add("visivel");

    }else{

        campo.classList.remove("visivel");
    }
}

function alterarQuantidade(index, delta){

    carrinho[index].quantidade += delta;

    if(carrinho[index].quantidade <= 0){

        carrinho.splice(index,1);
    }

    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );

    carregarCarrinho();
    atualizarContador();
}

function removerItem(index){

    carrinho.splice(index,1);

    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );

    carregarCarrinho();
    atualizarContador();
}

/* =========================
   PRODUTOS
========================= */

async function carregarProdutos(categoria = "Dogão"){

    const resposta =
    await fetch(API + "/produtos");

    const produtos =
    await resposta.json();

    const filtrados =
    produtos.filter(
        p => p.categoria === categoria
    );

    renderizarProdutos(filtrados);

    atualizarContador();
}

const imgProdutos = {
    "Dogão Duplo": "../static/assets/dogao.jpg",
    "Dogão do Nei": "../static/assets/dogao.jpg",
    "Dogão Simples": "../static/assets/dogao.jpg",
    "Xis-Salada": "../static/assets/xis.jpg",
    "Xis-Costela": "../static/assets/xis.jpg",
    "Xis-Tudo": "../static/assets/xis.jpg",
    "Água Mineral": "../static/assets/agua.jpg",
    "Cerveja 600ml": "../static/assets/cerveja.jpg",
    "Refrigerante 2L": "../static/assets/refri-2l.jpg",
    "Refrigerante Lata": "../static/assets/refri-lata.jpg"
};

function renderizarProdutos(produtos){

    const lista =
    document.getElementById("listaProdutos");

    if(!lista) return;

    lista.innerHTML = "";

    produtos.forEach(produto => {

        lista.innerHTML += `

        <div class="card-produto">

            <img src='${imgProdutos[produto.nome] || "./assets/img/logo.jpg"}'>

            <div class="info-produto">

                <div class="topo-produto">

                    <h2>${produto.nome}</h2>

                    <span>
                        R$ ${formatarPreco(produto.preco)}
                    </span>

                </div>

                <p>
                    ${produto.descricao}
                </p>

                <div class="acoes">

                    <button
                    class="btn-adicionar"
                    onclick="adicionarCarrinho(${produto.id})">

                        Adicionar

                    </button>

                </div>

            </div>

        </div>
        `;
    });
}

async function adicionarCarrinho(id){

    const resposta =
    await fetch(API + "/produtos/" + id);

    const produto =
    await resposta.json();

    const itemExistente =
    carrinho.find(
        item => item.produto.id === produto.id
    );

    if(itemExistente){

        itemExistente.quantidade++;

    }else{

        carrinho.push({

            produto,
            quantidade:1
        });
    }

    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );

    atualizarContador();

    toast("Produto adicionado ao carrinho!", "sucesso");
}

/* =========================
   TELA CARRINHO
========================= */

function carregarCarrinho() {

    const div =
    document.getElementById("itensCarrinho");

    const resumo =
    document.getElementById("resumoTotal");

    const formularioSection =
    document.getElementById("formularioSection");

    if (!div) return;

    div.innerHTML = "";

    let total = 0;

    if (carrinho.length === 0) {

        div.innerHTML = `
        <div class="carrinho-vazio">
            <div class="icone-vazio">🛒</div>
            <p>
                Seu carrinho está vazio.<br>
                Adicione itens para continuar.
            </p>
        </div>`;

        if (resumo)
            resumo.style.display = "none";

        if (formularioSection)
            formularioSection.style.display = "none";

        atualizarContador();
        return;
    }

    carrinho.forEach((item,index)=>{

        const subtotalItem =
        item.produto.preco *
        item.quantidade;

        total += subtotalItem;

        div.innerHTML += `

        <div class="itemCarrinho">

            <div class="item-info">

                <h3>${item.produto.nome}</h3>

                <p class="item-preco-unitario">
                    R$ ${formatarPreco(item.produto.preco)} un.
                </p>

                <p class="item-subtotal">
                    R$ ${formatarPreco(subtotalItem)}
                </p>

            </div>

            <div class="item-controles">

                <button
                    class="btn-remover"
                    onclick="removerItem(${index})">
                    🗑
                </button>

                <div class="quantidade-controles">

                    <button
                        class="btn-qtd"
                        onclick="alterarQuantidade(${index}, -1)">
                        −
                    </button>

                    <span class="qtd-numero">
                        ${item.quantidade}
                    </span>

                    <button
                        class="btn-qtd"
                        onclick="alterarQuantidade(${index}, 1)">
                        +
                    </button>

                </div>

            </div>

        </div>`;
    });

    const subtotalEl =
    document.getElementById("subtotal");

    const totalEl =
    document.getElementById("total");

    if(subtotalEl){
        subtotalEl.innerText =
        `R$ ${formatarPreco(total)}`;
    }

    if(totalEl){
        totalEl.innerText =
        `R$ ${formatarPreco(total)}`;
    }

    if(resumo)
        resumo.style.display = "block";

    if(formularioSection)
        formularioSection.style.display = "block";

    atualizarContador();
}

/* =========================
   FINALIZAR PEDIDO
========================= */

function finalizarPedido() {

    const nome =
    document.getElementById("nome").value.trim();

    const telefone =
    document.getElementById("telefone")
    .value.replace(/\D/g, '');

    const pagamento =
    document.getElementById("formaPagamento").value;

    const entrega =
    document.getElementById("tipoEntrega").value;

    const endereco =
    document.getElementById("endereco").value.trim();

    if (!nome) {
        toast("Informe seu nome completo.", "aviso");
        return;
    }

    if (telefone.length < 10) {
        toast("Informe um telefone válido.", "aviso");
        return;
    }

    if (
        entrega === "DELIVERY" &&
        !endereco
    ) {
        toast("Informe o endereço de entrega.", "aviso");
        return;
    }

    if(carrinho.length === 0){
        toast("Seu carrinho está vazio!", "aviso");
        return;
    }

    let mensagem =
    "*Novo Pedido* 🛒\n\n";

    mensagem +=
    `*Cliente:* ${nome}\n`;

    mensagem +=
    `*Telefone:* ${document.getElementById("telefone").value}\n`;

    mensagem +=
    `*Pagamento:* ${pagamento}\n`;

    mensagem +=
    `*Entrega:* ${
        entrega === "DELIVERY"
        ? "Delivery - " + endereco
        : "Retirada no local"
    }\n\n`;

    mensagem += "*Itens:*\n";

    let total = 0;

    carrinho.forEach(item => {

        const subtotal =
        item.produto.preco *
        item.quantidade;

        total += subtotal;

        mensagem +=
        `• ${item.produto.nome} x${item.quantidade} = R$ ${formatarPreco(subtotal)}\n`;
    });

    mensagem +=
    `\n*Total: R$ ${formatarPreco(total)}*`;

    window.open(
    `https://wa.me/5549998290681?text=${encodeURIComponent(mensagem)}`,
    "_blank"
);

    carrinho = [];

    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );

    carregarCarrinho();
    atualizarContador();
}

/* =========================
   LOGIN ADMIN
========================= */

function fazerLogin(){

    const usuario =
    document.getElementById("usuario").value;

    const senha =
    document.getElementById("senha").value;

    if(
        usuario === "admin" &&
        senha === "1234"
    ){

        localStorage.setItem(
            "adminLogado",
            "true"
        );

        toast("Login realizado com sucesso!", "sucesso", "Bem-vindo!");

        setTimeout(() => {
            window.location.href = "admin.html";
        }, 1000);

    }else{

        toast("Usuário ou senha incorretos.", "erro", "Acesso negado");
    }
}

function verificarLogin(){

    const logado =
    localStorage.getItem("adminLogado");

    if(logado !== "true"){

        window.location.href =
        "login.html";
    }
}

function sairAdmin(){

    localStorage.removeItem(
        "adminLogado"
    );

    window.location.href =
    "login.html";
}

function voltarInicio(){

    window.location.href =
    "index.html";
}

/* =========================
   ADMIN
========================= */

async function cadastrarProduto(){

    const nome =
    document.getElementById("nomeProduto").value.trim();

    const descricao =
    document.getElementById("descricaoProduto").value.trim();

    const preco =
    parseFloat(document.getElementById("precoProduto").value);

    const categoria =
    document.getElementById("categoriaProduto").value;

    if(!nome || !descricao || isNaN(preco) || preco <= 0){
        toast("Preencha todos os campos corretamente.", "aviso");
        return;
    }

    try{
        const resposta = await fetch(API + "/produtos", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ nome, descricao, preco, categoria })
        });

        if(resposta.ok){
            toast(`"${nome}" cadastrado com sucesso!`, "sucesso", "Produto adicionado");
            document.getElementById("nomeProduto").value = "";
            document.getElementById("descricaoProduto").value = "";
            document.getElementById("precoProduto").value = "";
        } else {
            toast("Erro ao cadastrar produto.", "erro");
        }
    } catch(e){
        toast("Não foi possível conectar ao servidor.", "erro");
    }
}

async function carregarPedidosAdmin(){

    verificarLogin();

    const lista =
    document.getElementById("listaPedidos");

    if(!lista) return;

    try{
        const resposta = await fetch(API + "/pedidos");
        const pedidos = await resposta.json();

        if(pedidos.length === 0){
            lista.innerHTML =
            '<p style="color:#999;font-size:14px;text-align:center;padding:20px;">Nenhum pedido ainda.</p>';
            return;
        }

        lista.innerHTML = pedidos.map(p => `
            <div class="pedido-card">
                <strong>#${p.id} — ${p.nomeCliente}</strong>
                <p style="font-size:13px;color:#666;margin-top:4px;">${p.entrega} · ${p.pagamento}</p>
            </div>
        `).join("");

    } catch(e){
        lista.innerHTML =
        '<p style="color:#999;font-size:14px;text-align:center;padding:20px;">Não foi possível carregar os pedidos.</p>';
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        atualizarContador();

        if(
            document.getElementById(
                "listaProdutos"
            )
        ){
            carregarProdutos();
        }

        if(
            document.getElementById(
                "itensCarrinho"
            )
        ){
            carregarCarrinho();
        }
    }
);