//data types
class Planet {
    xPos;
    yPos;
    xVel;
    yVel;
    mass;
    constructor(xPos, yPos, xVel, yVel, mass) {
        this.xPos = xPos
        this.yPos = yPos
        this.xVel = xVel
        this.yVel = yVel
        this.mass = mass;
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
const dt = 0.004;
const G = 1000;
var width = 800;
var height = 600;
var svg;
var planetElems;
var marker;
var velocityLine;
var downX;
var downY;
var running = true;
var state = ProgramState.Default;
var planets = [
    new Planet(0,    0, 0, -0.556, 10000),
    new Planet(1000, 0, 0, 100,    10),
    new Planet(750,  0, 0, 115,    10),
    new Planet(500,  0, 0, 141,    10),
    new Planet(250,  0, 0, 200,    10)
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
    planetElems = svg.selectAll('.planet')
        .data(planets)
        .enter()
        .append("circle")
        .attr('class', 'planet')
        .on('mousedown', planetClicked)
        .merge(planetElems);
}

function planetClicked(event, data) {
    if (state == ProgramState.Deleting) {
        planets = planets.filter(planet=>planet!=data);
        planetElems.data(planets).exit().remove();
    }
}
//actions
window.onresize = () => {
    stretchSim();
}

window.onload = () => {
    //add circles and svg
    svg = d3.select('#simulation');
    planetElems = svg.selectAll('.planet');
    marker = svg.append('circle')
    .style('visibility', 'hidden')
    .style('fill', '#ff0000');
    velocityLine = svg.append('line')
    .style('visibility', 'hidden')
    .style('stroke', '#ff0000');

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
            marker = marker
            .attr('cx', downX)
            .attr('cy', downY)
            .attr('r', '10')
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
        if (state == ProgramState.Creating) {
            let [mouseX, mouseY] = d3.pointer(event, svg.node());
            velocityLine = velocityLine
            .attr('x2', mouseX)
            .attr('y2', mouseY);
        }
    });

    svg.on("mouseup", event => {
        if (state == ProgramState.Creating) {
            state = ProgramState.Default;
            //create and render new planet
            let [upX, upY] = d3.pointer(event, svg.node());
            marker = marker
            .style('visibility', 'hidden');
            velocityLine = velocityLine
            .style('visibility', 'hidden');
            planets.push(new Planet(downX, downY, downX - upX, downY - upY, 100));
            bindData();
            console.log(planetElems);
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
        planetElems
            .attr('cx', planet => planet.xPos)
            .attr('cy', planet => planet.yPos)
            .attr('r', planet => Math.sqrt(planet.mass));
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

