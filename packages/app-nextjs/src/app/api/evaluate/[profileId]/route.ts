import { NextRequest, NextResponse } from 'next/server';
import { DeveloperProfileResultPresenter } from '@laivel-up/core';
import { container, buildEvaluateUseCase } from '../../../../di/container';
import { mergeEvaluationConfig } from '../../../../config/default-evaluation-config';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const { profileId } = await params;
  const body = await req.json().catch(() => ({}));
  const config = mergeEvaluationConfig(body);

  return container.runInScope(() => {
    const useCase = buildEvaluateUseCase(config);
    const result = useCase.execute(profileId);

    if (result.isErr) {
      return NextResponse.json({ error: result.error.message }, { status: 422 });
    }

    return NextResponse.json(DeveloperProfileResultPresenter.present(result.value));
  });
}
