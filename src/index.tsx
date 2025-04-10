import {
  registerRoute,
  registerSidebarEntry,
  // Plugin, // Uncomment if you need Plugin class features
} from '@kinvolk/headlamp-plugin/lib';
import {
  ConditionsTable,
  Link,
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
  StatusLabel,
  Table,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

// Define functions that return the Longhorn Resource Classes
const longhornGroup = 'longhorn.io';
const longhornVersion = 'v1beta2'; // Using v1beta2 as defined in CRDs

const LonghornVolume = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true,
  singularName: 'Volume',
  pluralName: 'volumes',
});

const LonghornNode = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true, // Assuming Nodes are namespaced based on CRD, adjust if cluster-scoped
  singularName: 'Node',
  pluralName: 'nodes',
});

const LonghornSetting = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true, // Settings CRD scope is Namespaced
  singularName: 'Setting',
  pluralName: 'settings',
});

const LonghornBackup = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true,
  singularName: 'Backup',
  pluralName: 'backups',
});

const LonghornEngineImage = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true, // EngineImage CRD scope is Namespaced
  singularName: 'EngineImage',
  pluralName: 'engineimages',
});

// Define Detail View Wrapper Components
function VolumeDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornVolume.useGet(name, namespace);

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading volume: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  // Restore original rendering
  const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};
  const { kubernetesStatus = {} } = status;

  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore Title prop works but might show TS error depending on Headlamp version
        title={`Volume: ${metadata.name}`}
        extraInfo={[
          { name: 'State', value: status.state || '-' },
          { name: 'Robustness', value: status.robustness || '-' },
          {
            name: 'Node',
            value: status.currentNodeID ? (
              <Link
                routeName="node"
                params={{
                  name: status.currentNodeID,
                  namespace: namespace,
                }}
              >
                {status.currentNodeID}
              </Link>
            ) : (
              '-'
            ),
          },
          { name: 'Size', value: spec.size || '-' },
        ]}
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Status Details">
        <NameValueTable
          rows={[
            { name: 'Actual Size', value: status.actualSize || '-' },
            { name: 'Frontend Disabled', value: String(status.frontendDisabled) },
            { name: 'Is Standby', value: String(status.isStandby) },
            { name: 'Share Endpoint', value: status.shareEndpoint || '-' },
            { name: 'Share State', value: status.shareState || '-' },
            { name: 'Last Backup', value: status.lastBackup || '-' },
            { name: 'Last Backup At', value: status.lastBackupAt || '-' },
            { name: 'Expansion Required', value: String(status.expansionRequired) },
            { name: 'Restore Required', value: String(status.restoreRequired) },
            { name: 'Restore Initiated', value: String(status.restoreInitiated) },
          ]}
        />
      </SectionBox>
      <SectionBox title="Configuration">
        <NameValueTable
          rows={[
            { name: 'Data Engine', value: spec.dataEngine || '-' },
            { name: 'Frontend', value: spec.frontend || '-' },
            { name: 'Number of Replicas', value: spec.numberOfReplicas || '-' },
            { name: 'Data Locality', value: spec.dataLocality || '-' },
            { name: 'Access Mode', value: spec.accessMode || '-' },
            { name: 'Backing Image', value: spec.backingImage || '-' },
            { name: 'Stale Replica Timeout', value: spec.staleReplicaTimeout || '-' },
            { name: 'Encrypted', value: String(spec.encrypted) },
            { name: 'Engine Image', value: spec.image || '-' }, // Engine image used
            { name: 'From Backup', value: spec.fromBackup || '-' },
            { name: 'Disk Selector', value: spec.diskSelector?.join(', ') || '-' },
            { name: 'Node Selector', value: spec.nodeSelector?.join(', ') || '-' },
            { name: 'Disable Revision Counter', value: String(spec.revisionCounterDisabled) },
            { name: 'Replica Auto Balance', value: spec.replicaAutoBalance || '-' },
            { name: 'Unmap Mark SnapChain Removed', value: spec.unmapMarkSnapChainRemoved || '-' },
            { name: 'Snapshot Data Integrity', value: spec.snapshotDataIntegrity || '-' },
            {
              name: 'Freeze Filesystem For Snapshot',
              value: spec.freezeFilesystemForSnapshot || '-',
            },
            { name: 'Backup Target', value: spec.backupTargetName || '-' },
            { name: 'Backup Compression Method', value: spec.backupCompressionMethod || '-' },
          ]}
        />
      </SectionBox>
      <SectionBox title="Kubernetes Status">
        <NameValueTable
          rows={[
            { name: 'Namespace', value: kubernetesStatus.namespace || '-' },
            { name: 'PVC Name', value: kubernetesStatus.pvcName || '-' },
            { name: 'PV Name', value: kubernetesStatus.pvName || '-' },
            { name: 'PV Status', value: kubernetesStatus.pvStatus || '-' },
            { name: 'Last PVCRef At', value: kubernetesStatus.lastPVCRefAt || '-' },
            { name: 'Last PodRef At', value: kubernetesStatus.lastPodRefAt || '-' },
            // TODO: Consider rendering workloadsStatus as a small table if needed
          ]}
        />
      </SectionBox>
      <SectionBox title="Conditions">
        <ConditionsTable resource={item.jsonData} />
      </SectionBox>
      {/* TODO: Add sections for Replicas, Snapshots, etc. linking to respective views if applicable */}
    </>
  );
}

