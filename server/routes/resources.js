const router = require('express').Router();
const Resource = require('../models/Resource');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { type, department, search } = req.query;
    let query = {};
    if (type && type !== 'all') query.type = type;
    if (department && department !== 'all') query.department = department;
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { subject: { $regex: search, $options: 'i' } }];
    const resources = await Resource.find(query).populate('uploadedBy', 'name department').sort({ createdAt: -1 });
    res.json({ resources });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const resource = await Resource.create({ ...req.body, uploadedBy: req.user._id });
    await resource.populate('uploadedBy', 'name department');
    res.status(201).json({ resource });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/download', protect, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    res.json({ downloads: resource.downloads });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, authorize('faculty', 'admin'), async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
