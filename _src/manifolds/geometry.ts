export class Vec2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  add(rhs: Vec2): Vec2 {
    return new Vec2(this.x + rhs.x, this.y + rhs.y);
  }
  sub(rhs: Vec2): Vec2 {
    return new Vec2(this.x - rhs.x, this.y - rhs.y);
  }
  dot(rhs: Vec2): number {
    return this.x * rhs.x + this.y * rhs.y;
  }
  mul(rhs: number): Vec2 {
    return new Vec2(this.x * rhs, this.y * rhs);
  }
  get r(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  clone(): Vec2{
    return new Vec2(this.x, this.y)
  }
  norm(): Vec2{
    return this.mul(1.0/this.r)
  }
}

export class Vec3 {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  add(rhs: Vec3): Vec3 {
    return new Vec3(this.x + rhs.x, this.y + rhs.y, this.z + rhs.z);
  }
  sub(rhs: Vec3): Vec3 {
    return new Vec3(this.x - rhs.x, this.y - rhs.y, this.z - rhs.z);
  }
  dot(rhs: Vec3): number {
    return this.x * rhs.x + this.y * rhs.y + this.z * rhs.z;
  }
  mul(rhs: number): Vec3 {
    return new Vec3(this.x * rhs, this.y * rhs, this.z * rhs);
  }
  get r(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  clone(): Vec3{
    return new Vec3(this.x, this.y, this.z)
  }
  norm(): Vec3{
    return this.mul(1.0/this.r)
  }
}
