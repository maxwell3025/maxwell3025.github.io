import {
  viewTypeSelector,
  minInput,
  maxInput,
  widthInput,
  heightInput,
  resetButton,
  borderDissipationInput,
  borderDepthInput,
  dtInput,
  dsInput,
  brushMenu,
  brushSelector,
  brushValueInput,
  brushFrequencyInput,
  brushInternalResistanceInput,
  brushXInput,
  brushYInput,
  brushZInput,
  timeLabel,
  widthLabel,
  heightLabel,
  display,
  brushRadiusInput,
  fpsInput,
  fpsLabel,
  loadButton,
  saveButton
} from "./domContent.js";
import { loadZip, saveZip } from "./fieldSaving.js";
import { SimulationInstance } from "./simulation.js";
import { Field, FloatTexture, PingPongPipeline, RenderPipeline, glFinish } from "./webGlFunctions.js";

let running = false;

/** @type {SimulationInstance} */
let instance;

document.addEventListener("keydown", e => {
  if (e.key === " ") {
    e.preventDefault();
    running = !running;
  }
})

let resetFlag = false;
resetButton.addEventListener("click", () => {
  resetFlag = true;
})

loadButton.addEventListener("click", () => {
  const dummyFileSelect = document.createElement("input");
  dummyFileSelect.type = "file";
  dummyFileSelect.accept = "application/x-zip";
  dummyFileSelect.addEventListener("change", () => {
    const file = dummyFileSelect.files.item(0);
    loadZip(file, instance);
  });
  dummyFileSelect.click();
});

saveButton.addEventListener("click", async () => {
  const saveFile = await saveZip(instance);
  const saveFileLink = URL.createObjectURL(saveFile);
  const dummyDownloadLink = document.createElement("a");
  dummyDownloadLink.href = saveFileLink;
  dummyDownloadLink.download = "save.zip";
  dummyDownloadLink.innerText = "hi";
  dummyDownloadLink.click();
});

brushValueInput.addEventListener("input", e => {
  brushXInput.value = brushValueInput.value;
  brushYInput.value = brushValueInput.value;
  brushZInput.value = brushValueInput.value;
})

function showElement(id) {
  /** @type {HTMLInputElement} */
  const elem = document.getElementById(id);
  elem.labels.forEach(label => label.hidden = false);
  elem.hidden = false;
}

function hideAllBrushOptions() {
  for (const child of brushMenu.children) {
    child.hidden = true;
  }
  showElement("brushSelector");
  showElement("brushRadiusInput");
}

hideAllBrushOptions();

brushSelector.addEventListener("change", e => {
  hideAllBrushOptions();
  switch (brushSelector.value) {
    case "none":
      break;
    case "currentSource":
      showElement("brushFrequencyInput");
      showElement("brushXInput");
      showElement("brushYInput");
      showElement("brushZInput");
      break;
    case "linearSource":
      showElement("brushFrequencyInput");
      showElement("brushInternalResistanceInput");
      showElement("brushXInput");
      showElement("brushYInput");
      showElement("brushZInput");
      break;
    case "conductivity":
      showElement("brushValueInput");
      showElement("brushXInput");
      showElement("brushYInput");
      showElement("brushZInput");
      break;
    case "material":
      showElement("brushValueInput");
      break;
    case "doping":
      showElement("brushValueInput");
      break;
  }
})

let prevX = null;
let prevY = null;
/**
 * @param {MouseEvent} evt 
 * @param {SimulationInstance} instance 
 */
function handleDrawCall(evt, instance){
  if ((evt.buttons & 1) == 0) {
    prevX = null;
    prevY = null;
    return;
  }
  const boundingRect = display.getBoundingClientRect();
  const normalizedX = (evt.clientX - boundingRect.x) / boundingRect.width;
  const normalizedY = 1 - (evt.clientY - boundingRect.y) / boundingRect.height;
  const gridX = normalizedX * instance.width;
  const gridY = normalizedY * instance.height;
  prevX ??= gridX;
  prevY ??= gridY;
  const radius = Number.parseFloat(brushRadiusInput.value);
  if(Number.isNaN(radius) || radius < 0) throw new Error("Invalid Radius!");
  instance.drawSegment(prevX, prevY, gridX, gridY, radius);
  prevX = gridX;
  prevY = gridY;
}

const startTimeMS = Date.now();
while (true) {
  instance = new SimulationInstance(Number.parseInt(widthInput.value), Number.parseInt(heightInput.value));
  await instance.init();
  /** @type {MouseEvent[]} */
  const drawQueue = [];
  display.addEventListener("mousemove", e => drawQueue.unshift(e))
  resetFlag = false;
  let fps = Number.parseFloat(fpsInput.value);
  let timeMS = Date.now() - startTimeMS;
  while (!resetFlag) {
    const frameDelay = 1000 / Number.parseFloat(fpsInput.value);
    const frameEnd = new Promise((r) => {
      const controller = new AbortController();
      const signal = controller.signal;
      setTimeout(() => {
        controller.abort();
        r();
      }, frameDelay);
      fpsInput.addEventListener("change", r, {once: true, signal: signal})
    });
    instance.displayFields();
    if (running) {
      instance.stepSimulation();
    }
    const ds = Number.parseFloat(dsInput.value);
    timeLabel.textContent = instance.time.toPrecision(4);
    widthLabel.textContent = (instance.width * ds).toPrecision(4);
    heightLabel.textContent = (instance.height * ds).toPrecision(4);

    while (drawQueue.length > 0) {
      handleDrawCall(drawQueue.pop(), instance);
    }

    glFinish();

    await frameEnd;
    const currentTimeMS = Date.now() - startTimeMS;
    fps *= Math.exp(-0.001 * (currentTimeMS - timeMS));
    timeMS = currentTimeMS;
    fpsLabel.textContent = fps.toPrecision(4)
    fps++;
  }
  instance.delete()
}