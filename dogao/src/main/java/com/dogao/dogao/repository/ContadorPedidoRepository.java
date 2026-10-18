package com.dogao.dogao.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dogao.dogao.model.ContadorPedido;

import jakarta.persistence.LockModeType;

public interface ContadorPedidoRepository extends JpaRepository<ContadorPedido, LocalDate> {

    // Cria a linha do dia se ainda não existir (não dá erro se já existir,
    // mesmo com dois pedidos chegando ao mesmo tempo).
    @Modifying
    @Query(value = "INSERT IGNORE INTO contador_pedido (data, ultimo_numero) VALUES (:dia, 0)", nativeQuery = true)
    void garantirDia(@Param("dia") LocalDate dia);

    // SELECT ... FOR UPDATE: trava a linha até o fim da transação, então
    // dois pedidos simultâneos nunca recebem o mesmo número.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ContadorPedido c where c.data = :dia")
    Optional<ContadorPedido> buscarComLock(@Param("dia") LocalDate dia);
}
