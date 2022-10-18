"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testplan_interface_1 = require("./testplan.interface");
var btoa = require('btoa');
var axios = require('axios');
var TestPlan = /** @class */ (function () {
    function TestPlan(options) {
        this.options = options;
        this.testResults = [];
        this.testPoints = [];
        this.prelimTestResults = [];
        this.organization = options.organization;
        this.project = options.project;
        this.suiteId = options.suiteId;
        this.planId = options.planId;
        this.runName = options.runName;
        this.http = axios.create({
            headers: { 'Authorization': "Basic " + btoa(':' + options.pat) },
            params: {
                'Authorization': "Basic " + options.pat
            }
        });
        this.baseUrl = "https://dev.azure.com/" + this.organization + "/" + this.project + "/_apis";
    }
    TestPlan.prototype.addResult = function (testCaseId, outcome) {
        this.prelimTestResults.push({
            testCaseId: testCaseId,
            outcome: outcome
        });
    };
    TestPlan.prototype.prepareTestResults = function () {
        if (!this.testPoints) {
            throw new Error('No Test Points available. Are there Test Cases in Dev Ops?');
        }
        for (var _i = 0, _a = this.testPoints; _i < _a.length; _i++) {
            var tp = _a[_i];
            for (var _b = 0, _c = this.prelimTestResults; _b < _c.length; _b++) {
                var result = _c[_b];
                if (!!tp.testCaseReference.id && result.testCaseId === tp.testCaseReference.id) {
                    this.testResults.push({
                        testPoint: {
                            id: tp.id
                        },
                        testCase: {
                            id: result.testCaseId
                        },
                        testCaseTitle: tp.testCaseReference.name,
                        testRun: {
                            id: this.testRun.id
                        },
                        testCaseRevision: 1,
                        outcome: result.outcome,
                        state: testplan_interface_1.TestRunState.Completed
                    });
                }
            }
        }
    };
    TestPlan.prototype.publishResults = function () {
        var _this = this;
        this.http.get(this.baseUrl + "/testplan/Plans/" + this.planId + "/Suites/" + this.suiteId + "/TestPoint?api-version=5.1-preview.2")
            .then(function (response) {
            _this.testPoints = response.data.value;
            return _this.createRun();
        })
            .then(function (response) {
            _this.testRun = response.data;
            _this.prepareTestResults();
            return _this.submitResults();
        })
            .then(function (response) {
            return _this.finishRun();
        })
            .then(function (response) {
            _this.testRun = response.data;
        });
    };
    TestPlan.prototype.submitResults = function () {
        if (!this.testRun) {
            throw new Error('TestRun has not been prepared yet for this TestPlan. Call prepareRun() in the runner "start".');
        }
        return this.http.post(this.baseUrl + "/test/runs/" + this.testRun.id + "/results?api-version=5.1", this.testResults);
    };
    TestPlan.prototype.finishRun = function () {
        return this.http.patch(this.baseUrl + "/test/runs/" + this.testRun.id + "?api-version=5.1", {
            state: testplan_interface_1.TestRunState.Completed
        });
    };
    TestPlan.prototype.createRun = function () {
        return this.http.post(this.baseUrl + "/test/runs?api-version=5.1", {
            automated: true,
            pointIds: [],
            state: testplan_interface_1.TestRunState.InProgress,
            name: this.runName,
            plan: {
                id: this.planId
            }
        });
    };
    return TestPlan;
}());
exports.TestPlan = TestPlan;