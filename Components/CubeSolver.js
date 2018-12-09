class CubeSolver {

    constructor(cube){
        this.rubeCube = cube
    }

    AddToCross(piece, color){
        let Case2 = function(face, otherFace, opColor) {
            while(!otherFace.IsCorrectOrientation()){
                cube.Move(opColor, 'cw');
            }
            while(!face.IsCorrectOrientation()){
                cube.Move(otherFace.color, 'cw');
            }
        }
        let Case3 = function(face, otherFace, opColor) {
            while(!IsSameCoordinate(face.orientation, otherFace.solvedOrientation)){
                cube.Move(opColor, 'cw');
            }
            cube.Move(otherFace.color, 'cw');
            cube.Move(color, 'cw');
            cube.Move(Face.AdjacentFace(otherFace.color, color, 'l'), 'ccw');
            cube.Move(color, 'ccw');
        }
        let Case4 = function(face, otherFace, opColor) { 
            let adjFaceColor = Face.OrientationToColor[otherFace.orientation];
            let frontFaceColor = Face.OrientationToColor[face.orientation];
            let direction = (adjFaceColor === Face.AdjacentFace(frontFaceColor,color,'l'))? "cw":"ccw"
            cube.Move(adjFaceColor, direction);
            cube.Move(opColor, 'cw');
            direction = direction === "cw"? "ccw":"cw";
            cube.Move(adjFaceColor, direction);
            Case2(face, otherFace, opColor);
        }
        let Case5 = function(face, otherFace, opColor) { 
            let frontFaceColor = Face.OrientationToColor[face.orientation];
            cube.Move(frontFaceColor, "cw");
            Case4(face, otherFace, opColor);
        }
        let Case6 = function(color) { 
            let frontFaceColor = Face.OrientationToColor[otherFace.orientation];
            cube.Move(frontFaceColor, "cw");
            cube.Move(frontFaceColor, "cw");
            Case2(face, otherFace, opColor);
        }

        let face = piece.GetFace(color);
        let otherFace = piece.faces.filter(face => face.color !== color)[0];
        let opColor = Face.OppositeColorOf[color];
        let pieceOnBottom = piece.IsOnSameFace(opColor);
        let pieceOnTop = piece.IsOnSameFace(color);

        // Case 1: piece is already in solved location
        if (piece.IsCorrectLocation() && piece.IsCorrectOrientation()) return;

        // Case 2: piece is on bottom row and so is face
        else if (pieceOnBottom && IsSameCoordinate(face.orientation, Face.ColorToOrientation[opColor])) {
            Case2(face, otherFace, opColor);
        }

        // Case 3: piece is on bottom row but face is not
        else if (pieceOnBottom && !IsSameCoordinate(face.orientation, Face.ColorToOrientation[opColor])) {
            Case3(face, otherFace, opColor);
        }

        // Case 4: piece is in middle row
        else if (!pieceOnTop && !pieceOnBottom) {
            Case4(face, otherFace, opColor);
        }

        // Case 5: piece is on top row but wrong orientation -> convert to case 4
        else if (!pieceOnBottom && !IsSameCoordinate(face.orientation, Face.ColorToOrientation[color])) {
            Case5(face, otherFace, opColor);
        }

        // Case 6: piece is on top row but wrong slot -> convert to case 2
        else if (pieceOnTop && !piece.IsCorrectLocation()) {
            Case6(face, otherFace, opColor)
        }
    }

    AddToCorners(piece, color) {
        let IsBelow = function(piece, topColor) {
            let nonZeroIndex = Face.ColorToOrientation[topColor].findIndex((element) => element === 1 || element === -1);
            for (let i=0;i<piece.location.length;i++){
                if (piece.location[i]!==piece.solvedLocation[i] && i!==nonZeroIndex){
                    return false
                }
            }
            return piece.location[nonZeroIndex] === -piece.solvedLocation[nonZeroIndex];
        }
        let case1 = function(piece, color, opColor){
            while(!IsBelow(piece, color)){
                cube.Move(opColor, 'cw');
            }
            // Find other faces piece
            let otherFaces = piece.faces.filter(face => face.color != color);
            // Face in which the right is the other face
            let rightFace = Face.AdjacentFace(otherFaces[0].color, color, 'r') === otherFaces[1].color? otherFaces[1]:otherFaces[0];
            while(!piece.IsCorrectLocation() && !piece.IsCorrectOrientation()){
                cube.Move(rightFace.color,'ccw');
                cube.Move(opColor,'ccw');
                cube.Move(rightFace.color,'cw');
                cube.Move(opColor,'cw');
            }

        }

        let opColor = Face.OppositeColorOf[color];
        let pieceOnBottom = piece.IsOnSameFace(opColor);
        let pieceOnTop = piece.IsOnSameFace(color);

        // Case 1: Already in solved location
        if (piece.IsCorrectLocation() && piece.IsCorrectOrientation()) return;

        // Case 2: Piece is on bottom row
        else if (pieceOnBottom) {
           alert("piece on bottom " + piece.ListColors())
           case1(piece, color, opColor);
        }
        // Case 3: Piece is on top row but not in solved location
        else if (pieceOnTop) {
            alert("piece on top " + piece.ListColors())
        }
    }

    SolveCross(color) {
        let pieces = cube.GetPiecesOfType(PieceType.edge, color);
        pieces.forEach(piece => {
            this.AddToCross(piece, color);
        })
    }

    SolveCorners(color) {
        let pieces = cube.GetPiecesOfType(PieceType.corner, color);
        pieces.forEach(piece => {
            this.AddToCorners(piece, color);
        })
    }
}

function IsSameCoordinate(coordinate1, coordinate2){
    for (let i=0; i< coordinate1.length; i++){
        if (coordinate1[i] !== coordinate2[i]) return false;
    }
    return true
}