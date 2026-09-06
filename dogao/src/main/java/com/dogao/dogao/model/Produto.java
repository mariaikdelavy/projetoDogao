package com.dogao.dogao.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Entity
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotBlank(message = "Descrição é obrigatória")
    private String descricao;

    @NotNull(message = "Preço é obrigatório")
    private Double preco;

    // Relacionamento com Categoria (antes era um texto solto).
    // Sem nullable=false aqui de propósito: evita que o Hibernate tente
    // criar a coluna como NOT NULL numa tabela que já tem produtos
    // cadastrados. A obrigatoriedade é garantida no ProdutoController.
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @NotNull(message = "Ativo é obrigatório")
    private Boolean ativo = true;

    // Produto em destaque: sobe para o topo da lista da categoria e
    // aparece na seção de destaques da tela inicial
    // (sem @NotNull de propósito: evita que o Hibernate tente criar a
    // coluna como NOT NULL numa tabela "produto" que já tem registros)
    private Boolean destaque = false;

    // Produto em promoção: exibe o preço promocional riscando o preço normal
    private Boolean promocao = false;

    // Só é relevante quando promocao = true
    private Double precoPromocional;

    // Nome do arquivo de imagem salvo no servidor (ex: "3f2a1b-tenis.jpg")
    // Não é obrigatório, pois produto pode não ter imagem própria (usa a padrão no front)
    private String nomeImagem;

    @JsonIgnore
    @OneToMany(mappedBy = "produto")
    private List<ItemPedido> itens;

    public Produto() {
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Boolean getDestaque() {
        return destaque;
    }

    public void setDestaque(Boolean destaque) {
        this.destaque = destaque;
    }

    public Boolean getPromocao() {
        return promocao;
    }

    public void setPromocao(Boolean promocao) {
        this.promocao = promocao;
    }

    public Double getPrecoPromocional() {
        return precoPromocional;
    }

    public void setPrecoPromocional(Double precoPromocional) {
        this.precoPromocional = precoPromocional;
    }

    public String getNomeImagem() {
        return nomeImagem;
    }

    public void setNomeImagem(String nomeImagem) {
        this.nomeImagem = nomeImagem;
    }
}
