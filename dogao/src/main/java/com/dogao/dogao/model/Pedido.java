package com.dogao.dogao.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

@Entity
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime data;

    private String formaPagamento;

    private String tipoEntrega;

    private String endereco;

    private Double total;

    private String status;

    // Tempo estimado de preparo (em minutos), definido apenas no momento em
    // que o pedido é aceito e passa para o status EM_PREPARO
    private Integer tempoEstimadoPreparo;

    // Momento em que o pedido foi aceito pela cozinha/admin
    private LocalDateTime horarioAceite;

    @ManyToOne
    private Cliente cliente;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    private List<ItemPedido> itens;

    public Pedido() {
        this.data = LocalDateTime.now();
        // Todo pedido novo nasce aguardando aceite. Só vira EM_PREPARO
        // quando o admin aceita e informa o tempo estimado de preparo.
        this.status = "PENDENTE";
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getData() {
        return data;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public String getTipoEntrega() {
        return tipoEntrega;
    }

    public void setTipoEntrega(String tipoEntrega) {
        this.tipoEntrega = tipoEntrega;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getTempoEstimadoPreparo() {
        return tempoEstimadoPreparo;
    }

    public void setTempoEstimadoPreparo(Integer tempoEstimadoPreparo) {
        this.tempoEstimadoPreparo = tempoEstimadoPreparo;
    }

    public LocalDateTime getHorarioAceite() {
        return horarioAceite;
    }

    public void setHorarioAceite(LocalDateTime horarioAceite) {
        this.horarioAceite = horarioAceite;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public List<ItemPedido> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedido> itens) {
        this.itens = itens;
    }
}