npm install --global cdktf-cli@latest
 npm install -g npm@11.4.2
 
 npm uninstall -g cdktf-cli
 from bash shell
 
npm install -g cdktf-cli

mkdir my-cdktf-project
cd my-cdktf-project
cdktf init

Run `npm audit` for details.
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more 
comprehensive and powerful.
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported

added 326 packages, and audited 428 packages in 32s

59 packages are looking for funding
  run `npm fund` for details

1 low severity vulnerability

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
========================================================================================================

  Your CDKTF TypeScript project is ready!

  cat help                Print this message

  Compile:
    npm run get           Import/update Terraform providers and modules (you should check-in this directory)
    npm run compile       Compile typescript code to javascript (or "npm run watch")
    npm run watch         Watch for changes and compile typescript in the background
    npm run build         Compile typescript

  Synthesize:
    cdktf synth [stack]   Synthesize Terraform resources from stacks to cdktf.out/ (ready for 'terraform apply')

  Diff:
    cdktf diff [stack]    Perform a diff (terraform plan) for the given stack

  Deploy:
    cdktf deploy [stack]  Deploy the given stack

  Destroy:
    cdktf destroy [stack] Destroy the stack

  Test:
    npm run test        Runs unit tests (edit __tests__/main-test.ts to add your own tests)
    npm run test:watch  Watches the tests and reruns them on change

  Upgrades:
    npm run upgrade        Upgrade cdktf modules to latest version
    npm run upgrade:next   Upgrade cdktf modules to latest "@next" version (last commit)

 Use Providers:

  You can add prebuilt providers (if available) or locally generated ones using the add command:

  cdktf provider add "aws@~>3.0" null kreuzwerker/docker

  You can find all prebuilt providers on npm: https://www.npmjs.com/search?q=keywords:cdktf
  You can also install these providers directly through npm:

  npm install @cdktf/provider-aws
  npm install @cdktf/provider-google
  npm install @cdktf/provider-azurerm
  npm install @cdktf/provider-docker
  npm install @cdktf/provider-github
  npm install @cdktf/provider-null

  You can also build any module or provider locally. Learn more https://cdk.tf/modules-and-providers
  
  public_ip = "13.223.0.88"
  
  ssh -i ~/.ssh/id_ed25519 ec2-user@13.223.0.88
  
  
  cdktf init --template="typescript" --providers="aws@~>4.0
       
