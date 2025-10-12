const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// static files (frontend)
const PUBLIC_DIR = path.join(__dirname, "public");
app.use(express.static(PUBLIC_DIR));

// data file
const DATA_FILE = path.join(__dirname, "pr.json");

// helper: ensure data file exists
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
  }
}

// API: get PR list
app.get("/api/pr", (req, res) => {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(raw || "[]");
    res.json(data);
  } catch (err) {
    console.error("Read error:", err);
    res.status(500).json({ error: "Gagal membaca data." });
  }
});

// API: update PR list (replace entire list)
app.post("/api/pr", (req, res) => {
  try {
    const newData = req.body;
    if (!Array.isArray(newData)) {
      return res.status(400).json({ error: "Payload harus array." });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2), "utf8");
    res.json({ success: true });
  } catch (err) {
    console.error("Write error:", err);
    res.status(500).json({ error: "Gagal menyimpan data." });
  }
});

// Fallback - serve index.html for any other request (SPA friendly)
app.get("*", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server lokal aktif di http://localhost:${PORT}`);
});
