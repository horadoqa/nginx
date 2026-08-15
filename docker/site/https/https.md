# 'https'

Para HTTPS, você precisa de **duas coisas adicionais**:

1. Expor a porta `443`.
2. Configurar o Nginx com um **certificado TLS** e sua chave privada. O Nginx usa `listen 443 ssl`, `ssl_certificate` e `ssl_certificate_key` para isso. ([Documentação do NGINX][1])

Para um site estático em Docker, ficaria assim:

```text
meu-site/
├── docker-compose.yml
├── nginx/
│   └── default.conf
├── certs/
│   ├── site.crt
│   └── site.key
└── site/
    ├── index.html
    ├── style.css
    └── script.js
```

### `docker-compose.yml`

```yaml
services:
  nginx:
    image: nginx:alpine

    ports:
      - "80:80"
      - "443:443"

    volumes:
      - ./site:/usr/share/nginx/html:ro
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
```

### `nginx/default.conf`

```nginx
server {
    listen 80;
    server_name horadoqa.com www.horadoqa.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name horadoqa.com www.horadoqa.com;

    ssl_certificate /etc/nginx/certs/site.crt;
    ssl_certificate_key /etc/nginx/certs/site.key;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

O fluxo fica:

```mermaid
flowchart TD
    U[Usuário] -->|HTTPS :443| N[Nginx<br/>Docker]
    N -->|serve| S[Site estático]
    S --> H[index.html]
```

E quando alguém acessar:

```text
http://horadoqa.com
```

o Nginx redirecionará para:

```text
https://horadoqa.com
```

### Mas de onde vêm `site.crt` e `site.key`?

Para um site real na Internet, normalmente você usa um certificado de uma autoridade certificadora, como **Let's Encrypt**, em vez de criar um certificado próprio.

A diferença é importante:

**Desenvolvimento/local**

```text
Docker
  ↓
Nginx
  ↓
certificado próprio
```

**Produção**

```text
Internet
   ↓
https://meusite.com
   ↓
Nginx
   ↓
certificado Let's Encrypt
   ↓
site estático
```

O certificado público pode ser enviado aos clientes, enquanto a **chave privada deve ser protegida** e ficar acessível ao Nginx. ([Documentação do NGINX][1])

A própria documentação do Nginx também mostra que conteúdo do site e arquivos de configuração podem ser montados do host para dentro do container, exatamente como fizemos acima. ([Documentação do NGINX][2])

**Se você estiver pensando em colocar esse site em um VPS com domínio real**, eu recomendo uma configuração um pouco diferente: **Nginx + Docker + Let's Encrypt + renovação automática do certificado**. É o cenário mais próximo de um deploy de produção.

[1]: https://docs.nginx.com/nginx/admin-guide/security-controls/terminating-ssl-http/?utm_source=chatgpt.com "NGINX SSL Termination | NGINX Documentation"
[2]: https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-docker/?utm_source=chatgpt.com "Deploying NGINX and NGINX Plus with Docker | NGINX Documentation"

Criando os certificados localmente

Exatamente. 👍 **O problema é o certificado**, não o Docker em si.

A mensagem principal é:

```text
cannot load certificate "/etc/nginx/certs/site.crt"
PEM_read_bio_X509_AUX() failed
no start line
Expecting: TRUSTED CERTIFICATE
```

O Nginx conseguiu encontrar:

```text
/etc/nginx/certs/site.crt
```

mas **o conteúdo desse arquivo não é um certificado PEM válido**.

Um certificado válido normalmente começa com:

```text
-----BEGIN CERTIFICATE-----
```

e termina com:

```text
-----END CERTIFICATE-----
```

### Para testar localmente

Se você só quer experimentar HTTPS no localhost, pode gerar um certificado autoassinado:

```bash
mkdir -p certs

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout certs/site.key \
  -out certs/site.crt \
  -subj "/CN=localhost"
```

Isso vai criar:

```text
certs/
├── site.crt
└── site.key
```

Depois:

```bash
docker compose down
docker compose up
```

E acesse:

```text
https://localhost
```

O navegador provavelmente vai mostrar um **aviso de segurança**, porque o certificado é autoassinado e não foi emitido por uma autoridade certificadora confiável. Isso é esperado em desenvolvimento local.

### Uma coisa importante

Se você abriu o `site.crt` e ele estiver, por exemplo, assim:

```text
meu certificado
```

ou vazio, o erro que você recebeu é exatamente o esperado.

Você pode verificar com:

```bash
cat certs/site.crt
```

Deve aparecer algo parecido com:

```text
-----BEGIN CERTIFICATE-----
MIID...
...
-----END CERTIFICATE-----
```

E a chave:

```bash
cat certs/site.key
```

deve começar com algo como:

```text
-----BEGIN PRIVATE KEY-----
```

ou:

```text
-----BEGIN RSA PRIVATE KEY-----
```

**Para produção**, porém, não use esse certificado autoassinado. Aí o ideal é usar **Let's Encrypt** e configurar a renovação automática.

