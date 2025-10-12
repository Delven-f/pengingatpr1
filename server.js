const express = require('express');
const { Octokit } = require("@octokit/rest");
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GITHUB_TOKEN = "ISI_TOKEN_GITHUB_MU"; // GANTI dengan token GitHub-mu
const REPO_OWNER = "Delven-f";
const REPO_NAME = "pengingatpr1";
const FILE_PATH = "pr.json";

const octokit = new Octokit({ auth: GITHUB_TOKEN });

app.post('/update-pr', async (req, res) => {
  const prData = req.body; // Array PR
  try {
    // Ambil SHA terakhir pr.json
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
    });

    // Update file
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
      message: "Update pr.json otomatis dari web",
      content: Buffer.from(JSON.stringify(prData, null, 2)).toString('base64'),
      sha: data.sha
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server listening on port 3000'));
