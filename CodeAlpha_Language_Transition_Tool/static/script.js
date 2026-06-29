/* ============================================================
   Language Translation Tool — Frontend Script
   CodeAlpha AI Internship | Task 1
   ============================================================ */

// ── DOM References ─────────────────────────────────────────
const inputText    = document.getElementById("input-text");
const outputText   = document.getElementById("output-text");
const sourceLang   = document.getElementById("source-lang");
const targetLang   = document.getElementById("target-lang");
const translateBtn = document.getElementById("translate-btn");
const clearBtn     = document.getElementById("clear-btn");
const swapBtn      = document.getElementById("swap-btn");
const copyBtn      = document.getElementById("copy-btn");
const copyFullBtn  = document.getElementById("copy-full-btn");
const charCount    = document.getElementById("char-count");
const loader       = document.getElementById("loader");
const errorMsg     = document.getElementById("error-msg");
const errorText    = document.getElementById("error-text");
const toast        = document.getElementById("toast");

// Holds the latest translated text
let translatedResult = "";

// ── Character Counter ───────────────────────────────────────
inputText.addEventListener("input", () => {
  const len = inputText.value.length;
  charCount.textContent = `${len} / 5000`;

  // Turn red when approaching limit
  if (len > 4500) {
    charCount.classList.add("char-warn");
  } else {
    charCount.classList.remove("char-warn");
  }
});

// ── Translate on Ctrl+Enter ─────────────────────────────────
inputText.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    handleTranslate();
  }
});

// ── Translate Button ────────────────────────────────────────
translateBtn.addEventListener("click", handleTranslate);

async function handleTranslate() {
  const text = inputText.value.trim();

  // Basic frontend validation
  if (!text) {
    showError("Please enter some text to translate.");
    return;
  }

  // Show loading state
  setLoadingState(true);
  hideError();
  clearOutput();

  try {
    // Send translation request to Flask backend
    const response = await fetch("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text:        text,
        source_lang: sourceLang.value,
        target_lang: targetLang.value,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      showError(data.error || "Something went wrong. Please try again.");
    } else {
      // Display translated result
      displayResult(data.translated_text);
    }

  } catch (err) {
    showError("Network error. Make sure the server is running.");
  } finally {
    setLoadingState(false);
  }
}

// ── Display Result ──────────────────────────────────────────
function displayResult(text) {
  translatedResult = text;
  outputText.textContent = text;       // Use textContent (safe, no XSS)
  copyBtn.disabled      = false;
  copyFullBtn.disabled  = false;
}

// ── Clear Button ────────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  inputText.value        = "";
  charCount.textContent  = "0 / 5000";
  charCount.classList.remove("char-warn");
  clearOutput();
  hideError();
  translatedResult = "";
});

function clearOutput() {
  outputText.innerHTML   = '<span class="placeholder">Translation will appear here…</span>';
  copyBtn.disabled       = true;
  copyFullBtn.disabled   = true;
}

// ── Swap Languages ──────────────────────────────────────────
swapBtn.addEventListener("click", () => {
  const srcVal = sourceLang.value;
  const tgtVal = targetLang.value;

  // Don't swap if source is "auto"
  if (srcVal === "auto") {
    sourceLang.value = tgtVal;
    return;
  }

  // Swap selected values
  sourceLang.value = tgtVal;
  // targetLang doesn't have "auto" option, find closest match
  const opt = [...targetLang.options].find(o => o.value === srcVal);
  if (opt) targetLang.value = srcVal;

  // Also swap text areas if there's a result
  if (translatedResult) {
    const original      = inputText.value;
    inputText.value     = translatedResult;
    displayResult(original);
    charCount.textContent = `${inputText.value.length} / 5000`;
  }
});

// ── Copy (icon button in header) ────────────────────────────
copyBtn.addEventListener("click", copyToClipboard);

// ── Copy Full Button ────────────────────────────────────────
copyFullBtn.addEventListener("click", copyToClipboard);

function copyToClipboard() {
  if (!translatedResult) return;

  navigator.clipboard.writeText(translatedResult).then(() => {
    showToast();
  }).catch(() => {
    // Fallback for older browsers
    const el = document.createElement("textarea");
    el.value = translatedResult;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showToast();
  });
}

// ── Toast Notification ──────────────────────────────────────
function showToast() {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ── Loading State ───────────────────────────────────────────
function setLoadingState(isLoading) {
  if (isLoading) {
    loader.classList.add("visible");
    outputText.style.display  = "none";
    translateBtn.disabled     = true;
    translateBtn.innerHTML    = '<i class="fa-solid fa-spinner fa-spin"></i> Translating…';
  } else {
    loader.classList.remove("visible");
    outputText.style.display  = "";
    translateBtn.disabled     = false;
    translateBtn.innerHTML    = '<i class="fa-solid fa-wand-magic-sparkles"></i> Translate';
  }
}

// ── Error Handling ──────────────────────────────────────────
function showError(msg) {
  errorText.textContent   = msg;
  errorMsg.style.display  = "flex";
}

function hideError() {
  errorMsg.style.display = "none";
}
