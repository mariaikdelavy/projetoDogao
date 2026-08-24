package com.dogao.dogao.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dogao.dogao.model.Produto;
import com.dogao.dogao.repository.ProdutoRepository;
import com.dogao.dogao.service.ImagemService;

@RestController
@RequestMapping("/produtos")
@CrossOrigin("*")
public class ProdutoController {

    private final ProdutoRepository repository;
    private final ImagemService imagemService;

    public ProdutoController(ProdutoRepository repository, ImagemService imagemService) {
        this.repository = repository;
        this.imagemService = imagemService;
    }

    // LISTAR PRODUTOS ATIVOS (cardápio público)
    @GetMapping
    public List<Produto> listar() {
        return repository.findByAtivoTrue();
    }

    // LISTAR TODOS OS PRODUTOS, ATIVOS E INATIVOS (painel admin)
    @GetMapping("/admin/todos")
    public List<Produto> listarTodosAdmin() {
        return repository.findAll();
    }

    // CRIAR PRODUTO
    @PostMapping
    public Produto salvar(@RequestBody Produto produto) {
        produto.setAtivo(true);
        return repository.save(produto);
    }

    // ATUALIZAR PRODUTO (não altera o status ativo/inativo)
    @PutMapping("/{id}")
    public Produto atualizar(@PathVariable Long id, @RequestBody Produto produtoAtualizado) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        produto.setNome(produtoAtualizado.getNome());
        produto.setDescricao(produtoAtualizado.getDescricao());
        produto.setPreco(produtoAtualizado.getPreco());
        produto.setCategoria(produtoAtualizado.getCategoria());
        return repository.save(produto);
    }

    // INATIVAR PRODUTO (não aparece mais no cardápio, mas continua no histórico de pedidos)
    @PatchMapping("/{id}/inativar")
    public Produto inativar(@PathVariable Long id) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        produto.setAtivo(false);
        return repository.save(produto);
    }

    // REATIVAR PRODUTO
    @PatchMapping("/{id}/reativar")
    public Produto reativar(@PathVariable Long id) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        produto.setAtivo(true);
        return repository.save(produto);
    }

    // BUSCAR PRODUTO POR ID
    @GetMapping("/{id}")
    public Produto buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    // BUSCAR POR CATEGORIA (só produtos ativos, cardápio público)
    @GetMapping("/categoria/{categoria}")
    public List<Produto> buscarPorCategoria(@PathVariable String categoria) {
        return repository.findByCategoriaAndAtivoTrue(categoria);
    }

    // ENVIAR/TROCAR IMAGEM DE UM PRODUTO
    @PostMapping("/{id}/imagem")
    public Produto uploadImagem(@PathVariable Long id,
                                 @RequestParam("arquivo") MultipartFile arquivo) throws IOException {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        String nomeArquivo = imagemService.salvar(arquivo);
        produto.setNomeImagem(nomeArquivo);
        return repository.save(produto);
    }

    // EXIBIR A IMAGEM DO PRODUTO (usado no <img src="">)
    @GetMapping("/{id}/imagem")
    public ResponseEntity<Resource> getImagem(@PathVariable Long id) throws MalformedURLException {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (produto.getNomeImagem() == null) {
            return ResponseEntity.notFound().build();
        }

        Resource imagem = imagemService.carregar(produto.getNomeImagem());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(imagem);
    }
}