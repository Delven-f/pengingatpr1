// Simple offline frontend for Pengingat PR
const API_GET = "/api/pr";
const API_SAVE = "/api/pr";
const ADMIN_PASSWORD = "firman1"; // ganti kalau perlu

let adminMode = false;
let prData = [];
let toastTimer = null;
let backsoundOn = false;

document.addEventListener("DOMContentLoaded", () => {
  bindUI();
  loadPR();
  setupBacksound();
});

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

function bindUI(){
  qs("#admin-login-btn").addEventListener("click", toggleAdmin);
  qs("#pr-form").addEventListener("submit", onSubmit);
  qs("#cancel-btn").addEventListener("click", resetForm);
  qs("#refresh-btn").addEventListener("click", loadPR);
  qs("#clear-btn").addEventListener("click", clearAll);
  qs("#search").addEventListener("input", renderPR);
  qs("#backsound-btn").addEventListener("click", toggleBacksound);
}

async function loadPR(){
  setLoading(true);
  try{
    const res = await fetch(API_GET);
    if(!res.ok) throw new Error("Gagal ambil data");
    prData = await res.json();
    if (!Array.isArray(prData)) prData = [];
    renderPR();
  }catch(err){
    console.error(err);
    showToast("Gagal memuat data", true);
    prData = [];
    renderPR();
  }finally{
    setLoading(false);
  }
}

function renderPR(){
  const container = qs("#daftarPR");
  container.innerHTML = "";
  if(!prData.length){
    container.innerHTML = '<div class="card">Belum ada PR tersimpan.</div>';
    return;
  }
  const kw = qs("#search").value.trim().toLowerCase();

  prData
    .filter(item => {
      if(!kw) return true;
      return (item.mapel||"").toLowerCase().includes(kw) || (item.deskripsi||"").toLowerCase().includes(kw);
    })
    .sort((a,b) => (a.tanggal||"").localeCompare(b.tanggal||""))
    .forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "card-item";
      div.innerHTML = `
        <div class="left">
          <strong>${escapeHtml(item.mapel || "-")}</strong>
          <div>${escapeHtml(item.deskripsi || "-")}</div>
          <div class="tanggal">📅 Deadline: ${escapeHtml(item.tanggal || "-")}</div>
        </div>
        <div class="item-actions">
          ${adminMode ? `<button title="Edit" data-i="${idx}" class="edit">✏️</button><button title="Hapus" data-i="${idx}" class="del">🗑️</button>` : ""}
        </div>
      `;
      container.appendChild(div);
    });

  qsa(".edit").forEach(btn => btn.addEventListener("click", e => {
    const i = Number(e.currentTarget.dataset.i);
    fillForm(i);
  }));
  qsa(".del").forEach(btn => btn.addEventListener("click", e => {
    const i = Number(e.currentTarget.dataset.i);
    if(!confirm("Yakin hapus PR ini?")) return;
    prData.splice(i,1);
    saveData("PR dihapus.");
  }));
}

function fillForm(i){
  const pr = prData[i];
  qs("#form-title").innerText = "Edit PR";
  qs("#mapel").value = pr.mapel || "";
  qs("#deskripsi").value = pr.deskripsi || "";
  qs("#tanggal").value = pr.tanggal || "";
  qs("#pr-index").value = i;
  qs("#form-section").classList.remove("hidden");
  qs("#mapel").focus();
}

function resetForm(){
  qs("#form-title").innerText = "Tambah PR Baru";
  qs("#mapel").value = "";
  qs("#deskripsi").value = "";
  qs("#tanggal").value = "";
  qs("#pr-index").value = "";
  qs("#form-section").classList.add("hidden");
}

function onSubmit(e){
  e.preventDefault();
  const mapel = qs("#mapel").value.trim();
  const deskripsi = qs("#deskripsi").value.trim();
  const tanggal = qs("#tanggal").value;
  if(!mapel || !deskripsi || !tanggal) return showToast("Isi semua kolom!", true);

  const idx = qs("#pr-index").value;
  if(idx !== ""){
    prData[idx] = { mapel, deskripsi, tanggal };
    saveData("PR berhasil diupdate.");
  } else {
    prData.push({ mapel, deskripsi, tanggal });
    saveData("PR berhasil ditambah.");
  }
  resetForm();
}

async function saveData(message){
  setLoading(true);
  try{
    const res = await fetch(API_SAVE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prData)
    });
    if(!res.ok) throw new Error("Gagal menyimpan");
    const j = await res.json();
    if(j.success) {
      showToast(message);
      loadPR();
    } else {
      throw new Error(j.error || "error");
    }
  }catch(err){
    console.error(err);
    showToast("Gagal menyimpan data. Cek server.", true);
  }finally{
    setLoading(false);
  }
}

function clearAll(){
  if(!adminMode) return;
  if(!confirm("Yakin hapus SEMUA PR?")) return;
  prData = [];
  saveData("Semua PR dihapus!");
}

function toggleAdmin(){
  if(adminMode){
    adminMode = false;
    showToast("Logout admin.");
    qs("#admin-status").classList.add("hidden");
    qs("#admin-login-btn").innerText = "🔐 Admin";
    qs("#form-section").classList.add("hidden");
    renderPR();
    return;
  }
  const pw = prompt("Masukkan sandi admin:");
  if(pw === ADMIN_PASSWORD){
    adminMode = true;
    showToast("Login admin berhasil.");
    qs("#admin-status").classList.remove("hidden");
    qs("#admin-login-btn").innerText = "Logout";
    qs("#form-section").classList.remove("hidden");
    renderPR();
  } else {
    showToast("Sandi salah!", true);
  }
}

function setLoading(state){
  qs("#loading").classList.toggle("hidden", !state);
}

function showToast(msg, isError){
  const t = qs("#toast");
  t.innerText = msg;
  t.style.background = isError ? "rgba(139, 0, 0, 0.9)" : "rgba(2,6,23,0.9)";
  t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.add("hidden"), 2200);
}

function setupBacksound(){
  const audio = qs("#backsound");
  const btn = qs("#backsound-btn");
  audio.volume = 0.45;
  btn.addEventListener("click", () => {
    backsoundOn = !backsoundOn;
    if(backsoundOn) {
      audio.play().catch(()=>{});
      btn.innerText = "🔈";
      showToast("Backsound: ON");
    } else {
      audio.pause();
      btn.innerText = "🔊";
      showToast("Backsound: OFF");
    }
  });
}

// small helper: escape HTML to avoid injection
function escapeHtml(s){
  if(!s) return "";
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
