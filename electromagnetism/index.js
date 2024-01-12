(async () => {
const displayWidth = 1000;
const displayHeight = 1000;
const simulationWidth = 200;
const simulationHeight = 200;
const display = document.getElementById("display");
display.setAttribute("width", displayWidth);
display.setAttribute("height", displayHeight);
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

const vertexPassthroughCode = await fetch("passthrough.vsh").then(x => x.text());
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

const displayProgram = loadFrag(await fetch("display.fsh").then(x => x.text()))

let currentBinding = 0;
const wbFrameBuffer = gl.createFramebuffer();
const frameBufferDrawBuffers = [];
class Field{
  srcTexture;
  destTexture;
  srcBinding = currentBinding++;
  destBinding = currentBinding++;

  constructor(){
    this.srcTexture = gl.createTexture();
    this.destTexture = gl.createTexture();
    function initData(texture, binding){
      gl.activeTexture(gl.TEXTURE0 + binding);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const data = new Float32Array(simulationWidth * simulationHeight).fill(0);
      data[0] = 1.0; //TODO testing only
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.R32F,
        simulationWidth,
        simulationHeight,
        0,
        gl.RED,
        gl.FLOAT,
        data
      );
    }
    initData(this.srcTexture, this.srcBinding);
    initData(this.destTexture, this.destBinding);
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

  display(){
    gl.viewport(0, 0, displayWidth, displayHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(displayProgram);
    const widthUniformLocation = gl.getUniformLocation(displayProgram, "width");
    const heightUniformLocation = gl.getUniformLocation(displayProgram, "height");
    gl.uniform1f(widthUniformLocation, displayWidth);
    gl.uniform1f(heightUniformLocation, displayHeight);
    this.link(displayProgram, "tex0")
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const aVertexPosition = gl.getAttribLocation(displayProgram, "vertex_position");
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.useProgram(null);
  }
}

const fieldEX = new Field();
const fieldEY = new Field();
const fieldEZ = new Field();
const fieldBX = new Field();
const fieldBY = new Field();
const fieldBZ = new Field();

const stepProgram = loadFrag(await fetch("step.fsh").then(x => x.text()));
while(true){
  frameBufferDrawBuffers.splice(0);
  //Link everything
  fieldEX.link(stepProgram, "e_x_tex");
  fieldEY.link(stepProgram, "e_y_tex");
  fieldEZ.link(stepProgram, "e_z_tex");
  fieldBX.link(stepProgram, "b_x_tex");
  fieldBY.link(stepProgram, "b_y_tex");
  fieldBZ.link(stepProgram, "b_z_tex");

  fieldEX.link(stepProgram, "e_x_new");
  fieldEY.link(stepProgram, "e_y_new");
  fieldEZ.link(stepProgram, "e_z_new");
  fieldBX.link(stepProgram, "b_x_new");
  fieldBY.link(stepProgram, "b_y_new");
  fieldBZ.link(stepProgram, "b_z_new");

  // Test Step 
  gl.viewport(0, 0, simulationWidth, simulationHeight);
  gl.useProgram(stepProgram);
  const widthUniformLocation = gl.getUniformLocation(stepProgram, "width");
  const heightUniformLocation = gl.getUniformLocation(stepProgram, "height");
  const dtUniformLocation = gl.getUniformLocation(stepProgram, "dt");
  gl.uniform1f(widthUniformLocation, simulationWidth);
  gl.uniform1f(heightUniformLocation, simulationHeight);
  gl.uniform1f(dtUniformLocation, 0.1);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const aVertexPosition = gl.getAttribLocation(stepProgram, "vertex_position");
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aVertexPosition);
  gl.drawBuffers(frameBufferDrawBuffers);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.useProgram(null);

  fieldEX.display();

  fieldEX.swap();
  fieldEY.swap();
  fieldEZ.swap();
  fieldBX.swap();
  fieldBY.swap();
  fieldBZ.swap();

  await new Promise((r) => setTimeout(r, 100))
}
})()