const ACCESS_CODE_HASH = "74a7a199d306fe7e5813dba1f39ccb805221175b6639a3672fb89e39e45d502e";
const STORAGE_KEY = "nn-evaluation-local-entries";

const homeScreen = document.querySelector("#home-screen");
const lodgeScreen = document.querySelector("#lodge-screen");
const rows = document.querySelector("#score-rows");
const codeForm = document.querySelector("#code-form");
const codeInput = document.querySelector("#access-code");
const codeMessage = document.querySelector("#code-message");
const entryForm = document.querySelector("#entry-form");
const entryMessage = document.querySelector("#entry-message");
const backHomeButton = document.querySelector("#back-home");
const copyJsonButton = document.querySelector("#copy-json");

let repoEntries = [];
let localEntries = [];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadLocalEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    localEntries = Array.isArray(saved) ? saved : [];
  } catch {
    localEntries = [];
  }
}

function saveLocalEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localEntries));
}

function allEntries() {
  return [...repoEntries, ...localEntries];
}

function textCell(value, className) {
  const td = document.createElement("td");
  td.textContent = value || "TBD";

  if (className) {
    td.className = className;
  }

  return td;
}

function linkCell(url, label) {
  const td = document.createElement("td");

  if (!url) {
    td.textContent = "TBD";
    return td;
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  td.append(link);

  return td;
}

function renderTable() {
  rows.replaceChildren();

  allEntries().forEach((entry) => {
    const tr = document.createElement("tr");
    if (entry.source === "local") {
      tr.className = "local-row";
    }

    tr.append(textCell(entry.date));
    tr.append(textCell(entry.person));
    tr.append(textCell(entry.modelIteration));
    tr.append(textCell(entry.score, "score"));
    tr.append(linkCell(entry.datasetLink, "Dataset"));
    tr.append(linkCell(entry.networkLink, "Repo"));
    tr.append(textCell(entry.comments));
    rows.append(tr);
  });
}

async function loadScores() {
  const response = await fetch("data/scores.json", { cache: "no-store" });
  const data = await response.json();
  repoEntries = (data.entries || []).map((entry) => ({ ...entry, source: "repo" }));
  loadLocalEntries();
  renderTable();
}

function showHome() {
  lodgeScreen.hidden = true;
  homeScreen.hidden = false;
}

function showLodge() {
  homeScreen.hidden = true;
  lodgeScreen.hidden = false;
  entryForm.elements.date.value = today();
  entryForm.elements.person.focus();
}

function entryFromForm() {
  const data = new FormData(entryForm);

  return {
    date: data.get("date"),
    person: data.get("person"),
    modelIteration: data.get("modelIteration").trim(),
    score: data.get("score").trim(),
    datasetLink: data.get("datasetLink").trim(),
    networkLink: data.get("networkLink").trim(),
    comments: data.get("comments").trim(),
    source: "local",
  };
}

function publicJson() {
  const entries = allEntries().map(({ source, ...entry }) => entry);
  return JSON.stringify({ entries }, null, 2);
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

codeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!crypto.subtle) {
    codeMessage.textContent = "Code check is unavailable in this browser.";
    return;
  }

  const enteredHash = await sha256Hex(codeInput.value.trim());

  if (enteredHash !== ACCESS_CODE_HASH) {
    codeMessage.textContent = "Wrong code.";
    codeInput.select();
    return;
  }

  codeMessage.textContent = "";
  codeInput.value = "";
  showLodge();
});

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  localEntries.push(entryFromForm());
  saveLocalEntries();
  renderTable();
  entryForm.reset();
  entryForm.elements.date.value = today();
  entryMessage.textContent = "Entry added on this browser.";
});

backHomeButton.addEventListener("click", showHome);

copyJsonButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(publicJson());
  entryMessage.textContent = "JSON copied.";
});

loadScores();
