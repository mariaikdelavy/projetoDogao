package com.dogao.dogao.dto;

public class AceitarPedidoRequest {

    // Tempo estimado de preparo, em minutos
    private Integer tempoEstimadoPreparo;

    public Integer getTempoEstimadoPreparo() {
        return tempoEstimadoPreparo;
    }

    public void setTempoEstimadoPreparo(Integer tempoEstimadoPreparo) {
        this.tempoEstimadoPreparo = tempoEstimadoPreparo;
    }
}