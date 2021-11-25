output "APIGateway_URL" {
    value = aws_api_gateway_deployment.coffee.invoke_url
}

output "GetCampaign" {
    value = aws_api_gateway_resource.getCoffeeByOrigin.path
}

output "PutCampaign" {
    value = aws_api_gateway_resource.putCoffee.path
}

