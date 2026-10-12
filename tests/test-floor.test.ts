import { describe, expect, it } from 'vitest';
import { TEST_FLOOR, testFloorError } from './test-floor-reporter';

describe('the test floor /how-its-built states', () => {
  it('fails only when the count drops below 1400', () => {
    expect(TEST_FLOOR).toBe(1400);
    expect(testFloorError(1399)).toMatch(/under the floor/);
    expect(testFloorError(1400)).toBeNull();
    expect(testFloorError(1401)).toBeNull();
  });
});
