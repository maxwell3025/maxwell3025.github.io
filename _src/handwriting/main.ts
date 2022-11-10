import * as d3 from 'd3'
import * as fs from 'fs'

const canvas = document.getElementById("draw-canvas") as HTMLCanvasElement
const context = canvas.getContext("2d")!
canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault()
}, false);

enum State{
    None = 0,
    Draw = 1,
    Erase = 2
}
var state = State.None
var canvasData = function(){
    let data: number[] = []
    for(let i = 0; i < 784; i++){
        data.push(0)
    }
    return data
}()

const line = function(x1: number, y1: number, x2: number, y2: number, callback: (x: number, y: number) => void){
    let pixelX1 = Math.floor(x1)
    let pixelY1 = Math.floor(y1)
    let pixelX2 = Math.floor(x2)
    let pixelY2 = Math.floor(y2)
    var dx = Math.abs(pixelX2 - pixelX1);
    var dy = Math.abs(pixelY2 - pixelY1);
    var sx = (pixelX1 < pixelX2) ? 1 : -1;
    var sy = (pixelY1 < pixelY2) ? 1 : -1;
    var err = dx - dy;

   while(true) {
      callback(pixelX1, pixelY1); // Do what you need to for this

      if ((pixelX1 === pixelX2) && (pixelY1 === pixelY2)) break;
      var e2 = 2*err;
      if (e2 > -dy) { err -= dy; pixelX1  += sx; }
      if (e2 < dx) { err += dx; pixelY1  += sy; }
   }
}

const draw = function(x: number, y: number){
    for(let dx = -1; dx < 2; dx++){
        for(let dy = -1; dy < 2; dy++){
            if(0 <= x + dx && x + dx < 28 && 0 <= y + dy && y + dy < 28){
                let shade = canvasData[(y + dy) * 28 + (x + dx)]
                canvasData[(y + dy) * 28 + (x + dx)] = 1 - (1 - shade) * 0.8
            }
        }
    }
    refresh(x, y)
}

const erase = function(x: number, y: number){
    for(let dx = -1; dx < 2; dx++){
        for(let dy = -1; dy < 2; dy++){
            if(0 <= x + dx && x + dx < 28 && 0 <= y + dy && y + dy < 28){
                canvasData[(y + dy) * 28 + (x + dx)] *= 0.8
            }
        }
    }
    refresh(x, y)
}

const refresh = function(x: number, y: number){
    for(let dx = -1; dx < 2; dx++){
        for(let dy = -1; dy < 2; dy++){
            if(0 <= x + dx && x + dx < 28 && 0 <= y + dy && y + dy < 28){
                let shade = canvasData[(y + dy) * 28 + (x + dx)]
                context.fillStyle = `hsl(0, 0%, ${100 - shade * 100}%)`
                context.fillRect(x + dx, y + dy, 1, 1)
            }
        }
    }
}
 
var prevX = 0
var prevY = 0
canvas.addEventListener("mousedown", function(evt){
    let boundingBox = (evt.target as HTMLElement).getBoundingClientRect()
    const x = (evt.clientX - boundingBox.left) / boundingBox.width * 28.0
    const y = (evt.clientY - boundingBox.top) / boundingBox.height * 28.0
    prevX = Math.floor(x)
    prevY = Math.floor(y)
    switch (evt.button){
        case 0: {
            state = State.Draw
            break
        }
        case 2: {
            state = State.Erase
            break
        }
    }
}, true)

canvas.addEventListener("mousemove", function(evt){
    let boundingBox = (evt.target as HTMLElement).getBoundingClientRect()
    const x = (evt.clientX - boundingBox.left) / boundingBox.width * 28.0
    const y = (evt.clientY - boundingBox.top) / boundingBox.height * 28.0
    if(state == State.Draw){
        line(prevX,prevY,x,y,draw)
    }
    if(state == State.Erase){
        line(prevX,prevY,x,y,erase)
    }
    prevX = Math.floor(x)
    prevY = Math.floor(y)
})

canvas.addEventListener("mouseup", function(evt){
    state = State.None
})

context.fillStyle = "rgb(255,255,255)"
context.fillRect(0, 0, 28, 28)
var modelParameters: number[]
fetch('./models/model60.csv')
.then(r => r.text().then(csvText => {
    modelParameters = csvText.split(',')
    .map(x => parseFloat(x))
}))

const seven = [
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	84,	185,	159,	151,	60,	36,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	222,	254,	254,	254,	254,	241,	198,	198,	198,	198,	198,	198,	198,	198,	170,	52,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	67,	114,	72,	114,	163,	227,	254,	225,	254,	254,	254,	250,	229,	254,	254,	140,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	17,	66,	14,	67,	67,	67,	59,	21,	236,	254,	106,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	83,	253,	209,	18,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	22,	233,	255,	83,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	129,	254,	238,	44,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	59,	249,	254,	62,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	133,	254,	187,	5,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	9,	205,	248,	58,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	126,	254,	182,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	75,	251,	240,	57,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	19,	221,	254,	166,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	3,	203,	254,	219,	35,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	38,	254,	254,	77,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	31,	224,	254,	115,	1,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	133,	254,	254,	52,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	61,	242,	254,	254,	52,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	121,	254,	254,	219,	40,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	121,	254,	207,	18,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
    0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0
].map(x => x/256)

function predict(): number|null {
    let weight12 = modelParameters.slice(0, 785 * 16)
    let weight23 = modelParameters.slice(785 * 16, 785 * 16 + 17 * 10)
    if(modelParameters.length != 0){
        let layer1 = canvasData.map(x => x)
        layer1.unshift(1)
        let layer2: number[] = []
        for(let row = 0; row < 16; row++){
            let entry = 0
            for(let col = 0; col < 785; col++){
                entry += layer1[col] * weight12[row + col * 16]
            }
            layer2.push(entry)
        }
        layer2 = layer2.map(x => 1.0 / (1.0 + Math.exp(-x)))
        layer2.unshift(1)
        let layer3: number[] = []
        for(let row = 0; row < 10; row++){
            let entry = 0
            for(let col = 0; col < 17; col++){
                entry += layer2[col] * weight23[row + col * 10]
            }
            layer3.push(entry)
        }
        layer3 = layer3.map(x => 1.0 / (1.0 + Math.exp(-x)))
        const maxValue = Math.max(...layer3)
        return layer3.indexOf(maxValue)
    }
    return null
}

setInterval(() => d3.select('#prediction').text(`Predicted Number: ${predict()}`),1000)