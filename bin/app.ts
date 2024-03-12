#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CourseApiStack } from "../lib/app-stack";
const app = new cdk.App();
const service = "Course-Api";
let stage;

stage = "m";
new CourseApiStack(app, `${service}-${stage}`, {
  tags: { service, stage },
});
