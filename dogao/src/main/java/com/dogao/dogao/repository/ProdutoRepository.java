package com.dogao.dogao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dogao.dogao.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
	
	List<Produto> findByCategoria(String categoria);

}