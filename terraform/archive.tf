data "archive_file" "coffeeLayer" {
    type = "zip"
    source_dir = "../layer/"
    output_path = "zip/NodeModules.zip"
}

data "archive_file" "getCoffeeByOrigin" {
    type = "zip"
    source_file = "../src/api/getCoffeeByOrigin.js"
    output_path = "zip/getCoffeeByOrigin.zip"
}

data "archive_file" "PutCoffee" {
    type = "zip"
    source_file = "../src/api/putCoffee.js"
    output_path = "zip/PutCoffee.zip"
}

data "archive_file" "PutCoffeeAuthorizer" {
    type = "zip"
    source_file = "../src/authorizers/putCoffee.js"
    output_path = "zip/PutCoffeeAuthorizer.zip"
}
