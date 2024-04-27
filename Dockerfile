FROM nginx:latest
COPY . /usr/share/nginx/html
VOLUME /tmp
EXPOSE 80