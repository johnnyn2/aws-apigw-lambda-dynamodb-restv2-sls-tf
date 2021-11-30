const AWS = require('aws-sdk');
const iam = new AWS.IAM();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const moment = require('moment');
const config = require('../config.json');
const DynamoDbLocal = require('dynamodb-local');
const dynamoLocalPort = 8000;
const { createTable } = require('../createTable');

const tables = {};
Object.keys(config.table).forEach((k) => (tables[k] = k));

const stage = 'dev';

module.exports = async () => {
    const timestamp = moment(new Date()).format('YYYY-MM-DD');
    const roleName = 'YOUR_IAM_ROLE'; // You should put your iam role here if you need to assume role for connecting your api to cloud database
    const awsConfig = {
        AWS_ACCESS_KEY_ID: 'YOUR_AWS_ACCESS_KEY_ID',
        AWS_SECRET_ACCESS_KEY: 'YOUR_SECRET_ACCESS_KEY',
    };
    if (roleName !== 'YOUR_IAM_ROLE') {
        const getRole = await iam.getRole({ RoleName: roleName }).promise();
        const { stdout } = await exec(
            `aws sts assume-role --role-arn ${getRole.Role.Arn} --role-session-name deploy-${timestamp}`,
        );
        const result = JSON.parse(stdout);
        const { AccessKeyId, SecretAccessKey, SessionToken } =
            result.Credentials;
        awsConfig.AWS_ACCESS_KEY_ID = AccessKeyId;
        awsConfig.AWS_SECRET_ACCESS_KEY = SecretAccessKey;
        awsConfig['AWS_SESSION_TOKEN'] = SessionToken;
    }
    const data = {
        stage,
        ...tables,
        ...awsConfig,
    };
    process.env = {
        ...process.env,
        ...data,
    };

    let child = await DynamoDbLocal.launch(dynamoLocalPort, null, [
        '-sharedDb',
    ]);
    await createTable();
    global.__DYNAMODB__ = child;
};
