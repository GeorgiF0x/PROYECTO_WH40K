export const holographicVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const holographicFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    // Flicker muy sutil — 1.5% variacion, solo para dar vida
    float flicker = 1.0 - 0.015 * sin(uTime * 12.0);

    vec3 color = texColor.rgb * flicker;

    gl_FragColor = vec4(color, texColor.a * uOpacity);
  }
`
