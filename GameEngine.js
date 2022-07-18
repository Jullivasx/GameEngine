class GameEngine {

    //стейт игры
    static #state = {}

    //список локаций
    static #factories = {}

    //инициализация игры
    static init() {
        window.$ = GameEngine.getState();

        //Функция добавление локации в игру
        window.gl = (name, factory) => {
            GameEngine.#factories[name] = factory;
        }
    }

    // Возврат стейта
    static getState() {
        return GameEngine.#state;
    }

    // максимальное число индексов сохранений
    static #maxIndexGame = 40;
    static #maxAutoIndexGame = 8;
    static #maxQuickIndexGame = 8;

    // префиксы для сохранений
    static #prefSave = "save_"
    static #prefQuickSave = "save_quick_"
    static #prefAutoSave = "save_auto_"

    /**
     * Сохранение игры в ячейку по имени
     * @param {string} name 
     */
    static #saveGameName(name) {
        localStorage[name] = JSON.stringify(GameEngine.#state);
    }

    /**
     * Загрузка игры в ячейку по имени
     * @param {string} name 
     */
    static #loadGameName(name) {
        GameEngine.#state = JSON.parse(localStorage[name]);
    }

    /**
     * Проверка есть ли ячейка по имени
     * @param {string} name 
     * @returns 
     */
    static #existsGameName(name) {
        if (localStorage[name]) {
            return true;
        }
        return false;
    }

    /**
     * Сохранение игры в ячейку 
     * @param {number} index 
     */
    static saveGame(index) {
        GameEngine.#saveGameName(GameEngine.#prefSave + index);
    }

    /**
     * Загрузка игры из ячейки
     * @param {number} index 
     */
    static loadGame(index) {
        GameEngine.#loadGameName(GameEngine.#prefSave + index);
    }

    /**
     * Есть ли игра с индексом
     * @param {number} index 
     */
    static existsGame(index) {
        return GameEngine.#existsGameName(GameEngine.#prefSave + index);
    }

    /**
     * Быстрое сохранение
     * @param {number} index 
     */
    static quickSaveGame(index) {
        GameEngine.#saveGameName(GameEngine.#prefQuickSave + index);
    }

    /**
     * Быстрая загрузка
     * @param {number} index 
     */
    static quickLoadGame(index) {
        GameEngine.#loadGameName(GameEngine.#prefQuickSave + index);
    }

    /**
     * Есть ли игра с индексом
     * @param {number} index 
     */
    static existsQuickGame(index) {
        return GameEngine.#existsGameName(GameEngine.#prefQuickSave + index);
    }

    /**
     * Автоматическое сохранение
     * @param {number} index 
     */
    static autoSave(index) {
        GameEngine.#saveGameName(GameEngine.#prefAutoSave + index);
    }

    /**
     * Автоматическая загрузка
     * @param {number} index 
     */
    static autoLoad(index) {
        GameEngine.#loadGameName(GameEngine.#prefAutoSave + index);
    }

    /**
     * Есть ли игра с индексом
     * @param {number} index 
     */
    static existsAutoGame(index) {
        return GameEngine.#existsGameName(GameEngine.#prefAutoSave + index);
    }

    // Новая игра
    static start() {
        GameEngine.exec('start');
    }

    // Продожение игры
    static continueGame() {
        
    }

    // Исполнение локаци
    static async exec(name) {
        const src = `./src/game/${name}.js`;
        if (!GameEngine.#factories[name]) {
            try {
                await Build.load(src);
            } catch(err) {
                console.error('Game: File Not Found ' + src);
                return;
            }
            if (!GameEngine.#factories[name]) {
                console.error('Game: Not Location ' + name);
                return;
            }
        }
        const fn = GameEngine.#factories[name];

        if (typeof(fn) !== 'function') {
            console.error('Game: Not Function ' + name);
            return;
        }

        const res = GameEngine.parse(fn());

        //?????
        $.__res__ = res;
    }

    static params(obj) {

        obj.params.forEach((param) => {

            if (param[0] === 'img') {
                obj.image = param[1];
            }

            if (param[0] === 'video') {
                obj.video = param[1];
            }

            if (param[0] === 'C') {
                obj.caption = param[1];
            }

            if (param[0] === 'L') {
                if (!Array.isArray(obj.navLeft)) obj.navLeft = [];
                obj.navLeft.push({
                    img: param[1],
                    text: param[2],
                    exec: param[3],
                });
            }

            if (param[0] === 'R') {
                if (!Array.isArray(obj.navRight)) obj.navRight = [];
                obj.navRight.push({
                    img: param[1],
                    text: param[2],
                    exec: param[3],
                });
            }
            
        });

        return obj;

    }

    //парсинг ответа
    static parse(text) {
        const obj = text.split('[').reduce((result, value, index) => {

            if (index === 0) {
                result.html = value;
                return result;
            }

            const [link, html] = value.split(']');

            result.html += html;
            result.params.push(link.split('|'));

            return result;
        },{
            html:'',
            params: [],
        });
        return GameEngine.params(obj);
    }

}

GameEngine.init();