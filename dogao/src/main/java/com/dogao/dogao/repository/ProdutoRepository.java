package com.dogao.dogao.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dogao.dogao.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

	// Lista de produtos ativos, com os produtos em destaque primeiro e,
	// dentro de cada grupo, do menor para o maior preço
	List<Produto> findByAtivoTrueOrderByDestaqueDescPromocaoDescPrecoAsc();

	// Mesma regra de ordenação, filtrando por categoria (cardápio público)
	List<Produto> findByCategoriaIdAndAtivoTrueOrderByDestaqueDescPromocaoDescPrecoAsc(Long categoriaId);

	// Produtos em destaque para a seção de destaques da tela inicial
	List<Produto> findByDestaqueTrueAndAtivoTrueOrderByPrecoAsc();

	// Usado para saber se uma categoria tem produto ativo (aparece ou não no cardápio)
	boolean existsByCategoriaIdAndAtivoTrue(Long categoriaId);

	// Usado para bloquear exclusão de categoria que ainda tem produtos vinculados
	long countByCategoriaId(Long categoriaId);

}
