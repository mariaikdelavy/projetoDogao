package com.dogao.dogao.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dogao.dogao.dto.CategoriaRequest;
import com.dogao.dogao.model.Categoria;
import com.dogao.dogao.repository.CategoriaRepository;
import com.dogao.dogao.repository.ProdutoRepository;

@RestController
@RequestMapping("/categorias")
@CrossOrigin("*")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;

    public CategoriaController(CategoriaRepository categoriaRepository, ProdutoRepository produtoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.produtoRepository = produtoRepository;
    }

    @GetMapping
    public List<Categoria> listar() {
        return categoriaRepository.findAllByOrderByNomeAsc();
    }

    @GetMapping("/disponiveis")
    public List<Categoria> listarDisponiveis() {
        return categoriaRepository.findAllByOrderByNomeAsc()
                .stream()
                .filter(categoria -> produtoRepository.existsByCategoriaIdAndAtivoTrue(categoria.getId()))
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody CategoriaRequest dto) {
        if (dto.getNome() == null || dto.getNome().isBlank()) {
            return ResponseEntity.badRequest().body("Nome da categoria é obrigatório");
        }

        String nome = dto.getNome().trim();

        if (categoriaRepository.existsByNomeIgnoreCase(nome)) {
            return ResponseEntity.status(409).body("Já existe uma categoria com esse nome");
        }

        Categoria categoria = new Categoria();
        categoria.setNome(nome);
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody CategoriaRequest dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        if (dto.getNome() == null || dto.getNome().isBlank()) {
            return ResponseEntity.badRequest().body("Nome da categoria é obrigatório");
        }

        String nome = dto.getNome().trim();

        boolean nomeEmUsoPorOutraCategoria = categoriaRepository.existsByNomeIgnoreCase(nome)
                && !categoria.getNome().equalsIgnoreCase(nome);

        if (nomeEmUsoPorOutraCategoria) {
            return ResponseEntity.status(409).body("Já existe uma categoria com esse nome");
        }

        categoria.setNome(nome);
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        long qtdProdutos = produtoRepository.countByCategoriaId(id);

        if (qtdProdutos > 0) {
            return ResponseEntity.status(409)
                    .body("Não é possível excluir: existem " + qtdProdutos
                            + " produto(s) cadastrados nessa categoria. Mova ou remova esses produtos antes.");
        }

        categoriaRepository.delete(categoria);
        return ResponseEntity.noContent().build();
    }
}