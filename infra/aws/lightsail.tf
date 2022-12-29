# 既存の公開鍵をインポート
resource "aws_lightsail_key_pair" "na2na_key_pair" {
  name       = var.key_pair_name
  public_key = file("./id_rsa.pub")
}

# インスタンスを作成
resource "aws_lightsail_instance" "misskey01-instance" {
  name              = "misskey01-instance"
  availability_zone = "ap-northeast-1a"
  blueprint_id      = "ubuntu_20_04"
  bundle_id         = "small_2_0"
  key_pair_name     = var.key_pair_name
}

# 静的グローバルIPアドレスを割り当てる
resource "aws_lightsail_static_ip" "misskey01-instance_static_ip" {
  name = "misskey01-instance_static_ip"
}

# 静的グローバルIPアドレスのアタッチ
resource "aws_lightsail_static_ip_attachment" "attach" {
  static_ip_name = aws_lightsail_static_ip.misskey01-instance_static_ip.id
  instance_name  = aws_lightsail_instance.misskey01-instance.id
}

# misskey01-instanceインスタンスへ適用するファイアウォールルールを定義
resource "aws_lightsail_instance_public_ports" "misskey01-instance_fw" {
  instance_name = aws_lightsail_instance.misskey01-instance.name

  # SSH接続を XXX.XXX.XXX.XXX/32 からのみ許可
  port_info {
    protocol  = "tcp"
    from_port = 22
    to_port   = 22
    cidrs     = var.source_cidrs
  }
}
