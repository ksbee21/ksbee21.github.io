import * as TypedMatrixUtils from './TypedMatrixUtils.js';
import * as GLUtils from './GLUtils.js';

const makeOrbitMatrix = (axis, wMat, theta) => {
    if ( !wMat )
        wMat = TypedMatrixUtils.makeIdentityMatrix(4);
    
    if ( axis === 1 || axis === 'x') {
        return TypedMatrixUtils.multiplyMatrix (TypedMatrixUtils.makeRotateXMatrix3D(theta), wMat);
    } else if ( axis === 2 || axis === 'y') {
        return TypedMatrixUtils.multiplyMatrix (TypedMatrixUtils.makeRotateYMatrix3D(theta), wMat);
    } else if ( axis === 3 || axis === 'z' ) {
        return TypedMatrixUtils.multiplyMatrix (TypedMatrixUtils.makeRotateZMatrix3D(theta), wMat);
    }
    return TypedMatrixUtils.makeIdentityMatrix(4);
};

const makeRotateMatrix = (axis, wMat, theta) => {
    if ( !wMat )
        wMat = TypedMatrixUtils.makeIdentityMatrix(4);
    
    if ( axis === 1 || axis === 'x') {
        return TypedMatrixUtils.multiplyMatrix (wMat, TypedMatrixUtils.makeRotateXMatrix3D(theta));
    } else if ( axis === 2 || axis === 'y') {
        return TypedMatrixUtils.multiplyMatrix (wMat, TypedMatrixUtils.makeRotateYMatrix3D(theta));
    } else if ( axis === 3 || axis === 'z' ) {
        return TypedMatrixUtils.multiplyMatrix (wMat, TypedMatrixUtils.makeRotateZMatrix3D(theta));
    }
    return TypedMatrixUtils.makeIdentityMatrix(4);
};

const makePendulumMatrix = (axis, wMat, trans) => {
    if ( !wMat )
        wMat = TypedMatrixUtils.makeIdentityMatrix(4);
    
    if ( axis === 1 || axis === 'x') {
        return TypedMatrixUtils.multiplyMatrix (TypedMatrixUtils.makeTranslateMatrix3D(trans,0,0),wMat);
    } else if ( axis === 2 || axis === 'y') {
        return TypedMatrixUtils.multiplyMatrix (TypedMatrixUtils.makeTranslateMatrix3D(0,trans,0),wMat);
    } else if ( axis === 3 || axis === 'z' ) {
        return TypedMatrixUtils.multiplyMatrix (TypedMatrixUtils.makeTranslateMatrix3D(0,0,trans),wMat);
    }
    return TypedMatrixUtils.makeIdentityMatrix(4);
};

let __repeat__Sequence__      = 0;

const makeUniqueTimeID = () => {
    let n = Date.now();
    __repeat__Sequence__++;
    if ( __repeat__Sequence__ > 9999 ) {
        __repeat__Sequence__ = 0;
    }
    return "U_"+n+"_"+__repeat__Sequence__+"_ID";
};

export class GLProgram {
    constructor(programID) {
        if ( !programID )
            programID = makeUniqueTimeID();

        this.programID      = programID;
        this.program        = undefined;
        this.uniformMap     = new Map();
        this.itemMap        = new Map();
    };

    initResource = (gl,program,uniformArray) => {
        this.program = program;
        for ( let i = 0; i < uniformArray.length; i++ ) {
            if ( !uniformArray[i].data ) {
                uniformArray[i].data = TypedMatrixUtils.makeIdentityMatrix(4);
            }
        }
        GLUtils.setUniformLocations(gl, program, uniformArray);    
        for ( let i = 0; i < uniformArray.length; i++ ) {
            let uName = uniformArray[i].uniformName;
            this.uniformMap.set(uName,uniformArray[i]);
        }
    };

    setUniformMatrix = (uName, matrix) => {
        if ( !this.uniformMap.has(uName)) {
            return false;
        }
        this.uniformMap.get(uName).data = matrix;
        return true;
    };

    render = (gl,isAutoClean) => {
        gl.useProgram(this.program);

        for ( let key of this.uniformMap.keys() ) {
            let uniform = this.uniformMap.get(key);
            GLUtils.setUniformValues( gl, uniform.uLocation, 
                uniform.data, uniform.dataType, uniform.dataKind, uniform.dataSize, uniform.transpose);
//            console.log ( uniform.uniformName, uniform.data);
        }

        for ( let key of this.itemMap.keys() ) {
            this.itemMap.get(key).render(gl, isAutoClean);
        }
        if ( isAutoClean ) {
            this.clean(gl);
        }
    };

    clean = (gl) => {
        gl.useProgram(null);
    };

    appendItem = (item) => {
        if(!item) 
            return false;
        if ( this.itemMap.has(item.getItemID()) ) {
            return false;
        }
        this.itemMap.set(item.getItemID(), item);
    };

