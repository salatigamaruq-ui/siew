import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, push, set, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const configured = firebaseConfig.apiKey !== "ISI_API_KEY" && firebaseConfig.projectId !== "ISI_PROJECT_ID" && firebaseConfig.databaseURL.includes("firebasedatabase.app");
let auth, db, uid = null;
let readyResolve;
const ready = new Promise(resolve => { readyResolve = resolve; });
if (configured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app); db = getDatabase(app);
  onAuthStateChanged(auth, async user => {
    if (user) { uid = user.uid; readyResolve(true); }
    else {
      try { await signInAnonymously(auth); }
      catch (e) { console.error("SIEW Firebase Auth:", e); readyResolve(false); }
    }
  });
} else { readyResolve(false); }

let currentKey = null;
window.SIEWStorage = {
  configured,
  async startSession(person) {
    if (!configured || !(await ready) || !uid) return false;
    const record = { participant: person, measurements: { bpm: null, spo2: null, napas: null, suhu: null }, status: "MENUNGGU DATA", createdAt: person.startedAt, updatedAt: new Date().toISOString(), ownerUid: uid };
    const item = push(ref(db, "sessions")); currentKey = item.key;
    await set(item, record);
    return true;
  },
  async updateMeasurement(measurements, status) {
    if (!configured || !currentKey || !(await ready) || !uid) return false;
    const updates = { measurements, status: status || "MENUNGGU DATA", updatedAt: new Date().toISOString() };
    await update(ref(db, `sessions/${currentKey}`), updates);
    return true;
  },
  endSession() { currentKey = null; }
};
