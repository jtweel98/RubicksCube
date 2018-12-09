/*
* Definition - Represents the definition of a single Rubick's cube piece, either edge, corner or centre
* Field(s): 
*  cube: THREE.Mesh() - The three.js visual representation of a piece (THREE.BoxGeometry)
*  location: Array - The current 3D coordinate of the piece relative to the centre of the cube [0,0,0]
*  solvedLocation: Array - the 3D coordinate representing the correct solved location of the piece
*  faces: Array - An array of face objects which describe the colors on the peice and the piece's orientation
*  type: PieceType - The type of piece, either edge, corner or centre
*/
class Piece {
    constructor(location, size) {
        this.location = location;
        this.solvedLocation = this.location;
        this.faces = this.FindPieceFaces();
        this.cube = this.CreateCube(size,'rgb(50,50,50)');
        // A piece's type can be determined based on the number of non zero elements in its location
        this.type = Math.abs(this.location[0]) + Math.abs(this.location[1]) + Math.abs(this.location[2]);
    }

    /*
    * Definition - Created and returns a three.js mesh object of the given color
    * and size specified as inputs. This cube represents the visual part of a piece object.
    * The mesh object has a box geomerty and mesh phong material
    * Input - size: Integer, color: String (RGB value ex: 'rgb(211,211,211)')
    * Output - mesh: THREE.Mesh()
    */
    CreateCube(size, color) {
        let geometry = new THREE.BoxGeometry(size,size,size);
        let material = new THREE.MeshPhongMaterial({ color: color });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        this.PaintPiece(mesh, color);
        return mesh;
    }

    /*
    * Definition - Determines the number of faces, their orientation and color based on 'this' piece's
    * location. An array of these face objects is returned.
    * Input - None
    * Output - pieceFaces: Array
    */
    FindPieceFaces() {
        let pieceFaces = [];
        this.location.forEach((element, index) => {
            if (element != 0) {
                let orientation = [0,0,0];
                orientation[index] = element;
                pieceFaces.push(new Face(orientation));
            }
        })
        return pieceFaces;
    }

    /*
    * Definition - Helper function used in this.CreateCube() to color the faces of 'this' piece.
    * Input - THREE.Mesh() 
    * Output - None
    */
    PaintPiece(mesh){
        // defaultMaterial is the grey color given to all faces which require no color
        let defaultMaterial = new THREE.MeshPhongMaterial({
            color: mesh.material.color,
            side: THREE.DoubleSide
        });
        let faceMaterials = new Array(6).fill(defaultMaterial);
        // map is used to map each posible face orientation to the index of the face material array
        // which will become the mesh's material
        let map = new WeakMap();
        map[[1,0,0]] = 0;
        map[[-1,0,0]] = 1;
        map[[0,1,0]] = 2;
        map[[0,-1,0]] = 3;
        map[[0,0,1]] = 4;
        map[[0,0,-1]] = 5;

        this.faces.forEach((face) => {
            let index = map[face.solvedOrientation];
            faceMaterials[index] = new THREE.MeshPhongMaterial({
                color:Face.ColorToHex[face.color], 
                side: THREE.DoubleSide
            });
        })
        mesh.material = faceMaterials;
    }

    /*
    * Definition - If 'this' piece contains the given color then return true, else return false
    * Input - color: String ('w','r','o','g','b','y')
    * Output - containsColor: Boolean
    */
    ContainsColor(color){
        for (let i =0; i< this.faces.length; i++){
            if (this.faces[i].color == color){
                return true;
            }
        }
        return false
    }

    /*
    * Definition - Find the index in the this.faces array where the given color color is found.
    * returns -1 if that color is not found on the cube
    * Input - color: String ('w','r','o','g','b','y')
    * Output - faceIndex: Integer
    */
    FindIndexOfFace(color){
        let faceIndex = -1;
        this.faces.forEach((face, index) => {
            if (face.color == color){
                faceIndex = index;
            }
        })
        return faceIndex;
    }

    IsCorrectLocation(){
        for (let i=0; i<this.location.length; i++){
            if (this.location[i] !== this.solvedLocation[i]) return false;
        }
        return true
    }

    IsCorrectOrientation() {
        for (let i = 0; i<this.faces.length; i++){
            if (!this.faces[i].IsCorrectOrientation()) return false;
        }
        return true;
    }

    IsOnSameFace(color){
        let coordinate = Face.ColorToOrientation[color]
        for(let i=0; i<coordinate.length; i++){
            if (coordinate[i] != 0){
                return coordinate[i] === this.location[i];
            }
        }
    }

    GetFace(color) {
        for (let i = 0; i<this.faces.length; i++) {
            if (this.faces[i].color === color) return this.faces[i];
        }
        console.log("Color not found on piece");
        return -1;
    }

    /*
    * Definition - TEMPORARY FUCNTION FOR FINDING A PIECE
    * Input - 
    * Output - 
    */
    ListColors(){
        let str = "";
        this.faces.forEach(face => {
            str = str + ", " + face.color
        })
        return str;
    }
    
}

let PieceType = {
    centre : 1,
    edge : 2,
    corner : 3,
}