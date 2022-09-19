import { parse } from 'csv-parse'
const canvas = document.getElementById("draw-canvas") as HTMLCanvasElement
const context = canvas.getContext("2d")!
canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
}, false);

canvas.addEventListener("mousedown", function(evt){
    let boundingBox = (evt.target as HTMLElement).getBoundingClientRect()
    const x = (evt.clientX - boundingBox.left) / boundingBox.width * 28.0
    const y = (evt.clientY - boundingBox.top) / boundingBox.height * 28.0

    console.log(`x: ${x}`)
    console.log(`y: ${y}`)
}, true)
context.fillStyle = "rgb(255,255,255)"
context.fillRect(0, 0, 28, 28)
