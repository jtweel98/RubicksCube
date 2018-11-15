class Face {
    constructor(orientation) {
        this.solvedOrientation = orientation;
        this.orientation = this.solvedOrientation;
        this.color = Face.CoordinateToColor()[orientation];
    }

    static ColorToCoordinate() {
        return {
            'w' : [0,1,0],
            'y' : [0,-1,0],
            'g' : [0,0,1],
            'b' : [0,0,-1],
            'r' : [1,0,0],
            'o' : [-1,0,0],
        }
    }

    static ColorToHex() {
        return {
            'w' : 0xffffff,
            'y' : 0xEDD404,
            'g' : 0x017F24,
            'b' : 0x005DEB,
            'r' : 0xDF0000,
            'o' : 0xFE8700,
        }
    }

    static CoordinateToColor() {
        var map = new WeakMap();
        map[[0,1,0]] = 'w';
        map[[0,-1,0]] = 'y';
        map[[0,0,1]] = 'g';
        map[[0,0,-1]] = 'b';
        map[[1,0,0]] = 'r';
        map[[-1,0,0]] = 'o';
        return map;
    }
}

class Piece {
    constructor(location, size) {
        this.cube = this.CreateCube(size,'rgb(211,211,211)');
        this.location = location;
        this.solvedLocation = this.location;
        this.faces = this.FindPieceFaces();
        this.type = Math.abs(this.location[0]) + Math.abs(this.location[1]) + Math.abs(this.location[2]);
    }

    CreateCube(size, color) {
        var geometry = new THREE.BoxGeometry(size,size,size);
        var material = new THREE.MeshPhongMaterial({ color: color });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        return mesh;
    }

    FindPieceFaces() {
        var pieceFaces = [];
        var orientation = [];
        this.location.forEach(function(element, index) {
            if (element != 0) {
                orientation = [0,0,0];
                orientation.splice(index, 1 ,element);
                pieceFaces.push(new Face(orientation));
            }
        })
        return pieceFaces;
    }

    PaintPiece(){
        var defaultMaterial = new THREE.MeshPhongMaterial({
            color:'rgb(50,50,50)',
            side: THREE.DoubleSide
        });
        var faceMaterials = new Array(6).fill(defaultMaterial);
        var map = new WeakMap();
        map[[1,0,0]] = 0;
        map[[-1,0,0]] = 1;
        map[[0,1,0]] = 2;
        map[[0,-1,0]] = 3;
        map[[0,0,1]] = 4;
        map[[0,0,-1]] = 5;

        this.faces.forEach((face) => {
            var index = map[face.solvedOrientation];
            faceMaterials[index] = new THREE.MeshPhongMaterial({
                color:Face.ColorToHex()[face.color], 
                side: THREE.DoubleSide
            });
        })
        this.cube.material = faceMaterials;
    }
}

var PieceType = {
    centre : 1,
    edge : 2,
    corner : 3,
}

class RubeCube {
    constructor() {
        this.cubePieces = this.CreateCubePieces(1);
        this.cubeObject = new THREE.Object3D();
        this.cubePieces.forEach(piece => {
            this.cubeObject.add(piece.cube);
        })
        this.PositionCubes();
        this.PaintPieces();
    }

    CreateCubePieces(size) {
        var pieces = new Array();
        for (var y = -1; y <= 1; y++){
            for (var x = -1; x<=1; x++) {
                for (var z = -1; z<=1; z++) {
                    if (x != 0 || y != 0 || z != 0){
                        var coordinate = [x,y,z];
                        var piece = new Piece(coordinate, size);
                        pieces.push(piece);
                    }
                }
            }
        }
        return pieces;
    }

    PositionCubes(){
        this.cubePieces.forEach(function(piece){
            var size = piece.cube.geometry.parameters.height;
            var cubePosition = piece.solvedLocation.map(element => size*element);
            piece.cube.position.set(
                cubePosition[0] + cubePosition[0]*0.05, 
                cubePosition[1]+ cubePosition[1]*0.05, 
                cubePosition[2]+ cubePosition[2]*0.05
            );
        })
    }

    PaintPieces() {
        this.cubePieces.forEach(piece => piece.PaintPiece());
    }

    PiecesOnFace(faceColor) {
        var faceOrientation = Face.ColorToCoordinate()[faceColor];
        var index = faceOrientation.findIndex((element) => element == 1 || element == -1);
        var facePieces = [];
        this.cubePieces.forEach(function(piece) {
            if (piece.location[index] == faceOrientation[index]){
                facePieces.push(piece);
            }
        })
        return facePieces;
    }

