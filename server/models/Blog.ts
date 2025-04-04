import mongoose from 'mongoose';
import { Blog } from '@shared/schema';

const blogSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: String, default: null },
  userId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const BlogModel = mongoose.model<Blog>('Blog', blogSchema);