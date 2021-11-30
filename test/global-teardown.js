const DynamoDbLocal = require('dynamodb-local');

module.exports = async () => {
    DynamoDbLocal.stopChild(global.__DYNAMODB__);
};
