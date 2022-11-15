import * as THREE from 'three';
import { Vec3, Vec2 } from './geometry';
import { GeoMesh } from './topologysolver';

function fromGeoMesh(geoMesh: GeoMesh): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  let indices: number[] = [];
  let vertexData: number[] = [];

  geoMesh.triangles.forEach(triangle =>
    indices.push(triangle.x, triangle.y, triangle.z)
  );
  geoMesh.points.forEach(vertex =>
    vertexData.push(vertex.x, vertex.y, vertex.z)
  );
  let vertexBuffer = new Float32Array(vertexData);
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertexBuffer, 3));
  return geometry;
}

//row-major order
function metric(coords: Vec2): [number, number, number, number] {
  return [1, 0, 0, 1];
}

const resolution = 16;
const initialNoise = 0.1;
const cellWidth = 1.0 / resolution;

let myGeoMesh = new GeoMesh();

for (let y = 0; y <= resolution; y++) {
  for (let x = 0; x <= resolution; x++) {
    myGeoMesh.points.push(
      new Vec3(
        x * cellWidth,
        y * cellWidth,
        initialNoise * (Math.random() - 0.5)
      )
    );
  }
}

for (let y = 0; y < resolution; y++) {
  for (let x = 0; x < resolution; x++) {
    myGeoMesh.connections.push(
      new Vec3(x + y * (resolution + 1), 1 + x + y * (resolution + 1), 0),
      new Vec3(
        x + y * (resolution + 1),
        resolution + 1 + x + y * (resolution + 1),
        0
      ),
      new Vec3(
        x + y * (resolution + 1),
        resolution + 2 + x + y * (resolution + 1),
        0
      )
    );
  }
}

for (let i = 0; i < resolution; i++) {
  myGeoMesh.connections.push(
    new Vec3(
      resolution * (resolution + 1) + i,
      resolution * (resolution + 1) + i + 1,
      0
    ),
    new Vec3(
      i * (resolution + 1) + resolution,
      (i + 1) * (resolution + 1) + resolution,
      0
    )
  );
}

for (let y = 0; y < resolution; y++) {
  for (let x = 0; x < resolution; x++) {
    myGeoMesh.triangles.push(
      new Vec3(
        x + y * (resolution + 1),
        1 + x + y * (resolution + 1),
        resolution + 1 + x + y * (resolution + 1)
      ),
      new Vec3(
        1 + x + y * (resolution + 1),
        resolution + 1 + x + y * (resolution + 1),
        resolution + 2 + x + y * (resolution + 1)
      )
    );
  }
}

myGeoMesh = myGeoMesh.applyMetric(metric);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.rotateY(Math.PI / 4);
camera.rotateX(-Math.atan(Math.SQRT1_2));

camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('display').appendChild(renderer.domElement);

const growProbability = 0.01;
const growFactor = 2;
let stepSize = 1;
function animate() {
  console.log(stepSize)
  let newMesh = myGeoMesh.step(stepSize);
  if (newMesh.loss() < myGeoMesh.loss()) {
    myGeoMesh = newMesh;
    if (Math.random() < growProbability) {
      stepSize *= growFactor;
    }
  } else {
    stepSize /= growFactor;
  }
  const wireframeGeometry = new THREE.WireframeGeometry(fromGeoMesh(myGeoMesh));
  const wireframeMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
  });
  const wireframeMesh = new THREE.LineSegments(
    wireframeGeometry,
    wireframeMaterial
  );
  wireframeMesh.rotateX(Math.PI * 0.5);
  scene.add(wireframeMesh);

  renderer.render(scene, camera);

  scene.remove(wireframeMesh);
  requestAnimationFrame(animate);
}
animate();
