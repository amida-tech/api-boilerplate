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
  security_groups = ["${var.security_group}"]
  name            = "api-${var.build_env}-${data.aws_ami.api.id}"

  root_block_device {
    delete_on_termination = true
    volume_type           = "gp2"
    volume_size           = 64
  }

  lifecycle {
    create_before_destroy = true
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

  load_balancers = ["${split(",", var.load_balancer_names)}"]

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

variable "security_group" {
  description = "ID of SG the launched instance will use"
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

variable "load_balancer_names" {
  description = "A comma seperated list string of ELB names the ASG should associate instances with"
}

variable "availability_zones" {
  description = "A comma seperated list string of AZs the ASG will be associated with"
}

variable "build_env" {}
