let width = 800;
let height = 600;
const dt = 0.004;
const G = 1000;
class Planet{
    xPos;
    yPos;
    xVel;
    yVel;
    mass;
    constructor(xPos, yPos, xVel, yVel, mass){
        this.xPos = xPos
        this.yPos = yPos
        this.xVel = xVel
        this.yVel = yVel
        this.mass = mass;
    }
    update(){
        this.xPos += this.xVel*dt;
        this.yPos += this.yVel*dt;
    }
}

//iniitalize simulation
let planets = [
    new Planet(0,    0, 0, -0.556,  10000),
    new Planet(1000, 0, 0, 100, 10),
    new Planet(750,  0, 0, 115,  10),
    new Planet(500,  0, 0, 141,  10),
    new Planet(250,  0, 0, 200,  10)
]

function updateSim(){
    planets.forEach((a, indexA)=>{
        planets.forEach((b, indexB)=>{
            if(indexA!==indexB){
                dx = (b.xPos-a.xPos);
                dy = (b.yPos-a.yPos);
                dist = Math.sqrt(dx*dx+dy*dy);
                a.xVel += dt*G*b.mass*dx/(dist*dist*dist)
                a.yVel += dt*G*b.mass*dy/(dist*dist*dist)
            }
        });
    });
    planets.forEach(planet=>{
        planet.update();
    });
}
let svg;

function stretchSim(){
    minDim = Math.min(window.innerWidth,window.innerHeight);
    svg.attr("viewBox", `-${window.innerWidth*1000/minDim} -${window.innerHeight*1000/minDim} ${window.innerWidth*2000/minDim} ${window.innerHeight*2000/minDim}`);
}

window.onload = ()=>{
    //add circles and svg
    svg = d3.select('#simulation');

    var downX;
    var downY;
    svg.on("mousedown", event=>{
        [downX, downY] = d3.pointer(event,svg.node());
    });

    svg.on("mouseup", event=>{
        console.log("click");
        let [upX, upY] = d3.pointer(event,svg.node());
        planets.push(new Planet(downX, downY, downX-upX, downY-upY, 100));
        planetElems = svg.selectAll('circle')
        .data(planets)
        .enter()
        .append("circle")
        .attr('class', 'planet')
        .merge(planetElems);
        console.log(planetElems);
    });
    stretchSim();

    //bind data
    var planetElems = svg.selectAll('circle')
    .data(planets)
    .enter()
    .append("circle")
    .attr('class', 'planet');

    counter = d3.select('#counter');
    let t = 0;
    setInterval(()=>{
        //update simulation
        updateSim();
        planetElems
        .attr('cx', planet=>planet.xPos)
        .attr('cy', planet=>planet.yPos)
        .attr('r', planet=>Math.sqrt(planet.mass));
        //update counter
        t+=4;
        if(t%1000==0){
            console.log(planets);
            counter.text(`simulation is ${d3.now()-t}ms behind real-time`);
        }
    }
    , 4);//4ms is min delay
}

window.onresize = ()=>{
    stretchSim();
}
