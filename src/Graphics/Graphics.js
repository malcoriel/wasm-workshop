import Paper from "paper";
import DebugDraw from "../Box2D/DebugDraw";

class Graphics {
    constructor(graphicsCanvas, game, world, debugCanvas, Box2D, showDebugView) {
        this.game = game;
        this.world = world;
        this.applyProportionateDimensions(graphicsCanvas);
        this.applyProportionateDimensions(debugCanvas);
        this.debugDraw = new DebugDraw(debugCanvas, this.world, Box2D, this.world.width * this.scale, this.world.height * this.scale, this.scale);
        this.showDebugView = showDebugView;
        Paper.setup(graphicsCanvas);
        const background = new Paper.Path.Rectangle(Paper.view.bounds);
        background.fillColor = '#201F33';
        background.sendToBack();
    }

    vec2Point(vec) {
        return new Paper.Point(vec.get_x() * this.scale, vec.get_y() * this.scale);
    }

    toggleDebugView() {
        this.showDebugView = !this.showDebugView;
        if (!this.showDebugView)
            this.debugDraw.clear();
    }

    applyProportionateDimensions(canvas) {
        // newW/newH = worldWidth/worldHeight
        const oldWidth = canvas.clientWidth;
        const oldHeight = canvas.clientHeight;
        let newWidth, newHeight, scale;
        const proportion = oldWidth / oldHeight;
        let rightProportion = this.world.width / this.world.height;
        if (proportion > rightProportion) { // landscape, fit height
            scale = oldHeight / this.world.height;
            newHeight = oldHeight;
            newWidth = (rightProportion * newHeight).toFixed(0);
        } else { // portrait, fit width
            scale = oldWidth / this.world.width;
            newWidth = oldWidth;
            newHeight = (newWidth / rightProportion).toFixed(0);
        }
        this.scale = scale;
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
    }

    update(objects) {
        if (this.showDebugView)
            this.debugDraw.update();
        Object.values(objects).forEach(obj => {
            if (obj.updateImage)
                obj.updateImage();
            else if (obj.image) {
                obj.image.position = this.vec2Point(obj.GetPosition());
                const newAngleRad = obj.GetTransform().get_q().GetAngle();
                const newAngleDeg = newAngleRad / Math.PI * 180;
                if (!obj.image.oldRot)
                    obj.image.oldRot = newAngleDeg;
                obj.image.rotate(newAngleDeg - obj.image.oldRot);
                obj.image.oldRot = newAngleDeg;
            }
        });
        Paper.view.draw();
    }

    getImageFromSprite(name, xOffset, yOffset, xSize, totalX, totalY, physicalSize, physicalPos) {
        const position = this.vec2Point(physicalPos);
        const raster = new Paper.Raster(name);
        const scaleTo = physicalSize * this.scale / xSize;
        raster.position = Graphics.getRasterAbsolutePosition(totalX, xOffset, xSize, totalY, yOffset, position);
        const path = new Paper.Shape.Rectangle({
            position: position,
            size: new Paper.Size(xSize, xSize),
            strokeColor: 'red',
        });

        // TODO 3.2 - вырежьте из спрайта прямоугольник
        /*
        * Для этого вам потребуется создать группу объектов Paper.Group([path1, path2, и т.п.]) и вернуть её
        * вместо нашего прямоугольника
        * Если у группы выставить свойство group.clipped = true, то первый её элемент будет считаться маской
        * Таким образом, нам нужно взять и создать группу из [path, raster], чтобы прямоугольник наложился на растр
        * Кроме того, необходимо будет отмасштабировать изображение для соответствия размеру окна. Это делается
        * при помощи метода group.scale(scaleTo). scaleTo уже посчитан заранее правильным образом
        * */
        return path;
    }

    static getRasterAbsolutePosition(totalX, xOffset, xSize, totalY, yOffset, position) {
        // TODO 3.1 Задайте правильную позицию растру
        /*
        * Задача - имея координаты точки в пространстве Paper (position.x, position.y), отступы до нужной картинки
        * внутри спрайта (xOffset, yOffset), и размеры всего спрайта (totalX, totalY), создать точку
        * с координатами (position.x + dX), (position.y + dY), где
        * dX - сдвиг влево относительно центра спрайта до искомой картинки
        * dY - сдвиг вверх отнсительно центра спрайта до искомой картинки
        *
        * Таким образом, искамая точка будет такова, что искомая картинка
        * находится в сдвинутом "центре" спрайта
        * */
        let dX = -9999;
        let dY = -9999;
        // console.log(name, `xOffset=${xOffset}, yOffset=${yOffset}, xSize=${xSize}, totalX=${totalX}, totalY=${totalY}, dX=${dX}, dY=${dY}`);
        return new Paper.Point(position.x + dX, position.y + dY);
    }
}

export default Graphics;
