provider "aws" {
    default_tags {
        tags = {
            "app:environment" = "${var.stage}"
            "app:project_name" = "CoffeeShop"
            "app:development_team" = "johnnyhohohohohoho@gmail.com"
            "app:git_repo" = "aws-apigw-lambda-dynamodb-restv2-sls-tf"
            "app:git_host" = "https://github.com/johnnyn2/aws-apigw-lambda-dynamodb-restv2-sls-tf"
            "app:git_commit_hash" = "${var.git_hash}"
            "business:platform" = "ALL"
        }
    }

    region = "ap-east-1"
    # assume_role {
    #     role_arn = "arn:aws:iam::${var.accountId}:role/YOUR_ROLE"
    # }
}