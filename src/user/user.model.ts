import * as mongoose from 'mongoose';
import User from './user.interface';

const addressSchema = new mongoose.Schema({
  city: String,
  country: String,
  street: String,
});

const userSchema = new mongoose.Schema(
  {
    address: addressSchema,
    email: String,
    firstName: String,
    lastName: String,
    password: String,
  },
  {
    toJSON: { virtuals: true },
  },
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const userModel = mongoose.model<User & mongoose.Document>('User', userSchema);

export default userModel;
