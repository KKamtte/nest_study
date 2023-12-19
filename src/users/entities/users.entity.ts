import { Column, Entity, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMesage } from 'src/common/validation-message/string-validation.message';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString({
    message: stringValidationMesage,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  // 1) 길이가 20을 넘지 않을 것
  // 2) 유일무이한 값이 될 것
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString({
    message: stringValidationMesage,
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  // 1) 유일무이한 값이 될 것
  email: string;

  @Expose()
  get nicknameAndEmail() {
    return this.nickname + ' / ' + this.email;
  }

  @Column()
  @IsString({
    message: stringValidationMesage,
  })
  @Length(3, 8, {
    message: lengthValidationMessage,
  })
  /**
   * frontend -> backend (Request)
   * plain object (JSON) -> class instance (dto)
   *
   * backend -> frontend (Response)
   * class instance (dto) -> plain object (JSON)
   *
   * toClassOnly -> class instance로 변환될떄만 -> request 가 들어올 때
   * toPlainOnly -> plain object로 변환될떄만 -> response 를 보내줄 때
   */
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