// Define interfaces for Disk Spec and Status (simplified)
interface DiskSpec {
  path?: string;
  diskType?: string;
  allowScheduling?: boolean;
  tags?: string[];
  // Add other spec fields if needed
}

interface DiskStatus {
  diskName?: string;
  diskUUID?: string;
  diskPath?: string;
  diskType?: string;
  storageAvailable?: number | string;
  storageScheduled?: number | string;
  storageMaximum?: number | string;
  conditions?: any[];
  // Add other status fields if needed
}

// Define the Disk Table Component
function NodeDiskTable({ specDisks, statusDisks }: { specDisks: any; statusDisks: any }) {
  const disksData = React.useMemo(() => {
    if (!statusDisks) return [];

    // Create a map from spec disk name to spec for easier lookup
    const specMapByName: { [key: string]: DiskSpec } = {};
    for (const [name, spec] of Object.entries(specDisks || {}) as [string, DiskSpec][]) {
      specMapByName[name] = spec;
    }

    // Combine status and spec based on status.diskName matching the spec key
    return (Object.entries(statusDisks) as [string, DiskStatus][]).map(([uuid, status]) => {
      const matchingSpec: DiskSpec = (status.diskName && specMapByName[status.diskName]) || {};
      // Use status.diskUUID if available, otherwise fallback to the key from the map
      const actualUuid = status.diskUUID || uuid;
      return { uuid: actualUuid, spec: matchingSpec, status };
    });
  }, [specDisks, statusDisks]);

  return (
    <Table
      data={disksData}
      columns={[
        // Use status.diskName as the primary identifier
        {
          header: 'Name',
          accessorFn: (item: { status: DiskStatus }) => item.status?.diskName || '-',
        },
        { header: 'UUID', accessorKey: 'uuid' },
        {
          header: 'Path',
          accessorFn: (item: { status: DiskStatus; spec: DiskSpec }) =>
            item.status?.diskPath || item.spec?.path || '-',
        },
        {
          header: 'Type',
          accessorFn: (item: { status: DiskStatus; spec: DiskSpec }) =>
            item.status?.diskType || item.spec?.diskType || '-',
        },
        {
          header: 'Allow Scheduling',
          accessorFn: (item: { spec: DiskSpec }) => String(item.spec?.allowScheduling ?? '-'),
        },
        {
          header: 'Storage Available',
          // Display raw bytes for now
          accessorFn: (item: { status: DiskStatus }) => item.status?.storageAvailable || '-',
        },
        {
          header: 'Storage Scheduled',
          // Display raw bytes for now
          accessorFn: (item: { status: DiskStatus }) => item.status?.storageScheduled || '-',
        },
        {
          header: 'Storage Maximum',
          // Display raw bytes for now
          accessorFn: (item: { status: DiskStatus }) => item.status?.storageMaximum || '-',
        },
        {
          header: 'Tags',
          accessorFn: (item: { spec: DiskSpec }) => item.spec?.tags?.join(', ') || '-',
        },
        {
          header: 'Status',
          accessorFn: (item: { status: DiskStatus }) => {
            const readyCondition = item.status?.conditions?.find(c => c.type === 'Ready');
            return (
              <StatusLabel status={readyCondition?.status === 'True' ? 'success' : 'error'}>
                {readyCondition?.status || 'Unknown'}
              </StatusLabel>
            );
          },
        },
      ]}
    />
  );
}

function NodeDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornNode.useGet(name, namespace);

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading node: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};
  const conditions = status.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  const schedulableCondition = conditions.find((c: any) => c.type === 'Schedulable');

  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore
        title={`Node: ${metadata.name}`}
        extraInfo={[
          {
            name: 'Ready',
            value: (
              <StatusLabel status={readyCondition?.status === 'True' ? 'success' : 'error'}>
                {readyCondition?.status || 'Unknown'}
              </StatusLabel>
            ),
          },
          {
            name: 'Schedulable',
            value: (
              <StatusLabel status={schedulableCondition?.status === 'True' ? 'success' : 'error'}>
                {schedulableCondition?.status || 'Unknown'}
              </StatusLabel>
            ),
          },
          { name: 'Allow Scheduling', value: String(spec.allowScheduling ?? '-') },
          { name: 'Region', value: status.region || '-' },
          { name: 'Zone', value: status.zone || '-' },
        ]}
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Configuration">
        <NameValueTable
          rows={[
            { name: 'Tags', value: spec.tags?.join(', ') || '-' },
            { name: 'Instance Manager CPU Request', value: spec.instanceManagerCPURequest || '-' },
            // TODO: Render disks in a better way, maybe a table?
            { name: 'Disks', value: Object.keys(spec.disks || {}).join(', ') || '-' },
          ]}
        />
      </SectionBox>
      <SectionBox title="Status Details">
        <NameValueTable
          rows={[
            { name: 'Auto Evicting', value: String(status.autoEvicting) },
            {
              name: 'Last Periodic Snapshot Check',
              value: status.snapshotCheckStatus?.lastPeriodicCheckedAt || '-',
            },
            // TODO: Render diskStatus in a better way, maybe a table?
            { name: 'Disk Status', value: Object.keys(status.diskStatus || {}).join(', ') || '-' },
          ]}
        />
      </SectionBox>
      <SectionBox title="Disks">
        <NodeDiskTable specDisks={spec.disks} statusDisks={status.diskStatus} />
      </SectionBox>
      <SectionBox title="Conditions">
        <ConditionsTable resource={item.jsonData} />
      </SectionBox>
    </>
  );
}

function BackupDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornBackup.useGet(name, namespace);

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading backup: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};

  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore
        title={`Backup: ${metadata.name}`}
        extraInfo={[
          { name: 'State', value: status.state || '-' },
          { name: 'Snapshot Name', value: status.snapshotName || '-' },
          { name: 'Backup Target', value: status.backupTargetName || '-' },
          { name: 'Volume Name', value: status.volumeName || '-' },
        ]}
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Details">
        <NameValueTable
          rows={[
            { name: 'Size', value: status.size || '-' },
            { name: 'Newly Uploaded Data', value: status.newlyUploadDataSize || '-' },
            { name: 'Re-Uploaded Data', value: status.reUploadedDataSize || '-' },
            { name: 'Snapshot Created At', value: status.snapshotCreatedAt || '-' },
            { name: 'Backup Created At', value: status.backupCreatedAt || '-' },
            { name: 'Last Synced At', value: status.lastSyncedAt || '-' },
            { name: 'Compression Method', value: status.compressionMethod || '-' },
            { name: 'Volume Size', value: status.volumeSize || '-' },
            { name: 'Volume Created At', value: status.volumeCreated || '-' },
            { name: 'Volume Backing Image', value: status.volumeBackingImageName || '-' },
            { name: 'Progress', value: `${status.progress || 0}%` },
            { name: 'Replica Address', value: status.replicaAddress || '-' },
          ]}
        />
      </SectionBox>
      {spec.labels && (
        <SectionBox title="Spec Labels">
          <NameValueTable
            rows={Object.entries(spec.labels).map(([k, v]) => ({ name: k, value: v as string }))}
          />
        </SectionBox>
      )}
      {status.labels && (
        <SectionBox title="Status Labels">
          <NameValueTable
            rows={Object.entries(status.labels).map(([k, v]) => ({ name: k, value: v as string }))}
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
            rows={Object.entries(status.messages).map(([k, v]) => ({
              name: k,
              value: v as string,
            }))}
          />
        </SectionBox>
      )}
    </>
  );
}

function EngineImageDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornEngineImage.useGet(name, namespace);

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading engine image: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};

  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore
        title={`Engine Image: ${metadata.name}`}
        extraInfo={[
          { name: 'State', value: status.state || '-' },
          { name: 'Image', value: spec.image || '-' },
          { name: 'Ref Count', value: status.refCount ?? '-' },
          { name: 'Build Date', value: status.buildDate || '-' },
          { name: 'Incompatible', value: String(status.incompatible) },
        ]}
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Details">
        <NameValueTable
          rows={[
            { name: 'Version', value: status.version || '-' },
            { name: 'Git Commit', value: status.gitCommit || '-' },
            {
              name: 'CLI API Version',
              value: `${status.cliAPIMinVersion || '?'} - ${status.cliAPIVersion || '?'}`,
            },
            {
              name: 'Controller API Version',
              value: `${status.controllerAPIMinVersion || '?'} - ${
                status.controllerAPIVersion || '?'
              }`,
            },
            {
              name: 'Data Format Version',
              value: `${status.dataFormatMinVersion || '?'} - ${status.dataFormatVersion || '?'}`,
            },
            { name: 'No Ref Since', value: status.noRefSince || '-' },
          ]}
        />
      </SectionBox>
      {status.nodeDeploymentMap && (
        <SectionBox title="Node Deployment Status">
          <NameValueTable
            rows={Object.entries(status.nodeDeploymentMap).map(([node, deployed]) => ({
              name: node,
              // @ts-ignore
              value: String(deployed),
            }))}
          />
        </SectionBox>
      )}
      <SectionBox title="Conditions">
        <ConditionsTable resource={item.jsonData} />
      </SectionBox>
    </>
  );
}

// Define routes and sidebar names as constants
const LONGHORN_ROOT_SIDEBAR = 'longhorn';
const LONGHORN_VOLUMES_LIST_ROUTE = 'volumes';
const LONGHORN_VOLUME_DETAILS_ROUTE = 'volume';
const LONGHORN_NODES_LIST_ROUTE = 'nodes';
const LONGHORN_NODE_DETAILS_ROUTE = 'node';
const LONGHORN_SETTINGS_LIST_ROUTE = 'settings';
// const LONGHORN_SETTING_DETAILS_ROUTE = 'longhornSetting'; // No details view for settings yet
const LONGHORN_BACKUPS_LIST_ROUTE = 'backups';
const LONGHORN_BACKUP_DETAILS_ROUTE = 'backup';
const LONGHORN_ENGINE_IMAGES_LIST_ROUTE = 'engineimages';
const LONGHORN_ENGINE_IMAGE_DETAILS_ROUTE = 'engineimage';

// Register Sidebar Entries

