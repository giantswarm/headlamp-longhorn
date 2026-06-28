import {
  ConditionsTable,
  Link,
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import React from 'react';
import { useParams } from 'react-router-dom';
import { LonghornVolume, LonghornVolumeJSON, VolumeWorkloadStatus } from '../resources/volume';
import { humanizeBytes } from '../utils/bytes';
import { formatBool } from '../utils/format';
import { nonEmptyRows, VolumeRobustnessLabel, VolumeStateLabel } from './common';

function volumeData(item: KubeObject): LonghornVolumeJSON {
  return (item.jsonData || {}) as LonghornVolumeJSON;
}

/** Short, human-readable description of the workloads consuming a volume. */
function workloadSummary(workloads?: VolumeWorkloadStatus[]): string {
  if (!workloads || workloads.length === 0) {
    return '';
  }
  return workloads
    .map(w => w.workloadName || w.podName || '')
    .filter(Boolean)
    .join(', ');
}

function PodLinks({
  namespace,
  workloads,
}: {
  namespace?: string;
  workloads?: VolumeWorkloadStatus[];
}) {
  const pods = (workloads || []).filter(w => w.podName);
  if (pods.length === 0) {
    return <>-</>;
  }
  return (
    <>
      {pods.map((w, i) => (
        <React.Fragment key={`${w.podName}-${i}`}>
          {i > 0 && ', '}
          {namespace ? (
            <Link routeName="pod" params={{ name: w.podName!, namespace }}>
              {w.podName}
            </Link>
          ) : (
            w.podName
          )}
        </React.Fragment>
      ))}
    </>
  );
}

export function VolumeList() {
  return (
    <ResourceListView
      title="Longhorn Volumes"
      resourceClass={LonghornVolume}
      columns={[
        'name',
        {
          id: 'state',
          label: 'State',
          getValue: (volume: KubeObject) => volumeData(volume).status?.state || '',
          render: (volume: KubeObject) => (
            <VolumeStateLabel state={volumeData(volume).status?.state} />
          ),
        },
        {
          id: 'robustness',
          label: 'Robustness',
          getValue: (volume: KubeObject) => volumeData(volume).status?.robustness || '',
          render: (volume: KubeObject) => (
            <VolumeRobustnessLabel robustness={volumeData(volume).status?.robustness} />
          ),
        },
        {
          id: 'size',
          label: 'Size',
          getValue: (volume: KubeObject) => Number(volumeData(volume).spec?.size) || 0,
          render: (volume: KubeObject) => humanizeBytes(volumeData(volume).spec?.size),
        },
        {
          id: 'pvc',
          label: 'PVC',
          getValue: (volume: KubeObject) =>
            volumeData(volume).status?.kubernetesStatus?.pvcName || '',
          render: (volume: KubeObject) => {
            const ks = volumeData(volume).status?.kubernetesStatus;
            if (!ks?.pvcName || !ks?.namespace) {
              return '-';
            }
            return (
              <Link
                routeName="persistentVolumeClaim"
                params={{ name: ks.pvcName, namespace: ks.namespace }}
              >
                {ks.pvcName}
              </Link>
            );
          },
        },
        {
          id: 'workload',
          label: 'Workload',
          getValue: (volume: KubeObject) =>
            workloadSummary(volumeData(volume).status?.kubernetesStatus?.workloadsStatus),
          render: (volume: KubeObject) => {
            const summary = workloadSummary(
              volumeData(volume).status?.kubernetesStatus?.workloadsStatus
            );
            return summary || '-';
          },
        },
        {
          id: 'node',
          label: 'Node',
          getValue: (volume: KubeObject) => volumeData(volume).status?.currentNodeID || '',
          render: (volume: KubeObject) => {
            const nodeId = volumeData(volume).status?.currentNodeID;
            if (!nodeId) {
              return '-';
            }
            return (
              <Link
                routeName="node"
                params={{ name: nodeId, namespace: volume.metadata.namespace }}
              >
                {nodeId}
              </Link>
            );
          },
        },
        'namespace',
        'age',
      ]}
    />
  );
}

export function VolumeDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornVolume.useGet(name, namespace);

  if (error) {
    return <div>Error loading volume: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading volume details..." />;
  }

  const data = (item.jsonData || {}) as LonghornVolumeJSON;
  const spec = data.spec || {};
  const status = data.status || {};
  const metadata = data.metadata || {};
  const kubernetesStatus = status.kubernetesStatus || {};

  return (
    <>
      <MainInfoSection
        resource={item}
        title={`Volume: ${metadata.name}`}
        extraInfo={[
          { name: 'State', value: <VolumeStateLabel state={status.state} /> },
          { name: 'Robustness', value: <VolumeRobustnessLabel robustness={status.robustness} /> },
          {
            name: 'Node',
            value: status.currentNodeID ? (
              <Link routeName="node" params={{ name: status.currentNodeID, namespace }}>
                {status.currentNodeID}
              </Link>
            ) : (
              '-'
            ),
          },
          { name: 'Size', value: humanizeBytes(spec.size) },
        ]}
      />
      <SectionBox title="Status Details">
        <NameValueTable
          rows={nonEmptyRows([
            { name: 'Actual Size', value: humanizeBytes(status.actualSize) },
            { name: 'Frontend Disabled', value: formatBool(status.frontendDisabled) },
            { name: 'Is Standby', value: formatBool(status.isStandby) },
            { name: 'Share Endpoint', value: status.shareEndpoint || '-' },
            { name: 'Share State', value: status.shareState || '-' },
            { name: 'Last Backup', value: status.lastBackup || '-' },
            { name: 'Last Backup At', value: status.lastBackupAt || '-' },
            { name: 'Expansion Required', value: formatBool(status.expansionRequired) },
            { name: 'Restore Required', value: formatBool(status.restoreRequired) },
            { name: 'Restore Initiated', value: formatBool(status.restoreInitiated) },
          ])}
        />
      </SectionBox>
      <SectionBox title="Configuration">
        <NameValueTable
          rows={nonEmptyRows([
            { name: 'Data Engine', value: spec.dataEngine || '-' },
            { name: 'Frontend', value: spec.frontend || '-' },
            { name: 'Number of Replicas', value: spec.numberOfReplicas ?? '-' },
            { name: 'Data Locality', value: spec.dataLocality || '-' },
            { name: 'Access Mode', value: spec.accessMode || '-' },
            { name: 'Backing Image', value: spec.backingImage || '-' },
            { name: 'Stale Replica Timeout', value: spec.staleReplicaTimeout ?? '-' },
            { name: 'Encrypted', value: formatBool(spec.encrypted) },
            { name: 'Engine Image', value: spec.image || '-' },
            { name: 'From Backup', value: spec.fromBackup || '-' },
            { name: 'Disk Selector', value: spec.diskSelector?.join(', ') || '-' },
            { name: 'Node Selector', value: spec.nodeSelector?.join(', ') || '-' },
            { name: 'Disable Revision Counter', value: formatBool(spec.revisionCounterDisabled) },
            { name: 'Replica Auto Balance', value: spec.replicaAutoBalance || '-' },
            { name: 'Unmap Mark SnapChain Removed', value: spec.unmapMarkSnapChainRemoved || '-' },
            { name: 'Snapshot Data Integrity', value: spec.snapshotDataIntegrity || '-' },
            {
              name: 'Freeze Filesystem For Snapshot',
              value: spec.freezeFilesystemForSnapshot || '-',
            },
            { name: 'Backup Target', value: spec.backupTargetName || '-' },
            { name: 'Backup Compression Method', value: spec.backupCompressionMethod || '-' },
          ])}
        />
      </SectionBox>
      <SectionBox title="Kubernetes Status">
        <NameValueTable
          rows={nonEmptyRows([
            { name: 'Namespace', value: kubernetesStatus.namespace || '-' },
            {
              name: 'PVC Name',
              value:
                kubernetesStatus.pvcName && kubernetesStatus.namespace ? (
                  <Link
                    routeName="persistentVolumeClaim"
                    params={{
                      name: kubernetesStatus.pvcName,
                      namespace: kubernetesStatus.namespace,
                    }}
                  >
                    {kubernetesStatus.pvcName}
                  </Link>
                ) : (
                  kubernetesStatus.pvcName || '-'
                ),
            },
            { name: 'PV Name', value: kubernetesStatus.pvName || '-' },
            { name: 'PV Status', value: kubernetesStatus.pvStatus || '-' },
            {
              name: 'Workloads',
              value: kubernetesStatus.workloadsStatus?.length ? (
                <PodLinks
                  namespace={kubernetesStatus.namespace}
                  workloads={kubernetesStatus.workloadsStatus}
                />
              ) : (
                '-'
              ),
            },
            { name: 'Last PVCRef At', value: kubernetesStatus.lastPVCRefAt || '-' },
            { name: 'Last PodRef At', value: kubernetesStatus.lastPodRefAt || '-' },
          ])}
        />
      </SectionBox>
      <SectionBox title="Conditions">
        <ConditionsTable resource={item.jsonData} />
      </SectionBox>
    </>
  );
}
