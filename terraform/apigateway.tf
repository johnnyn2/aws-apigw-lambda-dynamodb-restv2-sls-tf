resource "aws_api_gateway_rest_api" "coffee" {
  name          = "${var.service}-tf"
}

resource "aws_api_gateway_stage" "coffee" {
  deployment_id = aws_api_gateway_deployment.coffee.id
  rest_api_id   = aws_api_gateway_rest_api.coffee.id
  stage_name    = "${var.stage}"
}

resource "aws_api_gateway_resource" "api" {
  parent_id   = aws_api_gateway_rest_api.coffee.root_resource_id
  path_part   = "api"
  rest_api_id = aws_api_gateway_rest_api.coffee.id
}

resource "aws_api_gateway_resource" "getCoffeeByOrigin" {
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "getCoffeeByOrigin"
  rest_api_id = aws_api_gateway_rest_api.coffee.id
}

resource "aws_api_gateway_resource" "putCoffee" {
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "putCoffee"
  rest_api_id = aws_api_gateway_rest_api.coffee.id
}

resource "aws_api_gateway_integration" "getCoffeeByOrigin" {
  http_method = aws_api_gateway_method.getCoffeeByOrigin.http_method
  integration_http_method = "POST"
  uri = aws_lambda_function.getCoffeeByOrigin.invoke_arn
  resource_id = aws_api_gateway_resource.getCoffeeByOrigin.id
  rest_api_id = aws_api_gateway_rest_api.coffee.id
  type        = "AWS_PROXY"
}

resource "aws_api_gateway_method" "getCoffeeByOrigin" {
  authorization = "NONE"
  http_method   = "POST"
  request_parameters = {
    "method.request.querystring.coffeeid" = true
  }
  resource_id   = aws_api_gateway_resource.getCoffeeByOrigin.id
  rest_api_id   = aws_api_gateway_rest_api.coffee.id
}

resource "aws_api_gateway_integration" "putCoffee" {
  http_method = aws_api_gateway_method.putCoffee.http_method
  integration_http_method = "POST"
  uri = aws_lambda_function.putCoffee.invoke_arn
  resource_id = aws_api_gateway_resource.putCoffee.id
  rest_api_id = aws_api_gateway_rest_api.coffee.id
  type        = "AWS_PROXY"
}

resource "aws_api_gateway_method" "putCoffee" {
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.putCoffee.id
  http_method   = "POST"
  request_parameters = {
    "method.request.querystring.campaignId" = true
    "method.request.querystring.expiryDate" = false
  }
  resource_id   = aws_api_gateway_resource.putCoffee.id
  rest_api_id   = aws_api_gateway_rest_api.coffee.id
}

resource "aws_api_gateway_authorizer" "putCoffee" {
  name                   = "putCoffeeAuthorizer"
  rest_api_id            = aws_api_gateway_rest_api.coffee.id
  authorizer_uri         = aws_lambda_function.putCoffeeAuthorizer.invoke_arn
  type = "REQUEST"
  identity_source = "method.request.header.origin"
}

resource "aws_api_gateway_deployment" "coffee" {
  rest_api_id = aws_api_gateway_rest_api.coffee.id

  depends_on = [
    aws_api_gateway_method.getCoffeeByOrigin,
    aws_api_gateway_method.putCoffee
  ]

  triggers = {
    # NOTE: The configuration below will satisfy ordering considerations,
    #       but not pick up all future REST API changes. More advanced patterns
    #       are possible, such as using the filesha1() function against the
    #       Terraform configuration file(s) or removing the .id references to
    #       calculate a hash against whole resources. Be aware that using whole
    #       resources will show a difference after the initial implementation.
    #       It will stabilize to only change when resources change afterwards.
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.getCoffeeByOrigin.id,
      aws_api_gateway_method.getCoffeeByOrigin.id,
      aws_api_gateway_integration.getCoffeeByOrigin.id,
      aws_api_gateway_resource.putCoffee.id,
      aws_api_gateway_method.putCoffee.id,
      aws_api_gateway_integration.putCoffee.id
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_method_settings" "getCoffeeByOrigin" {
  rest_api_id = aws_api_gateway_rest_api.coffee.id
  stage_name  = aws_api_gateway_stage.coffee.stage_name
  method_path = "${aws_api_gateway_resource.getCoffeeByOrigin.path}/${aws_api_gateway_method.getCoffeeByOrigin.http_method}"

  settings {
    metrics_enabled = true
    data_trace_enabled = true
    logging_level   = "INFO"
  }
}

resource "aws_api_gateway_method_settings" "putCoffee" {
  rest_api_id = aws_api_gateway_rest_api.coffee.id
  stage_name  = aws_api_gateway_stage.coffee.stage_name
  method_path = "${aws_api_gateway_resource.putCoffee.path}/${aws_api_gateway_method.putCoffee.http_method}"

  settings {
    metrics_enabled = true
    data_trace_enabled = true
    logging_level   = "INFO"
  }
}