registerSidebarEntry({
  parent: null, // Top-level entry
  name: LONGHORN_ROOT_SIDEBAR,
  label: 'Longhorn',
  icon: 'mdi:cow', // Example icon, find appropriate one at https://icon-sets.iconify.design/mdi/
});

registerSidebarEntry({
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_VOLUMES_LIST_ROUTE,
  label: 'Volumes',
  url: '/longhorn/volumes',
});

registerSidebarEntry({
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_NODES_LIST_ROUTE,
  label: 'Nodes',
  url: '/longhorn/nodes',
});

registerSidebarEntry({
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_SETTINGS_LIST_ROUTE,
  label: 'Settings',
  url: '/longhorn/settings',
});

registerSidebarEntry({
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_BACKUPS_LIST_ROUTE,
  label: 'Backups',
  url: '/longhorn/backups',
});

registerSidebarEntry({
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  label: 'Engine Images',
  url: '/longhorn/engineimages',
});

// Register Routes and Components

// Volumes List View
registerRoute({
  path: '/longhorn/volumes',
  sidebar: LONGHORN_VOLUMES_LIST_ROUTE,
  name: LONGHORN_VOLUMES_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Longhorn Volumes"
      resourceClass={LonghornVolume}
      columns={[
        // Rely on default name column rendering
        'name',
        // Other columns... (state, robustness, size, node, namespace, age)
        {
          id: 'state',
          label: 'State',
          getter: (volume: KubeObjectInterface) => volume.jsonData?.status?.state || '-',
          sort: true,
        },
        {
          id: 'robustness',
          label: 'Robustness',
          getter: (volume: KubeObjectInterface) => volume.jsonData?.status?.robustness || '-',
          sort: true,
        },
        {
          id: 'size',
          label: 'Size',
          getter: (volume: KubeObjectInterface) => volume.jsonData?.spec?.size || '-',
          sort: true,
        },
        {
          id: 'node',
          label: 'Node',
          getter: (volume: KubeObjectInterface) => volume.jsonData?.status?.currentNodeID || '-',
          sort: true,
        },
        'namespace',
        'age',
      ]}
    />
  ),
});

// Volume Detail View
registerRoute({
  path: '/longhorn/volumes/:namespace/:name',
  sidebar: LONGHORN_VOLUMES_LIST_ROUTE,
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_VOLUME_DETAILS_ROUTE,
  exact: true,
  component: VolumeDetailsView,
});

// Nodes List View
registerRoute({
  path: '/longhorn/nodes',
  sidebar: LONGHORN_NODES_LIST_ROUTE,
  name: LONGHORN_NODES_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Longhorn Nodes"
      resourceClass={LonghornNode}
      columns={[
        // Use default name column rendering
        'name',
        // Other columns...
        {
          id: 'ready',
          label: 'Ready',
          getter: (node: KubeObjectInterface) =>
            node.jsonData?.status?.conditions?.find((c: any) => c.type === 'Ready')?.status || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'allowScheduling',
          label: 'Allow Scheduling',
          getter: (node: KubeObjectInterface) =>
            (node.jsonData?.spec?.allowScheduling ?? '-').toString(), // Access via jsonData
          sort: true,
        },
        {
          id: 'schedulable',
          label: 'Schedulable',
          getter: (node: KubeObjectInterface) =>
            node.jsonData?.status?.conditions?.find((c: any) => c.type === 'Schedulable')?.status ||
            '-', // Access via jsonData
          sort: true,
        },
        'age',
      ]}
    />
  ),
});

// Node Detail View
registerRoute({
  path: '/longhorn/nodes/:namespace/:name',
  sidebar: LONGHORN_NODES_LIST_ROUTE,
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_NODE_DETAILS_ROUTE,
  exact: true,
  component: NodeDetailsView,
});

// --- Settings View Component ---

