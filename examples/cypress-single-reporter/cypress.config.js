require("dotenv").config();

const { defineConfig } = require("cypress");
const devopsPlugin =
  require("azure-devops-mocha-reporter/dist/cypress/plugin").default;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      devopsPlugin(on);
    },
  },
  reporter: "azure-devops-mocha-reporter",
  reporterOptions: {
    pat: process.env.PAT,
    organisation: "ExploreLearning",
    project: "FearlessProgramme",
    planId: 2093,
    runName: "Cypress Automated Run",
  },
});
