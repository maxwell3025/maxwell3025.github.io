#version 300 es
precision highp float;
uniform sampler2D d_x_tex;
uniform sampler2D d_y_tex;
uniform sampler2D d_z_tex;
uniform sampler2D b_x_tex;
uniform sampler2D b_y_tex;
uniform sampler2D b_z_tex;
uniform sampler2D charge_tex;
uniform sampler2D d_x_tex_soln;
uniform sampler2D d_y_tex_soln;
uniform sampler2D d_z_tex_soln;
uniform sampler2D b_x_tex_soln;
uniform sampler2D b_y_tex_soln;
uniform sampler2D b_z_tex_soln;
uniform sampler2D charge_tex_soln;

uniform sampler2D inv_permittivity_x_tex;
uniform sampler2D inv_permittivity_y_tex;
uniform sampler2D inv_permittivity_z_tex;

uniform sampler2D inv_permeability_x_tex;
uniform sampler2D inv_permeability_y_tex;
uniform sampler2D inv_permeability_z_tex;

uniform sampler2D antenna_frequency;
uniform sampler2D j_x_tex;
uniform sampler2D j_y_tex;
uniform sampler2D j_z_tex;
uniform sampler2D conductivity_x_tex;
uniform sampler2D conductivity_y_tex;
uniform sampler2D conductivity_z_tex;

uniform float width;
uniform float height;
uniform float dt;
uniform float time;
uniform float ds;
uniform float ds_inv;
uniform float boundary_thickness;
uniform float boundary_opacity;
layout(location = 0) out float d_x_new;
layout(location = 1) out float d_y_new;
layout(location = 2) out float d_z_new;
layout(location = 3) out float b_x_new;
layout(location = 4) out float b_y_new;
layout(location = 5) out float b_z_new;
layout(location = 6) out float charge_new;

/*********************************
* Grid Layout:
* This is how values are positioned within a single cell(i.e, all of them are in the same location within their respective textures)
* +----+----+
* | ey |    |
* |    | bz |
* | bx |    |
* +----+----+
* | ez | ex |
* | ch |    |
* | jz | by |
* +----+----+
*********************************/


// Samples the given texture at the given coordinates in pixels
float read_texture(sampler2D tex, vec2 coord){
  return texture(tex, coord / vec2(width, height)).x;
}

float d_x(vec2 coord){
  return 0.5 * read_texture(d_x_tex, coord) + 0.5 * read_texture(d_x_tex_soln, coord) ;
}

float d_y(vec2 coord){
  return 0.5 * read_texture(d_y_tex, coord) + 0.5 * read_texture(d_y_tex_soln, coord);
}

float d_z(vec2 coord){
  return 0.5 * read_texture(d_z_tex, coord) + 0.5 * read_texture(d_z_tex_soln, coord);
}

float b_x(vec2 coord){
  return 0.5 * read_texture(b_x_tex, coord) + 0.5 * read_texture(b_x_tex_soln, coord);
}

float b_y(vec2 coord){
  return 0.5 * read_texture(b_y_tex, coord) + 0.5 * read_texture(b_y_tex_soln, coord);
}

float b_z(vec2 coord){
  return 0.5 * read_texture(b_z_tex, coord) + 0.5 * read_texture(b_z_tex_soln, coord);
}

float e_x(vec2 coord){
  return d_x(coord) * read_texture(inv_permittivity_x_tex, coord);
}

float e_y(vec2 coord){
  return d_y(coord) * read_texture(inv_permittivity_y_tex, coord);
}

float e_z(vec2 coord){
  return d_z(coord) * read_texture(inv_permittivity_z_tex, coord);
}

float h_x(vec2 coord){
  return b_x(coord) * read_texture(inv_permeability_x_tex, coord);
}

float h_y(vec2 coord){
  return b_y(coord) * read_texture(inv_permeability_y_tex, coord);
}

float h_z(vec2 coord){
  return b_z(coord) * read_texture(inv_permeability_z_tex, coord);
}

float charge(vec2 coord){
  return 0.5 * read_texture(charge_tex, coord) + 0.5 * read_texture(charge_tex_soln, coord);
}

// NOTE: high fl sensitivity with high conductivity leads to stiff equations which explode
/**
* In general, this should only be a function of charge density.
* For conductors, this should be a constant or a linear function with a very small coefficient(on the order of inverse conductivity).
* For semimetals, this should be a linear function with a coefficient corrsponding above.
* For insulators, ditto above.
* For semiconductors, TODO
*/
float fermi_level_difference(vec2 coord){
  float fldiff = charge(coord) * 0.01;
  if(coord.x > width * 0.5){
    fldiff += 1.0;
  }
  return fldiff;
}

