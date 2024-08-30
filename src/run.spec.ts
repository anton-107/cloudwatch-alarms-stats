import { run } from "./run";

describe("CloudWatch alarms simple stats analyzer", () => {
  it("should sort alarms by number of occurences in the last 1 month", async () => {
    await run();
  }, 60_000);
});
