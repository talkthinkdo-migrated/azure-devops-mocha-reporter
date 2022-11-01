import { afterRunHook, beforeRunHook } from ".";

export default function (on: Cypress.PluginEvents) {
  on("before:run", async (details: Cypress.BeforeRunDetails) => {
    await beforeRunHook(details);
  });

  on("after:run", async (results: CypressCommandLine.CypressRunResult) => {
    await afterRunHook(results);
  });
}
