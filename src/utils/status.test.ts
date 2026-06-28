import { describe, expect, it } from 'vitest';
import { conditionStatus, volumeRobustnessStatus, volumeStateStatus } from './status';

describe('volumeStateStatus', () => {
  it('maps states to severities', () => {
    expect(volumeStateStatus('attached')).toBe('success');
    expect(volumeStateStatus('Attached')).toBe('success');
    expect(volumeStateStatus('attaching')).toBe('warning');
    expect(volumeStateStatus('detached')).toBe('');
    expect(volumeStateStatus(undefined)).toBe('');
  });
});

describe('volumeRobustnessStatus', () => {
  it('maps robustness to severities', () => {
    expect(volumeRobustnessStatus('healthy')).toBe('success');
    expect(volumeRobustnessStatus('degraded')).toBe('warning');
    expect(volumeRobustnessStatus('faulted')).toBe('error');
    expect(volumeRobustnessStatus('unknown')).toBe('');
  });
});

describe('conditionStatus', () => {
  it('maps condition status to severities', () => {
    expect(conditionStatus('True')).toBe('success');
    expect(conditionStatus('False')).toBe('error');
    expect(conditionStatus('Unknown')).toBe('');
    expect(conditionStatus(undefined)).toBe('');
  });
});
