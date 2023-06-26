precision highp float;

// receives the color from shader2.vert
varying float fColor;

void main()
{
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;
    float distance = length(fragmentPosition);
    float radius = 1.0;
    float result = smoothstep(distance,distance,radius);

    if(distance < radius) {
        if(fColor == -1.0) {
            // make the - sign
            if((abs(fragmentPosition.y) > 0.2) || (abs(fragmentPosition.x) > 0.65)) {
                gl_FragColor = vec4(vec3(result, 0.0, 0.0),1.0);
            }
            else {
                discard;
            }
        }
        else {
            // make the + sign
            if(((abs(fragmentPosition.x) > 0.65) || (abs(fragmentPosition.y) > 0.2)) && ((abs(fragmentPosition.y) > 0.65) || (abs(fragmentPosition.x) > 0.2))) {
                gl_FragColor = vec4(vec3(0.0, result, 0.0),1.0);
            }
            else {
                discard;
            }
        }

    }
    else {
        // is outside the circle we want to draw
        discard; 
    }
    
}
