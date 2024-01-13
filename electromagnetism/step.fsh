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
uniform float ds;
uniform float ds_inv;
layout(location = 0) out float e_x_new;
layout(location = 1) out float e_y_new;
layout(location = 2) out float e_z_new;
layout(location = 3) out float b_x_new;
layout(location = 4) out float b_y_new;
layout(location = 5) out float b_z_new;

// Samples the given texture at the given coordinates in pixels
float read_texture(sampler2D tex, vec2 coord){
  return texture(tex, coord / vec2(width, height)).x;
}
// TODO(optional) set boundary conditions to be nicer
float e_x(vec2 coord){
  return read_texture(e_x_tex, coord);
}

float e_y(vec2 coord){
  return read_texture(e_y_tex, coord);
}

float e_z(vec2 coord){
  return read_texture(e_z_tex, coord);
}

float b_x(vec2 coord){
  return read_texture(b_x_tex, coord);
}

float b_y(vec2 coord){
  return read_texture(b_y_tex, coord);
}

float b_z(vec2 coord){
  return read_texture(b_z_tex, coord);
}

// Returns how much the current cell matches a checkerboard(1.0 for checkers, 0.0 for DC field)
float high_pass(sampler2D tex, vec2 coord){
  return (
    read_texture(tex, coord + vec2( 0.0,  0.0)) * 20.0 +
    read_texture(tex, coord + vec2( 1.0,  0.0)) * -8.0 +
    read_texture(tex, coord + vec2(-1.0,  0.0)) * -8.0 +
    read_texture(tex, coord + vec2( 0.0,  1.0)) * -8.0 +
    read_texture(tex, coord + vec2( 0.0, -1.0)) * -8.0 +
    read_texture(tex, coord + vec2( 1.0,  1.0)) *  2.0 +
    read_texture(tex, coord + vec2( 1.0, -1.0)) *  2.0 +
    read_texture(tex, coord + vec2(-1.0,  1.0)) *  2.0 +
    read_texture(tex, coord + vec2(-1.0, -1.0)) *  2.0 +
    read_texture(tex, coord + vec2( 2.0,  0.0)) *  1.0 +
    read_texture(tex, coord + vec2(-2.0,  0.0)) *  1.0 +
    read_texture(tex, coord + vec2( 0.0,  2.0)) *  1.0 +
    read_texture(tex, coord + vec2( 0.0, -2.0)) *  1.0
  ) / 64.0;
}

// TODO change to using displacement field when dielectrics are implemented
// TODO implement charge
// Returns the residual amount of E field divergence at the location of e_z in the current cell
float e_div_residual(vec2 coord){
  return ds_inv * (
    e_x(coord) +
    e_y(coord) -
    e_x(coord - vec2(1.0, 0.0)) -
    e_y(coord - vec2(0.0, 1.0))
  );
}

// Returns the residual amount of B field divergence at the location of b_z in the current cell
float b_div_residual(vec2 coord){
  return ds_inv * (
    b_x(coord + vec2(1.0, 0.0)) +
    b_y(coord + vec2(0.0, 1.0)) -
    b_x(coord) -
    b_y(coord)
  );
}

float filter_strength = 1.0;
void main(){
  float conservation_coeff = ds / 8.0;
  vec2 pos = gl_FragCoord.xy;
  e_x_new = e_x(pos) + dt * ds_inv * (
    b_z(pos) - b_z(pos - vec2(0.0, 1.0))
  ) - high_pass(e_x_tex, pos) * filter_strength;
  
  e_y_new = e_y(pos) + dt * ds_inv * (
    b_z(pos - vec2(1.0, 0.0)) - b_z(pos)
  ) - high_pass(e_y_tex, pos) * filter_strength;

  e_z_new = e_z(pos) + dt * ds_inv * (
    b_y(pos) - b_x(pos) - b_y(pos - vec2(1.0, 0.0)) + b_x(pos - vec2(0.0, 1.0))
  ) - high_pass(e_z_tex, pos) * filter_strength;

  b_x_new = b_x(pos) + dt * ds_inv * (
    e_z(pos) - e_z(pos + vec2(0.0, 1.0))
  ) - high_pass(b_x_tex, pos) * filter_strength;
  
  b_y_new = b_y(pos) + dt * ds_inv * (
    e_z(pos + vec2(1.0, 0.0)) - e_z(pos)
  ) - high_pass(b_y_tex, pos) * filter_strength;
  
  b_z_new = b_z(pos) + dt * ds_inv * (
    e_y(pos) - e_x(pos) + e_x(pos + vec2(0.0, 1.0)) - e_y(pos + vec2(1.0, 0.0))
  ) - high_pass(b_z_tex, pos) * filter_strength;

  e_x_new += conservation_coeff * (
    e_div_residual(pos + vec2(1.0, 0.0)) - e_div_residual(pos)
  );

  e_y_new += conservation_coeff * (
    e_div_residual(pos + vec2(0.0, 1.0)) - e_div_residual(pos)
  );

  b_x_new += conservation_coeff * (
    b_div_residual(pos) - b_div_residual(pos - vec2(1.0, 0.0))
  );

  b_y_new += conservation_coeff * (
    b_div_residual(pos) - b_div_residual(pos - vec2(0.0, 1.0))
  );
}