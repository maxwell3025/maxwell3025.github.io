let width = 800;
let height = 600;
const dt = 0.004;
const G = 10000;
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
    new Planet(0,    0, 0, 0,   1000),
    new Planet(1000, 0, 0, 100, 10)
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

window.onload = ()=>{
    //add circles and svg
    svg = d3.select('#window').append('svg').
    lower().
    attr('viewBox', [-1000, -1000, 2000, 2000]);
    planets.forEach(element => {
        svg.append('circle').
        attr('cx', element.xPos).
        attr('cy', element.yPos).
        attr('r', Math.sqrt(element.mass)).
        attr('class', 'planet');
    });

    planetElems = d3.selectAll('.planet');
    counter = d3.select('#counter')
    let t = 0;
    setInterval(()=>{
        //update simulation
        updateSim();
        //bind data
        planetElems.data(planets)
        planetElems
        .attr('cx', planet=>planet.xPos)
        .attr('cy', planet=>planet.yPos)
        .attr('r', planet=>Math.sqrt(planet.mass))
        t+=4;
        if(t%1000==0){
            console.log(planets);
            counter.text(`simulation is ${d3.now()-t}ms behind real-time`);
        }
    }
    , 4);//4ms is min delay
}