// Ganti ke URL Railway kamu!
const BACKEND_URL = "https://YOUR-NAMA-PROJECT.up.railway.app/update-pr";
const PR_JSON_URL = "https://raw.githubusercontent.com/Delven-f/pengingatpr1/main/pr.json";

let adminMode = false;
let prData = [];
let loadingTimeout = null;

document.addEventListener("DOMContentLoaded", () => {
  bindUI();
  loadPR();
});

function bindUI() {
  qs("#admin-login-btn").onclick = adminLogin;
  qs("#admin-logout-btn").onclick = adminLogout;
  qs("#pr-form").onsubmit = handleFormSubmit;
  qs("#cancel-btn").onclick = resetForm;
  qs("#refresh-btn").onclick = loadPR;
  qs("#clear-btn").onclick = handleClearAll;
  qs("#search").oninput = filterList;
}

function qs(s) { return document.querySelector(s); }
function qsa(s) { return document.querySelectorAll(s); }

function adminLogin() {
  const pw = prompt("Masukkan sandi admin:");
  if (pw === "firman1") {
    adminMode = true;
    showAdminUI();
    showToast("Login admin berhasil.");
  } else {
    showToast("Sandi salah!", true);
  }
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
  qs("#admin-status").classList.toggle("hidden", !adminMode);
  qs("#admin-status").innerText = adminMode ? "👑 Admin Aktif" : "";
  qs("#admin-logout-btn").classList.toggle("hidden", !adminMode);
  qsa(".actions").forEach(act => act.classList.toggle("hidden", !adminMode));
}

async function loadPR() {
  setLoading(true);
  try {
    const res = await fetch(PR_JSON_URL + "?t=" + Date.now());
    prData = await res.json();
    renderPR(prData);
    setLoading(false);
  } catch (e) {
    setLoading(false);
    renderPR([]);
    showToast("Gagal memuat data PR!", true);
  }
}
function renderPR(data) {
  const container = qs("#daftarPR");
  container.innerHTML = "";
  if (!data || !data.length) {
    container.innerHTML = "<div class='card empty'>Belum ada PR tersimpan.</div>";
    return;
  }
  let keyword = qs("#search").value.trim().toLowerCase();
  data
    .filter(pr => !keyword || pr.mapel.toLowerCase().includes(keyword) || pr.deskripsi.toLowerCase().includes(keyword))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    .forEach((pr, i) => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <b>${pr.mapel}</b>
        <div>${pr.deskripsi}</div>
        <div class="tanggal">📅 Terakhir dikumpulkan: ${pr.tanggal}</div>
        <div class="actions${adminMode ? "" : " hidden"}">
          <button class="edit" title="Edit" onclick="editPR(${i})">✏️</button>
          <button class="hapus" title="Hapus" onclick="hapusPR(${i})">🗑️</button>
        </div>
      `;
      container.appendChild(div);
    });
}

window.editPR = function(idx) {
  const pr = prData[idx];
  qs("#form-title").innerText = "Edit PR";
  qs("#mapel").value = pr.mapel;
  qs("#deskripsi").value = pr.deskripsi;
  qs("#tanggal").value = pr.tanggal;
  qs("#pr-index").value = idx;
  qs("#cancel-btn").classList.remove("hidden");
  qs("#form-section").scrollIntoView({ behavior: 'smooth' });
}
window.hapusPR = function(idx) {
  if (!confirm("Yakin hapus PR ini?")) return;
  prData.splice(idx,1);
  savePR("PR dihapus.");
}
function handleClearAll() {
  if (!confirm("Yakin hapus SEMUA PR?")) return;
  prData = [];
  savePR("Semua PR dihapus!");
}
function handleFormSubmit(e) {
  e.preventDefault();
  const mapel = qs("#mapel").value.trim();
  const deskripsi = qs("#deskripsi").value.trim();
  const tanggal = qs("#tanggal").value;
  if (!mapel || !deskripsi || !tanggal) return showToast("Isi semua kolom!", true);

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

function savePR(successMsg) {
  setLoading(true);
  fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prData)
  })
  .then(res => res.json())
  .then(res => {
    setLoading(false);
    if (res.success) {
      showToast(successMsg);
      loadPR();
    } else {
      showToast("Gagal update PR: " + (res.error || ""), true);
    }
  })
  .catch(() => {
    setLoading(false);
    showToast("Gagal koneksi ke server!", true);
  });
}

function filterList() { renderPR(prData); }

function setLoading(state) {
  const loader = qs("#loading");
  loader.classList.toggle("hidden", !state);
  loader.textContent = state ? "Loading..." : "";
}

function showToast(msg, error) {
  const toast = qs("#toast");
  toast.innerText = msg;
  toast.style.background = error ? "var(--danger)" : "var(--bg2)";
  toast.style.color = error ? "#fff" : "var(--primary)";
  toast.classList.remove("hidden");
  clearTimeout(loadingTimeout);
  loadingTimeout = setTimeout(()=>toast.classList.add("hidden"), 2400);
}
