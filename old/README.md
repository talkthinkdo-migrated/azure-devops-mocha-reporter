# Dev Ops Test Reporter

A custom test reporter for Cypress derived from [cypress-testrail-reporter](https://github.com/nartc/cypress-testrail-reporter)
 that publishes test results using Azure Dev Ops [Test Management API](https://docs.microsoft.com/en-us/rest/api/azure/devops/test/?view=azure-devops-rest-5.1).
 
### Installation

`npm install cypress-devops-reporter`

### Usage

Add `cypress-devops-reporter` along with reporter configuration in the `cypress.json`:

```json5
{
    "reporter": "cypress-devops-reporter",
      "reporterOptions": {
        "pat": "{Dev Ops PAT with API permissions}",
        "organization": "{Organization Name}",
        "project": "{Project Name}",
        "planId": {TestPlanId},
        "suiteId": {TestSuiteId},
        "runName": "{The Test Run name that should be assigned for Runs created by this reporter}"
      }
}
```

Your Cypress tests should include the ID of your TestRail test case. Make sure your test case IDs are distinct from your test titles:

```Javascript
// Good:
it("C123 C124 Can authenticate a valid user", ...
it("Can authenticate a valid user C321", ...

// Bad:
it("C123Can authenticate a valid user", ...
it("Can authenticate a valid userC123", ...
```

### Reporter Options

The organization name, project name, test plan id, and test suite id can all be found as
part of the URL when viewing the Test Suite:

`https://dev.azure.com/{OrganizationName}/{ProjectName}/_testPlans/define?planId={TestPlanId}&suiteId={TestSuiteId}`

**pat**: Personal Access Token with permission to manage Test Runs

### Acknowledgements

- [Chau Tran](https://github.com/nartc), owner of the [cypress-testrail-reporter](https://github.com/nartc/cypress-testrail-reporter)
repository that was inspiration for this test reporter.
 