/*
 Grupo 12    Turno P7
 58010 - Hugo Pereira
 59187 - Bernardo Calvo
*/

import * as UTILS from '../libs/utils.js';
import * as MV from '../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;

// programs for the gric and for the charges
let programGrid;
let programCharges;
let ANGLE = 0.01;

// constants
const GRID_SPACING = 0.05;
const MAX_CHARGES = 20;
const TABLE_WIDTH = 3.0;

// if true it draw the charges points, false otherwise
let isSharingCharges = true;

// the only buffer used
let buffer;

let table_height; 

// positions of grid points
let gridPoints = [];

// positions of charges points
let chargesPoints = [];

// values of charges
let chargesValues = [];

function animate()
{
    window.requestAnimationFrame(animate);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // use the program that controls the grid
    gl.useProgram(programGrid);
    const tablewG = gl.getUniformLocation(programGrid,"uTableWidth");
    gl.uniform1f(tablewG, TABLE_WIDTH);
    const tablehG = gl.getUniformLocation(programGrid,"uTableHeight");
    gl.uniform1f(tablehG, table_height);

    // update the uniforms of charges points and of charges values
    for(let i = 0; i < chargesPoints.length; i++) {
        const uPosition = gl.getUniformLocation(programGrid, "uPosition[" + i + "]");
        gl.uniform3fv(uPosition, MV.flatten(chargesPoints[i]));
        const uEletricCharges = gl.getUniformLocation(programGrid, "uEletricCharges[" + i + "]");
        gl.uniform1f(uEletricCharges, chargesValues[i]);
    }
    // draw the eletric field
    gl.drawArrays(gl.LINES, 0, gridPoints.length);

    // use the program that controls the charges
    gl.useProgram(programCharges);
    const tablewC = gl.getUniformLocation(programCharges,"uTableWidth");
    gl.uniform1f(tablewC, TABLE_WIDTH);
    const tablehC = gl.getUniformLocation(programCharges,"uTableHeight");
    gl.uniform1f(tablehC, table_height);

    // only draws the charges if sharing charges is on 
    if(isSharingCharges) {  
        // assign the new positions of the charges to the buffer
        gl.bufferSubData(gl.ARRAY_BUFFER, (gridPoints.length*MV.sizeof["vec3"]), MV.flatten(chargesPoints));
        // draw charges
        gl.drawArrays(gl.POINTS, gridPoints.length, chargesPoints.length);
    }

    // calculate the new positions of the charges because of their rotation
    for(let i = 0; i < chargesPoints.length; i++) {
        // if charge is negative the angle of rotation is negative if it is positive the angle is positive
        let s  = Math.sin(ANGLE*chargesValues[i]);
        let c = Math.cos(ANGLE*chargesValues[i]);
        
        chargesPoints[i][0] = (chargesPoints[i][0]*c - chargesPoints[i][1]*s);
        chargesPoints[i][1] = (chargesPoints[i][0]*s + chargesPoints[i][1]*c);
    }
} 

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");

    // initialize canvas components and calculate table height
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    table_height = TABLE_WIDTH/(canvas.width/canvas.height);

    gl = UTILS.setupWebGL(canvas);

    // program to draw the grid
    programGrid = UTILS.buildProgramFromSources(gl, shaders["../../Shaders/shader1.vert"], shaders["../../Shaders/shader1.frag"]);

    // program to draw the charges
    programCharges = UTILS.buildProgramFromSources(gl, shaders["../../Shaders/shader2.vert"], shaders["../../Shaders/shader2.frag"]);

    /* create the grid points the corresponding duplicates to draw the lines of the eletric field
    auxX and auxY are used to create a random offset for the position in the corresponding grid to  
    eliminate the regular pattern of the lines of the eletric field */
    gl.useProgram(programGrid);
    for(let x = -TABLE_WIDTH/2+GRID_SPACING/2; x <= TABLE_WIDTH/2; x += GRID_SPACING) {
        for(let y = -table_height/2+GRID_SPACING/2; (y <= table_height/2); y += GRID_SPACING) {
            let auxX, auxY;
            auxX = (Math.random()*GRID_SPACING)-GRID_SPACING/2;
            auxY = (Math.random()*GRID_SPACING)-GRID_SPACING/2;
            gridPoints.push(MV.vec3(x+auxX, y+auxY, 0.0));
            gridPoints.push(MV.vec3(x+auxX, y+auxY, 1.0));
        }
    }

    // create buffer and assign the grid point to it  
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, ((gridPoints.length+MAX_CHARGES)*MV.sizeof["vec3"]), gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(gridPoints));
    
    const vPositionG = gl.getAttribLocation(programGrid, "vPosition");
    gl.vertexAttribPointer(vPositionG, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionG);

    const vPositionC = gl.getAttribLocation(programCharges, "vPosition");
    gl.vertexAttribPointer(vPositionC, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionC);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // for a smoother movement (not appear overlapping lines)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    const closeButton = document.getElementById("close-button");
    // event listener that removes the options div on a click
    closeButton.addEventListener("click", function() {
        const instructionsDiv = document.getElementById("instructions");
        instructionsDiv.parentNode.removeChild(instructionsDiv);
    });

    // event listener that adds a new charge with the position of the click to the buffer
    canvas.addEventListener("click", function(event) {
        const x = event.offsetX;
        const y = event.offsetY;

        const canvas = document.getElementById("gl-canvas");

        // conversion of the pixel coordinates to the coordinates of the current referential
        const realX = ((x-canvas.width/2)*TABLE_WIDTH/2)/(canvas.width/2);
        const realY = ((-y+canvas.height/2)*table_height/2)/(canvas.height/2);
        console.log("Click at (" + realX + ", " + realY + ")")

        if(chargesPoints.length < MAX_CHARGES) {
            let point;
            if(event.shiftKey) {
                chargesValues.push(-1.0);
                point = MV.vec3(realX, realY, -1.0);
            }
            else {
                chargesValues.push(1.0);
                point = MV.vec3(realX, realY, 1.0);
            }
            chargesPoints.push(point);
            
            gl.bufferSubData(gl.ARRAY_BUFFER, ((gridPoints.length+(chargesPoints.length-1))*MV.sizeof["vec3"]), MV.flatten(chargesPoints[chargesPoints.length-1]));
        }
    }); 
    window.requestAnimationFrame(animate);
}

// event listener used to recalculate the window values based on the new size
window.addEventListener("resize", function (event) {
    const canvas = document.getElementById("gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    table_height = TABLE_WIDTH/(canvas.width/canvas.height);
});

// event listener that changes the variable which controls the sharing of charges
window.addEventListener("keydown", function(event) {
    if(event.code === "Space") {
        isSharingCharges = !isSharingCharges;
    }
    else if (event.key === "+") {
        if(ANGLE + 0.001 < 0.02) {
            ANGLE += 0.001;
        }
    }
    else if (event.key === "-") {
        if(ANGLE - 0.001 > 0) {
            ANGLE -= 0.001;
        }
    }
});

{
const allShaders = ["../../Shaders/shader1.vert", "../../Shaders/shader2.vert", "../../Shaders/shader1.frag", "../../Shaders/shader2.frag"];
UTILS.loadShadersFromURLS(allShaders).then(s => setup(s));
}