import { NextResponse } from 'next/server';
import { ListDeveloperProfilesUseCase } from '@laivel-up/core';
import { container } from '../../../di/container';
import { DI } from '../../../di/di';

export async function GET() {
  return container.runInScope(() => {
    const useCase = container.get<ListDeveloperProfilesUseCase>(
      DI.LIST_DEVELOPER_PROFILES_USE_CASE,
    );
    return NextResponse.json(useCase.execute());
  });
}
