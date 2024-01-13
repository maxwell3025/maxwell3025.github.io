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
uniform float dx;
uniform float dy;
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

float grad_x(sampler2D tex, vec2 coord){
  return (
    readSampler(tex, coord + vec2( 1.0,  0.0)) * 1.0 +
    readSampler(tex, coord + vec2( 1.0,  1.0)) * 0.5 +
    readSampler(tex, coord + vec2( 1.0, -1.0)) * 0.5 -
    readSampler(tex, coord + vec2(-1.0,  0.0)) * 1.0 -
    readSampler(tex, coord + vec2(-1.0,  1.0)) * 0.5 -
    readSampler(tex, coord + vec2(-1.0, -1.0)) * 0.5
  ) / dx * 0.125;
}

float grad_y(sampler2D tex, vec2 coord){
  return (
    readSampler(tex, coord + vec2( 0.0,  1.0)) * 1.0 +
    readSampler(tex, coord + vec2( 1.0,  1.0)) * 0.5 +
    readSampler(tex, coord + vec2(-1.0,  1.0)) * 0.5 -
    readSampler(tex, coord + vec2( 0.0, -1.0)) * 1.0 -
    readSampler(tex, coord + vec2( 1.0, -1.0)) * 0.5 -
    readSampler(tex, coord + vec2(-1.0, -1.0)) * 0.5
  ) / dy * 0.125;
}

// NOTE this is only valid when dy = dx
float laplacian(sampler2D tex, vec2 coord){
  return (
    readSampler(tex, coord + vec2(-1.0, -1.0)) * 1.0 +
    readSampler(tex, coord + vec2( 0.0, -1.0)) * 1.0 +
    readSampler(tex, coord + vec2( 1.0, -1.0)) * 1.0 +
    readSampler(tex, coord + vec2(-1.0,  0.0)) * 1.0 +
    readSampler(tex, coord + vec2( 0.0,  0.0)) * -8.0 +
    readSampler(tex, coord + vec2( 1.0,  0.0)) * 1.0 +
    readSampler(tex, coord + vec2(-1.0,  1.0)) * 1.0 +
    readSampler(tex, coord + vec2( 0.0,  1.0)) * 1.0 +
    readSampler(tex, coord + vec2( 1.0,  1.0)) * 1.0
  ) / dx / dx / 6.0;
}

float attenuation = 1.0;
void main(){
  vec2 pos = gl_FragCoord.xy;
  e_x_new = e_x(pos) + dt * (-grad_y(b_z_tex, pos))
  + dt * dt * attenuation * laplacian(e_x_tex, pos);
  

  e_y_new = e_y(pos) + dt * (grad_x(b_z_tex, pos))
  + dt * dt * attenuation * laplacian(e_y_tex, pos);

  e_z_new = e_z(pos) + dt * (grad_y(b_x_tex, pos) - grad_x(b_y_tex, pos))
  + dt * dt * attenuation * laplacian(e_z_tex, pos);

  b_x_new = b_x(pos) + dt * (grad_y(e_z_tex, pos))
  + dt * dt * attenuation * laplacian(b_x_tex, pos);
  
  b_y_new = b_y(pos) + dt * (-grad_x(e_z_tex, pos))
  + dt * dt * attenuation * laplacian(b_y_tex, pos);
  
  b_z_new = b_z(pos) + dt * (grad_x(e_y_tex, pos) - grad_y(e_x_tex, pos))
  + dt * dt * attenuation * laplacian(b_z_tex, pos);

}