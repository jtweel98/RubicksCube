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
            'y' : 0xffff00,
            'g' : 0x00ff00,
            'b' : 0x0000ff,
            'r' : 0xff0000,
            'o' : 0xffa500,
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
        var currentColor = this.cube.material.color;
        var facePossibilities = [0,0,0]
        var faceMaterials = [];

        var counter = 0;
        for (var i=2;i>=0;i--){
            this.faces.forEach(function(face) {
                if (face.solvedOrientation == facePossibilities.splice(i, 1 ,-1)) {
                    faceMaterials.push(new THREE.MeshBasicMaterial({color:Face.ColorToHex()[face.color], side: THREE.DoubleSide}))
                }
            })
            if (faceMaterials.length == counter){
                faceMaterials.push(new THREE.MeshBasicMaterial({color: currentColor, side: THREE.DoubleSide}));
            }
            counter++;
            this.faces.forEach(function(face) {
                if (face.solvedOrientation == facePossibilities.splice(i, 1 ,1)) {
                    faceMaterials.push(new THREE.MeshBasicMaterial({color:Face.ColorToHex()[face.color], side: THREE.DoubleSide}))
                }
            })
            if (faceMaterials.length == counter){
                faceMaterials.push(new THREE.MeshBasicMaterial({color:currentColor, side: THREE.DoubleSide}));
            }
            counter++;
            facePossibilities = [0,0,0];
        }

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
        var pieces = this.CreateRubeCube(1);
        this.centres = pieces[0];
        this.edges = pieces[1];
        this.corners = pieces[2];
    }

    CreateRubeCube(size) {
        var pieces = new Array();
        var corners = new Array();
        var edge = new Array();
        var centre = new Array();
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
        pieces.forEach(function(piece) {
            if (piece.type == PieceType.corner) {
                corners.push(piece);
            } else if (piece.type == PieceType.edge) {
                edge.push(piece);
            } else if (piece.type == PieceType.centre) {
                centre.push(piece);
            }
        });
        return [centre, edge, corners];
    }

    GetVisualObject() {
        var pieces = this.centres.concat(this.edges, this.corners);
        var group = new THREE.Group();
        pieces.forEach(function(piece){
            var size = piece.cube.geometry.parameters.height;
            var cubePosition = piece.solvedLocation.map(element => size*element);
            piece.cube.position.set(
                cubePosition[0] + cubePosition[0]*0.05, 
                cubePosition[1]+ cubePosition[1]*0.05, 
                cubePosition[2]+ cubePosition[2]*0.05
                );
            piece.PaintPiece();
            group.add(piece.cube);
        })

        return group;
    }

    Move(faceColor, direction) {
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

    PiecesOnFace(faceColor) {
        var faceOrientation = Face.ColorToCoordinate()[faceColor];
        var index = faceOrientation.findIndex((element) => element == 1 || element == -1);
        var pieces = [];
        this.edges.forEach(function(element) {
            if (element.location[index] == faceOrientation[index]){
                pieces.push(element);
            }
        })
        this.corners.forEach(function(element) {
            if (element.location[index] == faceOrientation[index]){
                pieces.push(element);
            }
        })
        return pieces;
    }
}

function CrossProduct(array1, array2) {
    var x = array1[1]*array2[2] - array1[2]*array2[1];
    var y = array1[2]*array2[0] - array1[0]*array2[2];
    var z = array1[0]*array2[1] - array1[1]*array2[0];
    return [x,y,z];
}
