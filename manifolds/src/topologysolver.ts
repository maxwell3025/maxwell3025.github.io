import { Vec3, Vec2 } from './geometry';

export class GeoMesh {
  points: Vec3[];
  connections: Vec3[]; //a, b, desired length
  triangles: Vec3[];
  flattenWeights: number[];
  constructor() {
    (this.points = []),
      (this.connections = []),
      (this.triangles = []),
      (this.flattenWeights = []);
  }
  clone(): GeoMesh {
    let out = new GeoMesh();
    out.points = this.points.map(a => a.clone());
    out.connections = this.connections.map(a => a.clone());
    out.triangles = this.triangles.map(a => a.clone());
    out.flattenWeights = this.flattenWeights.map(a => a);
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
    let derivative: Vec3[] = [];
    for (let _ = 0; _ < this.points.length; _++) {
      derivative.push(new Vec3(0, 0, 0));
    }
    this.connections.forEach(connection => {
      let a = this.points[connection.x];
      let b = this.points[connection.y];
      let difference = b.sub(a);
      let error = difference.r - connection.z;
      let connectionDerivative = difference.norm().mul(-error);
      derivative[connection.x] =
        derivative[connection.x].sub(connectionDerivative);
      derivative[connection.y] =
        derivative[connection.y].add(connectionDerivative);
    });
    let out = this.clone();
    for (let i = 0; i < out.points.length; i++) {
      out.points[i] = out.points[i].add(derivative[i].mul(dt));
    }
    return out;
  }
  flatten(dt): GeoMesh {
    let derivative: Vec3[] = [];
    for (let _ = 0; _ < this.points.length; _++) {
      derivative.push(new Vec3(0, 0, 0));
    }
    this.connections.forEach(connection => {
      let a = this.points[connection.x];
      let b = this.points[connection.y];
      let difference = b.sub(a);
      let connectionDerivative = difference.norm().mul(-1);
      derivative[connection.x] =
        derivative[connection.x].sub(connectionDerivative);
      derivative[connection.y] =
        derivative[connection.y].add(connectionDerivative);
    });
    let out = this.clone();
    for (let i = 0; i < out.points.length; i++) {
      out.points[i] = out.points[i].add(
        derivative[i].mul(dt * out.flattenWeights[i])
      );
    }
    return out;
  }
  stretch(factor): GeoMesh {
    let out = this.clone();
    out.points = out.points.map(point => point.mul(factor));
    return out;
  }
  applyMetric(metric: (Vec2) => [number, number, number, number]): GeoMesh {
    let out = this.clone();
    out.connections = out.connections.map(connection => {
      let difference = out.points[connection.y].sub(out.points[connection.x]);
      let average = out.points[connection.y]
        .add(out.points[connection.x])
        .mul(0.5);
      let localMetric = metric(new Vec2(average.x, average.y));
      let lengthSquared =
        localMetric[0] * difference.x * difference.x +
        localMetric[1] * difference.x * difference.y +
        localMetric[2] * difference.y * difference.x +
        localMetric[3] * difference.y * difference.y;
      return new Vec3(connection.x, connection.y, Math.sqrt(lengthSquared));
    });
    return out;
  }
}
