import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput } from "cdktf";
import * as fs from "fs";
import * as os from "os";
import { AwsProvider } from "./.gen/providers/aws/provider";
import { Instance } from "./.gen/providers/aws/instance";
import { KeyPair } from "./.gen/providers/aws/key-pair";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { SecurityGroup } from "./.gen/providers/aws/security-group";
import { SecurityGroupRule } from "./.gen/providers/aws/security-group-rule";

interface StackProps {
  numberOfBuckets: number;
  installJenkins?: boolean;
}


class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string, { numberOfBuckets, installJenkins = false }: StackProps) {
    super(scope, name);

    const keyPath = process.env.AWS_SSH_KEY_PATH || `${os.homedir()}/.ssh/id_ed25519.pub`;
    const publicKey = fs.readFileSync(keyPath, "utf-8");

    new AwsProvider(this, "aws", {
      region: "us-east-1",
    });

    // Create S3 Buckets  
    for (let i = 0; i < numberOfBuckets; i++) {
      new S3Bucket(this, `bucket-${i}`, {
      });
    }
    const keyPair = new KeyPair(this, "keypair", {
      publicKey,
      keyName: "CDKTF-KEY",
    });

    // Create a security group for Jenkins
    const jenkinsSecurityGroup = new SecurityGroup(this, "jenkins-sg", {
      name: "jenkins-security-group",
      description: "Security group for Jenkins server",
      // Using the default VPC (no need to specify vpcId)
      tags: {
        Name: "jenkins-security-group",
      },
    });

    // Add security group rules
    new SecurityGroupRule(this, "jenkins-http", {
      securityGroupId: jenkinsSecurityGroup.id,
      type: "ingress",
      fromPort: 8080,
      toPort: 8080,
      protocol: "tcp",
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow Jenkins HTTP",
    });

    new SecurityGroupRule(this, "jenkins-ssh", {
      securityGroupId: jenkinsSecurityGroup.id,
      type: "ingress",
      fromPort: 22,
      toPort: 22,
      protocol: "tcp",
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow SSH",
    });

    new SecurityGroupRule(this, "jenkins-outbound", {
      securityGroupId: jenkinsSecurityGroup.id,
      type: "egress",
      fromPort: 0,
      toPort: 0,
      protocol: "-1",
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow all outbound traffic",
    });

    // Create Jenkins user data script with base64 encoding to ensure proper execution
    const jenkinsUserData = installJenkins ? `#!/bin/bash
# Update packages
apt-get update -y

# Install necessary packages
apt-get install -y openjdk-11-jdk wget gnupg2 apt-transport-https ca-certificates curl software-properties-common

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io.key | apt-key add -
echo "deb https://pkg.jenkins.io/debian-stable binary/" > /etc/apt/sources.list.d/jenkins.list
apt-get update -y

# Install Jenkins
apt-get install -y jenkins

# Make sure Jenkins is started
systemctl daemon-reload
systemctl start jenkins
systemctl enable jenkins
systemctl status jenkins

# Add firewall rules (if UFW is enabled)
if command -v ufw &> /dev/null; then
  ufw allow 8080
  ufw allow 22
fi

# Install Docker (optional, for Jenkins container builds)
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update -y
apt-get install -y docker-ce
usermod -aG docker jenkins
systemctl restart jenkins

# Save the initial admin password to a file
echo "Jenkins initial admin password: $(cat /var/lib/jenkins/secrets/initialAdminPassword)" > /home/ubuntu/jenkins-password.txt
chmod 644 /home/ubuntu/jenkins-password.txt

# Print status information
echo "Jenkins installation completed"
echo "Jenkins service status:"
systemctl status jenkins
` : "";

    // Create EC2 instance with Jenkins
    const instance = new Instance(this, "compute", {
      ami: "ami-0c7217cdde317cfec", // Ubuntu 22.04 LTS in us-east-1
      instanceType: "t2.medium", // Recommended at least t2.medium for Jenkins
      keyName: keyPair.keyName,
      securityGroups: [jenkinsSecurityGroup.name],
      userData: installJenkins ? jenkinsUserData : undefined,
      userDataReplaceOnChange: true,
      associatePublicIpAddress: true, // Ensure the instance gets a public IP
      tags: {
        Name: installJenkins ? "Jenkins-Server" : "CDKTF-Instance",
      },
    });

    new TerraformOutput(this, "public_ip", {
      value: instance.publicIp,
    });

    if (installJenkins) {
      new TerraformOutput(this, "jenkins_url", {
        value: `http://${instance.publicIp}:8080`,
      });
      
      new TerraformOutput(this, "jenkins_instructions", {
        value: "Wait a few minutes for Jenkins to start. Access Jenkins using the URL above. The initial admin password can be found in /var/lib/jenkins/secrets/initialAdminPassword on the server.",
      });
    }
  }
}

const app = new App();
new MyStack(app, "aws-terraform", {
  numberOfBuckets: 1, // Specify the number of buckets you want to create
  installJenkins: false, // Set to true to install Jenkins
});
app.synth();