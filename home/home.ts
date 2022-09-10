import * as d3 from "d3";

const g = 1;

type Vec2 = [number, number]

class RigidBody{
    x: number
    y: number
    a: number
    vx: number
    vy: number
    va: number
    m: number
    i: number
    constructor(){
        this.x = 0
        this.y = 0
        this.a = 0
        this.vx = 0
        this.vy = 0
        this.va = 0
        this.m = 1
        this.i = 1
    }

    get pos(): Vec2{
        return [this.x, this.y]
    }

    get energy(): number {
        return (
            0.5 * this.i * this.va * this.va +
            0.5 * this.m * this.vx * this.vx +
            0.5 * this.m * this.vy * this.vy -
            this.y * g
        )
    }
    
    vel(pos: Vec2 = this.pos): Vec2{
        let diff = sub(pos, this.pos)
        return [this.vx - this.va * diff[1], this.vy + this.va * diff[0]]
    }
    
    step(dt: number){
        this.x += this.vx * dt
        this.y += this.vy * dt + dt * dt * 0.5 * g;
        this.a += this.va * dt
        this.vy += g * dt
    }

    applyImpulse(pos: Vec2, imp: Vec2){
        let dist: Vec2 = sub(pos, this.pos)
        this.va += (imp[1] * dist[0] - imp[0] * dist[1])/this.i
        this.vx += imp[0]/this.m
        this.vy += imp[1]/this.m
    }

    effectiveMass(pos: Vec2, axis: Vec2){
        let diff = sub(pos, this.pos)
        return 1.0/(1./this.m + (dot(diff, diff) - dot(axis, diff) * dot(axis, diff) / dot(axis, axis)) / this.i)
    }

    collide(pos: Vec2, norm: Vec2, other?: RigidBody){
        if(other){
            let collisionVel = proj(sub(other.vel(pos), this.vel(pos)), norm)
            let selfMass = this.effectiveMass(pos, norm)
            let otherMass = other.effectiveMass(pos, norm)
            let impulse = scale(collisionVel, 2 * selfMass * otherMass / (selfMass + otherMass))
            this.applyImpulse(pos, impulse)
            other.applyImpulse(pos, scale(impulse, -1))
        } else {
            let collisionVel = proj(scale(this.vel(pos), -1), norm)
            let selfMass = this.effectiveMass(pos, norm)
            let impulse = scale(collisionVel, 2 * selfMass)
            this.applyImpulse(pos, impulse)
        }
    }
}

class Card{
    image: string
    link: string
    title: string
    r: number
    physics: RigidBody
    constructor(image: string, link: string, title: string) {
        this.image = image;
        this.link = link;
        this.title = title;
        this.physics = new RigidBody
        this.physics.x = 0;
        this.physics.y = 0;
        this.physics.a = Math.random() * Math.PI * 2;
        this.r = 0.25
        this.physics.m = this.r * this.r * 4
        this.physics.i = 1./12. * this.physics.m * (this.r * this.r * 8)
        let angle = Math.random() * Math.PI * 2
        this.physics.vx = Math.cos(angle) * 2
        this.physics.vy = Math.sin(angle) * 2
        this.physics.va = 0
    }

    get pos(): Vec2{
        return [this.physics.x, this.physics.y]
    }
    
    get vel(): Vec2{
        return [this.physics.vx, this.physics.vy]
    }

    get x(){
        return this.physics.x
    }

    get y(){
        return this.physics.y
    }

    get a(){
        return this.physics.a
    }
    corners(): Vec2[]{
        let axisA: Vec2 = [Math.cos(this.physics.a) * this.r, Math.sin(this.physics.a) * this.r]
        let axisB: Vec2 = [-Math.sin(this.physics.a) * this.r, Math.cos(this.physics.a) * this.r]
        return [
            add(add(this.physics.pos, axisA), axisB),
            sub(add(this.physics.pos, axisA), axisB),
            add(sub(this.physics.pos, axisA), axisB),
            sub(sub(this.physics.pos, axisA), axisB)
        ]
    }

    norm(point: Vec2): Vec2|null{
        let diff = sub(point, this.pos)
        let relativeCoords: Vec2 = [
            diff[0] * Math.cos(this.physics.a) + diff[1] * Math.sin(this.physics.a),
            diff[1] * Math.cos(this.physics.a) - diff[0] * Math.sin(this.physics.a)
        ]
        if(Math.abs(relativeCoords[0]) > this.r || Math.abs(relativeCoords[1]) > this.r){
            return null
        }
        if(relativeCoords[0] + relativeCoords[1] > 0){
            if(relativeCoords[0] > relativeCoords[1]){
                return [Math.cos(this.physics.a), Math.sin(this.physics.a)]
            } else {
                return [-Math.sin(this.physics.a), Math.cos(this.physics.a)]
            }
        }else{
            if(relativeCoords[0] > relativeCoords[1]){
                return [Math.sin(this.physics.a), -Math.cos(this.physics.a)]
            } else {
                return [-Math.cos(this.physics.a), -Math.sin(this.physics.a)]
            }
        }
    }
}

