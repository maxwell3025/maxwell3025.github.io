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
  outputWidth;
  outputHeight;
  outputBuffers = new Array(gl.getParameter(gl.MAX_COLOR_ATTACHMENTS)).fill(gl.NONE);

  constructor(source, outputWidth, outputHeight) {
    const fragShader = loadShader(gl.FRAGMENT_SHADER, source);
    this.program = gl.createProgram();
    gl.attachShader(this.program, fragShader);
    gl.attachShader(this.program, vertexPassthroughShader);
    gl.linkProgram(this.program);

    this.outputWidth = outputWidth;
    this.outputHeight = outputHeight;

    this.viewport = [0, 0, this.outputWidth, this.outputHeight];
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

  setRect(x, y, width, height, value) {
    gl.finish();
    gl.enable(gl.SCISSOR_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, drawRectBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0
    );
    gl.scissor(x, y, width, height);
    gl.clearColor(value, 0, 0, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.clear(gl.COLOR_BUFFER_BIT);
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