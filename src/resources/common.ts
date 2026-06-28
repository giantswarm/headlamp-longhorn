import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';

/** A standard Kubernetes-style status condition as used across Longhorn CRDs. */
export interface LonghornCondition {
  type?: string;
  status?: string;
  reason?: string;
  message?: string;
  lastProbeTime?: string;
  lastTransitionTime?: string;
}

/**
 * Base shape for a Longhorn custom resource's `jsonData`. Concrete resources
 * narrow `spec`/`status` to their own typed interfaces.
 */
export interface LonghornObjectBase<Spec, Status> extends KubeObjectInterface {
  spec?: Spec;
  status?: Status;
}
