package com.dogao.dogao.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // pré-checagem CORS
                .requestMatchers("/pedidos/**").permitAll() // criar pedido
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/produtos/**").permitAll() // cardápio público
                .requestMatchers("/produtos/**").hasRole("ADMIN") // criar/editar/inativar só admin
                .requestMatchers("/admin/**").authenticated()
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults()); 

        return http.build();
    }
}