    removeItem = (item) => {
        if (!item)
            return false;
        this.itemMap.delete(item.getItemID());
    };
}

export class GLItem {
    constructor(itemID) {
        if ( !itemID ) 
            itemID = makeUniqueTimeID();
        this.itemID         = itemID;
        this.vao            = undefined;
        this.uWorldName     = "worldMatrix";
        this.localMatrix    = undefined;
        this.worldMatrix    = undefined;
        this.uniformMap     = new Map();
        this.indexSize      = 0;
        this.indexType      = undefined;//gl.UNSIGNED_INT;  //gl.UNSIGNED_SHORT
        this.offset         = 0;
        this.subItems       = new Map();
        /**
         * {animationType:1, axis : 1, step : 0, min : 0, max : 360, current : 0, direction : 1,  }
         * animationType => 1 : rotation(??????),  2 : pendulum, 3 : orbit 
         * axis => 1,x : x???, 2 or y : y???, 3 or z : z ???
         * step => ?????????
         * min : ?????????
         * max : ?????????
         * current : ?????? ???
         * direction : 1 : ???????????? , -1 : ???????????? 
         * */
        this.animationMap   = new Map();
    };

    initResource = (gl, program, attributeArray, uniformArray, indexInfos, textureInfos, userWorldName  ) => {
        for ( let i = 0; i < uniformArray.length; i++ ) {
            let uName = uniformArray[i].uniformName;
            this.uniformMap.set(uName,{...uniformArray[i]});
            let flag = (uName === userWorldName);
            this.uniformMap.get(uName).isLocal = flag;
        }
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        GLUtils.setAttributeValues(gl, program, attributeArray);
        GLUtils.setIndexInfos(gl, indexInfos);
        this.indexSize = indexInfos.indexSize;
        this.indexType = indexInfos.indexType;
        this.uWorldName = userWorldName;
        this.offset = indexInfos.offset;
        this.animationTime    = undefined;
    };

    makeRotateAnimations = (axis, step, direction) => {
        const animationType = 1;
        if ( !this.animationMap.has(animationType) ) {
            this.animationMap.set(animationType,[]);
        }
        this.animationMap.get(animationType).push({"animationType":animationType, "axis":axis, "step":step, "min":0, "max":360, "current":0, "direction":direction});
    };

    makeOrbitAnimations = (axis, step, direction) => {
        const animationType = 3;
        if ( !this.animationMap.has(animationType) ) {
            this.animationMap.set(animationType,[]);
        }
        this.animationMap.get(animationType).push({"animationType":animationType, "axis":axis, "step":step, "min":0, "max":360, "current":0, "direction":direction});
    };

    makePendulumAnimation = (axis, step, direction, min, max) => {
        if ( min === undefined || min === null ) 
            min = -1;
        if ( max === undefined || max === null ) 
            max = 1;

        const animationType = 2;
        if ( !this.animationMap.has(animationType) ) {
            this.animationMap.set(animationType,[]);
        }
        this.animationMap.get(animationType).push({"animationType":animationType, "axis":axis, "step":step, "min":min, "max":max, "current":0, "direction":direction});
    }


    resetWorldUniformValues = () => {
        this.worldMatrix = this.localMatrix;

        let delta = 0;
        if ( this.animationTime ) {
            let nowT = Date.now();
            delta = nowT - this.animationTime;
            this.animationTime = nowT;
        } else {
            this.animationTime = Date.now();
        }

        if ( this.animationMap.has(1) ) {
            for ( let i = 0; i < this.animationMap.get(1).length; i++ ) {
                let obj = this.animationMap.get(1)[i];
                if ( obj.direction == 1 ) {
                    obj.current += parseFloat(delta * obj.step );
                    if ( obj.current > obj.max ) {
                        obj.current = obj.min;
                    }
                } else {
                    obj.current -= parseFloat(delta * obj.step );
                    if ( obj.current < obj.min ) {
                        obj.current = obj.max;
                    }
                }
                let theta = (Math.PI * obj.current)/180;
                this.worldMatrix = makeRotateMatrix(obj.axis, this.worldMatrix, theta);
            }
        }

        if ( this.animationMap.has(2) ) {
            for ( let i = 0; i < this.animationMap.get(2).length; i++ ) {
                let obj = this.animationMap.get(2)[i];
                if ( obj.direction == 1 ) {
                    obj.current += parseFloat(delta * obj.step );
                    if ( obj.current > obj.max ) {
                        obj.current = obj.max;
                        obj.direction = -1;
                    }
                } else {
                    obj.current -= parseFloat(delta * obj.step );
                    if ( obj.current < obj.min ) {
                        obj.current = obj.min;
                        obj.direction = 1;
                    }
                }
                this.worldMatrix = makePendulumMatrix(obj.axis, this.worldMatrix, obj.current);
            }
        }

        if ( this.animationMap.has(3) ) {
            for ( let i = 0; i < this.animationMap.get(3).length; i++ ) {
                let obj = this.animationMap.get(3)[i];
                if ( obj.direction == 1 ) {
                    obj.current += parseFloat(delta * obj.step );
                    if ( obj.current > obj.max ) {
                        obj.current = obj.min;
                    }
                } else {
                    obj.current -= parseFloat(delta * obj.step );
                    if ( obj.current < obj.min ) {
                        obj.current = obj.max;
                    }
                }
                let theta = (Math.PI * obj.current)/180;
                this.worldMatrix = makeOrbitMatrix(obj.axis, this.worldMatrix, theta);
            }
        }
        this.uniformMap.get(this.uWorldName).data = this.worldMatrix;
    };

