

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
            result[t] = pixels[idx+t];
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

