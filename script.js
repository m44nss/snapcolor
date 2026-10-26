const palette = document.querySelector("#palette");
const generateBtn = document.querySelector("#generate-btn");
const exportBtn = document.querySelector("#export-btn");
const status = document.querySelector("#status");
const dialog = document.querySelector("#export-dialog");
const cssOutput = document.querySelector("#css-output");
const copyCssBtn = document.querySelector("#copy-css-btn");
const closeDialogBtn = document.querySelector("#close-dialog");

const colorNames = [
  "Midnight",
  "Ocean",
  "Lagoon",
  "Mint",
  "Lime",
  "Coral",
  "Peach",
  "Apricot",
  "Rose",
  "Lavender",
  "Violet",
  "Sky",
  "Denim",
  "Sand",
  "Marigold",
  "Forest",
  "Sage",
  "Berry",
  "Plum",
  "Charcoal",
];

const initialColors = ["#F4A261", "#E76F51", "#2A9D8F", "#264653", "#E9C46A"];

let colors = initialColors.map((hex, index) => ({
  hex,
  locked: false,
  name: colorNames[index],
}));

function randomHex() {
  const value = Math.floor(Math.random() * 0x1000000);
  return `#${value.toString(16).padStart(6, "0").toUpperCase()}`;
}

function getColorName(index) {
  return (
    colorNames[Math.floor(Math.random() * colorNames.length)] +
    (index > 0 ? ` ${index + 1}` : "")
  );
}

function renderPalette() {
  palette.replaceChildren();

  colors.forEach((color, index) => {
    const card = document.createElement("article");
    card.className = "color-card";

    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.backgroundColor = color.hex;
    swatch.setAttribute("aria-label", `Color ${color.hex}`);

    const info = document.createElement("div");
    info.className = "color-info";

    const name = document.createElement("span");
    name.className = "color-name";
    name.textContent = color.name;

    const hexButton = document.createElement("button");
    hexButton.className = "hex-button";
    hexButton.type = "button";
    hexButton.textContent = color.hex;
    hexButton.setAttribute("aria-label", `Copy ${color.hex}`);
    hexButton.addEventListener("click", () => copyText(color.hex));

    const lockButton = document.createElement("button");
    lockButton.className = `lock-button${color.locked ? " locked" : ""}`;
    lockButton.type = "button";
    lockButton.textContent = color.locked ? "🔒 Locked" : "♧ Lock";
    lockButton.setAttribute(
      "aria-label",
      `${color.locked ? "Unlock" : "Lock"} color ${color.hex}`,
    );
    lockButton.setAttribute("aria-pressed", String(color.locked));

    lockButton.addEventListener("click", () => {
      colors[index].locked = !colors[index].locked;
      renderPalette();
      setStatus(
        colors[index].locked
          ? `${colors[index].hex} is locked.`
          : `${colors[index].hex} is unlocked.`,
      );
    });

    info.append(name, hexButton, lockButton);
    card.append(swatch, info);
    palette.append(card);
  });
}

function generatePalette() {
  let changed = 0;

  colors = colors.map((color, index) => {
    if (color.locked) return color;

    changed += 1;
    return {
      hex: randomHex(),
      locked: false,
      name: getColorName(index),
    };
  });

  renderPalette();

  setStatus(
    changed === 0
      ? "All colors are locked. Unlock one to generate new colors."
      : `Palette refreshed. ${changed} color${changed === 1 ? "" : "s"} updated.`,
  );
}

function setStatus(message) {
  status.textContent = message;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(`${text} copied to clipboard.`);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();

    const copied = document.execCommand("copy");
    helper.remove();

    setStatus(
      copied ? `${text} copied to clipboard.` : `Copy this color: ${text}`,
    );
  }
}

function makeCss() {
  const lines = colors.map((color, index) => {
    return `  --color-${index + 1}: ${color.hex};`;
  });

  return `:root {\n${lines.join("\n")}\n}`;
}

function openExportDialog() {
  cssOutput.value = makeCss();

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    setStatus("Your CSS is ready in the export panel.");
    dialog.setAttribute("open", "");
  }
}

generateBtn.addEventListener("click", generatePalette);
exportBtn.addEventListener("click", openExportDialog);
closeDialogBtn.addEventListener("click", () => dialog.close());
copyCssBtn.addEventListener("click", () => copyText(cssOutput.value));

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable;

  if (event.code === "Space" && !typing && !dialog.open) {
    event.preventDefault();
    generatePalette();
  }
});

renderPalette();
