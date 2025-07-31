const express = require('express');
const router = express.Router();
const twilio = require('twilio');

const { TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET } = process.env;

router.post('/token', (req, res) => {
  
  const { identity, room } = req.body;
  console.log('Received body:', req.body);
  if (!identity || !room) {
    return res.status(400).json({ error: 'Missing identity or room' });
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;

  // ✅ Fix: pass identity in options
  const token = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_SECRET,
    { identity, ttl: 3600 }
  );

  const videoGrant = new VideoGrant({ room });
  token.addGrant(videoGrant);

  const jwt = token.toJwt();
  console.log('Generated JWT:', jwt); // optional
  res.json({ token: jwt });
});


// Optional: Pre-create a Twilio Video room (not required for most use cases)
const twilioRestClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET);

router.post('/create-room', async (req, res) => {
  const { roomName, type } = req.body;
  if (!roomName) {
    return res.status(400).json({ error: 'Missing roomName' });
  }
  try {
    const room = await twilioRestClient.video.rooms.create({
      uniqueName: roomName,
      type: type || 'peer-to-peer',  // Default to peer-to-peer
      maxParticipants: 2            // Limit to 2 users
    });
    res.json({ sid: room.sid, uniqueName: room.uniqueName, type: room.type });
 } catch (err) {
  console.error('Error creating room:', err);
  res.status(500).json({ error: err?.message || 'Room creation failed' });
}
});

module.exports = router; 