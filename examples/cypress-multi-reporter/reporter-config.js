require("dotenv").config();

module.exports = {
  reporterEnabled: "mocha-junit-reporter,azure-devops-mocha-reporter",
  mochaJunitReporterReporterOptions: {
    mochaFile: "results/cypress-and-azure-devops-[hash].xml",
    toConsole: true,
  },
  azureDevopsMochaReporterReporterOptions: {
    pat: process.env.PAT,
    organisation: "ExploreLearning",
    project: "FearlessProgramme",
    planId: 2093,
    runName: "Cypress Automated Run",
  },
};
