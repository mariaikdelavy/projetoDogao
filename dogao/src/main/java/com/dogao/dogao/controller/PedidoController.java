package com.dogao.dogao.controller;

import com.dogao.dogao.model.Cliente;
import com.dogao.dogao.model.ItemPedido;
import com.dogao.dogao.model.Pedido;
import com.dogao.dogao.model.Produto;
import com.dogao.dogao.repository.ClienteRepository;
import com.dogao.dogao.repository.ItemPedidoRepository;
import com.dogao.dogao.repository.PedidoRepository;
import com.dogao.dogao.repository.ProdutoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;

    // Criar pedido
    @PostMapping
    public Pedido criarPedido(@RequestBody Pedido pedido) {

        Cliente clienteSalvo = clienteRepository.save(pedido.getCliente());
        pedido.setCliente(clienteSalvo);

        double total = 0.0;

        for (ItemPedido item : pedido.getItens()) {

            Produto produto = produtoRepository.findById(item.getProduto().getId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            item.setProduto(produto);
            item.setPedido(pedido);

            total += produto.getPreco() * item.getQuantidade();
        }

        pedido.setTotal(total);

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        for (ItemPedido item : pedido.getItens()) {
            itemPedidoRepository.save(item);
        }

        return pedidoSalvo;
    }

    // Listar pedidos
    @GetMapping
    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll();
    }

    // Buscar pedido por id
    @GetMapping("/{id}")
    public Pedido buscarPedido(@PathVariable Long id) {
        return pedidoRepository.findById(id).orElseThrow();
    }

    // Atualizar status do pedido
    @PutMapping("/{id}/status")
    public Pedido atualizarStatus(@PathVariable Long id, @RequestBody Pedido pedidoAtualizado) {

        Pedido pedido = pedidoRepository.findById(id).orElseThrow();

        pedido.setStatus(pedidoAtualizado.getStatus());

        return pedidoRepository.save(pedido);
    }

    // Deletar pedido
    @DeleteMapping("/{id}")
    public void deletarPedido(@PathVariable Long id) {
        pedidoRepository.deleteById(id);
    }
    
    //Buscar por status
    @GetMapping("/status/{status}")
    public List<Pedido> buscarPorStatus(@PathVariable String status) {
        return pedidoRepository.findByStatus(status.toUpperCase());
    }
    
    // buscar cozinha - em preparo
    @GetMapping("/cozinha/preparo")
    public List<Pedido> pedidosEmPreparo() {
        return pedidoRepository.findByStatus("EM_PREPARO");
    }

    // buscar cozinha - pronto
    @GetMapping("/cozinha/pronto")
    public List<Pedido> pedidosProntos() {
        return pedidoRepository.findByStatus("PRONTO");
    }
    
    // mensagem pedido whatsapp
    @GetMapping("/{id}/whatsapp")
    public String gerarMensagemWhatsApp(@PathVariable Long id) {

        Pedido pedido = pedidoRepository.findById(id).orElseThrow();

        StringBuilder msg = new StringBuilder();

        msg.append("*NOVO PEDIDO* \n\n");

        msg.append("Cliente: ").append(pedido.getCliente().getNome()).append("\n");
        msg.append("Telefone: ").append(pedido.getCliente().getTelefone()).append("\n\n");

        msg.append("*Itens:* \n");

        for (ItemPedido item : pedido.getItens()) {
            msg.append("- ")
               .append(item.getQuantidade())
               .append("x ")
               .append(item.getProduto().getNome());

            if (item.getObservacao() != null && !item.getObservacao().isEmpty()) {
                msg.append(" (").append(item.getObservacao()).append(")");
            }

            msg.append("\n");
        }

        msg.append("\nTotal: R$ ").append(pedido.getTotal());

        msg.append("\nPagamento: ").append(pedido.getFormaPagamento());
        msg.append("\nEntrega: ").append(pedido.getTipoEntrega());

        if ("DELIVERY".equals(pedido.getTipoEntrega())) {
            msg.append("\n📍 Endereço: ").append(pedido.getEndereco());
        }

        return msg.toString();
    }
    
    // mensagem pedido whatsapp link
    @GetMapping("/{id}/whatsapp-link")
    public String gerarLinkWhatsApp(@PathVariable Long id) {

        Pedido pedido = pedidoRepository.findById(id).orElseThrow();

        String mensagem = gerarMensagemWhatsApp(id);

        String telefone = "5549998290681";

        String url = "https://wa.me/" + telefone + "?text=" + 
                     java.net.URLEncoder.encode(mensagem, java.nio.charset.StandardCharsets.UTF_8);

        return url;
    }
}