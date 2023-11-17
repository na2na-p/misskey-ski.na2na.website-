group "default" {
    targets = ["web"]
}

target "web" {
    dockerfile = "Dockerfile"
    platforms = ["linux/amd64", "linux/arm64"]
    tags = ["na2na/misskey-na2na:release"]
    cache-to = ["type=local,dest=/tmp/.buildx-cache"]
    cache-from = ["type=local,src=/tmp/.buildx-cache"]
}
