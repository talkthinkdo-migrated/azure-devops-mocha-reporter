"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:max-line-length */
exports.GetTestPoints = 'https://dev.azure.com/{{organization}}/{{project}}/_apis/testplan/Plans/{{planId}}/Suites/{{suiteId}}/TestPoint?api-version=5.1-preview.2&Authorization=Bearer {{patToken}}';
exports.CreateTestRun = 'https://dev.azure.com/{{organization}}/{{project}}/_apis/test/runs?api-version=5.1&Authorization=Basic {{patToken}}';
exports.AddTestResult = 'https://dev.azure.com/{{organization}}/{{project}}/_apis/test/Runs/1000466/results?api-version=5.1&Authorization=Basic {{patToken}}';
exports.UpdateTestRun = 'https://dev.azure.com/{{organization}}/{{project}}/_apis/test/runs/1000466?api-version=5.1&Authorization=Basic {{patToken}}';