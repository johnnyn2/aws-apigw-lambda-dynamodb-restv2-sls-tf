# Introduction

When working in organization, permissions are always limited to developers. A popular way is to use AWS IAM role to delegate access to resources to different AWS accounts. You share resources in one account with users in a different account. By setting up cross-account access in this way, you don't have to create individual IAM users in each account. In addition, users don't have to sign out of one account and sign into another in order to access resources in different AWS accounts. This project demos how to develop a coffee shop restful api using API Gateway, Lambda, DynamoDB and deploy the api through **Terraform** (https://www.terraform.io/) and **Serverless Framework** (https://www.serverless.com/)

# Prerequisite

1. Configure your AWS profile throught aws-cli `aws configure`. Your AWS default profile should be granted permission to assume role **arn:aws:iam::${accountId}:role/${IAM_ROLE}** (this role should be attached managed policies for S3 (deployment), APIGateway (lambda execution), Lambda (lambda execution), Dynamodb (lambda execution), Cloudwatch (lambda execution) and inline policy of *iam:AttachRolePolicy* to attach the managed policies to lambda execution role). If you encountered error such as _InvalidClientTokenId: The security token included in the request is invalid._, it's probably your aws access key and secret access key of the default AWS profile is not correct.
2. You can also set environment variable **AWS_ACCESS_KEY_ID** and **AWS_SECRET_ACCESS_KEY** in terminal/command prompt instead of using your default AWS profile.
3. **ESLint** (https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). This project uses **ESLint** for code quality checking. Please install this extension in your code editor.
4. **AWS CLI** : https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
5. **Docker** (https://www.docker.com/get-started) : This project use docker to build local Dynamodb image.
6. **Terraform** : https://learn.hashicorp.com/tutorials/terraform/install-cli?in=terraform/aws-get-started
7. **Serverless** : https://www.serverless.com/framework/docs/getting-started

# Folder structure

1. `src/api/**` : Lambda function code.
2. `src/authorizer/**` : Lambda authorizer code.
3. `src/layer/**/**` : Custom node modules that are used as lambda layers. Any custom node module directory should include a **package.json** and **default export object** in `index.js`. You can create a module by `npm run create-layer-module` or remove any module by `npm run remove-layer-module`
4. `layer/nodejs/node_modules` : Generated Lambda layer which would be deployed. This folder **should not** be committed.
5. `terraform/**` : Terraform deployment directory. Run `terraform init` to initialize.
6. `test/**/**`: Lambda code test cases
7. `coverage/**` : Generated test coverage and reports. This folder **should not** be committed.

# Development

1. Clone project repository. `git clone https://github.com/johnnyn2/aws-apigw-lambda-dynamodb-restv2-sls-tf.git`
2. Locate the project. `cd aws-apigw-lambda-dynamodb-restv2-sls-tf`
3. Check out **develop** branch. `git checkout -b develop_${YOUR_NAME}`
5. Install dependencies. `npm install`
6. Start local dynamodb. `docker-compose up`
7. Create tables. `npm run create-table-local`
8. Start local development using serverless framework. `npm run dev`
9. This project use `ESLint` for code quality checking, `Prettier` for code formatting and `commitlint
` (https://github.com/conventional-changelog/commitlint) for commit message linting. Please follow the rules from **Conventional Commits 1.0.0** (https://www.conventionalcommits.org/en/v1.0.0/) to write your commit messages.
10. Git hooks - `husky` and `lint-staged`: You can only successfully commit to the repository if the commit passes code linting, commit linting and test cases checking. Error messages will be shown on the terminal/command prompt if your commit fails any checking
11. Create **merge request** targeting the **develop** branch, add "WIP" tag and assign to yourself. Link any opening issue that is going to be solved by your merge request in the merge request description section.
12. Remove the "WIP" tag and assign the merge request to any maintainer when the change is ready
13. GetCoffeeByOrigin and PutCoffee API and associated test cases are created for demos. You can add any apis further as you want.

# Testing

1. Testing framework : ``jest`` (https://jestjs.io/)
2. Testing with **DynamoDB** (https://jestjs.io/docs/dynamodb)
3. Run all tests ``npm run test``
4. Run indivdual test `npm run -- ${path_of_your_test_file}`

# Deployment

## 1. Terraform

1. Under `/terraform` directory, initialize a working directory containing Terraform configuration files. `terraform init`
2. Create Terraform speculative plan. `npm run tf-plan:${stage}`
3. If step 2 succeed, you can execute actions proposed in the Terraform plan. `npm run tf-apply:${stage}` \
   Options:
   - stage : `dev | staging | prod`

## 2. Serverless Framework

1. Under root directory, deploy the API. `npm run sls-deploy:${stage}` \
   Options:
   - stage : `dev | staging | prod`

# Remarks

1. You can use **Terraform** or **Serverless Framework** to deploy the resources. However, only Serverless Framework supports lambda development in local environment.
