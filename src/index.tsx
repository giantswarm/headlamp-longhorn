import {
  registerRoute,
  registerSidebarEntry,
  K8s,
  // Plugin, // Uncomment if you need Plugin class features
} from '@kinvolk/headlamp-plugin/lib';
import {
  DetailsGrid,
  ResourceListView,
  MainInfoSection, // Import MainInfoSection
  SectionBox,         // <-- Add SectionBox
  NameValueTable,     // <-- Add NameValueTable
  ConditionsTable,    // <-- Add ConditionsTable
  Link,               // <-- Add Link
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd'; // Import makeCustomResourceClass
import { useParams } from 'react-router-dom'; // Import useParams
import React from 'react'; // Import React

const { makeKubeObject } = K8s.cluster;

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
               <Link routeName="node" params={{ name: status.currentNodeID }}>
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
             { name: 'Freeze Filesystem For Snapshot', value: spec.freezeFilesystemForSnapshot || '-' },
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

function NodeDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornNode.useGet(name, namespace);

  if (error) {
    return <div>Error loading node: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  return <MainInfoSection resource={item} />;
}

function BackupDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornBackup.useGet(name, namespace);

  if (error) {
    return <div>Error loading backup: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  return <MainInfoSection resource={item} />;
}

function EngineImageDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornEngineImage.useGet(name, namespace);

  if (error) {
    return <div>Error loading engine image: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  return <MainInfoSection resource={item} />;
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
        // Use default name column rendering
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
          getter: (node: KubeObjectInterface) => (node.jsonData?.spec?.allowScheduling ?? '-').toString(), // Access via jsonData
          sort: true,
        },
        {
          id: 'schedulable',
          label: 'Schedulable',
          getter: (node: KubeObjectInterface) =>
            node.jsonData?.status?.conditions?.find((c: any) => c.type === 'Schedulable')?.status || '-', // Access via jsonData
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

// Settings List View
registerRoute({
  path: '/longhorn/settings',
  sidebar: LONGHORN_SETTINGS_LIST_ROUTE,
  name: LONGHORN_SETTINGS_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Longhorn Settings"
      resourceClass={LonghornSetting}
      columns={[
        'name',
        {
          id: 'value',
          label: 'Value',
          getter: (setting: KubeObjectInterface) => setting.jsonData?.value, // Already using jsonData
          sort: false,
        },
        {
          id: 'applied',
          label: 'Applied',
          getter: (setting: KubeObjectInterface) => (setting.jsonData?.status?.applied ?? false).toString(), // Access via jsonData
          sort: true,
        },
        'age',
      ]}
    />
  ),
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
