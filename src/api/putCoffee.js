/* eslint-disable no-unused-vars */
const { putCoffee } = require('coffee-service');
const { setCookieString } = require('coffee-util');

module.exports.handler = async (event, context) => {
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
    try {
        const coffee = JSON.parse(event.body);
        console.log('coffee: ', coffee);
        const data = await putCoffee(coffee);
        result.body = JSON.stringify(data);
        const oneDayinSec = 24 * 60 * 60;
        const threeMonthinSec = oneDayinSec * 30 * 3;
        result.headers['Set-Cookie'] = setCookieString(
            'Latte_with_Sweet_Cookie',
            'GREAT',
            {
                maxAge: threeMonthinSec,
            },
        );
        return result;
    } catch (e) {
        console.log(e);
        result.statusCode = 500;
        result.body = `Put coffee error! ${e.message}`;
    }
    return result;
};
