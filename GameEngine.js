class GameEngine {

    /**
     * Стейт игры хранится состояние игры
     * В полях {__name} - храниться информация от движка
     * В ней храниться состояния парсинга {__parsedText} 
     */
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
    static autoSaveGame(index) {
        GameEngine.#saveGameName(GameEngine.#prefAutoSave + index);
    }

    /**
     * Автоматическая загрузка
     * @param {number} index 
     */
    static autoLoadGame(index) {
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

    /**
     * Шаблон пути к локациям игры
     */
    static pathLocations = `./src/game/{name}.js`

    /**
     * Имя локации
     * @param {string} name 
     * @returns 
     */
    static async exec(name) {
        const src = GameEngine.pathLocations.replace('{name}', name);
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

        $.__parsedText = res;
    }

    /**
     * Парсинг строки в объект
     * @param {string} text данные
     * @param {object} shema схема
     *      пример схемы:
     *          {
     *              img: {},
     *              video: {},
     *              C: {name: 'caption'},
     *              L: {name: 'navLeft', isArray: true, propertyNames: ['img', 'text', 'exec']},
     *              R: {name: 'navRight', isArray: true, propertyNames: ['img', 'text', 'exec']}
     *           }
     * @returns object
     */
    static parseText(text, shema = {}) {

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

        const res = {};

        res.html = obj.html;

        obj.params.forEach(param => {
            const [key, ...values] = param
            if (!shema[key]) return
            let value = values[0];
            if (shema[key].propertyNames) {
                value = {};
                shema[key].propertyNames.forEach((name, i) => value[name] = values[i])
            }
            const _key = (shema[key].name) ? shema[key].name : key;
            if (shema[key].isArray) {
                if (!Array.isArray(res[_key])) res[_key] = [];
                res[_key].push(value); 
            } else {
                res[_key] = value;
            }
        });

        return res;
    }

    /**
     * Схема игры
     */
    shemaGame = {
        img: {},
        video: {},
        C: {name: 'caption'},
        L: {name: 'navLeft', isArray: true, propertyNames: ['img', 'text', 'exec']},
        R: {name: 'navRight', isArray: true, propertyNames: ['img', 'text', 'exec']}
    }

    /**
     * Метод парсинга строки в обьект по стандартной схеме
     * @param {string} text данные
     * @returns 
     */
    static parse(text) {
        return GameEngine.parseText(text, GameEngine.shemaGame);
    }

    /**
     * Метод только для тестов
     * @param {string|number} value 
     */
    static __setTestValue(value) {
        this.#state.__testValue = value;
    }

}

GameEngine.init();