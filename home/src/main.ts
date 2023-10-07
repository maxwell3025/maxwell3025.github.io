import * as d3 from 'd3';
import cards from './cards.json';
import { RigidBody, Vec2, add, dot, sub } from './physics';

class Card {
  image: string;
  link: string;
  title: string;
  r: number;
  physics: RigidBody;
  constructor(image: string, link: string, title: string) {
    this.image = image;
    this.link = link;
    this.title = title;
    this.physics = new RigidBody();
    this.physics.x = 0;
    this.physics.y = 0;
    this.physics.a = Math.random() * Math.PI * 2;
    this.r = 0.25;
    this.physics.m = this.r * this.r * 4;
    this.physics.i = (1 / 12) * this.physics.m * (this.r * this.r * 8);
    let angle = Math.random() * Math.PI * 2;
    this.physics.vx = Math.cos(angle) * 2;
    this.physics.vy = Math.sin(angle) * 2;
    this.physics.va = 0;
  }

  get pos(): Vec2 {
    return [this.physics.x, this.physics.y];
  }

  get vel(): Vec2 {
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
  corners(): Vec2[] {
    let axisA: Vec2 = [
      Math.cos(this.physics.a) * this.r,
      Math.sin(this.physics.a) * this.r,
    ];
    let axisB: Vec2 = [
      -Math.sin(this.physics.a) * this.r,
      Math.cos(this.physics.a) * this.r,
    ];
    return [
      add(add(this.physics.pos, axisA), axisB),
      sub(add(this.physics.pos, axisA), axisB),
      add(sub(this.physics.pos, axisA), axisB),
      sub(sub(this.physics.pos, axisA), axisB),
    ];
  }

  norm(point: Vec2): Vec2 | null {
    let diff = sub(point, this.pos);
    let relativeCoords: Vec2 = [
      diff[0] * Math.cos(this.physics.a) + diff[1] * Math.sin(this.physics.a),
      diff[1] * Math.cos(this.physics.a) - diff[0] * Math.sin(this.physics.a),
    ];
    if (
      Math.abs(relativeCoords[0]) > this.r ||
      Math.abs(relativeCoords[1]) > this.r
    ) {
      return null;
    }
    if (relativeCoords[0] + relativeCoords[1] > 0) {
      if (relativeCoords[0] > relativeCoords[1]) {
        return [Math.cos(this.physics.a), Math.sin(this.physics.a)];
      } else {
        return [-Math.sin(this.physics.a), Math.cos(this.physics.a)];
      }
    } else {
      if (relativeCoords[0] > relativeCoords[1]) {
        return [Math.sin(this.physics.a), -Math.cos(this.physics.a)];
      } else {
        return [-Math.cos(this.physics.a), -Math.sin(this.physics.a)];
      }
    }
  }
}

const stepPhysics = (ballList: Card[], dt: number, aspectRatio: number) => {
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
            if (
              dot(
                norm,
                sub(ball.physics.vel(corner), other.physics.vel(corner))
              ) > 0
            )
              ball.physics.collide(corner, norm, other.physics);
          }
        });
      }
    });
  });

  console.log(
    ballList.map(ball => ball.physics.energy).reduce((a, b) => a + b)
  );
};

const frameDelay = 42; //24 fps

window.onload = () => {
  //setup footer
  const footerElement = document.getElementById("footer")!;
  cards.cards.forEach(({image, link, name}) => {
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", link);
    linkElement.classList.add("thumbnail-link")

    const thumb = document.createElement("img");
    thumb.setAttribute("src", image);
    thumb.classList.add("thumbnail-img")

    linkElement.appendChild(thumb);
    footerElement.appendChild(linkElement)
  })
  let ballList: Card[] = [];
  cards.cards.forEach(({image, link, name}) => {
    ballList.push(new Card(image, link, name));
  });
  let projectMenu = d3.select('#project_menu');
  ballList.push(new Card('./resources/nerd_face.png', '', ''));

  let svgNode: Element = projectMenu.node()! as Element;
  let svgDimensions = svgNode.getBoundingClientRect();
  let aspectRatio = svgDimensions.width / svgDimensions.height;
  ballList.forEach((card, index, list) => {
    card.physics.x =
      aspectRatio * ((2 / list.length) * index - 1 + 1 / list.length);
  });

  let renderedBalls = projectMenu
    .selectAll('.ball')
    .data(ballList)
    .enter()
    .append('g')
    .attr('transform', function (data) {
      return `translate(${
        data.x * 100
      }, ${data.y * 100}) scale(${data.r * 2}, ${data.r * 2}) rotate(${(data.a * 180) / Math.PI}, 0, 0)`;
    });

  renderedBalls.each(function (data, index) {
    let currentBall = d3
      .select(this)
      .classed('thumb', true)

      .append('a')
      .attr('href', data.link);

    currentBall
      .append('image')
      .attr('x', -50)
      .attr('y', -50)
      .attr('width', 100)
      .attr('height', 100)
      .attr('href', data.image);
    //.attr("clip-path", "url(#circle-clip)")

    if (data.title != '') {
      currentBall
        .append('rect')
        .attr('x', -50)
        .attr('y', -4)
        .attr('width', 100)
        .attr('height', 8)
        //.attr("clip-path", "url(#circle-clip)")
        .classed('appearOnHover', true);

      currentBall
        .append('text')
        .attr('x', 0)
        .attr('y', 0)
        .classed('appearOnHover', true)
        .classed('label', true)
        .text(data.title);
    }
  });

  setInterval(() => {
    let svgNode: Element = projectMenu.node()! as Element;
    let svgDimensions = svgNode.getBoundingClientRect();
    let aspectRatio = svgDimensions.width / svgDimensions.height;
    projectMenu.attr(
      'viewBox',
      `${-aspectRatio * 100} -100 ${aspectRatio * 200} 200`
    );

    stepPhysics(ballList, frameDelay * 0.001, aspectRatio);

    renderedBalls
      .transition()
      .duration(frameDelay)
      .ease(d3.easeLinear)
      .attr('transform', function (data) {
        return `translate(${
          data.x * 100
        }, ${data.y * 100}) scale(${data.r * 2}, ${data.r * 2}) rotate(${(data.a * 180) / Math.PI}, 0, 0)`;
      });
  }, frameDelay);
};
