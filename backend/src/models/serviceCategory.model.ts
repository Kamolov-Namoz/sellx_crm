import mongoose, { Schema, Document } from 'mongoose';

// Xizmat (Service) interfeysi
export interface IService {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

// Soha (Category) interfeysi
export interface IServiceCategory extends Document {
  name: string;
  description?: string;
  icon?: string;
  services: IService[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const serviceCategorySchema = new Schema<IServiceCategory>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String }, // emoji yoki icon nomi
    services: [serviceSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceCategorySchema.index({ name: 1 });
serviceCategorySchema.index({ isActive: 1 });

export const ServiceCategory = mongoose.model<IServiceCategory>('ServiceCategory', serviceCategorySchema);
