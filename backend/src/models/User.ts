import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'mentor' | 'mentee';
  age?: number;
  bio?: string;
  skills?: string[];
  goals?: string;
  favoriteQuote?: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'mentor', 'mentee'], required: true },
  age: { type: Number },
  bio: { type: String },
  skills: { type: [String] },
  goals: { type: String },
  favoriteQuote: { type: String },
  availability: {
    days: { type: [String], default: [] },
    startTime: { type: String },
    endTime: { type: String },
  },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema); 