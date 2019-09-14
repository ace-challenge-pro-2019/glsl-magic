# glsl-magic
GLSLで魔法使いになりたい！

## GLSL リファレンス

バージョンはこれで良いのか？？

https://www.khronos.org/registry/OpenGL-Refpages/gl4/

## SandBox

http://glslsandbox.com/e

最初のサンプル

```
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main( void ) {

	vec2 position = ( gl_FragCoord.xy / resolution.xy ) + mouse / 4.0;

	float color = 0.0;
	color += sin( position.x * cos( time / 15.0 ) * 80.0 ) + cos( position.y * cos( time / 15.0 ) * 10.0 );
	color += sin( position.y * sin( time / 10.0 ) * 40.0 ) + cos( position.x * sin( time / 25.0 ) * 40.0 );
	color += sin( position.x * sin( time / 5.0 ) * 10.0 ) + sin( position.y * sin( time / 35.0 ) * 80.0 );
	color *= sin( time / 10.0 ) * 0.5;

	gl_FragColor = vec4( vec3( color, color * 0.5, sin( color + time / 3.0 ) * 0.75 ), 1.0 );

}
```

以下の記事を参考に四角い箱を描画。

- [魔法使いになりたい人のためのシェーダーライブコーディング入門](https://qiita.com/kaneta1992/items/21149c78159bd27e0860)

```
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

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

void main( void ) {

	vec2 p = (gl_FragCoord.xy * 2. - resolution.xy) / min (resolution.x, resolution.y);
	
	vec3 cameraPos = vec3(0., 0., -5.);
	float screenZ = 2.5;
	vec3 rayDirection = normalize(vec3(p, screenZ));
	
	float depth = 0.0;
	
	vec3 col = vec3(0.0);
	
	for(int i=0;i<99;i++) {
		vec3 rayPos = cameraPos + rayDirection * depth;
		float dist = sdBoxMax(rayPos, .5);
		
		if(dist<0.0001){
			col = vec3(1.);
			break;
		}
		
		depth += dist;
	}
	
	gl_FragColor = vec4( col, 1.0 );

}
```

http://glslsandbox.com/e#57059.0
無機質な模様？

```
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main( void ) {

	vec2 position = ( gl_FragCoord.xy / resolution.xy );
	float centered_coord = length(position - vec2(0.5));

			float u = 8.0 / centered_coord + 16.0 * time/2.;
			float v = atan(position.y - 0.5, position.x - 0.5) * 16.0;
	 
			float fade = centered_coord / 4.;
			float gradient = (sin(u) + sin(v))*fade;

	gl_FragColor = vec4( vec3(gradient*4.), 1.0 );

}
```

とりあえず箱を回してみた→ rotate_box.frag

## カラフルなサンプル発見

https://www.shadertoy.com/view/4lGcz1 -> rainbow.frag

https://www.shadertoy.com/view/MdfBRX -> rainglass.frag

## 大体の仕組み


https://thebookofshaders.com/03/?lan=jp

uniform 宣言されている変数はCPUからGPUに渡される変数。各スレッドに均一に渡される変数のため、'uniform' と呼ばれている。

http://glslsandbox.com/e のサイトでは、経過時間、マウス位置、解像度(画面サイズ)が`float time`、`vec2 mouse`、`vec2 resolution`の３つに渡されてくる。
この変数名はCPU側の実装に依存している。(実行する処理系によって変わる。)

`vec4 gl_FragCoord`などのgl_*で提供される"変数"はGPUのスレッドごとに変わる(グローバルっぽい？)変数で、引数や戻り値として使用される。=varying変数と呼ばれるらしい。

```
vec2 st = gl_FragCoord.xy/u_resolution;
```

ってよくやるけど、どう言うこと？？

> フラグメントの座標を描画領域全体のサイズで割ることによって正規化しています。こうすると座標値の範囲が 0.0 から 1.0 の間に収まるため、簡単にx座標とy座標の値をr（赤）とg（緑）のチャンネルに対応させることができます。

http://glslsandbox.com/e#57426.0 のサンプルでは `varying vec2 surfacePosition;` も使っている。パンニングができるみたい。

ここの制御はどうなってるんだろう・・・？
