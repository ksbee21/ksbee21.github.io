

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

	export const convertRgbToHex = ( rgbStr ) => {
		if ( !rgbStr ) 
			return undefined;
		
		const rgb = rgbStr.replace(/\s|;/g,'').match(/^rgba?\(([\d]+),([\d]+),([\d]+)(,([\d.]+))?\)/i);
		if ( !rgb || !rgb.length )
			return undefined;
		let r = (rgb[1]&255);
		let g = (rgb[2]&255);
		let b = (rgb[3]&255);
		let a = (rgb[5] ? parseFloat(rgb[5]) : '');
		//	alpha ... skip ..
		return "#" + (r < 16 ? '0' : '') + r.toString(16) + (g < 16 ? '0' : '') + g.toString(16) + (b < 16 ? '0' : '') + b.toString(16); 
	};


	export const convertHexToRgb = ( hexStr ) => {
		if ( !hexStr )
			return undefined;
		const hex = hexStr.replace(/\s|;/g,'').match(/^#([a-z|A-Z|0-9]{3,6})/i);
		if ( !hex || !hex[1] ) {
			return undefined;
		}
		let len = hex[1].length;
		let hStr = "0x";
		if ( len == 3 ) {
			let arr = hex[1].split('');
			hStr += arr[0]+arr[0]+arr[1]+arr[1]+arr[2]+arr[2];
		} else if ( len == 6 ) {
			hStr += hex[1];
		} else {
			return undefined;
		}
		return "rgb("+((hStr>>16)&255) + "," + ((hStr>>8)&255)+","+(hStr&255)+")";
	};


    /**
     * max 는 포함안됨 ...
     * Range : min <= value < max 
     */
    export const getRandomIntValue = (min,max) => {
        return Math.floor(Math.random() * (max-min) + min);
    };

    export const getHtmlRamdonHexColor = () => {
        let r = getRandomIntValue(0,256);
        let g = getRandomIntValue(0,256);
        let b = getRandomIntValue(0,256); 
        return getHtmlHexColor(r,g,b);
    };


    export const getHtmlHexColor = (r,g,b) => {
        if ( isNaN(r) || isNaN(g) || isNaN(b)  ) 
            return undefined;
        
        r = (r < 0 ? 0 : (r > 255 ? 255 : r));
        g = (g < 0 ? 0 : (g > 255 ? 255 : g));
        b = (b < 0 ? 0 : (b > 255 ? 255 : b));        
        let colors = "#";
        if ( r < 16 ) {
            colors += "0";
        }
        colors += r.toString(16);
        if ( g < 16 ) {
            colors += "0";
        }
        colors += g.toString(16);
        if ( b < 16 ) {
            colors += "0";
        }
        colors += b.toString(16);
        return colors;
    };

    /**
     * position :   c01             c02
     *                  dx,dy
     *              c03             c04
     * @param {*} dx : 단위 1을 기준으로 dx + 1- dx = 1, dx 는 c01 과 c02 사이의 c01 에서 떨어진 비율, 0 이면 c01 값이고 1이면 c02 값이 됩니다. ( c03, c04 동일)
     * @param {*} dy : 단위 1 기준 dx 와 동일한 로직 
     * @param {*} c01 
     * @param {*} c02 
     * @param {*} c03 
     * @param {*} c04 
     */
    export const makeBilinearColors = ( dx, dy, c01, c02, c03, c04 ) => {
        const firstRow = [0,0,0];
        const secondRow = [0,0,0];
        const result = [0,0,0];
        for ( let i = 0; i < 3; i++ ) {
            firstRow[i] = (c01[i]*(1-dx) + c02[i]*(dx));
            secondRow[i] = (c03[i]*(1-dx) + c04[i]*(dx));            
        }

        for ( let i = 0; i < 3; i++ ) {
            result[i] = Math.round(firstRow[i]*(1-dy)+secondRow[i]*(dy));
            result[i] = (result[i] < 0 ? 0 : (result[i] > 255 ? 255 : result[i]));
        }
        return result;
    };

