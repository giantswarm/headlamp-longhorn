import {
  ConditionsTable,
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
  StatusLabel,
  Table,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import React from 'react';
import { useParams } from 'react-router-dom';
import { DiskSpec, DiskStatus, LonghornNode, LonghornNodeJSON } from '../resources/node';
import { humanizeBytes } from '../utils/bytes';
import { formatBool } from '../utils/format';
import { conditionStatus } from '../utils/status';
import { ConditionStatusLabel, nonEmptyRows } from './common';

function nodeData(item: KubeObject): LonghornNodeJSON {
  return (item.jsonData || {}) as LonghornNodeJSON;
}

function conditionValue(node: KubeObject, type: string): string | undefined {
  return nodeData(node).status?.conditions?.find(c => c.type === type)?.status;
}

interface DiskRow {
  uuid: string;
  spec: DiskSpec;
  status: DiskStatus;
}

function NodeDiskTable({
  specDisks,
  statusDisks,
}: {
  specDisks?: { [name: string]: DiskSpec };
  statusDisks?: { [uuid: string]: DiskStatus };
}) {
  const disksData: DiskRow[] = React.useMemo(() => {
    if (!statusDisks) {
      return [];
    }
    const specByName: { [name: string]: DiskSpec } = { ...(specDisks || {}) };
    return Object.entries(statusDisks).map(([uuid, status]) => {
      const spec = (status.diskName && specByName[status.diskName]) || {};
      return { uuid: status.diskUUID || uuid, spec, status };
    });
  }, [specDisks, statusDisks]);

  return (
    <Table
      data={disksData}
      columns={[
        { header: 'Name', accessorFn: (item: DiskRow) => item.status?.diskName || '-' },
        { header: 'UUID', accessorKey: 'uuid' },
        {
          header: 'Path',
          accessorFn: (item: DiskRow) => item.status?.diskPath || item.spec?.path || '-',
        },
        {
          header: 'Type',
          accessorFn: (item: DiskRow) => item.status?.diskType || item.spec?.diskType || '-',
        },
        {
          header: 'Allow Scheduling',
          accessorFn: (item: DiskRow) => formatBool(item.spec?.allowScheduling),
        },
        {
          header: 'Storage Available',
          accessorFn: (item: DiskRow) => humanizeBytes(item.status?.storageAvailable),
        },
        {
          header: 'Storage Scheduled',
          accessorFn: (item: DiskRow) => humanizeBytes(item.status?.storageScheduled),
        },
        {
          header: 'Storage Maximum',
          accessorFn: (item: DiskRow) => humanizeBytes(item.status?.storageMaximum),
        },
        { header: 'Tags', accessorFn: (item: DiskRow) => item.spec?.tags?.join(', ') || '-' },
        {
          header: 'Ready',
          accessorFn: (item: DiskRow) => {
            const ready = item.status?.conditions?.find(c => c.type === 'Ready')?.status;
            return <StatusLabel status={conditionStatus(ready)}>{ready || 'Unknown'}</StatusLabel>;
          },
        },
      ]}
    />
  );
}

export function NodeList() {
  return (
    <ResourceListView
      title="Longhorn Nodes"
      resourceClass={LonghornNode}
      columns={[
        'name',
        {
          id: 'ready',
          label: 'Ready',
          getValue: (node: KubeObject) => conditionValue(node, 'Ready') || '',
          render: (node: KubeObject) => (
            <ConditionStatusLabel status={conditionValue(node, 'Ready')} />
          ),
        },
        {
          id: 'allowScheduling',
          label: 'Allow Scheduling',
          getValue: (node: KubeObject) => formatBool(nodeData(node).spec?.allowScheduling),
        },
        {
          id: 'schedulable',
          label: 'Schedulable',
          getValue: (node: KubeObject) => conditionValue(node, 'Schedulable') || '',
          render: (node: KubeObject) => (
            <ConditionStatusLabel status={conditionValue(node, 'Schedulable')} />
          ),
        },
        'age',
      ]}
    />
  );
}

export function NodeDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornNode.useGet(name, namespace);

  if (error) {
    return <div>Error loading node: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading node details..." />;
  }

  const data = (item.jsonData || {}) as LonghornNodeJSON;
  const spec = data.spec || {};
  const status = data.status || {};
  const metadata = data.metadata || {};
  const conditions = status.conditions || [];
  const readyCondition = conditions.find(c => c.type === 'Ready');
  const schedulableCondition = conditions.find(c => c.type === 'Schedulable');

  return (
    <>
      <MainInfoSection
        resource={item}
        title={`Node: ${metadata.name}`}
        extraInfo={[
          { name: 'Ready', value: <ConditionStatusLabel status={readyCondition?.status} /> },
          {
            name: 'Schedulable',
            value: <ConditionStatusLabel status={schedulableCondition?.status} />,
          },
          { name: 'Allow Scheduling', value: formatBool(spec.allowScheduling) },
          { name: 'Region', value: status.region || '-' },
          { name: 'Zone', value: status.zone || '-' },
        ]}
      />
      <SectionBox title="Configuration">
        <NameValueTable
          rows={nonEmptyRows([
            { name: 'Tags', value: spec.tags?.join(', ') || '-' },
            { name: 'Instance Manager CPU Request', value: spec.instanceManagerCPURequest ?? '-' },
          ])}
        />
      </SectionBox>
      <SectionBox title="Status Details">
        <NameValueTable
          rows={nonEmptyRows([
            { name: 'Auto Evicting', value: formatBool(status.autoEvicting) },
            {
              name: 'Last Periodic Snapshot Check',
              value: status.snapshotCheckStatus?.lastPeriodicCheckedAt || '-',
            },
          ])}
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
