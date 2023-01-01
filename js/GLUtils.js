
export const makeCanvasObject = (idValue, parentObj) => {
    let canvasObj = document.getElementById(idValue);
    if ( !canvasObj ) {
        canvasObj = document.createElement("CANVAS");
        canvasObj.setAttribute("id", idValue);
        canvasObj.width = 800;
        canvasObj.height = 800;
        if ( parentObj ) {
            parentObj.appendChild(canvasObj);
        } else {
            document.body.appendChild(canvasObj);
        }
    } else {
        canvasObj.width = canvasObj.clientWidth;
        canvasObj.height = canvasObj.clientHeight;
    }
	return canvasObj;
};

export const makeWebGL = (canvas) => {
    let gl = undefined;
    try {
        gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch ( e ) {
        alert ( "Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
};


export const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if ( success ) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
};

export const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if ( success ) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
};

export const createProgramBySource = ( gl, vs, fs ) => {
    const verShader = createShader(gl,gl.VERTEX_SHADER, vs );
    const fragShader = createShader(gl,gl.FRAGMENT_SHADER, fs );
    const program = createProgram(gl, verShader, fragShader );
    return program;
};

export const getVertexShaderSource = ( typeNum ) => {
    let vs = `#version 300 es
    uniform mat4 worldMatrix, viewMatrix, projectionMatrix;
    in vec3 position;
    in vec3 normal;
    in vec4 colors;
    in vec2 texCoord;

    out vec3 vNormal ;
    out vec2 vTexCoord ;
    out vec4 vColors;

    void main() {
        gl_Position = projectionMatrix * viewMatrix  * worldMatrix * vec4(position, 1.0);
        vNormal = normalize(transpose(inverse(mat3(worldMatrix))) * normal);
        vTexCoord = texCoord;
        vColors = colors;
    }
    `
    switch( typeNum ) {
        case 1 :
            vs = `#version 300 es
            uniform mat4 worldMatrix, viewMatrix, projectionMatrix;
            in vec3 position;
            in vec3 normal;
            in vec4 colors;
        
            out vec3 vNormal ;
            out vec4 vColors;
        
            void main() {
                gl_Position = projectionMatrix * viewMatrix  * worldMatrix * vec4(position, 1.0);
                vNormal = normalize(transpose(inverse(mat3(worldMatrix))) * normal);
                vColors = colors;
            }
            `            
        default :
            break;
    }
    return vs;
};

export const getFragmentShaderSource = ( typeNum ) => {
    let fs = `#version 300 es
    precision highp float;

    in vec2 vTexCoord;
    in vec3 vNormal;
    in vec4 vColors; 

    uniform sampler2D uTexture;
    out vec4 fragColor;

    void main() {
        //fragColor = texture(uTexture,vTexCoord);
        fragColor = vColors;
    }
    `
    switch( typeNum ) {
        case 1 :
            fs = `#version 300 es
            precision highp float;
        
            in vec4 vColors; 
            in vec3 vNormal;
            out vec4 fragColor;
        
            void main() {
                fragColor = vColors;
            }
            `            
            break;
        default :
            break;
    }
    return fs;
}

export const createProgramByType = ( gl, typeNum ) => {
    return createProgramBySource(gl, getVertexShaderSource(typeNum), getFragmentShaderSource(typeNum) );
};


export const setAttributeValue = (gl, program, attributeName, data, size, dataType, normalize, stride, offset) => {
    const gLocation = gl.getAttribLocation(program,attributeName);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    //  Vertex Array Buffer binding ... 

    gl.enableVertexAttribArray(gLocation);
    gl.vertexAttribPointer(gLocation, size, dataType, normalize, stride, offset);
    return gLocation;
};

export const setAttributeValues = (gl, program, attribArray ) => {
    if ( !attribArray || !attribArray.length )
        return undefined;

    
    for ( let i = 0, iSize = attribArray.length; i < iSize; i++ ) {
        attribArray[i].loc = setAttributeValue(gl, program, attribArray[i].attributeName, attribArray[i].data, attribArray[i].size, attribArray[i].dataType, attribArray[i].normalize, 
            attribArray[i].stride, attribArray[i].offset);
    }
    return attribArray;
};

export const setIndexInfos = ( gl,  indexInfo ) => {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexInfo.data, gl.STATIC_DRAW);
};

export const setUniformLocations = (gl, program, uniformArray) => {
    if ( !uniformArray ) 
        return uniformArray;

    for ( let i = 0, iSize = uniformArray.length; i < iSize; i++ ) {
        uniformArray[i].uLocation = gl.getUniformLocation(program, uniformArray[i].uniformName );
    }
    return uniformArray;
};



export const setUniformFloatValue = ( gl, uLocation, uData, dataKind, dataSize, transpose ) => {
    if ( !gl || !uLocation ||  !uData )
        return false;

    switch ( dataKind ) {
        case 1 :    // value 
            if ( dataSize == 1 ) {
                gl.uniform1f(uLocation, uData);
            } else if ( dataSize == 2 ) {
                gl.uniform2f(uLocation, uData);
            } else if ( dataSize == 3 ) {
                gl.uniform3f(uLocation, uData);
            } else if ( dataSize == 4 ) {
                gl.uniform4f(uLocation, uData);
            } else {
                gl.uniform1f(uLocation, uData);
            }
            break;
        case 2 :    // vector  
            if ( dataSize == 1) {
                gl.uniform1fv(uLocation, uData);
            } else if ( dataSize == 2 ) {
                gl.uniform2fv(uLocation, uData);
            } else if ( dataSize == 3 ) {
                gl.uniform3fv(uLocation, uData);
            } else if ( dataSize == 4 ) {
                gl.uniform4fv(uLocation, uData);
            } else {
                gl.uniform4fv(uLocation, uData);
            }
            break;
        case 3 :    // matrix 
            if ( dataSize == 2 ) {
                gl.uniformMatrix2fv(uLocation, transpose, uData);
            } else if ( dataSize == 3 ) {
                gl.uniformMatrix3fv(uLocation, transpose, uData);
            } else if ( dataSize == 4 ) {
                gl.uniformMatrix4fv(uLocation, transpose, uData);
                //alert ( "4 : " + uData + "\n" + transpose );
            } else {
                gl.uniformMatrix4fv(uLocation, transpose, uData);
            }
            break;
        default : 
            gl.uniformMatrix4fv(uLocation, transpose, uData);        
            break;
    }
};

