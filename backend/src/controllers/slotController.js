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
    const { doctorId, date, startTime, endTime, duration, interval, fees, spaces = 1, type = 'general', clinicName } = req.body;
    if (!doctorId || !date || !startTime || !endTime || !duration) {
      return res.status(400).json({ error: 'doctorId, date, startTime, endTime, and duration are required' });
    }
    if (!fees || Number(fees) === 0) {
      return res.status(400).json({ error: 'Appointment fees must be greater than 0.' });
    }
    const start = timeStringToMinutes(startTime);
    const end = timeStringToMinutes(endTime);
    const durationMin = Number(duration);
    // const intervalMin = Number(interval) || 0; // interval logic commented out
    // Only create a single slot from start to end
    const slotStartTime = minutesToTimeString(start);
    const slotEndTime = minutesToTimeString(end);
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
      return res.status(409).json({ error: `Slot Time overlaps with ${slotStartTime}-${slotEndTime}. Please select a different time.` });
    }
    // Create spaceAssignments array
    const spaceAssignments = Array.from({ length: spaces }, (_, i) => ({
      spaceNumber: i + 1,
      userId: null,
      status: 'available'
    }));
    const slotDoc = {
      doctorId,
      date,
      startTime: slotStartTime,
      endTime: slotEndTime,
      duration: durationMin,
      // interval: intervalMin, // commented out
      fees,
      status: 'available',
      spaces,
      remainingSpaces: spaces, // set on creation
      spaceAssignments,
      type,
      clinicName
    };
    const created = await Slot.create(slotDoc);
    // Fetch all slots for the doctor and date after creation
    const allSlots = await Slot.find({ doctorId, date: date }).sort({ startTime: 1 });
    res.status(201).json({ created, allSlots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all slots for a doctor (optionally by date and type)
exports.getSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, type } = req.query;
    const query = { doctorId };
    if (date) query.date = date;
    if (type) query.type = type;
    const slots = await Slot.find(query).sort({ date: 1, startTime: 1 });
    res.json({
      total: slots.length,
      slots
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a slot (e.g., mark as booked/cancelled, or change type)
exports.updateSlot = async (req, res) => {
  try {
    const slotId = req.body._id;
    console.log(slotId)
    const { doctorId, date, startTime, endTime, duration, /*interval,*/ fees, spaces = 1, type = 'general', clinicName } = req.body;
    if (!doctorId || !date || !startTime || !endTime || !duration) {
      return res.status(400).json({ error: 'doctorId, date, startTime, endTime, and duration are required' });
    }
    if (!fees || Number(fees) === 0) {
      return res.status(400).json({ error: 'Appointment fees must be greater than 0.' });
    }
    const slotStartTime = startTime;
    const slotEndTime = endTime;
    // Check for overlapping slot (exclude self)
    const overlapping = await Slot.findOne({
      doctorId,
      date: new Date(date),
      _id: { $ne: slotId },
      $or: [
        {
          startTime: { $lt: slotEndTime },
          endTime: { $gt: slotStartTime }
        }
      ]
    });
    if (overlapping) {
      return res.status(409).json({ error: `Slot Time overlaps with ${slotStartTime}-${slotEndTime}. Please select a different time.` });
    }
    // Update slot
    const prevSlot = await Slot.findById(slotId);
    let newRemainingSpaces = prevSlot.remainingSpaces;
    if (spaces !== undefined && spaces !== prevSlot.spaces) {
      // If spaces increased, add the difference to remainingSpaces
      if (spaces > prevSlot.spaces) {
        newRemainingSpaces += (spaces - prevSlot.spaces);
      } else {
        // If spaces decreased, remainingSpaces can't be more than new spaces
        newRemainingSpaces = Math.max(0, Math.min(newRemainingSpaces, spaces));
      }
    }
    // If all spaces are booked, status is 'booked', else 'available'
    let newStatus = prevSlot.status;
    if (newRemainingSpaces === 0) {
      newStatus = 'booked';
    } else {
      newStatus = 'available';
    }
    const updated = await Slot.findByIdAndUpdate(slotId, {
      doctorId,
      date,
      startTime: slotStartTime,
      endTime: slotEndTime,
      duration,
      // interval, // commented out
      fees,
      spaces,
      remainingSpaces: newRemainingSpaces,
      status: newStatus,
      type,
      clinicName
    }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Slot not found.' });
    }
    res.status(200).json({ updated });
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

// Delete multiple slots
exports.deleteSlots = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting { ids: [id1, id2, ...] }
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No slot IDs provided.' });
    }
    await Slot.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Slots deleted', deletedIds: ids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check for slot overlap (without creating)
exports.checkSlotOverlap = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, id, type } = req.body;
    if (!doctorId || !date || !startTime || !endTime || !type) {
      return res.status(400).json({ error: 'doctorId, date, startTime, endTime, and type are required' });
    }
    // Build query
    const query = {
      doctorId,
      date: new Date(date),
      type, // Only check overlap within the same type!
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    };
    if (id) {
      query._id = { $ne: id }; // Exclude the slot being edited
    }
    const overlappingSlots = await Slot.find(query);
    if (overlappingSlots.length > 0) {
      const conflictTimes = overlappingSlots.map(slot => `${slot.startTime}-${slot.endTime}`);
      return res.json({ overlap: true, conflictTimes });
    } else {
      return res.json({ overlap: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 