(async () => {
const displayWidth = 400;
const displayHeight = 400;
const simulationWidth = 400;
const simulationHeight = 400;
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
class Field{
  srcTexture;
  destTexture;
  srcBinding = currentBinding++;
  destBinding = currentBinding++;
  scale;

  constructor(scale = 1){
    this.srcTexture = gl.createTexture();
    this.destTexture = gl.createTexture();
    this.scale = scale;
    function initData(texture, binding){
      gl.activeTexture(gl.TEXTURE0 + binding);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const data = new Float32Array(simulationWidth * simulationHeight * scale * scale).fill(0);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.R32F,
        simulationWidth * scale,
        simulationHeight * scale,
        0,
        gl.RED,
        gl.FLOAT,
        data
      );
    }
    initData(this.srcTexture, this.srcBinding);
    initData(this.destTexture, this.destBinding);
  }

  setData(data){
    gl.activeTexture(gl.TEXTURE0 + this.srcBinding);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      simulationWidth * this.scale,
      simulationHeight * this.scale,
      0,
      gl.RED,
      gl.FLOAT,
      data
    );
  }

  swap() {
    [this.srcTexture, this.destTexture] = [this.destTexture, this.srcTexture];
    [this.srcBinding, this.destBinding] = [this.destBinding, this.srcBinding];
  }

  link(program, name){
    const outputIndex = gl.getFragDataLocation(program, name); //-1 if name is not an output variable
    if(outputIndex === -1){
      gl.useProgram(program);
      const texUniformLocation = gl.getUniformLocation(program, name);
      gl.uniform1i(texUniformLocation, this.srcBinding);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, wbFrameBuffer);
      gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0 + outputIndex,
          gl.TEXTURE_2D,
          this.destTexture,
          0
      );
      frameBufferDrawBuffers.push(gl.COLOR_ATTACHMENT0 + outputIndex);
    }
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
const fieldPermittivity = new Field(2);

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

for(let x = 0; x < simulationWidth; x++){
  for(let y = 0; y < simulationHeight; y++){
    const distSqr = sqr(x - simulationWidth * 0.5) + sqr(y - simulationHeight * 0.5);
    if(distSqr <= 100){
      initialStateBZ[x + y * simulationWidth] = 1.0;
    }
  }
}

for(let x = 0; x < simulationWidth * 2; x++){
  for(let y = 0; y < simulationHeight * 2; y++){
    const distSqr = sqr(x - simulationWidth * 1.5) + sqr(y - simulationHeight);
    if(distSqr <= 1600){
      permittivityData[x + y * simulationWidth * 2] = 0.5;
    }
  }
}

fieldDX.setData(initialStateEX);
fieldDY.setData(initialStateEY);
fieldDZ.setData(initialStateEZ);
fieldBX.setData(initialStateBX);
fieldBY.setData(initialStateBY);
fieldBZ.setData(initialStateBZ);
fieldPermittivity.setData(permittivityData);

while(true){
  const frameEnd = new Promise((r) => setTimeout(r, 10));
  fieldDX.display(0, displayHeight);
  fieldDY.display(displayWidth, displayHeight);
  fieldDZ.display(displayWidth * 2, displayHeight);
  fieldBX.display(0, 0);
  fieldBY.display(displayWidth, 0);
  fieldBZ.display(displayWidth * 2, 0);

  frameBufferDrawBuffers.splice(0);
  //Link everything
  fieldDX.link(stepProgram, "d_x_tex");
  fieldDY.link(stepProgram, "d_y_tex");
  fieldDZ.link(stepProgram, "d_z_tex");
  fieldBX.link(stepProgram, "b_x_tex");
  fieldBY.link(stepProgram, "b_y_tex");
  fieldBZ.link(stepProgram, "b_z_tex");
  fieldPermittivity.link(stepProgram, "inv_permittivity_tex");

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
  const ds = 0.01;
  const dsUniformLocation = gl.getUniformLocation(stepProgram, "ds");
  const dsInvUniformLocation = gl.getUniformLocation(stepProgram, "ds_inv");
  gl.uniform1f(widthUniformLocation, simulationWidth);
  gl.uniform1f(heightUniformLocation, simulationHeight);
  gl.uniform1f(dtUniformLocation, 0.001);
  gl.uniform1f(dsInvUniformLocation, 1 / ds);
  gl.uniform1f(dsUniformLocation, ds);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const aVertexPosition = gl.getAttribLocation(stepProgram, "vertex_position");
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aVertexPosition);
  gl.drawBuffers(frameBufferDrawBuffers);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.useProgram(null);

  fieldDX.swap();
  fieldDY.swap();
  fieldDZ.swap();
  fieldBX.swap();
  fieldBY.swap();
  fieldBZ.swap();
  await frameEnd;
}
})()