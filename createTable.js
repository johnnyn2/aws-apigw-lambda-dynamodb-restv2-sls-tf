/**
 * This script is only used for setting up local dynamodb. You should deploy your database on cloud and connect it for usage.
 */
const { DynamoDB } = require('aws-sdk');
const config = require('./config.json');

const db = new DynamoDB({
    region: 'ap-east-1',
    endpoint: 'http://localhost:8000',
});

(async function () {
    const table = config.table;
    Object.keys(table).forEach(async (k) => {
        const result = await db.createTable(table[k]).promise();
        console.log(result);
    });
})();
