package com.dogao.dogao.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImagemService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String salvar(MultipartFile arquivo) throws IOException {
        Path pasta = Paths.get(uploadDir);
        if (!Files.exists(pasta)) {
            Files.createDirectories(pasta);
        }

        String extensao = StringUtils.getFilenameExtension(arquivo.getOriginalFilename());
        String nomeArquivo = UUID.randomUUID() + "." + extensao;

        Path destino = pasta.resolve(nomeArquivo);
        Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        return nomeArquivo;
    }

    public Resource carregar(String nomeArquivo) throws MalformedURLException {
        Path caminho = Paths.get(uploadDir).resolve(nomeArquivo);
        return new UrlResource(caminho.toUri());
    }
}