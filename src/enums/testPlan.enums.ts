export enum Outcome {
  Unspecified = "Unspecified",
  None = "None",
  Passed = "Passed",
  Failed = "Failed",
  Inconclusive = "Inconclusive",
  Timeout = "Timeout",
  Aborted = "Aborted",
  Blocked = "Blocked",
  NotExecuted = "NotExecuted",
  Warning = "Warning",
  Error = "Error",
  NotApplicable = "NotApplicable",
  Paused = "Paused",
  InProgress = "InProgress",
  NotImpacted = "NotImpacted",
}

export enum TestRunState {
  Unspecified = "Unspecified",
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Completed = "Completed",
  Aborted = "Aborted",
  Waiting = "Waiting",
  NeedsInvestigation = "NeedsInvestigation",
}
