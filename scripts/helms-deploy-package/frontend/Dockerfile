ARG HELMS_NGINX_BASE_IMAGE=nginx:alpine
FROM ${HELMS_NGINX_BASE_IMAGE}
COPY dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