    setLocalMatrix = ( mat ) => {
        this.localMatrix = !mat ? TypedMatrixUtils.makeIdentityMatrix(4) : mat; 
    };

    getItemID = () => {
        return this.itemID;
    };

    render = (gl, isAutoClean) => {
        this.resetWorldUniformValues();

        gl.bindVertexArray(this.vao);
        let uniform = this.uniformMap.get(this.uWorldName);

        //console.log (uniform.uniformName , uniform.data );
        GLUtils.setUniformValues( gl, uniform.uLocation, 
            uniform.data, uniform.dataType, uniform.dataKind, uniform.dataSize, uniform.transpose);

        if ( this.indexSize > 0 ) {
            gl.drawElements(gl.TRIANGLES, this.indexSize, this.indexType,this.offset);
        }
        if ( isAutoClean ) {
            this.clean(gl);
        }
    };

    clean = (gl) => {
        gl.bindVertexArray(null);
    };
};

export class BasicPlane {
    constructor(item) {
        this.positions = [
            // Front face
            -1.0, -1.0,  0.0,
            1.0, -1.0,  0.0,
            1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
        ];

        this.textureCoordinates = [
            // ???
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
        ];

        this.normals = [
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
        ]
        this.colors = [
            1.0,  0.0,  0.0,  1.0,    // first : red
            0.0,  1.0,  0.0,  1.0,    // second: green
            0.0,  0.0,  1.0,  1.0,    // third : blue
            1.0,  0.0,  1.0,  1.0,    // forth vertex: cyan            
        ];

        this.indices = [
            0,  1,  2,      0,  2,  3,    // front
        ];
    };

    setColors = (colors) => {
        if ( colors.length == 16 ) {
            for ( let i = 0; i < 16; i++ ) {
                this.colors[i] = colors[i];
            }
        } else if ( colors.length == 4 ) {
            for ( let i = 0; i < 4; i++ ) {
                for ( let j = 0; j < 4; j++ ) {
                    this.colors[i*4+j] = colors[j];
                }
            }
        } else if ( colors.length == 3 ) {
            for ( let i = 0; i < 4; i++ ) {
                for ( let j = 0; j < 3; j++ ) {
                    this.colors[i*4+j] = colors[j];
                }
                this.colors[i*4+3] = 1.0;
            }
        }
    };

    getCurrentData = () => {
        return {
            positions : positions,
            colors : colors,
            normals : normals, 
            textures : textureCoordinates, 
            indices : indices,
        };
    }
}

export const makeCubeData = () => {
    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    let faceColors = [
          [1.0,  1.0,  1.0,  1.0],    // Front face: white
          [1.0,  0.0,  0.0,  1.0],    // Back face: red
          [0.0,  1.0,  0.0,  1.0],    // Top face: green
          [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
          [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
          [1.0,  0.0,  1.0,  1.0],    // Left face: purple
    ];
/*
      faceColors = [
          [1.0,  1.0,  1.0,  1.0],    // Front face: white
          [0.0,  1.0,  1.0,  1.0],    // Back face: red
          [0.0,  1.0,  1.0,  1.0],    // Top face: green
          [1.0,  1.0,  1.0,  1.0],    // Bottom face: blue
          [1.0,  1.0,  1.0,  1.0],    // Right face: yellow
          [1.0,  1.0,  1.0,  1.0],    // Left face: purple
      ];
*/
    var colors = [];

    for (var j = 0; j < faceColors.length; j++) {
        const c = faceColors[j];

        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }

    const textureCoordinates = [
        // ???
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // ???
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // ???
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // ??????
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // ?????????
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // ??????
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0
    ];

    var vertexNormals = [
        // ???
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

        // ???
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

        // ???
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // ??????
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

        // ?????????
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // ??????
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0
    ];


    const indices = [
          0,  1,  2,      0,  2,  3,    // front
          4,  5,  6,      4,  6,  7,    // back
          8,  9,  10,     8,  10, 11,   // top
          12, 13, 14,     12, 14, 15,   // bottom
          16, 17, 18,     16, 18, 19,   // right
          20, 21, 22,     20, 22, 23,   // left
    ];

    return {
        positions : positions,
        colors : colors,
        normals : vertexNormals, 
        textures : textureCoordinates, 
        indices : indices,
    }
};