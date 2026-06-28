/** The status kinds accepted by Headlamp's `StatusLabel` component. */
export type StatusLabelKind = 'success' | 'warning' | 'error' | '';

/** Map a Longhorn volume `status.state` to a StatusLabel severity. */
export function volumeStateStatus(state?: string): StatusLabelKind {
  switch ((state || '').toLowerCase()) {
    case 'attached':
      return 'success';
    case 'creating':
    case 'attaching':
    case 'detaching':
    case 'deleting':
      return 'warning';
    case 'detached':
      return '';
    default:
      return '';
  }
}

/** Map a Longhorn volume `status.robustness` to a StatusLabel severity. */
export function volumeRobustnessStatus(robustness?: string): StatusLabelKind {
  switch ((robustness || '').toLowerCase()) {
    case 'healthy':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'faulted':
      return 'error';
    default:
      return '';
  }
}

/**
 * Map a Kubernetes-style condition `status` ("True"/"False"/"Unknown") to a
 * StatusLabel severity, for conditions where True is the healthy state
 * (e.g. node Ready/Schedulable, disk Ready).
 */
export function conditionStatus(status?: string): StatusLabelKind {
  switch ((status || '').toLowerCase()) {
    case 'true':
      return 'success';
    case 'false':
      return 'error';
    default:
      return '';
  }
}
