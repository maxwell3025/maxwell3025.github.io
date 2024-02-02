(async () => {
const frameDelay = 50;

let running = false;

document.addEventListener("keydown", e => {
  if(e.key === " "){
    running = !running;
    e.preventDefault();
  }
})

/**
 * @type {HTMLSelectElement}
 */
const viewTypeSelector = document.getElementById("viewTypeSelector")

const display = document.createElement("canvas");
display.style.imageRendering = "pixelated";
display.hidden = true;
document.body.appendChild(display);

const gl = display.getContext("webgl2", {powerPreference: "high-performance"})
if(gl == null){
    console.log("Could not create a display context")
}

const floatExtension = gl.getExtension("EXT_color_buffer_float");
if (floatExtension === null) {
  console.error("Extension EXT_color_buffer_float not supported");
}

function loadShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(source)
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const vertexPassthroughCode = await fetch("./passthrough.vsh").then(x => x.text());
const vertexPassthroughShader = loadShader(gl.VERTEX_SHADER, vertexPassthroughCode)

const meshData = new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, meshData, gl.STATIC_DRAW, 0);

/**
 * Represents a shader program and an output
 */
class RenderPipeline{
  program;
  framebuffer;
  viewport;
  outputWidth;
  outputHeight;
  bufs = new Array(gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)).fill(gl.NONE);

  constructor(source, outputWidth, outputHeight, framebuffer = gl.createFramebuffer()){
    const fragShader = loadShader(gl.FRAGMENT_SHADER, source);
    this.program = gl.createProgram();
    gl.attachShader(this.program, fragShader);
    gl.attachShader(this.program, vertexPassthroughShader);
    gl.linkProgram(this.program);

    this.framebuffer = framebuffer;

    this.outputWidth = outputWidth;
    this.outputHeight = outputHeight;

    this.viewport = [0, 0, this.outputWidth, this.outputHeight];
    
    if(framebuffer === null){
      this.bufs = [gl.BACK];
    }
  }

  setUniform1f(name, value){
    gl.useProgram(this.program);
    const uniformLocation = gl.getUniformLocation(this.program, name);
    gl.uniform1f(uniformLocation, value);
  }

  setSampler2D(name, texture){
    gl.useProgram(this.program);
    const texUniformLocation = gl.getUniformLocation(this.program, name);
    gl.uniform1i(texUniformLocation, texture.binding);
  }

  bindOutput(name, texture){
    if(this.framebuffer === null) throw new Error("Cannot bind outptu when targeting default framebuffer")
    const outputIndex = gl.getFragDataLocation(this.program, name); //-1 if name is not an output variable
    if(outputIndex === -1) throw new Error(`${name} is not a fragment shader output variable in this program`);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0 + outputIndex,
        gl.TEXTURE_2D,
        texture.texture,
        0
    );
    this.bufs[outputIndex] = gl.COLOR_ATTACHMENT0 + outputIndex;
  }

  unbindOutput(name){
    const outputIndex = gl.getFragDataLocation(this.program, name); //-1 if name is not an output variable
    if(outputIndex === -1) throw new Error(`${name} is not a fragment shader output variable in this program`);
    this.bufs[outputIndex] = gl.NONE;
  }

  setViewport(x, y, width, height){
    this.viewport = [x, y, width, height]
  }

  execute(){
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(...this.viewport);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const aVertexPosition = gl.getAttribLocation(this.program, "vertex_position");
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);
    gl.drawBuffers(this.bufs);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}


let currentBinding = 0;
class FloatTexture{
  texture;
  binding = currentBinding++;
  width;
  height;

  constructor(width, height){
    this.width = width;
    this.height = height;
    this.texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + this.binding);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    const data = new Float32Array(this.width * this.height).fill(0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      this.width,
      this.height,
      0,
      gl.RED,
      gl.FLOAT,
      data
    );
  }

  setData(data){
    gl.activeTexture(gl.TEXTURE0 + this.binding);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      this.width,
      this.height,
      0,
      gl.RED,
      gl.FLOAT,
      data
    );
  }

  /**
   * 
   * @param {string} src 
   * @param {(x: [number, number, number, number]) => number} transformation 
   */
  async setDataFromImage(src, transformation){
    const image = new Image();
    image.src = src;
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const context = canvas.getContext("2d");
    await new Promise(r => image.onload = r);
    context.drawImage(image, 0, 0, this.width, this.height);
    const imageData = Array.from(context.getImageData(0, 0, this.width, this.height).data);
    const fieldData = [];
    while(imageData.length > 0){
      fieldData.push(transformation(imageData.splice(0, 4)));
    }
    this.setData(fieldData);
  }

  link(program, name){
    gl.useProgram(program);
    const texUniformLocation = gl.getUniformLocation(program, name);
    gl.uniform1i(texUniformLocation, this.binding);
  }

  display(x, y, program){
    program.setSampler2D("tex0", this);
    program.setUniform1f("width", this.width * 4);
    program.setUniform1f("height", this.height * 4);
    program.setUniform1f("x", x);
    program.setUniform1f("y", y);
    program.execute();
  }
}

