const express = require('express');
const twilio = require('twilio');
const router = express.Router();

const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const serviceSid = process.env.TWILIO_CONVERSATIONS_SERVICE_SID;

const twilioRestClient = twilio(accountSid, process.env.TWILIO_AUTH_TOKEN);

// GET /api/twilio/token?identity=USER_ID_OR_EMAIL
router.get('/token', (req, res) => {
  const identity = req.query.identity;
  if (!identity) return res.status(400).json({ error: 'Identity is required' });

  const token = new AccessToken(accountSid, apiKey, apiSecret, { identity });
  const grant = new ChatGrant();
  grant.serviceSid = serviceSid;
  token.addGrant(grant);

  res.json({ token: token.toJwt() });
});

// POST /api/twilio/create-test-conversation
// router.post('/create-test-conversation', async (req, res) => {
//   // Hardcoded doctor and patient IDs for testing
//   const doctorId = '6874915b0bfbc366126933db';
//   const patientId = '685a71257bef1eb5c960cd4b';
//   try {
//     const conversation = await twilioRestClient.conversations.v1.conversations.create({ friendlyName: 'Test Doctor-Patient Conversation' });
//     await twilioRestClient.conversations.v1.conversations(conversation.sid).participants.create({ identity: doctorId });
//     await twilioRestClient.conversations.v1.conversations(conversation.sid).participants.create({ identity: patientId });
//     res.json({ sid: conversation.sid, message: 'Conversation created and participants added.' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// POST /api/twilio/create-conversation
router.post('/create-conversation', async (req, res) => {
  // console.log("API CALLEDDD");
  const { doctorId, patientId } = req.body;
  if (!doctorId || !patientId) {
    return res.status(400).json({ error: 'doctorId and patientId are required' });
  }
  try {
    // Check if a conversation already exists between doctor and patient
    const conversations = await twilioRestClient.conversations.v1.conversations.list({ limit: 100 });
    let existingConversation = null;
    for (const conv of conversations) {
      const participants = await twilioRestClient.conversations.v1.conversations(conv.sid).participants.list();
      const identities = participants.map(p => p.identity);
      if (identities.includes(doctorId) && identities.includes(patientId) && identities.length === 2) {
        existingConversation = conv;
        break;
      }
    }
    if (existingConversation) {
      return res.json({ sid: existingConversation.sid, message: 'Conversation already exists.' });
    }
    // Create a new conversation
    const conversation = await twilioRestClient.conversations.v1.conversations.create({ friendlyName: `Doctor-${doctorId}_Patient-${patientId}` });
    await twilioRestClient.conversations.v1.conversations(conversation.sid).participants.create({ identity: doctorId });
    await twilioRestClient.conversations.v1.conversations(conversation.sid).participants.create({ identity: patientId });
    res.json({ sid: conversation.sid, message: 'Conversation created and participants added.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 