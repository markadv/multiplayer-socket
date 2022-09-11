module.exports = {
    isBetween: (length, min, max) => {
        return length < min || length > max ? false : true;
    },
    /* Uses this as reference: http://emailregex.com/ */
    isValidEmail: (email) => {
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            email
        );
    },
    /* Uses this as reference: https://www.regextester.com/93648 */
    isValidName: (name) => {
        return /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g.test(name);
    },
    getObjKey(obj, value) {
        return Object.keys(obj).find((key) => obj[key] === value);
    },
};