// Define categories based on Longhorn docs
const settingCategories: { [key: string]: string } = {
  // General
  'node-drain-policy': 'General',
  'detach-manually-attached-volumes-when-cordoned': 'General',
  'auto-cleanup-system-generated-snapshot': 'General',
  'auto-cleanup-recurring-job-backup-snapshot': 'General',
  'auto-delete-pod-when-volume-detached-unexpectedly': 'General',
  'auto-salvage': 'General',
  'concurrent-automatic-engine-upgrade-per-node-limit': 'General',
  'concurrent-volume-backup-restore-per-node-limit': 'General',
  'create-default-disk-labeled-nodes': 'General',
  'default-data-locality': 'General',
  'default-data-path': 'General',
  'default-engine-image': 'General',
  'default-longhorn-static-storage-class': 'General',
  'default-replica-count': 'General',
  'deleting-confirmation-flag': 'General',
  'disable-revision-counter': 'General',
  'upgrade-checker': 'General',
  'upgrade-responder-url': 'General',
  'latest-longhorn-version': 'General',
  'current-longhorn-version': 'General',
  'allow-collecting-longhorn-usage-metrics': 'General',
  'node-down-pod-deletion-policy': 'General',
  'registry-secret': 'General',
  'replica-replenishment-wait-interval': 'General',
  'system-managed-pods-image-pull-policy': 'General',
  'backing-image-cleanup-wait-interval': 'General',
  'backing-image-recovery-wait-interval': 'General',
  'default-min-number-of-backing-image-copies': 'General',
  'engine-replica-timeout': 'General',
  'support-bundle-manager-image': 'General',
  'support-bundle-failed-history-limit': 'General',
  'support-bundle-node-collection-timeout': 'General',
  'fast-replica-rebuild-enabled': 'General',
  'replica-file-sync-http-client-timeout': 'General',
  'long-grpc-timeout': 'General',
  'rwx-volume-fast-failover': 'General',
  'default-backing-image-manager-image': 'General',
  'default-instance-manager-image': 'General',
  'log-level': 'General',
  'stable-longhorn-versions': 'General',
  'crd-api-version': 'General', // Less user-facing, but put in General

  // Snapshot
  'snapshot-data-integrity': 'Snapshot',
  'snapshot-data-integrity-immediate-check-after-snapshot-creation': 'Snapshot',
  'snapshot-data-integrity-cronjob': 'Snapshot',
  'snapshot-max-count': 'Snapshot',
  'freeze-filesystem-for-snapshot': 'Snapshot',

  // Orphan
  'orphan-auto-deletion': 'Orphan',

  // Backups
  'allow-recurring-job-while-volume-detached': 'Backups',
  'backup-execution-timeout': 'Backups',
  'failed-backup-ttl': 'Backups',
  'recurring-failed-jobs-history-limit': 'Backups',
  'recurring-successful-jobs-history-limit': 'Backups',
  'restore-volume-recurring-jobs': 'Backups',
  'backup-compression-method': 'Backups',
  'backup-concurrent-limit': 'Backups',
  'restore-concurrent-limit': 'Backups',

  // Scheduling
  'allow-volume-creation-with-degraded-availability': 'Scheduling',
  'disable-scheduling-on-cordoned-node': 'Scheduling',
  'replica-soft-anti-affinity': 'Scheduling',
  'replica-zone-soft-anti-affinity': 'Scheduling',
  'replica-disk-soft-anti-affinity': 'Scheduling',
  'replica-auto-balance': 'Scheduling',
  'replica-auto-balance-disk-pressure-percentage': 'Scheduling',
  'storage-minimal-available-percentage': 'Scheduling',
  'storage-over-provisioning-percentage': 'Scheduling',
  'storage-reserved-percentage-for-default-disk': 'Scheduling',
  'allow-empty-node-selector-volume': 'Scheduling',
  'allow-empty-disk-selector-volume': 'Scheduling',

  // Danger Zone
  'concurrent-replica-rebuild-per-node-limit': 'Danger Zone',
  'concurrent-backing-image-replenish-per-node-limit': 'Danger Zone',
  'taint-toleration': 'Danger Zone',
  'priority-class': 'Danger Zone',
  'system-managed-components-node-selector': 'Danger Zone',
  'kubernetes-cluster-autoscaler-enabled': 'Danger Zone',
  'storage-network': 'Danger Zone',
  'storage-network-for-rwx-volume-enabled': 'Danger Zone',
  'remove-snapshots-during-filesystem-trim': 'Danger Zone',
  'guaranteed-instance-manager-cpu': 'Danger Zone',
  'disable-snapshot-purge': 'Danger Zone',
  'auto-cleanup-when-delete-backup': 'Danger Zone',
  'v1-data-engine': 'Danger Zone',
  'v2-data-engine': 'Danger Zone',
  'v2-data-engine-guaranteed-instance-manager-cpu': 'Danger Zone',
  'v2-data-engine-cpu-mask': 'Danger Zone',
  'v2-data-engine-hugepage-limit': 'Danger Zone',
  'v2-data-engine-fast-replica-rebuilding': 'Danger Zone',
  'v2-data-engine-log-flags': 'Danger Zone',
  'v2-data-engine-log-level': 'Danger Zone',
};

