import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, observable, Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    /**
     * 요청이 들어올 때 REQ 요청이 들어온 timestamp 를 찍는다.
     * [REQ] {요청 path} {요청 시간}
     *
     * 요청이 끝날 때 timestamp 를 찍는다
     * [REQ] {요청 path} {응답시간} {걸린 시간}
     */
    const now = new Date();
    const req = context.switchToHttp().getRequest();

    const path = req.originalUrl;

    // [REQ] {요청 path} {요청 시간}
    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    // return next.handle() 을 실행하는 순간
    // 라우트의 로직이 전부 실행되고 응답이 반환된다.
    // observable 형태 -> rxjs 에서 제공해주는 타입으로 스트림
    // 응답을 받아서 변형, 로그, 에러 캐치가 가능하다
    return next.handle().pipe(
      // pipe 에 원하는 RxJs 함수를 무한이 넣을 수 있다.
      // 입력된 함수들은 순서되로 응답에서 실행이 된다.

      // // tap: 모니터링을 할 수 있고 실행할 수 있지만 데이터 변형은 불가능
      // tap((observable) => console.log(observable)),
      // // map: 데이터 변형을 해주는 함수
      // map((observable) => {
      //   return {
      //     message: '응답 변경',
      //     response: observable,
      //   };
      // }),
      // 에러가 발생한 경우 catchError 함수 사용
      catchError((e) => e),
      tap(() =>
        console.log(
          `[RES] ${path} ${new Date().toLocaleString('kr')} ${
            new Date().getMilliseconds() - now.getMilliseconds()
          } ms`,
        ),
      ),
    );
  }
}
