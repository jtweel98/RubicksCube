class CubeSolver {
    constructor(cube){
        this.rubeCube = cube;
        this.copyCube = _.cloneDeep(cube);
        this.moveQueue = [];
        this.moveInterval = 70;
        this.moveSpeed = 100;
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
            this.ReadFromQueue(this.moveSpeed, this.moveInterval);
        }
        let pieces = this.copyCube.GetPiecesOfType(PieceType.edge, color);
        pieces.forEach(piece => {
            this.AddToCross(piece, color);
        })
    }

    SolveCorners(color) {
        if (this.moveQueue.length === 0){
            this.copyCube = _.cloneDeep(this.rubeCube);
            this.ReadFromQueue(this.moveSpeed, this.moveInterval);
        }
        let pieces = this.copyCube.GetPiecesOfType(PieceType.corner, color);
        pieces.forEach(piece => {
            this.AddToCorners(piece, color);
        })
    }

    SolveSecondLayer(color) {
        if (this.moveQueue.length === 0){
            this.copyCube = _.cloneDeep(this.rubeCube);
            this.ReadFromQueue(this.moveSpeed, this.moveInterval);
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
        if (this.moveQueue.length === 0){
            this.copyCube = _.cloneDeep(this.rubeCube);
            this.ReadFromQueue(this.moveSpeed, this.moveInterval);
        }
        // Find opColor edge pieces
        let opColor = Face.OppositeColorOf[color];
        let edgePieces = this.copyCube.GetPiecesOfType(PieceType.edge, opColor);
        let correctOri = [];
        let incorrectOri = [];
        edgePieces.forEach((piece) => {
            let faceOrientation = piece.GetFace(opColor).orientation;
            if (IsSameCoordinate(faceOrientation, Face.ColorToOrientation[opColor])){
                correctOri.push(piece);
            } else {
                incorrectOri.push(piece);
            }
        });
        // Check if all pieces are in the proper place
        if (incorrectOri.length === 0) return;
        // Checking if it's a dot
        let isDot = correctOri.length === 0
        if (isDot){
            let otherFace = incorrectOri[0].faces.filter((face) => !IsSameCoordinate(face.orientation, Face.ColorToOrientation[opColor]))[0];
            let frontColor = Face.OrientationToColor[otherFace.orientation];
            let rightColor = Face.AdjacentFace(frontColor, opColor, 'r');
            this.MoveAndQueue(frontColor, 'cw');
            this.MoveAndQueue(rightColor, 'cw');
            this.MoveAndQueue(opColor, 'cw');
            this.MoveAndQueue(rightColor, 'ccw');
            this.MoveAndQueue(opColor, 'ccw');
            this.MoveAndQueue(frontColor, 'ccw');
            this.SolveBottomCross(color);
        } else {
            // Checking if it's a line
            let otherFace = correctOri[0].faces.filter((face) => face.color !== opColor)[0];
            let isLine = correctOri[1].IsOnSameFace(Face.OppositeColorOf[Face.OrientationToColor[otherFace.orientation]]);

            if (isLine){
                let otherFace = incorrectOri[0].faces.filter((face) => !IsSameCoordinate(face.orientation, Face.ColorToOrientation[opColor]))[0];
                let frontColor = Face.OrientationToColor[otherFace.orientation];
                let rightColor = Face.AdjacentFace(frontColor, opColor, 'r');
                this.MoveAndQueue(frontColor, 'cw');
                this.MoveAndQueue(rightColor, 'cw');
                this.MoveAndQueue(opColor, 'cw');
                this.MoveAndQueue(rightColor, 'ccw');
                this.MoveAndQueue(opColor, 'ccw');
                this.MoveAndQueue(frontColor, 'ccw');
            } else  { 
                let otherFace = incorrectOri[0].faces.filter((face) => !IsSameCoordinate(face.orientation, Face.ColorToOrientation[opColor]))[0];
                let rightColor = Face.AdjacentFace(Face.OrientationToColor[otherFace.orientation], opColor, 'r');
                let frontColor = Face.OrientationToColor[otherFace.orientation];
                if (correctOri[0].IsOnSameFace(rightColor) || correctOri[1].IsOnSameFace(rightColor)){
                    frontColor = Face.AdjacentFace(frontColor, opColor, 'l');
                }
                rightColor = Face.AdjacentFace(frontColor, opColor, 'r');
                this.MoveAndQueue(frontColor, 'cw');
                this.MoveAndQueue(opColor, 'cw');
                this.MoveAndQueue(rightColor, 'cw');
                this.MoveAndQueue(opColor, 'ccw');
                this.MoveAndQueue(rightColor, 'ccw');
                this.MoveAndQueue(frontColor, 'ccw');
            }
        }
    }

    SolveBottomFace(color){
        let algorithm = function(rightColor, opColor) {
            this.MoveAndQueue(rightColor, 'cw');
            this.MoveAndQueue(opColor, 'cw');
            this.MoveAndQueue(rightColor, 'ccw');
            this.MoveAndQueue(opColor, 'cw');
            this.MoveAndQueue(rightColor, 'cw');
            this.MoveAndQueue(opColor, 'cw');
            this.MoveAndQueue(opColor, 'cw');
            this.MoveAndQueue(rightColor, 'ccw');
        }
        algorithm = algorithm.bind(this);

        if (this.moveQueue.length === 0){
            this.copyCube = _.cloneDeep(this.rubeCube);
            this.ReadFromQueue(this.moveSpeed, this.moveInterval);
        }
        let opColor = Face.OppositeColorOf[color];
        let cornerPieces = this.copyCube.GetPiecesOfType(PieceType.corner, opColor);
        let correctOri = [];
        let incorrectOri = [];
        let otherFace = cornerPieces[0].faces.filter((face) => !IsSameCoordinate(face.orientation, Face.ColorToOrientation[opColor]))[0];
        let rightColor = Face.OrientationToColor[otherFace.orientation];
        let counter = 0;
        while(correctOri.length !== 1){
            if (counter >= 4){
                this.UndoMoves(counter*8)
                this.MoveAndQueue(opColor, 'cw');
                counter = 0;
            } 
            correctOri = [];
            incorrectOri = [];
            cornerPieces.forEach((piece) => {
                let faceOrientation = piece.GetFace(opColor).orientation;
                if (IsSameCoordinate(faceOrientation, Face.ColorToOrientation[opColor])){
                    correctOri.push(piece);
                } else {
                    incorrectOri.push(piece);
                }
            });
            if (incorrectOri.length === 0) return;
            if (correctOri.length === 1) break;
            algorithm(rightColor, opColor);
            counter++;
        }
        // Now we have yellow face with one piece in correct orientation
        let otherFacesOfCorrectPiece = correctOri[0].faces.filter((face) => face.color !== opColor);
        let firstFaceColor = Face.OrientationToColor[otherFacesOfCorrectPiece[0].orientation];
        let secondFaceColor = Face.OrientationToColor[otherFacesOfCorrectPiece[1].orientation];
        rightColor = Face.AdjacentFace(firstFaceColor, opColor, 'r');
        rightColor = rightColor === secondFaceColor ? Face.AdjacentFace(secondFaceColor, opColor, 'r'):rightColor;

        while(incorrectOri.length > 0){
            algorithm(rightColor, opColor);
            correctOri = [];
            incorrectOri = [];
            cornerPieces.forEach((piece) => {
                let faceOrientation = piece.GetFace(opColor).orientation;
                if (IsSameCoordinate(faceOrientation, Face.ColorToOrientation[opColor])){
                    correctOri.push(piece);
                } else {
                    incorrectOri.push(piece);
                }
            });
            if (incorrectOri.length > 0){
                this.MoveAndQueue(opColor, 'cw');
                this.MoveAndQueue(opColor, 'cw');
            }
        }
    }

    SolveBottomCorners(color){
        let algorithm = function(frontColor, opColor){
            let leftColor = Face.AdjacentFace(frontColor, opColor, 'l');
            let backColor = Face.AdjacentFace(leftColor, opColor, 'l');
            this.MoveAndQueue(leftColor, 'ccw');
            this.MoveAndQueue(backColor, 'cw');
            this.MoveAndQueue(leftColor, 'ccw');
            this.MoveAndQueue(frontColor, 'ccw');
            this.MoveAndQueue(frontColor, 'ccw');
            this.MoveAndQueue(leftColor, 'cw');
            this.MoveAndQueue(backColor, 'ccw');
            this.MoveAndQueue(leftColor, 'ccw');
            this.MoveAndQueue(frontColor, 'ccw');
            this.MoveAndQueue(frontColor, 'ccw');
            this.MoveAndQueue(leftColor, 'cw');
            this.MoveAndQueue(leftColor, 'cw');
        }
        algorithm = algorithm.bind(this);
        if (this.moveQueue.length === 0){
            this.copyCube = _.cloneDeep(this.rubeCube);
            this.ReadFromQueue(this.moveSpeed, this.moveInterval);
        }
        let opColor = Face.OppositeColorOf[color];
        // Get all corner pieces
        let cornerPieces = this.copyCube.GetPiecesOfType(PieceType.corner, opColor);
        // Turn until we see two corners in the proper location
        let solvedCorners = [];
        let counter = 0;
        while(solvedCorners.length !== 2){
            solvedCorners = [];
            this.MoveAndQueue(opColor, 'cw');
            counter++;
            cornerPieces.forEach((piece) => {
                if (piece.IsCorrectOrientation() && piece.IsCorrectLocation()){
                    solvedCorners.push(piece);
                }
            });
            if (solvedCorners.length === 4) return;
        }
        this.UndoMoves(counter);
        // If 2 coordinates are different then perform algorithm on arbitrary face
        let numDiffCoordinates = 0;
        for (let i = 0; i<3; i++){
            if (solvedCorners[0].location[i] !== solvedCorners[1].location[i]){
                numDiffCoordinates++;
            }
        }
        if (numDiffCoordinates > 1) {
            let frontColor = solvedCorners[0].faces.filter((face) => face.color !== opColor)[0].color;
            algorithm(frontColor, opColor);
            this.SolveBottomCorners(color);
        } else {
            // At this point we need to find the face where the two pieces are and pass that to the algorithm
            // Find coordinate that is the same as the other piece (other than the opColor face)
            let commonCoordinate = [0,0,0];
            let opColorCoordinate = Face.ColorToOrientation[opColor];
            for (let i = 0; i < 3; i++){
                let sameCoordinate = solvedCorners[0].location[i] === solvedCorners[1].location[i];
                let sameAsOpCoordinate = solvedCorners[0].location[i] === opColorCoordinate[i];
                if (sameCoordinate && !sameAsOpCoordinate){
                    commonCoordinate[i] = solvedCorners[0].location[i];
                }
            }
            let frontColor = Face.OrientationToColor[commonCoordinate];
            algorithm(frontColor, opColor);
        }
    }

    SolveBottomEdges(color){
        let algorithm = function(backColor, opColor, dir){
            let frontColor = Face.OppositeColorOf[backColor];
            let rightColor = Face.AdjacentFace(frontColor, opColor, 'r');
            let leftColor = Face.AdjacentFace(frontColor, opColor, 'l');
            this.MoveAndQueue(frontColor, 'cw');
            this.MoveAndQueue(frontColor, 'cw');
            this.MoveAndQueue(opColor, dir);
            this.MoveAndQueue(leftColor, 'cw');
            this.MoveAndQueue(rightColor, 'ccw');
            this.MoveAndQueue(frontColor, 'cw');
            this.MoveAndQueue(frontColor, 'cw');
            this.MoveAndQueue(leftColor, 'ccw');
            this.MoveAndQueue(rightColor, 'cw');
            this.MoveAndQueue(opColor, dir);
            this.MoveAndQueue(frontColor, 'cw');
            this.MoveAndQueue(frontColor, 'cw');
        }
        algorithm = algorithm.bind(this);

        if (this.moveQueue.length === 0){
            this.copyCube = _.cloneDeep(this.rubeCube);
            this.ReadFromQueue(this.moveSpeed, this.moveInterval);
        }

        let opColor = Face.OppositeColorOf[color];
        // Get all corner pieces
        let cornerPieces = this.copyCube.GetPiecesOfType(PieceType.corner, opColor);
        // Turn until all corner are in correct location
        while(!cornerPieces[0].IsCorrectLocation() || !cornerPieces[0].IsCorrectOrientation()){
            this.MoveAndQueue(opColor, 'cw');
        }
        let edgePieces = this.copyCube.GetPiecesOfType(PieceType.edge, opColor);
        let solvedEdge = null;
        edgePieces.forEach((piece) => {
            if (piece.IsCorrectLocation() && piece.IsCorrectOrientation()){
                solvedEdge = piece;
            }
        });
        if (solvedEdge === null){
            let backColor = edgePieces[0].faces.filter((face) => face.color !== opColor)[0].color;
            algorithm(backColor, opColor, 'cw');
            this.SolveBottomEdges(color);
        }
        else {
            let backColor = solvedEdge.faces.filter((face) =>face.color !== opColor)[0].color;
            algorithm(backColor, opColor, 'cw');
            edgePieces.forEach((piece) => {
                if (!piece.IsCorrectLocation() || !piece.IsCorrectOrientation()){
                    algorithm(backColor, opColor, 'cw');
                }
            });
        }
    }

    SolveAll(color){
        this.SolveCross(color);
        this.SolveCorners(color);
        this.SolveSecondLayer(color);
        this.SolveBottomCross(color);
        this.SolveBottomFace(color);
        this.SolveBottomCorners(color);
        this.SolveBottomEdges(color);
    }

    MoveAndQueue(color, direction){
        this.moveQueue.push({
            col: color,
            dir: direction,
        })
        this.copyCube.Move(color,direction,false);
    }

    UndoMoves(numMoves){
        for(let i = 0; i<numMoves; i++){
            let move = this.moveQueue.pop();
            let dir = move.dir === 'cw'? 'ccw':'cw';
            this.copyCube.Move(move.col, dir, false);
        }
    }

    ReadFromQueue(turnSpeed, interval){
        let readingInterval = setInterval(() => {
            if (this.moveQueue.length !== 0){
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
