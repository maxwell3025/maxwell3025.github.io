(async () => {
const displayWidth = 1024;
const displayHeight = 1024;
const simulationWidth = 1024;
const simulationHeight = 1024;
const ds = 0.01;
const dt = 0.0025;

const display = document.getElementById("display");
display.setAttribute("width", displayWidth * 3);
display.setAttribute("height", displayHeight * 2);
const gl = display.getContext("webgl2")
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

function loadFrag(source) {
  const fragShader = loadShader(gl.FRAGMENT_SHADER, source);
  const program = gl.createProgram();
  gl.attachShader(program, fragShader);
  gl.attachShader(program, vertexPassthroughShader);
  gl.linkProgram(program);
  return program;
}

const fillMesh = new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, fillMesh, gl.STATIC_DRAW, 0);

const displayProgram = loadFrag(await fetch("./display.fsh").then(x => x.text()))

let currentBinding = 0;
const wbFrameBuffer = gl.createFramebuffer();
const frameBufferDrawBuffers = [];
/**
 * Represents a shader program and an output
 */
class RenderPipeline{
  program;
  framebuffer;
  viewport;
  outputWidth;
  outputHeight;
  bufs = new Array(gl.MAX_COLOR_ATTACHMENTS).fill(gl.NONE);

  constructor(source, width, height, framebuffer = gl.createFrameBuffer()){
    const fragShader = loadShader(gl.FRAGMENT_SHADER, source);
    this.program = gl.createProgram();
    gl.attachShader(this.program, fragShader);
    gl.attachShader(this.program, vertexPassthroughShader);
    gl.linkProgram(this.program);

    this.framebuffer = framebuffer;

    this.outputWidth = width;
    this.outputHeight = height;
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
    const outputIndex = gl.getFragDataLocation(program, name); //-1 if name is not an output variable
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
    const outputIndex = gl.getFragDataLocation(program, name); //-1 if name is not an output variable
    if(outputIndex === -1) throw new Error(`${name} is not a fragment shader output variable in this program`);
    this.bufs[outputIndex] = gl.NONE;
  }

  execute(){
    gl.viewport(0, 0, this.outputWidth, this.outputHeight);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const aVertexPosition = gl.getAttribLocation(this.program, "vertex_position");
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);
    gl.drawBuffers(frameBufferDrawBuffers);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

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

  link(program, name){
    const outputIndex = gl.getFragDataLocation(program, name); //-1 if name is not an output variable
    if(outputIndex === -1){
      this.srcTexture.link(program, name);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, wbFrameBuffer);
      gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0 + outputIndex,
          gl.TEXTURE_2D,
          this.destTexture.texture,
          0
      );
      frameBufferDrawBuffers.push(gl.COLOR_ATTACHMENT0 + outputIndex);
    }
  }

  linkSoln(program, name){
    this.solnTexture.link(program, name);
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

const fieldDX = new Field();
const fieldDY = new Field();
const fieldDZ = new Field();
const fieldBX = new Field();
const fieldBY = new Field();
const fieldBZ = new Field();
const fieldJZ = new FloatTexture(simulationWidth, simulationHeight);
const fieldFreq = new FloatTexture(simulationWidth, simulationHeight);
const fieldPermittivity = new FloatTexture(simulationWidth * 2, simulationHeight * 2);

const stepProgram = loadFrag(await fetch("./step.fsh").then(x => x.text()));

function sqr(x){
  return x * x;
}
const initialStateEX = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateEY = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateEZ = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateBX = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateBY = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateBZ = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateJZ = new Float32Array(simulationWidth * simulationHeight).fill(0);
const initialStateFreq = new Float32Array(simulationWidth * simulationHeight).fill(0);
const permittivityData = new Float32Array(simulationWidth * simulationHeight * 4).fill(1);

// Unsupported Charge

// for(let x = 0; x < simulationWidth; x++){
//   for(let y = 0; y < simulationHeight; y++){
//     const distSqr = sqr(x-99.5) + sqr(y-99.5)
//     initialStateEX[x + y * simulationWidth] = (x - 99.5) / distSqr * 100;
//     initialStateEY[x + y * simulationWidth] = (y - 99.5) / distSqr * 100;
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

for(let x = 0; x < simulationWidth; x++){
  for(let y = 0; y < simulationHeight; y++){
    if(y == 100){
      initialStateJZ[x + y * simulationWidth] = 50.0;
      initialStateFreq[x + y * simulationWidth] = 25.0;
    }
  }
}

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

const focalDist = 4;
const depth = 0.4;
const maxIndex = 2;
const lensRadius = Math.sqrt(sqr(maxIndex * depth + focalDist - depth) - sqr(focalDist));
for(let x = 0; x < simulationWidth * 2; x++){
  for(let y = 0; y < simulationHeight * 2; y++){
    const simX = (x - simulationWidth) * ds * 0.5;
    const simY = (y - 400) * ds * 0.5;
    if(Math.abs(simY) <= depth * 0.5 && Math.abs(simX) < lensRadius){
      permittivityData[x + y * simulationWidth * 2] = sqr(depth / (focalDist + maxIndex * depth - Math.sqrt(sqr(focalDist) + sqr(simX))));
    }
  }
}
fieldDX.setData(initialStateEX);
fieldDY.setData(initialStateEY);
fieldDZ.setData(initialStateEZ);
fieldBX.setData(initialStateBX);
fieldBY.setData(initialStateBY);
fieldBZ.setData(initialStateBZ);
fieldJZ.setData(initialStateJZ);
fieldFreq.setData(initialStateFreq);
fieldPermittivity.setData(permittivityData);

let time = 0;
const crankNicholsonIterCount = 4;
while(true){
  console.log(time);
  const frameEnd = new Promise((r) => setTimeout(r, 0));
  fieldDX.display(0, displayHeight);
  fieldDY.display(displayWidth, displayHeight);
  fieldDZ.display(displayWidth * 2, displayHeight);
  fieldBX.display(0, 0);
  fieldBY.display(displayWidth, 0);
  fieldBZ.display(displayWidth * 2, 0);

  //Crank the Nicholson
  for(let iteration = 0; iteration < crankNicholsonIterCount; iteration++){
    frameBufferDrawBuffers.splice(0);
    //Link everything
    fieldDX.link(stepProgram, "d_x_tex");
    fieldDY.link(stepProgram, "d_y_tex");
    fieldDZ.link(stepProgram, "d_z_tex");
    fieldBX.link(stepProgram, "b_x_tex");
    fieldBY.link(stepProgram, "b_y_tex");
    fieldBZ.link(stepProgram, "b_z_tex");
    fieldDX.linkSoln(stepProgram, "d_x_tex_soln");
    fieldDY.linkSoln(stepProgram, "d_y_tex_soln");
    fieldDZ.linkSoln(stepProgram, "d_z_tex_soln");
    fieldBX.linkSoln(stepProgram, "b_x_tex_soln");
    fieldBY.linkSoln(stepProgram, "b_y_tex_soln");
    fieldBZ.linkSoln(stepProgram, "b_z_tex_soln");
    fieldPermittivity.link(stepProgram, "inv_permittivity_tex");
    fieldJZ.link(stepProgram, "j_z_tex");
    fieldFreq.link(stepProgram, "antenna_frequency");

    fieldDX.link(stepProgram, "d_x_new");
    fieldDY.link(stepProgram, "d_y_new");
    fieldDZ.link(stepProgram, "d_z_new");
    fieldBX.link(stepProgram, "b_x_new");
    fieldBY.link(stepProgram, "b_y_new");
    fieldBZ.link(stepProgram, "b_z_new");

    // Test Step 
    gl.viewport(0, 0, simulationWidth, simulationHeight);
    gl.useProgram(stepProgram);

    const widthUniformLocation = gl.getUniformLocation(stepProgram, "width");
    const heightUniformLocation = gl.getUniformLocation(stepProgram, "height");
    const dtUniformLocation = gl.getUniformLocation(stepProgram, "dt");
    const dsUniformLocation = gl.getUniformLocation(stepProgram, "ds");
    const dsInvUniformLocation = gl.getUniformLocation(stepProgram, "ds_inv");
    const timeUniformLocation = gl.getUniformLocation(stepProgram, "time");
    gl.uniform1f(widthUniformLocation, simulationWidth);
    gl.uniform1f(heightUniformLocation, simulationHeight);
    gl.uniform1f(dtUniformLocation, dt);
    gl.uniform1f(dsInvUniformLocation, 1 / ds);
    gl.uniform1f(dsUniformLocation, ds);
    gl.uniform1f(timeUniformLocation, time);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const aVertexPosition = gl.getAttribLocation(stepProgram, "vertex_position");
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);
    gl.drawBuffers(frameBufferDrawBuffers);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.useProgram(null);

    fieldDX.swapCNIter();
    fieldDY.swapCNIter();
    fieldDZ.swapCNIter();
    fieldBX.swapCNIter();
    fieldBY.swapCNIter();
    fieldBZ.swapCNIter();
  }
  fieldDX.swap();
  fieldDY.swap();
  fieldDZ.swap();
  fieldBX.swap();
  fieldBY.swap();
  fieldBZ.swap();

  time += dt;
  await frameEnd;
  await new Promise((r) => setTimeout(r, 20));
}
})()