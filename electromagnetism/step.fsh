#version 300 es
precision highp float;
uniform sampler2D d_x_tex;
uniform sampler2D d_y_tex;
uniform sampler2D d_z_tex;
uniform sampler2D b_x_tex;
uniform sampler2D b_y_tex;
uniform sampler2D b_z_tex;
uniform sampler2D inv_permittivity_tex;
uniform sampler2D antenna_frequency;
uniform sampler2D j_z_tex;
uniform float width;
uniform float height;
uniform float dt;
uniform float time;
uniform float ds;
uniform float ds_inv;
layout(location = 0) out float d_x_new;
layout(location = 1) out float d_y_new;
layout(location = 2) out float d_z_new;
layout(location = 3) out float b_x_new;
layout(location = 4) out float b_y_new;
layout(location = 5) out float b_z_new;

/*********************************
* Grid Layout:
* This is how values are positioned within a single cell(i.e, all of them are in the same location within their respective textures)
* +----+----+
* | ey |    |
* |    | bz |
* | bx |    |
* +----+----+
* | ez | ex |
* |    |    |
* | jz | by |
* +----+----+
*********************************/


// Samples the given texture at the given coordinates in pixels
float read_texture(sampler2D tex, vec2 coord){
  return texture(tex, coord / vec2(width, height)).x;
}

float e_x(vec2 coord){
  return read_texture(d_x_tex, coord) * read_texture(inv_permittivity_tex, coord + vec2(0.25, -0.25));
}

float e_y(vec2 coord){
  return read_texture(d_y_tex, coord) * read_texture(inv_permittivity_tex, coord + vec2(-0.25, 0.25));
}

float e_z(vec2 coord){
  return read_texture(d_z_tex, coord) * read_texture(inv_permittivity_tex, coord - vec2(0.25, 0.25));
}

float d_x(vec2 coord){
  return read_texture(d_x_tex, coord);
}

float d_y(vec2 coord){
  return read_texture(d_y_tex, coord);
}

float d_z(vec2 coord){
  return read_texture(d_z_tex, coord);
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

float j_z(vec2 coord){
  return read_texture(j_z_tex, coord) * cos(time * read_texture(antenna_frequency, coord));
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

// TODO implement charge
// Returns the residual amount of E field divergence at the location of e_z in the current cell
float d_div_residual(vec2 coord){
  return ds_inv * (
    d_x(coord) +
    d_y(coord) -
    d_x(coord - vec2(1.0, 0.0)) -
    d_y(coord - vec2(0.0, 1.0))
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

float boundary_opacity = 20.0;
void absorb(){
  float absorption_coeff = 1.0 - boundary_opacity * dt;
  d_x_new *= absorption_coeff;
  d_y_new *= absorption_coeff;
  d_z_new *= absorption_coeff;
}
float boundary_thickness = 40.0;
float filter_strength = 0.5;
void main(){
  float conservation_coeff = ds / 8.0;
  vec2 pos = gl_FragCoord.xy;

  d_x_new = d_x(pos) + dt * ds_inv * (
    b_z(pos) - b_z(pos - vec2(0.0, 1.0))
  ) - high_pass(d_x_tex, pos) * filter_strength;
  
  d_y_new = d_y(pos) + dt * ds_inv * (
    b_z(pos - vec2(1.0, 0.0)) - b_z(pos)
  ) - high_pass(d_y_tex, pos) * filter_strength;

  d_z_new = d_z(pos) + dt * ds_inv * (
    b_y(pos) - b_x(pos) - b_y(pos - vec2(1.0, 0.0)) + b_x(pos - vec2(0.0, 1.0))
  ) - high_pass(d_z_tex, pos) * filter_strength
  - dt * j_z(pos);

  b_x_new = b_x(pos) + dt * ds_inv * (
    e_z(pos) - e_z(pos + vec2(0.0, 1.0))
  ) - high_pass(b_x_tex, pos) * filter_strength;
  
  b_y_new = b_y(pos) + dt * ds_inv * (
    e_z(pos + vec2(1.0, 0.0)) - e_z(pos)
  ) - high_pass(b_y_tex, pos) * filter_strength;
  
  b_z_new = b_z(pos) + dt * ds_inv * (
    e_y(pos) - e_x(pos) + e_x(pos + vec2(0.0, 1.0)) - e_y(pos + vec2(1.0, 0.0))
  ) - high_pass(b_z_tex, pos) * filter_strength;

  d_x_new += conservation_coeff * (
    d_div_residual(pos + vec2(1.0, 0.0)) - d_div_residual(pos)
  );

  d_y_new += conservation_coeff * (
    d_div_residual(pos + vec2(0.0, 1.0)) - d_div_residual(pos)
  );

  b_x_new += conservation_coeff * (
    b_div_residual(pos) - b_div_residual(pos - vec2(1.0, 0.0))
  );

  b_y_new += conservation_coeff * (
    b_div_residual(pos) - b_div_residual(pos - vec2(0.0, 1.0))
  );
  if(gl_FragCoord.x < boundary_thickness || gl_FragCoord.y < boundary_thickness || (width - gl_FragCoord.x) < boundary_thickness || (height - gl_FragCoord.y) < boundary_thickness){
    absorb();
  }
}