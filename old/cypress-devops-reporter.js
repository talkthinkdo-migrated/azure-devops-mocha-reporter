"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (d, b) {
          d.__proto__ = b;
        }) ||
      function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
      };
    return function (d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var shared_1 = require("./shared");
var testplan_1 = require("./testplan");
var testplan_interface_1 = require("./testplan.interface");
var CypressDevOpsReporter = /** @class */ (function (_super) {
  __extends(CypressDevOpsReporter, _super);
  function CypressDevOpsReporter(runner, options) {
    debugger;
    var _this = _super.call(this, runner) || this;
    var reporterOptions = options.reporterOptions;
    _this.validate(reporterOptions, "pat");
    _this.validate(reporterOptions, "organization");
    _this.validate(reporterOptions, "project");
    _this.validate(reporterOptions, "planId");
    _this.validate(reporterOptions, "suiteId");
    _this.testPlan = new testplan_1.TestPlan(reporterOptions);
    runner.on("start", function () {});
    runner.on("pass", function (test) {
      // create the TestResult(s)
      var caseIds = shared_1.titleToCaseIds(test.title);
      // for each case id we need to make sure we have a test point
      for (var _i = 0, caseIds_1 = caseIds; _i < caseIds_1.length; _i++) {
        var cId = caseIds_1[_i];
        _this.testPlan.addResult(cId, testplan_interface_1.Outcome.Passed);
      }
    });
    runner.on("fail", function (test) {
      // create the TestResult(s)
      var caseIds = shared_1.titleToCaseIds(test.title);
      // for each case id we need to make sure we have a test point
      for (var _i = 0, caseIds_2 = caseIds; _i < caseIds_2.length; _i++) {
        var cId = caseIds_2[_i];
        _this.testPlan.addResult(cId, testplan_interface_1.Outcome.Failed);
      }
    });
    runner.on("end", function () {
      // finalize the TestRun
      _this.testPlan.publishResults();
    });
    return _this;
  }
  CypressDevOpsReporter.prototype.validate = function (options, name) {
    if (options == null) {
      throw new Error("Missing reporterOptions in cypress.json");
    }
    if (options[name] == null) {
      throw new Error(
        "Missing " +
          name +
          " value. Please update reporterOptions in cypress.json"
      );
    }
  };
  return CypressDevOpsReporter;
})(mocha_1.reporters.Spec);
exports.CypressDevOpsReporter = CypressDevOpsReporter;
