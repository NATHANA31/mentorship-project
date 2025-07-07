import express, { Request, Response } from 'express';
import RequestModel from '../models/Request';
import User from '../models/User';
import mongoose from 'mongoose';
const router = express.Router();

// GET /api/mentees/:menteeId/mentors - Get all accepted mentors for a mentee
router.get('/mentees/:menteeId/mentors', async (req: Request, res: Response): Promise<void> => {
  try {
    let { menteeId } = req.params;
    // Remove any extra quotes
    if (menteeId.startsWith("'") && menteeId.endsWith("'")) {
      menteeId = menteeId.slice(1, -1);
    }
    console.log('Received menteeId:', menteeId);
    const requests = await RequestModel.find({
      mentee: new mongoose.Types.ObjectId(menteeId),
      status: 'accepted'
    }).populate('mentor');
    console.log('Found requests:', requests);
    const mentors = requests.map(r => r.mentor);
    res.json(mentors);
  } catch (err) {
    console.error('Error fetching mentors for mentee:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// GET /api/mentors/:mentorId/availability - Get a mentor's availability
router.get('/mentors/:mentorId/availability', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mentorId } = req.params;
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      res.status(404).json({ errors: [{ msg: 'Mentor not found' }] });
      return;
    }
    res.json(mentor.availability || {});
  } catch (err) {
    console.error('Error fetching mentor availability:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// POST /api/sessions - Book a session with a mentor
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mentorId, menteeId, date, time } = req.body;
    // Validate input
    if (!mentorId || !menteeId || !date || !time) {
      res.status(400).json({ errors: [{ msg: 'All fields are required.' }] });
      return;
    }
    // Check mentor exists and is a mentor
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      res.status(404).json({ errors: [{ msg: 'Mentor not found.' }] });
      return;
    }
    // Check mentee exists
    const mentee = await User.findById(menteeId);
    if (!mentee || mentee.role !== 'mentee') {
      res.status(404).json({ errors: [{ msg: 'Mentee not found.' }] });
      return;
    }
    // Check mentor has accepted this mentee
    const acceptedRequest = await RequestModel.findOne({ mentor: mentorId, mentee: menteeId, status: 'accepted' });
    if (!acceptedRequest) {
      res.status(403).json({ errors: [{ msg: 'Mentor has not accepted this mentee.' }] });
      return;
    }
    // Check if requested date/time is within mentor's availability
    const availability = mentor.availability;
    if (!availability) {
      res.status(400).json({ errors: [{ msg: 'Mentor has not set availability.' }] });
      return;
    }
    const requestedDate = new Date(date);
    const requestedDay = requestedDate.toLocaleString('en-US', { weekday: 'long' });
    if (!availability.days.includes(requestedDay)) {
      res.status(400).json({ errors: [{ msg: 'Requested day is not in mentor availability.' }] });
      return;
    }
    // Check time is within startTime and endTime
    const [reqHour, reqMin] = time.split(':').map(Number);
    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);
    const reqMinutes = reqHour * 60 + reqMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    if (reqMinutes < startMinutes || reqMinutes > endMinutes) {
      res.status(400).json({ errors: [{ msg: 'Requested time is outside mentor availability.' }] });
      return;
    }
    // (Optional) Check for conflicting sessions
    const Session = require('../models/Session').default;
    const conflict = await Session.findOne({ mentor: mentorId, date: requestedDate, time });
    if (conflict) {
      res.status(409).json({ errors: [{ msg: 'Mentor already has a session at this time.' }] });
      return;
    }
    // Create session
    const newSession = new Session({ mentor: mentorId, mentee: menteeId, date: requestedDate, time, status: 'pending' });
    await newSession.save();
    res.status(201).json(newSession);
  } catch (err) {
    console.error('Error booking session:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// GET /api/sessions - Get all sessions (with optional filters)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mentorId, menteeId, status } = req.query;
    const filter: any = {};
    
    if (mentorId) filter.mentor = mentorId;
    if (menteeId) filter.mentee = menteeId;
    if (status) filter.status = status;
    
    const Session = require('../models/Session').default;
    const sessions = await Session.find(filter)
      .populate('mentor', 'name email')
      .populate('mentee', 'name email')
      .sort({ date: 1, time: 1 });
    
    res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// GET /api/sessions/:id - Get a specific session
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const Session = require('../models/Session').default;
    const session = await Session.findById(id)
      .populate('mentor', 'name email availability')
      .populate('mentee', 'name email');
    
    if (!session) {
      res.status(404).json({ errors: [{ msg: 'Session not found' }] });
      return;
    }
    
    res.json(session);
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// PUT /api/sessions/:id - Update session status
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      res.status(400).json({ errors: [{ msg: 'Valid status is required' }] });
      return;
    }
    
    const Session = require('../models/Session').default;
    const session = await Session.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('mentor', 'name email').populate('mentee', 'name email');
    
    if (!session) {
      res.status(404).json({ errors: [{ msg: 'Session not found' }] });
      return;
    }
    
    res.json(session);
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// DELETE /api/sessions/:id - Delete a session
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const Session = require('../models/Session').default;
    const session = await Session.findByIdAndDelete(id);
    
    if (!session) {
      res.status(404).json({ errors: [{ msg: 'Session not found' }] });
      return;
    }
    
    res.json({ msg: 'Session deleted successfully' });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Session routes are under construction.
export default router; 