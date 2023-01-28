import {
  Activity,
  Organization,
  Project,
  Tag,
  Task,
  Team,
  User,
  UserRole,
} from "./types";

export type TagPartial = Partial<Tag>;

export type TeamPartial = Partial<Team>;

export type ProjectPartial = Partial<Project>;

export type OrganizationPartial = Partial<Organization>;

export type ActivityPartial = Partial<Activity>;

export type UserRolePartial = Partial<UserRole>;

export type UserPartial = Partial<User>;

export type TaskPartial = Partial<Task>;
