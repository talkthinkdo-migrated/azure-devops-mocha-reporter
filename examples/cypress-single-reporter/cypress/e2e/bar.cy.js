describe("empty spec 2", () => {
  it("C2122, C2423 passes too", () => {
    cy.visit("https://example.cypress.io").url.toBe("");
  });
});
