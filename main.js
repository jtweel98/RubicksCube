var scene = new THREE.Scene();

//Creating objects
var pointLight1 = getPointLight(0.3, 0xffffff);
var pointLight2 = getPointLight(0.3, 0xffffff);
var pointLight3 = getPointLight(0.3, 0xffffff);
var pointLight4 = getPointLight(0.3, 0xffffff);
var pointLight5 = getPointLight(0.3, 0xffffff);
var pointLight6 = getPointLight(0.3, 0xffffff);
var pointLight7 = getPointLight(0.3, 0xffffff);
var pointLight8 = getPointLight(0.3, 0xffffff);

//Begining Positions
pointLight1.position.y = 7;
pointLight1.position.x = 7;
pointLight1.position.z = 7;

pointLight2.position.y = -7;
pointLight2.position.x = -7;
pointLight2.position.z = -7;

pointLight3.position.y = -7;
pointLight3.position.x = 7;
pointLight3.position.z = 7;

pointLight4.position.y = 7;
pointLight4.position.x = -7;
pointLight4.position.z = 7;

pointLight5.position.y = 7;
pointLight5.position.x = 7;
pointLight5.position.z = -7;

pointLight6.position.y = -7;
pointLight6.position.x = -7;
pointLight6.position.z = 7;

pointLight7.position.y = 7;
pointLight7.position.x = -7;
pointLight7.position.z = -7;

pointLight8.position.y = -7;
pointLight8.position.x = 7;
pointLight8.position.z = -7;

var rubeCube = new RubeCube();
var cubeSolver = new CubeSolver(rubeCube);

//Adding objects to scene
scene.add(pointLight1);
scene.add(pointLight2);
scene.add(pointLight3);
scene.add(pointLight4);
scene.add(pointLight5);
scene.add(pointLight6);
scene.add(pointLight7);
scene.add(pointLight8);

scene.add(rubeCube.visualCube);

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
    rubeCube.Move('w', 'cw', true)
  },
  w_ccw : function() {
    rubeCube.Move('w', 'ccw', true)
  },
  y_cw : function() {
    rubeCube.Move('y', 'cw', true)
  },
  y_ccw : function() {
    rubeCube.Move('y', 'ccw', true)
  },
  g_cw : function() {
    rubeCube.Move('g', 'cw', true)
  },
  g_ccw : function() {
    rubeCube.Move('g', 'ccw', true)
  },
  b_cw : function() {
    rubeCube.Move('b', 'cw', true)
  },
  b_ccw : function() {
    rubeCube.Move('b', 'ccw', true)
  },
  r_cw : function() {
    rubeCube.Move('r', 'cw', true)
  },
  r_ccw : function() {
    rubeCube.Move('r', 'ccw', true)
  },
  o_cw : function() {
    rubeCube.Move('o', 'cw', true)
  },
  o_ccw : function() {
    rubeCube.Move('o', 'ccw', true)
  },
  scramble : function() {
    rubeCube.Scramble();
  },
  cross : () => cubeSolver.SolveCross('w'),
  corners : () => cubeSolver.SolveCorners('w'),
  secondLayer : () => cubeSolver.SolveSecondLayer('w'),
  solveAll : () => cubeSolver.SolveAll('w'),
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
gui.add(buttons,'scramble');
gui.add(buttons,'cross');
gui.add(buttons, 'corners');
gui.add(buttons, 'secondLayer');
gui.add(buttons, 'solveAll');

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
  //console.log("isAnimating")
  TWEEN.update();
  requestAnimationFrame(() => ContinuousRender(renderer, scene, camera, controls))
}

function Render(renderer, scene, camera){
  renderer.render(scene, camera);
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