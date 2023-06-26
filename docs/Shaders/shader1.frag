precision highp float;

// receives the color from shader1.vert
varying vec4 fColor;

void main()
{
    gl_FragColor = fColor;
}
