/**
 * This script is only used for setting up local dynamodb. You should deploy your database on cloud and connect it for usage.
 */
const AWS = require('aws-sdk');
const config = require('./config.json');

AWS.config.update({
    region: 'ap-east-1',
    endpoint: 'http://localhost:8000',
});

const db = new AWS.DynamoDB();
const table = config.table;

async function createTable() {
    for (const k of Object.keys(table)) {
        const result = await db.createTable(table[k]).promise();
        console.log(result);
    }
}

module.exports = {
    createTable,
};
