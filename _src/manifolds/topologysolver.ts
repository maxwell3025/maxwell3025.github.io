import { Vec3, Vec2 } from './geometry';

export class GeoMesh {
  points: Vec3[];
  connections: Vec3[]; //a, b, desired length
  triangles: Vec3[];
  constructor() {this.points = [], this.connections = [], this.triangles = []}
  clone(): GeoMesh {
    let out = new GeoMesh();
    out.points = this.points.map(a => a.clone());
    out.connections = this.connections.map(a => a.clone());
    out.triangles = this.triangles.map(a => a.clone());
    return out;
  }
  loss(): number {
    let sum = 0;
    this.connections.forEach(connection => {
      let a = this.points[connection.x];
      let b = this.points[connection.y];
      let dist = b.sub(a).r;
      let edgeLoss = (dist - connection.z) * (dist - connection.z);
      sum += edgeLoss;
    });
    return sum;
  }
  step(dt): GeoMesh {
    let positionChange: Vec3[] = [];
    for (let _ = 0; _ < this.points.length; _++) {
      positionChange.push(new Vec3(0, 0, 0));
    }
    this.connections.forEach(connection => {
      let a = this.points[connection.x];
      let b = this.points[connection.y];
      let diff = b.sub(a);
      positionChange[connection.x] = positionChange[connection.x].sub(diff);
      positionChange[connection.y] = positionChange[connection.y].add(diff);
    });
    let out = this.clone();
    for (let i = 0; i < out.points.length; i++) {
      out.points[i] = out.points[i].add(positionChange[i].mul(dt));
    }
    return out;
  }
}
