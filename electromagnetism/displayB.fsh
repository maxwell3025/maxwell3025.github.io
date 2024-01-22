#version 300 es
precision highp float;
uniform sampler2D b_x_tex;
uniform sampler2D b_y_tex;
uniform sampler2D b_z_tex;
uniform float width;
uniform float height;
uniform float x;
uniform float y;
out vec4 fragColor;

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
float readSampler(sampler2D tex, vec2 coord){
  return texture(tex, coord / vec2(width, height)).x;
}

vec3 linearToSRGB(vec3 linear){
  return vec3(
    pow(clamp(linear.x, 0.0, 1.0), 0.45),
    pow(clamp(linear.y, 0.0, 1.0), 0.45),
    pow(clamp(linear.z, 0.0, 1.0), 0.45)
  );
}

void main() {
  vec2 pos = gl_FragCoord.xy - vec2(x, y);
  vec3 d = vec3(0.5, 0.5, 0.5);
  d.x += readSampler(b_x_tex, pos - vec2(1.0, 0.0));
  d.y += readSampler(b_y_tex, pos - vec2(0.0, 1.0));
  d.z += readSampler(b_z_tex, pos - vec2(1.0, 1.0));
  fragColor = vec4(linearToSRGB(d), 1.0);
}