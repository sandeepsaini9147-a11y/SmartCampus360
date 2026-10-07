const router = require('express').Router();
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');

// Get complaints
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.submittedBy = req.user._id;
    const { status, category } = req.query;
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email department')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create complaint
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const complaint = await Complaint.create({ title, description, category, priority, submittedBy: req.user._id });
    await complaint.populate('submittedBy', 'name email');
    res.status(201).json({ complaint });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update complaint status (faculty/admin)
router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { status, response, assignedTo } = req.body;
    const update = { status, response };
    if (assignedTo) update.assignedTo = assignedTo;
    if (status === 'resolved') update.resolvedAt = new Date();
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email');
    res.json({ complaint });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete complaint
router.delete('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (complaint.submittedBy.toString() !== req.user._id.toString() && req.user.role === 'student')
      return res.status(403).json({ message: 'Not authorized' });
    await complaint.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
