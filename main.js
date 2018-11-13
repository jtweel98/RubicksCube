var scene = new THREE.Scene();

//Creating objects
var pointLight1 = getPointLight(1, 0xffffff);
var pointLight2 = getPointLight(1, 0xffffff);
var cube  = new RubeCube();

var test = new Piece([0,0,0], 1);
test.cube.position.set(3,3,3);
var cubeMaterials = [ 
    new THREE.MeshBasicMaterial({color:"red", side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({color:"blue", side: THREE.DoubleSide}), 
    new THREE.MeshBasicMaterial({color:"green", side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({color:"yellow", side: THREE.DoubleSide}), 
    new THREE.MeshBasicMaterial({color:"orange", side: THREE.DoubleSide}), 
    new THREE.MeshBasicMaterial({color:"white", side: THREE.DoubleSide}), 
]; 

test.cube.material = cubeMaterials

//Adding objects to scene
scene.add(pointLight1);
scene.add(pointLight2);
scene.add(cube.GetVisualObject());
scene.add(test.cube);

//Begining Positions
pointLight1.position.y = 7;
pointLight1.position.x = 7;
pointLight1.position.z = 7;
pointLight2.position.y = -7;
pointLight2.position.x = -7;
pointLight2.position.z = -7;

//Camera creation
var camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,1000);
camera.position.z = 5;
camera.position.x = 5;
camera.position.y = 5;
camera.lookAt(new THREE.Vector3(0,0,0));

//Renderer Creation
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('rgb(120,120,120)');
renderer.shadowMap.enabled = true;
document.getElementById('main').appendChild(renderer.domElement)
var controls = new THREE.OrbitControls(camera, renderer.domElement)
ContinuousRender(renderer,scene,camera,controls);


// --------------- FUNCTIONS -------------------------------------------------------------------
function getCube (s, color) {
    var geometry = new THREE.BoxGeometry(s,s,s);
    var material = new THREE.MeshPhongMaterial({
      color: color,
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    return mesh;
}

function getPointLight (intensity, color) {
    var light = new THREE.PointLight(color, intensity);
    light.castShadow = true;
    return light;
  }

  function ContinuousRender(renderer, scene, camera, controls) {
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(() => ContinuousRender(renderer, scene, camera, controls))
  }