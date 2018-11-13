//Scene creation
var scene = new THREE.Scene();

//Creating objects
var cube = getCube(1,0xff0000);
var pointLight1 = getPointLight(1, 0xffffff);
var pointLight2 = getPointLight(1, 0xffffff);

//Adding objects to scene
scene.add(cube);
scene.add(pointLight1);
scene.add(pointLight2);

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

//GUI Stuff
var gui = new dat.GUI();

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
