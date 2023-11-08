import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../const/roles.const';

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    unique: true,
  })
  // 1) 길이가 20을 넘지 않을 것
  // 2) 유일무이한 값이 될 것
  nickname: string;

  @Column({
    unique: true,
  })
  // 1) 유일무이한 값이 될 것
  email: string;

  @Column()
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;
}
