const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8"
    });
    res.end("Olá! Node.js está funcionando através do Nginx!");
});

server.listen(3000, "0.0.0.0", () => {
    console.log("Servidor rodando na porta 3000");
});