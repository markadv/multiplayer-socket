class Controller {
    constructor() {}
    _view = async (req, res, view = {}) => {
        res.render("default.ejs", view);
    };
    _flashData = async (req, res) => {
        res.locals.sessionFlash = req.session.sessionFlash;
        delete req.session.sessionFlash;
    };
    _flash = async (req, message) => {
        req.session.sessionFlash = message;
    };
    _redirect = async (req, res, url) => {
        const temp = JSON.stringify(res.locals.profiler);
        req.session.profiler = temp;
        await res.redirect(url);
    };
    /* Future implementation for profiler */
    // _ajax = async (req, res) => {
    //     const temp = this._simpleStringify(res.locals.profiler);
    //     req.session.profiler = temp;
    // };
    /* stringify an object, avoiding circular structure by Markad */
}

module.exports = Controller;
