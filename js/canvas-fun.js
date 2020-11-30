var canvas = document.getElementById("screen");
var ctx = canvas.getContext("2d");

//settings
var backgroundColor = "#FFFFFF";

var iterationCount = document.getElementById("iterations").value;

//canvas width and height
var width = canvas.width;
var height = canvas.height;
var ratio =  canvas.height / canvas.width;

//array with pixel data
var dataArray = new Uint8ClampedArray(width * height * 4);
var imageData = new ImageData(dataArray,width);

//the initial boundaries of the coordinate system
var xStart = -2.3;
var xEnd  = 0.9;
var yStart = -1.2;
var yEnd = 1.2;

//needed to calculate between canvas and coordinate system cutout
var cutoutWidth = Math.sqrt(Math.pow(xEnd - xStart,2));
var cutoutHeight = Math.sqrt(Math.pow(yEnd - yStart,2));
var ratioWidth = cutoutWidth / width;
var ratioHeight = cutoutHeight / height;

//mouse position for zoom
var xMouseStart = 0;
var yMouseStart = 0;
var xMouseEnd = 0;
var yMouseEnd = 0;
var drawMouseRect = false;

//set the color for each pixel
function getPixelData(){
    for (let i = 0; i < dataArray.length; i += 4) {
        var c = getPixelColor((i/4) % width,Math.floor((i / 4) / width)) * 2;
        dataArray[i + 0] = c;
        dataArray[i + 1] = c;
        dataArray[i + 2] = c;
        dataArray[i + 3] = 255;
    }  
}

getPixelData();

//calculate the color of a pixel
function getPixelColor(ax,ay){

    //covert array position to cutout
    var x = (ratioWidth * ax) + xStart;
    var y = (ratioHeight * ay) + yStart;

    //z is a complex number. zr is the real part and zi is the imaginary part 
    var zr = 0;
    var zi = 0;

    //initial c value
    var cr = x;
    var ci = y;

    var i = 0;

    //value of the complex number z
    var zv = 0;

    while(zv < 2 && i < iterationCount){
        //square z
        var zsr = (zr * zr) - (zi * zi);
        var zsi = 2 * zr * zi;
        //add c
        var znr = zsr + cr;
        var zni = zsi + ci;

        //the new z is the old z
        zr = znr;
        zi = zni;

        zv = Math.sqrt(Math.pow(zr,2)+Math.pow(zi,2));
        i++;
    }

    if(zv < 2){
        return 255;
    }

    return i;
}

function draw(){
    //draw the image
    ctx.putImageData(imageData, (canvas.width / 2) - width /2, (canvas.height/ 2) - height/2);

    //and some stats
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("JavaScript Apfelmänchen", 5, canvas.height - 50); 
    ctx.font = "10px Arial";
    ctx.fillText("Max. Iterations: " + document.getElementById("iterations").value, 5, canvas.height - 30); 
    ctx.fillText("https://github.com/mathias-wilke/javascript-canvas-mandelbrot.git", 5, canvas.height - 10); 

    //draw the rectangle if the mouse is pressed down
    if(drawMouseRect && xMouseEnd != 0){
        var fixedRatioY = (xMouseEnd - xMouseStart) * ratio;
        ctx.beginPath();
        ctx.rect(xMouseStart,yMouseStart,(xMouseStart-xMouseEnd) * -1,(-fixedRatioY) * -1);
        ctx.strokeStyle = "#FF416C"; // nice color :) !
        ctx.stroke();
    }
}

function update(){
    iterationCount = document.getElementById("iterations").value;
}

//clear the canvas
function clear(){
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//if the user changes the size of the canvas we have do recalculate some stuff
function resizeCanvas(){
    //resize the canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = canvas.width;
    height = canvas.height;
    ratio =  canvas.height / canvas.width;
    dataArray = new Uint8ClampedArray(width * height * 4);
    imageData = new ImageData(dataArray,width);
    cutoutWidth = Math.sqrt(Math.pow(xEnd - xStart,2));
    cutoutHeight = Math.sqrt(Math.pow(yEnd - yStart,2));
    ratioWidth = cutoutWidth / width;
    ratioHeight = cutoutHeight / height;  
    //redraw the image
    getPixelData();
}

//let us call the function once at the start to get the user's canvas size
resizeCanvas();

window.addEventListener('resize', resizeCanvas);

//this block will call the function clear, update, and draw all the time
function loop() {
    clear();
    update();
    draw();
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);

canvas.addEventListener('mousedown', e => {
    xMouseStart = e.offsetX;
    yMouseStart = e.offsetY;
    xMouseEnd = 0;
    yMouseEnd = 0;
    drawMouseRect = true;
  });

canvas.addEventListener('mouseup', e => {
    drawMouseRect = false;

    //let us force a fixed ratio
    var fixedRatioY = (xMouseEnd - xMouseStart) * ratio;
    
    var oldxStart = xStart;
    var oldyStart = yStart;

    xStart = (ratioWidth * xMouseStart) + oldxStart;
    yStart = (ratioHeight * yMouseStart) + oldyStart;
    xEnd = (ratioWidth * xMouseEnd) + oldxStart;
    yEnd = (ratioHeight * (fixedRatioY + yMouseStart)) + oldyStart;

    //swap if marked from right to left
    if(xStart > xEnd){
        var tmp = xStart;
        xStart = xEnd;
        xEnd = tmp;
    }

    if(yStart > yEnd){
        var tmp = yStart;
        yStart = yEnd;
        yEnd = tmp;      
    }

    //show the coordinates
    document.getElementById("xs").innerText = "xs: " + xStart;
    document.getElementById("xe").innerText = "xe: " + yStart;
    document.getElementById("ys").innerText = "ys: " + xEnd;
    document.getElementById("ye").innerText = "ye: " + yEnd;

    //calculate the cutout 
    cutoutWidth  = Math.sqrt(Math.pow(xEnd - xStart,2));
    cutoutHeight  = Math.sqrt(Math.pow(yEnd - yStart,2));
    
    ratioWidth = cutoutWidth  / width;
    ratioHeight = cutoutHeight  / height;

    //redraw the image
    getPixelData();
});

canvas.addEventListener('mousemove', e => {
    if (drawMouseRect === true) {
        xMouseEnd = e.offsetX;
        yMouseEnd = e.offsetY;
    }
});
