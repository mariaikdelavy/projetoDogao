package com.dogao.dogao.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Uma linha por dia com o último número de pedido usado naquele dia.
 * Quando chega o primeiro pedido de um dia novo, a linha desse dia ainda não
 * existe, então a contagem começa de novo a partir do #1.
 */
@Entity
@Table(name = "contador_pedido")
public class ContadorPedido {

    @Id
    @Column(name = "data")
    private LocalDate data;

    @Column(name = "ultimo_numero", nullable = false)
    private Integer ultimoNumero = 0;

    public ContadorPedido() {
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Integer getUltimoNumero() {
        return ultimoNumero;
    }

    public void setUltimoNumero(Integer ultimoNumero) {
        this.ultimoNumero = ultimoNumero;
    }
}
