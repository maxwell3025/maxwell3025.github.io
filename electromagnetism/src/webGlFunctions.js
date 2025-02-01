import { display } from "./domContent.js";

// OpenGL Setup
const gl = display.getContext("webgl2", { powerPreference: "high-performance" });
if (gl == null) {
  console.log("Could not create a display context");
}

const floatExtension = gl.getExtension("EXT_color_buffer_float");
if (floatExtension === null) {
  console.error("Extension EXT_color_buffer_float not supported");
}

/**
 * @param {number} type type of shader to load
 * @param {string} source source text(not the file location)
 * @returns {WebGLShader}
 */
function loadShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(source);
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const vertexPassthroughCode = await fetch("./passthrough.vsh").then(x => x.text());
const vertexPassthroughShader = loadShader(gl.VERTEX_SHADER, vertexPassthroughCode);

const meshData = new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, meshData, gl.STATIC_DRAW, 0);

/**
 * Represents a shader program and an output
 */
export class Pipeline {
  program;
  framebuffer;
  viewport;
  outputBuffers = new Array(gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)).fill(gl.NONE);

  constructor(source, outputWidth, outputHeight) {
    const fragShader = loadShader(gl.FRAGMENT_SHADER, source);
    this.program = gl.createProgram();
    gl.attachShader(this.program, fragShader);
    gl.attachShader(this.program, vertexPassthroughShader);
    gl.linkProgram(this.program);

    this.viewport = [0, 0, outputWidth, outputHeight];
  }

  setUniform1f(name, value) {
    gl.useProgram(this.program);
    const uniformLocation = gl.getUniformLocation(this.program, name);
    gl.uniform1f(uniformLocation, value);
  }

  setSampler2D(name, texture) {
    gl.useProgram(this.program);
    const texUniformLocation = gl.getUniformLocation(this.program, name);
    gl.uniform1i(texUniformLocation, texture.binding);
  }

  bindOutput(name, texture) {
    if (this.framebuffer === null) throw new Error("Cannot bind output when targeting default framebuffer");
    const outputIndex = gl.getFragDataLocation(this.program, name); //-1 if name is not an output variable
    if (outputIndex === -1) throw new Error(`${name} is not a fragment shader output variable in this program`);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0 + outputIndex,
      gl.TEXTURE_2D,
      texture.texture,
      0
    );
    this.outputBuffers[outputIndex] = gl.COLOR_ATTACHMENT0 + outputIndex;
  }

  unbindOutput(name) {
    const outputIndex = gl.getFragDataLocation(this.program, name); //-1 if name is not an output variable
    if (outputIndex === -1) throw new Error(`${name} is not a fragment shader output variable in this program`);
    this.outputBuffers[outputIndex] = gl.NONE;
  }

  setViewport(x, y, width, height) {
    this.viewport = [x, y, width, height];
  }

  execute() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(...this.viewport);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const aVertexPosition = gl.getAttribLocation(this.program, "vertex_position");
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);
    gl.drawBuffers(this.outputBuffers);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

export class PingPongPipeline extends Pipeline{
  constructor(source, outputWidth, outputHeight) {
    super(source, outputWidth, outputHeight);
    this.framebuffer = gl.createFramebuffer()
  }

  bindOutput(name, texture) {
    const outputIndex = gl.getFragDataLocation(this.program, name); //-1 if name is not an output variable
    if (outputIndex === -1) throw new Error(`${name} is not a fragment shader output variable in this program`);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0 + outputIndex,
      gl.TEXTURE_2D,
      texture.texture,
      0
    );
    this.outputBuffers[outputIndex] = gl.COLOR_ATTACHMENT0 + outputIndex;
  }

  unbindOutput(name) {
    const outputIndex = gl.getFragDataLocation(this.program, name); //-1 if name is not an output variable
    if (outputIndex === -1) throw new Error(`${name} is not a fragment shader output variable in this program`);
    this.outputBuffers[outputIndex] = gl.NONE;
  }
}

