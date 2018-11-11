var THREE = require('three');

class Coordinate {
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Face {
    constructor(color) {
        this.color = color;
        this.solvedOrientation = this.ColorOrientationMap().get(color);
        this.currentOrientation = this.solvedOrientation;
    }

    ColorOrientationMap() {
        var map = new Map();
        map.set('w', new Coordinate(0,1,0));
        map.set('y', new Coordinate(0,-1,0));
        map.set('g', new Coordinate(0,0,1));
        map.set('b', new Coordinate(0,0,-1));
        map.set('r', new Coordinate(1,0,0));
        map.set('o', new Coordinate(-1,0,0));
        return map;
    }
}

class Piece {
    constructor(location) {
        this.cube = this.CreateCube(1,'rgb(211,211,211)');
        this.location = location;
        this.solvedLocation = this.location;
        this.faces = [];
    }

    CreateCube(size, color) {
        var geometry = new THREE.BoxGeometry(size,size,size);
        var material = new THREE.MeshPhongMaterial({ color: color });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        return mesh;
    }
}

module.exports = {
    Coordinate,
    Face,
    Piece,
}