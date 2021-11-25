output "APIGateway_URL" {
    value = aws_api_gateway_deployment.coffee.invoke_url
}

output "GetCoffeeByOrigin" {
    value = aws_api_gateway_resource.getCoffeeByOrigin.path
}

output "PutCoffee" {
    value = aws_api_gateway_resource.putCoffee.path
}

