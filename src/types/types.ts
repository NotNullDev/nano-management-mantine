import { string, z } from "zod";

export const TagSchema = z.object({
  id: string().optional(),
  name: string().min(1).max(255),
});

export const TeamSchema = z.object({
  id: string().optional(),
  name: string().min(1).max(255),
  tags: z.array(TagSchema),
});

export const ProjectSchema = z.object({
  id: string().optional(),
  name: string().min(1).max(255),
  tags: z.array(TagSchema),
});

export const OrganizationSchema = z.object({
  id: string().optional(),
  name: string().min(1).max(255),
  tags: z.array(TagSchema),
});

export const ActivitySchema = z.object({
  id: string().optional(),
  name: string().min(1).max(255),
  duration: z.number(),
  team: TeamSchema.optional(),
  project: ProjectSchema.optional(),
  organization: OrganizationSchema.optional(),
});

export const UserRoleSchema = z.object({
  id: string().optional(),
  name: string().min(1).max(255),
});

export const UserSchema = z.object({
  id: string().optional(),
  username: string().min(1).max(255),
  email: string().email(),
  name: string().min(1).max(255),
  avatar: string().min(1).max(255),
  roles: z.array(UserRoleSchema),
  teams: z.array(TeamSchema),
});

export const TaskSchema = z.object({
  id: string().optional(),
  activity: ActivitySchema,
  comment: string().min(1).max(255),
  duration: z.number(),
  date: string().min(1).max(255),
  user: UserSchema,
});

export type Tag = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  tags: Tag[];
};

export type Project = {
  id: string;
  name: string;
  tags: Tag[];
};

export type Organization = {
  id: string;
  name: string;
  tags: Tag[];
};

export type Activity = {
  id: string | null;
  name: string;
  duration: number;
  team?: Team;
  project?: Project;
  organization?: Organization;
};

export type UserRole = {
  id: string | null;
  name: string;
};

export type User = {
  id: string | null;
  username: string;
  email: string;
  name: string;
  avatar: string;
  roles: UserRole[];
  teams: Team[];
};

export type Task = {
  id: string | null;
  activity: Activity;
  comment: string;
  duration: number;
  date: string;
  user: User;
};
