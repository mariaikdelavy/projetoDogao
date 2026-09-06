package com.dogao.dogao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dogao.dogao.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

	boolean existsByNomeIgnoreCase(String nome);

	List<Categoria> findAllByOrderByNomeAsc();

}