import * as TypedMatrixUtils from './TypedMatrixUtils.js';
import * as CanvasUtils from './CanvasUtils.js';

let __repeat__Sequence__      = 0;

const makeUniqueTimeID = (prefix) => {
    let n = Date.now();
    __repeat__Sequence__++;
    if ( __repeat__Sequence__ > 9999 ) {
        __repeat__Sequence__ = 0;
    }
    if ( !prefix ) {
        prefix = "W";
    }
    return prefix+"_"+n+"_"+__repeat__Sequence__+"_ID";
};

export class Material2D {
    constructor(id, sx, sy, width, height, dragCoef) {
        if ( id === undefined ) {
            id = makeUniqueTimeID();
        }
        if ( !width )
            width = 500;
        if ( !height )
            height = 500;

        this.startX = sx;
        this.startY = sy;
        this.width = width;
        this.height = height;
        this.dragCoefficient = dragCoef;
        this.decorationStyle = {
            fillStyle : undefined,
            strokeStyle : undefined,
            lineWidth  : 1,
        };
    };

    getDragCoefficient = () => {
        return this.dragCoefficient;
    };

    setDragCoefficient = (coef) => {
        this.dragCoefficient = coef;
    };

    isIncludes = (tx, ty) => {
        if ( ty >= this.startY && ty <= (this.startY + this.height)) {
            if ( tx >= this.startX && tx <= (this.startX+ this.width) ) {
                return true;
            }
        }
        return false;
    };

    render = (ctx) => {
        ctx.save();
        ctx.beginPath();

        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.startX+this.width, this.startY);
        ctx.lineTo(this.startX+this.width, this.startY+this.height);
        ctx.lineTo(this.startX, this.startY+this.height);

        if ( this.decorationStyle.lineWidth ) {
            ctx.lineWidth = this.decorationStyle.lineWidth;
        }
        if ( this.decorationStyle.fillStyle ) {
            ctx.fillStyle = this.decorationStyle.fillStyle;
            ctx.closePath();            
            ctx.fill();
            if ( this.decorationStyle.strokeStyle ) {
                ctx.strokeStyle = this.decorationStyle.strokeStyle;
                ctx.stroke();
            }
        } else {
            if ( this.decorationStyle.strokeStyle ) {
                ctx.strokeStyle = this.decorationStyle.strokeStyle;
            }
            ctx.stroke();   
            ctx.closePath();         
        }
        ctx.restore();
    };
};

