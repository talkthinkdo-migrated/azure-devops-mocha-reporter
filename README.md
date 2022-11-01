# azure-devops-mocha-reporter

[![Node.js CI](https://github.com/talkthinkdo/azure-devops-mocha-reporter/actions/workflows/node.js.yml/badge.svg)](https://github.com/talkthinkdo/azure-devops-mocha-reporter/actions/workflows/node.js.yml) [![CodeQL](https://github.com/talkthinkdo/azure-devops-mocha-reporter/actions/workflows/codeql.yml/badge.svg)](https://github.com/talkthinkdo/azure-devops-mocha-reporter/actions/workflows/codeql.yml)

Performs ADO (Azure DevOps) Test Run with output from Mocha integration tests, using Test Case IDs from your tests.

Generates reports & executes Test Points.

Developed for use with Cypress.io

## Usage

### Cypress.io

```bash
npm i azure-devops-mocha-reporter cypress-multi-reporters cypress
```

`./package.json`
```JSON
{
  "scripts": {
    "cy:run:azure-report": "cypress run --headless --reporter cypress-multi-reporters --reporter-options configFile=cypress-reporter-config.js --config defaultCommandTimeout=10000"
  }
}
```
`./cypress-reporter-config.js`
```JS
module.exports = {
  reporterEnabled:
    "mocha-junit-reporter",
  mochaJunitReporterReporterOptions: {
    mochaFile: "results/cypress-and-azure-devops-[hash].xml",
    toConsole: true,
  },
  azureDevopsMochaReporterReporterOptions: {
    pat: "YOUR_ADO_PAT",
    organization: "YOUR_ADO_ORG",
    project: "YOUR_ADO_PROJECT",
    planId: YOUR_ADO_TEST_PLAN_ID,
    runName: "A CUSTOM RUN NAME",
  },
};
```

cypress.config.js
```JS
const { defineConfig } = require('cypress');
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require("azure-devops-mocha-reporter/dist/cypress/plugin").default(on);
    },
    ... // other props
  },
});
```

or if you have custom code in setupNodeEvents:
```JS

const { defineConfig } = require('cypress');
const { beforeRunHook, afterRunHook } = require('azure-devops-mocha-reporter/dist/cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('before:run', async (details) => {
        console.log('override before:run');
        await beforeRunHook(details);
      });

      on('after:run', async (results) => {
        console.log('override after:run');
        await afterRunHook(results);
      });
    },
    ... //other props
  },
});
```

`your-test.spec.js`
```JS
it('C123, C321 url should include /users/1.edit', () => {
  cy.url().should('include', '/users/1/edit')
})
```

### Mocha
```bash
npm i azure-devops-mocha-reporter
```

`package.json`
```JSON
{
  "scripts": {
    "mocha": "mocha --reporter azure-devops-mocha-reporter --reporterOptions 'pat=YOUR_ADO_PAT,organisation=YOUR_ADO_ORG,project=YOUR_ADO_PROJECT,planId=YOUR_ADO_TEST_PLAN_ID,runName=A CUSTOM RUN NAME'"
  }
}
```
`your-test.spec.js`
```JS
  it("C123, C321 foo bar", () => {
    expect(true).to.equal(true);
  });
```

## Explanation

- Gets all Test Suites from provided Test Plan ID 
- Gets all Test Points from all Test Suites
- Filters Test Points by Test Case IDs provided in JS tests
- Creates Azure DevOps Test Run, passing/failing matching Test Points

## Test Case tag examples
- `C123`
- `TC123`
- `C123,C456`
- `C123 C456`

## Try it out

An example is provided in the ... `./example` directory, allowing you to test this locally against your ADO Test Plan:
- `cd example`
- `npm i`
- clone `.env-sample` and rename to `.env`
- Replace `.env` values to match your own*
- Update `test/foo.spec.js` with a matching Test Case ID from your plan
- `npm run mochaRun`



*You'll need a PAT token with enough permissions. See [Azure DevOps' docs](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows) to create one
