const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const crypto = require('crypto');

const config =
    process.env.stage === 'dev'
        ? {
              endpoint: 'http://localhost:8000',
          }
        : {};
const docClient = new DocumentClient({
    region: 'ap-east-1',
    ...config,
});

const COFFEE_INFO = process.env.COFFEE_INFO;

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

module.exports = {
    docClient,
    COFFEE_INFO,
    generateSessionId,
};
