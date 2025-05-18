import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**
     * Roles annotation 에 대한 metadata 를 가져와야한다.
     *
     * Reflector
     * getAllAndOverride(): 키에 해당하는 annotation 에 대한 정보를 가져온다.
     * @Roles(RolesEnum.ADMIN) 이라고 메서드에 되어있고, @Roles(RolesEnum.USER) 라고 클래스에 적혀있다면 가장 가까이 있는 값(ADMIN) 으로 덮어쓴다.
     */
    const requiredRole = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // ROles Annotation 이 등록되어있지 않은 경우
    if (!requiredRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    if (user.role !== requiredRole) {
      throw new ForbiddenException('Roles do not match');
    }

    return true;
  }
}
