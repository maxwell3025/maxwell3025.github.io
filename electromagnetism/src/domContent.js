// Mapping to HTML content
/** @type {HTMLSelectElement} */
export const viewTypeSelector = document.getElementById("viewTypeSelector")

/** @type {HTMLInputElement} */
export const minInput = document.getElementById("minInput")

/** @type {HTMLInputElement} */
export const maxInput = document.getElementById("maxInput")

/** @type {HTMLInputElement} */
export const widthInput = document.getElementById("widthInput")

/** @type {HTMLInputElement} */
export const heightInput = document.getElementById("heightInput")

/** @type {HTMLButtonElement} */
export const resetButton = document.getElementById("resetButton")

/** @type {HTMLInputElement} */
export const borderDissipationInput = document.getElementById("borderDissipationInput");

/** @type {HTMLInputElement} */
export const borderDepthInput = document.getElementById("borderDepthInput");

/** @type {HTMLInputElement} */
export const dtInput = document.getElementById("dtInput");

/** @type {HTMLInputElement} */
export const dsInput = document.getElementById("dsInput");

/** @type {HTMLDivElement} */
export const brushMenu = document.getElementById("brushMenu");

/** @type {HTMLSelectElement} */
export const brushSelector = document.getElementById("brushSelector")

/** @type {HTMLInputElement} */
export const brushValueInput = document.getElementById("brushValueInput");

/** @type {HTMLInputElement} */
export const brushFrequencyInput = document.getElementById("brushFrequencyInput");

/** @type {HTMLInputElement} */
export const brushInternalResistanceInput = document.getElementById("brushInternalResistanceInput");

/** @type {HTMLInputElement} */
export const brushXInput = document.getElementById("brushXInput");

/** @type {HTMLInputElement} */
export const brushYInput = document.getElementById("brushYInput");

/** @type {HTMLInputElement} */
export const brushZInput = document.getElementById("brushZInput");

/** @type {HTMLSpanElement} */
export const timeLabel = document.getElementById("timeLabel")

/** @type {HTMLSpanElement} */
export const widthLabel = document.getElementById("widthLabel")

/** @type {HTMLSpanElement} */
export const heightLabel = document.getElementById("heightLabel")

/** @type {HTMLCanvasElement} */
export const display = document.createElement("canvas");
display.style.imageRendering = "pixelated";
display.hidden = true;
document.body.appendChild(display);