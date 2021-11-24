const util = require('util');
const { spawn } = require('child_process');
const moment = require('moment');
const exec = util.promisify(require('child_process').exec);
const AWS = require('aws-sdk');
const sts = new AWS.STS();
const iam = new AWS.IAM();

const stage = process.env.npm_lifecycle_event;

async function getCallerIdentityAccuont() {
    try {
        const callerIdentityPromise = await sts.getCallerIdentity().promise();
        const callerIdentity = callerIdentityPromise.Account;
        return callerIdentity;
    } catch (e) {
        console.error(e);
    }
}

(async function () {
    const accountId = await getCallerIdentityAccuont();
    const roleName = 'YOUR_IAM_ROLE';
    const getRole = await iam.getRole({ RoleName: roleName }).promise();
    const timestamp = moment(new Date()).format('YYYY-MM-DD');
    const { stdout } = await exec(
        `aws sts assume-role --role-arn ${getRole.Role.Arn} --role-session-name deploy-${timestamp}`,
    );
    const result = JSON.parse(stdout);
    const { AccessKeyId, SecretAccessKey, SessionToken } = result.Credentials;

    const offline = spawn('serverless', ['offline'], {
        stdio: 'inherit',
        env: {
            stage: stage,
            accountId,
            AWS_ACCESS_KEY_ID: AccessKeyId,
            AWS_SECRET_ACCESS_KEY: SecretAccessKey,
            AWS_SESSION_TOKEN: SessionToken,
        },
    });
    offline.on('error', (err) => console.error(err));
})();
