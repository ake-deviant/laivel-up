import { NextRequest, NextResponse } from 'next/server';
import { DeveloperProfileResultPresenter } from '@laivel-up/core';
import { container, buildEvaluateUseCase } from '../../../../di/container';
import {
  EvaluationConfigValidationError,
  parseEvaluationConfig,
} from '../../../../config/default-evaluation-config';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const { profileId } = await params;
  const body = await req.json().catch(() => ({}));
  let config: ReturnType<typeof parseEvaluationConfig>;
  try {
    config = parseEvaluationConfig(body);
  } catch (reason) {
    if (reason instanceof EvaluationConfigValidationError) {
      return NextResponse.json({ error: reason.message }, { status: 400 });
    }
    throw reason;
  }

  return container.runInScope(() => {
    const useCase = buildEvaluateUseCase(config);
    const result = useCase.execute(profileId);

    if (result.isErr) {
      return NextResponse.json({ error: result.error.message }, { status: 422 });
    }

    return NextResponse.json(DeveloperProfileResultPresenter.present(result.value));
  });
}
