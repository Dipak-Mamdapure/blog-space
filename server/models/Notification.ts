import mongoose from 'mongoose';
import { Notification } from '@shared/schema';

const notificationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  message: { type: String, required: true },
  blogId: { type: Number, default: null },
  userId: { type: Number, default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const NotificationModel = mongoose.model<Notification>('Notification', notificationSchema);