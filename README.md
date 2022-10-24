# azure-devops-mocha-reporter

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
    "mocha-junit-reporter, azure-devops-mocha-reporter",
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