const dot = (a: Vec2, b: Vec2): number => {
    return a[0] * b[0] + a[1] * b[1]
}

const scale = (a: Vec2, scale: number): Vec2 => {
    return [a[0] * scale, a[1] * scale]
}

const proj = (a: Vec2, b: Vec2): Vec2 => {
    return scale(b, dot(a, b) / dot(b, b))
}

const add = (a: Vec2, b: Vec2): Vec2 => {
    return [a[0] + b[0], a[1] + b[1]]
}

const sub = (a: Vec2, b: Vec2): Vec2 => {
    return [a[0] - b[0], a[1] - b[1]]
}

const stepPhysics = (ballList: Card[], dt: number, aspectRatio: number) => {
    ballList.forEach(ball => {
        //direct integration
            ball.physics.step(dt)
        //wall collisions
            ball.corners().forEach(corner => {
                if(corner[1] < -1 && ball.physics.vel(corner)[1] < 0){
                    ball.physics.collide(corner, [0, 1])
                }
                if(corner[1] > 1 && ball.physics.vel(corner)[1] > 0){
                    ball.physics.collide(corner, [0, 1])
                }
                if(corner[0] < -aspectRatio && ball.physics.vel(corner)[0] < 0){
                    ball.physics.collide(corner, [1, 0])
                }
                if(corner[0] > aspectRatio && ball.physics.vel(corner)[0] > 0){
                    ball.physics.collide(corner, [1, 0])
                }
            })
        //other ball collisions
            ballList.forEach(other => {
                if(ball != other){
                    other.corners().forEach(corner => {
                        let norm = ball.norm(corner)
                        if(norm){
                            if(dot(norm, sub(ball.physics.vel(corner), other.physics.vel(corner))) > 0)
                            ball.physics.collide(corner, norm, other.physics)
                        }
                    })
                }
            })
    });

    console.log(ballList.map(ball => ball.physics.energy).reduce((a, b) => a + b))
}

const frameDelay = 42 //24 fps

window.onload = () => {
    let projectMenu = d3.select("#project_menu");
    let ballList: Card[] = [];

    ballList.push(new Card("/resources/thumbnail-gravity.png", "../gravity", "Gravity Simulation"))
    ballList.push(new Card("/resources/thumbnail-wall.png", "../wall", "Chat Wall"))
    ballList.push(new Card("/resources/thumbnail-button.png", "../button", "Voting Button"))
    ballList.push(new Card("/resources/nerd_face.png", "", ""))
    let svgNode: Element = projectMenu.node()! as Element;
    let svgDimensions = svgNode.getBoundingClientRect()
    let aspectRatio = svgDimensions.width/svgDimensions.height
    ballList.forEach((card, index, list) => {
        card.physics.x = aspectRatio * (2./list.length * index - 1 + 1./list.length)
    })
    
    let renderedBalls = projectMenu.selectAll(".ball")
        .data(ballList)
        .enter()
        .append("g")
        .attr("transform", function(data){return `translate(${data.x * 100}, ${data.y * 100}) scale(${data.r * 2}, ${data.r * 2}) rotate(${data.a * 180 / Math.PI}, 0, 0)`});

    renderedBalls.each(function (data, index) {
        let currentBall = d3.select(this)
            .classed("thumb", true)

        .append("a")
            .attr("href", data.link);

        currentBall.append("image")
            .attr("x", -50)
            .attr("y", -50)
            .attr("width", 100)
            .attr("height", 100)
            .attr("href", data.image)
            //.attr("clip-path", "url(#circle-clip)")

        if(data.title != ""){
            currentBall.append("rect")
                .attr("x",-50)
                .attr("y",-4)
                .attr("width",100)
                .attr("height",8)
                //.attr("clip-path", "url(#circle-clip)")
                .classed("appearOnHover", true)

            currentBall.append("text")
                .attr("x",0)
                .attr("y",0)
                .classed("appearOnHover", true)
                .classed("label", true)
                .text(data.title)
        }
    });

    setInterval(() => {
        let svgNode: Element = projectMenu.node()! as Element;
        let svgDimensions = svgNode.getBoundingClientRect()
        let aspectRatio = svgDimensions.width/svgDimensions.height
        projectMenu.attr("viewBox", `${-aspectRatio * 100} -100 ${aspectRatio * 200} 200`);

        stepPhysics(ballList, frameDelay * 0.001, aspectRatio);

        renderedBalls
            .transition()
            .duration(frameDelay)
            .ease(d3.easeLinear)
            .attr("transform", function(data){return `translate(${data.x * 100}, ${data.y * 100}) scale(${data.r * 2}, ${data.r * 2}) rotate(${data.a * 180 / Math.PI}, 0, 0)`});
    }, frameDelay)
}
