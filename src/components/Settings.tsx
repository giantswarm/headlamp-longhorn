import { Loader, NameValueTable, StatusLabel } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import { LonghornSetting, LonghornSettingJSON } from '../resources/setting';

// Setting -> category mapping, based on the Longhorn documentation grouping.
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
  'crd-api-version': 'General',

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

const categoryOrder = [
  'General',
  'Snapshot',
  'Orphan',
  'Backups',
  'Scheduling',
  'Danger Zone',
  'Other',
];

function getCategory(settingName: string): string {
  return settingCategories[settingName] || 'Other';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setting-tabpanel-${index}`}
      aria-labelledby={`setting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2, pb: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `setting-tab-${index}`,
    'aria-controls': `setting-tabpanel-${index}`,
  };
}

function settingValue(setting: KubeObject): string {
  const value = (setting.jsonData as LonghornSettingJSON).value;
  return (value ?? '-').toString();
}

function settingApplied(setting: KubeObject): boolean {
  return !!(setting.jsonData as LonghornSettingJSON).status?.applied;
}

export function SettingsView() {
  const [settings, error] = LonghornSetting.useList();
  const [activeTab, setActiveTab] = React.useState(0);

  const groupedSettings = React.useMemo(() => {
    if (!settings) {
      return null;
    }

    const groups: { [key: string]: KubeObject[] } = {};
    settings.forEach((setting: KubeObject) => {
      const category = getCategory(setting.metadata.name);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(setting);
      groups[category].sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    });

    const sortedGroups: { [key: string]: KubeObject[] } = {};
    categoryOrder.forEach(category => {
      if (groups[category]) {
        sortedGroups[category] = groups[category];
      }
    });
    Object.keys(groups).forEach(category => {
      if (!sortedGroups[category]) {
        sortedGroups[category] = groups[category];
      }
    });

    return sortedGroups;
  }, [settings]);

  if (error) {
    return (
      <Typography color="error">Error loading settings: {(error as Error).message}</Typography>
    );
  }

  if (!groupedSettings) {
    return <Loader title="Loading Longhorn Settings..." />;
  }

  const categories = Object.keys(groupedSettings);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_event, newValue) => setActiveTab(newValue)}
          aria-label="Longhorn settings categories"
          variant="scrollable"
          scrollButtons="auto"
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
                    {settingValue(setting)}
                  </Typography>
                  <Box component="span" sx={{ flexShrink: 0, ml: 1 }}>
                    <StatusLabel status={settingApplied(setting) ? 'success' : 'error'}>
                      {settingApplied(setting) ? 'applied' : 'not applied'}
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
