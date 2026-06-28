import {
  ConditionsTable,
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import React from 'react';
import { useParams } from 'react-router-dom';
import { LonghornEngineImage, LonghornEngineImageJSON } from '../resources/engineImage';
import { formatBool } from '../utils/format';
import { nonEmptyRows } from './common';

function imageData(item: KubeObject): LonghornEngineImageJSON {
  return (item.jsonData || {}) as LonghornEngineImageJSON;
}

export function EngineImageList() {
  return (
    <ResourceListView
      title="Longhorn Engine Images"
      resourceClass={LonghornEngineImage}
      columns={[
        'name',
        {
          id: 'state',
          label: 'State',
          getValue: (img: KubeObject) => imageData(img).status?.state || '',
        },
        {
          id: 'image',
          label: 'Image',
          getValue: (img: KubeObject) => imageData(img).spec?.image || '',
        },
        {
          id: 'refCount',
          label: 'Ref Count',
          getValue: (img: KubeObject) => imageData(img).status?.refCount ?? 0,
        },
        {
          id: 'buildDate',
          label: 'Build Date',
          getValue: (img: KubeObject) => imageData(img).status?.buildDate || '',
        },
        'age',
      ]}
    />
  );
}

export function EngineImageDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornEngineImage.useGet(name, namespace);

  if (error) {
    return <div>Error loading engine image: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading engine image details..." />;
  }

  const data = (item.jsonData || {}) as LonghornEngineImageJSON;
  const spec = data.spec || {};
  const status = data.status || {};
  const metadata = data.metadata || {};

  return (
    <>
      <MainInfoSection
        resource={item}
        title={`Engine Image: ${metadata.name}`}
        extraInfo={[
          { name: 'State', value: status.state || '-' },
          { name: 'Image', value: spec.image || '-' },
          { name: 'Ref Count', value: status.refCount ?? '-' },
          { name: 'Build Date', value: status.buildDate || '-' },
          { name: 'Incompatible', value: formatBool(status.incompatible) },
        ]}
      />
      <SectionBox title="Details">
        <NameValueTable
          rows={nonEmptyRows([
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
          ])}
        />
      </SectionBox>
      {status.nodeDeploymentMap && (
        <SectionBox title="Node Deployment Status">
          <NameValueTable
            rows={Object.entries(status.nodeDeploymentMap).map(([node, deployed]) => ({
              name: node,
              value: formatBool(deployed),
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
