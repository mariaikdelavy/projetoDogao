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
   CATEGORIAS (menu da tela inicial)
========================= */

function alterarCategoria(botaoSelecionado){

    const botoes =
    document.querySelectorAll(".categorias button");

    botoes.forEach(botao => {
        botao.classList.remove("ativo");
    });

    botaoSelecionado.classList.add("ativo");
}

// Monta o menu de categorias da tela inicial dinamicamente.
// Só entram categorias que têm ao menos 1 produto ativo (o backend já
// filtra isso em /categorias/disponiveis).
async function carregarCategoriasNav(){

    const nav =
    document.getElementById("navCategorias");

    if(!nav) return;

    try{
        const resposta = await fetch(API + "/categorias/disponiveis");
        const categorias = await resposta.json();

        if(categorias.length === 0){
            nav.innerHTML = "";
            const lista = document.getElementById("listaProdutos");
            if(lista){
                lista.innerHTML =
                '<p style="text-align:center;color:#999;padding:30px;">Nenhum produto disponível no momento.</p>';
            }
            return;
        }

        nav.innerHTML = categorias.map((categoria, index) => `
            <button
                class="${index === 0 ? "ativo" : ""}"
                onclick="carregarProdutos(${categoria.id}); alterarCategoria(this)">
                ${categoria.nome}
            </button>
        `).join("");

        carregarProdutos(categorias[0].id);

    } catch(e){
        nav.innerHTML = "";
    }
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

let ultimaRequisicaoProdutos = 0;

// Busca os produtos de uma categoria (por id). O backend já devolve a
// lista com os produtos em destaque primeiro e o restante do menor
// para o maior preço.
async function carregarProdutos(categoriaId){

    if(categoriaId === undefined || categoriaId === null) return;

    const idRequisicao = ++ultimaRequisicaoProdutos;

    const resposta =
    await fetch(`${API}/produtos/categoria/${categoriaId}`);

    // Se outra chamada mais recente já foi feita enquanto esperávamos
    // essa resposta, ignoramos o resultado desatualizado
    if(idRequisicao !== ultimaRequisicaoProdutos) return;

    const produtos =
    await resposta.json();

    renderizarProdutos(produtos, "listaProdutos");

    atualizarContador();
}

// Seção de "Destaques" da tela inicial: produtos marcados como destaque,
// de qualquer categoria. A seção inteira fica escondida se não houver
// nenhum produto em destaque no momento.
async function carregarDestaques(){

    const secao =
    document.getElementById("secaoDestaques");

    if(!secao) return;

    try{
        const resposta = await fetch(API + "/produtos/destaques");
        const produtos = await resposta.json();

        if(produtos.length === 0){
            secao.style.display = "none";
            return;
        }

        secao.style.display = "block";
        renderizarProdutos(produtos, "listaDestaques");

    } catch(e){
        secao.style.display = "none";
    }
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

function renderizarProdutos(produtos, idContainer = "listaProdutos"){

    const lista =
    document.getElementById(idContainer);

    if(!lista) return;

    if(produtos.length === 0){
        lista.innerHTML =
        '<p style="text-align:center;color:#999;padding:20px;">Nenhum produto por aqui ainda.</p>';
        return;
    }

    lista.innerHTML = "";

    produtos.forEach(produto => {

        const emPromocao =
        produto.promocao && produto.precoPromocional != null;

        const precoExibido =
        emPromocao ? produto.precoPromocional : produto.preco;

        lista.innerHTML += `

        <div class="card-produto">

            <img src="${API}/produtos/${produto.id}/imagem"
                onerror="this.onerror=null; this.src='${imgProdutos[produto.nome] || "../static/assets/logo.jpg"}';">

            <div class="info-produto">

                <div class="selos-produto">
                    ${produto.destaque ? '<span class="selo selo-destaque">⭐ Destaque</span>' : ""}
                    ${emPromocao ? '<span class="selo selo-promocao">🔥 Promoção</span>' : ""}
                </div>

                <div class="topo-produto">

                    <h2>${produto.nome}</h2>

                    <span class="preco-produto">
                        ${emPromocao ? `<span class="preco-riscado">R$ ${formatarPreco(produto.preco)}</span>` : ""}
                        R$ ${formatarPreco(precoExibido)}
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

    // Se o produto está em promoção, usa o preço promocional no carrinho
    if(produto.promocao && produto.precoPromocional != null){
        produto.preco = produto.precoPromocional;
    }

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

        // Guarda o cabeçalho de autenticação para as requisições
        // de admin (POST/PUT/PATCH) exigidas pelo backend
        localStorage.setItem(
            "adminAuth",
            btoa(`${usuario}:${senha}`)
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

    localStorage.removeItem(
        "adminAuth"
    );

    window.location.href =
    "login.html";
}

// Cabeçalhos usados nas requisições que exigem admin (POST/PUT/PATCH em /produtos)
function headersAdmin(){

    const auth =
    localStorage.getItem("adminAuth");

    return {
        "Content-Type": "application/json",
        "Authorization": "Basic " + auth
    };
}

function voltarInicio(){

    window.location.href =
    "index.html";
}

/* =========================
   ADMIN
========================= */

async function salvarProduto(){

    const idProduto =
    document.getElementById("idProduto").value;

    const nome =
    document.getElementById("nomeProduto").value.trim();

    const descricao =
    document.getElementById("descricaoProduto").value.trim();

    const preco =
    parseFloat(document.getElementById("precoProduto").value);

    const categoriaId =
    parseInt(document.getElementById("categoriaProduto").value);

    const destaque =
    document.getElementById("destaqueProduto").checked;

    const promocao =
    document.getElementById("promocaoProduto").checked;

    const precoPromocional =
    promocao ? parseFloat(document.getElementById("precoPromocionalProduto").value) : null;

    const inputImagem =
    document.getElementById("imagemProduto");

    const arquivoImagem =
    inputImagem.files[0];

    if(!nome || !descricao || isNaN(preco) || preco <= 0 || isNaN(categoriaId)){
        toast("Preencha todos os campos corretamente.", "aviso");
        return;
    }

    if(promocao && (isNaN(precoPromocional) || precoPromocional <= 0)){
        toast("Informe um preço promocional válido.", "aviso");
        return;
    }

    const emEdicao = idProduto !== "";

    const url = emEdicao
        ? `${API}/produtos/${idProduto}`
        : `${API}/produtos`;

    const metodo = emEdicao ? "PUT" : "POST";

    try{
        const resposta = await fetch(url, {
            method: metodo,
            headers: headersAdmin(),
            body: JSON.stringify({
                nome,
                descricao,
                preco,
                categoriaId,
                destaque,
                promocao,
                precoPromocional
            })
        });

        if(resposta.ok){

            const produtoSalvo = await resposta.json();

            // Se o usuário selecionou um arquivo, envia a imagem
            // logo em seguida, usando o id do produto salvo/editado
            if(arquivoImagem){
                await enviarImagemProduto(produtoSalvo.id, arquivoImagem);
            }

            toast(
                emEdicao
                    ? `"${nome}" atualizado com sucesso!`
                    : `"${nome}" cadastrado com sucesso!`,
                "sucesso",
                emEdicao ? "Produto atualizado" : "Produto adicionado"
            );

            cancelarEdicaoProduto();
            carregarProdutosAdmin();

        } else if(resposta.status === 401 || resposta.status === 403){
            toast("Sessão de admin inválida. Faça login novamente.", "erro");
        } else {
            toast("Erro ao salvar produto.", "erro");
        }
    } catch(e){
        toast("Não foi possível conectar ao servidor.", "erro");
    }
}

// Envia o arquivo de imagem para o produto já salvo.
// NÃO define Content-Type manualmente aqui: o navegador precisa
// gerar o boundary do multipart/form-data sozinho.
async function enviarImagemProduto(id, arquivo){

    const auth = localStorage.getItem("adminAuth");

    const formData = new FormData();
    formData.append("arquivo", arquivo);

    try{
        const resposta = await fetch(`${API}/produtos/${id}/imagem`, {
            method: "POST",
            headers: {
                "Authorization": "Basic " + auth
            },
            body: formData
        });

        if(!resposta.ok){
            toast("Produto salvo, mas houve erro ao enviar a imagem.", "aviso");
        }
    } catch(e){
        toast("Produto salvo, mas não foi possível enviar a imagem.", "aviso");
    }
}

// Preenche o formulário com os dados do produto para edição
function editarProduto(produto){

    document.getElementById("idProduto").value = produto.id;
    document.getElementById("nomeProduto").value = produto.nome;
    document.getElementById("descricaoProduto").value = produto.descricao;
    document.getElementById("precoProduto").value = produto.preco;
    document.getElementById("categoriaProduto").value = produto.categoria ? produto.categoria.id : "";

    document.getElementById("destaqueProduto").checked = !!produto.destaque;

    document.getElementById("promocaoProduto").checked = !!produto.promocao;
    document.getElementById("precoPromocionalProduto").value =
    produto.precoPromocional != null ? produto.precoPromocional : "";
    togglePrecoPromocional();

    // Limpa o input de arquivo (não dá pra pré-preencher um <input type="file">)
    document.getElementById("imagemProduto").value = "";

    const preview = document.getElementById("previewImagemProduto");

    if(produto.nomeImagem){
        preview.src = `${API}/produtos/${produto.id}/imagem`;
        preview.style.display = "block";
    } else {
        preview.src = "";
        preview.style.display = "none";
    }

    document.getElementById("tituloFormProduto").innerText =
    `Editando: ${produto.nome}`;

    document.getElementById("btnSalvarProduto").innerText =
    "Salvar Edição";

    document.getElementById("btnCancelarEdicao").style.display =
    "block";

    document.querySelector(".novo-produto")
    .scrollIntoView({ behavior: "smooth" });
}

// Limpa o formulário e volta ao modo "novo produto"
function cancelarEdicaoProduto(){

    document.getElementById("idProduto").value = "";
    document.getElementById("nomeProduto").value = "";
    document.getElementById("descricaoProduto").value = "";
    document.getElementById("precoProduto").value = "";
    document.getElementById("categoriaProduto").value = "";

    document.getElementById("destaqueProduto").checked = false;
    document.getElementById("promocaoProduto").checked = false;
    document.getElementById("precoPromocionalProduto").value = "";
    togglePrecoPromocional();

    document.getElementById("imagemProduto").value = "";

    const preview = document.getElementById("previewImagemProduto");
    preview.src = "";
    preview.style.display = "none";

    document.getElementById("tituloFormProduto").innerText =
    "Novo Produto";

    document.getElementById("btnSalvarProduto").innerText =
    "Cadastrar Produto";

    document.getElementById("btnCancelarEdicao").style.display =
    "none";
}

// Mostra/esconde o campo de preço promocional dependendo do checkbox "Em promoção"
function togglePrecoPromocional(){

    const checkbox = document.getElementById("promocaoProduto");
    const campo = document.getElementById("campoPrecoPromocional");

    if(!checkbox || !campo) return;

    campo.style.display = checkbox.checked ? "block" : "none";
}

// Popula o <select> de categoria do formulário de produto com as
// categorias já cadastradas (busca sempre a lista mais atual)
async function carregarCategoriasSelect(){

    const select =
    document.getElementById("categoriaProduto");

    if(!select) return;

    try{
        const resposta = await fetch(API + "/categorias");
        const categorias = await resposta.json();

        if(categorias.length === 0){
            select.innerHTML =
            '<option value="">Cadastre uma categoria primeiro</option>';
            return;
        }

        select.innerHTML =
        '<option value="">Selecione a categoria</option>' +
        categorias.map(categoria =>
            `<option value="${categoria.id}">${categoria.nome}</option>`
        ).join("");

    } catch(e){
        select.innerHTML =
        '<option value="">Não foi possível carregar as categorias</option>';
    }
}

function previewImagemProduto(event){

    const arquivo = event.target.files[0];
    const preview = document.getElementById("previewImagemProduto");

    if(arquivo){
        preview.src = URL.createObjectURL(arquivo);
        preview.style.display = "block";
    } else {
        preview.src = "";
        preview.style.display = "none";
    }
}

// Carrega TODOS os produtos (ativos e inativos) para o painel admin
async function carregarProdutosAdmin(){

    verificarLogin();

    const lista =
    document.getElementById("listaProdutosAdmin");

    if(!lista) return;

    try{
        const resposta = await fetch(API + "/produtos/admin/todos");
        const produtos = await resposta.json();

        renderizarProdutosAdmin(produtos);

    } catch(e){
        lista.innerHTML =
        '<p style="color:#999;font-size:14px;text-align:center;padding:20px;">Não foi possível carregar os produtos.</p>';
    }
}

function renderizarProdutosAdmin(produtos){

    const lista =
    document.getElementById("listaProdutosAdmin");

    if(!lista) return;

    if(produtos.length === 0){
        lista.innerHTML =
        '<p style="color:#999;font-size:14px;text-align:center;padding:20px;">Nenhum produto cadastrado ainda.</p>';
        return;
    }

    lista.innerHTML = produtos.map(produto => `

        <div class="produto-admin-card ${produto.ativo ? "" : "inativo"}">

            <img src="${API}/produtos/${produto.id}/imagem"
                onerror="this.onerror=null; this.src='${imgProdutos[produto.nome] || "../static/assets/logo.jpg"}';"
                style="width:60px;height:60px;object-fit:cover;border-radius:6px;">

            <div class="produto-admin-info">
                <strong>${produto.nome}</strong>
                <span>${produto.categoria ? produto.categoria.nome : "Sem categoria"} · R$ ${formatarPreco(produto.preco)}</span>
                <div class="produto-admin-selos">
                    <span class="produto-admin-status ${produto.ativo ? "status-ativo" : "status-inativo"}">
                        ${produto.ativo ? "Ativo" : "Inativo"}
                    </span>
                    ${produto.destaque ? '<span class="produto-admin-status status-destaque">⭐ Destaque</span>' : ""}
                    ${produto.promocao ? '<span class="produto-admin-status status-promocao">🔥 Promoção</span>' : ""}
                </div>
            </div>

            <div class="produto-admin-acoes">

                <button
                    class="btn-editar-produto"
                    onclick='editarProduto(${JSON.stringify(produto)})'>
                    Editar
                </button>

                ${produto.destaque
                    ? `<button class="btn-destaque-produto ativo" onclick="alternarDestaque(${produto.id}, false)">Remover destaque</button>`
                    : `<button class="btn-destaque-produto" onclick="alternarDestaque(${produto.id}, true)">Destacar</button>`
                }

                ${produto.ativo
                    ? `<button class="btn-inativar-produto" onclick="inativarProduto(${produto.id})">Inativar</button>`
                    : `<button class="btn-reativar-produto" onclick="reativarProduto(${produto.id})">Reativar</button>`
                }

            </div>

        </div>
    `).join("");
}

// Liga/desliga o destaque de um produto direto pela lista do admin,
// sem precisar abrir o formulário de edição
async function alternarDestaque(id, novoValor){

    try{
        const resposta = await fetch(`${API}/produtos/${id}/destaque`, {
            method: "PATCH",
            headers: headersAdmin(),
            body: JSON.stringify({ destaque: novoValor })
        });

        if(resposta.ok){
            toast(
                novoValor ? "Produto marcado como destaque." : "Destaque removido.",
                "sucesso"
            );
            carregarProdutosAdmin();
        } else if(resposta.status === 401 || resposta.status === 403){
            toast("Sessão de admin inválida. Faça login novamente.", "erro");
        } else {
            toast("Erro ao atualizar destaque.", "erro");
        }
    } catch(e){
        toast("Não foi possível conectar ao servidor.", "erro");
    }
}

// Modal de confirmação customizado, no estilo do site.
// Uso: const ok = await confirmar("Título", "Mensagem"); if(ok){ ... }
function confirmar(titulo, mensagem, textoConfirmar = "Confirmar"){

    return new Promise((resolve) => {

        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";

        overlay.innerHTML = `
            <div class="confirm-modal">
                <h3>${titulo}</h3>
                <p>${mensagem}</p>
                <div class="confirm-acoes">
                    <button class="confirm-cancelar">Cancelar</button>
                    <button class="confirm-ok">${textoConfirmar}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        function fechar(resultado){
            overlay.remove();
            resolve(resultado);
        }

        overlay.querySelector(".confirm-ok")
            .addEventListener("click", () => fechar(true));

        overlay.querySelector(".confirm-cancelar")
            .addEventListener("click", () => fechar(false));

        overlay.addEventListener("click", (e) => {
            if(e.target === overlay) fechar(false);
        });
    });
}

async function inativarProduto(id){

    const ok = await confirmar(
        "Inativar produto",
        "Ele deixará de aparecer no cardápio, mas continua no histórico de pedidos já feitos.",
        "Inativar"
    );

    if(!ok) return;

    try{
        const resposta = await fetch(`${API}/produtos/${id}/inativar`, {
            method: "PATCH",
            headers: headersAdmin()
        });

        if(resposta.ok){
            toast("Produto inativado.", "sucesso");
            carregarProdutosAdmin();
        } else if(resposta.status === 401 || resposta.status === 403){
            toast("Sessão de admin inválida. Faça login novamente.", "erro");
        } else {
            toast("Erro ao inativar produto.", "erro");
        }
    } catch(e){
        toast("Não foi possível conectar ao servidor.", "erro");
    }
}

async function reativarProduto(id){

    try{
        const resposta = await fetch(`${API}/produtos/${id}/reativar`, {
            method: "PATCH",
            headers: headersAdmin()
        });

        if(resposta.ok){
            toast("Produto reativado.", "sucesso");
            carregarProdutosAdmin();
        } else if(resposta.status === 401 || resposta.status === 403){
            toast("Sessão de admin inválida. Faça login novamente.", "erro");
        } else {
            toast("Erro ao reativar produto.", "erro");
        }
    } catch(e){
        toast("Não foi possível conectar ao servidor.", "erro");
    }
}

/* =========================
   ADMIN - CATEGORIAS
========================= */

// Carrega todas as categorias para a tela de gestão de categorias do admin
async function carregarCategoriasAdmin(){

    verificarLogin();

    const lista =
    document.getElementById("listaCategoriasAdmin");

    if(!lista) return;

    try{
        const resposta = await fetch(API + "/categorias");
        const categorias = await resposta.json();

        renderizarCategoriasAdmin(categorias);

    } catch(e){
        lista.innerHTML =
        '<p style="color:#999;font-size:14px;text-align:center;padding:20px;">Não foi possível carregar as categorias.</p>';
    }
}

function renderizarCategoriasAdmin(categorias){

    const lista =
    document.getElementById("listaCategoriasAdmin");

    if(!lista) return;

    if(categorias.length === 0){
        lista.innerHTML =
        '<p style="color:#999;font-size:14px;text-align:center;padding:20px;">Nenhuma categoria cadastrada ainda.</p>';
        return;
    }

    lista.innerHTML = categorias.map(categoria => `

        <div class="produto-admin-card">

            <div class="produto-admin-info">
                <strong>${categoria.nome}</strong>
            </div>

            <div class="produto-admin-acoes">

                <button
                    class="btn-editar-produto"
                    onclick='editarCategoria(${JSON.stringify(categoria)})'>
                    Editar
                </button>

                <button
                    class="btn-inativar-produto"
                    onclick="excluirCategoria(${categoria.id}, '${categoria.nome.replace(/'/g, "\\'")}')">
                    Excluir
                </button>

            </div>

        </div>
    `).join("");
}

// Cria uma nova categoria ou salva a edição de uma já existente
async function salvarCategoria(){

    const idCategoria =
    document.getElementById("idCategoria").value;

    const nome =
    document.getElementById("nomeCategoria").value.trim();

    if(!nome){
        toast("Digite o nome da categoria.", "aviso");
        return;
    }

    const emEdicao = idCategoria !== "";

    const url = emEdicao
        ? `${API}/categorias/${idCategoria}`
        : `${API}/categorias`;

    const metodo = emEdicao ? "PUT" : "POST";

    try{
        const resposta = await fetch(url, {
            method: metodo,
            headers: headersAdmin(),
            body: JSON.stringify({ nome })
        });

        if(resposta.ok){

            toast(
                emEdicao
                    ? `"${nome}" atualizada com sucesso!`
                    : `"${nome}" cadastrada com sucesso!`,
                "sucesso",
                emEdicao ? "Categoria atualizada" : "Categoria adicionada"
            );

            cancelarEdicaoCategoria();
            carregarCategoriasAdmin();

        } else if(resposta.status === 401 || resposta.status === 403){
            toast("Sessão de admin inválida. Faça login novamente.", "erro");
        } else if(resposta.status === 409){
            const mensagem = await resposta.text();
            toast(mensagem || "Já existe uma categoria com esse nome.", "aviso");
        } else {
            toast("Erro ao salvar categoria.", "erro");
        }
    } catch(e){
        toast("Não foi possível conectar ao servidor.", "erro");
    }
}

// Preenche o formulário com os dados da categoria para edição (renomear)
function editarCategoria(categoria){

    document.getElementById("idCategoria").value = categoria.id;
    document.getElementById("nomeCategoria").value = categoria.nome;

    document.getElementById("tituloFormCategoria").innerText =
    `Editando: ${categoria.nome}`;

    document.getElementById("btnSalvarCategoria").innerText =
    "Salvar Edição";

    document.getElementById("btnCancelarEdicaoCategoria").style.display =
    "block";

    document.querySelector(".novo-produto")
    .scrollIntoView({ behavior: "smooth" });
}

// Limpa o formulário e volta ao modo "nova categoria"
function cancelarEdicaoCategoria(){

    document.getElementById("idCategoria").value = "";
    document.getElementById("nomeCategoria").value = "";

    document.getElementById("tituloFormCategoria").innerText =
    "Nova Categoria";

    document.getElementById("btnSalvarCategoria").innerText =
    "Cadastrar Categoria";

    document.getElementById("btnCancelarEdicaoCategoria").style.display =
    "none";
}

async function excluirCategoria(id, nome){

    const ok = await confirmar(
        "Excluir categoria",
        `Tem certeza que deseja excluir "${nome}"? Só é possível excluir categorias sem produtos vinculados.`,
        "Excluir"
    );

    if(!ok) return;

    try{
        const resposta = await fetch(`${API}/categorias/${id}`, {
            method: "DELETE",
            headers: headersAdmin()
        });

        if(resposta.ok){
            toast("Categoria excluída.", "sucesso");
            carregarCategoriasAdmin();
        } else if(resposta.status === 401 || resposta.status === 403){
            toast("Sessão de admin inválida. Faça login novamente.", "erro");
        } else if(resposta.status === 409){
            const mensagem = await resposta.text();
            toast(mensagem || "Não é possível excluir essa categoria.", "aviso");
        } else {
            toast("Erro ao excluir categoria.", "erro");
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
                "navCategorias"
            )
        ){
            carregarCategoriasNav();
        }

        if(
            document.getElementById(
                "itensCarrinho"
            )
        ){
            carregarCarrinho();
        }

        if(
            document.getElementById(
                "categoriaProduto"
            )
        ){
            carregarCategoriasSelect();
        }

        if(
            document.getElementById(
                "listaCategoriasAdmin"
            )
        ){
            carregarCategoriasAdmin();
        }
    }
);