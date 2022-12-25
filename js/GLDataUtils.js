

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
        // 앞
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // 뒤
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // 위
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // 아래
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // 오른쪽
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // 왼쪽
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0
    ];

    var vertexNormals = [
        // 앞
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

        // 뒤
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

        // 위
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // 아래
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

        // 오른쪽
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // 왼쪽
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