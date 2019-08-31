#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

mat2 rot(float a) {
	float c = cos(a), s = sin(a);
	return mat2(c,s,-s,c);
}

const float pi = acos(-1.0);
const float pi2 = pi*2.0;

vec2 pmod(vec2 p, float r) {
	float a = atan(p.x, p.y) + pi /r;
	float n = pi2 / r;
	a = floor(a/n)*n;
	return p*rot(-a);
}

float distanceFunction(vec3 pos) {
	float d = length(pos) - 0.5;
	return d;
}

float sdBoxMax(vec3 p, float s) {
	p = abs(p) - s;
	return max(max(p.x, p.y), p.z);
}

vec3 foldX(vec3 p) {
	p.x = abs(p.x);
	return p;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
	vec2 p = (fragCoord * 2. - resolution.xy) / min (resolution.x, resolution.y);
	vec3 cameraPos = vec3(0., 0., -10.);
	float screenZ = 2.5;
	
	p *= rot(sin(time));
	
	vec3 rayDirection = normalize(vec3(p, screenZ));
	
	float depth = 0.0;
	
	vec3 color = vec3(0.0);
	
	for(int i=0;i<99;i++) {
		vec3 rayPos = cameraPos + rayDirection * depth;
		float dist = sdBoxMax(rayPos, .5);
		
		if(dist<0.0001){
			color = vec3(p.x,p.y,1.0);
			break;
		}
		
		depth += dist;
	}
	
	fragColor = vec4( color, 1.0 );
}

void main( void ) {

	
	mainImage(gl_FragColor, gl_FragCoord.xy);

}