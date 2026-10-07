const router = require('express').Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    const events = await Event.find(query).populate('createdBy', 'name').sort({ date: 1 });
    res.json({ events });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ event });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const alreadyRegistered = event.registrations.includes(req.user._id);
    if (alreadyRegistered) {
      event.registrations = event.registrations.filter(id => id.toString() !== req.user._id.toString());
    } else {
      if (event.registrations.length >= event.maxParticipants) return res.status(400).json({ message: 'Event is full' });
      event.registrations.push(req.user._id);
    }
    await event.save();
    res.json({ registered: !alreadyRegistered, count: event.registrations.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ event });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
