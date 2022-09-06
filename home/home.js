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
    class PhysicsBall {
        constructor(image, link, title) {
            this.image = image;
            this.link = link;
            this.title = title;
            this.x = Math.random();
            this.y = Math.random();
            this.a = Math.random() * Math.PI * 2;
            this.r = Math.random() * 0.125 + 0.125;
            //this.x = 0.5;
            //this.y = 0.5;
            //this.a = 0;
            //this.r = 0.25;
            this.vx = 0;
            this.vy = 0;
            this.va = 0;
        }
        get pos() {
            return [this.x, this.y];
        }
        get vel() {
            return [this.vx, this.vy];
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
    const sub = (a, b) => {
        return [a[0] - b[0], a[1] - b[1]];
    };
    const stepPhysics = (ballList, dt, aspectRatio) => {
        ballList.forEach(ball => {
            //direct integration
            ball.x += dt * ball.vx;
            ball.y += dt * ball.vy + 0.5 * dt * dt * g;
            ball.vx += 0;
            ball.vy += dt * g;
            ball.a += dt * ball.va;
            //wall collisions
            if (ball.y - ball.r * 0.5 < 0) {
                ball.vy = Math.abs(ball.vy);
            }
            if (ball.y + ball.r * 0.5 > 1) {
                ball.vy = -Math.abs(ball.vy);
            }
            if (ball.x - ball.r * 0.5 < 0) {
                ball.vx = Math.abs(ball.vx);
            }
            if (ball.x + ball.r * 0.5 > aspectRatio) {
                ball.vx = -Math.abs(ball.vx);
            }
            //other ball collisions
            ballList.forEach(other => {
                if (ball != other) {
                    let dx = ball.x - other.x;
                    let dy = ball.y - other.y;
                    let rTotal = ball.r * 0.5 + other.r * 0.5;
                    if (dx * dx + dy * dy <= rTotal * rTotal && dot(sub(ball.vel, other.vel), sub(ball.pos, other.pos)) <= 0) {
                        //head-on collision math
                        let velocityProjA = proj(ball.vel, [dx, dy]);
                        let velocityProjB = proj(other.vel, [dx, dy]);
                        let ma = ball.r * ball.r;
                        let mb = other.r * other.r;
                        let changeVA = scale(sub(velocityProjB, velocityProjA), 2 * mb / (ma + mb));
                        let changeVB = scale(sub(velocityProjA, velocityProjB), 2 * ma / (ma + mb));
                        //update velocities
                        ball.vx += changeVA[0];
                        ball.vy += changeVA[1];
                        other.vx += changeVB[0];
                        other.vy += changeVB[1];
                    }
                }
            });
        });
    };
    window.onload = () => {
        let projectMenu = d3__namespace.select("#project_menu");
        let ballList = [];
        ballList.push(new PhysicsBall("/resources/thumbnail-gravity.png", "../gravity", "Gravity Simulation"));
        ballList.push(new PhysicsBall("/resources/thumbnail-wall.png", "../wall", "Chat Wall"));
        ballList.push(new PhysicsBall("/resources/thumbnail-button.png", "../button", "Voting Button"));
        ballList.push(new PhysicsBall("/resources/nerd_face.png", "", ""));
        let renderedBalls = projectMenu.selectAll(".ball")
            .data(ballList)
            .enter()
            .append("g")
            .attr("transform", function (data) { return `translate(${data.x * 100}, ${data.y * 100}) scale(${data.r}, ${data.r}) rotate(${data.a * 180 / Math.PI}, 0, 0)`; });
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
            projectMenu.attr("viewBox", `0 0 ${aspectRatio * 100} 100`);
            renderedBalls
                .attr("transform", function (data) { return `translate(${data.x * 100}, ${data.y * 100}) scale(${data.r}, ${data.r}) rotate(${data.a * 180 / Math.PI}, 0, 0)`; });
            stepPhysics(ballList, 0.004, aspectRatio);
        }, 4);
    };

})(d3);