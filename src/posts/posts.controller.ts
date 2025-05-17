import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostsDto } from 'src/posts/dto/paginate-post.dto';
import { UsersModel } from 'src/users/entities/users.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  //    모든 post를 가져온다.
  @Get()
  getPosts(@Query() query: PaginatePostsDto) {
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);

    return true;
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
  // DTO - Data Transfer Object 클라이언트로 부터 서버로 데이터를 전송받으면 서버에서 효율적으로 사용할 수 있도록 관리하는 객체
  @Post()
  @UseGuards(AccessTokenGuard) // private router 로 로그인한 사용자만 사용할 수 있음
  postPost(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    // 인스턴스화를 통해 함수가 실행될 때 마다 계속 생기게됨.
    // PasswordPipe 만들땐 Injectable 을 사용
    // 클래스를 그대로 입력하면 NestJS IOC 컨테이너에서 자동으로 값을 주입함
    // 두 방식에 작동에는 큰 차이가 없음
  ) {
    return this.postsService.createPost(userId, body);
  }

  // 4) PUT /posts/:id
  //    id에 해당되는 post를 변경한다.
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body);
  }

  // 5) DELETE /posts/:id
  //    id에 해당되는 post를 삭제한다.
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