export class RenderPipeline extends Pipeline{
  constructor(source, outputWidth, outputHeight) {
    super(source, outputWidth, outputHeight);
    this.framebuffer = null;
    this.outputBuffers = [gl.BACK];
  }
}

const drawRectBuffer = gl.createFramebuffer();
const textureBindings = [];

const drawProgram = new PingPongPipeline((await fetch("./draw.fsh").then(res => res.text())), 0, 0);
export class FloatTexture {
  texture;
  binding;
  width;
  height;

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.texture = gl.createTexture();
    this.binding = textureBindings.indexOf(null);
    if (this.binding === -1) {
      this.binding = textureBindings.length;
    }
    textureBindings[this.binding] = this;

    gl.activeTexture(gl.TEXTURE0 + this.binding);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    const data = new Float32Array(this.width * this.height).fill(0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
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

  setData(data) {
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

  getData(){
    const readBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, readBuffer);
    gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    const destination = new Float32Array(this.width * this.height * 4);
    const output = new Float32Array(this.width * this.height);
    gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.FLOAT, destination);
    for(let i = 0; i < this.width * this.height; i++){
      output[i] = destination[i * 4];
    }
    return output;
  }

  /**
   * @param {string} src 
   * @param {(x: [number, number, number, number]) => number} transformation 
   */
  async setDataFromImage(src, transformation) {
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
    while (imageData.length > 0) {
      fieldData.push(transformation(imageData.splice(0, 4)));
    }
    this.setData(fieldData);
  }

  link(program, name) {
    gl.useProgram(program);
    const texUniformLocation = gl.getUniformLocation(program, name);
    gl.uniform1i(texUniformLocation, this.binding);
  }

  display(x, y, program) {
    program.setSampler2D("tex0", this);
    program.setUniform1f("width", this.width * 4);
    program.setUniform1f("height", this.height * 4);
    program.setUniform1f("x", x);
    program.setUniform1f("y", y);
    program.execute();
  }

  setSegment(x1, y1, x2, y2, radius, value) {
    if(radius < 0) throw new Error("Negative radius passed to setSegment");
    gl.finish();
    gl.enable(gl.SCISSOR_TEST);
    drawProgram.setViewport(0, 0, this.width, this.height);
    drawProgram.bindOutput("color", this);

    const minX = Math.floor(Math.min(x1, x2) - radius);
    const minY = Math.floor(Math.min(y1, y2) - radius);
    const maxX = Math.ceil(Math.max(x1, x2) + radius);
    const maxY = Math.ceil(Math.max(y1, y2) + radius);
    gl.scissor(minX, minY, maxX - minX, maxY - minY);

    drawProgram.setUniform1f("x1", x1);
    drawProgram.setUniform1f("y1", y1);
    drawProgram.setUniform1f("x2", x2);
    drawProgram.setUniform1f("y2", y2);
    drawProgram.setUniform1f("radius", radius);
    drawProgram.setUniform1f("value", value);

    drawProgram.execute();
    gl.disable(gl.SCISSOR_TEST);
    gl.finish();
  }

  delete() {
    textureBindings[this.binding] = null;
  }
}

export class Field {
  srcTexture;
  destTexture;
  solnTexture;
  width;
  height;

  constructor(width, height) {
    this.srcTexture = new FloatTexture(width, height);
    this.destTexture = new FloatTexture(width, height);
    this.solnTexture = new FloatTexture(width, height);
    this.width = width;
    this.height = height;
  }

  setData(data) {
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

  display(x, y, program) {
    program.setSampler2D("tex0", this.srcTexture);
    program.setUniform1f("width", this.width * 4);
    program.setUniform1f("height", this.height * 4);
    program.setUniform1f("x", x);
    program.setUniform1f("y", y);
    program.execute();
  }

  delete() {
    this.srcTexture.delete();
    this.destTexture.delete();
    this.solnTexture.delete();
  }
}

export function glFinish(){
  gl.finish();
}