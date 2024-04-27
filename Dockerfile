FROM nginx:latest
COPY ./src /usr/share/nginx/html
VOLUME /tmp
EXPOSE 80