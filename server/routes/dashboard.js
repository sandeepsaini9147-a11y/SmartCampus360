const router = require('express').Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Resource = require('../models/Resource');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [totalUsers, totalStudents, totalFaculty, totalComplaints, pendingComplaints,
        resolvedComplaints, totalEvents, totalAnnouncements, totalResources] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'faculty' }),
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: 'pending' }),
        Complaint.countDocuments({ status: 'resolved' }),
        Event.countDocuments({ isActive: true }),
        Announcement.countDocuments({ isActive: true }),
        Resource.countDocuments(),
      ]);
      res.json({ totalUsers, totalStudents, totalFaculty, totalComplaints, pendingComplaints, resolvedComplaints, totalEvents, totalAnnouncements, totalResources });
    } else if (req.user.role === 'faculty') {
      const [myEvents, myAnnouncements, myResources, totalComplaints, pendingComplaints] = await Promise.all([
        Event.countDocuments({ createdBy: req.user._id }),
        Announcement.countDocuments({ createdBy: req.user._id }),
        Resource.countDocuments({ uploadedBy: req.user._id }),
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: 'pending' }),
      ]);
      res.json({ myEvents, myAnnouncements, myResources, totalComplaints, pendingComplaints });
    } else {
      const [myComplaints, pendingComplaints, resolvedComplaints, registeredEvents, upcomingEvents, totalResources] = await Promise.all([
        Complaint.countDocuments({ submittedBy: req.user._id }),
        Complaint.countDocuments({ submittedBy: req.user._id, status: 'pending' }),
        Complaint.countDocuments({ submittedBy: req.user._id, status: 'resolved' }),
        Event.countDocuments({ registrations: req.user._id }),
        Event.countDocuments({ isActive: true, date: { $gte: new Date() } }),
        Resource.countDocuments(),
      ]);
      res.json({ myComplaints, pendingComplaints, resolvedComplaints, registeredEvents, upcomingEvents, totalResources });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
