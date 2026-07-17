import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Verify token and attach user to request
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = await User.findById(decoded.id).populate("school");


if (!req.user || !req.user.isActive) {
  res.status(401);
  throw new Error("Account not found or deactivated");
}

const school = req.user.school;


if (!school) {
  res.status(404);
  throw new Error("School not found");
}

if (!school.isActive) {
  return res.status(403).json({
    code: "SCHOOL_DEACTIVATED",
    message: "Your school's account has been deactivated. Please contact Scholora.",
  });
}

if (
  school.subscription === "trial" &&
  school.trialEndsAt &&
  new Date() > school.trialEndsAt
) {
  return res.status(403).json({
    code: "TRIAL_EXPIRED",
    message: "Your school's trial period has expired. Please contact Scholora.",
  });
}
    next();
  } catch (error) {
  if (res.statusCode === 200) {
    res.status(401);
  }

  throw error;
}
});

// Restrict route to specific roles, e.g. authorize('admin', 'teacher')
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user.role}' is not permitted to access this resource`);
    }
    next();
  };
};