export class NewMover2D {
    constructor(id,mass,px,py) {
        if ( id === undefined ) {
            id = makeUniqueTimeID("NW");
        }
        this.id                 = id;
        this.mass               = mass;
        this.position           = TypedMatrixUtils.vec2(px,py);
        this.velocity           = TypedMatrixUtils.vec2(0,0);
        this.accelation         = TypedMatrixUtils.vec2(0,0);
        this.decorations        = {
            "fillStyle" : undefined,
            "strokeStyle" : undefined,
            "lineWidth"  : 1,
            "rgbaArray" : [],
        };
        this.velocityLimit      = -1;
        this.dampingRatio       = -1;
        this.shapeType          = -1;

        this.startTimeMills     = Date.now();
        this.aliveSeconds       = -1;

        this.wallInfos          = {
            isEnabled : false,
            sx : -1,
            sy : -1, 
            ex : -1,
            ey : -1, 
            width : -1,
            height : -1,
        };
    };
    setRgba = (r,g,b,a) => {
        this.decorations.rgbaArray[0] = r;
        this.decorations.rgbaArray[1] = g;        
        this.decorations.rgbaArray[2] = b;        
        this.decorations.rgbaArray[3] = a;                
    };
    setWalls = (sx,sy,width,height) => {
        if ( width <= 0 || height <= 0 ) {
            this.wallInfos.isEnabled = false;
            return false;
        }
        this.wallInfos.sx = sx;
        this.wallInfos.sy = sy;
        this.wallInfos.ex = (sx+width);
        this.wallInfos.ey = (sy+height);
        this.wallInfos.width = width;
        this.wallInfos.height = height;
        this.wallInfos.isEnabled = true;
        return true;
    };
    removeWall = () => {
        this.wallInfos.isEnabled = false;        
        this.wallInfos.sx = -1;
        this.wallInfos.sy = -1;
        this.wallInfos.ex = -1;
        this.wallInfos.ey = -1;
        this.wallInfos.width = -1;
        this.wallInfos.height = -1;
    };
    isDead = () => {
        if ( this.aliveSeconds < 0 ) {
            return false;
        }
        if ( (Date.now()-this.startTimeMills)/1000 > this.aliveSeconds ) {
            return true;
        }
        return false;
    };
    makeStyles = (ctx) => {
        if ( this.decorations.rgbaArray && this.decorations.rgbaArray.length == 4 ) {

            if ( this.aliveSeconds > 0 ) {
                let alpha = (1.0-((Date.now()-this.startTimeMills)/1000)/(this.aliveSeconds));
                if ( alpha < 0 ) {
                    alpha = 0;
                }
                this.decorations.rgbaArray[3] = alpha;
            }

            let rgbaStr = "rgba("+this.decorations.rgbaArray[0]
                +","+this.decorations.rgbaArray[1]
                +","+this.decorations.rgbaArray[2]
                +","+this.decorations.rgbaArray[3]+")";
            ctx.fillStyle = rgbaStr;
            ctx.strokeStyle = rgbaStr;
        } else {
            if ( this.decorations.fillStyle ) {
                ctx.fillStyle = this.decorations.fillStyle;
            }
            if ( this.decorations.strokeStyle ) {
                ctx.strokeStyle = this.decorations.strokeStyle;
            }
        }
    };
    getMass = () => {
        return this.mass;
    };
    getPositions = () =>{
        return [this.position[0], this.position[1]];
    };
    setValues = (x,y,typeNum) => {
        if ( typeNum == 1 ) {
            this.position[0] = x;
            this.position[1] = y;
        } else if ( typeNum == 2 ) {
            this.velocity[0] = x;
            this.velocity[1] = y;
        } else if ( typeNum == 3 ) {
            this.accelation[0] = x;
            this.accelation[1] = y;
        }
    };
    applyForce = ( force, isGravity ) => {
        let f = undefined;
        if ( isGravity ) {
            f = force;
        } else {
            f = TypedMatrixUtils.makeVectorDivideScalarValues(force,this.mass);
        }
        TypedMatrixUtils.makeVectorAccelationPlusValues(this.accelation, f);
    };
    updateValues = () => {
        TypedMatrixUtils.makeVectorAccelationPlusValues(this.velocity, this.accelation);
        if ( this.dampingRatio > 0 && this.dampingRatio < 1.0 ) {
            TypedMatrixUtils.makeVectorAccelationMultiplyScalarValues(this.velocity, this.dampingRatio);
        }
        TypedMatrixUtils.makeVectorAccelationPlusValues(this.position, this.velocity);
        this.setValues(0,0,3);
    };
    drawTypeCanvas = (ctx) => {
        if ( this.shapeType == -1 ) {
            ctx.arc(this.position[0], this.position[1], this.mass, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.arc(this.position[0], this.position[1], this.mass, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        }
    };
    render = (ctx) => { 
        this.updateValues();
        ctx.save();
        this.makeStyles(ctx);
        ctx.beginPath();

        this.drawTypeCanvas(ctx);

        ctx.closePath();
        ctx.restore();
        this.checkWall();
    };
    checkWall = () => {
        if ( !this.wallInfos.isEnabled ) {
            return;
        }
        if ( this.wallInfos.sx >= this.position[0] || this.wallInfos.ex <= this.position[0] ) {
            this.velocity[0] *= -1;
        }
        if ( this.wallInfos.sy >= this.position[1] || this.wallInfos.ey <= this.position[1] ) {
            this.velocity[1] *= -1;
        }
    };
};

export class MoverGroup2D {
    constructor (id) {
        if ( id === undefined ) {
            id = makeUniqueTimeID("WMG");
        }
        this.id         = id;
        this.movers     = new Map();
    };
    appendMover = (obj) => {
        if ( obj && obj.id ) {
            this.movers.set(obj.id, obj);
        }
    };
    removeMover = (id) => {
        if ( !id )
            return false;
        if ( this.movers.has(id)) {
            return this.movers.delete(id);
        }
        if ( id.id  ) { // object 자체를 넘겼을 경우
            return this.movers.delete(id.id);
        }
        return false;
    };
    applyForce = (force,isGravity,id) => {
        if ( id && this.movers.has(id)) {
            this.movers.get(id).applyForce(force,isGravity);
        } else {
            for ( let obj of this.movers.values()) {
                obj.applyForce(force,isGravity);
            }
        }
    };
    render = (ctx) => {
        ctx.save();
        for ( let obj of this.movers.values()) {
            obj.render(ctx);
        }
        ctx.restore();
    };
    removeDeadAll = () => {
        let delArray = [];
        for ( let obj of this.movers.values()) {
            if ( obj.isDead() ) {
                delArray.push(obj.id);
            }
        }
        for ( let id of delArray ) {
            this.movers.delete(id);
        }
    };
    isEmpty = () => {
        return (this.movers.size == 0);
    };
};

export class Mover2D {
    constructor (id,width,height) {
        if ( id === undefined ) {
            id = makeUniqueTimeID();
        }
        if ( !width )
            width = 500;
        if ( !height )
            height = 500;

        this.id = id;
        this.width = width;
        this.height = height;
        this.mass  = 10;
        this.positions  = TypedMatrixUtils.vec2(CanvasUtils.getRandomIntValue(0,width), CanvasUtils.getRandomIntValue(0, height));
        this.velocity   = TypedMatrixUtils.vec2(0,0);
        this.accelation = TypedMatrixUtils.vec2(0,0);
        this.veolcityLimit  = -1;   //  무제한
        this.decorationStyle = {
            fillStyle : undefined,
            strokeStyle : undefined,
            lineWidth  : 1,
        };
    };

    clearAccelation = () => {
        this.accelation[0] = 0;
        this.accelation[1] = 0;
    };

    limitVelocity = () => {
        const num = TypedMatrixUtils.getVectorLength(this.velocity);
        if ( num > this.veolcityLimit) {
            const nVec = TypedMatrixUtils.makeNormalizeVector(this.velocity);
            this.velocity = TypedMatrixUtils.makeVectorAccelationMultiplyScalarValues(nVec,this.veolcityLimit);
        }
    };

    applyForce = ( force, isGravity ) => {
        let f = undefined;
        if ( isGravity ) {
            f = force;
        } else {
            f = TypedMatrixUtils.makeVectorDivideScalarValues(force,this.mass);
        }
        TypedMatrixUtils.makeVectorAccelationPlusValues(this.accelation, f);
    };

    updateValues = () => {
        TypedMatrixUtils.makeVectorAccelationPlusValues(this.velocity, this.accelation);
        if ( this.velocityLimit > 0 ) {
            this.limitVelocity();
        }
        TypedMatrixUtils.makeVectorAccelationPlusValues(this.positions, this.velocity);
        this.clearAccelation();
    };

    render = (ctx) => {
        ctx.save();

        ctx.translate(this.positions[0],this.positions[1]);
        ctx.beginPath();

        ctx.arc(0,0,this.mass, 0, Math.PI*2);

        if ( this.decorationStyle.lineWidth ) {
            ctx.lineWidth = this.decorationStyle.lineWidth;
        }
        if ( this.decorationStyle.fillStyle ) {
            ctx.fillStyle = this.decorationStyle.fillStyle;
            ctx.fill();
            if ( this.decorationStyle.strokeStyle ) {
                ctx.strokeStyle = this.decorationStyle.strokeStyle;
                ctx.stroke();
            }
        } else {
            if ( this.decorationStyle.strokeStyle ) {
                ctx.strokeStyle = this.decorationStyle.strokeStyle;
            }
            ctx.stroke();            
        }
        ctx.closePath();
        ctx.restore();
    };

    checkEdges = () => {
        if ( this.width < this.positions[0]) {
            this.velocity[0] *= -1;
            this.positions[0] = this.width;
        }
        if ( 0 > this.positions[0]) {
            this.velocity[0] *= -1;
            this.positions[0] = 0;
        }
        if ( this.height < this.positions[1]) {
            this.velocity[1] *= -1;
            this.positions[1] = this.height;
        }
        if ( this.positions[1] < 0 ) {
            //TypedMatrixUtils.makeVectorAccelationMultiplyValues(this.velocity, -1);
        }
    };

    getPositions = () => {
        return this.positions;
    };

    getPositionX = () => {
        return this.positions[0];
    };

    getPositionY = () => {
        return this.positions[1];
    };

    getVelocity = () => {
        return this.velocity;
    };

    setMass = (mass) => {
        this.mass = mass;
    };

    getMass = () => {
        return this.mass;
    };
};

export const makeBatonUI = (ctx,cx,cy,rotation,lineSize,thickness,radius,strokeStyle,fillStyle) => {
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(rotation);
    ctx.beginPath();

    let rLen = Math.round(lineSize/2);
    let hLen = Math.round(thickness/2);
    let stX = -rLen;
    let stY = -hLen;
    let edX = rLen;
    let edY = hLen;

    ctx.lineWidth = 1;
    if ( strokeStyle ) {
        ctx.strokeStyle = strokeStyle;
    }
    if ( fillStyle ) {
        ctx.fillStyle = fillStyle;
    }

    ctx.moveTo(stX,stY);
    ctx.lineTo(edX,stY);
    ctx.lineTo(edX,edY);
    ctx.lineTo(edX,edY);
    ctx.lineTo(stX,edY);

    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();

    ctx.arc(stX,0,radius,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(edX,0,radius,0,Math.PI*2);

    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
};

