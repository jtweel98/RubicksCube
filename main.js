var scene = new THREE.Scene();

//Creating objects
var pointLight1 = getPointLight(1, 0xffffff);
var pointLight2 = getPointLight(1, 0xffffff);
var cube = new RubeCube();
// cube.Move('g','ccw')
// cube.Move('b','cw')
// cube.Move('r','cw')
// cube.Move('g','cw')
// cube.Move('b','ccw')

// cube.Move('g','ccw')
// cube.Move('o','ccw')

// cube.Move('b','cw')
// cube.Move('b','cw')
// cube.Move('w', 'cw')
// cube.Move('r', 'cw')
// cube.Move('b', 'ccw')
// cube.Move('r', 'cw')

cube.Move('r','ccw');
cube.Move('y','ccw');
cube.Move('r','cw');
cube.Move('y','cw');


//cube.Move('r', 'cw'); 
//cube.Move('r', 'cw');

var cubeSolver = new CubeSolver(cube);
//cubeSolver.Solve('w')

//Adding objects to scene
scene.add(pointLight1);
scene.add(pointLight2);
scene.add(cube.visualCube);

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

//Button Creation 
var gui = new dat.GUI();

var buttons = {
  w_cw : function() {
    cube.Move('w', 'cw')
  },
  w_ccw : function() {
    cube.Move('w', 'ccw')
  },
  y_cw : function() {
    cube.Move('y', 'cw')
  },
  y_ccw : function() {
    cube.Move('y', 'ccw')
  },
  g_cw : function() {
    cube.Move('g', 'cw')
  },
  g_ccw : function() {
    cube.Move('g', 'ccw')
  },
  b_cw : function() {
    cube.Move('b', 'cw')
  },
  b_ccw : function() {
    cube.Move('b', 'ccw')
  },
  r_cw : function() {
    cube.Move('r', 'cw')
  },
  r_ccw : function() {
    cube.Move('r', 'ccw')
  },
  o_cw : function() {
    cube.Move('o', 'cw')
  },
  o_ccw : function() {
    cube.Move('o', 'ccw')
  },
};

gui.add(buttons,'w_cw');
gui.add(buttons,'w_ccw');
gui.add(buttons,'y_cw');
gui.add(buttons,'y_ccw');
gui.add(buttons,'r_cw');
gui.add(buttons,'r_ccw');
gui.add(buttons,'o_cw');
gui.add(buttons,'o_ccw');
gui.add(buttons,'b_cw');
gui.add(buttons,'b_ccw');
gui.add(buttons,'g_cw');
gui.add(buttons,'g_ccw');



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
  TWEEN.update();
  requestAnimationFrame(() => ContinuousRender(renderer, scene, camera, controls))
}

function FindSpecificPiece(cube, solvedLoc){
  var toReturn;
  cube.cubePieces.forEach(piece => {
    var x = piece.solvedLocation[0] == solvedLoc[0];
    var y = piece.solvedLocation[1] == solvedLoc[1];
    var z = piece.solvedLocation[2] == solvedLoc[2];
    if (x&&y&&z){
      toReturn = piece;
    }
  })
  return toReturn;
}