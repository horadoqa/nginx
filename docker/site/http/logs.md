# 'verificando os logs'

## O Container

```bash
 docker ps
CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                               NAMES
fc289d00ff86   nginx:alpine   "/docker-entrypoint.…"   3 minutes ago   Up 3 minutes   0.0.0.0:80->80/tcp, [::]:80->80/tcp   http-nginx-1
```

Pelo `docker ps -a`, o container se chama **`http-nginx-1`** e está rodando.

### 1. Ver os logs

```bash
docker logs http-nginx-1
```

Para acompanhar os logs em tempo real:

```bash
docker logs -f http-nginx-1
```

Ou mostrando as últimas 100 linhas e continuando:

```bash
docker logs --tail 100 -f http-nginx-1
```

### 2. Entrar dentro do container

Como é `nginx:alpine`, normalmente existe `/bin/sh`:

```bash
docker exec -it http-nginx-1 /bin/sh
```

Você deverá cair em algo parecido com:

```text
/ #
```

Aí pode explorar:

```bash
ls
ls -la
cd /etc/nginx
ls -la
```

Para sair:

```bash
exit
```

### 3. Ver os arquivos de log do Nginx

Dentro do container:

```bash
ls -la /var/log/nginx/
```

Normalmente:

```text
access.log
error.log
```

Pode acompanhar:

```bash
tail -f /var/log/nginx/access.log
```

e:

```bash
tail -f /var/log/nginx/error.log
```

**Mas há um detalhe importante:** na imagem oficial do Nginx, os logs geralmente são direcionados para `stdout`/`stderr`. Por isso, o mais importante é:

```bash
docker logs -f http-nginx-1
```

### 4. Ver a configuração do Nginx

Dentro do container:

```bash
nginx -T
```

Isso mostra a configuração completa que o Nginx está usando.

Também pode verificar:

```bash
cat /etc/nginx/nginx.conf
```

E os arquivos adicionais:

```bash
find /etc/nginx -type f -maxdepth 3 -print
```
