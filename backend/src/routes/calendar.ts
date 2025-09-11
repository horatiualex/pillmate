import express from 'express';
import prisma from '../lib/prisma';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query parameters are required' });
    }

    const startDate = new Date(from as string);
    const endDate = new Date(to as string);

    const medications = await prisma.medication.findMany({
      where: {
        userId: 1, // stub user ID
        startDate: {
          lte: endDate
        },
        OR: [
          { endDate: null },
          { endDate: { gte: startDate } }
        ]
      }
    });

    const events = [];
    
    for (const med of medications) {
      const medStartDate = dayjs(med.startDate);
      const medEndDate = med.endDate ? dayjs(med.endDate) : dayjs(endDate);
      const rangeStart = medStartDate.isAfter(dayjs(startDate)) ? medStartDate : dayjs(startDate);
      const rangeEnd = medEndDate.isBefore(dayjs(endDate)) ? medEndDate : dayjs(endDate);

      let currentDate = rangeStart;
      while (currentDate.isSameOrBefore(rangeEnd, 'day')) {
        if (med.reminderTime) {
          const [hours, minutes] = med.reminderTime.split(':').map(Number);
          const eventStart = currentDate.hour(hours).minute(minutes).second(0);
          const eventEnd = eventStart.add(30, 'minute');

          events.push({
            id: `${med.id}-${currentDate.format('YYYY-MM-DD')}`,
            title: `${med.name} - ${med.dosage}`,
            start: eventStart.toISOString(),
            end: eventEnd.toISOString(),
            medicationId: med.id,
            frequency: med.frequency
          });
        }
        currentDate = currentDate.add(1, 'day');
      }
    }

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

export default router;
