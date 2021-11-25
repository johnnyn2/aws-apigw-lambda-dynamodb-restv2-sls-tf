variable "accountId" {
  description = "aws account id from environment variable"
  type = string
  default = ""
}

variable "service" {
    description = "service name"
    type = string
    default = "coffee"
}

variable "stage" {
    description = "deployment stage from environment variable"
    type        = string
    default     = "dev"
}

variable "COFFEE_INFO" {
    description = "COFFEE_INFO table name"
    type = string
    default = "COFFEE_INFO"
}

variable "git_hash" {
    description = "git commit hash"
    type = string
    default = ""
}