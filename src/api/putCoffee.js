/* eslint-disable no-unused-vars */
const { putCoffee } = require('coffee-service');

module.exports.handler = async (event, context) => {
    const result = {
        statusCode: 200,
        body: '',
    };
    try {
        const coffee = JSON.parse(event.body);
        const data = await putCoffee(coffee);
        result.body = JSON.stringify(data);
        return result;
    } catch (e) {
        result.statusCode = 500;
        result.body = 'Put coffee error!';
    }
    return result;
};
