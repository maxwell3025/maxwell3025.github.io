(function (d3) {
    'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var d3__namespace = /*#__PURE__*/_interopNamespace(d3);

    const g = 1;
    class RigidBody {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.a = 0;
            this.vx = 0;
            this.vy = 0;
            this.va = 0;
            this.m = 1;
            this.i = 1;
        }
        get pos() {
            return [this.x, this.y];
        }
        get energy() {
            return (0.5 * this.i * this.va * this.va +
                0.5 * this.m * this.vx * this.vx +
                0.5 * this.m * this.vy * this.vy -
                this.y * g);
        }
        vel(pos = this.pos) {
            let diff = sub(pos, this.pos);
            return [this.vx - this.va * diff[1], this.vy + this.va * diff[0]];
        }
        step(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt + dt * dt * 0.5 * g;
            this.a += this.va * dt;
            this.vy += g * dt;
        }
        applyImpulse(pos, imp) {
            let dist = sub(pos, this.pos);
            this.va += imp[1] * dist[0] - imp[0] * dist[1];
            this.vx += imp[0];
            this.vy += imp[1];
        }
        effectiveMass(pos, axis) {
            let diff = sub(pos, this.pos);
            return 1.0 / (1. / this.m + (dot(diff, diff) - dot(axis, diff) * dot(axis, diff) / dot(axis, axis)) / this.i);
        }
        collide(pos, norm, other) {
            if (other) {
                let collisionVel = proj(sub(other.vel(pos), this.vel(pos)), norm);
                let selfMass = this.effectiveMass(pos, norm);
                let otherMass = other.effectiveMass(pos, norm);
                let impulse = scale(collisionVel, 2 * selfMass * otherMass / (selfMass + otherMass));
                this.applyImpulse(pos, impulse);
                other.applyImpulse(pos, scale(impulse, -1));
            }
            else {
                let collisionVel = proj(scale(this.vel(pos), -1), norm);
                let selfMass = this.effectiveMass(pos, norm);
                let impulse = scale(collisionVel, 2 * selfMass);
                this.applyImpulse(pos, impulse);
            }
        }
    }
    class Card {
        constructor(image, link, title) {
            this.image = image;
            this.link = link;
            this.title = title;
            this.physics = new RigidBody;
            this.physics.x = 0;
            this.physics.y = 0;
            this.physics.a = Math.random() * Math.PI * 2;
            this.r = 0.25;
            let angle = Math.random() * Math.PI * 2;
            this.physics.vx = Math.cos(angle) * 2;
            this.physics.vy = Math.sin(angle) * 2;
            this.physics.va = 0;
        }
        get pos() {
            return [this.physics.x, this.physics.y];
        }
        get vel() {
            return [this.physics.vx, this.physics.vy];
        }
        get x() {
            return this.physics.x;
        }
        get y() {
            return this.physics.y;
        }
        get a() {
            return this.physics.a;
        }
        corners() {
            let axisA = [Math.cos(this.physics.a) * this.r, Math.sin(this.physics.a) * this.r];
            let axisB = [-Math.sin(this.physics.a) * this.r, Math.cos(this.physics.a) * this.r];
            return [
                add(add(this.physics.pos, axisA), axisB),
                sub(add(this.physics.pos, axisA), axisB),
                add(sub(this.physics.pos, axisA), axisB),
                sub(sub(this.physics.pos, axisA), axisB)
            ];
        }
        norm(point) {
            let diff = sub(point, this.pos);
            let relativeCoords = [
                diff[0] * Math.cos(this.physics.a) + diff[1] * Math.sin(this.physics.a),
                diff[1] * Math.cos(this.physics.a) - diff[0] * Math.sin(this.physics.a)
            ];
            if (Math.abs(relativeCoords[0]) > this.r || Math.abs(relativeCoords[1]) > this.r) {
                return null;
            }
            if (relativeCoords[0] + relativeCoords[1] > 0) {
                if (relativeCoords[0] > relativeCoords[1]) {
                    return [Math.cos(this.physics.a), Math.sin(this.physics.a)];
                }
                else {
                    return [-Math.sin(this.physics.a), Math.cos(this.physics.a)];
                }
            }
            else {
                if (relativeCoords[0] > relativeCoords[1]) {
                    return [Math.sin(this.physics.a), -Math.cos(this.physics.a)];
                }
                else {
                    return [-Math.cos(this.physics.a), -Math.sin(this.physics.a)];
                }
            }
        }
    }
    const dot = (a, b) => {
        return a[0] * b[0] + a[1] * b[1];
    };
    const scale = (a, scale) => {
        return [a[0] * scale, a[1] * scale];
    };
    const proj = (a, b) => {
        return scale(b, dot(a, b) / dot(b, b));
    };
    const add = (a, b) => {
        return [a[0] + b[0], a[1] + b[1]];
    };
    const sub = (a, b) => {
        return [a[0] - b[0], a[1] - b[1]];
    };
    const stepPhysics = (ballList, dt, aspectRatio) => {
        ballList.forEach(ball => {
            //direct integration
            ball.physics.step(dt);
            //wall collisions
            ball.corners().forEach(corner => {
                if (corner[1] < -1 && ball.physics.vel(corner)[1] < 0) {
                    ball.physics.collide(corner, [0, 1]);
                }
                if (corner[1] > 1 && ball.physics.vel(corner)[1] > 0) {
                    ball.physics.collide(corner, [0, 1]);
                }
                if (corner[0] < -aspectRatio && ball.physics.vel(corner)[0] < 0) {
                    ball.physics.collide(corner, [1, 0]);
                }
                if (corner[0] > aspectRatio && ball.physics.vel(corner)[0] > 0) {
                    ball.physics.collide(corner, [1, 0]);
                }
            });
            //other ball collisions
            ballList.forEach(other => {
                if (ball != other) {
                    other.corners().forEach(corner => {
                        let norm = ball.norm(corner);
                        if (norm) {
                            if (dot(norm, sub(ball.physics.vel(corner), other.physics.vel(corner))) > 0)
                                ball.physics.collide(corner, norm, other.physics);
                        }
                    });
                }
            });
        });
        console.log(ballList.map(ball => ball.physics.energy).reduce((a, b) => a + b));
    };
    window.onload = () => {
        let projectMenu = d3__namespace.select("#project_menu");
        let ballList = [];
        ballList.push(new Card("/resources/thumbnail-gravity.png", "../gravity", "Gravity Simulation"));
        ballList.push(new Card("/resources/thumbnail-wall.png", "../wall", "Chat Wall"));
        ballList.push(new Card("/resources/thumbnail-button.png", "../button", "Voting Button"));
        ballList.push(new Card("/resources/nerd_face.png", "", ""));
        let svgNode = projectMenu.node();
        let svgDimensions = svgNode.getBoundingClientRect();
        let aspectRatio = svgDimensions.width / svgDimensions.height;
        ballList.forEach((card, index, list) => {
            card.physics.x = aspectRatio * (2. / list.length * index - 1 + 1. / list.length);
        });
        let renderedBalls = projectMenu.selectAll(".ball")
            .data(ballList)
            .enter()
            .append("g")
            .attr("transform", function (data) { return `translate(${data.x * 100}, ${data.y * 100}) scale(${data.r * 2}, ${data.r * 2}) rotate(${data.a * 180 / Math.PI}, 0, 0)`; });
        renderedBalls.each(function (data, index) {
            let currentBall = d3__namespace.select(this)
                .classed("thumb", true)
                .append("a")
                .attr("href", data.link);
            currentBall.append("image")
                .attr("x", -50)
                .attr("y", -50)
                .attr("width", 100)
                .attr("height", 100)
                .attr("href", data.image);
            //.attr("clip-path", "url(#circle-clip)")
            if (data.title != "") {
                currentBall.append("rect")
                    .attr("x", -50)
                    .attr("y", -4)
                    .attr("width", 100)
                    .attr("height", 8)
                    //.attr("clip-path", "url(#circle-clip)")
                    .classed("appearOnHover", true);
                currentBall.append("text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .classed("appearOnHover", true)
                    .classed("label", true)
                    .text(data.title);
            }
        });
        setInterval(() => {
            let svgNode = projectMenu.node();
            let svgDimensions = svgNode.getBoundingClientRect();
            let aspectRatio = svgDimensions.width / svgDimensions.height;
            projectMenu.attr("viewBox", `${-aspectRatio * 100} -100 ${aspectRatio * 200} 200`);
            stepPhysics(ballList, 0.004, aspectRatio);
            renderedBalls
                .attr("transform", function (data) { return `translate(${data.x * 100}, ${data.y * 100}) scale(${data.r * 2}, ${data.r * 2}) rotate(${data.a * 180 / Math.PI}, 0, 0)`; });
        }, 4);
    };

})(d3);
