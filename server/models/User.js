import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator(value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Please enter a valid email address.",
      },
    },
    /// organize data based on your schools
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      required: true,
      default: 'student',
    },
    avatar: { type: String, default: '' },
    phone: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator(value) {
          return value === "" || /^[6-9]\d{9}$/.test(value);
        },
        message: "Please enter a valid 10-digit phone number.",
      },
    },
    isActive: { type: Boolean, default: true },

    // Teacher-specific
    employeeId: { type: String, default: '' },
    department: { type: String, default: '' },
    subjects: [{ type: String }],

    // Student-specific
    rollNumber: { type: String, default: '' },
    classRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom' },
    guardianName: { type: String, default: '' },
    guardianPhone: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator(value) {
          return value === "" || /^[6-9]\d{9}$/.test(value);
        },
        message: "Please enter a valid guardian phone number.",
      },
    },
  },



  { timestamps: true }
);

userSchema.index({ school: 1, role: 1 });


// Hash password before save when modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};



const User = mongoose.model('User', userSchema);
export default User;
