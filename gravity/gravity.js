//data types
class Planet {
    xPos;
    yPos;
    xVel;
    yVel;
    mass;
    radius;
    constructor(xPos, yPos, xVel, yVel, mass, radius) {
        this.xPos = xPos
        this.yPos = yPos
        this.xVel = xVel
        this.yVel = yVel
        this.mass = mass;
        this.radius = radius;
    }
    update() {
        this.xPos += this.xVel * dt;
        this.yPos += this.yVel * dt;
    }
}

const ProgramState = {
    Default: "Default",
    Deleting: "Deleting",
    Creating: "Creating",
}

//iniitalize variables
//DOM vars
var svg;
var planetShapes;
var newPlanetShape;
var velocityLine;
var coordLabel;
var gui;
var params = {
    currentMass: 100,
    currentRadius: 10
}
//simulation vars
const dt = 0.004;
const G = 1000;
var width = 800;
var height = 600;
var downX;
var downY;
var running = true;
var state = ProgramState.Default;
var planets = [
    new Planet(0,    0, 0, 0,   10000, 100),
    new Planet(1000, 0, 0, 100, 0,     10),
    new Planet(750,  0, 0, 115, 0,     10),
    new Planet(500,  0, 0, 141, 0,     10),
    new Planet(250,  0, 0, 200, 0,     10)
]

//functions
function updateSim() {
    planets.forEach((a, indexA) => {
        planets.forEach((b, indexB) => {
            if (indexA !== indexB) {
                dx = (b.xPos - a.xPos);
                dy = (b.yPos - a.yPos);
                dist = Math.sqrt(dx * dx + dy * dy);
                a.xVel += dt * G * b.mass * dx / (dist * dist * dist)
                a.yVel += dt * G * b.mass * dy / (dist * dist * dist)
            }
        });
    });
    planets.forEach(planet => {
        planet.update();
    });
}

function stretchSim() {
    minDim = Math.min(window.innerWidth, window.innerHeight);
    svg.attr("viewBox", `-${window.innerWidth * 1000 / minDim} -${window.innerHeight * 1000 / minDim} ${window.innerWidth * 2000 / minDim} ${window.innerHeight * 2000 / minDim}`);
}

function bindData() {
    planetShapes = svg.selectAll('.planet')
        .data(planets)
        .enter()
        .append("circle")
        .attr('class', 'planet')
        .on('mousedown', planetClicked)
        .merge(planetShapes);
}

function planetClicked(event, data) {
    if (state == ProgramState.Deleting) {
        planets = planets.filter(planet=>planet!=data);
        planetShapes.data(planets).exit().remove();
    }
}
//actions
window.onresize = () => {
    stretchSim();
}

window.onload = () => {
    //add d3 elements
    svg = d3.select('#simulation');

    planetShapes = svg.selectAll('.planet');

    newPlanetShape = svg.append('circle')
    .style('visibility', 'hidden')
    .style('fill', '#ff0000');

    velocityLine = svg.append('line')
    .style('visibility', 'hidden')
    .style('stroke', '#ff0000');

    coordLabel = svg.append('text')
    .style('text-anchor', 'middle')
    .style('dominant-baseline', 'central')
    .style('fill', '#ffffff')
    .style('pointer-events', 'none')
    .style('user-select', 'none')


    //generate gui
    var gui = new dat.GUI({ autoPlace: false });
    var settings = gui.addFolder('Planet Settings');
        settings.add(params, 'currentMass', 0, 100).name('mass');
        settings.add(params, 'currentRadius', 10, 100).name('radius');
    var controls = gui.addFolder('Controls');
        controls.add({_:"Delete Planet"}, '_').name('ctrl+click');
        controls.add({_:"Create Planet With Velocity"}, '_').name('click+drag');
        controls.add({_:"Pause/Unpause"}, '_').name('space');

    gui.domElement.id = 'gui';
    d3.select('body').node().appendChild(gui.domElement);
    //events
    d3.select("body").on("keydown", event => {
        if (event.code == 'Space') {
            //toggle running
            if (running) {
                running = false;
                d3.select("#run_indicator").attr("src", "../resources/run.png");
            } else {
                running = true;
                d3.select("#run_indicator").attr("src", "../resources/pause.png");
            }
        }
        if (event.code == 'ControlLeft' | event.code == 'ControlRight') {
            if (state == ProgramState.Default) {
                state = ProgramState.Deleting;
            }
        }
    });

    d3.select("body").on("keyup", event => {
        if (event.code == 'ControlLeft' | event.code == 'ControlRight') {
            if (state == ProgramState.Deleting) {
                state = ProgramState.Default;
            }
        }
    });
    svg.on("mousedown", event => {
        if (state == ProgramState.Default) {
            state = ProgramState.Creating;
            //store creation point
            [downX, downY] = d3.pointer(event, svg.node());
            newPlanetShape = newPlanetShape
            .attr('cx', downX)
            .attr('cy', downY)
            .attr('r', params.currentRadius)
            .style('visibility', 'visible');
            velocityLine = velocityLine
            .attr('x1', downX)
            .attr('y1', downY)
            .attr('x2', downX)
            .attr('y2', downY)
            .style('visibility', 'visible');
        }
    });

    svg.on("mousemove", event => {
        let [mouseX, mouseY] = d3.pointer(event, svg.node());
        //update label
        coordLabel = coordLabel
        .attr('x', mouseX)
        .attr('y', mouseY-20)
        if (state == ProgramState.Creating) {
            //show velocity when creating
            coordLabel = coordLabel
            .text(`(${(downX-mouseX).toFixed(2)}, ${(downY-mouseY).toFixed(2)})`);
        }else{
            coordLabel = coordLabel
            .text(`(${mouseX.toFixed(2)}, ${mouseY.toFixed(2)})`);
        }
        
        //update line
        if (state == ProgramState.Creating) {
            velocityLine = velocityLine
            .attr('x2', mouseX)
            .attr('y2', mouseY);
        }
    });

    svg.on("mouseup", event => {
        //create and render new planet
        if (state == ProgramState.Creating) {
            state = ProgramState.Default;
            let [upX, upY] = d3.pointer(event, svg.node());
            planets.push(new Planet(downX, downY, downX - upX, downY - upY, params.currentMass, params.currentRadius));
            bindData();
            console.log(planetShapes);
            //remove old shapes
            newPlanetShape = newPlanetShape
            .style('visibility', 'hidden');
            velocityLine = velocityLine
            .style('visibility', 'hidden');
        }
    });
    stretchSim();

    //bind data
    bindData();

    counter = d3.select('#counter');
    let t = 0;
    setInterval(() => {
        //update simulation
        if (running) updateSim();
        planetShapes
            .attr('cx', planet => planet.xPos)
            .attr('cy', planet => planet.yPos)
            .attr('r', planet => planet.radius);
        //update counter
        t += 4;
        if (t % 1000 == 0) {
            console.log(planets);
            console.log(`state: ${state}`);
            counter.text(`simulation is ${d3.now() - t}ms behind real-time`);
        }
    }
    , 4);//4ms is min delay
}