float j_x(vec2 coord){
  return 
    (e_x(coord) - (fermi_level_difference(coord + vec2(1.0, 0.0)) - fermi_level_difference(coord)) * ds_inv) * read_texture(conductivity_x_tex, coord)
    + read_texture(j_x_tex, coord) * cos(time * read_texture(antenna_frequency, coord));
}

float j_y(vec2 coord){
  return 
    (e_y(coord) - (fermi_level_difference(coord + vec2(0.0, 1.0)) - fermi_level_difference(coord)) * ds_inv) * read_texture(conductivity_y_tex, coord)
    + read_texture(j_y_tex, coord) * cos(time * read_texture(antenna_frequency, coord));
}

float j_z(vec2 coord){
  return 
    e_z(coord) * read_texture(conductivity_z_tex, coord)
    + read_texture(j_z_tex, coord) * cos(time * read_texture(antenna_frequency, coord));
}

// TODO implement charge
// Returns the residual amount of E field divergence at the location of e_z in the current cell
float d_div_residual(vec2 coord){
  return ds_inv * (
    d_x(coord) +
    d_y(coord) -
    d_x(coord - vec2(1.0, 0.0)) -
    d_y(coord - vec2(0.0, 1.0))
  ) - charge(coord);
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

void absorb(float intensity){
  float absorption_coeff = 1.0 - intensity * dt;
  d_x_new *= absorption_coeff;
  d_y_new *= absorption_coeff;
  d_z_new *= absorption_coeff;
}

void main(){
  float conservation_coeff = ds / 8.0;
  vec2 pos = gl_FragCoord.xy;

  d_x_new = read_texture(d_x_tex, pos);
  d_y_new = read_texture(d_y_tex, pos);
  d_z_new = read_texture(d_z_tex, pos);
  b_x_new = read_texture(b_x_tex, pos);
  b_y_new = read_texture(b_y_tex, pos);
  b_z_new = read_texture(b_z_tex, pos);
  charge_new = read_texture(charge_tex, pos);

  d_y_new += dt * ds_inv * ( h_z(pos - vec2(1.0, 0.0)) - h_z(pos                 )                                                         );
  b_y_new += dt * ds_inv * ( e_z(pos + vec2(1.0, 0.0)) - e_z(pos                 )                                                         );
  d_x_new += dt * ds_inv * ( h_z(pos                 ) - h_z(pos - vec2(0.0, 1.0))                                                         );
  b_x_new += dt * ds_inv * ( e_z(pos                 ) - e_z(pos + vec2(0.0, 1.0))                                                         );
  d_z_new += dt * ds_inv * ( h_y(pos                 ) - h_y(pos - vec2(1.0, 0.0)) - h_x(pos                 ) + h_x(pos - vec2(0.0, 1.0)) );
  b_z_new += dt * ds_inv * ( e_y(pos                 ) + e_x(pos + vec2(0.0, 1.0)) - e_x(pos                 ) - e_y(pos + vec2(1.0, 0.0)) );

  d_x_new -= dt * j_x(pos);
  d_y_new -= dt * j_y(pos);
  d_z_new -= dt * j_z(pos);

  charge_new -= dt * ds_inv * (
    j_x(pos) + j_y(pos) - j_x(pos - vec2(1.0, 0.0)) - j_y(pos - vec2(0.0, 1.0))
  );

  d_x_new += conservation_coeff * ( d_div_residual(pos + vec2(1.0, 0.0)) - d_div_residual(pos                 ) );
  d_y_new += conservation_coeff * ( d_div_residual(pos + vec2(0.0, 1.0)) - d_div_residual(pos                 ) );
  b_x_new += conservation_coeff * ( b_div_residual(pos                 ) - b_div_residual(pos - vec2(1.0, 0.0)) );
  b_y_new += conservation_coeff * ( b_div_residual(pos                 ) - b_div_residual(pos - vec2(0.0, 1.0)) );

  float boundary_depth = 0.0;

  if(gl_FragCoord.y < boundary_thickness)
    boundary_depth = boundary_thickness - gl_FragCoord.y;
  if((height - gl_FragCoord.y) < boundary_thickness)
    boundary_depth = gl_FragCoord.y - height + boundary_thickness;
  if(gl_FragCoord.x < boundary_thickness)
    boundary_depth = max(boundary_depth, boundary_thickness - gl_FragCoord.x);
  if((width - gl_FragCoord.x) < boundary_thickness)
    boundary_depth = max(boundary_depth, gl_FragCoord.x - width + boundary_thickness);
  absorb(boundary_depth * boundary_opacity);
}