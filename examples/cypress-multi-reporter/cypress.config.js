const { defineConfig } = require("cypress");
const devopsPlugin =
  require("azure-devops-mocha-reporter/dist/cypress/plugin").default;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      devopsPlugin(on);
    },
  },
});
