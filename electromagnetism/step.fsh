#version 300 es
precision highp float;
uniform sampler2D e_x_tex;
uniform sampler2D e_y_tex;
uniform sampler2D e_z_tex;
uniform sampler2D b_x_tex;
uniform sampler2D b_y_tex;
uniform sampler2D b_z_tex;
uniform float width;
uniform float height;
uniform float dt;
layout(location = 0) out float e_x_new;
layout(location = 1) out float e_y_new;
layout(location = 2) out float e_z_new;
layout(location = 3) out float b_x_new;
layout(location = 4) out float b_y_new;
layout(location = 5) out float b_z_new;

// Samples the given texture at the given coordinates in pixels
float readSampler(sampler2D tex, vec2 coord){
  return texture(tex, coord / vec2(width, height)).x;
}

float e_x(vec2 coord){
  return readSampler(e_x_tex, coord);
}

float e_y(vec2 coord){
  return readSampler(e_y_tex, coord);
}

float e_z(vec2 coord){
  return readSampler(e_z_tex, coord);
}

float b_x(vec2 coord){
  return readSampler(b_x_tex, coord);
}

float b_y(vec2 coord){
  return readSampler(b_y_tex, coord);
}

float b_z(vec2 coord){
  return readSampler(b_z_tex, coord);
}

void main(){
  vec2 pos = gl_FragCoord.xy;
  e_x_new = e_x(pos) + dt * 1.0;
  e_y_new = e_y(pos) + dt * 1.0;
  e_z_new = e_z(pos) + dt * 1.0;
  b_x_new = b_x(pos) + dt * 1.0;
  b_y_new = b_y(pos) + dt * 1.0;
  b_z_new = b_z(pos) + dt * 1.0;
}