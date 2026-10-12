import type { Reporter, TestModule } from 'vitest/node';

/** The floor /how-its-built states. A higher count passes; only a drop below it fails the run. */
export const TEST_FLOOR = 1400;

/** Null when the count meets the floor. */
export function testFloorError(count: number): string | null {
  if (count >= TEST_FLOOR) return null;
  return `The test run collected ${count} tests, under the floor of ${TEST_FLOOR}.`;
}

/** Wired from vitest.config.ts. Not a test file, so the run does not count it. */
export default class TestFloorReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>): void {
    let count = 0;
    for (const file of testModules) count += [...file.children.allTests()].length;
    const error = testFloorError(count);
    if (error) throw new Error(error);
  }
}
