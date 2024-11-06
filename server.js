// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Format tanggal
const tanggal = new Date();
const opsiFormat = { day: "numeric", month: "long", year: "numeric" };
const hasilFormat = tanggal.toLocaleDateString("id-ID", opsiFormat);

// Data awal untuk game
let clients = [];
let gameData = {
  venue: "BUANA TENIS COURT",
  date: `Bekasi, ${hasilFormat}`,
  team1: {
    name: "Player1/Player1",
    sets: "1",
    games: "1",
    score: "0",
    points: "0",
  },
  team2: {
    name: "Player2/Player2",
    sets: "1",
    games: "1",
    score: "0",
    points: "0",
  },
};

// Endpoint untuk Server-Sent Events (SSE)
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const client = { id: Date.now(), res };
  clients.push(client);

  req.on("close", () => {
    clients = clients.filter((c) => c.id !== client.id);
  });

  // Mengirim data awal ke klien
  res.write(`data: ${JSON.stringify(gameData)}\n\n`);
});

// Endpoint untuk memperbarui display 1 (data team)
app.post("/update-display1", (req, res) => {
  try {
    const { team1, team2 } = req.body;
    gameData.team1 = { ...gameData.team1, ...team1 };
    gameData.team2 = { ...gameData.team2, ...team2 };

    notifyClients(gameData);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating display1:", error);
    res.status(500).json({ success: false });
  }
});

// Endpoint untuk memperbarui display 2 (current score)
app.post("/update-display2", (req, res) => {
  try {
    const data = req.body;
    const tempData = { ...gameData, ...data }; // Update gameData dengan data baru dari req.body

    // Hanya update team1 dan team2 dengan data dari masing-masing team
    if (data.team1) {
      tempData.team1 = { ...gameData.team1, ...data.team1 };
    }
    if (data.team2) {
      tempData.team2 = { ...gameData.team2, ...data.team2 };
    }

    console.log("gameData", tempData);

    notifyClients(tempData);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating display2:", error);
    res.status(500).json({ success: false });
  }
});

// Fungsi untuk mengirim data ke semua klien
function notifyClients(data) {
  clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});
