import cron from 'node-cron';
import prisma from '../lib/prisma';
import { sendEmail } from '../lib/mailer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function startReminderCron() {
  console.log('Starting reminder cron job...');
  
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = dayjs();
      const currentTime = now.format('HH:mm');
      
      // Find medications that should have reminders at this time
      const medications = await prisma.medication.findMany({
        where: {
          reminderTime: currentTime,
          startDate: { lte: now.toDate() },
          OR: [
            { endDate: null },
            { endDate: { gte: now.toDate() } }
          ]
        },
        include: {
          user: true
        }
      });

      for (const medication of medications) {
        // Check if we already sent a reminder today
        const today = now.format('YYYY-MM-DD');
        const existingLog = await prisma.reminderLog.findFirst({
          where: {
            medicationId: medication.id,
            dueAt: {
              gte: dayjs(today).startOf('day').toDate(),
              lte: dayjs(today).endOf('day').toDate()
            }
          }
        });

        if (!existingLog) {
          try {
            await sendEmail(
              medication.user.email,
              `Reminder: Take your ${medication.name}`,
              `
                <h2>Medication Reminder</h2>
                <p>It's time to take your medication:</p>
                <p><strong>${medication.name}</strong> - ${medication.dosage}</p>
                <p>Frequency: ${medication.frequency}</p>
              `
            );

            // Log the reminder
            await prisma.reminderLog.create({
              data: {
                medicationId: medication.id,
                dueAt: now.toDate(),
                sent: true
              }
            });

            console.log(`Reminder sent for medication: ${medication.name}`);
          } catch (emailError) {
            console.error('Failed to send reminder email:', emailError);
          }
        }
      }
    } catch (error) {
      console.error('Error in reminder cron job:', error);
    }
  });
}
