import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';
import { LonghornCondition, LonghornObjectBase } from './common';
import { longhornGroup, longhornVersion } from './groupVersion';

export interface EngineImageSpec {
  image?: string;
}

export interface EngineImageStatus {
  state?: string;
  refCount?: number;
  buildDate?: string;
  incompatible?: boolean;
  version?: string;
  gitCommit?: string;
  cliAPIVersion?: number | string;
  cliAPIMinVersion?: number | string;
  controllerAPIVersion?: number | string;
  controllerAPIMinVersion?: number | string;
  dataFormatVersion?: number | string;
  dataFormatMinVersion?: number | string;
  noRefSince?: string;
  nodeDeploymentMap?: { [node: string]: boolean };
  conditions?: LonghornCondition[];
}

export type LonghornEngineImageJSON = LonghornObjectBase<EngineImageSpec, EngineImageStatus>;

export const LonghornEngineImage = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true,
  kind: 'EngineImage',
  singularName: 'EngineImage',
  pluralName: 'engineimages',
});
