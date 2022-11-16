import * as THREE from 'three';
import * as dat from 'dat.gui';
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
  return [1, 0, 0, 4];
}

const meshSettings = {
  minX: -1,
  maxX: 1,
  minY: -1,
  maxY: 1,
  resolution: 16,
  initialNoise: 0.1,
  cellWidth: 1.0 / 16,
};

function initialize(): GeoMesh {
  let outputMesh = new GeoMesh();

  for (let y = 0; y <= meshSettings.resolution; y++) {
    for (let x = 0; x <= meshSettings.resolution; x++) {
      outputMesh.points.push(
        new Vec3(
          meshSettings.minX +
            x *
              meshSettings.cellWidth *
              (meshSettings.maxX - meshSettings.minX),
          meshSettings.minY +
            y *
              meshSettings.cellWidth *
              (meshSettings.maxY - meshSettings.minY),
          meshSettings.initialNoise * (Math.random() - 0.5)
        )
      );
      if (
        x == 0 ||
        y == 0 ||
        x == meshSettings.resolution ||
        y == meshSettings.resolution
      ) {
        outputMesh.flattenWeights.push(0);
      } else {
        outputMesh.flattenWeights.push(1);
      }
    }
  }

  for (let y = 0; y < meshSettings.resolution; y++) {
    for (let x = 0; x < meshSettings.resolution; x++) {
      outputMesh.connections.push(
        new Vec3(
          x + y * (meshSettings.resolution + 1),
          1 + x + y * (meshSettings.resolution + 1),
          0
        ),
        new Vec3(
          x + y * (meshSettings.resolution + 1),
          meshSettings.resolution + 1 + x + y * (meshSettings.resolution + 1),
          0
        ),
        new Vec3(
          x + y * (meshSettings.resolution + 1),
          meshSettings.resolution + 2 + x + y * (meshSettings.resolution + 1),
          0
        )
      );
    }
  }

  for (let i = 0; i < meshSettings.resolution; i++) {
    outputMesh.connections.push(
      new Vec3(
        meshSettings.resolution * (meshSettings.resolution + 1) + i,
        meshSettings.resolution * (meshSettings.resolution + 1) + i + 1,
        0
      ),
      new Vec3(
        i * (meshSettings.resolution + 1) + meshSettings.resolution,
        (i + 1) * (meshSettings.resolution + 1) + meshSettings.resolution,
        0
      )
    );
  }

  for (let y = 0; y < meshSettings.resolution; y++) {
    for (let x = 0; x < meshSettings.resolution; x++) {
      outputMesh.triangles.push(
        new Vec3(
          x + y * (meshSettings.resolution + 1),
          1 + x + y * (meshSettings.resolution + 1),
          meshSettings.resolution + 1 + x + y * (meshSettings.resolution + 1)
        ),
        new Vec3(
          1 + x + y * (meshSettings.resolution + 1),
          meshSettings.resolution + 1 + x + y * (meshSettings.resolution + 1),
          meshSettings.resolution + 2 + x + y * (meshSettings.resolution + 1)
        )
      );
    }
  }
  return outputMesh;
}

let myGeoMesh = initialize()
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

const annealSettings = {

  'scale likelihood': 0.01,
  'scale rate': 2,
  'flatten rate': 0.01,
  'stretch': ()=> myGeoMesh = myGeoMesh.stretch(2)
}
let stepSize = 1;
const gui = new dat.GUI();
const initFolder = gui.addFolder('Init Settings')
const annealFolder = gui.addFolder('Anneal Controls')
annealFolder.add(annealSettings, 'scale likelihood', 0, 1)
annealFolder.add(annealSettings, 'scale rate', 1, 4)
annealFolder.add(annealSettings, 'flatten rate', 0, 0.1)
annealFolder.add(annealSettings, 'stretch')

annealFolder.open();
gui.open();
function animate() {
  console.log(myGeoMesh.loss());
  let newMesh = myGeoMesh.step(stepSize);
  if (newMesh.loss() < myGeoMesh.loss()) {
    myGeoMesh = newMesh;
    if (Math.random() < annealSettings['scale likelihood']) {
      stepSize *= annealSettings['scale rate'];
    }
  } else {
    stepSize /= annealSettings['scale rate'];
  }
  myGeoMesh = myGeoMesh.flatten(annealSettings['flatten rate']);
  const wireframeGeometry = new THREE.WireframeGeometry(fromGeoMesh(myGeoMesh));
  const wireframeMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
  });
  const wireframeMesh = new THREE.LineSegments(
    wireframeGeometry,
    wireframeMaterial
  );
  wireframeMesh.geometry.center();
  wireframeMesh.rotateX(Math.PI * 0.5);
  scene.add(wireframeMesh);

  renderer.render(scene, camera);

  scene.remove(wireframeMesh);
  requestAnimationFrame(animate);
}
animate();
