locals {
  service = "coffee"
  stage = var.stage
}

locals {
  vars = {
      COFFEE_INFO = "${var.COFFEE_INFO}"
  }
}

resource "aws_lambda_function" "getCoffeeByOrigin" {
    filename = "zip/getCoffeeByOrigin.zip"
    function_name = "${local.service}_${local.stage}_tf_getCoffeeByOrigin"
    handler = "/src/api/getCoffeeByOrigin.handler"
    runtime = "nodejs12.x"
    layers = [
        aws_lambda_layer_version.coffee_layer.arn,
    ]
    source_code_hash = "${data.archive_file.getCoffeeByOrigin.output_base64sha256}"

    role = "arn:aws:iam::${var.accountId}:role/coffee-lambda-role-${var.stage}"
    environment {
        variables = local.vars
    }
}

resource "aws_lambda_function" "putCoffee" {
    filename = "zip/PutCoffee.zip"
    function_name = "${local.service}_${local.stage}_tf_putCoffee"
    handler = "/src/api/putCoffee.handler"
    runtime = "nodejs12.x"
    layers = [
        aws_lambda_layer_version.coffee_layer.arn,
    ]
    source_code_hash = "${data.archive_file.PutCoffee.output_base64sha256}"

    role = "arn:aws:iam::${var.accountId}:role/coffee-lambda-role-${var.stage}"
    environment {
        variables = local.vars
    }
}

resource "aws_lambda_function" "putCoffeeAuthorizer" {
    filename = "zip/PutCampaignAuthorizer.zip"
    function_name = "${local.service}_${local.stage}_tf_putCoffeeAuthorizer"
    handler = "/src/authorizers/putCoffee.handler"
    runtime = "nodejs12.x"
    layers = [
        aws_lambda_layer_version.coffee_layer.arn,
    ]
    source_code_hash = "${data.archive_file.PutCoffeeAuthorizer.output_base64sha256}"

    role = "arn:aws:iam::${var.accountId}:role/coffee-lambda-role-${var.stage}"
    environment {
        variables = local.vars
    }
}

resource "aws_lambda_permission" "apigw_lambda_getCoffeeByOrigin" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.getCoffeeByOrigin.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.coffee.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_lambda_putCoffee" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.putCoffee.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.coffee.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_lambda_authorizer_putCoffee" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.putCoffeeAuthorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.coffee.execution_arn}/*/*"
}

resource "aws_lambda_layer_version" "coffee_layer" {
    filename   = "zip/NodeModules.zip"
    layer_name = "coffee-tf-layer"
    depends_on = [
      data.archive_file.coffeeLayer
    ]
    compatible_runtimes = ["nodejs12.x"]
    source_code_hash = "${data.archive_file.coffeeLayer.output_base64sha256}"
}

