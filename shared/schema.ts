import { z } from 'zod';

// Schema definitions for database models
export const userSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(50),
  password: z.string().min(6)
});

export const blogSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  tags: z.string().nullable().optional(),
  userId: z.number(),
  createdAt: z.date().or(z.string())
});

export const notificationSchema = z.object({
  id: z.number(),
  message: z.string(),
  blogId: z.number().nullable().optional(),
  userId: z.number().nullable().optional(),
  read: z.boolean(),
  createdAt: z.date().or(z.string())
});

export const insertUserSchema = userSchema.omit({ id: true });
export const insertBlogSchema = blogSchema.omit({ id: true, createdAt: true });
export const insertNotificationSchema = notificationSchema.omit({ id: true, read: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;

export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog = z.infer<typeof blogSchema>;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = z.infer<typeof notificationSchema>;