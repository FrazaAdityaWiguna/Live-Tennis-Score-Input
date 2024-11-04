const express = require('express');
const app = express();
const PORT = 3000;

// Middleware untuk parsing JSON
app.use(express.json());
app.use(express.static('public'));

// Simpan skor dalam memori sementara
let score = { player1: 0, player2: 0 };

// Kumpulan response klien untuk SSE
const clients = [];

// Endpoint untuk Server-Sent Events
app.get('/score-updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Kirim skor awal kepada klien yang baru terhubung
    res.write(`data: ${JSON.stringify(score)}\n\n`);
    
    clients.push(res);

    req.on('close', () => {
        clients.splice(clients.indexOf(res), 1);
        res.end();
    });
});

// Fungsi untuk mengirim skor ke semua klien
function broadcastScore() {
    clients.forEach(client => client.write(`data: ${JSON.stringify(score)}\n\n`));
}

// Endpoint untuk mengupdate skor
app.post('/update-score', (req, res) => {
    const { player1, player2 } = req.body;
    score.player1 = player1;
    score.player2 = player2;
    
    // Broadcast skor terbaru ke semua klien
    broadcastScore();
    
    res.status(200).send('Score updated');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
