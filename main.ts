import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput } from "cdktf";
import * as fs from "fs";
import * as os from "os";
import { AwsProvider } from "./.gen/providers/aws/provider";
import { Instance } from "./.gen/providers/aws/instance";
import { KeyPair } from "./.gen/providers/aws/key-pair";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";

interface StackProps {
  numberOfBuckets: number
}


class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string, { numberOfBuckets }: StackProps) {
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

    const instance = new Instance(this, "compute", {
      ami: "ami-05ffe3c48a9991133",
      instanceType: "t2.micro",
      keyName: keyPair.keyName,
      tags: {
        Name: "CDKTF-Instance",
      },
    });

    new TerraformOutput(this, "public_ip", {
      value: instance.publicIp,
    });
  }
}

const app = new App();
new MyStack(app, "aws-terraform", {
  numberOfBuckets: 10, // Specify the number of buckets you want to create
});
app.synth();