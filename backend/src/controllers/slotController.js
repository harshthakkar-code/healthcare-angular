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
    const { doctorId, date, startTime, endTime, duration, interval, fees, spaces = 1 } = req.body;
    if (!doctorId || !date || !startTime || !endTime || !duration) {
      return res.status(400).json({ error: 'doctorId, date, startTime, endTime, and duration are required' });
    }
    if (!fees || Number(fees) === 0) {
      return res.status(400).json({ error: 'Appointment fees must be greater than 0.' });
    }
    const start = timeStringToMinutes(startTime);
    const end = timeStringToMinutes(endTime);
    const durationMin = Number(duration);
    const intervalMin = Number(interval) || 0; // default to 0 if not provided
    let t = start;
    let slotDocs = [];
    let duplicateTimes = [];
    while (t + durationMin <= end) {
      const slotStartTime = minutesToTimeString(t);
      const slotEndTime = minutesToTimeString(t + durationMin);
      // Check for overlapping slot (same doctor, date, overlapping time)
      const overlapping = await Slot.findOne({
        doctorId,
        date: new Date(date),
        $or: [
          {
            startTime: { $lt: slotEndTime },
            endTime: { $gt: slotStartTime }
          }
        ]
      });
      if (overlapping) {
        duplicateTimes.push(slotStartTime + '-' + slotEndTime);
      } else {
        // Create spaceAssignments array
        const spaceAssignments = Array.from({ length: spaces }, (_, i) => ({
          spaceNumber: i + 1,
          userId: null,
          status: 'available'
        }));
        slotDocs.push({
          doctorId,
          date,
          startTime: slotStartTime,
          endTime: slotEndTime,
          duration: durationMin,
          fees,
          status: 'available',
          spaces,
          spaceAssignments
        });
      }
      t = t + durationMin + intervalMin; // add interval after each slot
    }
    if (duplicateTimes.length > 0) {
      return res.status(409).json({ error: `Slot overlaps with existing slot(s) at: ${duplicateTimes.join(', ')}. Please select a different time.` });
    }
    if (slotDocs.length === 0) {
      return res.status(400).json({ error: 'No new slots to create.' });
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