export const setUniformIntValue = ( gl, uLocation, uData, dataKind, dataSize ) => {
    if ( !gl || !uLocation ||  !uData ) {        
        return false;
    }

    switch ( dataKind ) {
        case 1 :    // value 
            if ( dataSize == 1 ) {
                gl.uniform1i(uLocation, uData);
            } else if ( dataSize == 2 ) {
                gl.uniform2i(uLocation, uData);
            } else if ( dataSize == 3 ) {
                gl.uniform3i(uLocation, uData);
            } else if ( dataSize == 4 ) {
                gl.uniform4i(uLocation, uData);
            } else {
                gl.uniform1i(uLocation, uData);
            }
            break;
        case 2 :    // vector  
            if ( dataSize == 1) {
                gl.uniform1iv(uLocation, uData);
            } else if ( dataSize == 2 ) {
                gl.uniform2iv(uLocation, uData);
            } else if ( dataSize == 3 ) {
                gl.uniform3iv(uLocation, uData);
            } else if ( dataSize == 4 ) {
                gl.uniform4iv(uLocation, uData);
            } else {
                gl.uniform4iv(uLocation, uData);
            }
            break;
        default : 
            gl.uniform1i(uLocation,uData);        
            break;
    }
};

export const setUniformUIntValue = ( gl, uLocation, uData, dataKind, dataSize ) => {
    if ( !gl || !uLocation ||  !uData ) {
        return false;
    }

    switch ( dataKind ) {
        case 1 :    // value 
            if ( dataSize == 1 ) {
                gl.uniform1ui(uLocation, uData);
            } else if ( dataSize == 2 ) {
                gl.uniform2ui(uLocation, uData);
            } else if ( dataSize == 3 ) {
                gl.uniform3ui(uLocation, uData);
            } else if ( dataSize == 4 ) {
                gl.uniform4ui(uLocation, uData);
            } else {
                gl.uniform1ui(uLocation, uData);
            }
            break;
        case 2 :    // vector  
            if ( dataSize == 1) {
                gl.uniform1uiv(uLocation, uData);
            } else if ( dataSize == 2 ) {
                gl.uniform2uiv(uLocation, uData);
            } else if ( dataSize == 3 ) {
                gl.uniform3uiv(uLocation, uData);
            } else if ( dataSize == 4 ) {
                gl.uniform4uiv(uLocation, uData);
            } else {
                gl.uniform4uiv(uLocation, uData);
            }
            break;
        default : 
            gl.uniform1ui(uLocation,uData);        
            break;
    }
};


export const setUniformBoolValue = ( gl, uLocation, uData, dataKind, dataSize ) => {
    if ( !gl || !uLocation ||  !uData ) {
        return false;
    }

    switch ( dataKind ) {
        case 1 :    // value 
            if ( dataSize == 1 ) {
                gl.uniform1b(uLocation, uData);
            } else if ( dataSize == 2 ) {
                gl.uniform2b(uLocation, uData);
            } else if ( dataSize == 3 ) {
                gl.uniform3b(uLocation, uData);
            } else if ( dataSize == 4 ) {
                gl.uniform4b(uLocation, uData);
            } else {
                gl.uniform1b(uLocation, uData);
            }
            break;
        case 2 :    // vector  
            if ( dataSize == 1) {
                gl.uniform1bv(uLocation, uData);
            } else if ( dataSize == 2 ) {
                gl.uniform2bv(uLocation, uData);
            } else if ( dataSize == 3 ) {
                gl.uniform3bv(uLocation, uData);
            } else if ( dataSize == 4 ) {
                gl.uniform4bv(uLocation, uData);
            } else {
                gl.uniform4bv(uLocation, uData);
            }
            break;
        default : 
            gl.uniform1b(uLocation,uData);        
            break;
    }
};

export const setUniformValues = ( gl, uLocation, uData, dataType, dataKind, dataSize, transpose ) => {
    if ( !gl || !uLocation ||  !uData )
        return false;

    //  dataType : 1 : float, 2 : int, 3 : uint, 4 : boolean
    //  dataKind : 1 : value, 2 : vector , 3 : matrix 
    //  dataSize : 1 : 1, 2 : 2, 3 : 3, 4 : 4 => ex vec3, mat3 ...
    if ( dataType  == 1 ) {
        setUniformFloatValue(gl, uLocation, uData, dataKind, dataSize, transpose);
    } else if ( dataType == 2 ) {
        setUniformIntValue(gl, uLocation, uData, dataKind, dataSize);
    } else if ( dataType == 3 ) {
        setUniformUIntValue(gl, uLocation, uData, dataKind, dataSize);
    } else if ( dataType == 4 ) {
        setUniformBoolValue(gl, uLocation, uData, dataKind, dataSize);
    }
}


