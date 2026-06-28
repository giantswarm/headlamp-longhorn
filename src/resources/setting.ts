import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';
import { LonghornObjectBase } from './common';
import { longhornGroup, longhornVersion } from './groupVersion';

export interface SettingStatus {
  applied?: boolean;
}

/** A Setting carries its value at the top level of `jsonData`, not under `spec`. */
export interface LonghornSettingJSON extends LonghornObjectBase<unknown, SettingStatus> {
  value?: string | number | boolean;
}

export const LonghornSetting = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true,
  kind: 'Setting',
  singularName: 'Setting',
  pluralName: 'settings',
});
