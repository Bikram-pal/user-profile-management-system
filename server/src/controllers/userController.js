const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const EDITABLE = ['name', 'phone', 'headline', 'bio', 'dob', 'address', 'socialLinks'];

exports.getProfile = (req, res) => res.json({ user: req.user });

exports.updateProfile = async (req, res, next) => {
  try {
    EDITABLE.forEach((f) => {
      if (req.body[f] !== undefined) req.user[f] = req.body[f];
    });

    if (req.body.phone !== undefined) {
      req.user.phone = req.body.phone ? req.body.phone.trim() : '';
    }

    if (req.body.headline !== undefined) {
      req.user.headline = req.body.headline ? req.body.headline.trim() : '';
    }

    if (req.body.dob === '' || req.body.dob === null) {
      req.user.dob = null;
    }

    // Merge social links if provided
    if (req.body.socialLinks && typeof req.body.socialLinks === 'object') {
      req.user.socialLinks = {
        github: req.body.socialLinks.github ? req.body.socialLinks.github.trim() : '',
        linkedin: req.body.socialLinks.linkedin ? req.body.socialLinks.linkedin.trim() : '',
        twitter: req.body.socialLinks.twitter ? req.body.socialLinks.twitter.trim() : '',
        website: req.body.socialLinks.website ? req.body.socialLinks.website.trim() : '',
      };
    }

    // Merge address if provided
    if (req.body.address && typeof req.body.address === 'object') {
      req.user.address = {
        city: req.body.address.city ? req.body.address.city.trim() : '',
        state: req.body.address.state ? req.body.address.state.trim() : '',
        country: req.body.address.country ? req.body.address.country.trim() : '',
      };
    }

    await req.user.save();
    res.json({ user: req.user, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword) {
      res.status(400);
      throw new Error('Current password is required');
    }
    if (!newPassword || newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No image file uploaded');
    }

    // Delete previous avatar file if exists
    if (req.user.avatar) {
      const oldPath = path.join(__dirname, '../../', req.user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
    }

    req.user.avatar = `uploads/${req.file.filename}`;
    await req.user.save();
    res.json({ user: req.user, message: 'Avatar updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.removeAvatar = async (req, res, next) => {
  try {
    if (req.user.avatar) {
      const oldPath = path.join(__dirname, '../../', req.user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
      req.user.avatar = '';
      await req.user.save();
    }
    res.json({ user: req.user, message: 'Avatar removed successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    if (req.user.avatar) {
      const oldPath = path.join(__dirname, '../../', req.user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
    }

    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/* ---------- Admin Controllers ---------- */

exports.getStats = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, active, admins, newUsers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    res.json({
      total,
      active,
      deactivated: total - active,
      admins,
      regularUsers: total - admins,
      newThisWeek: newUsers,
    });
  } catch (err) {
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const q = (req.query.search || '').trim();
    const role = (req.query.role || '').trim();
    const status = (req.query.status || '').trim();
    const sortBy = (req.query.sort || 'newest').trim();

    const filter = {};

    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { phone: new RegExp(q, 'i') },
      ];
    }

    if (role && ['admin', 'user'].includes(role)) {
      filter.role = role;
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'disabled') {
      filter.isActive = false;
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'oldest') sortOption = { createdAt: 1 };
    if (sortBy === 'name') sortOption = { name: 1 };

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (req.body.role) {
      if (!['user', 'admin'].includes(req.body.role)) {
        res.status(400);
        throw new Error('Invalid role specified');
      }
      user.role = req.body.role;
    }

    if (req.body.isActive !== undefined) {
      user.isActive = Boolean(req.body.isActive);
    }

    await user.save();
    res.json({ user, message: 'User updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteUserByAdmin = async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id)) {
      res.status(400);
      throw new Error('Administrators cannot delete their own account from here');
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.avatar) {
      const oldPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
