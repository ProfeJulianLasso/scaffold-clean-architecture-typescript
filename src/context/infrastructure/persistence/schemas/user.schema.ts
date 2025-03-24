import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Esquema de MongoDB para el modelo de usuario
 */
@Schema({
  collection: 'users',
  timestamps: true,
  versionKey: false,
})
export class UserSchema extends Document {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Boolean, required: true, default: true })
  active: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchemaFactory = SchemaFactory.createForClass(UserSchema);
