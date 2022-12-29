variable "source_cidrs" {}
variable "key_pair_name" {}

terraform {
  required_version = ">= 1.2.0"
  backend "s3" {
    bucket  = "na2na-terraform-states"
    region  = "ap-northeast-1"
    key     = "misskey01.tfstate"
    encrypt = true
  }
}

provider "aws" {
  region = "ap-northeast-1"
}
