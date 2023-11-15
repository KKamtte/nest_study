import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { JWT_SECRET } from './const/auth.const';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  /**
   * 만들 기능
   *
   * 1) registerWithEmail
   *    - email, nickname, password 를 입력 받고 사용자를 생성한다.
   *    - 생성이 완료되면 accessToken 과 refreshToken 을 반환한다.
   *    - 회원 가입 후 다시 로그인 하는 과정을 넣지 않음.
   *
   * 2) loginWithEmail
   *    - email, password 를 입력하면 사용자 검증을 진행한다.
   *    - 검증이 완료되면 accessToken 과 refreshToken 을 반환한다.
   *
   * 3) loginUser
   *    - (1) 과 (2) 에서 필요한 accessToken 과 refreshToken 을 반환하는 로직
   *
   * 4) signToken
   *    - (3) 에서 필요한 accessToken 과 refreshToken 을 sign 하는 로직
   *
   * 5) authenticateWithEmailAndPassword
   *    - (2) 에서 로그인을 진행할 때 필요한 기본적인 검증 진행
   *    - 1. 사용자가 존재하는지 확인 (email)
   *    - 2. 비밀번호가 맞는지 확인
   *    - 3. 모두 통과되면 찾은 사용자 정보 반환
   *    - 4. loginWithEmail 에서 반환된 데이터를 기반으로 토큰 생성
   */

  /**
   * Payload 에 들어갈 정보
   *
   * 1) email
   * 2) sub -> id
   * 3) type: 'access' | 'refresh'
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      // seconds 단위로 입력해야함
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }
}
