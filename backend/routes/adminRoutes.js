import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin-only
router.use(verifyJWT, authorizeRoles('admin'));

// GET /api/admin/users — list users with optional search and role filter
router.get('/users', async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role && ['student', 'instructor', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { fullName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users/:userId — get single user
router.get('/users/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:userId — update user
router.put('/users/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const { fullName, email, role, department, course, semester, phone, isActive } = req.body;

    const update = {};
    if (fullName !== undefined) update.fullName = fullName;
    if (email !== undefined) update.email = email;
    if (role !== undefined) {
      if (!['student', 'instructor', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be student, instructor, or admin.' });
      }
      update.role = role;
    }
    if (department !== undefined) update.department = department;
    if (course !== undefined) update.course = course;
    if (semester !== undefined) update.semester = semester;
    if (phone !== undefined) update.phone = phone;
    if (isActive !== undefined) update.isActive = isActive;

    const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:userId/status — toggle active/inactive
router.patch('/users/:userId/status', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const { active } = req.body;
    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: '"active" must be a boolean.' });
    }

    const user = await User.findByIdAndUpdate(userId, { isActive: active }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: `User ${active ? 'activated' : 'deactivated'} successfully.`, user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:userId — delete user (cannot delete self)
router.delete('/users/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
