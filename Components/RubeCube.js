/*
* Definition - RubeCube class represents the definitions of a Rubick's cube.
* Fields: 
*  cubePiece: Array - Array of 26 pieces which make up a rubick's cube (excludes the centre/core piece)
*  visualCube: THREE.Object3D() - Represents a thee.js group/object containing all cube pieces
*/
class RubeCube {
    constructor() {
        this.cubePieces = this.CreateCubePieces();
        this.visualCube = this.CreateVisualCube(this.cubePieces)
        this.group;
    }

    /*
    * Definition - Creates an array of 26 piece objects and assignes each piece a location
    * relative to the centre/origin of the cube, [0,0,0].
    * Input - None
    * Output - pieces: Array
    */
    CreateCubePieces() {
        let pieces = [];
        for (let y = -1; y <= 1; y++){
            for (let x = -1; x<=1; x++) {
                for (let z = -1; z<=1; z++) {
                    if (x !== 0 || y !== 0 || z !== 0){
                        let piece = new Piece([x,y,z], 1);
                        pieces.push(piece);
                    }
                }
            }
        }
        return pieces;
    }

    /*
    * Definition - Helper function used to visually position the RubeCube's list of 
    * cubePieces generated from the CreateCubePieces function.
    * Input - cubePieces: Array
    * Output - None
    */
    VisualyPositionCubes(cubePieces){
        cubePieces.forEach(piece => {
            let size = piece.cube.geometry.parameters.height;
            // cubePosition contains the actual piece's visual coordinates based on piece's size
            let cubePosition = piece.solvedLocation.map(element => size*element);
            // spacingFactor defines how closely the pieces will appear
            let spacingFactor = 0.05;
            piece.cube.position.set(
                cubePosition[0] + cubePosition[0]*spacingFactor, 
                cubePosition[1]+ cubePosition[1]*spacingFactor, 
                cubePosition[2]+ cubePosition[2]*spacingFactor
            );
        })
    }

    /*
    * Definition - Creates and returns a three.js object representing a visual rubick's cube. The object
    * has 26 children three.js objects which represent the cube's pieces.
    * Input - cubePieces: Array
    * Output - visualCube: THREE.Object3D()
    */
    CreateVisualCube(cubePieces){
        // Positioning pieces
        this.VisualyPositionCubes(cubePieces);
        // Coloring pieces
        let visualCube = new THREE.Object3D();
        // Adding each piece to parent object 'visualCube'
        cubePieces.forEach(piece => {
            visualCube.add(piece.cube);
        })
        return visualCube;
    }

    /*
    * Definition - Finds and returns an array of pieces that are found on the specified face color.
    * Input - color: String ('w','r','o','g','b','y')
    * Output - facePieces: Array
    */
    GetPiecesOnFace(color) {
        let faceOrientation = Face.ColorToOrientation[color];
        // nonZeroIndex is the index of the non zero element in faceOrientation
        let nonZeroIndex = faceOrientation.findIndex((element) => element === 1 || element === -1);
        let facePieces = this.cubePieces.filter(piece => piece.location[nonZeroIndex] === faceOrientation[nonZeroIndex])
        return facePieces;
    }

    /*
    * Definition - Turns a specified color face in a specified direction (cw, or ccw).
    * Updates all piece locations, as well as the orientations of all faces on each piece.
    * This function also uses 'MoveVisual' to represent these changes visually.
    * Input - color: String ('w','r','o','g','b','y') | direction: String ('cw', 'ccw')
    * Output - None
    */
    Move(color, direction) {
        this.MoveVisual(color, direction);
        let piecesOnFace = this.GetPiecesOnFace(color);
        let faceOrientation = Face.ColorToOrientation[color];

        let CrossProduct = function (array1, array2) {
            var x = array1[1]*array2[2] - array1[2]*array2[1];
            var y = array1[2]*array2[0] - array1[0]*array2[2];
            var z = array1[0]*array2[1] - array1[1]*array2[0];
            return [x,y,z];
        }

        piecesOnFace.forEach(function(piece) {
            let multiplier = (direction==="cw")? -1:1;
            piece.location = CrossProduct(faceOrientation, piece.location).map(element => multiplier*element);
            piece.faces.forEach(function(face) {
                if (Face.OrientationToColor[face.orientation] !== color){
                    face.orientation = CrossProduct(faceOrientation, face.orientation).map(element => multiplier*element);
                }
            })
        })
        // Index of the nonzero value in faceOrientation
        let nonZeroIndex = faceOrientation.findIndex(element => element === 1 || element === -1);
        piecesOnFace.forEach(piece => piece.location[nonZeroIndex] = faceOrientation[nonZeroIndex]);
    }

    /*
    * Definition - Responsible for visually moving the 9 pieces on the specified face in
    * the specified direction
    * Input - color: String ('w','r','o','g','b','y') | direction: String ('cw', 'ccw')
    * Output - None
    */
    MoveVisual(color, direction) {
        let piecesOnFace = this.GetPiecesOnFace(color);
        // pivotGroup will temporarily hold all pieces on the given face
        let pivotGroup = new THREE.Object3D();
        // making pivot group a child of the visualCube
        this.visualCube.add(pivotGroup);
        // adding all pieces on face to the pivot group
        piecesOnFace.forEach(piece => {
            pivotGroup.add(piece.cube);
        })
        let rotationVal = (direction === "cw")? -Math.PI/2:Math.PI/2;
        // rotationOfPivot is the array representing the roation of the pivot group
        // ex: rotationPivot = [0,PI/2,0] -> Rotate 90º ccw around the y axis
        let rotationOfPivot = Face.ColorToOrientation[color].map(value => value*rotationVal);
        // using rotationOfPivot to rotate all 9 pieces found within the pivotGroup
        pivotGroup.rotation.set(rotationOfPivot[0],rotationOfPivot[1],rotationOfPivot[2]);
        // updating the visual of the cube after the rotation is performed
        pivotGroup.updateMatrixWorld();
        
        // updates the global location of each piece then removes it from the pivot group
        for (let i = pivotGroup.children.length - 1; i >= 0; i--) {
            pivotGroup.children[i].applyMatrix(pivotGroup.matrixWorld);
            this.visualCube.add(pivotGroup.children[i]);
        }
        this.visualCube.remove(pivotGroup);
    }

    /*
    * Definition - This function will randomly scramble the cube object by turning the faces
    * 20 times at random
    * Input - None
    * Output - None
    */
    Scramble() {
        let colors = ['w','y','r','g','b','o'];
        let direction = ['cw', 'ccw'];
        let setSteps = [3, 3, 5, 0, 3, 1, 3, 0, 4, 4, 5, 4, 4, 3, 2, 3, 1, 2, 1, 3, 1, 1, 4, 0, 1, 4, 2, 5, 0, 0, 3, 1, 2, 2, 0, 1, 5, 2, 1, 4];
        let setDir = [1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1];
        for (let i = 0; i<20;i++){
            // var randColor = colors[Math.floor(Math.random() * 6)];
            // var randDir = direction[Math.floor(Math.random() * 2)];
            this.Move(colors[setSteps[i]],direction[setDir[i]]);
        }
    }

    /*
    * Definition - Not sure if its needed
    * Input - 
    * Output - 
    */
    GroupPiecesOfType(pieceType, color) {
        var piecesOfType = [];
        this.cubePieces.forEach(piece => {
            var isType = piece.type == pieceType;
            var isColor = piece.ContainsColor(color);
            if (isType && isColor){
                piecesOfType.push(piece);
            }
        })
        this.group = piecesOfType;
    }
}

PieceType