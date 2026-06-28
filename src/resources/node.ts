import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';
import { LonghornCondition, LonghornObjectBase } from './common';
import { longhornGroup, longhornVersion } from './groupVersion';

export interface DiskSpec {
  path?: string;
  diskType?: string;
  allowScheduling?: boolean;
  tags?: string[];
}

export interface DiskStatus {
  diskName?: string;
  diskUUID?: string;
  diskPath?: string;
  diskType?: string;
  storageAvailable?: number | string;
  storageScheduled?: number | string;
  storageMaximum?: number | string;
  conditions?: LonghornCondition[];
}

export interface NodeSpec {
  allowScheduling?: boolean;
  tags?: string[];
  instanceManagerCPURequest?: number;
  disks?: { [name: string]: DiskSpec };
}

export interface NodeStatus {
  region?: string;
  zone?: string;
  autoEvicting?: boolean;
  snapshotCheckStatus?: { lastPeriodicCheckedAt?: string };
  diskStatus?: { [uuid: string]: DiskStatus };
  conditions?: LonghornCondition[];
}

export type LonghornNodeJSON = LonghornObjectBase<NodeSpec, NodeStatus>;

export const LonghornNode = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true,
  kind: 'Node',
  singularName: 'Node',
  pluralName: 'nodes',
});