    Move(faceColor, direction) {
        this.MoveVisual(faceColor, direction);
        var pieces = this.PiecesOnFace(faceColor);
        var faceDirection = Face.ColorToCoordinate()[faceColor];
        var nonZeroIndex = faceDirection.findIndex(element => element == 1 || element == -1);
        var valueAtIndex = faceDirection[nonZeroIndex];

        pieces.forEach(function(piece) {
            var multiplier = direction=="cw" ? -1:1;
            piece.location = CrossProduct(faceDirection, piece.location).map(element => multiplier*element);
            piece.faces.forEach(function(face) {
                if (face.color != faceColor){
                    face.orientation = CrossProduct(faceDirection, face.orientation).map(element => multiplier*element);
                }
            })
        })
        pieces.forEach(piece => piece.location[nonZeroIndex] = valueAtIndex);
    }

    MoveVisual(faceColor, direction) {
        var piecesOnFace = this.PiecesOnFace(faceColor);
        var pivotGroup = new THREE.Object3D();
        this.cubeObject.add(pivotGroup);
        pivotGroup.updateMatrixWorld();

        piecesOnFace.forEach(piece => {
            pivotGroup.add(piece.cube);
        })

        var rotationVal = Math.PI/2;
        if (direction == "cw") {
            rotationVal = -rotationVal;
        }
        var rotation = Face.ColorToCoordinate()[faceColor];
        rotation = rotation.map(value => value*rotationVal);

        pivotGroup.rotation.set(rotation[0],rotation[1],rotation[2]);
        pivotGroup.updateMatrixWorld();
        
        for (var i = pivotGroup.children.length - 1; i >= 0; i--) {
            pivotGroup.children[i].applyMatrix(pivotGroup.matrixWorld);
            this.cubeObject.add(pivotGroup.children[i]);
        }
        this.cubeObject.remove(pivotGroup);
    }

    Scramble() {
        var colors = ['w','y','r','g','b','o'];
        var direction = ['cw', 'ccw'];
        for (var i = 0; i<20;i++){
            var randColor = colors[Math.floor(Math.random() * 6)];
            var randDir = direction[Math.floor(Math.random() * 2)];
            this.Move(randColor,randDir);
        }
    }
}

function CrossProduct(array1, array2) {
    var x = array1[1]*array2[2] - array1[2]*array2[1];
    var y = array1[2]*array2[0] - array1[0]*array2[2];
    var z = array1[0]*array2[1] - array1[1]*array2[0];
    return [x,y,z];
}

function Test( ){
    var piecesOnFace = this.PiecesOnFace(faceColor);
    piecesOnFace.forEach(piece => {
        scene.add(piece.cube);
    })

    //this.movingFace.rotation.set(0,0,0);
    this.movingFace.updateMatrixWorld();

    piecesOnFace.forEach((piece) => {
        THREE.SceneUtils.attach( piece.cube, scene, this.movingFace);
    })

    // Rotation
    if (faceColor == 'w'){
        this.movingFace.rotation.y = Math.PI/2;
    } else {
        this.movingFace.rotation.z = Math.PI/2;
    }

    this.movingFace.updateMatrixWorld();

    piecesOnFace.forEach(piece => {
        piece.cube.updateMatrixWorld();
        THREE.SceneUtils.detach( piece.cube, this.movingFace, scene );
    })


    // // Resetting group
    // if (this.movingFace.children.length > 0){
    //     for (var i = this.movingFace.children.length - 1; i >= 0; i--) {
    //         this.groupOfPieces.add(this.movingFace.children[i]);
    //     }
    // }
    // var piecesOnFace = this.PiecesOnFace(faceColor);
    // piecesOnFace.forEach(piece => this.movingFace.add(piece.cube));
}

function AnotherTest (){
    var testGroup = new THREE.Group();

        piecesOnFace.forEach(piece => {
            testGroup.add(piece.cube);
        })

        this.pivotGroup.updateMatrixWorld();
        this.pivotGroup.position.set(0,0,0);

        THREE.SceneUtils.attach(testGroup,scene,this.pivotGroup);
        // piecesOnFace.forEach(piece => {
        //     THREE.SceneUtils.attach(piece.cube,scene,this.pivotGroup);
        // })

        this.pivotGroup.rotation.set(0,Math.PI/2,0);

        
        this.pivotGroup.updateMatrixWorld();
        testGroup.updateMatrixWorld();
        THREE.SceneUtils.detach(testGroup,this.pivotGroup,scene);

        for (var i = testGroup.children.length - 1; i >= 0; i--) {
            scene.add(testGroup.children[i]);
        }

        scene.remove(testGroup);
}
