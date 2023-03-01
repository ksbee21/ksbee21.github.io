
    export const vec3 = (x,y,z) => {
        const result = new Float32Array([x,y,z]);
        result.rows = 3;
        result.cols = 1;
        return result;
    };

    export const makeVec3 = (data) => {
        if ( data && data.length > 3 ) {
            return vec3(data[0],data[1],data[2]);
        }
        return vec3(0,0,0);
    };


    export const vec4 = (x,y,z,w) => {
        const result = new Float32Array([x,y,z,w]);
        result.rows = 4;
        result.cols = 1;
        return result;
    };

    export const mat3 = ( data ) => {
        if ( !data || data.length < 9 )
            return undefined;
        let dCols = data.cols;
        let dRows = data.rows;
        if ( dCols < 3 || dRows < 3 )
            return undefined;
        
        const result = new Float32Array(9);
        result.rows = 3;
        result.cols = 3;

        for ( let i = 0; i < 3; i++ ) {
            let idx = i*3;
            let dataIdx = i*dCols;
            for ( let j = 0; j < 3; j++ ) {
                result[idx+j] = data[dataIdx+j];
            }
        }
        return result;
    };

    /**
     * 
     * @param {Float32Array} v1 
     * @param {Float32Array} v2 
     */
    export const makeDotProductVectors = (v1,v2) => {
		if ( !v1 || !v2 ) {
			return;
		}
        const len = v1.length;
        if ( !len || len < 1 || v2.length != len ) {
            return;
        }
        let result = 0.0;
        for ( let i = 0; i < len; i++ ) {
            result += v1[i]*v2[i];
        }
        return result;
    };


    const isValidArrayValues = ( v1 ) => {
        if ( !v1 || !v1.length  )
            return false;
        return true;
    };

    /**
     * 2차원 배열이라도( Matrix ) Typed Array 로 사용될 경우 1차원 형식으로 구성
     * 그렇기 때문에 1차원 배열로 간주함
     * @param {*} mat 
     * @param {*} roundValue 
     * @param {*} needClone 
     * @returns 
     */
    export const makeRoundValues = ( mat, roundValue, needClone ) => {
        if ( !isValidArrayValues(mat)) {
            return mat;
        }

        if ( !roundValue || roundValue < 0 ) {
            roundValue = 100000; // javascript 에서 부동 소수점 연산 오류를 피하기 위한 값
        }

        const len = mat.length;
        let result = mat;
        if ( needClone ) {
            result = new Float32Array(len);
            if ( mat.rows ) {
                result.rows = mat.rows;
            }
            if ( mat.cols ) {
                result.cols = mat.cols;
            }
        }
        for ( let i = 0; i < len; i++ ) {
            result[i] = Math.round(mat[i]*roundValue)/roundValue;
        }
        return result;
    };

    /**
     * 백터의 길이를 계산하기 위한 함수
     * @param {*} v1 
     * @returns 
     */
    export const getVectorLength = ( v1 ) => {
        if ( !isValidArrayValues(v1)  )
            return undefined;
        
        let sum = 0.0;
        for ( let i = 0; i < v1.length; i++ ) {
            sum += (v1[i]*v1[i]);
        }
        return Math.sqrt(sum);
    };

    /**
     * Normalize 하기 위한 함수
     * @param {*} v1 
     * @param {*} needRound 
     * @returns 
     */
    export const makeNormalizeVector = ( v1, needRound ) => {
        if ( !isValidArrayValues(v1)  )
            return undefined;

        const len = v1.length;
        const result = new Float32Array(len);

        const lv = getVectorLength(v1);
        if ( lv == 0 ) {
            return result;
        }
        if ( needRound ) {
            for ( let i = 0; i < len; i++ ) {
                result[i] = makeRoundValues(v1[i]/lv);
            }
        } else {
            for ( let i = 0; i < len; i++ ) {
                result[i] = v1[i]/lv;
            }
        }
        return result;       
    };

    const validateVectorLength = (v1, v2) => {
        if ( !isValidArrayValues(v1) ) 
            return -1;
        if ( !isValidArrayValues(v2) ) 
            return -1;
        let len = v1.length;
        if ( len != v2.length )
            return -1;
        return len; 
    };

    /**
     * 노출되지 않고 계산하는 함수
     * @param {*} v1 
     * @param {*} v2 
     * @param {*} calcType : 1은 더하기, 2는 빼기 -- 1이 아니면 무조건 빼기로 구성
     * @returns 
     */
    const makeVectorPlusMinus = (v1, v2, calcType ) => {
        let len = validateVectorLength(v1,v2);
        if ( len <= 0 )
            return undefined;

        const result = new Float32Array(len);
        for ( let i = 0; i < len; i++ ) {
            if ( calcType == 1 ) {  // vector plus
                result[i] = v1[i] + v2[i];
            } else {    //  default vector minus 
                result[i] = v1[i] - v2[i];
            }
        }
        return result;
    };

    /**
     * 
     * @param {*} v1 
     * @param {*} v2 
     * @returns 
     */
    export const makeVectorPlusValues = (v1,v2) => {
        return makeVectorPlusMinus(v1,v2, 1);
    };

    /**
     * 
     * @param {*} v1 
     * @param {*} v2 
     * @returns 
     */
    export const makeVectorMinusValues = (v1,v2) => {
        return makeVectorPlusMinus(v1,v2, 2);
    };

    const makeVectorMuliply = (v1,v2,calcType) => {
        let len = validateVectorLength(v1,v2);
        if ( len <= 0 )
            return undefined;

        const result = new Float32Array(len);
        for ( let i = 0; i < len; i++ ) {
            if ( calcType == 1 ) {  // vector muliply
                result[i] = v1[i] * v2[i];
            } else {    //  default vector divide 
                result[i] = v1[i]/v2[i];
            }
        }
        return result;
    };

    const makeVectorMuliplyScala = (v1,scalarValue,calcType) => {
        if ( !isValidArrayValues(v1) || !scalarValue )
            return undefined;

        let len = v1.length;

        const result = new Float32Array(len);
        for ( let i = 0; i < len; i++ ) {
            if ( calcType == 1 ) {  // vector muliply
                result[i] = v1[i] * scalarValue;
            } else {    //  default vector divide 
                result[i] = v1[i]/scalarValue;
            }
        }
        return result;
    };

    export const makeVectorMultiplyValues = (v1,v2) => {
        return makeVectorMuliply(v1,v2,1);
    };
    export const makeVectorDivideValues = (v1,v2) => {
        return makeVectorMuliply(v1,v2,2);
    };
    export const makeVectorMultiplyScalarValues = (v1,scalarValue) => {
        return makeVectorMuliplyScala(v1,scalarValue,1);
    };
    export const makeVectorDivideScalarValues = (v1,scalarValue) => {
        return makeVectorMuliplyScala(v1,scalarValue,2);
    };

    /**
     * Vector Inner Product , Dot Product Value
     * @param {*} v1 
     * @param {*} v2 
     * @returns : scalar value 
     */
    export const makeVectorDotProductValues = (v1,v2) => {
        let len = validateVectorLength(v1,v2);
        if ( len <= 0 )
            return undefined;

        let result = 0.0;
        for ( let i = 0; i < len; i++ ) {
            result += (v1[i]*v2[i]);
        }
        return result;
    };

    /**
     * 두 백터의 Dot Product 결과를 통해 cosine theta 값을 가져오기 위한 함수
     * @param {*} v1 
     * @param {*} v2 
     * @returns : cosine theta 값
     */
    export const getCosineValue = (v1,v2) => {
        let len = validateVectorLength(v1,v2);
        if ( len <= 0 )
            return undefined;
        const v1Len = getVectorLength(v1);
        const v2Len = getVectorLength(v2);
        const dotValue = makeVectorDotProductValues(v1,v2);

        return dotValue/(v1Len*v2Len);
    };

    /**
     * Vector Cross Product 
     * @param {*} v1 
     * @param {*} v2 
     * @returns Vector 
     */
    export const makeVectorCrossProductValues = (v1,v2) => {
        let len = validateVectorLength(v1,v2);
        if ( len != 3 )
            return undefined;

        const result = new Float32Array(len);
        result[0] = ( v1[1]*v2[2] - v1[2]*v2[1]);
        result[1] = ( v1[2]*v2[0] - v1[0]*v2[2]);
        result[2] = ( v1[0]*v2[1] - v1[1]*v2[0]);        
        return result;
    };

    /**
     * Cross Product 값을 이용하여 sin theta 값을 가져오기 위한 함수
     * @param {*} v1 
     * @param {*} v2 
     * @returns 
     */
    export const getSinValue = (v1, v2) => {
        let len = validateVectorLength(v1,v2);
        if ( len != 3 )
            return undefined;
        const v1Len = getVectorLength(v1);
        const v2Len = getVectorLength(v2);
        const crossValue = getVectorLength(makeVectorCrossProductValues(v1,v2));

        return crossValue/(v1Len*v2Len);
    };


	export const makeTriangleNormals = (stdVector, firstVector, secondVector) => {
		if ( !stdVector || !firstVector || !secondVector ) {
			return;
		}

		let v1 = makeVectorMinusValues(firstVector, stdVector);
		let v2 = makeVectorMinusValues(secondVector, stdVector);

		let result = makeVectorCrossProductValues(v1, v2);
		return  makeNormalizeVector(result,true);
	}


	const cot = (v) => {
		return 1.0/Math.tan(v);
	}

	export const makeOrthographicMatrix = (left, right, bottom, top, near, far ) => {
		let scaleX = 2.0/(right-left);
		let scaleY = 2.0/(top-bottom);
		let scaleZ = -2.0/(far-near);
		let midX = (left+right)/(left-right);
		let midY = (bottom+top)/(bottom-top);
		let midZ = (near+far)/(near-far);
		const result = new Float32Array([
			 scaleX, 0, 0, midX,
			 0,scaleY,0,midY,
			 0,0, scaleZ, midZ,
			 0,0,0,1
		]);
        result.rows = 4;
        result.cols = 4;

        return result;
	}

	export const makePerspectiveMatrix = ( fovy, aspect, near, far ) => {
		let cv = cot(fovy/2);
		var nf = 1 / (near - far);
		
		const result = new Float32Array([
			cv/aspect, 0, 0, 0,
			0, cv, 0,0,
			0, 0, -((far+near)/(far-near)), -(2*near*far/(far-near)), 
			0, 0, -1, 0
		]);
        result.rows = 4;
        result.cols = 4;
        return result;
	}

    export const makeIdentityMatrix = (m) => {
        const result = new Float32Array(m*m);
        result.rows = m;
        result.cols = m;

        for ( let i = 0; i < m; i++ ) {
            result[i*m+i] = 1;
        }
        return result;
    };

    export const multiplyMatrix = (m1,m2) => {
        if ( !m1 || !m2 ) 
            return undefined;   //  계산 할 수 없음 
        
        if (!m1.cols || !m2.rows || m1.cols != m2.rows ) 
            return undefined;
        
        const row1 = m1.rows;
        const col1 = m1.cols;
        const col2 = m2.cols;
        const result = new Float32Array(row1*col2);
        result.rows = row1;
        result.cols = col2;

        for ( let r = 0; r < row1; r++ ) {
            for ( let c = 0; c < col2; c++ ) {
                let idx = r*col2+c;
                for ( let t = 0; t < col1; t++ ) {
                    let idx01 = r*col1+t;
                    let idx02 = t*col2+c;
                    result[idx] += m1[idx01]*m2[idx02];
                }
            }
        }
        return result;
    };

    export const makeTransposeMatrix = ( matrix ) => {
		if ( !matrix ) {
			alert( "NO DATA" );
			return;
		}

        const rows = matrix.rows;
        if ( !rows )    //  내부에서 사용하는 형식이 아님
            return;
        const cols = matrix.cols;
        if ( !cols )    //  내부에서 사용하는 형식이 아님
            return;

        const result = new Float32Array(matrix.length);
        result.rows = cols;
        result.cols = rows;

        for ( let i = 0; i < cols; i++ ) {
            for ( let j = 0; j < rows; j++ ) {
                let idx = i*rows+j;
                let idx01 = j*cols+i;
                result[idx] = matrix[idx01];
            }
        }

		return result;
	};

    export const copyMatrixValues = (matrix) => {
        if ( !matrix ) {
			alert( "NO DATA" );
			return;
		}

        const rows = matrix.rows;
        if ( !rows )    //  내부에서 사용하는 형식이 아님
            return;
        const cols = matrix.cols;
        if ( !cols )    //  내부에서 사용하는 형식이 아님
            return;

        const result = new Float32Array(matrix.length);
        result.rows = cols;
        result.cols = rows;
        for ( let i = 0 , iSize = matrix.length; i < iSize; i++ ) {
            result[i] = matrix[i];
        }
        return result;
    };

	const switchRowPositionValues = (orgMat, colSize, curRowIdx, transRowIdx) => {
		if ( !orgMat || curRowIdx == transRowIdx || curRowIdx <= 0 )
			return;
		const curIdx = curRowIdx*colSize;
		const trIdx = transRowIdx*colSize;
		for ( let i = 0; i < colSize; i++ ) {
			let v = orgMat[trIdx+i];
			orgMat[trIdx+i] = orgMat[curIdx+i];
			orgMat[curIdx+i] = v;
		}
	};


    export const makeInverseMatrix = ( matrix ) => {
		if ( !matrix ) {
			return;
		}
        const orgLen = matrix.length;
        if ( !orgLen ) 
            return;

        let rows = -1;
        let cols = -1;

        if ( matrix.rows && matrix.cols ) {
            rows = matrix.rows;
            cols = matrix.cols;
        } else {
            rows = Math.sqrt(orgLen);
            cols = rows;
        }

		if ( rows*rows != orgLen ) {
			return;
		}

		const inverseV = makeIdentityMatrix(rows);
		const orgV = copyMatrixValues(matrix);
		for ( let r = 0; r < rows; r++ ) {
			let stIdx = r*cols+r;
			while ( orgV[stIdx] == 0 ) {
				let canCalc = false;
				for ( let t = r+1; t < rows; t++ ) {
					switchRowPositionValues(orgV, cols, r, t);
					if ( orgV[stIdx] != 0 ) {
						canCalc = true;
						break;
					}
				}
				if ( !canCalc ) {
					return;
				}
			}
			let sv = orgV[stIdx];
			let sIdx = r*cols;
			for ( let c = 0; c < cols; c++ ) {
				orgV[sIdx+c] /= sv;
				inverseV[sIdx+c] /= sv;
			}
			for ( let t = r+1; t < rows; t++ ) {
				let tIdx = t*cols;
				sv = orgV[tIdx+r];
				for ( let c = 0; c < cols; c++ ) {
					orgV[tIdx+c] -= (sv*orgV[sIdx+c]);
					inverseV[tIdx+c] -= (sv*inverseV[sIdx+c]);;
				}
			}
		}

		for ( let r = rows-1; r > 0; r-- ) {
			let sIdx = r*cols;
			for ( let t = r-1; t >= 0; t-- ) {
				let tIdx = t*cols;
				let sv = orgV[tIdx+r];

				for ( let c = 0; c < cols; c++ ) {
					orgV[tIdx+c] -= ( sv * orgV[sIdx+c]);
					inverseV[tIdx+c] -= (sv*inverseV[sIdx+c]);
				}
			}
		}
		return inverseV;
	};


    export const printArrayValues = ( mat, roundValue ) => {
        let ts = "";
        if ( !mat ) 
            return ts;
        let len = mat.length;
        if ( !len )
            return ts;
        let rows = mat.rows;
        let cols = mat.cols;
        if ( !rows || !cols) {
            for ( let i = 0; i < len; i++ ) {
                ts += "\t" + mat[i];
            }
            return ts;
        }
        if ( !roundValue ) {
            roundValue = 1000000.0;
        }
        for ( let i = 0; i < rows; i++ ) {
            for ( let j = 0; j < cols; j++ ) {
                ts += "\t" + Math.round(mat[i*cols+j]*roundValue)/roundValue;
            }
            ts += "\n";
        }
        return ts;
    };


	export const makeRotateXMatrix3D = ( theta ) => {
		let sv = Math.sin(theta);
		let cv = Math.cos(theta);

        const result = new Float32Array([
			1,  0,  0, 0,
			0,	cv, -sv, 0,
			0,  sv,  cv, 0,
			0,  0,  0, 1
		]);
        result.rows = 4;
        result.cols = 4;
        return result;
	};

	export const makeRotateYMatrix3D = ( theta ) => {
		let sv = Math.sin(theta);
		let cv = Math.cos(theta);

        const result = new Float32Array([
			cv,  0,  sv,0,
			0,	 1, 0,0,
			-sv,  0,  cv,0,
			0,  0,  0, 1
		]);
        result.rows = 4;
        result.cols = 4;
        return result;
	};

	export const makeRotateZMatrix3D = ( theta ) => {
		let sv = Math.sin(theta);
		let cv = Math.cos(theta);

        const result = new Float32Array([
			cv, -sv,   0, 0,
			sv,  cv,   0, 0,
			0,   0,   1, 0,
			0,  0,  0, 1,
		]);
        result.rows = 4;
        result.cols = 4;
        return result;
	};

    export const makeScaleMatrix3D = ( sx, sy, sz ) => {
        const result = new Float32Array([
			sx, 0,  0,  0,
			0, sy,  0,  0, 
			0,  0, sz,	0,
			0,  0,  0,	1
		]);
        result.rows = 4;
        result.cols = 4;
        return result;
	};


	export const makeTranslateMatrix3D = ( dx, dy, dz ) => {

        const result = new Float32Array([
			1, 0,  0,  dx,
			0, 1,  0,  dy, 
			0,  0, 1,  dz,
			0,  0,  0,	1
		]);
        result.rows = 4;
        result.cols = 4;
        return result;
	};

    export const makeCameraMatrix3D = ( eye, at, up ) => {
        //  z 축의 방향 at 에서 eye 방향으로 설정
        let nObj = makeNormalizeVector( makeVectorMinusValues(eye,at) );

        //  n(z) vector 에서 up 으로 진행 u(x) vector 를 구함 cross product 는 두 벡터 평면에 수직
        let uObj = makeNormalizeVector( makeVectorCrossProductValues(up, nObj));

        //  u(x) 에서 n(z) 축 방향으로 cross product v(y) 방향 vector 를 구함
        //  이미 normalize 된 수직인 두 벡터의 cross product 결과는 normalize 된 벡터 
        let vObj = makeVectorCrossProductValues(nObj,uObj);

        //  world 공간의 원점을 통합하기 위해서 translate 이후 rotation 진행
        //  translate 는 eye 값을 -부호 붙이값 
        //  rotation 은 u, v, n 의 transpose 값으로 얻음
        const translate = makeTranslateMatrix3D(-eye[0], -eye[1], -eye[2]) ;
        const rotate = new Float32Array([
            uObj[0], uObj[1], uObj[2], 0,
            vObj[0], vObj[1], vObj[2], 0,
            nObj[0], nObj[1], nObj[2], 0,
            0, 0, 0, 1            
        ]);
        rotate.rows = 4;
        rotate.cols = 4;

        const result = multiplyMatrix(rotate, translate);
        //const result = multiplyMatrix(translate, rotate);        

//        console.log ( result );
        return result;
    };

    export const makeCameraInverseMatrix3D = ( eye, at, up ) => {
        //  z 축의 방향 at 에서 eye 방향으로 설정
        let nObj = makeNormalizeVector( makeVectorMinusValues(eye,at) );

        //  n(z) vector 에서 up 으로 진행 u(x) vector 를 구함 cross product 는 두 벡터 평면에 수직
        let uObj = makeNormalizeVector( makeVectorCrossProductValues(up, nObj));

        //  u(x) 에서 n(z) 축 방향으로 cross product v(y) 방향 vector 를 구함
        //  이미 normalize 된 수직인 두 벡터의 cross product 결과는 normalize 된 벡터 
        let vObj = makeVectorCrossProductValues(nObj,uObj);

        //  world 공간의 원점을 통합하기 위해서 translate 이후 rotation 진행
        //  translate 는 eye 값을 -부호 붙이값 
        //  rotation 은 u, v, n 의 transpose 값으로 얻음
        const rotate = new Float32Array([
            uObj[0], vObj[0], nObj[0], eye[0],
            uObj[1], vObj[1], nObj[1], eye[1],
            uObj[2], vObj[2], nObj[2], eye[2],
            0, 0, 0, 1            
        ]);
        rotate.rows = 4;
        rotate.cols = 4;
        return rotate;
    };



	function lookupCameraMatrix(eye,at,up) {
		let nObj = makeMinusVectors(eye,at);
		nObj = makeNormalizeVector(nObj);
		nObj.push(0);
		let uObj = makeCrossProductVectors(up,nObj);
		uObj = makeNormalizeVector(uObj);
		uObj.push(0);
		let vObj = makeCrossProductVectors(nObj,uObj);
		vObj.push(0);

		let trm = makeTranslateMatrix3D(-eye[0], -eye[1], -eye[2]);
//		alert ( makeRowVectorFromColumn(at,1) );
//		trm = multiplyFn(trm,makeRowVectorFromColumn(at,1));
		let uvn = [uObj,vObj,nObj,[0,0,0,1]];

//		alert ("mmm " + uvn + "\n" + trm );

		return makeRoundValues(multiplyFn(uvn,trm));
	};

    /**
     * 
     * @param {*} light : 빛 벡터 
     * @param {*} normal  : normal vector
     * @param {*} isNormalized : true : nomalized , false : need normalize
     * @param {*} isReversed : true : 빛이 진행방향에서 법선과 동일한 방향으로 변경되어 있음, false : 빛의 원래 진행방향 
     * @returns 
     */
    export const makeReflectRayVector = ( light, normal, isNormalized,  isReversed ) => {
        let lightDir, normalDir, reflectDir;
        if ( !isNormalized ) {
            lightDir = makeNormalizeVector(light);
            normalDir = makeNormalizeVector(normal);
        } else {
            lightDir = light;
            normalDir = normal;
        }
        if ( isReversed ) {
            const v = makeDotProductVectors(lightDir,normalDir)*2.0;
            reflectDir = normalDir;
            for ( let i = 0; i < reflectDir.length; i++ ) {
                reflectDir[i] *= v;
            }
            reflectDir = makeVectorMinusValues(reflectDir, lightDir);
        } else {
            const v = makeDotProductVectors(lightDir,normalDir)*-2.0;
            reflectDir = normalDir;
            for ( let i = 0; i < reflectDir.length; i++ ) {
                reflectDir[i] *= v;
            }
            reflectDir = makeVectorPlusValues(reflectDir, lightDir);
        }
        return reflectDir;
    };

   
    /**
     * 
     * @param {*} screenX : canvas base offsetX 0 ~ width ( left to right)
     * @param {*} screenY : canvas base offsetY 0 ~ height ( top to bottom )
     * @param {*} width : fullWidth
     * @param {*} height : fullHeight 
     * @param {*} fovy : radian value
     * @param {*} near : projection matrix 의 가까운 지점 
     * @param {*} eye : camera eye pos
     * @param {*} at : camera target pos
     * @param {*} up : camera 기울기 방향
     */
    export const makeRayTracingViewPosValues = ( screenX,screenY,width,height, fovy, near, eye, at, up ) => {
        const cv = cot(fovy/2);
        const aspect = width/height;
        const xc = (near/(cv/aspect))*(2*screenX/width - 1);
        const yc = -(near/(cv))*(2*screenY/height - 1);

        const viewInverseMatrix = makeCameraInverseMatrix3D(eye,at,up);        

        const startPos = vec4(xc,yc,-near,1);
        const startRay = vec4(xc/near,yc/near,-1,0); 

        const viewPos = multiplyMatrix(viewInverseMatrix, startPos);
        const viewRay = multiplyMatrix(viewInverseMatrix, startRay);        

        return {
            viewPos : viewPos,
            viewRay : viewRay,
        };
    };

    /**
     * 
     * @param {*} viewPosValues : viewPos, viewRay 
     * @param {*} localWorldMatrix : object local world matrix
     */
    export const makeRayTracingLocalWorldPosValues = ( viewPosValues, localWorldMatrix ) => {

        const worldInverseMatrix = makeInverseMatrix(localWorldMatrix);
        const worldPos = multiplyMatrix(worldInverseMatrix, viewPosValues.viewPos);
        const worldRay = multiplyMatrix(worldInverseMatrix, viewPosValues.viewRay);        

        return {
            worldPos : worldPos,
            worldRay : worldRay,
        };
    };

    export const traceRayInterceptionForSphere = (rayPos,rayDir,sphereCenter,sphereRadius) => {
        /*
        rx, ry, rz  = positions 상수
        rdx, rdy, rdz  = directions 상수
        x = t*rdx + rx , x^2 = t^2*rdx^2 + t*2*rx*rdx + rx^2 
        y = t*rdy + ry , y^2 = t^2*rdy^2 + t*2*ry*rdy + ry^2         
        z = t*rdz + rz , z^2 = t^2*rdz^2 + t*2*rz*rdz + rz^2

        x^2 + y^2 + z^2     = t^2*rdx^2 + t*2*rx*rdx + rx^2 + t^2*rdy^2 + t*2*ry*rdy + ry^2  + t^2*rdz^2 + t*2*rz*rdz + rz^2
                            = t^2*(rdx^2 + rdy^2 + rdz^2) + t*(2*rx*rdx + 2*ry*rdy + 2*rz*rdz) + rx^2 + ry^2 + rz^2
        
        cx, cy, cz = 구의 중심위치 대부분 0이나, 0이 아닌 경우 계산이 필요함 상수
        r = 반지름 상수
        (x-cx)^2 + (y-cy)^2 + (z-cy)^2 = r^2
        cx = cy = cz = 0 일 경우 계산이 단순함 but 일단 다 풀어 써봄 ...  

        -2*x*cx = t*rdx*cx*-2 + rx*cx * -2
        -2*y*cy = t*rdy*cy*-2 + ry*cy * -2        
        -2*z*cz = t*rdz*cz*-2 + rz*cz * -2        
        -2*x*cx + -2*y*cy + -2*z*cz = t * ( rdx*cx*-2 + rdy*cy*-2 + rdz*cz*-2) + rx*cx * -2 +  ry*cy * -2 +  rz*cz * -2  

        x^2 - 2*x * cx + cx^2 + y^2 - 2*y * cy + cy^2 + z^2 - 2*z * cz + cz^2 = r^2 
        x^2 + y^2 + z^2 + (-2*x * cx +  -2*y * cy + -2*z * cz ) + cx^2 + cy^2 + cz^2 = r^2 

        t^2*(rdx^2 + rdy^2 + rdz^2) + t*(2*rx*rdx + 2*ry*rdy + 2*rz*rdz + rdx*cx*-2 + rdy*cy*-2 + rdz*cz*-2) + rx^2 + ry^2 + rz^2 + rx*cx * -2 +  ry*cy * -2 +  rz*cz * -2 - r^2 = 0
        
        a = rdx^2 + rdy^2 + rdz^2 
        b = 2*rx*rdx + 2*ry*rdy + 2*rz*rdz + rdx*cx*-2 + rdy*cy*-2 + rdz*cz*-2
        c = rx^2 + ry^2 + rz^2 + rx*cx * -2 +  ry*cy * -2 +  rz*cz * -2 + cx^2 + cy^2 + cz^2 - r^2
        t = (-b + Math.sqrt(b^2-4*a*c))/2*a
        t = (-b - Math.sqrt(b^2-4*a*c))/2*a
        */

        const a = rayDir[0]*rayDir[0] + rayDir[1]*rayDir[1] + rayDir[2]*rayDir[2]; 
        const b = 2*(rayDir[0]*rayPos[0]+rayDir[1]*rayPos[1] + rayDir[2]*rayPos[2] - rayDir[0]*sphereCenter[0]-rayDir[1]*sphereCenter[1] - rayDir[2]*sphereCenter[2]);
        const c = rayPos[0]*rayPos[0] + rayPos[1]*rayPos[1] + rayPos[2]*rayPos[2] - 2 * ( rayPos[0]*sphereCenter[0] + rayPos[1]*sphereCenter[1] + rayPos[2]*sphereCenter[2]) 
            + sphereCenter[0]*sphereCenter[0] + sphereCenter[1]*sphereCenter[1] + sphereCenter[2]*sphereCenter[2] - sphereRadius*sphereRadius;

        const oc = makeVectorMinusValues(rayPos,sphereCenter);

        const a1 = makeDotProductVectors(rayDir,rayDir); 
        const b1 = 2*makeDotProductVectors(rayDir,oc);
        const c1 = makeDotProductVectors(oc,oc) - sphereRadius*sphereRadius;

        const rd = 10000;

        alert ( Math.round(a*10000)/10000 + " : " + Math.round(a1*rd)/rd + "\n" + Math.round(b*rd)/rd + " : " + Math.round(b1*rd)/rd 
            + "\n" + Math.round(c*rd)/rd + " : " + Math.round(c1*rd)/rd);

        if ( (b*b - 4*a*c) < 0 ) {
            return undefined;
        }

        const hitDis01 = (-b + Math.sqrt(b^2-4*a*c))/2*a;
        const hitDis02 = (-b - Math.sqrt(b^2-4*a*c))/2*a;

        const hitPos01 = vec3(0,0,0);
        const hitPos02 = vec3(0,0,0);        

        for ( let i = 0; i < 3; i++ ) {
            hitPos01[i] = rayPos[i] + hitDis01*rayDir[i];
            hitPos02[i] = rayPos[i] + hitDis02*rayDir[i];
        }

        let flag = false;
        if ( hitDis01 < hitDis02 )
            flag = true;
        else 
            flag = false;

        return {
            minHit : flag ? hitDis01 : hitDis02,
            maxHit : flag ? hitDis02 : hitDis01,
            minHitPos : flag ? hitPos01 : hitPos02,
            maxHitPos : flag ? hitPos02 : hitPos01,            
        };
    };









    
    