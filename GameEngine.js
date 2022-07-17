class GameEngine {

    //стейт игры
    static #state = {}

    //static #timeManager = null;

    //список локаций
    static #factories = {}

    //инициализация игры
    static init() {
        window.$ = GameEngine.getState();
        //Game.#timeManager = new TimeManager(Game.getState());
        //Game.#timeManager.check();

        //Функция добавление локации в игру
        window.gl = (name, factory) => {
            GameEngine.#factories[name] = factory;
        }
    }

    // Возврат стейта
    static getState() {
        return GameEngine.#state;
    }

    // Сохранение игры
    static saveGame() {
        //Router.open('ViewSaveGame');
    }

    // Загрузка игры
    static loadGame() {
        //Router.open('ViewLoadGame');
    }

    /*
    static settingsGame() {
        Router.open('ViewSettingsGame');
    }
    */

    // Новая игра
    static start() {
        GameEngine.exec('start');
    }

    // Продожение игры
    static continueGame() {
        //console.log('CONTINUE_GAME');
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

        //console.log(fn);

        const res = GameEngine.parse(fn());

        //console.log(res);

        //?????
        $.__res__ = res;
        
        //Router.open('ViewGame');
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