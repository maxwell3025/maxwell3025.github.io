export type Vec2 = [number, number];

const g = 1;

export class RigidBody {
  x: number;
  y: number;
  a: number;
  vx: number;
  vy: number;
  va: number;
  m: number;
  i: number;
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

  get pos(): Vec2 {
    return [this.x, this.y];
  }

  get energy(): number {
    return (
      0.5 * this.i * this.va * this.va +
      0.5 * this.m * this.vx * this.vx +
      0.5 * this.m * this.vy * this.vy -
      this.y * g * this.m
    );
  }

  vel(pos: Vec2 = this.pos): Vec2 {
    let diff = sub(pos, this.pos);
    return [this.vx - this.va * diff[1], this.vy + this.va * diff[0]];
  }

  step(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt + dt * dt * 0.5 * g;
    this.a += this.va * dt;
    this.vy += g * dt;
  }

  applyImpulse(pos: Vec2, imp: Vec2) {
    let dist: Vec2 = sub(pos, this.pos);
    this.va += (imp[1] * dist[0] - imp[0] * dist[1]) / this.i;
    this.vx += imp[0] / this.m;
    this.vy += imp[1] / this.m;
  }

  effectiveMass(pos: Vec2, axis: Vec2) {
    let diff = sub(pos, this.pos);
    return (
      1.0 /
      (1 / this.m +
        (dot(diff, diff) -
          (dot(axis, diff) * dot(axis, diff)) / dot(axis, axis)) /
          this.i)
    );
  }

  collide(pos: Vec2, norm: Vec2, other?: RigidBody) {
    if (other) {
      let collisionVel = proj(sub(other.vel(pos), this.vel(pos)), norm);
      let selfMass = this.effectiveMass(pos, norm);
      let otherMass = other.effectiveMass(pos, norm);
      let impulse = scale(
        collisionVel,
        (2 * selfMass * otherMass) / (selfMass + otherMass)
      );
      this.applyImpulse(pos, impulse);
      other.applyImpulse(pos, scale(impulse, -1));
    } else {
      let collisionVel = proj(scale(this.vel(pos), -1), norm);
      let selfMass = this.effectiveMass(pos, norm);
      let impulse = scale(collisionVel, 2 * selfMass);
      this.applyImpulse(pos, impulse);
    }
  }
}

export const dot = (a: Vec2, b: Vec2): number => {
  return a[0] * b[0] + a[1] * b[1];
};

export const scale = (a: Vec2, scale: number): Vec2 => {
  return [a[0] * scale, a[1] * scale];
};

export const proj = (a: Vec2, b: Vec2): Vec2 => {
  return scale(b, dot(a, b) / dot(b, b));
};

export const add = (a: Vec2, b: Vec2): Vec2 => {
  return [a[0] + b[0], a[1] + b[1]];
};

export const sub = (a: Vec2, b: Vec2): Vec2 => {
  return [a[0] - b[0], a[1] - b[1]];
};