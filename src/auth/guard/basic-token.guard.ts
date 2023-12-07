/**
 * 구현할 기능
 * 1) 요청 객체 (request) 를 불러오고 authorization header 로 부터 토큰을 가져온다.
 * 2) authService.extractTokenFromHeader 를 이용하여 사용할 수 있는 형태의 토큰을 추출한다.
 * 3) authService.decodeBasicToken을 실행해서 email과 password를 추출한다.
 * 4) email과 password를 이용해서 사용자를 가져온다. authService.authenticateWithEmailAndPassword
 * 5) 찾아낸 사용자를 (1) 요청 객체에 붙여준다. req.user = user;
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  // 반환값: 통과를 할수 있는지 없는지를 나타냄
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // context 에서 http, ws, rpc 요청등을 가져올 수 있음
    const req = context.switchToHttp().getRequest();

    // {authorization: 'Basic asadsaddasd'}
    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    // 2번 작업
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    // 3번 작업
    const { email, password } = this.authService.decodeBasicToken(token);
    // 4번 작업
    const user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });
    // 5번 작업
    req.user = user;

    return true;
  }
}
