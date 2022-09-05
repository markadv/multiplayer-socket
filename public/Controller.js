/* This is a controller build where you have to have lift your finger before
another input is accepted. Purpose: Tactile and frantic gameplay. */
class Controller {
    constructor(keyCode, callback) {
        let keySafe = true;
        this.keydownFunction = function (event) {
            if (event.code === keyCode) {
                if (keySafe) {
                    keySafe = false;
                    callback();
                }
            }
        };
        this.keyupFunction = function (event) {
            if (event.code === keyCode) {
                keySafe = true;
            }
        };
        document.addEventListener("keydown", this.keydownFunction);
        document.addEventListener("keyup", this.keyupFunction);
    }

    unbind() {
        document.removeEventListener("keydown", this.keydownFunction);
        document.removeEventListener("keyup", this.keyupFunction);
    }
}
