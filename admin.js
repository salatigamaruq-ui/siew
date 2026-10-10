import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
const $ = id => document.getElementById(id);

const configured =
  typeof firebaseConfig?.apiKey === "string" &&
  firebaseConfig.apiKey.length > 0 &&
  firebaseConfig.apiKey !== "AIzaSyClJLdmskm6diWx4Jg4MGrwboZmgMIDw6o" &&
  firebaseConfig.projectId === "siew-screening" &&
  typeof firebaseConfig?.databaseURL === "string" &&
  firebaseConfig.databaseURL.includes("firebasedatabase.app");

let auth, db, sessions = [];
const escapeHtml = value => String(value ?? "—").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
if (!configured) { $("loginMessage").textContent = "Firebase belum dikonfigurasi. Isi firebase-config.js dan ikuti README-ADMIN.txt."; $("loginButton").disabled = true; }
else {
  const app = initializeApp(firebaseConfig); auth = getAuth(app); db = getDatabase(app);
  onAuthStateChanged(auth, user => {
    if (user) { $("loginPanel").hidden = true; $("dashboardPanel").hidden = false; $("adminIdentity").textContent = `Login: ${user.email || "akun admin"}`; loadSessions(); }
    else { $("loginPanel").hidden = false; $("dashboardPanel").hidden = true; }
  });
}
$("loginForm").addEventListener("submit", async event => {
  event.preventDefault(); if (!configured) return;
  $("loginButton").disabled = true; $("loginMessage").textContent = "Memeriksa akun...";
  try { await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value); $("loginMessage").textContent = ""; }
  catch (e) { $("loginMessage").textContent = e.code === "auth/invalid-credential" ? "Email atau kata sandi salah." : `Login gagal: ${e.message}`; }
  finally { $("loginButton").disabled = false; }
});
$("logoutButton").addEventListener("click", () => signOut(auth));
$("refreshButton").addEventListener("click", loadSessions);
$("searchInput").addEventListener("input", render);
async function loadSessions() {
  if (!auth?.currentUser) return;
  $("tableMessage").textContent = "Memuat data dari Firebase...";
  try {
    const snap = await get(ref(db, "sessions"));
    const data = snap.val() || {};
    sessions = Object.entries(data).map(([id, value]) => ({ id, ...value })).sort((a,b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
    render(); $("tableMessage").textContent = `Terakhir dimuat: ${new Date().toLocaleString("id-ID")}`;
  } catch (e) {
    sessions = []; render(); $("tableMessage").textContent = "Gagal membaca data. Periksa Realtime Database Rules dan pastikan UID admin sudah diizinkan. " + e.message;
  }
}
function statusClass(status) { const s = String(status || "").toUpperCase(); if (s.includes("ACUAN") || s.includes("AMAN")) return "good"; if (s.includes("EVALUASI") || s.includes("WASPADA")) return "warn"; return ""; }
function render() {
  const q = $("searchInput").value.trim().toLowerCase();
  const filtered = sessions.filter(s => `${s.participant?.name || ""} ${s.participant?.code || ""} ${s.status || ""}`.toLowerCase().includes(q));
  $("totalCount").textContent = sessions.length;
  $("normalCount").textContent = sessions.filter(s => /ACUAN|AMAN/i.test(s.status || "")).length;
  $("reviewCount").textContent = sessions.filter(s => /EVALUASI|WASPADA/i.test(s.status || "")).length;
  $("incompleteCount").textContent = sessions.filter(s => { const m=s.measurements||{}; return [m.bpm,m.spo2,m.napas,m.suhu].some(v => v === null || v === undefined || v === ""); }).length;
  $("sessionRows").innerHTML = filtered.length ? filtered.map(s => {
    const p=s.participant||{}, m=s.measurements||{};
    return `<tr><td>${escapeHtml(s.createdAt ? new Date(s.createdAt).toLocaleString("id-ID") : "—")}</td><td><b>${escapeHtml(p.code || p.name)}</b><br><span class="small">${escapeHtml(p.name)}</span></td><td>${escapeHtml(p.age)}</td><td>${escapeHtml(m.bpm)}</td><td>${escapeHtml(m.spo2)}</td><td>${escapeHtml(m.napas)}</td><td>${escapeHtml(m.suhu)}</td><td><span class="pill ${statusClass(s.status)}">${escapeHtml(s.status || "MENUNGGU DATA")}</span></td></tr>`;
  }).join("") : '<tr><td colspan="8" class="empty">Belum ada data sesi atau tidak ada hasil pencarian.</td></tr>';
}
$("exportButton").addEventListener("click", () => {
  if (!sessions.length) { $("tableMessage").textContent = "Belum ada data untuk diekspor."; return; }
  const rows = [["Waktu","Nama/Inisial","Kode Peserta","Usia","Jenis Kelamin","BPM","SpO2","Napas per menit","Suhu C","Status"]];
  sessions.forEach(s => { const p=s.participant||{},m=s.measurements||{}; rows.push([s.createdAt||"",p.name||"",p.code||"",p.age??"",p.sex||"",m.bpm??"",m.spo2??"",m.napas??"",m.suhu??"",s.status||""]); });
  const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`SIEW-riwayat-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
});
