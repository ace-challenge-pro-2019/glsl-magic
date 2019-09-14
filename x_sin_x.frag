precision mediump float;

uniform float time;
uniform vec2 resolution;

#define SCALE 40.

// Function to plot
float func(float x) {
    return sin(x ) * x* tan(time);
}

vec2 map(vec2 coord) {
    return (coord.xy - .5 * resolution.xy) / resolution.y * SCALE;
}

float plot(vec2 p) {
    vec2 uv = map(p);
    vec2 luv = map(vec2(p.x - 1., p.y));
    vec2 ruv = map(vec2(p.x + 1., p.y));

    float dist = distance(uv, vec2(uv.x, func(uv.x)));
    float ldist = distance(luv, vec2(luv.x, func(luv.x)));
    float rdist = distance(ruv, vec2(ruv.x, func(ruv.x)));
    return smoothstep(max(.1, max(rdist, ldist)), .0, dist);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    fragColor = vec4(vec3(plot(fragCoord)), 1.);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
