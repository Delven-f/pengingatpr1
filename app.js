// ======================================
// ABSENSI SISWA DIGITAL
// ======================================

// GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT
const WEB_APP_URL =
"https://script.google.com/macros/s/ISI_URL_KAMU/exec";

// Statistik
let hadir = 0;
let izin = 0;
let sakit = 0;
let alpha = 0;

// ======================================
// JAM & TANGGAL WIB REALTIME
// ======================================

function updateWaktu() {

    const now = new Date();

    const tanggal = now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const jam = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const tanggalEl = document.getElementById("tanggal");
    const jamEl = document.getElementById("jam");

    if (tanggalEl) tanggalEl.textContent = tanggal;
    if (jamEl) jamEl.textContent = jam + " WIB";
}

setInterval(updateWaktu, 1000);
updateWaktu();

// ======================================
// KIRIM ABSENSI
// ======================================

async function kirimAbsensi() {

    const nama = document
        .getElementById("nama")
        .value
        .trim();

    const status = document
        .getElementById("status")
        .value;

    if (!nama) {
        alert("Masukkan nama terlebih dahulu!");
        return;
    }

    try {
