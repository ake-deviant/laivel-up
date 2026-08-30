import { notFound } from 'next/navigation';
import type { AxisViewModel } from '@laivel-up/core';
import { AxisDetail } from '../../_components/axis-detail';

const AXES: AxisViewModel['axis'][] = [
  'size',
  'harness',
  'intervention',
  'parallelism',
  'velocity',
];

interface AxisPageProps {
  params: Promise<{ profileId: string; axis: string }>;
}

export default async function AxisPage({ params }: AxisPageProps) {
  const { profileId, axis } = await params;
  if (!AXES.includes(axis as AxisViewModel['axis'])) notFound();

  return <AxisDetail profileId={profileId} axisName={axis as AxisViewModel['axis']} />;
}
