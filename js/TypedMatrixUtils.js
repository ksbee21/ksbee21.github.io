
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
        const result = 0.0;
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
    
    