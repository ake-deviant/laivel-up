import { NextRequest, NextResponse } from 'next/server';
import { EvaluateDeveloperProfileUseCase, DeveloperProfileResultPresenter } from '@laivel-up/core';
import { container } from '../../../../di/container';
import { DI } from '../../../../di/di';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const { profileId } = await params;

  return container.runInScope(() => {
    const useCase = container.get<EvaluateDeveloperProfileUseCase>(
      DI.EVALUATE_DEVELOPER_PROFILE_USE_CASE,
    );
    const result = useCase.execute(profileId);

    if (result.isErr) {
      return NextResponse.json({ error: result.error.message }, { status: 422 });
    }

    return NextResponse.json(DeveloperProfileResultPresenter.present(result.value));
  });
}