class Field{
  srcTexture;
  destTexture;
  solnTexture;
  width;
  height;

  constructor(width, height){
    this.srcTexture = new FloatTexture(width, height);
    this.destTexture = new FloatTexture(width, height);
    this.solnTexture = new FloatTexture(width, height);
    this.width = width;
    this.height = height;
  }

  setData(data){
    this.srcTexture.setData(data);
    this.solnTexture.setData(data);
  }

  swap() {
    [this.srcTexture, this.destTexture] = [this.destTexture, this.srcTexture];
  }

  // when using Crank-Nicholson with fixed point, we can use this
  swapCNIter() {
    [this.solnTexture, this.destTexture] = [this.destTexture, this.solnTexture];
  }

  display(x, y, program){
    program.setSampler2D("tex0", this.srcTexture);
    program.setUniform1f("width", this.width * 4);
    program.setUniform1f("height", this.height * 4);
    program.setUniform1f("x", x);
    program.setUniform1f("y", y);
    program.execute();
  }
}

const crankNicholsonIterCount = 4;

class SimulationInstance{
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

  /** @type {number} */
  width;
  /** @type {number} */
  height;

  ds;
  dt;
  boundaryDepth;
  boundaryOpacity;

  time = 0;

  /** @type {RenderPipeline} */
  displayProgramPipeline;
  /** @type {RenderPipeline} */
  stepProgram;
  /** @type {RenderPipeline} */
  displayDField;
  /** @type {RenderPipeline} */
  displayBField;

  constructor(width, height){
    this.width = width;
    this.height = height;

    this.ds = 0.1;
    this.dt = 0.01;

    this.boundaryDepth = 0.2;
    this.boundaryOpacity = 10;

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
  }

  async init(){
    this.displayProgramPipeline = new RenderPipeline(await fetch("./display.fsh").then(x => x.text()), this.width * 4, this.height * 4, null);
    this.displayDField = new RenderPipeline(await fetch("./displayD.fsh").then(x => x.text()), this.width * 4, this.height * 4, null);
    this.displayBField = new RenderPipeline(await fetch("./displayB.fsh").then(x => x.text()), this.width * 4, this.height * 4, null);
    this.stepProgram = new RenderPipeline(await fetch("./step.fsh").then(x => x.text()), this.width, this.height);

    display.width = width * 4;
    display.height = height * 4;
    display.hidden = false;
  }

  displayFields(){
    switch(viewTypeSelector.value){
      case "d":
        this.displayDField.setSampler2D("d_x_tex", this.fieldDX.srcTexture);
        this.displayDField.setSampler2D("d_y_tex", this.fieldDY.srcTexture);
        this.displayDField.setSampler2D("d_z_tex", this.fieldDZ.srcTexture);
        this.displayDField.setUniform1f("width", this.width * 4);
        this.displayDField.setUniform1f("height", this.height * 4);
        this.displayDField.setUniform1f("x", 0);
        this.displayDField.setUniform1f("y", 0);
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
        this.displayBField.setUniform1f("width", this.width);
        this.displayBField.setUniform1f("height", this.height);
        this.displayBField.setUniform1f("x", 0);
        this.displayBField.setUniform1f("y", 0);
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

      default:
        alert("ERROR unimplemented view type!");
    }
  }

  stepSimulation(){
    console.log(this.time);
    //Crank the Nicholson
    for(let iteration = 0; iteration < crankNicholsonIterCount; iteration++){
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

      this.stepProgram.bindOutput("d_x_new", this.fieldDX.destTexture);
      this.stepProgram.bindOutput("d_y_new", this.fieldDY.destTexture);
      this.stepProgram.bindOutput("d_z_new", this.fieldDZ.destTexture);
      this.stepProgram.bindOutput("b_x_new", this.fieldBX.destTexture);
      this.stepProgram.bindOutput("b_y_new", this.fieldBY.destTexture);
      this.stepProgram.bindOutput("b_z_new", this.fieldBZ.destTexture);
      this.stepProgram.bindOutput("charge_new", this.fieldCharge.destTexture);

      this.stepProgram.setUniform1f("width", this.width);
      this.stepProgram.setUniform1f("height", this.height);
      this.stepProgram.setUniform1f("dt", this.dt);
      this.stepProgram.setUniform1f("ds_inv", 1 / this.ds);
      this.stepProgram.setUniform1f("ds", this.ds);
      this.stepProgram.setUniform1f("time", this.time);
      this.stepProgram.setUniform1f("boundary_thickness", this.boundaryDepth / this.ds);
      this.stepProgram.setUniform1f("boundary_opacity", 2 * this.boundaryOpacity * this.ds / this.boundaryDepth);

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

    this.time += this.dt;
  }
}

const instance = new SimulationInstance(64, 64);
await instance.init();
while(true){
  const frameEnd = new Promise((r) => setTimeout(r, frameDelay));
  const timeA = Date.now();

  instance.displayFields();
  if(running){
    instance.stepSimulation();
  }
  gl.finish();

  const timeB = Date.now();
  console.log(timeB - timeA);
  await frameEnd;
}
})()