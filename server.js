const express = require('express');
const { Octokit } = require('@octokit/rest');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("❌ ERROR: GITHUB_TOKEN belum diatur di .env!");
  process.exit(1);
}

const REPO_OWNER = "Delven-f";
const REPO_NAME = "pengingatpr1";
const FILE_PATH = "pr.json";

const octokit = new Octokit({ auth: GITHUB_TOKEN });

app.post('/update-pr', async (req, res) => {
  const prData = req.body;

  try {
    // Dapatkan SHA file terbaru
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
      message: "Update pr.json otomatis dari web",
      content: Buffer.from(JSON.stringify(prData, null, 2)).toString('base64'),
      sha: data.sha,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Gagal update:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server berjalan di http://localhost:${PORT}`)
);
