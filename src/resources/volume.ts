import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';
import { LonghornCondition, LonghornObjectBase } from './common';
import { longhornGroup, longhornVersion } from './groupVersion';

export interface VolumeSpec {
  size?: string;
  dataEngine?: string;
  frontend?: string;
  numberOfReplicas?: number;
  dataLocality?: string;
  accessMode?: string;
  backingImage?: string;
  staleReplicaTimeout?: number;
  encrypted?: boolean;
  image?: string;
  fromBackup?: string;
  diskSelector?: string[];
  nodeSelector?: string[];
  revisionCounterDisabled?: boolean;
  replicaAutoBalance?: string;
  unmapMarkSnapChainRemoved?: string;
  snapshotDataIntegrity?: string;
  freezeFilesystemForSnapshot?: string;
  backupTargetName?: string;
  backupCompressionMethod?: string;
}

export interface VolumeWorkloadStatus {
  podName?: string;
  podStatus?: string;
  workloadName?: string;
  workloadType?: string;
}

export interface VolumeKubernetesStatus {
  namespace?: string;
  pvcName?: string;
  pvName?: string;
  pvStatus?: string;
  lastPVCRefAt?: string;
  lastPodRefAt?: string;
  workloadsStatus?: VolumeWorkloadStatus[];
}

export interface VolumeStatus {
  state?: string;
  robustness?: string;
  currentNodeID?: string;
  actualSize?: number | string;
  frontendDisabled?: boolean;
  isStandby?: boolean;
  shareEndpoint?: string;
  shareState?: string;
  lastBackup?: string;
  lastBackupAt?: string;
  expansionRequired?: boolean;
  restoreRequired?: boolean;
  restoreInitiated?: boolean;
  kubernetesStatus?: VolumeKubernetesStatus;
  conditions?: LonghornCondition[];
}

export type LonghornVolumeJSON = LonghornObjectBase<VolumeSpec, VolumeStatus>;

export const LonghornVolume = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true,
  kind: 'Volume',
  singularName: 'Volume',
  pluralName: 'volumes',
});
