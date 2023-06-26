attribute vec4 vPosition;

// color for the shader2.frag
varying float fColor;

uniform float uTableWidth, uTableHeight;

void main()
{    
    gl_PointSize = 20.0;

    gl_Position = vPosition;
    gl_Position.x = (vPosition.x / (uTableWidth/2.0));
    gl_Position.y = (vPosition.y / (uTableHeight/2.0));
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;
    
    fColor = vPosition.z;
}