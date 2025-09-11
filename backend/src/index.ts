import express from 'express';
import cors from 'cors';
import medicationsRouter from './routes/medications';
import calendarRouter from './routes/calendar';
import authRouter from './routes/auth';
import { startReminderCron } from './jobs/reminderCron';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  credentials: true
}));

app.use(express.json());

app.use('/api/medications', medicationsRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/auth', authRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  startReminderCron();
});
