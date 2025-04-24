require('dotenv').config();
const app = require('./app');
const pool = require('./db');

const PORT = process.env.PORT || 3000;

// Test DB connection on startup
pool.connect((err, client, done) => {
  if (err) console.error('❌ DB connection error:', err);
  else {
    console.log('✅ DB connected');
    done();
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));