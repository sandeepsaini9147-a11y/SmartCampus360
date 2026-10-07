const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, year, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role: role || 'student', department, year, phone });
    res.status(201).json({ token: genToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: genToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Me
router.get('/me', protect, (req, res) => res.json({ user: req.user }));

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, department, year, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, department, year, phone }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
