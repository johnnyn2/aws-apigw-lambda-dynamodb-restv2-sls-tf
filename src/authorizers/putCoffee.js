const {
    isForbiddenRequest,
    generateAllow,
    ALLOWED_ORIGINS,
} = require('coffee-util');

module.exports.handler = async function (event, context, callback) {
    if (isForbiddenRequest([...ALLOWED_ORIGINS], event.headers.origin)) {
        callback('unauthorized');
    } else {
        callback(null, generateAllow('me', event.methodArn));
    }
};
