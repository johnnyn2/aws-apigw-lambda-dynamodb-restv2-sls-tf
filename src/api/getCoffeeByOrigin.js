/* eslint-disable no-unused-vars */
const { queryCoffeeByOrigin } = require('coffee-service');

module.exports.handler = async function (event, context) {
    const result = {
        statusCode: 200,
        body: '',
    };
    const params = event.queryStringParameters;
    try {
        const { origin } = params;
        const data = await queryCoffeeByOrigin(origin);
        result.body = JSON.stringify(data);
        return result;
    } catch (e) {
        console.log(e);
        result.statusCode = 500;
        result.body = `Get coffee error! ${e.message}`;
    }
    return result;
};
