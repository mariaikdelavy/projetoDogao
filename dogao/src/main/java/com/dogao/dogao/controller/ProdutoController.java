package com.dogao.dogao.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;
import java.util.Map;

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

import com.dogao.dogao.dto.ProdutoRequest;
import com.dogao.dogao.model.Categoria;
import com.dogao.dogao.model.Produto;
import com.dogao.dogao.repository.CategoriaRepository;
import com.dogao.dogao.repository.ProdutoRepository;
import com.dogao.dogao.service.ImagemService;

@RestController
@RequestMapping("/produtos")
@CrossOrigin("*")
public class ProdutoController {

    private final ProdutoRepository repository;
    private final CategoriaRepository categoriaRepository;
    private final ImagemService imagemService;

    public ProdutoController(ProdutoRepository repository, CategoriaRepository categoriaRepository,
            ImagemService imagemService) {
        this.repository = repository;
        this.categoriaRepository = categoriaRepository;
        this.imagemService = imagemService;
    }

    // LISTAR PRODUTOS ATIVOS (cardápio público) - destaque primeiro, depois promoção, depois menor pro maior preço
    @GetMapping
    public List<Produto> listar() {
        return repository.findByAtivoTrueOrderByDestaqueDescPromocaoDescPrecoAsc();
    }

    // LISTAR TODOS OS PRODUTOS, ATIVOS E INATIVOS (painel admin)
    @GetMapping("/admin/todos")
    public List<Produto> listarTodosAdmin() {
        return repository.findAll();
    }

    // LISTAR PRODUTOS EM DESTAQUE (seção de destaques da tela inicial)
    @GetMapping("/destaques")
    public List<Produto> listarDestaques() {
        return repository.findByDestaqueTrueAndAtivoTrueOrderByPrecoAsc();
    }

    // CRIAR PRODUTO
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody ProdutoRequest dto) {
        if (dto.getCategoriaId() == null) {
            return ResponseEntity.badRequest().body("Categoria é obrigatória");
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElse(null);

        if (categoria == null) {
            return ResponseEntity.badRequest().body("Categoria não encontrada");
        }

        Produto produto = new Produto();
        produto.setNome(dto.getNome());
        produto.setDescricao(dto.getDescricao());
        produto.setPreco(dto.getPreco());
        produto.setCategoria(categoria);
        produto.setAtivo(true);
        produto.setDestaque(Boolean.TRUE.equals(dto.getDestaque()));
        produto.setPromocao(Boolean.TRUE.equals(dto.getPromocao()));
        produto.setPrecoPromocional(Boolean.TRUE.equals(dto.getPromocao()) ? dto.getPrecoPromocional() : null);

        return ResponseEntity.ok(repository.save(produto));
    }

    // ATUALIZAR PRODUTO (não altera o status ativo/inativo)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody ProdutoRequest dto) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (dto.getCategoriaId() == null) {
            return ResponseEntity.badRequest().body("Categoria é obrigatória");
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElse(null);

        if (categoria == null) {
            return ResponseEntity.badRequest().body("Categoria não encontrada");
        }

        produto.setNome(dto.getNome());
        produto.setDescricao(dto.getDescricao());
        produto.setPreco(dto.getPreco());
        produto.setCategoria(categoria);
        produto.setDestaque(Boolean.TRUE.equals(dto.getDestaque()));
        produto.setPromocao(Boolean.TRUE.equals(dto.getPromocao()));
        produto.setPrecoPromocional(Boolean.TRUE.equals(dto.getPromocao()) ? dto.getPrecoPromocional() : null);

        return ResponseEntity.ok(repository.save(produto));
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

    // MARCAR/DESMARCAR PRODUTO COMO DESTAQUE
    @PatchMapping("/{id}/destaque")
    public ResponseEntity<?> alterarDestaque(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        produto.setDestaque(Boolean.TRUE.equals(body.get("destaque")));
        return ResponseEntity.ok(repository.save(produto));
    }

    // MARCAR/DESMARCAR PRODUTO COMO EM PROMOÇÃO (com preço promocional)
    @PatchMapping("/{id}/promocao")
    public ResponseEntity<?> alterarPromocao(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        boolean emPromocao = Boolean.TRUE.equals(body.get("promocao"));
        produto.setPromocao(emPromocao);

        if (emPromocao) {
            Object precoObj = body.get("precoPromocional");
            if (precoObj == null) {
                return ResponseEntity.badRequest().body("Informe o preço promocional");
            }
            produto.setPrecoPromocional(Double.valueOf(precoObj.toString()));
        } else {
            produto.setPrecoPromocional(null);
        }

        return ResponseEntity.ok(repository.save(produto));
    }

    // BUSCAR PRODUTO POR ID
    @GetMapping("/{id}")
    public Produto buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    // BUSCAR POR CATEGORIA (só produtos ativos, cardápio público)
    // destaque primeiro, depois promoção, depois do menor pro maior preço
    @GetMapping("/categoria/{categoriaId}")
    public List<Produto> buscarPorCategoria(@PathVariable Long categoriaId) {
        return repository.findByCategoriaIdAndAtivoTrueOrderByDestaqueDescPromocaoDescPrecoAsc(categoriaId);
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