import {string, z} from "zod";

// zod schemas

export const TagSchema = z.object({
    id: string().optional(),
    name: string().min(1).max(255),
});

export const TeamSchema = z.object({
    id: string().optional(),
    name: string().min(1).max(255),
    project: string(),
    tags: z.string().array(),
    members: z.string().array(),
    managers: z.string().array(),
});

export const ProjectSchema = z.object({
    id: string().optional(),
    name: string().min(1).max(255),
    organization: string(),
    tags: z.string().array(),
});

export const OrganizationSchema = z.object({
    id: string().optional(),
    name: string().min(1).max(255),
    tags: z.string().array(),
});

export const ActivitySchema = z.object({
    id: string().optional(),
    name: string().min(1).max(255),
    team: string(),
    project: string(),
    organization: string(),
});

export const UserRoleSchema = z.object({
    id: string().optional(),
    name: string().min(1).max(255),
});

export const UserSchema = z.object({
    id: string().optional(),
    username: string().min(1).max(255),
    email: string().email().optional(),
    name: string().min(1).max(255),
    avatar: string().min(0).max(255),
    roles: z.array(string()),
    webSettings: z.string().nullable(),
});

export const TaskStatusOptions = ["accepted", "rejected", "none"] as const;
export type TaskStatus = typeof TaskStatusOptions[number];
export const TaskStatusSchema = z.enum(TaskStatusOptions);

export const TaskSchema = z.object({
    id: string().optional(),
    activity: string(),
    comment: string().min(0).max(255),
    duration: z.number(),
    date: string().min(1).max(255),
    user: string(),
    team: string(),
    status: TaskStatusSchema
});

export const DashboardSummarySchema = z.object({
    teamName: z.string(),
    tasksSum: z.number(),
    date: z.string(),
});

export const TasksHistorySchema = z.object({
    taskId: z.string(),
    taskDate: z.string(),
    taskDuration: z.number(),
    taskStatus: z.string(),
    taskComment: z.string(),

    activityId: z.string(),
    activityName: z.string(),

    teamId: z.string(),
    teamName: z.string(),

    projectId: z.string(),
    projectName: z.string(),

    userId: z.string(),
    userName: z.string(),
    userEmail: z.string()
})

// inferred types

export type Tag = z.infer<typeof TagSchema>;

export type Team = z.infer<typeof TeamSchema>;

export type Project = z.infer<typeof ProjectSchema>;

export type Organization = z.infer<typeof OrganizationSchema>;

export type Activity = z.infer<typeof ActivitySchema>;

export type UserRole = z.infer<typeof UserRoleSchema>;

export type User = z.infer<typeof UserSchema>;

export type Task = z.infer<typeof TaskSchema>;

export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;

export type TasksHistory = z.infer<typeof TasksHistorySchema>

// optional types

export type TagOptional = Partial<Tag>;

export type TeamOptional = Partial<Team>;

export type ProjectOptional = Partial<Project>;

export type OrganizationOptional = Partial<Organization>;

export type ActivityOptional = Partial<Activity>;

export type UserRoleOptional = Partial<UserRole>;

export type UserOptional = Partial<User>;

export type TaskOptional = Partial<Task>;

export type DashboardSummaryOptional = Partial<DashboardSummary>;

export type TasksHistoryOptional = Partial<TasksHistory>;
