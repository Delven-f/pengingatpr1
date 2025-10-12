let prData = [];
let toastTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  loadPR();
  bindUI();
});

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

function bindUI() {
  qs("#pr-form").onsubmit = handleFormSubmit;
  qs("#cancel-btn").onclick = resetForm;
  qs("#search").oninput = renderPR;
}

function loadPR() {
  const saved = localStorage.getItem("prData");
  prData = saved ? JSON.parse(saved) : [];
  renderPR();
}

function savePR() {
  localStorage.setItem("prData", JSON.stringify(prData));
}

function renderPR() {
  const container = qs("#daftarPR");
  const keyword = qs("#search").value.trim().toLowerCase();
  container.innerHTML = "";

  if (!prData.length) {
    container.innerHTML = "<div>Tidak ada PR tersimpan.</div>";
    return;
  }

  prData
    .filter(pr => !keyword || pr.mapel.toLowerCase().includes(keyword))
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
    .forEach((pr, i) => {
      const card = document.createElement("div");
      const overdue = new Date(pr.tanggal) < new Date();
      card.className = "card" + (overdue ? " overdue" : "");
      card.innerHTML = `
        <b>${pr.mapel}</b>
        <div>${pr.deskripsi}</div>
        <div class="tanggal">📅 Deadline: ${pr.tanggal}</div>
        <div class="actions">
          <button onclick="editPR(${i})">✏️</button>
          <button class="danger" onclick="hapusPR(${i})">🗑️</button>
        </div>
      `;
      container.appendChild(card);
    });
}

function handleFormSubmit(e) {
  e.preventDefault();
  const mapel = qs("#mapel").value.trim();
  const deskripsi = qs("#deskripsi").value.trim();
  const tanggal = qs("#tanggal").value;

  if (!mapel || !deskripsi || !tanggal) {
    showToast("Isi semua kolom!", true);
    return;
  }

  const idx = qs("#pr-index").value;
  if (idx !== "") {
    prData[idx] = { mapel, deskripsi, tanggal };
    showToast("PR berhasil diperbarui!");
  } else {
    prData.push({ mapel, deskripsi, tanggal });
    showToast("PR berhasil ditambahkan!");
  }

  savePR();
  resetForm();
  renderPR();
}

function editPR(i) {
  const pr = prData[i];
  qs("#form-title").innerText = "Edit PR";
  qs("#mapel").value = pr.mapel;
  qs("#deskripsi").value = pr.deskripsi;
  qs("#tanggal").value = pr.tanggal;
  qs("#pr-index").value = i;
  qs("#cancel-btn").classList.remove("hidden");
}

function hapusPR(i) {
  if (!confirm("Yakin hapus PR ini?")) return;
  prData.splice(i, 1);
  savePR();
  renderPR();
  showToast("PR dihapus!");
}

function resetForm() {
  qs("#form-title").innerText = "Tambah PR";
  qs("#pr-form").reset();
  qs("#pr-index").value = "";
  qs("#cancel-btn").classList.add("hidden");
}

function showToast(msg) {
  const toast = qs("#toast");
  toast.innerText = msg;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2000);
}
