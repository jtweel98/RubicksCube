class Face {
    constructor(orientation) {
        this.solvedOrientation = orientation;
        this.currentOrientation = this.solvedOrientation;
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
        this.faces = this.PaintPiece();
        this.type = Math.abs(this.location[0]) + Math.abs(this.location[1]) + Math.abs(this.location[2]);
    }

    CreateCube(size, color) {
        var geometry = new THREE.BoxGeometry(size,size,size);
        var material = new THREE.MeshPhongMaterial({ color: color });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        return mesh;
    }

    PaintPiece() {
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
        pieces.forEach(function(element) {
            if (element.type == PieceType.corner) {
                corners.push(element);
            } else if (element.type == PieceType.edge) {
                edge.push(element);
            } else if (element.type == PieceType.centre) {
                centre.push(element);
            }
        });
        return [centre, edge, corners];
    }

    Move(faceColor, direction) {
        var pieces = this.PiecesOnFace(faceColor);
        var directionVector = Face.ColorToCoordinate()[faceColor];
        directionVector.forEach(element => element = Math.abs(element));

        if (direction === "cw"){
            pieces.forEach(function(element) {
                element.location = CrossProduct(element.location, directionVector);
            })
        } else if (direction === "ccw") {
            pieces.forEach(function(element) {
                element.location = CrossProduct(directionVector, element.location);                
            })
        }
        var faceDirection = Face.ColorToCoordinate()[faceColor];
        pieces.forEach(function(element) {
            element.location[0] += faceDirection[0];
            element.location[1] += faceDirection[1];
            element.location[2] += faceDirection[2];
        })
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
