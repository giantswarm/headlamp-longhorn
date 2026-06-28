import { StatusLabel } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import React from 'react';
import { conditionStatus, volumeRobustnessStatus, volumeStateStatus } from '../utils/status';

/** Colored label for a Longhorn volume `status.state`. */
export function VolumeStateLabel({ state }: { state?: string }) {
  return <StatusLabel status={volumeStateStatus(state)}>{state || 'Unknown'}</StatusLabel>;
}

/** Colored label for a Longhorn volume `status.robustness`. */
export function VolumeRobustnessLabel({ robustness }: { robustness?: string }) {
  return (
    <StatusLabel status={volumeRobustnessStatus(robustness)}>{robustness || 'Unknown'}</StatusLabel>
  );
}

/** Colored label for a Kubernetes-style condition status ("True"/"False"). */
export function ConditionStatusLabel({ status }: { status?: string }) {
  return <StatusLabel status={conditionStatus(status)}>{status || 'Unknown'}</StatusLabel>;
}

export type NameValueRow = { name: string; value?: React.ReactNode };

/**
 * Drop rows whose value is empty or the placeholder "-", so detail views stop
 * showing long lists of empty fields.
 */
export function nonEmptyRows(rows: NameValueRow[]): NameValueRow[] {
  return rows.filter(
    row => row.value !== undefined && row.value !== null && row.value !== '' && row.value !== '-'
  );
}
