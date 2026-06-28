import {
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import React from 'react';
import { useParams } from 'react-router-dom';
import { LonghornBackup, LonghornBackupJSON } from '../resources/backup';
import { humanizeBytes } from '../utils/bytes';
import { nonEmptyRows } from './common';

function backupData(item: KubeObject): LonghornBackupJSON {
  return (item.jsonData || {}) as LonghornBackupJSON;
}

export function BackupList() {
  return (
    <ResourceListView
      title="Longhorn Backups"
      resourceClass={LonghornBackup}
      columns={[
        'name',
        {
          id: 'snapshotName',
          label: 'Snapshot Name',
          getValue: (backup: KubeObject) => backupData(backup).status?.snapshotName || '',
        },
        {
          id: 'snapshotSize',
          label: 'Snapshot Size',
          getValue: (backup: KubeObject) => Number(backupData(backup).status?.size) || 0,
          render: (backup: KubeObject) => humanizeBytes(backupData(backup).status?.size),
        },
        {
          id: 'backupTarget',
          label: 'Backup Target',
          getValue: (backup: KubeObject) => backupData(backup).status?.backupTargetName || '',
        },
        {
          id: 'state',
          label: 'State',
          getValue: (backup: KubeObject) => backupData(backup).status?.state || '',
        },
        'namespace',
        'age',
      ]}
    />
  );
}

export function BackupDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornBackup.useGet(name, namespace);

  if (error) {
    return <div>Error loading backup: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading backup details..." />;
  }

  const data = (item.jsonData || {}) as LonghornBackupJSON;
  const spec = data.spec || {};
  const status = data.status || {};
  const metadata = data.metadata || {};

  return (
    <>
      <MainInfoSection
        resource={item}
        title={`Backup: ${metadata.name}`}
        extraInfo={[
          { name: 'State', value: status.state || '-' },
          { name: 'Snapshot Name', value: status.snapshotName || '-' },
          { name: 'Backup Target', value: status.backupTargetName || '-' },
          { name: 'Volume Name', value: status.volumeName || '-' },
        ]}
      />
      <SectionBox title="Details">
        <NameValueTable
          rows={nonEmptyRows([
            { name: 'Size', value: humanizeBytes(status.size) },
            { name: 'Newly Uploaded Data', value: humanizeBytes(status.newlyUploadDataSize) },
            { name: 'Re-Uploaded Data', value: humanizeBytes(status.reUploadedDataSize) },
            { name: 'Snapshot Created At', value: status.snapshotCreatedAt || '-' },
            { name: 'Backup Created At', value: status.backupCreatedAt || '-' },
            { name: 'Last Synced At', value: status.lastSyncedAt || '-' },
            { name: 'Compression Method', value: status.compressionMethod || '-' },
            { name: 'Volume Size', value: humanizeBytes(status.volumeSize) },
            { name: 'Volume Created At', value: status.volumeCreated || '-' },
            { name: 'Volume Backing Image', value: status.volumeBackingImageName || '-' },
            { name: 'Progress', value: `${status.progress || 0}%` },
            { name: 'Replica Address', value: status.replicaAddress || '-' },
          ])}
        />
      </SectionBox>
      {spec.labels && (
        <SectionBox title="Spec Labels">
          <NameValueTable
            rows={Object.entries(spec.labels).map(([k, v]) => ({ name: k, value: v }))}
          />
        </SectionBox>
      )}
      {status.labels && (
        <SectionBox title="Status Labels">
          <NameValueTable
            rows={Object.entries(status.labels).map(([k, v]) => ({ name: k, value: v }))}
          />
        </SectionBox>
      )}
      {status.error && (
        <SectionBox title="Error">
          <pre>{status.error}</pre>
        </SectionBox>
      )}
      {status.messages && (
        <SectionBox title="Messages">
          <NameValueTable
            rows={Object.entries(status.messages).map(([k, v]) => ({ name: k, value: v }))}
          />
        </SectionBox>
      )}
    </>
  );
}
