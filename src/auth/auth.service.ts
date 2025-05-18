import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import {
  ENV_HASH_ROUNDS_KEY,
  ENV_JWT_SECRET_KEY,
} from '../common/const/env-keys.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 토큰을 사용하게 되는 방식
   *
   * // yarn add @nestjs/jwt bcrypt
   * 1) 사용자가 로그인 또는 회원가입을 진행하면 accessToken 과 refreshToken 을 발급받는다.
   * 2) 로그인 할때는 Basic 토큰과 함께 요청을 보낸다.
   *    Basic 토큰은 '이메일:비밀번호'를 Base64로 인코딩한 형태이다. {authorization: 'Basic {token}'}
   * 3) 아무나 접근할 수 없는 정보 (private route)를 접근할 때는 accessToken을 Header에 추가해서 요청과 함께 보낸다.
   *    {authorization 'Bearer {token}'}
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자가 누구인지 알 수 있다.
   *    현재 로그인한 사용자가 작성한 포스트만 가져오려면 토큰의 sub 값에 입력되어있는 사용자의 포스트만 따로 필터링
   *    특정 사용자의 토큰이 없다면 다른 사용자의 데이터를 접근 못한다.
   * 5) 모든 토큰은 만료 기간이 있다. 만료 기간이 지나면 새로 토큰을 발급 받아야한다.
   *    발급받지 않을 경우 jwtService.verify() 에서 인증 통과를 하지 못한다.
   *    accessToken을 새로 발급 받을 수 있는 /auth/token/access 와
   *    refreshToken을 새로 발급 받을 수 있는 /auth/token/refresh 가 필요하다.
   * 6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포린트에 요청해서 새로운 토큰을 발급받고
   *    새로운 토큰을 사용해서 private route 에 접근한다.
   */

  /**
   * Header로 부터 토큰을 받을 때
   * {authorization: 'Basic {token}'}
   * {authorization 'Bearer {token}'}
   */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';
    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('invalid_token');
    }
    const token = splitToken[1];

    return token;
  }

  /**
   * Basic asdaok:a3okok
   * 1) asdaok:a3okok -> email:password
   * 2) email:password -> [email, password]
   * 3) {email: email, password: password}
   */
  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf-8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('invalid_token');
    }

    const [email, password] = split;
    return {
      email,
      password,
    };
  }

  /**
   * token 검증
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
      });
    } catch (e) {
      throw new UnauthorizedException(
        '토큰이 만료되었거나, 잘못된 토큰입니다.',
      );
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
    });

    /**
     * sub: id
     * email: email
     * type: 'access' | 'refresh'
     */
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Refresh 토큰으로만 가능합니다');
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken,
    );
  }

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
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
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

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    // 사용자가 존재하는지 확인 (email)
    const existUser = await this.usersService.getUserByEmail(user.email);

    if (!existUser) {
      throw new UnauthorizedException('not_exists_user');
    }

    // 비밀번호가 맞는지 확인
    /**
     * 파라미터
     * 1) 입력된 비밀번호
     * 2) 기존 해시 (hash) -> 사용자 정보에 저장되어있는 hash
     */
    const comparePassword = await bcrypt.compare(
      user.password,
      existUser.password,
    );
    if (!comparePassword) {
      throw new UnauthorizedException('not_match_password');
    }

    // 모두 통과되면 찾은 사용자 정보 반환
    return existUser;
  }

  async loginWtihEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existUser);
  }

  async registerWithEmail(user: RegisterUserDto) {
    /**
     * 파라미터
     * 1) 입력받을 비밀번호
     * 2) Hash Round (https://www.npmjs.com/package/bcrypt#a-note-on-rounds)
     */
    const hash = await bcrypt.hash(
      user.password,
      this.configService.get<number>(ENV_HASH_ROUNDS_KEY),
    );

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
