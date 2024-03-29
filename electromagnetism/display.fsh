#version 300 es
precision highp float;
uniform sampler2D tex0;
uniform float width;
uniform float height;
uniform float x;
uniform float y;
out vec4 fragColor;

// Samples the given texture at the given coordinates in pixels
float readSampler(sampler2D tex, vec2 coord){
  return texture(tex, coord / vec2(width, height)).x;
}

void main() {
  float value = readSampler(tex0, gl_FragCoord.xy - vec2(x, y));
  if(value > 0.0){
    fragColor = vec4(value, 0.0, 0.0, 1.0);
  } else {
    fragColor = vec4(0.0, -value, -value, 1.0);
  }
  if(isnan(value) || isinf(value)){
    fragColor = vec4(0.5, 1.0, 0.0, 1.0);
  }
}