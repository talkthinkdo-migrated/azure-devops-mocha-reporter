"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TestRunState;
(function (TestRunState) {
    TestRunState["Unspecified"] = "Unspecified";
    TestRunState["NotStarted"] = "NotStarted";
    TestRunState["InProgress"] = "InProgress";
    TestRunState["Completed"] = "Completed";
    TestRunState["Aborted"] = "Aborted";
    TestRunState["Waiting"] = "Waiting";
    TestRunState["NeedsInvestigation"] = "NeedsInvestigation";
})(TestRunState = exports.TestRunState || (exports.TestRunState = {}));
var Outcome;
(function (Outcome) {
    Outcome["Unspecified"] = "Unspecified";
    Outcome["None"] = "None";
    Outcome["Passed"] = "Passed";
    Outcome["Failed"] = "Failed";
    Outcome["Inconclusive"] = "Inconclusive";
    Outcome["Timeout"] = "Timeout";
    Outcome["Aborted"] = "Aborted";
    Outcome["Blocked"] = "Blocked";
    Outcome["NotExecuted"] = "NotExecuted";
    Outcome["Warning"] = "Warning";
    Outcome["Error"] = "Error";
    Outcome["NotApplicable"] = "NotApplicable";
    Outcome["Paused"] = "Paused";
    Outcome["InProgress"] = "InProgress";
    Outcome["NotImpacted"] = "NotImpacted";
})(Outcome = exports.Outcome || (exports.Outcome = {}));