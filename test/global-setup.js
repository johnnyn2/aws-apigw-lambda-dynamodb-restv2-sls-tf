const AWS = require('aws-sdk');
const iam = new AWS.IAM();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const moment = require('moment');

const stage = 'dev';
const projectName = '';

const tableName = (name) => `${projectName}_${stage}_${name}`;

const COFFEE_INFO = tableName('coffee_info');

module.exports = async () => {
    const timestamp = moment(new Date()).format('YYYY-MM-DD');
    const roleName = 'YOUR_IAM_ROLE';
    const getRole = await iam.getRole({ RoleName: roleName }).promise();
    // eslint-disable-next-line no-unused-vars
    const { stdout } = await exec(
        `aws sts assume-role --role-arn ${getRole.Role.Arn} --role-session-name deploy-${timestamp}`,
    );
    const result = JSON.parse(stdout);
    const { AccessKeyId, SecretAccessKey, SessionToken } = result.Credentials;
    const data = {
        stage,
        COFFEE_INFO,
        AWS_ACCESS_KEY_ID: AccessKeyId,
        AWS_SECRET_ACCESS_KEY: SecretAccessKey,
        AWS_SESSION_TOKEN: SessionToken,
    };
    process.env = {
        ...process.env,
        ...data,
    };
};
