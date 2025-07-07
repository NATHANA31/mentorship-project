import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import RequestModel from '../models/Request';

const router = express.Router();

// Signup route
router.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'mentor', 'mentee']).withMessage('Role is required'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const { name, email, password, role, adminKey } = req.body;
  // Admin key validation
  if (role === 'admin') {
    const ADMIN_SIGNUP_KEY = process.env.ADMIN_SIGNUP_KEY;
    if (!adminKey || adminKey !== ADMIN_SIGNUP_KEY) {
      res.status(400).json({ errors: [{ msg: 'Invalid admin key' }] });
      return;
    }
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.status(201).json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      return;
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Middleware to verify JWT and attach user to req
function authMiddleware(req: Request, res: Response, next: Function): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ errors: [{ msg: 'No token, authorization denied' }] });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ errors: [{ msg: 'Token is not valid' }] });
    return;
  }
}

// Middleware to check if user is admin
function adminOnlyMiddleware(req: Request, res: Response, next: Function): void {
  if (!(req as any).user || (req as any).user.role !== 'admin') {
    res.status(403).json({ errors: [{ msg: 'Admin access required' }] });
    return;
  }
  next();
}

// Get current user's profile
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ errors: [{ msg: 'User not found' }] });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Update current user's profile
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, age, bio, skills, goals, favoriteQuote, availability } = req.body;
    const update: any = {};
    if (name !== undefined) update.name = name;
    if (age !== undefined) update.age = age;
    if (bio !== undefined) update.bio = bio;
    if (skills !== undefined) update.skills = skills;
    if (goals !== undefined) update.goals = goals;
    if (favoriteQuote !== undefined) update.favoriteQuote = favoriteQuote;
    if (availability !== undefined) update.availability = availability;
    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ errors: [{ msg: 'User not found' }] });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Get all mentors, with optional filtering by skill and name
router.get('/mentors', async (req: Request, res: Response) => {
  try {
    const { skill, name } = req.query;
    const filter: any = { role: 'mentor' };
    if (skill) {
      filter.skills = skill;
    }
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    const mentors = await User.find(filter).select('-password');
    res.json(mentors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Mentee sends mentorship request to mentor
router.post('/requests', authMiddleware, async (req: Request, res: Response) => {
  try {
    const menteeId = (req as any).user.userId;
    const { mentorId, message } = req.body;
    // Prevent duplicate pending requests
    const existing = await RequestModel.findOne({ mentee: menteeId, mentor: mentorId, status: 'pending' });
    if (existing) {
      res.status(400).json({ errors: [{ msg: 'Request already sent and pending.' }] });
      return;
    }
    // Prevent duplicate accepted mentee
    const alreadyMentee = await RequestModel.findOne({ mentee: menteeId, mentor: mentorId, status: 'accepted' });
    if (alreadyMentee) {
      res.status(400).json({ errors: [{ msg: 'You are already a mentee of this mentor.' }] });
      return;
    }
    const request = new RequestModel({ mentee: menteeId, mentor: mentorId, message });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Mentor views requests sent to them
router.get('/requests/mentor', authMiddleware, async (req: Request, res: Response) => {
  try {
    const mentorId = (req as any).user.userId;
    const requests = await RequestModel.find({ mentor: mentorId })
      .populate('mentee', 'name email bio skills')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Mentor accepts a request
router.put('/requests/:id/accept', authMiddleware, async (req: Request, res: Response) => {
  try {
    const mentorId = (req as any).user.userId;
    const request = await RequestModel.findOneAndUpdate(
      { _id: req.params.id, mentor: mentorId },
      { status: 'accepted' },
      { new: true }
    );
    if (!request) {
      res.status(404).json({ errors: [{ msg: 'Request not found' }] });
      return;
    }
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Mentor rejects a request
router.put('/requests/:id/reject', authMiddleware, async (req: Request, res: Response) => {
  try {
    const mentorId = (req as any).user.userId;
    const request = await RequestModel.findOneAndUpdate(
      { _id: req.params.id, mentor: mentorId },
      { status: 'rejected' },
      { new: true }
    );
    if (!request) {
      res.status(404).json({ errors: [{ msg: 'Request not found' }] });
      return;
    }
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Mentor views all accepted mentees
router.get('/mentees', authMiddleware, async (req: Request, res: Response) => {
  try {
    const mentorId = (req as any).user.userId;
    const acceptedRequests = await RequestModel.find({ mentor: mentorId, status: 'accepted' })
      .populate('mentee', 'name email bio skills goals favoriteQuote')
      .sort({ createdAt: -1 });
    const mentees = acceptedRequests.map(r => r.mentee);
    res.json(mentees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Admin: Get all mentees
router.get('/all-mentees', authMiddleware, adminOnlyMiddleware, async (req: Request, res: Response) => {
  try {
    const mentees = await User.find({ role: 'mentee' }).select('-password');
    res.json(mentees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Admin: Get site statistics (number of mentors, mentees, total users)
router.get('/site-stats', authMiddleware, adminOnlyMiddleware, async (req: Request, res: Response) => {
  try {
    const mentorCount = await User.countDocuments({ role: 'mentor' });
    const menteeCount = await User.countDocuments({ role: 'mentee' });
    const totalCount = await User.countDocuments({});
    res.json({ mentorCount, menteeCount, totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

export default router; 