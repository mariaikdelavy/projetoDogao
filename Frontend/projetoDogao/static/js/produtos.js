const API = "http://localhost:8080/produtos";

const lista = document.getElementById("lista-produtos");

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

async function carregarProdutos(categoria) {

    const resposta = await fetch(API);

    const produtos = await resposta.json();

    const filtrados = produtos.filter(
        p => p.categoria === categoria
    );

    lista.innerHTML = "";

    filtrados.forEach(produto => {

        lista.innerHTML += `
            <div class="produto">

                <img src="img/dogao.png">

                <div class="info-produto">
                    <h2>${produto.nome}</h2>

                    <p>${produto.descricao}</p>

                    <span class="preco">
                        R$ ${produto.preco.toFixed(2)}
                    </span>
                </div>

                <button 
                    class="botao-adicionar"
                    onclick="adicionarCarrinho(${produto.id})"
                >
                    Adicionar
                </button>

            </div>
        `;
    });
}

async function adicionarCarrinho(id) {

    const resposta = await fetch(API + "/" + id);

    const produto = await resposta.json();

    const itemExistente = carrinho.find(
        item => item.id === produto.id
    );

    if(itemExistente) {
        itemExistente.quantidade++;
    } else {

        carrinho.push({
            ...produto,
            quantidade: 1
        });
    }

    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );

    alert("Produto adicionado!");
}

function irCarrinho() {
    window.location.href = "carrinho.html";
}

carregarProdutos("Dogões");