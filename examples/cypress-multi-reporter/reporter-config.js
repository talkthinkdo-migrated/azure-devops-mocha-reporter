require("dotenv").config();

module.exports = {
  reporterEnabled: "mocha-junit-reporter,azure-devops-mocha-reporter",
  mochaJunitReporterReporterOptions: {
    mochaFile: "results/cypress-and-azure-devops-[hash].xml",
    toConsole: true,
  },
  azureDevopsMochaReporterReporterOptions: {
    pat: process.env.PAT,
    organisation: process.env.ORGANISATION,
    project: process.env.PROJECT,
    planId: process.env.PLAN_ID,
    runName: process.env.RUN_NAME,
    shouldAttachScreenShotsToTestResults: true,
  },
};
