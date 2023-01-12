

    export const makeCanvasObject = (idValue, parentObj, width, height) => {
        let canvasObj = document.getElementById(idValue);
        if ( !canvasObj ) {
            canvasObj = document.createElement("CANVAS");
            canvasObj.setAttribute("id", idValue);
            if ( !width || width <= 0 )
                width = 800;
            if ( !height || height <= 0 )
                height = 800;
            if ( parentObj ) {
                parentObj.appendChild(canvasObj);
            } else {
                document.body.appendChild(canvasObj);
            }
        } else {
            if ( !width || width <= 0 )
                width = canvasObj.clientWidth;
            if ( !height || height <= 0 )
                height = canvasObj.clientHeight;
        }
        canvasObj.width = width;
        canvasObj.height = height;
        canvasObj.style.width = width + "px";
        canvasObj.style.height = height +"px";
        return canvasObj;
    };

    export const loadImageFromURL = async (url) => {
        const img = new Image();
        return new Promise((resolve, reject) => {
            img.addEventListener("load", () => {
                resolve(img);
            },false);
            img.addEventListener("error", () => {
                reject(img);
            });
            img.src = url;
        });
    };

    export const makeCanvasImageData = async (url) => {
        const image = await loadImageFromURL(url);
        const canvas = document.createElement("canvas");
        const width = image.width;
        const height = image.height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image,0,0);
        return ctx.getImageData(0,0,width,height);
    };

    export const getPixels = (x,y,paddingType,w,h,pixels) => {
        if ( !pixels )
            return undefined;

        if ( !w ) 
            w = pixels.width;
        if ( !h )
            h = pixels.height;
        
        const result = new Uint8Array(4);
        if ( paddingType == 1 ) {   // extend edge values
            if ( x < 0 )
                x = 0;
            if ( x >= w )
                x = w-1;
            if ( y < 0 )
                y = 0;
            if ( y >= h ) 
                y = h-1;
        } else if ( paddingType == 2 ) {    //  zero padding
            if ( x < 0 || x >= w || y < 0 || y >= h ) {
                result[0] = result[1] = result[2] = 0;
                result[3] = 255;
                return result;
            }
        } else {
            if ( x < 0 )
                x = 0;
            if ( x >= w )
                x = w-1;
            if ( y < 0 )
                y = 0;
            if ( y >= h ) 
                y = h-1;
        }
        const idx = y*w*4+x*4;
        
        for ( let t = 0; t < 4; t++ ) {
            result[t] = pixels.data[idx+t];
        }
        return result;
    };

    export const inverseImageData = ( originalData, transData) => {
        if ( !originalData || !transData  ) {
            alert( "Data 확인이 필요합니다. ");
            return transData;
        }
        const len = originalData.data.length;
        if ( len != transData.data.length ) {
            alert ( "Data 길이가 일치하지 않습니다. ");
            return transData;
        }    
        for ( let i = 0; i < len; i += 4 ) {
            let j = 0
            for ( ; j < 3; j++ ) {
                transData.data[i+j] = 255-originalData.data[i+j];
            }
            transData.data[i+j] = originalData.data[i+j]; // alpha(투명도) 값은 변화 없음
        }    
        return transData;
    };

    export const translateGrayScaleData = (originalData, transData) => {
        /*
        1. 0.299 * r +  0.587 * g +  0.114 * b 
        2. 0.2126 * r +  0.7152 * g +  0.0722 * b 
        3. 0.2627 * r +  0.6780 * g +  0.0593 * b 
        */
        if ( !originalData || !transData  ) {
            alert( "Data 확인이 필요합니다. ");
            return transData;
        }
        
        const len = originalData.data.length;
        if ( len != transData.data.length ) {
            alert ( "Data 길이가 일치하지 않습니다. ");
            return transData;
        }
        let coffArray = new Float32Array([0.2126, 0.7152, 0.0722]);    
        for ( let i = 0; i < len; i += 4 ) {
            let v = 0;
            let j = 0
            for ( ; j < 3; j++ ) {
                v += (originalData.data[i+j]*coffArray[j]);
            }
            v = Math.round(v);
            v = v > 255 ? 255 : (v < 0 ? 0 : v);
            for ( j = 0 ; j < 3; j++ ) {
                transData.data[i+j] = v;
            }
            transData.data[i+j] = originalData.data[i+j]; // alpha(투명도) 값은 변화 없음
        }    
        return transData;
    };

    /**
     * 
     * @param {*} typeNum => 1 : ridge, 2 : edge detection, 3 : sharpen, 4 : box blur 
     *                      , 5 : gaussian blur(3x3) , 6 : gaussian blur(5x5), 7 : unsharp masking(5x5 )
     * 
     * @returns 
     */
    export const getImageKernelByType = ( typeNum ) => {
        //  Ridge 
        let result = undefined;

        switch( typeNum ) {
            case 1 :    //  ridge
                result = new Float32Array( [
                    0, -1, 0, 
                    -1, 4, -1, 
                    0, -1, 0
                ]);
                result.rows = 3;
                result.cols = 3;
                result.xPos = 1;
                result.yPos = 1;
                break;
            case 2 : 
                result = new Float32Array( [
                    -1, -1, -1, 
                    -1, 8, -1, 
                    -1, -1, -1
                ]);
                result.rows = 3;
                result.cols = 3;
                result.xPos = 1;
                result.yPos = 1;
                break;
            case 3 :
                result = new Float32Array( [
                    0, -1, 0, 
                    -1, 5, -1, 
                    0, -1, 0
                ]);
                result.rows = 3;
                result.cols = 3;
                result.xPos = 1;
                result.yPos = 1;
                break;
            case 4 :
                result = new Float32Array( [
                    1/9, 1/9, 1/9, 
                    1/9, 1/9, 1/9, 
                    1/9, 1/9, 1/9
                ]);
                result.rows = 3;
                result.cols = 3;
                result.xPos = 1;
                result.yPos = 1;
                break;
            case 5 :
                result = new Float32Array( [
                    1/16, 2/16, 1/16, 
                    2/16, 4/16, 2/16, 
                    1/16, 2/16, 1/16
                ]);
                result.rows = 3;
                result.cols = 3;
                result.xPos = 1;
                result.yPos = 1;
                break;
            case 6 :
                result = new Float32Array( [
                    1/256, 4/256, 6/256, 4/256, 1/256,
                    4/256, 16/256, 24/256, 16/256, 4/256,
                    6/256, 24/256, 36/256, 24/256, 6/256,
                    4/256, 16/256, 24/256, 16/256, 4/256,
                    1/256, 4/256, 6/256, 4/256, 1/256,                    
                ]);
                result.rows = 5;
                result.cols = 5;
                result.xPos = 2;
                result.yPos = 2;
                break;
            case 7 :
                result = new Float32Array( [
                    -1/256, -4/256, -6/256, -4/256, -1/256,
                    -4/256, -16/256, -24/256, -16/256, -4/256,
                    -6/256, -24/256, 476/256, -24/256, -6/256,
                    -4/256, -16/256, -24/256, -16/256, -4/256,
                    -1/256, -4/256, -6/256, -4/256, -1/256,               
                ]);
                result.rows = 5;
                result.cols = 5;
                result.xPos = 2;
                result.yPos = 2;
                break;
            default :
                result = new Float32Array( [
                    0, 0, 0, 
                    0, 1, 0, 
                    0, 0, 0
                ]);
                result.rows = 3;
                result.cols = 3;
                result.xPos = 1;
                result.yPos = 1;
                break;
        }
        return result;
    };

    export const executeConvolution = (typeNum, originalData, transData, paddingType) => {
        if ( !originalData || !transData  ) {
            alert( "Data 확인이 필요합니다. ");
            return transData;
        }
        
        const len = originalData.data.length;
        if ( len != transData.data.length ) {
            alert ( "Data 길이가 일치하지 않습니다. ");
            return transData;
        }
        const kernel = getImageKernelByType(typeNum);
        const kRows = kernel.rows;
        const kCols = kernel.cols;
        const xPos = kernel.xPos;
        const yPos = kernel.yPos;

        const width = originalData.width;
        const height = originalData.height;

        const calcPixels = new Float32Array(4);

        for ( let r = 0; r < height; r++ ) {
            for ( let c = 0; c < width; c++ ) {
                for ( let t = 0; t < 4; t++ ) {
                    calcPixels[t] = 0;
                }
                for ( let kr = 0; kr < kRows; kr++ ) {
                    for ( let kc = 0; kc < kCols; kc++ ) {
                        let x = c+kc-xPos;
                        let y = r+kr-yPos;
                        let pixels = getPixels(x,y,paddingType,width,height,originalData);
                        let tdx = kr*kCols+kc;
                        for ( let t = 0; t < 3; t++ ) {
                            calcPixels[t] += (pixels[t]*kernel[tdx]);
                        }
                    }
                }

                const idx = r*width*4+c*4;
                for ( let t = 0; t < 3; t++ ) {
                    let v = Math.round(calcPixels[t]);
                    v = (v > 255 ? 255 : (v < 0 ? 0 : v));
                    transData.data[idx+t] = v;
                }                
                transData.data[idx+3] = originalData.data[idx+3];
            }
        }
        return transData;
    };

