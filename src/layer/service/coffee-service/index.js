const {
    docClient,
    COFFEE_INFO,
    ORIGIN_INDEX,
    generateSessionId,
    queryDDB,
} = require('coffee-util');

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

async function queryCoffeeByOrigin(origin) {
    const params = {
        TableName: COFFEE_INFO,
        IndexName: ORIGIN_INDEX,
        KeyConditionExpression: 'origin = :origin',
        ExpressionAttributeValues: {
            ':origin': origin,
        },
    };
    const result = await queryDDB(params);
    return result;
}

module.exports = {
    putCoffee,
    queryCoffeeByOrigin,
};
