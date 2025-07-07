import mongoose, { Document, Schema } from 'mongoose';

export interface IRequest extends Document {
  mentee: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema: Schema = new Schema({
  mentee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  message: { type: String },
}, { timestamps: true });

export default mongoose.model<IRequest>('Request', RequestSchema); 