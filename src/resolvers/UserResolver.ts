import { Resolver, Query, Mutation, Arg, ObjectType, Field } from "type-graphql";
import { User, UserRole } from "../entities/User";
import { AppDataSource } from "../data-source";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

@ObjectType()
class UserWithoutPassword implements Partial<User> {
  @Field(() => String)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
class UserResponse {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class LoginResponse {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => String, { nullable: true })
  token?: string;

  @Field(() => UserWithoutPassword, { nullable: true })
  user?: UserWithoutPassword;
}

@Resolver()
export class UserResolver {
  private userRepository = AppDataSource.getRepository(User);

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userRepository.find();
  }

  @Query(() => User, { nullable: true })
  async user(@Arg("id") id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string
  ): Promise<LoginResponse> {
    try {
      console.log(`Login attempt for username: ${username}`);
      
      // Use getRepository to get full entity with password
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository
        .createQueryBuilder("user")
        .addSelect("user.password")
        .where("user.username = :username", { username })
        .getOne();
      
      if (!user) {
        console.log(`User not found: ${username}`);
        return {
          error: "User not found"
        };
      }

      console.log(`User found: ${user.username}`);
      console.log(`Stored hash: ${user.password}`);
      console.log(`Provided password: ${password}`);
      
      // Direct bcrypt compare instead of using entity method
      const valid = await bcrypt.compare(password, user.password);
      console.log(`Password validation result: ${valid}`);
      
      if (!valid) {
        console.log(`Invalid password for user: ${username}`);
        return {
          error: "Invalid password"
        };
      }

      console.log(`Password valid for user: ${username}, creating token`);
      
      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1d" }
      );

      console.log(`Token created for user: ${username}`);
      
      // Remove password from response using object destructuring
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        error: `Error during login: ${error.message}`
      };
    }
  }

  @Mutation(() => UserResponse)
  async createUser(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("firstName", { nullable: true }) firstName?: string,
    @Arg("lastName", { nullable: true }) lastName?: string,
    @Arg("phoneNumber", { nullable: true }) phoneNumber?: string,
    @Arg("role", () => UserRole, { defaultValue: UserRole.USER }) role?: UserRole
  ): Promise<UserResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { username },
          { email }
        ]
      });

      if (existingUser) {
        return {
          error: "User with this username or email already exists"
        };
      }

      const user = this.userRepository.create({
        username,
        email,
        password, // Entity will handle hashing
        firstName,
        lastName,
        phoneNumber,
        role
      });

      await this.userRepository.save(user);
      return { user };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        error: "Error creating user"
      };
    }
  }

  @Mutation(() => UserResponse)
  async updateUser(
    @Arg("id") id: string,
    @Arg("firstName", { nullable: true }) firstName?: string,
    @Arg("lastName", { nullable: true }) lastName?: string,
    @Arg("phoneNumber", { nullable: true }) phoneNumber?: string,
    @Arg("isActive", { nullable: true }) isActive?: boolean
  ): Promise<UserResponse> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      
      if (!user) {
        return {
          error: "User not found"
        };
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (isActive !== undefined) user.isActive = isActive;

      await this.userRepository.save(user);
      return { user };
    } catch (error) {
      return {
        error: "Error updating user"
      };
    }
  }

  @Mutation(() => Boolean)
  async deleteUser(@Arg("id") id: string): Promise<boolean> {
    try {
      const result = await this.userRepository.delete(id);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      return false;
    }
  }

  @Query(() => Boolean)
  async testPassword(
    @Arg("password") password: string
  ): Promise<boolean> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      console.log(`Original password: ${password}`);
      console.log(`Hashed password: ${hash}`);
      
      const valid = await bcrypt.compare(password, hash);
      console.log(`Password comparison result: ${valid}`);
      
      return valid;
    } catch (error) {
      console.error("Password test error:", error);
      return false;
    }
  }
} 