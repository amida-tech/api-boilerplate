# AWS Deployment
Deploying the API boilerplate consists of two steps: creating an Amazon Machine Image (AMI) with Packer and Ansible, and deploying that AMI to infrastructure using Terraform.

Before running any of the automated deployment steps, you should have an RDS PostgreSQL database configured.

## Packer
### Installation
On macOS:  
`brew install packer`

To compile from source:
```sh
mkdir -p $GOPATH/src/github.com/mitchellh && cd $!
git clone https://github.com/mitchellh/packer.git
cd packer
make bootstrap
make dev
```

Verify the installation:  
`packer -v`
### Build
All of these steps should be run from the project root directory.

First, it is always a good idea to validate the template:  
`packer validate template.json`

Then, run `packer build`, setting variables as appropriate:
```sh
packer build \
    -var aws_access_key=ACCESS_KEY \
    -var aws_secret_key=SECRET_KEY \
    -var rds_host=RDS_HOST \
    -var rds_password=RDS_PASSWORD \
    -var build_env=dev \
    -var ami_name=api-boilerplate \
    template.json
```

Packer will prepare your AMI, run the Ansible playbook, and save the provisioned machine as a reusable image.

## Terraform
### Installation
On macOS:  
`brew install terraform`

On other systems, download the proper package [here](https://www.terraform.io/downloads.html).

Verify the installation:  
`terraform -v`

### Run
All of these steps should be run frmo the project root directory.

First, validate your infrastructure plan (you should run this with the variables below):  
`terraform plan`

Then, run `terraform apply`, setting variables as appropriate:
```sh
terraform apply \
    -var aws_access_key=ACCESS_KEY \
    -var aws_secret_key=SECRET_KEY \
    -var instance_type=t2.medium \
    -var key_name=amida-prod-17 \
    -var security_group=api-boilerplate-security-group \
    -var rds_host=RDS_HOST \
    -var rds_password=RDS_PASSWORD \
    -var build_env=development \
    -var ami_name=api-boilerplate \
    -var asg_maximum_number_of_instances=3 \
    -var asg_minimum_number_of_instances=2 \
    -var health_check_grace_period=300 \
    -var health_check_type=ELB \
    -var load_balancer_names=api-boilerplate-lb \
    -var availability_zones="us-west-2a,us-west-2b,us-west-2c"
```

The `data` block in `main.tf` will look up the most recent AMI built with this deployment stack.