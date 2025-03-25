describe("Test environment", () => {
  test("should have CONTINUE_GLOBAL_DIR env var set to .epico-pilot-test", () => {
    expect(process.env.CONTINUE_GLOBAL_DIR).toBeDefined();
    expect(process.env.CONTINUE_GLOBAL_DIR)?.toMatch(/\.epico-pilot-test$/);
  });
});
