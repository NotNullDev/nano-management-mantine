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

// infered types

export type Tag = z.infer<typeof TagSchema>;

export type Team = z.infer<typeof TeamSchema>;

export type Project = z.infer<typeof ProjectSchema>;

export type Organization = z.infer<typeof OrganizationSchema>;

export type Activity = z.infer<typeof ActivitySchema>;

export type UserRole = z.infer<typeof UserRoleSchema>;

export type User = z.infer<typeof UserSchema>;

export type Task = z.infer<typeof TaskSchema>;

// optional types

export type TagOptional = Partial<Tag>;

export type TeamOptional = Partial<Team>;

export type ProjectOptional = Partial<Project>;

export type OrganizationOptional = Partial<Organization>;

export type ActivityOptional = Partial<Activity>;

export type UserRoleOptional = Partial<UserRole>;

export type UserOptional = Partial<User>;

export type TaskOptional = Partial<Task>;
