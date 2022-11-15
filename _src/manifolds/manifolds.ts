import * as THREE from 'three';
import * as meshline from 'three.meshline';
import { Vec3, Vec2 } from './geometry';
import { GeoMesh } from './topologysolver';

//row-major order
function Metric(coords: Vec2): number[] {
  return [1, 0, 0, 1];
}

let myGeoMesh = new GeoMesh();

myGeoMesh.points.push(
  new Vec3(-1, -1, 0),
  new Vec3(1, -1, 0),
  new Vec3(-1, 1, 0),
  new Vec3(1, 1, 0)
);

myGeoMesh.connections.push(
  new Vec3(0, 1, 2),
  new Vec3(2, 3, 2),
  new Vec3(0, 2, 2),
  new Vec3(1, 3, 2),
  new Vec3(2, 3, 2 * Math.SQRT2)
);

myGeoMesh.triangles.push(new Vec3(0, 1, 2), new Vec3(2, 1, 3));

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
  let vertexBuffer = new Float32Array(vertexData)
  geometry.setIndex(indices)
  geometry.setAttribute('position', new THREE.BufferAttribute(vertexBuffer, 3))
  return geometry;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.rotateY(Math.PI / 4)
camera.rotateX(-Math.atan(Math.SQRT1_2))

camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('display').appendChild(renderer.domElement);

const geometry = fromGeoMesh(myGeoMesh);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const wireframeGeometry = new THREE.WireframeGeometry(geometry)
const wireframeMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2})
const wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
scene.add(wireframeMesh)


function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.x += 0.01;
  wireframeMesh.rotation.x += 0.01;
  renderer.render(scene, camera);
}
animate();
