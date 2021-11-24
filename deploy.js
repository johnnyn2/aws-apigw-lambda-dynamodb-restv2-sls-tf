/* eslint-disable no-unused-vars */
const AWS = require('aws-sdk');
const { exec, spawn, ChildProcess } = require('child_process');
const moment = require('moment');
const sts = new AWS.STS();
const iam = new AWS.IAM();

const terraform = 'terraform';
const serverless = 'serverless';
const getPlatform = (action) => {
    if (action === 'tf') {
        return terraform;
    } else if (action === 'sls') {
        return serverless;
    } else {
        return null;
    }
};
const [action, stage] = process.env.npm_lifecycle_event.split(':');
const [platformAbbr, cmd] = action.split('-');
const platform = getPlatform(platformAbbr);

async function getCallerIdentityAccuont() {
    try {
        const callerIdentityPromise = await sts.getCallerIdentity().promise();
        const callerIdentity = callerIdentityPromise.Account;
        return callerIdentity;
    } catch (e) {
        console.error(e);
    }
}

/**
 * A helper function to invoke nodejs spawn() function
 * @param {string} command
 * @param {readonly string[]} args
 * @param {SpawnOptions} options
 * @param {ChildProcess} nextProcess
 */
function spawnProcess(command, args, options, nextProcess) {
    const result = spawn(command, args, options);
    result
        .on('close', (code) => {
            if (code === 0) {
                if (typeof nextProcess === 'function') {
                    nextProcess();
                }
            }
        })
        .on('error', (err) => console.error(err));
}

(async function () {
    const accountId = await getCallerIdentityAccuont();
    const timestamp = moment(new Date()).format('YYYY-MM-DD');
    if (platform === terraform) {
        const config = {
            stdio: 'inherit',
            env: {
                TF_VAR_stage: stage,
                TF_VAR_accountId: accountId,
            },
            cwd: 'terraform',
        };
        if (cmd === 'plan') {
            console.log('\nRunning "terraform plan"...');
            spawnProcess(platform, [cmd], config);
        } else if (cmd === 'apply') {
            exec('git rev-parse HEAD', (err, data, strerr) => {
                const commitHash = data.trim();
                config.env['TF_VAR_git_hash'] = commitHash;
                spawnProcess(platform, [cmd], config);
            });
        }
    } else if (platform === serverless) {
        const roleName = 'YOUR_IAM_ROLE'; // You should put your iam role here if you need to assume role for deployment
        const config = {
            serverless: {
                options: [cmd],
                env: {
                    stage,
                    accountId,
                    AWS_ACCESS_KEY_ID: '',
                    AWS_SECRET_ACCESS_KEY: '',
                },
            },
        };
        if (roleName !== 'YOUR_IAM_ROLE') {
            const getRole = await iam.getRole({ RoleName: roleName }).promise();
            exec(
                `aws sts assume-role --role-arn ${getRole.Role.Arn} --role-session-name deploy-${timestamp}`,
                (err, data, strerr) => {
                    const result = JSON.parse(data);
                    const { AccessKeyId, SecretAccessKey, SessionToken } =
                        result.Credentials;
                    config.serverless.env.AWS_ACCESS_KEY_ID = AccessKeyId;
                    config.serverless.env.AWS_SECRET_ACCESS_KEY =
                        SecretAccessKey;
                    config.serverless.env['AWS_SESSION_TOKEN'] = SessionToken;
                    console.log('\nRunning "serverless deploy"...');
                    spawnProcess(platform, config[platform].options, {
                        stdio: 'inherit',
                        env: config[platform].env,
                    });
                },
            );
        } else {
            config.serverless.env.AWS_ACCESS_KEY_ID = 'DEFAULT_ACCESS_KEY';
            config.serverless.env.AWS_SECRET_ACCESS_KEY =
                'DEFAULT_SECRET_ACCESS_KEY';
            console.log('\nRunning "serverless deploy"...');
            spawnProcess(platform, config[platform].options, {
                stdio: 'inherit',
                env: config[platform].env,
            });
        }
    }
})();
