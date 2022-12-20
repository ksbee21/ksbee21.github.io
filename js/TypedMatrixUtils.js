
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
        alert ( lv );
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