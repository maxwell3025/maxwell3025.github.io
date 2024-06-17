import { display } from "./domContent.js";
import { Field, FloatTexture, PingPongPipeline, RenderPipeline } from "./webGlFunctions.js";

const crankNicholsonIterCount = 4;

export class SimulationInstance {
  fieldDX;
  fieldDY;
  fieldDZ;
  fieldBX;
  fieldBY;
  fieldBZ;
  fieldCharge;
  fieldJX;
  fieldJY;
  fieldJZ;
  fieldFreq;
  fieldInvPermittivityX;
  fieldInvPermittivityY;
  fieldInvPermittivityZ;
  fieldInvPermeabilityX;
  fieldInvPermeabilityY;
  fieldInvPermeabilityZ;
  fieldConductivityX;
  fieldConductivityY;
  fieldConductivityZ;
  fieldMaterial;

  /** @type {number} */
  width;
  /** @type {number} */
  height;

  time = 0;

  /** @type {RenderPipeline} */
  displayProgramPipeline;
  /** @type {PingPongPipeline} */
  stepProgram;
  /** @type {RenderPipeline} */
  displayDField;
  /** @type {RenderPipeline} */
  displayBField;
  /** @type {PingPongPipeline} */
  userDrawing;

  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.ds = 0.1;
    this.dt = 0.01;

    this.fieldDX = new Field(this.width, this.height);
    this.fieldDY = new Field(this.width, this.height);
    this.fieldDZ = new Field(this.width, this.height);
    this.fieldBX = new Field(this.width, this.height);
    this.fieldBY = new Field(this.width, this.height);
    this.fieldBZ = new Field(this.width, this.height);
    this.fieldCharge = new Field(this.width, this.height);
    this.fieldJX = new FloatTexture(this.width, this.height);
    this.fieldJY = new FloatTexture(this.width, this.height);
    this.fieldJZ = new FloatTexture(this.width, this.height);
    this.fieldFreq = new FloatTexture(this.width, this.height);
    this.fieldInvPermittivityX = new FloatTexture(this.width, this.height);
    this.fieldInvPermittivityY = new FloatTexture(this.width, this.height);
    this.fieldInvPermittivityZ = new FloatTexture(this.width, this.height);
    this.fieldInvPermeabilityX = new FloatTexture(this.width, this.height);
    this.fieldInvPermeabilityY = new FloatTexture(this.width, this.height);
    this.fieldInvPermeabilityZ = new FloatTexture(this.width, this.height);
    this.fieldConductivityX = new FloatTexture(this.width, this.height);
    this.fieldConductivityY = new FloatTexture(this.width, this.height);
    this.fieldConductivityZ = new FloatTexture(this.width, this.height);
    this.fieldMaterial = new FloatTexture(this.width, this.height);


    // Populate textures

    const zeroesArray = new Float32Array(width * height).fill(0);
    const onesArray = new Float32Array(width * height).fill(1);

