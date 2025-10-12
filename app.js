cconst BACKEND_URL = "http://localhost:3000/update-pr";
const PR_JSON_URL = "http://localhost:3000/get-pr";

let adminMode = false;
let prData = [];
let toastTimeout = null;
let backsoundOn = false;

document.addEventListener("DOMContentLoaded", () => {
  bindUI();
  loadPR();
  setupBacksound();
});

function qs(s) { return document.querySelector(s); }
function qsa(s) { return document.querySelectorAll(s); }

function bindUI() {
  qs("#admin-login-btn").onclick = adminLogin;
  qs("#admin-logout-btn").onclick = adminLogout;
  qs("#pr-form").onsubmit = handleFormSubmit;
  qs("#cancel-btn").onclick = resetForm;
  qs("#refresh-btn").onclick = loadPR;
  qs("#clear-btn").onclick = handleClearAll;
  qs("#search").oninput = filterList;
}

function adminLogin() {
  const pw = prompt("Masukkan sandi admin:");
  if (pw === "firman1") {
    adminMode = true;
    showAdminUI();
    showToast("Login admin berhasil.");
  } else showToast("Sandi salah!", true);
}

function adminLogout() {
  adminMode = false;
  showAdminUI();
  resetForm();
  showToast("Logout admin.");
}

function showAdminUI() {
  qs("#form-section").classList.toggle("hidden", !adminMode);
  qs("#clear-btn").classList.toggle("hidden", !adminMode);
  qs("#admin-login-btn").classList.toggle("hidden", adminMode);
  qs("#admin-logout-btn").classList.toggle("hidden", !adminMode);
  qs("#admin-status").innerText = adminMode ? "👑 Admin Aktif" : "";
  qsa(".actions").forEach(el => el.classList.toggle("hidden", !adminMode));
}

async function loadPR() {
  setLoading(true);
  try {
    const res = await fetch(PR_JSON_URL + "?t=" + Date.now());
    if (!res.ok) throw new Error("Gagal ambil data!");
    prData = await res.json();
    renderPR(prData);
  } catch (e) {
    showToast("Gagal memuat data PR!", true);
    renderPR([]);
  } finally {
    setLoading(false);
  }
}

function renderPR(data) {
  const container = qs("#daftarPR");
  container.innerHTML = "";
  if (!data.length) {
    container.innerHTML = "<div class='card empty'>Belum ada PR tersimpan.</div>";
    return;
  }

  const keyword = qs("#search").value.trim().toLowerCase();
  data
    .filter(pr =>
      !keyword ||
      pr.mapel.toLowerCase().includes(keyword) ||
      pr.deskripsi.toLowerCase().includes(keyword)
    )
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    .forEach((pr, i) => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <b>${pr.mapel}</b>
        <div>${pr.deskripsi}</div>
        <div class="tanggal">📅 Deadline: ${pr.tanggal}</div>
        <div class="actions ${adminMode ? "" : "hidden"}">
          <button onclick="editPR(${i})">✏️</button>
          <button onclick="hapusPR(${i})">🗑️</button>
        </div>
      `;
      container.appendChild(div);
    });
}

window.editPR = function(i) {
  const pr = prData[i];
  qs("#form-title").innerText = "Edit PR";
  qs("#mapel").value = pr.mapel;
  qs("#deskripsi").value = pr.deskripsi;
  qs("#tanggal").value = pr.tanggal;
  qs("#pr-index").value = i;
  qs("#cancel-btn").classList.remove("hidden");
  qs("#form-section").scrollIntoView({ behavior: "smooth" });
};

window.hapusPR = function(i) {
  if (!confirm("Yakin hapus PR ini?")) return;
  prData.splice(i, 1);
  savePR("PR dihapus.");
};

function handleClearAll() {
  if (!confirm("Yakin hapus semua PR?")) return;
  prData = [];
  savePR("Semua PR dihapus!");
}

function handleFormSubmit(e) {
  e.preventDefault();
  const mapel = qs("#mapel").value.trim();
  const deskripsi = qs("#deskripsi").value.trim();
  const tanggal = qs("#tanggal").value;

  if (!mapel || !deskripsi || !tanggal)
    return showToast("Isi semua kolom!", true);

  const idx = qs("#pr-index").value;
  if (idx !== "") {
    prData[idx] = { mapel, deskripsi, tanggal };
    savePR("PR berhasil diupdate.");
  } else {
    prData.push({ mapel, deskripsi, tanggal });
    savePR("PR berhasil ditambah.");
  }
  resetForm();
}

function resetForm() {
  qs("#form-title").innerText = "Tambah PR Baru";
  qs("#mapel").value = "";
  qs("#deskripsi").value = "";
  qs("#tanggal").value = "";
  qs("#pr-index").value = "";
  qs("#cancel-btn").classList.add("hidden");
}

function savePR(msg) {
  setLoading(true);
  fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prData)
  })
    .then(async res => {
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.success) {
        showToast(msg);
        loadPR();
      } else throw new Error(data.error || "Gagal update PR");
    })
    .catch(e => showToast("Gagal koneksi ke server! " + e.message, true))
    .finally(() => setLoading(false));
}

function setLoading(state) {
  const el = qs("#loading");
  el.classList.toggle("hidden", !state);
  el.textContent = state ? "Loading..." : "";
}

function showToast(msg, err = false) {
  const toast = qs("#toast");
  toast.innerText = msg;
  toast.style.background = err ? "var(--danger)" : "var(--bg2)";
  toast.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add("hidden"), 2500);
}

function setupBacksound() {
  const backsound = qs("#backsound");
  const btn = qs("#backsound-btn");
  backsound.volume = 0.55;

  btn.onclick = () => {
    backsoundOn = !backsoundOn;
    if (backsoundOn) {
      backsound.play().catch(() => {});
      btn.innerHTML = "🔈";
      showToast("Backsound: ON");
    } else {
      backsound.pause();
      btn.innerHTML = "🔊";
      showToast("Backsound: OFF");
    }
  };
}
