import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { IsEmail, MinLength, IsEnum } from "class-validator";
import bcrypt from "bcryptjs";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MANAGER = "manager"
}

registerEnumType(UserRole, {
  name: "UserRole",
  description: "User role in the system",
});

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ unique: true })
  @MinLength(3, { message: "Username must be at least 3 characters long" })
  username: string;

  @Field()
  @Column({ unique: true })
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @Column({ select: false })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @Field(() => UserRole)
  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER
  })
  @IsEnum(UserRole)
  role: UserRole;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ nullable: true })
  firstName: string;

  @Field()
  @Column({ nullable: true })
  lastName: string;

  @Field()
  @Column({ nullable: true })
  phoneNumber: string;

  @Field()
  @Column({ nullable: true })
  lastLoginAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
} 
