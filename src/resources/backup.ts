import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';
import { LonghornObjectBase } from './common';
import { longhornGroup, longhornVersion } from './groupVersion';

export interface BackupSpec {
  labels?: { [key: string]: string };
}

export interface BackupStatus {
  state?: string;
  snapshotName?: string;
  backupTargetName?: string;
  volumeName?: string;
  size?: number | string;
  newlyUploadDataSize?: number | string;
  reUploadedDataSize?: number | string;
  snapshotCreatedAt?: string;
  backupCreatedAt?: string;
  lastSyncedAt?: string;
  compressionMethod?: string;
  volumeSize?: number | string;
  volumeCreated?: string;
  volumeBackingImageName?: string;
  progress?: number;
  replicaAddress?: string;
  labels?: { [key: string]: string };
  messages?: { [key: string]: string };
  error?: string;
}

export type LonghornBackupJSON = LonghornObjectBase<BackupSpec, BackupStatus>;

export const LonghornBackup = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true,
  kind: 'Backup',
  singularName: 'Backup',
  pluralName: 'backups',
});
