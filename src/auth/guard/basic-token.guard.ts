/**
 * 구현할 기능
 * 1) 요청 객체 (request) 를 불러오고 authorization header 로 부터 토큰을 가져온다.
 * 2) authService.extractTokenFromHeader 를 이용하여 사용할 수 있는 형태의 토큰을 추출한다.
 * 3) authService.decodeBasicToken을 실행해서 email과 password를 추출한다.
 * 4) email과 password를 이용해서 사용자를 가져온다. authService.authenticateWithEmailAndPassword
 * 5) 찾아낸 사용자를 (1) 요청 객체에 붙여준다. req.user = user;
 */
