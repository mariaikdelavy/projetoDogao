package com.dogao.dogao.service;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dogao.dogao.model.ContadorPedido;
import com.dogao.dogao.repository.ContadorPedidoRepository;

@Service
public class NumeroPedidoService {

    @Autowired
    private ContadorPedidoRepository contadorRepository;

    /**
     * Devolve o próximo número de pedido do dia informado (1, 2, 3...).
     * Deve rodar na mesma transação que grava o pedido: se o pedido falhar,
     * o número volta atrás e não fica "buraco" na sequência.
     */
    @Transactional
    public int proximoNumero(LocalDate dia) {

        contadorRepository.garantirDia(dia);

        ContadorPedido contador = contadorRepository.buscarComLock(dia).orElseThrow();

        int proximo = contador.getUltimoNumero() + 1;
        contador.setUltimoNumero(proximo);
        contadorRepository.save(contador);

        return proximo;
    }
}
