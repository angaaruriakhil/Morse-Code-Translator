// app.js - DOM interactions for the Morse Code Translator
import { convertToMorse, convertToEnglish } from "./translator.js";

const inputEl = document.getElementById("translatorInput");
const outputEl = document.getElementById("translatorOutput");
const modeEl = document.getElementById("translatorMode");
const messageEl = document.getElementById("translatorMessage");

const translateBtn = document.getElementById("translateButton");
const clearBtn = document.getElementById("clearButton");
const copyBtn = document.getElementById("copyButton");

const MESSAGE_BASE_CLASS = "translatorCard__message";

// Detect whether the input looks like English or Morse
function detectMode(text) {
  const trimmed = text.trim();

  if (!trimmed) return "EMPTY";

  const hasLettersOrDigits = /[a-zA-Z0-9]/.test(trimmed);
  const morsePattern = /^[.\-/\s]+$/; // dots, dashes, slashes, spaces only

  // If we see any letters/numbers, treat as English
  if (hasLettersOrDigits) {
    return "ENGLISH";
  }

  // No letters/numbers; if it matches Morse charset, treat as Morse
  if (!hasLettersOrDigits && morsePattern.test(trimmed)) {
    return "MORSE";
  }

  // Otherwise it's unsupported symbols like *()& etc.
  return "UNKNOWN";
}

function setMessage(text, type = null) {
  messageEl.textContent = text || "";
  messageEl.className = MESSAGE_BASE_CLASS;

  if (type === "error") {
    messageEl.classList.add(`${MESSAGE_BASE_CLASS}--error`);
  } else if (type === "success") {
    messageEl.classList.add(`${MESSAGE_BASE_CLASS}--success`);
  }
}

function updateModeUI() {
  const text = inputEl.value;
  const mode = detectMode(text);

  modeEl.classList.remove(
    "translatorCard__mode--english",
    "translatorCard__mode--morse",
    "translatorCard__mode--unknown"
  );

  if (mode === "ENGLISH") {
    modeEl.textContent = "Detected mode: English → Morse";
    modeEl.classList.add("translatorCard__mode--english");
  } else if (mode === "MORSE") {
    modeEl.textContent = "Detected mode: Morse → English";
    modeEl.classList.add("translatorCard__mode--morse");
  } else if (mode === "EMPTY") {
    modeEl.textContent = "Detected mode: –";
    modeEl.classList.add("translatorCard__mode--unknown");
  } else {
    modeEl.textContent = "Detected mode: Unknown";
    modeEl.classList.add("translatorCard__mode--unknown");
  }

  // Only enable Translate if there's something to translate
  translateBtn.disabled = mode === "EMPTY";
}

function translate() {
  const text = inputEl.value.trim();
  const mode = detectMode(text);

  setMessage("");

  if (mode === "EMPTY") {
    setMessage("Please enter something to translate.", "error");
    return;
  }

  if (mode === "UNKNOWN") {
    setMessage(
      "Input must be either English letters/numbers or Morse using . - / and spaces.",
      "error"
    );
    outputEl.textContent = "";
    return;
  }

  try {
    let result;

    if (mode === "ENGLISH") {
      result = convertToMorse(text);
    } else if (mode === "MORSE") {
      result = convertToEnglish(text);
    }

    if (typeof result === "undefined" || result === null || result === "") {
      // Guard against translator.js returning undefined
      setMessage(
        "Could not translate this input. Please check the format and try again.",
        "error"
      );
      outputEl.textContent = "";
      return;
    }

    outputEl.textContent = result;
    setMessage("Translation complete.", "success");
  } catch (err) {
    console.error(err);
    setMessage(
      "Something went wrong while translating. Please try again.",
      "error"
    );
    outputEl.textContent = "";
  }
}

function clearAll() {
  inputEl.value = "";
  outputEl.textContent = "";
  setMessage("");
  updateModeUI();
}

async function copyResult() {
  const text = outputEl.textContent.trim();

  if (!text) {
    setMessage("There is no result to copy yet.", "error");
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      setMessage("Copied result to clipboard.", "success");
    } else {
      // Fallback for older browsers
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
      setMessage("Copied result to clipboard.", "success");
    }
  } catch (err) {
    console.error(err);
    setMessage("Unable to copy to clipboard in this browser.", "error");
  }
}

inputEl.addEventListener("input", () => {
  updateModeUI();
  setMessage("");
});

translateBtn.addEventListener("click", translate);
clearBtn.addEventListener("click", clearAll);
copyBtn.addEventListener("click", copyResult);

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    translate();
  }
});

// Initialise UI
updateModeUI();
setMessage("");
