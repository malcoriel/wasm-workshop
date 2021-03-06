let initializing = null;
let InitBox2d = null;

// TODO 1.2 - замените на вызов require или import из локальной папки
const Box2DLoader = window.Box2D;

const initBox2D = async () => {
    if (InitBox2d)
        return InitBox2d;
    if (initializing)
        return initializing;
    initializing = Box2DLoader()
        .then((result) => {
            InitBox2d = result;
            result.then = null;
            return result;
        });
    return initializing;
};

export default initBox2D;
