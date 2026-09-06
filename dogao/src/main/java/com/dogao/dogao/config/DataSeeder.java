package com.dogao.dogao.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.dogao.dogao.model.Categoria;
import com.dogao.dogao.repository.CategoriaRepository;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedCategorias(CategoriaRepository categoriaRepository) {
        return args -> {
            criarSeNaoExistir(categoriaRepository, "Dogão");
            criarSeNaoExistir(categoriaRepository, "Xis");
            criarSeNaoExistir(categoriaRepository, "Bebida");
        };
    }

    private void criarSeNaoExistir(CategoriaRepository categoriaRepository, String nome) {
        if (!categoriaRepository.existsByNomeIgnoreCase(nome)) {
            Categoria categoria = new Categoria();
            categoria.setNome(nome);
            categoriaRepository.save(categoria);
        }
    }
}