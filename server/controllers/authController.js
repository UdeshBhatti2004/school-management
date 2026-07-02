import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import School from '../models/School.js';
import generateToken from '../utils/generateToken.js';
import mongoose from 'mongoose';


const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone,
  employeeId: user.employeeId,
  department: user.department,
  subjects: user.subjects,
  rollNumber: user.rollNumber,
  classRoom: user.classRoom,
    school: user.school,   
});


// @route POST /api/auth/register

/// Used tranasacation so that if any of the operation fails, the whole operation will be 
///rolled back and no data will be saved in the database.


// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { school, admin } = req.body;

    // Validate request body
    if (
      !school?.name ||
      !school?.email ||
      !school?.phone ||
      !school?.address ||
      !admin?.name ||
      !admin?.email ||
      !admin?.password
    ) {
      res.status(400);
      throw new Error("Please fill all required fields.");
    }

    // Check if school already exists
    const schoolExists = await School.findOne({
      email: school.email.toLowerCase(),
    });

    if (schoolExists) {
      res.status(400);
      throw new Error("A school with this email already exists.");
    }

    // Check if admin already exists
    const adminExists = await User.findOne({
      email: admin.email.toLowerCase(),
    });

    if (adminExists) {
      res.status(400);
      throw new Error("An admin with this email already exists.");
    }

    // Create School
    const [newSchool] = await School.create(
      [
        {
          name: school.name,
          email: school.email.toLowerCase(),
          phone: school.phone,
          address: school.address,
        },
      ],
      { session }
    );

    // Create First Admin
    const [newAdmin] = await User.create(
      [
        {
          name: admin.name,
          email: admin.email.toLowerCase(),
          password: admin.password,
          role: "admin",
          school: newSchool._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      message: "School registered successfully.",
      user: sanitize(newAdmin),
      token: generateToken(newAdmin._id),
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});


// @route  POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide an email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact the administrator.');
  }

  res.json({ user: sanitize(user), token: generateToken(user._id) });
});

// @route  GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('classRoom', 'name section');
  res.json(sanitize(user));
});

// @route  PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, avatar } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  res.json(sanitize(user));
});

// @route  PUT /api/auth/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

if (currentPassword === newPassword) {
  res.status(400);
  throw new Error("New password must be different from the current password.");
}

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
  res.status(400);
  throw new Error("Current password is incorrect");
}
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});
