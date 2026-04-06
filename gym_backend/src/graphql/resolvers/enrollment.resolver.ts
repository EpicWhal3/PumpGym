import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { EnrollmentType } from "../types/enrollment.type";
import { CreateEnrollmentInput } from "../inputs";
import { EnrollmentService } from "../../modules/enrollments/enrollment.service";

@Resolver(() => EnrollmentType)
export class EnrollmentResolver {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Query(() => [EnrollmentType], {
    name: "enrollments",
    description: "Получить записи на занятия",
  })
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
  async getEnrollment(@Args("id", { type: () => ID }) id: string) {
    return this.enrollmentService.findOne(id);
  }

  @Mutation(() => EnrollmentType, {
    name: "enrollUser",
    description: "Записаться на занятие",
  })
  async enrollUser(@Args("input") input: CreateEnrollmentInput) {
    return this.enrollmentService.enrollUser(input);
  }

  @Mutation(() => Boolean, {
    name: "cancelEnrollment",
    description: "Отменить запись на занятие",
  })
  async cancelEnrollment(
    @Args("enrollmentId", { type: () => ID }) enrollmentId: string,
    @Args("userId", { type: () => ID }) userId: string,
  ): Promise<boolean> {
    await this.enrollmentService.cancelEnrollment(userId, enrollmentId);
    return true;
  }
}