    this.fieldDX.setData(zeroesArray);
    this.fieldDY.setData(zeroesArray);
    this.fieldDZ.setData(zeroesArray);
    this.fieldBX.setData(zeroesArray);
    this.fieldBY.setData(zeroesArray);
    this.fieldBZ.setData(zeroesArray);
    this.fieldCharge.setData(zeroesArray);
    this.fieldJX.setData(zeroesArray);
    this.fieldJY.setData(zeroesArray);
    this.fieldJZ.setData(zeroesArray);
    this.fieldFreq.setData(zeroesArray);
    this.fieldInvPermittivityX.setData(onesArray);
    this.fieldInvPermittivityY.setData(onesArray);
    this.fieldInvPermittivityZ.setData(onesArray);
    this.fieldInvPermeabilityX.setData(onesArray);
    this.fieldInvPermeabilityY.setData(onesArray);
    this.fieldInvPermeabilityZ.setData(onesArray);
    this.fieldConductivityX.setData(zeroesArray);
    this.fieldConductivityY.setData(zeroesArray);
    this.fieldConductivityZ.setData(zeroesArray);
    this.fieldMaterial.setData(zeroesArray);
  }

  async init() {
    this.displayProgramPipeline = new RenderPipeline(await fetch("./display.fsh").then(x => x.text()), this.width * 4, this.height * 4, null);
    this.displayDField = new RenderPipeline(await fetch("./displayD.fsh").then(x => x.text()), this.width * 4, this.height * 4, null);
    this.displayBField = new RenderPipeline(await fetch("./displayB.fsh").then(x => x.text()), this.width * 4, this.height * 4, null);
    this.stepProgram = new PingPongPipeline(await fetch("./step.fsh").then(x => x.text()), this.width, this.height);
    this.userDrawing = new PingPongPipeline(await fetch("./dummy.fsh").then(x => x.text()), this.width, this.height);

    display.width = this.width * 4;
    display.height = this.height * 4;
    display.hidden = false;
  }

  displayFields() {
    const minValue = Number.parseFloat(minInput.value)
    const maxValue = Number.parseFloat(maxInput.value)
    switch (viewTypeSelector.value) {
      case "d":
        this.displayDField.setSampler2D("d_x_tex", this.fieldDX.srcTexture);
        this.displayDField.setSampler2D("d_y_tex", this.fieldDY.srcTexture);
        this.displayDField.setSampler2D("d_z_tex", this.fieldDZ.srcTexture);
        this.displayDField.setUniform1f("width", this.width * 4);
        this.displayDField.setUniform1f("height", this.height * 4);
        this.displayDField.setUniform1f("x", 0);
        this.displayDField.setUniform1f("y", 0);
        this.displayDField.setUniform1f("min_value", minValue);
        this.displayDField.setUniform1f("max_value", maxValue);
        this.displayDField.execute();
        break;

      case "dx":
        this.fieldDX.display(1, -1, this.displayProgramPipeline);
        break;

      case "dy":
        this.fieldDY.display(-1, 1, this.displayProgramPipeline);
        break;

      case "dz":
        this.fieldDZ.display(-1, -1, this.displayProgramPipeline);
        break;

      case "b":
        this.displayBField.setSampler2D("b_x_tex", this.fieldBX.srcTexture);
        this.displayBField.setSampler2D("b_y_tex", this.fieldBY.srcTexture);
        this.displayBField.setSampler2D("b_z_tex", this.fieldBZ.srcTexture);
        this.displayBField.setUniform1f("width", this.width * 4);
        this.displayBField.setUniform1f("height", this.height * 4);
        this.displayBField.setUniform1f("x", 0);
        this.displayBField.setUniform1f("y", 0);
        this.displayBField.setUniform1f("min_value", minValue);
        this.displayBField.setUniform1f("max_value", maxValue);
        this.displayBField.execute();
        break;

      case "bx":
        this.fieldBX.display(-1, 1, this.displayProgramPipeline);
        break;

      case "by":
        this.fieldBY.display(1, -1, this.displayProgramPipeline);
        break;

      case "bz":
        this.fieldBZ.display(1, 1, this.displayProgramPipeline);
        break;

      case "charge":
        this.fieldCharge.display(-1, -1, this.displayProgramPipeline);
        break;

      case "source":
        this.displayDField.setSampler2D("d_x_tex", this.fieldJX);
        this.displayDField.setSampler2D("d_y_tex", this.fieldJY);
        this.displayDField.setSampler2D("d_z_tex", this.fieldJZ);
        this.displayDField.setUniform1f("width", this.width * 4);
        this.displayDField.setUniform1f("height", this.height * 4);
        this.displayDField.setUniform1f("x", 0);
        this.displayDField.setUniform1f("y", 0);
        this.displayDField.setUniform1f("min_value", minValue);
        this.displayDField.setUniform1f("max_value", maxValue);
        this.displayDField.execute();
        break;

      case "conductivity":
        this.displayDField.setSampler2D("d_x_tex", this.fieldConductivityX);
        this.displayDField.setSampler2D("d_y_tex", this.fieldConductivityY);
        this.displayDField.setSampler2D("d_z_tex", this.fieldConductivityZ);
        this.displayDField.setUniform1f("width", this.width * 4);
        this.displayDField.setUniform1f("height", this.height * 4);
        this.displayDField.setUniform1f("x", 0);
        this.displayDField.setUniform1f("y", 0);
        this.displayDField.setUniform1f("min_value", minValue);
        this.displayDField.setUniform1f("max_value", maxValue);
        this.displayDField.execute();
        break;

      case "permittivity":
        this.displayDField.setSampler2D("d_x_tex", this.fieldInvPermittivityX);
        this.displayDField.setSampler2D("d_y_tex", this.fieldInvPermittivityY);
        this.displayDField.setSampler2D("d_z_tex", this.fieldInvPermittivityZ);
        this.displayDField.setUniform1f("width", this.width * 4);
        this.displayDField.setUniform1f("height", this.height * 4);
        this.displayDField.setUniform1f("x", 0);
        this.displayDField.setUniform1f("y", 0);
        this.displayDField.setUniform1f("min_value", minValue);
        this.displayDField.setUniform1f("max_value", maxValue);
        this.displayDField.execute();
        break;

      case "permeability":
        this.displayBField.setSampler2D("b_x_tex", this.fieldInvPermeabilityX);
        this.displayBField.setSampler2D("b_y_tex", this.fieldInvPermeabilityY);
        this.displayBField.setSampler2D("b_z_tex", this.fieldInvPermeabilityZ);
        this.displayBField.setUniform1f("width", this.width * 4);
        this.displayBField.setUniform1f("height", this.height * 4);
        this.displayBField.setUniform1f("x", 0);
        this.displayBField.setUniform1f("y", 0);
        this.displayBField.setUniform1f("min_value", minValue);
        this.displayBField.setUniform1f("max_value", maxValue);
        this.displayBField.execute();
        break;

      case "material":
        this.fieldMaterial.display(1, 1, this.displayProgramPipeline);
        break;

      default:
        alert("ERROR unimplemented view type!");
    }
  }

  drawSegment(x1, y1, x2, y2, radius) {
    const value = Number.parseFloat(brushValueInput.value);
    const internalResistance = Number.parseFloat(brushInternalResistanceInput.value);
    const frequency = Number.parseFloat(brushFrequencyInput.value);
    const xValue = Number.parseFloat(brushXInput.value);
    const yValue = Number.parseFloat(brushYInput.value);
    const zValue = Number.parseFloat(brushZInput.value);

    switch (brushSelector.value) {
      case "none":
        break;

      case "currentSource":
        this.fieldJX.setSegment(x1, y1, x2, y2, radius, xValue);
        this.fieldJY.setSegment(x1, y1, x2, y2, radius, yValue);
        this.fieldJZ.setSegment(x1, y1, x2, y2, radius, zValue);
        this.fieldFreq.setSegment(x1, y1, x2, y2, radius, frequency);
        break;

      case "linearSource":
        if (internalResistance == 0) {
          alert("Internal resistance cannot be 0!");
        }
        const internalConductivity = 1.0 / internalResistance;
        this.fieldJX.setSegment(x1, y1, x2, y2, radius, xValue * internalConductivity);
        this.fieldJY.setSegment(x1, y1, x2, y2, radius, yValue * internalConductivity);
        this.fieldJZ.setSegment(x1, y1, x2, y2, radius, zValue * internalConductivity);
        this.fieldConductivityX.setSegment(x1, y1, x2, y2, radius, internalConductivity);
        this.fieldConductivityY.setSegment(x1, y1, x2, y2, radius, internalConductivity);
        this.fieldConductivityZ.setSegment(x1, y1, x2, y2, radius, internalConductivity);
        this.fieldFreq.setSegment(x1, y1, x2, y2, radius, frequency);
        break;

      case "conductivity":
        this.fieldConductivityX.setSegment(x1, y1, x2, y2, radius, xValue);
        this.fieldConductivityY.setSegment(x1, y1, x2, y2, radius, yValue);
        this.fieldConductivityZ.setSegment(x1, y1, x2, y2, radius, zValue);
        break;

      case "material":
        this.fieldMaterial.setSegment(x1, y1, x2, y2, radius, value);
        break;

      default:
        alert("ERROR unimplemented brush type!");
        brushSelector.value = "none";
    }
  }

  stepSimulation() {
    const ds = Number.parseFloat(dsInput.value);
    const dt = Number.parseFloat(dtInput.value);
    //Crank the Nicholson
    for (let iteration = 0; iteration < crankNicholsonIterCount; iteration++) {
      //Link everything
      this.stepProgram.setSampler2D("d_x_tex", this.fieldDX.srcTexture);
      this.stepProgram.setSampler2D("d_y_tex", this.fieldDY.srcTexture);
      this.stepProgram.setSampler2D("d_z_tex", this.fieldDZ.srcTexture);
      this.stepProgram.setSampler2D("b_x_tex", this.fieldBX.srcTexture);
      this.stepProgram.setSampler2D("b_y_tex", this.fieldBY.srcTexture);
      this.stepProgram.setSampler2D("b_z_tex", this.fieldBZ.srcTexture);
      this.stepProgram.setSampler2D("charge_tex", this.fieldCharge.srcTexture);
      this.stepProgram.setSampler2D("d_x_tex_soln", this.fieldDX.solnTexture);
      this.stepProgram.setSampler2D("d_y_tex_soln", this.fieldDY.solnTexture);
      this.stepProgram.setSampler2D("d_z_tex_soln", this.fieldDZ.solnTexture);
      this.stepProgram.setSampler2D("b_x_tex_soln", this.fieldBX.solnTexture);
      this.stepProgram.setSampler2D("b_y_tex_soln", this.fieldBY.solnTexture);
      this.stepProgram.setSampler2D("b_z_tex_soln", this.fieldBZ.solnTexture);
      this.stepProgram.setSampler2D("charge_tex_soln", this.fieldCharge.solnTexture);
      this.stepProgram.setSampler2D("inv_permittivity_x_tex", this.fieldInvPermittivityX);
      this.stepProgram.setSampler2D("inv_permittivity_y_tex", this.fieldInvPermittivityY);
      this.stepProgram.setSampler2D("inv_permittivity_z_tex", this.fieldInvPermittivityZ);
      this.stepProgram.setSampler2D("inv_permeability_x_tex", this.fieldInvPermeabilityX);
      this.stepProgram.setSampler2D("inv_permeability_y_tex", this.fieldInvPermeabilityY);
      this.stepProgram.setSampler2D("inv_permeability_z_tex", this.fieldInvPermeabilityZ);
      this.stepProgram.setSampler2D("j_x_tex", this.fieldJX);
      this.stepProgram.setSampler2D("j_y_tex", this.fieldJY);
      this.stepProgram.setSampler2D("j_z_tex", this.fieldJZ);
      this.stepProgram.setSampler2D("conductivity_x_tex", this.fieldConductivityX);
      this.stepProgram.setSampler2D("conductivity_y_tex", this.fieldConductivityY);
      this.stepProgram.setSampler2D("conductivity_z_tex", this.fieldConductivityZ);
      this.stepProgram.setSampler2D("antenna_frequency", this.fieldFreq);
      this.stepProgram.setSampler2D("material_type", this.fieldMaterial);

      this.stepProgram.bindOutput("d_x_new", this.fieldDX.destTexture);
      this.stepProgram.bindOutput("d_y_new", this.fieldDY.destTexture);
      this.stepProgram.bindOutput("d_z_new", this.fieldDZ.destTexture);
      this.stepProgram.bindOutput("b_x_new", this.fieldBX.destTexture);
      this.stepProgram.bindOutput("b_y_new", this.fieldBY.destTexture);
      this.stepProgram.bindOutput("b_z_new", this.fieldBZ.destTexture);
      this.stepProgram.bindOutput("charge_new", this.fieldCharge.destTexture);

      this.stepProgram.setUniform1f("width", this.width);
      this.stepProgram.setUniform1f("height", this.height);
      this.stepProgram.setUniform1f("dt", dt);
      this.stepProgram.setUniform1f("ds_inv", 1 / ds);
      this.stepProgram.setUniform1f("ds", ds);
      this.stepProgram.setUniform1f("time", this.time);
      this.stepProgram.setUniform1f("boundary_thickness", Number.parseFloat(borderDepthInput.value) / ds);
      if(Number.parseFloat(borderDepthInput.value) === 0){
        this.stepProgram.setUniform1f("boundary_opacity", 0);
      } else {
        this.stepProgram.setUniform1f("boundary_opacity", 2 * Number.parseFloat(borderDissipationInput.value) * ds / Number.parseFloat(borderDepthInput.value));
      }

      this.stepProgram.execute();

      this.fieldDX.swapCNIter();
      this.fieldDY.swapCNIter();
      this.fieldDZ.swapCNIter();
      this.fieldBX.swapCNIter();
      this.fieldBY.swapCNIter();
      this.fieldBZ.swapCNIter();
      this.fieldCharge.swapCNIter();
    }
    this.fieldDX.swap();
    this.fieldDY.swap();
    this.fieldDZ.swap();
    this.fieldBX.swap();
    this.fieldBY.swap();
    this.fieldBZ.swap();
    this.fieldCharge.swap();

    this.time += dt;
  }

  delete() {
    this.fieldDX.delete();
    this.fieldDY.delete();
    this.fieldDZ.delete();
    this.fieldBX.delete();
    this.fieldBY.delete();
    this.fieldBZ.delete();
    this.fieldCharge.delete();
    this.fieldJX.delete();
    this.fieldJY.delete();
    this.fieldJZ.delete();
    this.fieldFreq.delete();
    this.fieldInvPermittivityX.delete();
    this.fieldInvPermittivityY.delete();
    this.fieldInvPermittivityZ.delete();
    this.fieldInvPermeabilityX.delete();
    this.fieldInvPermeabilityY.delete();
    this.fieldInvPermeabilityZ.delete();
    this.fieldConductivityX.delete();
    this.fieldConductivityY.delete();
    this.fieldConductivityZ.delete();
    this.fieldMaterial.delete();
  }
}