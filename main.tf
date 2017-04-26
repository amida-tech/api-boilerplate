provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "${var.aws_region}"
}

data "aws_ami" "api" {
  most_recent = true

  filter {
    name   = "name"
    values = ["api-boilerplate-${var.build_env}*"]
  }

  owners = ["844297601570"]
}

resource "aws_launch_configuration" "launch_config" {
  image_id        = "${data.aws_ami.api.id}"
  instance_type   = "${var.instance_type}"
  key_name        = "${var.key_name}"
  security_groups = ["${aws_security_group.api_sg.id}"]

  root_block_device {
    delete_on_termination = true
    volume_type           = "gp2"
    volume_size           = 64
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_security_group" "api_sg" {
  name        = "api-boilerplate-security-group"
  description = "SG for API boilerplate deployment"

  ingress {
    from_port   = 0
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 0
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 0
    to_port     = 81
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 0
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "tcp"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_autoscaling_group" "main_asg" {
  # interpolate the LC into the ASG name so it always forces an update
  name = "api-${var.build_env}-asg-${data.aws_ami.api.id}"

  # We want this to explicitly depend on the launch config above
  depends_on = ["aws_launch_configuration.launch_config"]

  # The chosen availability zones *must* match the AZs the VPC subnets are tied to.
  availability_zones = ["${split(",", var.availability_zones)}"]

  # Uses the ID from the launch config created above
  launch_configuration = "${aws_launch_configuration.launch_config.id}"

  max_size = "${var.asg_maximum_number_of_instances}"
  min_size = "${var.asg_minimum_number_of_instances}"

  health_check_grace_period = "${var.health_check_grace_period}"
  health_check_type         = "${var.health_check_type}"

  load_balancers = ["${aws_elb.api_lb.name}"]

  wait_for_elb_capacity = "${var.asg_minimum_number_of_instances}"

  tag {
    key                 = "environment"
    value               = "${var.build_env}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Name"
    value               = "api-${var.build_env}"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_elb" "api_lb" {
  name               = "api-boilerplate-lb"
  availability_zones = ["us-west-2a", "us-west-2b", "us-west-2c"]
  security_groups    = ["${aws_security_group.api_sg.id}"]

  listener {
    instance_port     = 80
    instance_protocol = "http"
    lb_port           = 80
    lb_protocol       = "http"
  }

  # listener {
  #   instance_port      = 81
  #   instance_protocol  = "http"
  #   lb_port            = 443
  #   lb_protocol        = "https"
  #   ssl_certificate_id = "arn:aws:iam::123456789012:server-certificate/certName"
  # }

  health_check {
    healthy_threshold   = 4
    unhealthy_threshold = 2
    timeout             = 10
    target              = "HTTP:80/api/health-check"
    interval            = 15
  }

  cross_zone_load_balancing = true
  idle_timeout              = 60
}

resource "aws_autoscaling_policy" "scale_up" {
  name                   = "${aws_autoscaling_group.main_asg.name}-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = "${aws_autoscaling_group.main_asg.name}"
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${aws_autoscaling_group.main_asg.name}-cpu-high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"

  dimensions {
    AutoScalingGroupName = "${aws_autoscaling_group.main_asg.name}"
  }

  alarm_description = "This metric monitors high ec2 cpu utilization"
  alarm_actions     = ["${aws_autoscaling_policy.scale_up.arn}"]
}

resource "aws_autoscaling_policy" "scale_down" {
  name                   = "${aws_autoscaling_group.main_asg.name}-scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = "${aws_autoscaling_group.main_asg.name}"
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name          = "${aws_autoscaling_group.main_asg.name}-cpu-low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "25"

  dimensions {
    AutoScalingGroupName = "${aws_autoscaling_group.main_asg.name}"
  }

  alarm_description = "This metric monitors low ec2 cpu utilization"
  alarm_actions     = ["${aws_autoscaling_policy.scale_down.arn}"]
}

variable "aws_region" {
  default = "us-west-2"
}

variable "instance_type" {}

variable "aws_access_key" {}

variable "aws_secret_key" {}

variable "key_name" {
  description = "The SSH public key name (in EC2 key-pairs) to be injected into instances"
}

variable "asg_maximum_number_of_instances" {
  description = "The maximum number of instances the ASG should maintain"
}

variable "asg_minimum_number_of_instances" {
  description = "The minimum number of instances the ASG should maintain"
}

variable "health_check_grace_period" {
  description = "Number of seconds for a health check to time out"
}

variable "health_check_type" {
  description = "The health check used by the ASG to determine health"
}

variable "availability_zones" {
  description = "A comma seperated list string of AZs the ASG will be associated with"
}

variable "build_env" {}
