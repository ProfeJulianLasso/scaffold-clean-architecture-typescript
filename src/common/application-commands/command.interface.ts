import type { Result } from '@common/utils/result-pattern/result.pattern';

export interface ICommand<Request, Response> {
  execute(request: Request): Promise<Result<Response>>;
}
