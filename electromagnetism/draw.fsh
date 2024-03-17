#version 300 es
precision highp float;

uniform float x1;
uniform float y1;
uniform float x2;
uniform float y2;
uniform float radius;
uniform float value;

layout(location = 0) out float color;

void main(){
  vec2 pos = gl_FragCoord.xy;
  vec2 line_vector = vec2(x2 - x1, y2 - y1);
  vec2 p1 = vec2(x1, y1);
  vec2 diff = pos - p1;
  if(dot(line_vector, line_vector) > 0.0){
    float interp = dot(diff, line_vector) / dot(line_vector, line_vector);
    interp = max(interp, 0.0);
    interp = min(interp, 1.0);
    diff -= interp * line_vector;
  }
  if(dot(diff, diff) <= radius * radius){
    color = value;
  } else {
    discard;
  }
}