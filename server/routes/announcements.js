const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isActive: true, $or: [{ targetAudience: 'all' }, { targetAudience: req.user.role }] };
    if (category && category !== 'all') query.category = category;
    const announcements = await Announcement.find(query).populate('createdBy', 'name role').sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, createdBy: req.user._id });
    await announcement.populate('createdBy', 'name role');
    res.status(201).json({ announcement });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ announcement });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
