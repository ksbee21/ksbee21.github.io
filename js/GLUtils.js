import * as CanvasUtils from "./CanvasUtils.js";

//makeCanvasObject
export const makeCanvasObject = (idValue, parentObj) => {
    return CanvasUtils.makeCanvasObject(idValue, parentObj, 800, 800);
};

export const loadGLTextureData = ( gl, url ) => {
    const texture           = gl.createTexture();
    const level             = 0;
    const internalFormat    = gl.RGBA;
    const width             = 1;
    const height            = 1;
    const border            = 0;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    CanvasUtils.loadImageFromURL(url).then( image => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, gl.RGBA,gl.UNSIGNED_BYTE, image);
//      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);                
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);        
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    });
    return texture;
};

export const createDepthFrameBuffer = (gl, depthTexture) => {
    const depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, 
        gl.DEPTH_ATTACHMENT, 
        gl.TEXTURE_2D, 
        depthTexture, 
        0);

    return depthFramebuffer;
};

export const createShadowTextureMap = ( gl , SHADOW_WIDTH, SHADOW_HEIGHT ) => {
    if ( !SHADOW_WIDTH ) 
        SHADOW_WIDTH = 512;
    if ( !SHADOW_HEIGHT ) 
        SHADOW_HEIGHT = 512;

    alert ( SHADOW_WIDTH + " , " + SHADOW_HEIGHT );

    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(
        gl.TEXTURE_2D, 
        0, //   mip map level
        gl.DEPTH_COMPONENT32F, //gl.DEPTH_COMPONENT32F, //    gl.DEPTH_COMPONENT16
        SHADOW_WIDTH, 
        SHADOW_HEIGHT, 
        0, 
        gl.DEPTH_COMPONENT, 
        gl.FLOAT, //gl.FLOAT,   //gl.UNSIGNED_SHORT
        null    //  data 
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);    

    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);  
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL); 

    
    return {
        depthTexture : depthTexture, 
        SHADOW_WIDTH : SHADOW_WIDTH, 
        SHADOW_HEIGHT : SHADOW_HEIGHT,
    };
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
        case 2 : 
            vs = `#version 300 es
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
            break;

        case 3 : 
            vs = `#version 300 es
            uniform mat4 worldMatrix, viewMatrix, projectionMatrix;
            uniform vec3 eyePos;

            in vec3 position;
            in vec3 normal;
            in vec4 colors;
            in vec2 texCoord;
            
        
            out vec3 vNormal ;
            out vec2 vTexCoord ;
            out vec4 vColors;
            out vec3 vEyePos;
        
            void main() {
                vec3 worldPos = (worldMatrix * vec4(position,1.0)).xyz;
                vEyePos = normalize(eyePos-worldPos);
                vNormal = normalize(transpose(inverse(mat3(worldMatrix))) * normal);
                vTexCoord = texCoord;
                vColors = colors;
                gl_Position = projectionMatrix * viewMatrix  * vec4(worldPos, 1.0);
            }
            `                   
            break;
        case  4 :
            vs = `#version 300 es
            uniform mat4 worldMatrix, lightViewMatrix, lightProjectionMatrix;
            layout(location = 0) in vec3 positions;
            layout(location = 1) in vec3 normals;
            layout(location = 2) in vec4 colors;
            layout(location = 3) in vec2 texCoords;            
            //out vec4 vColors;
            void main() {
                gl_Position = lightProjectionMatrix * lightViewMatrix  * worldMatrix * vec4(positions, 1.0);
                //vColors = colors;
            }
            ` 
            break;
        case 5 :
                vs = `#version 300 es
                uniform mat4 worldMatrix, viewMatrix, projectionMatrix;
                uniform mat4 lightViewMatrix, lightProjectionMatrix;

                layout(location = 0) in vec3 positions;
                layout(location = 1) in vec3 normals;
                layout(location = 2) in vec4 colors;
                layout(location = 3) in vec2 texCoords;            
            
                out vec3 vNormal;
                out vec2 vTexCoord;
                out vec4 vColors;
                out vec4 vShadowCoord;
        
                const mat4 tMat = mat4(
                    0.5, 0.0, 0.0, 0.0, 
                    0.0, 0.5, 0.0, 0.0,
                    0.0, 0.0, 0.5, 0.0, 
                    0.5, 0.5, 0.5, 1.0
                );
            
                void main() {
                    vec3 worldPos =  (worldMatrix * vec4(positions, 1.0)).xyz;
                    vTexCoord = texCoords;
                    //vShadowCoord =  tMat * projectionMatrix * lightViewMatrix * vec4(worldPos, 1.0);
                    vShadowCoord = tMat * lightProjectionMatrix * lightViewMatrix * vec4(worldPos, 1.0);
                    
                    vColors = colors;
                    //gl_Position = projectionMatrix * lightViewMatrix  * vec4(worldPos, 1.0);
                    gl_Position = projectionMatrix * viewMatrix  * vec4(worldPos, 1.0);     
                    vNormal = normals;//normalize(transpose(inverse(mat3(worldMatrix))) * normals);                                   
                }
                ` 
            break;
        case  6 :
                vs = `#version 300 es
                uniform mat4 worldMatrix, lightViewMatrix, lightProjectionMatrix;
                layout(location = 0) in vec3 positions;
                layout(location = 1) in vec3 normals;
                layout(location = 2) in vec4 colors;
                layout(location = 3) in vec2 texCoords;            
                out vec4 vColors;
                void main() {
                    gl_Position = lightProjectionMatrix * lightViewMatrix  * worldMatrix * vec4(positions, 1.0);
                    vColors = colors;
                }
                ` 
            break;
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
        case 2 : 
            fs = `#version 300 es
            precision highp float;
    
            in vec2 vTexCoord;
            in vec3 vNormal;
            in vec4 vColors; 
    
            uniform sampler2D uTexture;
            out vec4 fragColor;
    
            void main() {
                fragColor = texture(uTexture,vTexCoord);
            }
            `
            break;

        case 3 : 
            fs = `#version 300 es
            precision highp float;
    
            in vec2 vTexCoord;
            in vec3 vNormal;
            in vec4 vColors; 
            in vec3 vEyePos;            
    
            uniform sampler2D uTexture;

            uniform int uDisplayType;

            uniform vec3 directionLight;
            uniform vec3 dirLightColor;
            uniform vec3 specularColor;
            uniform vec3 ambientColor;
            uniform vec3 emitColor;
            
            uniform float shineCoef;
            uniform float ambientCoef;  //  rgb 로 제어하려면 vec3            
            uniform float emitCoef;     //  rgb 로 제어하려면 vec3
            
            out vec4 fragColor;
    
            void main() {
               
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vEyePos);
               
                vec3 light = normalize(directionLight);
                vec3 matDiff = texture(uTexture,vTexCoord).rgb;
                vec3 diffuse = max(dot(light,normal),0.0)*matDiff;
             
                vec3 reflactDir = 2.0*normal*dot(light,normal) - light;
                vec3 specular = pow( max( dot(reflactDir, viewDir),0.0),shineCoef ) * dirLightColor * specularColor;
                
                vec3 ambient = ambientColor*ambientCoef;
                
                vec3 emit = emitColor*emitCoef;

                if ( uDisplayType == 1 ) {
                    fragColor = texture(uTexture,vTexCoord);
                } else if ( uDisplayType == 2 ) {
                    fragColor = vec4(diffuse,1.0);
                } else if ( uDisplayType == 3 ) {
                    fragColor = vec4(diffuse+specular,1.0);
                } else if ( uDisplayType == 4 ) {
                    fragColor = vec4(diffuse+ambient,1.0);
                } else {
                    fragColor = vec4(diffuse+specular+ambient+emit ,1.0);
                }
            }
        `
            break;
        case 4 :
            fs = `#version 300 es
            precision highp float;
            in vec4 vColors;
            //out vec4 fragColors;
            void main() {
                //fragColors = vColors;
            }
            `            
            break;            
        case 5 :
            fs = `#version 300 es
            precision highp float;
            in vec3 vNormal;
            in vec4 vColors;
            in vec2 vTexCoord;
            in vec4 vShadowCoord;

            uniform sampler2D shadowMap;

            out vec4 fragColor;
        
            void main() {
                //vec3 normal = normalize(vNormal);
                //fragColor = vColors;
                vec3 shadowCoord = (vShadowCoord.xyz / vShadowCoord.w);

                //float vis = textureProj(shadowMap, vShadowCoord);

                bool inRange =
                    shadowCoord.x >= 0.0 &&
                    shadowCoord.x <= 1.0 &&
                    shadowCoord.y >= 0.0 &&
                    shadowCoord.y <= 1.0;                
                float currentDepth = (shadowCoord.z - 0.99);
                vec4 tColors = texture(shadowMap,shadowCoord.xy);
                float texDepth = tColors.r;
                float shadows = (( inRange && currentDepth <= texDepth  ) ? 1.0 : 0.0);
                fragColor = vec4(vColors.rgb * shadows, 1.0);
                //fragColor = mix(vColors,vec4(vec3(texDepth),1.0),1.0);
                //fragColor = (inRange ? vec4(shadowCoord.xyz,1.0) : vec4(0.0, 0.0, 0.0, 1.0));
                //fragColor = vec4(vec3(shadowCoord.z),1.0);
                //fragColor = vec4(vColors.xyz*shadows,1.0);                
            }
            `            
            break;
        case 4 :
            fs = `#version 300 es
            precision highp float;
            in vec4 vColors;
            out vec4 fragColors;
            void main() {
                fragColors = vColors;
            }
            `            
            break;            
        default :
            break;
    }
    return fs;
}

export const createProgramByType = ( gl, typeNum ) => {
    alert ( getFragmentShaderSource(typeNum) );
    return createProgramBySource(gl, getVertexShaderSource(typeNum), getFragmentShaderSource(typeNum) );
};


export const setAttributeValue = (gl, program, attributeName, data, size, dataType, normalize, stride, offset) => {
    const gLocation = gl.getAttribLocation(program,attributeName);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    //  Vertex Array Buffer binding ... 
    console.log( "Attribute Location Setting ", gLocation, attributeName, data);

    gl.enableVertexAttribArray(gLocation);
    gl.vertexAttribPointer(gLocation, size, dataType, normalize, stride, offset);
    return gLocation;
};

export const setAttributeValues = (gl, program, attribArray ) => {
    if ( !attribArray || !attribArray.length )
        return undefined;

    const attrArray = [];
    for ( let i = 0, iSize = attribArray.length; i < iSize; i++ ) {
        const attrs = {...attribArray[i]};

        const locValue = setAttributeValue(gl, program, attrs.attributeName, attrs.data, attrs.size, attrs.dataType, attrs.normalize, 
            attrs.stride, attrs.offset);
        if ( locValue == undefined )
            continue;
        attrs.loc = locValue;
        attrArray.push(attrs);
    }
    return attrArray;
};

export const setIndexInfos = ( gl,  indexInfo ) => {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexInfo.data, gl.STATIC_DRAW);
};

export const setUniformLocations = (gl, program, uniformArray) => {
    if ( !uniformArray ) 
        return uniformArray;
    const uArray = [];
    for ( let i = 0, iSize = uniformArray.length; i < iSize; i++ ) {
        let uniform = {...uniformArray[i]};
        uniform.uLocation = gl.getUniformLocation(program, uniform.uniformName );
        if ( !uniform.uLocation ) {
            console.log(uniform.uniformName , " Can not apply ... ");
            continue;
        }
        uArray.push(uniform);
    }
    return uArray;
};



export const setUniformFloatValue = ( gl, uLocation, uData, dataKind, dataSize, transpose ) => {
    if ( !gl || !uLocation ||  uData == undefined )
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
    if ( !gl || !uLocation ||  uData == undefined ) {        
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
    if ( !gl || !uLocation ||  uData == undefined ) {
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
    if ( !gl || !uLocation ||  uData == undefined ) {
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
    if ( !gl || !uLocation ||  uData == undefined )
        return false;

    console.log("Init setUniformValues", dataType, dataKind, dataSize);

    //  dataType : 1 : float, 2 : int, 3 : uint, 4 : boolean
    //  dataKind : 1 : value, 2 : vector , 3 : matrix 
    //  dataSize : 1 : 1, 2 : 2, 3 : 3, 4 : 4 => ex vec3, mat3 ...
    if ( dataType  == 1 ) {
        setUniformFloatValue(gl, uLocation, uData, dataKind, dataSize, transpose);
    } else if ( dataType == 2 ) {
        console.log("bbbbbbb",dataType, uData);
        setUniformIntValue(gl, uLocation, uData, dataKind, dataSize);
    } else if ( dataType == 3 ) {
        console.log("aaaaaa",dataType, uData);
        setUniformUIntValue(gl, uLocation, uData, dataKind, dataSize);
    } else if ( dataType == 4 ) {
        setUniformBoolValue(gl, uLocation, uData, dataKind, dataSize);
    }
}


