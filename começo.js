{
    "palavra_secreta"; "JAVASCRIPT",
    "letras_tentadas"; [],
    "erros"; 0,
    "max_erros"; 6
}
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const DB_FILE = path.join(__dirname, 'database.json');
const PALAVRAS = ["JAVASCRIPT", "PROGRAMACAO", "NODEJS", "GITHUB", "COMPUTADOR", "DESENVOLVEDOR"];

// Funções auxiliares para ler e escrever no arquivo JSON
function carregarDados() {
    const dados = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(dados);
}

function salvarDados(dados) {
    fs.writeFileSync(DB_FILE, JSON.stringify(dados, null, 2), 'utf-8');
}

// Rota: Obter estado atual do jogo
app.get('/api/estado', (req, res) => {
    const dados = carregarDados();
    
    // Cria a palavra mascarada (ex: J _ V _ S C R I P T)
    const palavraMascarada = dados.palavra_secreta.split('').map(letra => {
        return dados.letras_tentadas.includes(letra) ? letra : '_';
    });

    const venceu = dados.palavra_secreta.split('').every(letra => dados.letras_tentadas.includes(letra));
    const perdeu = dados.erros >= dados.max_erros;

    res.json({
        palavra: palavraMascarada,
        letras_tentadas: dados.letras_tentadas,
        erros: dados.erros,
        max_erros: dados.max_erros,
        venceu,
        perdeu
    });
});

// Rota: Tentar uma letra
app.post('/api/tentar', (req, res) => {
    const dados = carregarDados();
    const letra = (req.body.letra || '').toUpperCase();

    if (!letra || letra.length !== 1) {
        return res.status(400).json({ erro: "Letra inválida" });
    }

    if (dados.letras_tentadas.includes(letra) || dados.erros >= dados.max_erros) {
        return res.status(400).json({ mensagem: "Letra já tentada ou jogo encerrado" });
    }

    dados.letras_tentadas.push(letra);

    if (!dados.palavra_secreta.includes(letra)) {
        dados.erros += 1;
    }

    salvarDados(dados);

    // Retorna o estado atualizado reutilizando a lógica
    res.redirect(307, '/api/estado');
});

// Rota: Reiniciar o jogo
app.post('/api/reiniciar', (req, res) => {
    const palavraAleatoria = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
    
    const novosDados = {
        palavra_secreta: palavraAleatoria,
        letras_tentadas: [],
        erros: 0,
        max_erros: 6
    };

    salvarDados(novosDados);
    res.redirect(307, '/api/estado');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});