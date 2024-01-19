(async () => {
const simulationWidth = 256;
const simulationHeight = 256;
const displayWidth = simulationWidth;
const displayHeight = simulationHeight;
const ds = 0.1;
const dt = ds * 0.25;
const frameDelay = 50;
const boundaryDepth = 1;
const boundaryOpacity = 10;

/**
 * @type {HTMLCanvasElement}
 */
const display = document.getElementById("display");
display.width = displayWidth * 3;
display.height = displayHeight * 3;
display.style.imageRendering = "pixelated";

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

const displayProgramPipeline = new RenderPipeline(await fetch("./display.fsh").then(x => x.text()), displayWidth, displayHeight, null);

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

  display(x, y){
    gl.viewport(x, y, displayWidth, displayHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(displayProgram);
    const widthUniformLocation = gl.getUniformLocation(displayProgram, "width");
    const heightUniformLocation = gl.getUniformLocation(displayProgram, "height");
    const xUniformLocation = gl.getUniformLocation(displayProgram, "x");
    const yUniformLocation = gl.getUniformLocation(displayProgram, "y");
    gl.uniform1f(widthUniformLocation, displayWidth);
    gl.uniform1f(heightUniformLocation, displayHeight);
    gl.uniform1f(xUniformLocation, x);
    gl.uniform1f(yUniformLocation, y);
    this.link(displayProgram, "tex0")
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const aVertexPosition = gl.getAttribLocation(displayProgram, "vertex_position");
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.useProgram(null);
  }
}
class Field{
  srcTexture;
  destTexture;
  solnTexture;

  constructor(){
    this.srcTexture = new FloatTexture(simulationWidth, simulationHeight);
    this.destTexture = new FloatTexture(simulationWidth, simulationHeight);
    this.solnTexture = new FloatTexture(simulationWidth, simulationHeight);
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

  display(x, y){
    displayProgramPipeline.setSampler2D("tex0", this.srcTexture);
    displayProgramPipeline.setUniform1f("width", displayWidth);
    displayProgramPipeline.setUniform1f("height", displayHeight);
    displayProgramPipeline.setUniform1f("x", x);
    displayProgramPipeline.setUniform1f("y", y);
    displayProgramPipeline.setViewport(x, y, displayWidth, displayHeight);
    displayProgramPipeline.execute();
  }
}

const fieldDX = new Field();
const fieldDY = new Field();
const fieldDZ = new Field();
const fieldBX = new Field();
const fieldBY = new Field();
const fieldBZ = new Field();
const fieldCharge = new Field(simulationWidth, simulationHeight);
const fieldJX = new FloatTexture(simulationWidth, simulationHeight);
const fieldJY = new FloatTexture(simulationWidth, simulationHeight);
const fieldJZ = new FloatTexture(simulationWidth, simulationHeight);
const fieldFreq = new FloatTexture(simulationWidth, simulationHeight);
const fieldPermittivity = new FloatTexture(simulationWidth * 2, simulationHeight * 2);
const fieldConductivity = new FloatTexture(simulationWidth * 2, simulationHeight * 2);

const stepProgram = new RenderPipeline(await fetch("./step.fsh").then(x => x.text()), simulationWidth, simulationHeight);

function sqr(x){
  return x * x;
}
const initialStateEX = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateEY = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateEZ = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateBX = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateBY = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateBZ = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateJX = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateJY = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateJZ = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateFreq = new Float32Array(simulationWidth * simulationHeight).fill(0);
const permittivityData = new Float32Array(simulationWidth * simulationHeight * 4).fill(1);
const conductivityData = new Float32Array(simulationWidth * simulationHeight * 4).fill(0);
const chargeData = new Float32Array(simulationWidth * simulationHeight).fill(0);

// Unsupported Charge

// const charge_amount = 1;
// for(let x = 0; x < simulationWidth; x++){
//   for(let y = 0; y < simulationHeight; y++){
//     const simXX = (x - simulationWidth * 0.5 + 0.5) * ds;
//     const simYX = (y - simulationHeight * 0.5) * ds;
//     const simXY = (x - simulationWidth * 0.5) * ds;
//     const simYY = (y - simulationHeight * 0.5 + 0.5) * ds;
//     initialStateEX[x + y * simulationWidth] = (simXX) / (sqr(simXX) + sqr(simYX)) * charge_amount;
//     initialStateEY[x + y * simulationWidth] = (simYY) / (sqr(simXY) + sqr(simYY)) * charge_amount;
//   }
// }

// Magnetic pulse

// for(let x = 0; x < simulationWidth; x++){
//   for(let y = 0; y < simulationHeight; y++){
//     const distSqr = sqr(x-99.5) + sqr(y-99.5);
//     if(distSqr <= 100){
//       initialStateBZ[x + y * simulationWidth] = (100 - distSqr) * 0.01;
//     }
//   }
// }

// Sharp magnetic pulse

// for(let x = 0; x < simulationWidth; x++){
//   for(let y = 0; y < simulationHeight; y++){
//     const distSqr = sqr(x - simulationWidth * 0.5) + sqr(y - simulationHeight * 0.5);
//     if(distSqr <= 100){
//       initialStateBZ[x + y * simulationWidth] = 1.0;
//     }
//   }
// }

// Emitter at the center

// for(let x = 0; x < simulationWidth; x++){
//   for(let y = 0; y < simulationHeight; y++){
//     const distSqr = sqr(x - simulationWidth * 0.5) + sqr(y - simulationHeight * 0.5);
//     if(distSqr <= 4){
//       initialStateJZ[x + y * simulationWidth] = 500.0;
//       initialStateFreq[x + y * simulationWidth] = 100.0;
//     }
//   }
// }

// Line Source

// for(let x = 0; x < simulationWidth; x++){
//   for(let y = 0; y < simulationHeight; y++){
//     if(y == 100){
//       initialStateJZ[x + y * simulationWidth] = 5.0;
//       initialStateFreq[x + y * simulationWidth] = 2.0;
//     }
//   }
// }

// Line Source (x current)

// const antenna_height = 4;
// const antenna_length = 2;
// const antenna_thickness = 0.25;
// const antenna_strength = 10;
// const antenna_frequency = 1;
// for(let x = 0; x < simulationWidth; x++){
//   for(let y = 0; y < simulationHeight; y++){
//     const simX = (x - simulationWidth * 0.5) * ds;
//     const simY = (y - simulationHeight * 0.5) * ds;
//     if(Math.abs(simX) < antenna_length * 0.5 && Math.abs(simY + antenna_height) < antenna_thickness * 0.5){
//       initialStateJX[x + y * simulationWidth] = antenna_strength;
//       initialStateFreq[x + y * simulationWidth] = antenna_frequency;
//     }
//   }
// }

// Circular lens to the right of the center

// for(let x = 0; x < simulationWidth * 2; x++){
//   for(let y = 0; y < simulationHeight * 2; y++){
//     const distSqr = sqr(x - simulationWidth * 1.5) + sqr(y - simulationHeight);
//     if(distSqr <= 2500){
//       permittivityData[x + y * simulationWidth * 2] = 0.9;
//     }
//   }
// }

// Circular lens in the center

// for(let x = 0; x < simulationWidth * 2; x++){
//   for(let y = 0; y < simulationHeight * 2; y++){
//     const distSqr = sqr(x - simulationWidth) + sqr(y - simulationHeight);
//     if(distSqr <= sqr(100)){
//       permittivityData[x + y * simulationWidth * 2] = 0.9;
//     }
//   }
// }

// Perfect GRIN lens in the center

// const focalDist = 4;
// const depth = 2;
// const maxIndex = 2;
// const lensRadius = Math.sqrt(sqr(maxIndex * depth + focalDist - depth) - sqr(focalDist));
// for(let x = 0; x < simulationWidth * 2; x++){
//   for(let y = 0; y < simulationHeight * 2; y++){
//     const simX = (x - simulationWidth) * ds * 0.5;
//     const simY = (y - 400) * ds * 0.5;
//     if(Math.abs(simY) <= depth * 0.5 && Math.abs(simX) < lensRadius){
//       permittivityData[x + y * simulationWidth * 2] = sqr(depth / (focalDist + maxIndex * depth - Math.sqrt(sqr(focalDist) + sqr(simX))));
//     }
//   }
// }

// Conductive cube in the center

const cube_width = 4;
const cube_conductivity = 1;
for(let x = 0; x < simulationWidth * 2; x++){
  for(let y = 0; y < simulationHeight * 2; y++){
    const simX = (x - simulationWidth) * ds * 0.5;
    const simY = (y - simulationHeight) * ds * 0.5;
    if(Math.abs(simY) <= cube_width / 2 && Math.abs(simX) < cube_width / 2){
      conductivityData[x + y * simulationWidth * 2] = cube_conductivity;
    }
  }
}

// Charge blob in center

// const charge_size = 1;
// const charge_strength = 5;
// for(let x = 0; x < simulationWidth; x++){
//   for(let y = 0; y < simulationHeight; y++){
//     const simX = (x - simulationWidth * 0.5) * ds;
//     const simY = (y - simulationHeight * 0.5) * ds;
//     if(Math.abs(simY) <= charge_size / 2 && Math.abs(simX) < charge_size / 2){
//       chargeData[x + y * simulationWidth] = charge_strength;
//     }
//   }
// }
fieldDX.setData(initialStateEX);
fieldDY.setData(initialStateEY);
fieldDZ.setData(initialStateEZ);
fieldBX.setData(initialStateBX);
fieldBY.setData(initialStateBY);
fieldBZ.setData(initialStateBZ);
fieldCharge.setData(chargeData);
fieldJX.setData(initialStateJX);
fieldJY.setData(initialStateJY);
fieldJZ.setData(initialStateJZ);
fieldFreq.setData(initialStateFreq);
fieldPermittivity.setData(permittivityData);
fieldConductivity.setData(conductivityData);

let time = 0;
const crankNicholsonIterCount = 4;
while(true){
  console.log(time);
  const frameEnd = new Promise((r) => setTimeout(r, frameDelay));

  const timeA = Date.now();
  fieldDX.display(0, displayHeight);
  fieldDY.display(displayWidth, displayHeight);
  fieldDZ.display(displayWidth * 2, displayHeight);
  fieldBX.display(0, 0);
  fieldBY.display(displayWidth, 0);
  fieldBZ.display(displayWidth * 2, 0);
  fieldCharge.display(displayWidth, displayHeight * 2);

  //Crank the Nicholson
  for(let iteration = 0; iteration < crankNicholsonIterCount; iteration++){
    //Link everything
    stepProgram.setSampler2D("d_x_tex", fieldDX.srcTexture);
    stepProgram.setSampler2D("d_y_tex", fieldDY.srcTexture);
    stepProgram.setSampler2D("d_z_tex", fieldDZ.srcTexture);
    stepProgram.setSampler2D("b_x_tex", fieldBX.srcTexture);
    stepProgram.setSampler2D("b_y_tex", fieldBY.srcTexture);
    stepProgram.setSampler2D("b_z_tex", fieldBZ.srcTexture);
    stepProgram.setSampler2D("charge_tex", fieldCharge.srcTexture);
    stepProgram.setSampler2D("d_x_tex_soln", fieldDX.solnTexture);
    stepProgram.setSampler2D("d_y_tex_soln", fieldDY.solnTexture);
    stepProgram.setSampler2D("d_z_tex_soln", fieldDZ.solnTexture);
    stepProgram.setSampler2D("b_x_tex_soln", fieldBX.solnTexture);
    stepProgram.setSampler2D("b_y_tex_soln", fieldBY.solnTexture);
    stepProgram.setSampler2D("b_z_tex_soln", fieldBZ.solnTexture);
    stepProgram.setSampler2D("charge_tex_soln", fieldCharge.solnTexture);
    stepProgram.setSampler2D("inv_permittivity_tex", fieldPermittivity);
    stepProgram.setSampler2D("j_x_tex", fieldJX);
    stepProgram.setSampler2D("j_y_tex", fieldJY);
    stepProgram.setSampler2D("j_z_tex", fieldJZ);
    stepProgram.setSampler2D("conductivity_tex", fieldConductivity);
    stepProgram.setSampler2D("antenna_frequency", fieldFreq);

    stepProgram.bindOutput("d_x_new", fieldDX.destTexture);
    stepProgram.bindOutput("d_y_new", fieldDY.destTexture);
    stepProgram.bindOutput("d_z_new", fieldDZ.destTexture);
    stepProgram.bindOutput("b_x_new", fieldBX.destTexture);
    stepProgram.bindOutput("b_y_new", fieldBY.destTexture);
    stepProgram.bindOutput("b_z_new", fieldBZ.destTexture);
    stepProgram.bindOutput("charge_new", fieldCharge.destTexture);

    stepProgram.setUniform1f("width", simulationWidth);
    stepProgram.setUniform1f("height", simulationHeight);
    stepProgram.setUniform1f("dt", dt);
    stepProgram.setUniform1f("ds_inv", 1 / ds);
    stepProgram.setUniform1f("ds", ds);
    stepProgram.setUniform1f("time", time);
    stepProgram.setUniform1f("boundary_thickness", boundaryDepth / ds);
    stepProgram.setUniform1f("boundary_opacity", 2 * boundaryOpacity * ds / boundaryDepth);

    stepProgram.execute();

    fieldDX.swapCNIter();
    fieldDY.swapCNIter();
    fieldDZ.swapCNIter();
    fieldBX.swapCNIter();
    fieldBY.swapCNIter();
    fieldBZ.swapCNIter();
    fieldCharge.swapCNIter();
  }
  fieldDX.swap();
  fieldDY.swap();
  fieldDZ.swap();
  fieldBX.swap();
  fieldBY.swap();
  fieldBZ.swap();
  fieldCharge.swap();
  const timeB = Date.now();
  console.log(timeB - timeA);
  time += dt;
  await frameEnd;
}
})()