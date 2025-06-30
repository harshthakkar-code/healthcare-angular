const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
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
// Add more as needed

app.use(require('./middlewares/errorHandler'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log('Server running');
    });
  })
  .catch(err => console.error(err)); 