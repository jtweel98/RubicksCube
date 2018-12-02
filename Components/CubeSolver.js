class CubeSolver {

    SolveCross(cube,color){
        cube.GroupPiecesOfType(PieceType.edge, color);
        cube.group.forEach(piece => {
            if (piece.solvedLocation == piece.location) {return }
            // Getting face information
            var faceIndex = piece.FindIndexOfFace(color);
            // otherFaceIndex contains the other color on the given edge piece
            var otherFaceIndex = (faceIndex+1)%2;

            var face = piece.faces[faceIndex];
            var otherFace = piece.faces[otherFaceIndex];

            var botOrientation = Face.GiveOppositeFaceOrientation(face.solvedOrientation);
            var botFace = new Face(botOrientation);
    
            // Edge piece is on bottom
            var isOnBottom = Face.IsOnSameFace(piece.location, botFace.orientation);
            if (isOnBottom) {
                // Face is in bottom direction
                if (Face.IsOnSameFace(face.orientation, botFace.orientation)) {
                    // Turn until it is under where it needs to go
                    var test1 = !otherFace.IsCorrectOrientation();
                    while(test1){
                        cube.Move(botFace.color, 'cw');
                        otherFace = piece.faces[otherFaceIndex];
                        face = piece.faces[faceIndex];
                        test1 = !otherFace.IsCorrectOrientation();
                    }

                    var test2 = !face.IsCorrectOrientation();
                    while(test2){
                        cube.Move(otherFace.color, 'cw');
                        face = piece.faces[faceIndex];
                        test2 = !face.IsCorrectOrientation();
                    }
                } else { // Face is not in bottom direction
    
                }
            }
        })
    }

}

var PieceType = {
    centre : 1,
    edge : 2,
    corner : 3,
}