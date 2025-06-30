const Slot = require('../models/Slot');

function timeStringToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}
function minutesToTimeString(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Create slots (generate from start/end/duration)
exports.createSlots = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, duration, fees } = req.body;
    if (!doctorId || !date || !startTime || !endTime || !duration) {
      return res.status(400).json({ error: 'doctorId, date, startTime, endTime, and duration are required' });
    }
    const start = timeStringToMinutes(startTime);
    const end = timeStringToMinutes(endTime);
    const durationMin = Number(duration);
    let t = start;
    let slotDocs = [];
    while (t + durationMin <= end) {
      slotDocs.push({
        doctorId,
        date,
        startTime: minutesToTimeString(t),
        endTime: minutesToTimeString(t + durationMin),
        duration: durationMin,
        fees,
        status: 'available'
      });
      t = t + durationMin;
    }
    const created = await Slot.insertMany(slotDocs);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all slots for a doctor (optionally by date)
exports.getSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    const query = { doctorId };
    if (date) query.date = date;
    const slots = await Slot.find(query).sort({ date: 1, startTime: 1 });
    res.json({
      total: slots.length,
      slots
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a slot (e.g., mark as booked/cancelled)
exports.updateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const updated = await Slot.findByIdAndUpdate(slotId, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a slot
exports.deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    await Slot.findByIdAndDelete(slotId);
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 