function getCategory(settingName: string): string {
  return settingCategories[settingName] || 'Other'; // Default to 'Other' if not found
}

const categoryOrder = [
  'General',
  'Snapshot',
  'Orphan',
  'Backups',
  'Scheduling',
  'Danger Zone',
  'Other',
];

// --- Helper TabPanel Component ---
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setting-tabpanel-${index}`}
      aria-labelledby={`setting-tab-${index}`}
      {...other}
    >
      {value === index && (
        // Add some padding to the panel content
        <Box sx={{ pt: 2, pb: 2 }}>{children}</Box>
      )}
    </div>
  );
}

// Function to generate accessibility props for tabs
function a11yProps(index: number) {
  return {
    id: `setting-tab-${index}`,
    'aria-controls': `setting-tabpanel-${index}`,
  };
}

function SettingsView() {
  const [settings, error] = LonghornSetting.useList();
  // State for the active tab index
  const [activeTab, setActiveTab] = React.useState(0);

  const groupedSettings = React.useMemo(() => {
    if (!settings) return null;

    const groups: { [key: string]: KubeObjectInterface[] } = {};
    settings.forEach(setting => {
      const category = getCategory(setting.metadata.name);
      if (!groups[category]) {
        groups[category] = [];
      }
      // Sort settings alphabetically within each group
      groups[category].push(setting);
      groups[category].sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    });

    // Sort groups according to predefined order
    const sortedGroups: { [key: string]: KubeObjectInterface[] } = {};
    categoryOrder.forEach(category => {
      if (groups[category]) {
        sortedGroups[category] = groups[category];
      }
    });
    // Add any remaining categories (like 'Other') at the end
    Object.keys(groups).forEach(category => {
      if (!sortedGroups[category]) {
        sortedGroups[category] = groups[category];
      }
    });

    return sortedGroups;
  }, [settings]);

  // Handler for changing tabs
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (error) {
    // @ts-ignore Allow error message display
    return (
      <Typography color="error">Error loading settings: {(error as Error).message}</Typography>
    );
  }

  if (!groupedSettings) {
    return <Loader title="Loading Longhorn Settings..." />;
  }

  const categories = Object.keys(groupedSettings);

  return (
    // Use Box as the main container
    <Box sx={{ width: '100%' }}>
      {/* Tab Headers */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Longhorn settings categories"
          variant="scrollable" // Allow tabs to scroll if they overflow
          scrollButtons="auto" // Show scroll buttons automatically
        >
          {categories.map((category, index) => (
            <Tab
              key={category}
              label={`${category} (${groupedSettings[category].length})`}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {categories.map((category, index) => (
        <TabPanel key={category} value={activeTab} index={index}>
          <NameValueTable
            rows={groupedSettings[category].map(setting => ({
              name: setting.metadata.name,
              value: (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    width: '100%',
                  }}
                >
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ wordBreak: 'break-word', flexGrow: 1, mr: 1 }}
                  >
                    {(setting.jsonData.value ?? '-').toString()}
                  </Typography>
                  <Box component="span" sx={{ flexShrink: 0, ml: 1 }}>
                    <StatusLabel status={setting.jsonData.status?.applied ? 'success' : 'error'}>
                      {setting.jsonData.status?.applied ? 'applied' : 'not applied'}
                    </StatusLabel>
                  </Box>
                </Box>
              ),
            }))}
          />
        </TabPanel>
      ))}
    </Box>
  );
}

// Settings List View - Updated to use SettingsView component
registerRoute({
  path: '/longhorn/settings',
  sidebar: LONGHORN_SETTINGS_LIST_ROUTE,
  name: LONGHORN_SETTINGS_LIST_ROUTE,
  exact: true,
  component: SettingsView,
});

// Backups List View
registerRoute({
  path: '/longhorn/backups',
  sidebar: LONGHORN_BACKUPS_LIST_ROUTE,
  name: LONGHORN_BACKUPS_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Longhorn Backups"
      resourceClass={LonghornBackup}
      columns={[
        // Use default name column rendering
        'name',
        // Other columns...
        {
          id: 'snapshotName',
          label: 'Snapshot Name',
          getter: (backup: KubeObjectInterface) => backup.jsonData?.status?.snapshotName || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'snapshotSize',
          label: 'Snapshot Size',
          getter: (backup: KubeObjectInterface) => backup.jsonData?.status?.size || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'backupTarget',
          label: 'Backup Target',
          getter: (backup: KubeObjectInterface) => backup.jsonData?.status?.backupTargetName || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'state',
          label: 'State',
          getter: (backup: KubeObjectInterface) => backup.jsonData?.status?.state || '-', // Access via jsonData
          sort: true,
        },
        'namespace',
        'age',
      ]}
    />
  ),
});

// Backup Detail View
registerRoute({
  path: '/longhorn/backups/:namespace/:name',
  sidebar: LONGHORN_BACKUPS_LIST_ROUTE,
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_BACKUP_DETAILS_ROUTE,
  exact: true,
  component: BackupDetailsView,
});

// Engine Images List View
registerRoute({
  path: '/longhorn/engineimages',
  sidebar: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  name: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Longhorn Engine Images"
      resourceClass={LonghornEngineImage}
      columns={[
        // Use default name column rendering
        'name',
        // Other columns...
        {
          id: 'state',
          label: 'State',
          getter: (img: KubeObjectInterface) => img.jsonData?.status?.state || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'image',
          label: 'Image',
          getter: (img: KubeObjectInterface) => img.jsonData?.spec?.image || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'refCount',
          label: 'Ref Count',
          getter: (img: KubeObjectInterface) => img.jsonData?.status?.refCount ?? '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'buildDate',
          label: 'Build Date',
          getter: (img: KubeObjectInterface) => img.jsonData?.status?.buildDate || '-', // Access via jsonData
          sort: true,
        },
        'age',
      ]}
    />
  ),
});

// Engine Image Detail View
registerRoute({
  path: '/longhorn/engineimages/:namespace/:name',
  sidebar: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_ENGINE_IMAGE_DETAILS_ROUTE,
  exact: true,
  component: EngineImageDetailsView,
});

// Placeholder for other Longhorn resources can be added similarly
// e.g., Backing Images, Recurring Jobs, Snapshots, etc.

console.log('Longhorn Plugin registered.');

// Example of how you might initialize plugin-specific logic
// class LonghornPlugin extends Plugin {
//   initialize(): boolean {
//     console.log('Longhorn Plugin initializing...');
//     // Add more complex initialization logic here if needed
//     return true;
//   }
// }
// Headlamp.registerPlugin('longhorn-plugin-id', new LonghornPlugin());
