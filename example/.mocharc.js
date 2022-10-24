require("dotenv").config();

module.exports = {
  reporter: "azure-devops-mocha-reporter",
  // "reporter-option": [
  //   `pat=${process.env.PAT}`,
  //   `organisation=${process.env.ORGANISATION}`,
  //   `project=${process.env.PROJECT}`,
  //   `planId=${process.env.PLAN_ID}`,
  //   `runName=${process.env.RUN_NAME}`,
  // ],
};
