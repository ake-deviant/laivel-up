import { notFound } from 'next/navigation';
import type { AxisViewModel } from '@laivel-up/core';
import { AxisPreview } from '../../../components/pages/axis-page';

const AXES: AxisViewModel['axis'][] = [
  'size',
  'harness',
  'intervention',
  'parallelism',
  'velocity',
  'deliveryConfidence',
];

interface AxisPageProps {
  params: Promise<{ profileId: string; axis: string }>;
}

export default async function AxisPage({ params }: AxisPageProps) {
  const { profileId, axis } = await params;
  if (!AXES.includes(axis as AxisViewModel['axis'])) notFound();

  return <AxisPreview profileId={profileId} axisName={axis as AxisViewModel['axis']} />;
}
