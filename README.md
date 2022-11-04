# azure-devops-mocha-reporter

[![Node.js CI](https://github.com/talkthinkdo/azure-devops-mocha-reporter/actions/workflows/node.js.yml/badge.svg)](https://github.com/talkthinkdo/azure-devops-mocha-reporter/actions/workflows/node.js.yml) [![CodeQL](https://github.com/talkthinkdo/azure-devops-mocha-reporter/actions/workflows/codeql.yml/badge.svg)](https://github.com/talkthinkdo/azure-devops-mocha-reporter/actions/workflows/codeql.yml)

Performs ADO (Azure DevOps) Test Run with output from Mocha integration tests, using Test Case IDs from your tests.

Generates reports & executes Test Points.

Developed for use with Cypress.io

#### Options
| option | type | default | description |
| --- | --- | --- | --- |
| `pat` | string | undefined | Pat token from Azure Devops* | 
| `organisation` | string | undefined | ORGANISATION from Azure Devops url: https://dev.azure.com/ORGANISATION/PROJECT | 
| `project` | string | undefined | PROJECT from Azure Devops url: https://dev.azure.com/ORGANISATION/PROJECT | 
| `planId` | number | undefined | Root Azure Test Plan id - reporter will find any Test Cases in this plan and all nested Test Suites | 
| `runName` | string | undefined | name given to Azure Test Run | 

## Usage

### Cypress.io

```bash
npm i azure-devops-mocha-reporter
```

#### Cypress Options
| option | type | default | description |
| --- | --- | --- | --- |
| `shouldAttachScreenShotsToTestResults` | boolean | false | if Cypress tests create screenshots and are tagged with an Azure Test Case, attaches screenshot to Azure Test Result |

`./package.json`
```JSON
{
  "scripts": {
    "cy:run:azure-report": "cypress run --headless --reporter azure-devops-mocha-reporter --reporterOptions pat={pat},organisation={organisation},project={project},planId={planId},runName={runName},shouldAttachScreenShotsToTestResults={shouldAttachScreenShotsToTestResults} --config defaultCommandTimeout=10000"
  }
```

cypress.config.js
```JS
const { defineConfig } = require('cypress');
const devopsPlugin =
  require("azure-devops-mocha-reporter/dist/cypress/plugin").default;
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      devopsPlugin(on);
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
    "mocha": "mocha --reporter azure-devops-mocha-reporter --reporterOptions 'pat={pat},organisation={organisation},project={project},planId={planId},runName={runName}'"
  }
}
```
`your-test.spec.js`
```JS
  it("C123, C321 foo bar", () => {
    expect(true).to.equal(true);
  });
```
See the "Try it out" section for more info

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

Examples are provided in the ... `./examples` directory, allowing you to test this locally against your ADO Test Plan:
- `cd examples/cypress-single-reporter`
- `npm i`
- clone `.env-sample` and rename to `.env`
- Replace `.env` values to match your own*
- Update `test/foo.spec.js` with a matching Test Case ID from your plan
- `npm run mochaRun`



*You'll need a PAT token with enough permissions. See [Azure DevOps' docs](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows) to create one
