function extractCookieFromSetCookie(cookieStr) {
    const cookie = {};
    const props = cookieStr.split(';');
    props.forEach((prop) => {
        const [first, second] = prop.split('=');
        if (typeof second === 'undefined') {
            cookie[first.trim()] = true;
        } else {
            cookie[first.trim()] = second.trim();
        }
    });
    return cookie;
}

function methodArn(region, accountId, apiId, action, path) {
    return `arn:aws:execute-api:${region}:${accountId}:${apiId}/*/${action}/${path}`;
}

function sortObjectByKey(unordered) {
    Object.keys(unordered)
        .sort()
        .reduce((obj, key) => {
            obj[key] = unordered[key];
            return obj;
        }, {});
}

module.exports = {
    extractCookieFromSetCookie,
    methodArn,
    sortObjectByKey,
};
