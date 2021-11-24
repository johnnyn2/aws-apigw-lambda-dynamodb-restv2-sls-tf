const { docClient, COFFEE_INFO, generateSessionId } = require('coffee-util');

async function putCoffee(coffee) {
    const params = {
        TableName: COFFEE_INFO,
        Item: {
            id: generateSessionId(),
            ...coffee,
        },
        ReturnValues: 'ALL_NEW',
    };
    const result = await docClient.put(params).promise();
    return result;
}

module.exports = {
    putCoffee,
};
