const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const crypto = require('crypto');

const isTest = process.env.JEST_WORKER_ID;
const docClient = new DocumentClient({
    region: 'ap-east-1',
    ...(isTest && {
        endpoint: 'http://localhost:8000',
        sslEnabled: false,
        region: 'local-env',
    }),
});

const COFFEE_INFO = process.env.COFFEE_INFO;
const ORIGIN_INDEX = 'ORIGIN_INDEX';

/**
 * Receives an array of headers and extract the value from the cookie header
 * @param  {String}   errors List of errors
 * @return {Object}
 */
function getCookiesFromHeader(headers) {
    if (
        headers === null ||
        headers === undefined ||
        headers.Cookie === undefined
    ) {
        return {};
    }

    // Split a cookie string in an array (Originally found http://stackoverflow.com/a/3409200/1427439)
    var list = {},
        rc = headers.Cookie;

    rc &&
        rc.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            var key = parts.shift().trim();
            var value = decodeURI(parts.join('='));
            if (key != '') {
                list[key] = value;
            }
        });

    return list;
}

/**
 * Build a string appropriate for a `Set-Cookie` header.
 * @param {string} key     Key-name for the cookie.
 * @param {string} value   Value to assign to the cookie.
 * @param {object} options Optional parameter that can be use to define additional option for the cookie.
 * ```
 * {
 *     secure: boolean // Watever to output the secure flag. Defaults to true.
 *     httpOnly: boolean // Watever to ouput the HttpOnly flag. Defaults to true.
 *     domain: string // Domain to which the limit the cookie. Default to not being outputted.
 *     path: string // Path to which to limit the cookie. Defaults to '/'
 *     expires: UTC string or Date // When this cookie should expire.  Default to not being outputted.
 *     maxAge: integer // Max age of the cookie in seconds. For compatibility with IE, this will be converted to a `expires` flag. If both the expires and maxAge flags are set, maxAge will be ignores. Default to not being outputted.
 *      sameSite: // Chrome now only delivers cookies with cross-site requests if they are set with `SameSite=None` and `Secure`
 * }
 * ```
 * @return string
 */
function setCookieString(key, value, options) {
    var defaults = {
        secure: true,
        httpOnly: true,
        domain: false,
        path: '/',
        expires: false,
        maxAge: false,
        sameSite: 'None',
    };
    if (typeof options == 'object') {
        options = Object.assign({}, defaults, options);
    } else {
        options = defaults;
    }

    var cookie = key + '=' + value;

    if (options.domain) {
        cookie = cookie + '; domain=' + options.domain;
    }

    if (options.path) {
        cookie = cookie + '; path=' + options.path;
    }

    if (!options.expires && options.maxAge) {
        options.expires = new Date(
            new Date().getTime() + parseInt(options.maxAge) * 1000,
        ); // JS operate in Milli-seconds
    }

    if (
        typeof options.expires == 'object' &&
        typeof options.expires.toUTCString
    ) {
        options.expires = options.expires.toUTCString();
    }

    if (options.expires) {
        cookie = cookie + '; expires=' + options.expires.toString();
    }

    if (options.secure) {
        cookie = cookie + '; Secure';
    }

    if (options.httpOnly) {
        cookie = cookie + '; HttpOnly';
    }

    if (options.sameSite) {
        cookie = cookie + '; SameSite=' + options.sameSite;
    }

    return cookie;
}

function getRandomBytes() {
    const buffer = crypto.randomBytes(16);
    return buffer;
}

/**
 * This function is just a simple implementation of tomcat session id generation. It assumes using default SecureRandom platform api.
 * @param {*} route
 * @returns sessionId
 */
function generateSessionId(route) {
    // session id generation: https://github.com/apache/tomcat/blob/9cf742b7dfc74b9cfd82e041736d7509fe7faacf/java/org/apache/catalina/util/StandardSessionIdGenerator.java#L22
    let random = new Uint32Array(new ArrayBuffer(16));
    const sessionIdLength = 16;
    let resultLenBytes = 0;
    let buffer = '';
    while (resultLenBytes < sessionIdLength) {
        random = getRandomBytes();
        for (
            let j = 0;
            j < random.length && resultLenBytes < sessionIdLength;
            j++
        ) {
            const b1 = (random[j] & 0xf0) >> 4;
            const b2 = random[j] & 0x0f;
            if (b1 < 10) {
                buffer = buffer.concat(b1);
            } else {
                const char = String.fromCharCode(65 + (b1 - 10));
                buffer = buffer.concat(char);
            }
            if (b2 < 10) {
                buffer = buffer.concat(b2);
            } else {
                const char = String.fromCharCode(65 + (b2 - 10));
                buffer = buffer.concat(char);
            }
            resultLenBytes++;
        }
    }

    if (typeof route !== 'undefined' && route.length > 0) {
        buffer = buffer.concat('.'.concat(route));
    }

    return buffer;
}

function isForbiddenRequest(origins, origin) {
    return !origins.includes(origin);
}

async function queryDDB(params) {
    let items = [];
    let LastEvaluatedKey = undefined;
    do {
        if (typeof LastEvaluatedKey !== 'undefined') {
            params.ExclusiveStartKey = LastEvaluatedKey;
        }
        const result = await docClient.query(params).promise();
        items = [...items, ...result.Items];
        LastEvaluatedKey = result.LastEvaluatedKey;
    } while (typeof LastEvaluatedKey !== 'undefined');
    return items;
}

var generatePolicy = function (principalId, effect, resource) {
    // Required output:
    var authResponse = {};
    authResponse.principalId = principalId;
    var policyDocument = {};
    policyDocument.Version = '2012-10-17'; // default version
    policyDocument.Statement = [];
    var statementOne = {};
    statementOne.Action = 'execute-api:Invoke'; // default action
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
    return authResponse;
};

var generateAllow = function (principalId, resource) {
    return generatePolicy(principalId, 'Allow', resource);
};

var generateDeny = function (principalId, resource) {
    return generatePolicy(principalId, 'Deny', resource);
};

const ALLOWED_ORIGINS = ['http://localhost:3000'];

module.exports = {
    docClient,
    COFFEE_INFO,
    ORIGIN_INDEX,
    generateSessionId,
    isForbiddenRequest,
    queryDDB,
    generateAllow,
    generateDeny,
    ALLOWED_ORIGINS,
    getCookiesFromHeader,
    setCookieString,
};
