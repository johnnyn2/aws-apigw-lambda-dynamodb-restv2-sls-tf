const { docClient, COFFEE_INFO, generateSessionId } = require('coffee-util');

async function putCoffee(coffee) {
    const now = new Date().toISOString();
    coffee.price = Number(coffee.price);
    const params = {
        TableName: COFFEE_INFO,
        Item: {
            id: generateSessionId(),
            ...coffee,
            createDate: now,
            updateDate: now,
        },
    };
    await docClient.put(params).promise();
    return params;
}

module.exports = {
    putCoffee,
};
