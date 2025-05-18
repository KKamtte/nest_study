import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostsDto } from 'src/posts/dto/paginate-post.dto';
import { CommonService } from '../common/common.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel) // 모델에 따라 해당하는 레포지토리를 넣어줄때 사용
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  async getAllPosts() {
    return await this.postsRepository.find({
      relations: ['author'],
    });
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `랜덤 포스트 ${i}`,
        content: `랜덤 컨텐츠 ${i}`,
      });
    }
  }

  async paginatePosts(dto: PaginatePostsDto) {
    // if (dto.page) {
    //   return this.pagePaginatePosts(dto);
    // }
    // return this.cursorPaginationPosts(dto);
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      {
        relations: ['author'],
      },
      'posts',
    );
  }

  async pagePaginatePosts(dto: PaginatePostsDto) {
    /**
     * data: Data[]
     * total: number
     */
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginationPosts(dto: PaginatePostsDto) {
    const where: FindOptionsWhere<PostsModel> = {};
    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }
    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });
    // common.service.ts 로 이동
    // // 해당되는 포스트가 0개 이상이면
    // // 마지막 포스트를 가져오고
    // // 아니면 0을 반환한다
    // const lastItem =
    //   posts.length > 0 && posts.length === dto.take
    //     ? posts[posts.length - 1]
    //     : null;
    //
    // const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/`);
    //
    // if (nextUrl) {
    //   /**
    //    * dto 의 키 값을 확인하고
    //    * 키값에 해당하는 value 가 존재하면
    //    * param 에 그대로 붙여넣는다.
    //    * 단, id 값만 lastItem의 마지막 값으로 넣어준다.
    //    */
    //   for (const key of Object.keys(dto)) {
    //     if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
    //       nextUrl.searchParams.append(key, dto[key]);
    //     }
    //   }
    //
    //   let key = null;
    //
    //   if (dto.order__createdAt === 'ASC') {
    //     key = 'where__id__more_than';
    //   } else {
    //     key = 'where__id__less_than';
    //   }
    //
    //   nextUrl.searchParams.append(key, lastItem.id.toString());
    // }

    /**
     * Response
     *
     * data: Data[],
     * cursor: {
     *  after: 마지막 Data의 ID
     * },
     * count: 응답한 데이터의 개수
     * next: 다음 요청을 할때 사용할 URL
     */
    // return {
    //   data: posts,
    //   cursor: {
    //     after: lastItem?.id ?? null,
    //   },
    //   count: posts.length,
    //   next: nextUrl?.toString() ?? null,
    // };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      relations: ['author'],
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    // 1) create -> 저장할 객체를 생성한다.
    // 2) save -> 객체를 저장한다. (create 메서드에서 생성한 객체로)

    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(id: number, postDto: UpdatePostDto) {
    const { title, content } = postDto;
    // save의 기능
    // 1) 만약에 데이터가 존재하지 않는다면 (id 기준) 새로 생성한다.
    // 2) 만약에 데이터가 존재한다면 (같은 id 값이 존재한다면) 값을 업데이트한다.
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    const updatePost = await this.postsRepository.save(post);

    return updatePost;
  }

  async deletePost(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    this.postsRepository.delete(id);

    return id;
  }
}
