#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";

export async function createPipelineFile(answers) {
  const bitbucketFilePath = path.join(process.cwd(), "bitbucket-pipelines.yml");
  const gitlabFilePath = path.join(process.cwd(), ".gitlab-ci.yml");

  let pipelineConfigContent;

  if (answers.pipelineConfig) {
    switch (answers.versionControl) {
      case "gitlab":
        pipelineConfigContent = `stages:
  - test-build

test:
  image: cypress/browsers:node-20.9.0-chrome-118.0.5993.88-1-ff-118.0.2-edge-118.0.2088.46-1
  stage: test-build
  script:
    # install dependencies
    - npm i
    - npx cypress run
    `;
        await fs.writeFile(gitlabFilePath, pipelineConfigContent);
        break;
      case "bitbucket":
        pipelineConfigContent = `image: cypress/browsers:node-20.9.0-chrome-118.0.5993.88-1-ff-118.0.2-edge-118.0.2088.46-1

pipelines:
  default:
    - step:
        name: "Install and Run Test, Upload Result"
        script:
          # install dependencies
          - npm i
          # run cypress
          - npx cypress run
    `;
        await fs.writeFile(bitbucketFilePath, pipelineConfigContent);
        break;
      case "github":
        pipelineConfigContent = `name: Run Cypress Test

on: [push]

jobs:
    cypress-runner:
        runs-on: ubuntu-latest

        steps:
        - name: Intialize NPM
          uses: actions/checkout@v4

        - name: Run Cypress
          uses: cypress-io/github-action@v6

    `;
        const githubDir = path.join(process.cwd(), ".github", "workflows");
        await fs.ensureDir(githubDir);
        const githubFilePath = path.join(githubDir, "runner.yml");
        await fs.writeFile(githubFilePath, pipelineConfigContent);
    }
  }
 if (answers.versionControl === undefined){
  console.log(` `);
 }else{
  console.log(`Pipeline config for ${answers.versionControl} has been created successfully.`);
 }
}
