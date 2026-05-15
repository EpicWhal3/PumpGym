import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { EnrollmentType } from "../types/enrollment.type";
import { CreateEnrollmentInput } from "../inputs";
import { EnrollmentService } from "../../modules/enrollments/enrollment.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "../../common/enums/user-roles.enum";
import { type AuthenticatedUser } from "../../common/interfaces/authenticated-user.interface";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Resolver(() => EnrollmentType)
export class EnrollmentResolver {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Query(() => [EnrollmentType], {
    name: "enrollments",
    description: "Получить записи на занятия",
  })
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.USER)
  async getEnrollments(
    @Args("userId", { type: () => ID, nullable: true }) userId?: string,
    @Args("entryId", { type: () => ID, nullable: true }) entryId?: string,
  ) {
    if (userId) {
      return this.enrollmentService.findByUser(userId);
    }
    if (entryId) {
      return this.enrollmentService.findByTimetableEntry(entryId);
    }
    return this.enrollmentService.findAll();
  }

  @Query(() => EnrollmentType, {
    name: "enrollment",
    description: "Получить запись по ID",
  })
  @Roles(UserRole.ADMIN, UserRole.TRAINER, UserRole.USER)
  async getEnrollment(@Args("id", { type: () => ID }) id: string) {
    return this.enrollmentService.findOne(id);
  }

  @Mutation(() => EnrollmentType, {
    name: "enrollUser",
    description: "Записаться на занятие",
  })
  @Roles(UserRole.USER, UserRole.TRAINER)
  async enrollUser(
    @Args("input") input: CreateEnrollmentInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.enrollmentService.enrollUser(input, currentUser);
  }

  @Mutation(() => Boolean, {
    name: "cancelEnrollment",
    description: "Отменить запись на занятие",
  })
  @Roles(UserRole.USER, UserRole.ADMIN)
  async cancelEnrollment(
    @Args("enrollmentId", { type: () => ID }) enrollmentId: string,
    @Args("userId", { type: () => ID }) userId: string,
  ): Promise<boolean> {
    await this.enrollmentService.cancelEnrollment(userId, enrollmentId);
    return true;
  }
}
