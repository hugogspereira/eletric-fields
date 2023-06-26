attribute vec4 vPosition;

// color for the shader1.frag
varying vec4 fColor;

uniform float uTableWidth, uTableHeight;

#define MAX_CHARGES 20

// array of charges positions
uniform vec3 uPosition[MAX_CHARGES];

// array of charges values
uniform float uEletricCharges[MAX_CHARGES];

#define TWOPI 6.28318530718
#define GRID_SPACING 0.05
#define SCALE 0.4e-11
#define COULOUMB 8.988e9


// convert angle to hue; returns RGB
// colors corresponding to (angle mod TWOPI):
// 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple
vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(vec2 f)
{
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.);
}

float distanceF;
vec2 distanceVector, normalizedDistVector, eletricField, eletricFieldTotal;

void main()
{    
    gl_PointSize = 4.0;
    // if is a grid points that changes position
    if(vPosition.z == 1.0) {
        // eletric field that is incremented for all charges involved
        eletricFieldTotal = vec2(0.0, 0.0);
        for(int j = 0; j < MAX_CHARGES; j++) {
            distanceVector = vec2(uPosition[j].x, uPosition[j].y)-vec2((vPosition.x), (vPosition.y));
            normalizedDistVector = normalize(distanceVector);
            distanceF = length(distanceVector);

            eletricField = ((COULOUMB*-uEletricCharges[j]*SCALE)/(distanceF*distanceF))*normalizedDistVector;

            eletricFieldTotal += eletricField;
        }
        distanceF = length(eletricFieldTotal);
        // assign the position of the point with the eletric field
        // if the lines distance bigger than a constant that we defined (in case you think the lines are small change 1.25 to a bigger number)
        if(distanceF > (1.25*GRID_SPACING)) {
            normalizedDistVector = normalize(eletricFieldTotal);
            gl_Position.x = (vPosition.x/(uTableWidth/2.0)) + (1.25*GRID_SPACING)*normalizedDistVector.x;
            gl_Position.y = (vPosition.y/(uTableHeight/2.0)) + (1.25*GRID_SPACING)*normalizedDistVector.y;
        }
        else {
            gl_Position.x = (vPosition.x/(uTableWidth/2.0)) + eletricFieldTotal.x;
            gl_Position.y = (vPosition.y/(uTableHeight/2.0)) + eletricFieldTotal.y;
        }
        // assign the color based on the position
        fColor = colorize(vec2(gl_Position.x, gl_Position.y));
    }
    else {
        // is a normal grid point
        gl_Position.x = (vPosition.x / (uTableWidth/2.0));
        gl_Position.y = (vPosition.y / (uTableHeight/2.0));
        fColor = vec4(0.0, 0.0, 0.0, 0.0);
    }

    gl_Position.z = 0.0;
    gl_Position.w = 1.0;
    
}