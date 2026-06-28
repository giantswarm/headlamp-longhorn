import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { BackupDetail, BackupList } from './components/Backups';
import { EngineImageDetail, EngineImageList } from './components/EngineImages';
import { NodeDetail, NodeList } from './components/Nodes';
import { SettingsView } from './components/Settings';
import { VolumeDetail, VolumeList } from './components/Volumes';

// Route and sidebar names. Kept stable so existing deployments keep working.
const LONGHORN_ROOT_SIDEBAR = 'longhorn';
const LONGHORN_VOLUMES_LIST_ROUTE = 'volumes';
const LONGHORN_VOLUME_DETAILS_ROUTE = 'volume';
const LONGHORN_NODES_LIST_ROUTE = 'nodes';
const LONGHORN_NODE_DETAILS_ROUTE = 'node';
const LONGHORN_SETTINGS_LIST_ROUTE = 'settings';
const LONGHORN_BACKUPS_LIST_ROUTE = 'backups';
const LONGHORN_BACKUP_DETAILS_ROUTE = 'backup';
const LONGHORN_ENGINE_IMAGES_LIST_ROUTE = 'engineimages';
const LONGHORN_ENGINE_IMAGE_DETAILS_ROUTE = 'engineimage';

// --- Sidebar entries ---

registerSidebarEntry({
  parent: null,
  name: LONGHORN_ROOT_SIDEBAR,
  label: 'Longhorn',
  icon: 'mdi:cow',
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

// --- Routes ---

registerRoute({
  path: '/longhorn/volumes',
  sidebar: LONGHORN_VOLUMES_LIST_ROUTE,
  name: LONGHORN_VOLUMES_LIST_ROUTE,
  exact: true,
  component: VolumeList,
});

registerRoute({
  path: '/longhorn/volumes/:namespace/:name',
  sidebar: LONGHORN_VOLUMES_LIST_ROUTE,
  name: LONGHORN_VOLUME_DETAILS_ROUTE,
  exact: true,
  component: VolumeDetail,
});

registerRoute({
  path: '/longhorn/nodes',
  sidebar: LONGHORN_NODES_LIST_ROUTE,
  name: LONGHORN_NODES_LIST_ROUTE,
  exact: true,
  component: NodeList,
});

registerRoute({
  path: '/longhorn/nodes/:namespace/:name',
  sidebar: LONGHORN_NODES_LIST_ROUTE,
  name: LONGHORN_NODE_DETAILS_ROUTE,
  exact: true,
  component: NodeDetail,
});

registerRoute({
  path: '/longhorn/settings',
  sidebar: LONGHORN_SETTINGS_LIST_ROUTE,
  name: LONGHORN_SETTINGS_LIST_ROUTE,
  exact: true,
  component: SettingsView,
});

registerRoute({
  path: '/longhorn/backups',
  sidebar: LONGHORN_BACKUPS_LIST_ROUTE,
  name: LONGHORN_BACKUPS_LIST_ROUTE,
  exact: true,
  component: BackupList,
});

registerRoute({
  path: '/longhorn/backups/:namespace/:name',
  sidebar: LONGHORN_BACKUPS_LIST_ROUTE,
  name: LONGHORN_BACKUP_DETAILS_ROUTE,
  exact: true,
  component: BackupDetail,
});

registerRoute({
  path: '/longhorn/engineimages',
  sidebar: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  name: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  exact: true,
  component: EngineImageList,
});

registerRoute({
  path: '/longhorn/engineimages/:namespace/:name',
  sidebar: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  name: LONGHORN_ENGINE_IMAGE_DETAILS_ROUTE,
  exact: true,
  component: EngineImageDetail,
});
