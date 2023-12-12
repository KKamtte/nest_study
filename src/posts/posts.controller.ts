import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { UsersModel } from 'src/users/entities/users.entity';
import { User } from 'src/users/decorator/user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  //    모든 post를 가져온다.
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  // 2) GET /posts/:id
  //    id에 해당되는 post를 가져온다.
  //    예를 들어 id=1 인 경우 id가 1인 post 를 가져온다.
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // 3) POST /posts
  //    post를 생성한다.
  @Post()
  @UseGuards(AccessTokenGuard) // private router 로 로그인한 사용자만 사용할 수 있음
  postPost(
    @User() user: UsersModel,
    @Body('title') title: string,
    @Body('content') content: string,
    // 인스턴스화를 통해 함수가 실행될 때 마다 계속 생기게됨.
    // PasswordPipe 만들땐 Injectable 을 사용
    // 클래스를 그대로 입력하면 NestJS IOC 컨테이너에서 자동으로 값을 주입함
    // 두 방식에 작동에는 큰 차이가 없음
    @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean,
  ) {
    return this.postsService.createPost(user.id, title, content);
  }

  // 4) PUT /posts/:id
  //    id에 해당되는 post를 변경한다.
  @Put(':id')
  putPost(
    @Param('id', ParseIntPipe) id: number,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, title, content);
  }

  // 5) DELETE /posts/:id
  //    id에 해당되는 post를 삭제한다.
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
