const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, headline } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email and password are required');
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    const cleanPhone = phone ? phone.trim() : '';

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: cleanPhone,
      headline: headline ? headline.trim() : '',
      lastLogin: new Date(),
    });

    res.status(201).json({ token: sign(user._id), user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    if (!user.isActive) {
      res.status(403);
      throw new Error('Account is deactivated. Please contact an administrator.');
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    res.json({ token: sign(user._id), user });
  } catch (err) {
    next(err);
  }
};

exports.me = (req, res) => res.json({ user: req.user });
