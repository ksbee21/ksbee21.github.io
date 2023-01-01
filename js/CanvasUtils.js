

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
