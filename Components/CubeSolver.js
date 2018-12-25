class CubeSolver {
    constructor(cube){
        this.rubeCube = cube;
        this.copyCube = _.cloneDeep(cube);
        this.moveQueue = [];
    }

    AddToCross(piece, color){
        let Case2 = function(face, otherFace, opColor) {
            while(!otherFace.IsCorrectOrientation()){
                this.MoveAndQueue(opColor, 'cw', this.moveCount);
            }
            while(!face.IsCorrectOrientation()){
                this.MoveAndQueue(otherFace.color, 'cw');
            }
        }
        Case2 = Case2.bind(this);
        let Case3 = function(face, otherFace, opColor) {
            while(!IsSameCoordinate(face.orientation, otherFace.solvedOrientation)){
                this.MoveAndQueue(opColor, 'cw');
            }
            this.MoveAndQueue(otherFace.color, 'cw');
            this.MoveAndQueue(color, 'cw');
            this.MoveAndQueue(Face.AdjacentFace(otherFace.color, color, 'l'), 'ccw');
            this.MoveAndQueue(color, 'ccw');
        }
        Case3 = Case3.bind(this);
        let Case4 = function(face, otherFace, opColor) { 
            let adjFaceColor = Face.OrientationToColor[otherFace.orientation];
            let frontFaceColor = Face.OrientationToColor[face.orientation];
            let direction = (adjFaceColor === Face.AdjacentFace(frontFaceColor,color,'l'))? "cw":"ccw"
            this.MoveAndQueue(adjFaceColor, direction);
            this.MoveAndQueue(opColor, 'cw');
            direction = direction === "cw"? "ccw":"cw";
            this.MoveAndQueue(adjFaceColor, direction);
            Case2(face, otherFace, opColor);
        }
        Case4 = Case4.bind(this);
        let Case5 = function(face, otherFace, opColor) { 
            let frontFaceColor = Face.OrientationToColor[face.orientation];
            this.MoveAndQueue(frontFaceColor, "cw");
            Case4(face, otherFace, opColor);
        }
        Case5 = Case5.bind(this);
        let Case6 = function(color) { 
            let frontFaceColor = Face.OrientationToColor[otherFace.orientation];
            this.MoveAndQueue(frontFaceColor, "cw");
            this.MoveAndQueue(frontFaceColor, "cw");
            Case2(face, otherFace, opColor);
        }
        Case6 = Case6.bind(this);

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
        let case2 = function(piece, color, opColor){
            while(!IsBelow(piece, color)){
                this.MoveAndQueue(opColor, 'cw');
            }
            // Find other faces of piece
            let otherFaces = piece.faces.filter(face => face.color != color);
            // Face in which the right is the other face
            let rightFace = Face.AdjacentFace(otherFaces[0].color, color, 'r') === otherFaces[1].color? otherFaces[1]:otherFaces[0];
            while(!piece.IsCorrectLocation() || !piece.IsCorrectOrientation()){
                this.MoveAndQueue(rightFace.color,'ccw');
                this.MoveAndQueue(opColor,'ccw');
                this.MoveAndQueue(rightFace.color,'cw');
                this.MoveAndQueue(opColor,'cw');
            }
        }
        case2 = case2.bind(this);
        let case3 = function(piece, color, opColor) {
            // Put piece on bottom, then use case2
            // tempPiece - Making a piece that represents the piece that should be in the location the current piece is
            let tempPiece = new Piece(piece.location, 1);
            let otherFaces = tempPiece.faces.filter(face => face.color != color);
            let rightFace = Face.AdjacentFace(otherFaces[0].color, color, 'r') === otherFaces[1].color? otherFaces[1]:otherFaces[0];
            this.MoveAndQueue(rightFace.color,'ccw');
            this.MoveAndQueue(opColor,'ccw');
            this.MoveAndQueue(rightFace.color,'cw');
            this.MoveAndQueue(opColor,'cw');
            case2(piece, color, opColor);
        }
        case3 = case3.bind(this);

        let opColor = Face.OppositeColorOf[color];
        let pieceOnBottom = piece.IsOnSameFace(opColor);
        let pieceOnTop = piece.IsOnSameFace(color);

        // Case 1: Already in solved location
        if (piece.IsCorrectLocation() && piece.IsCorrectOrientation()) return;
        // Case 2: Piece is on bottom row
        else if (pieceOnBottom) {
           case2(piece, color, opColor);
        }
        // Case 3: Piece is on top row but not in solved location
        else if (pieceOnTop) {
            case3(piece, color, opColor);
        }
    }

    AddToSecondLayer(piece, color) {

        let algorithm = function(frontFaceColor, color, opColor, dir){
            // let faceNotOpColor = piece.faces.filter(face => !IsSameCoordinate(face.orientation, Face.ColorToOrientation[opColor]))[0];
            let adjColor = Face.AdjacentFace(frontFaceColor, color, dir);
            if (dir === 'l'){
                this.MoveAndQueue(opColor, 'cw');
                this.MoveAndQueue(adjColor, 'cw');
                this.MoveAndQueue(opColor, 'ccw');
                this.MoveAndQueue(adjColor, 'ccw');
                this.MoveAndQueue(opColor, 'ccw');
                this.MoveAndQueue(frontFaceColor, 'ccw');
                this.MoveAndQueue(opColor, 'cw');
                this.MoveAndQueue(frontFaceColor, 'cw');
            } else {
                this.MoveAndQueue(opColor, 'ccw');
                this.MoveAndQueue(adjColor, 'ccw');
                this.MoveAndQueue(opColor, 'cw');
                this.MoveAndQueue(adjColor, 'cw');
                this.MoveAndQueue(opColor, 'cw');
                this.MoveAndQueue(frontFaceColor, 'cw');
                this.MoveAndQueue(opColor, 'ccw');
                this.MoveAndQueue(frontFaceColor, 'ccw');
            }
        }
        algorithm = algorithm.bind(this);
        
        let case2 = function(piece, color, opColor) {
            // Find face that is not in direction of opColor
            let faceOpColor = piece.faces.filter(face => IsSameCoordinate(face.orientation, Face.ColorToOrientation[opColor]))[0];
            let faceNotOpColor = piece.faces.filter(face => !IsSameCoordinate(face.orientation, Face.ColorToOrientation[opColor]))[0];
            // Find where the piece needs to go before performing left or right algorithm 
            let algDir = Face.AdjacentFace(faceNotOpColor.color, color, 'l') === faceOpColor.color ? 'l':'r';
            // Get piece there
            while(!faceNotOpColor.IsCorrectOrientation()){
                this.MoveAndQueue(opColor, 'cw');
            }
            algorithm(faceNotOpColor.color, color, opColor, algDir);
        }
        case2 = case2.bind(this);

        let case3 = function(piece, color, opColor) {
            // Find a candidate piece that can be replaced
            let opColorEdgePieces = this.copyCube.GetPiecesOfType(PieceType.edge, opColor)
            let candidate = opColorEdgePieces.filter(piece => piece.IsOnSameFace(opColor))[0];
            // Put candidate in correct location then do l or r algorithm
            let faceNotOpColor = candidate.faces.filter(face => !IsSameCoordinate(face.orientation, Face.ColorToOrientation[opColor]))[0];
            // Put the candidate in the correct faces (doesn matter what face)
            while(!IsSameCoordinate(faceNotOpColor.orientation, piece.faces[0].orientation)) {
                this.MoveAndQueue(opColor, 'cw');
            }

            let colorCadidateIsOn = Face.OrientationToColor[faceNotOpColor.orientation];
            let colorPieceIsOn = Face.OrientationToColor[piece.faces[1].orientation];

            let algDir = Face.AdjacentFace(colorCadidateIsOn, color, 'r') ===  colorPieceIsOn? 'r':'l';
            algorithm(colorCadidateIsOn, color, opColor, algDir);
            case2(piece, color, opColor);
        }
        case3 = case3.bind(this);

        let opColor = Face.OppositeColorOf[color];
        // Case 1: Already in solved location
        if (piece.IsCorrectLocation() && piece.IsCorrectOrientation()) return;
        // Case 2: Piece is on opColor face
        else if (piece.IsOnSameFace(opColor)){
            case2(piece, color, opColor);
        }
        // Case 3: Piece is not on opColor but is either wrong location or right location but wrong orientation
        else {
            case3(piece, color, opColor);
        }
    }

    SolveCross(color) {
        if (this.moveQueue.length === 0){
            this.copyCube = _.cloneDeep(this.rubeCube);
            this.ReadFromQueue(50, 100);
        }
        let pieces = this.copyCube.GetPiecesOfType(PieceType.edge, color);
        pieces.forEach(piece => {
            this.AddToCross(piece, color);
        })
    }

    SolveCorners(color) {
        if (this.moveQueue.length === 0){
            this.copyCube = _.cloneDeep(this.rubeCube);
            this.ReadFromQueue(50, 100);
        }
        let pieces = this.copyCube.GetPiecesOfType(PieceType.corner, color);
        pieces.forEach(piece => {
            this.AddToCorners(piece, color);
        })
    }

    SolveSecondLayer(color) {
        if (this.moveQueue.length === 0){
            this.copyCube = _.cloneDeep(this.rubeCube);
            this.ReadFromQueue(50, 100);
        }
        let opColor = Face.OppositeColorOf[color];
        // Find all pieces that don't have color or opColor
        let pieces = [];
        this.copyCube.cubePieces.forEach(piece => {
            let isType = piece.type === PieceType.edge;
            let isNotColor = !piece.ContainsColor(color);
            let isNotOpColor = !piece.ContainsColor(opColor);
            if (isType && isNotColor && isNotOpColor){
                pieces.push(piece);
            }
        })
        pieces.forEach(piece => {
            this.AddToSecondLayer(piece, color)
        })
    }

    SolveBottomCross(color){
        // Find opColor edge pieces
        let opColor = Face.OppositeColorOf[color];
        this.rubeCube.GetPiecesOfType()

        // Find pieces that are properly oriented
    }

    SolveAll(color){
        this.SolveCross(color);
        this.SolveCorners(color);
        this.SolveSecondLayer(color);
    }

    MoveAndQueue(color, direction){
        this.moveQueue.push({
            col: color,
            dir: direction,
        })
        this.copyCube.Move(color,direction,false);
    }

    UndoMoves(){
        let reversedQueue = this.moveQueue.reverse();
        reversedQueue.forEach((element) => {
            let newDir = element.dir === 'cw'? 'ccw':'cw'
            this.rubeCube.Move(element.col, newDir, false);
        })
        this.moveQueue.reverse();
    }

    ReadFromQueue(turnSpeed, interval){
        let readingInterval = setInterval(() => {
            if (this.moveQueue.length != 0){
                // pull from queue
                let move = this.moveQueue.shift();
                this.rubeCube.Move(move.col, move.dir, true, turnSpeed);
            } else {
                clearInterval(readingInterval);
            }
        }, interval + turnSpeed);
    }

}

function IsSameCoordinate(coordinate1, coordinate2){
    for (let i=0; i< coordinate1.length; i++){
        if (coordinate1[i] !== coordinate2[i]) return false;
    }
    return true
}
