package com.dogao.dogao.repository;

import com.dogao.dogao.model.Pedido;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
	
	List<Pedido> findByStatus(String status);
	
}