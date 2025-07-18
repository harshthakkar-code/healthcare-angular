const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());

// ✅ Stripe webhook route (apply raw body BEFORE express.json())
app.post('/api/transactions/stripe/webhook', express.raw({ type: 'application/json' }), require('./controllers/transactionController').stripeWebhook);

// ✅ Now apply express.json() globally for other routes
app.use(express.json());

// All other routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/blogs', require('./routes/blog'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/specialization', require('./routes/specialization'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/slots', require('./routes/slot'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/transactions', require('./routes/transaction'));
app.use('/api/social-media', require('./routes/socialMedia'));
app.use('/api/doctor-settings', require('./routes/doctorSettings'));
app.use('/api/payouts', require('./routes/payout'));
app.use('/api/favourites', require('./routes/favourite'));
app.use('/api/dependants', require('./routes/dependant'));
app.use('/api/speciality-options', require('./routes/specialityOption'));
app.use('/api/invoices', require('./routes/invoice'));
app.use('/api/video', require('./routes/video'));

// Global error handler
app.use(require('./middlewares/errorHandler'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log('Server running');
  });
}).catch(err => console.error(err));
