const DynamoDbLocal = require('dynamodb-local');

module.exports = async () => {
    if (typeof global.__DYNAMODB__ !== 'undefined') {
        DynamoDbLocal.stopChild(global.__DYNAMODB__);
    }
};
