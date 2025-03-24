import type { Result } from '@common/utils';

export interface ICommand<Request, Response> {
  execute(request: Request): Promise<Result<Response>>;
}
