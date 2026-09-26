package com.dogao.dogao.controller;

import com.dogao.dogao.dto.AceitarPedidoRequest;
import com.dogao.dogao.model.Cliente;
import com.dogao.dogao.model.ItemPedido;
import com.dogao.dogao.model.Pedido;
import com.dogao.dogao.model.Produto;
import com.dogao.dogao.repository.ClienteRepository;
import com.dogao.dogao.repository.ItemPedidoRepository;
import com.dogao.dogao.repository.PedidoRepository;
import com.dogao.dogao.repository.ProdutoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin("*")
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
    public ResponseEntity<?> criarPedido(@RequestBody Pedido pedido) {

        if (pedido.getCliente() == null || pedido.getCliente().getNome() == null
                || pedido.getCliente().getNome().isBlank()) {
            return ResponseEntity.badRequest().body("Informe os dados do cliente.");
        }

        if (pedido.getItens() == null || pedido.getItens().isEmpty()) {
            return ResponseEntity.badRequest().body("O pedido precisa ter ao menos um item.");
        }

        Cliente clienteSalvo = clienteRepository.save(pedido.getCliente());
        pedido.setCliente(clienteSalvo);

        double total = 0.0;

        for (ItemPedido item : pedido.getItens()) {

            if (item.getProduto() == null || item.getProduto().getId() == null) {
                return ResponseEntity.badRequest().body("Item de pedido inválido: produto não informado.");
            }

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

        return ResponseEntity.ok(pedidoSalvo);
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

    // Atualizar status do pedido (para transições que não sejam o aceite,
    // como marcar como PRONTO, ENTREGUE, etc.)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(@PathVariable Long id, @RequestBody Pedido pedidoAtualizado) {

        Pedido pedido = pedidoRepository.findById(id).orElseThrow();

        if ("EM_PREPARO".equals(pedidoAtualizado.getStatus())) {
            return ResponseEntity.badRequest().body(
                    "Para colocar o pedido em preparo é preciso aceitá-lo informando o tempo estimado. " +
                    "Use PATCH /pedidos/" + id + "/aceitar.");
        }

        pedido.setStatus(pedidoAtualizado.getStatus());

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("pedido", pedidoSalvo);

        if ("PRONTO".equals(pedidoSalvo.getStatus())) {
            resposta.put("linkWhatsappCliente", gerarLinkWhatsApp(
                    numeroWhatsAppCliente(pedidoSalvo.getCliente()),
                    gerarMensagemPedidoPronto(pedidoSalvo)));
        }

        return ResponseEntity.ok(resposta);
    }

    // Aceitar pedido: só aqui é definido o tempo estimado de preparo,
    // e é isso que move o pedido de PENDENTE para EM_PREPARO
    @PatchMapping("/{id}/aceitar")
    public ResponseEntity<?> aceitarPedido(@PathVariable Long id, @RequestBody AceitarPedidoRequest dto) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (!"PENDENTE".equals(pedido.getStatus())) {
            return ResponseEntity.status(409).body("Este pedido já foi aceito/processado e não está mais pendente.");
        }

        if (dto.getTempoEstimadoPreparo() == null || dto.getTempoEstimadoPreparo() <= 0) {
            return ResponseEntity.badRequest().body("Informe um tempo estimado de preparo válido, em minutos.");
        }

        pedido.setTempoEstimadoPreparo(dto.getTempoEstimadoPreparo());
        pedido.setHorarioAceite(LocalDateTime.now());
        pedido.setStatus("EM_PREPARO");

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("pedido", pedidoSalvo);
        resposta.put("linkWhatsappCliente", gerarLinkWhatsApp(
                numeroWhatsAppCliente(pedidoSalvo.getCliente()),
                gerarMensagemConfirmacao(pedidoSalvo)));

        return ResponseEntity.ok(resposta);
    }

    // Recusar um pedido que ainda está pendente
    @PatchMapping("/{id}/recusar")
    public ResponseEntity<?> recusarPedido(@PathVariable Long id) {

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (!"PENDENTE".equals(pedido.getStatus())) {
            return ResponseEntity.status(409).body("Este pedido já foi aceito/processado e não está mais pendente.");
        }

        pedido.setStatus("RECUSADO");

        return ResponseEntity.ok(pedidoRepository.save(pedido));
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
    
    // buscar cozinha - pendentes de aceite
    @GetMapping("/cozinha/pendentes")
    public List<Pedido> pedidosPendentes() {
        return pedidoRepository.findByStatus("PENDENTE");
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

    // ---- Mensagens automáticas para o CLIENTE (aceite e pedido pronto) ----

    // Monta o número do cliente no formato aceito pelo wa.me (com DDI do Brasil).
    // O telefone é salvo sem DDI (só DDD + número), então adicionamos o "55" na frente.
    private String numeroWhatsAppCliente(Cliente cliente) {
        String digitos = cliente == null || cliente.getTelefone() == null
                ? ""
                : cliente.getTelefone().replaceAll("\\D", "");

        if (digitos.startsWith("55")) {
            return digitos;
        }

        return "55" + digitos;
    }

    // Mensagem enviada ao cliente quando o pedido é aceito, já com o tempo estimado
    private String gerarMensagemConfirmacao(Pedido pedido) {
        StringBuilder msg = new StringBuilder();

        msg.append("Olá, ").append(pedido.getCliente().getNome()).append("! 👋\n\n");
        msg.append("Seu pedido *#").append(pedido.getId()).append("* foi confirmado e já está em preparo! 🧑‍🍳\n");
        msg.append("Tempo estimado: *").append(pedido.getTempoEstimadoPreparo()).append(" min*.\n\n");
        msg.append("Qualquer coisa é só chamar por aqui. Obrigado pela preferência!");

        return msg.toString();
    }

    // Mensagem enviada ao cliente quando o pedido fica pronto
    private String gerarMensagemPedidoPronto(Pedido pedido) {
        StringBuilder msg = new StringBuilder();

        msg.append("Olá, ").append(pedido.getCliente().getNome()).append("! 👋\n\n");
        msg.append("Seu pedido *#").append(pedido.getId()).append("* está pronto! ✅\n");

        if ("DELIVERY".equals(pedido.getTipoEntrega())) {
            msg.append("Já estamos saindo para a entrega.");
        } else {
            msg.append("Pode vir retirar quando quiser!");
        }

        return msg.toString();
    }

    // Monta um link wa.me genérico para um número + mensagem já prontos
    private String gerarLinkWhatsApp(String numero, String mensagem) {
        return "https://wa.me/" + numero + "?text=" +
                java.net.URLEncoder.encode(mensagem, java.nio.charset.StandardCharsets.UTF_8);
    }
}