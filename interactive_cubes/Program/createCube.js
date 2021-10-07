//send cube data to GPU once

var index = 0;

var canvas;
var gl;

var sendLock = 0;

maxNumTriangles = 400;
maxNumVertices = maxNumTriangles * 3;

var NumVertices  = 36;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 2;
var randomxd = 12;

var theta = [0, 0, 0];

var mainTranslationMatrix = mat4();

var newMV = mat4();
var translateArray = [];
var speedArray = [];
var bretaBrarray = [];
var coin;

window.onload = function init(){

    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);

    if ( !gl ) { alert( "WebGL isn't available" ); }

    canvas.addEventListener("mousedown", function(){

        var screenx = event.clientX - canvas.offsetLeft;
		var screeny = event.clientY - canvas.offsetTop;
		  
        var posX = 2*screenx/canvas.width-1;
		var posY = 2*(canvas.height-screeny)/canvas.height-1;
		  
        t = vec2(posX,posY);

        colorCube();

        //Data is only sent to the GPU once with this if. After one click, it doesn't send again.
        if(sendLock === 0)
        {
            console.log("Cube vertex data sent over once and only once.");
            gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
            //gl.bufferSubData( gl.ARRAY_BUFFER, 12 * index, flatten(points) )
            gl.bufferData( gl.ARRAY_BUFFER, flatten(getPoints()), gl.STATIC_DRAW );
        }
        
        translateArray.push(translate(posX, posY, Math.random()));
        coin = Math.floor(Math.random() * 2);
        if(coin === 0)
        {
            coin = Math.random();
            speedArray.push(coin);
            bretaBrarray.push(coin);  
        }
        else{
            coin = -1 * Math.random();
            speedArray.push(coin);
            bretaBrarray.push(coin);         
        }
        newMV = translate(posX, posY, 0.0); 

        //Data is only sent to the GPU once with this if. After one click, it doesn't send again.
        if(sendLock === 0)
        {
            console.log("Cube color data sent over once and only once.");
            gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
            gl.bufferData( gl.ARRAY_BUFFER, flatten(getColors()), gl.STATIC_DRAW );
            //gl.bufferSubData( gl.ARRAY_BUFFER, 8 * index, flatten(colors) )
        }

        index++;

         sendLock = 1;
    })

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    mainTranslationMatrix = gl.getUniformLocation( program, "modelView2" );    

    var vBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

    var cBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vColor );
        
    document.getElementById( "rotateXButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "rotateYButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "rotateZButton" ).onclick = function () {
        axis = zAxis;
    };
    document.getElementById( "rotateRandom" ).onclick = function () {
        randomxd = Math.floor(Math.random() * 3);
        axis = randomxd;
    }

    render();
}

function render()
{
    //where the model view array is stored per each iteration of the for loop. It is redefined per render.
    var modelViewArray = [];

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for( var i = 0; i < index; i++ )
    {
        bretaBrarray[i] += speedArray[i];
    }

    theta[axis] += 0.2;

    for( var i = 0; i < index ; i++ )
    {
        modelViewArray.push( mult( mult( translateArray[i], rotate(bretaBrarray[i], theta) ), scalem(document.getElementById( "cubeScale" ).value / 100, document.getElementById( "cubeScale" ).value / 100, (document.getElementById( "cubeScale" ).value / 100) ) ) )

        gl.uniformMatrix4fv( mainTranslationMatrix, false, flatten(modelViewArray[i]) );

        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    }

    requestAnimFrame( render );
}