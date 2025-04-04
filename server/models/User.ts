import mongoose from 'mongoose';
import { User } from '@shared/schema';

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export const UserModel = mongoose.model<User>('User', userSchema);