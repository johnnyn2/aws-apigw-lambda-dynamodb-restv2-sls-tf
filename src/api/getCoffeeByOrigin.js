/* eslint-disable no-unused-vars */
const { queryCoffeeByOrigin } = require('coffee-service');
const { getCookiesFromHeader, setCookieString } = require('coffee-util');

module.exports.handler = async function (event, context) {
    const result = {
        statusCode: 200,
        body: '',
        headers: {
            'Access-Control-Allow-Origin': event.headers.origin,
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Access-Control-Allow-Credentials': true,
        },
    };
    const params = event.queryStringParameters;
    const cookies = getCookiesFromHeader(event.headers);
    console.log('cookies extracted from requet: ', cookies);
    try {
        const { origin } = params;
        const data = await queryCoffeeByOrigin(origin);
        result.body = JSON.stringify(data);
        const tmr = new Date();
        tmr.setDate(tmr.getDate() + 1);
        const sweetCookie = setCookieString('Sweet_Cookie', 'GREAT', {
            expires: tmr,
        });
        const bitterCookie = setCookieString('Bitter_Cookie', 'AWESOME', {
            expires: tmr,
        });
        result.headers['Set-Cookie'] = [sweetCookie, bitterCookie];
        return result;
    } catch (e) {
        console.log(e);
        result.statusCode = 500;
        result.body = `Get coffee error! ${e.message}`;
    }
    return result;
};
