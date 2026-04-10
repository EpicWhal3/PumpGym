import { UserRole } from "../enums/user-roles.enum";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}
