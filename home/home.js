class PhysicsBall{
    constructor(image, link, title) {
        this.image = image;
        this.link = link;
        this.title = title;
        //this.x = Math.random();
        //this.y = Math.random();
        //this.a = Math.random() * Math.PI * 2;
        //this.r = Math.random() * 0.25;
        this.x = 0.5;
        this.y = 0.5;
        this.a = 0;
        this.r = 0.25;
        this.vx = 0;
        this.vy = 0;
        this.va = 0;
    }
}

window.onload = () => {
    let projectMenu = d3.select("#project_menu");
    let ballList = [];

    ballList.push(new PhysicsBall("/resources/thumbnail-gravity-sim.png", "../gravity", "Gravity Simulation"));

    let renderedBalls = projectMenu.selectAll(".ball")
    .data(ballList)
    .enter()
    .append("g")
    .attr("transform", function(data){return `translate(${data.x * 100}, ${data.y * 100}) scale(${data.r}, ${data.r}) rotate(${data.a * 180 / Math.PI}, 0, 0)`});

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
        .attr("clip-path", "url(#circle-clip)")

        currentBall.append("rect")
        .attr("x",-50)
        .attr("y",-4)
        .attr("width",100)
        .attr("height",8)
        .attr("clip-path", "url(#circle-clip)")
        .classed("appearOnHover", true)

        currentBall.append("text")
        .attr("x",0)
        .attr("y",0)
        .classed("appearOnHover", true)
        .classed("label", true)
        .text(data.title)
    });
}
