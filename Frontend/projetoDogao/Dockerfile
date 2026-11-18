FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# as paginas HTML ficam na raiz do site (index.html, admin.html, ...)
COPY templates/ /usr/share/nginx/html/
# css, js e imagens ficam em /static (o HTML usa caminhos /static/...)
COPY static/ /usr/share/nginx/html/static/

EXPOSE 80