// ======== PENGINGAT PR - SERVER OFFLINE ========

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, "pr.json");

// 🔹 Endpoint untuk update / simpan PR ke file lokal
app.post("/update-pr", (req, res) => {
  const prData = req.body;

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(prData, null, 2));
    res.json({ success: true, message: "Data berhasil disimpan lokal." });
  } catch (err) {
    console.error("❌ Gagal menyimpan:", err);
    res.status(500).json({ success: false, error: "Gagal menyimpan data." });
  }
});

// 🔹 Endpoint untuk baca data PR
app.get("/get-pr", (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
    const data = fs.readFileSync(DATA_FILE);
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ success: false, error: "Gagal membaca file." });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server lokal aktif di http://localhost:${PORT}`));
