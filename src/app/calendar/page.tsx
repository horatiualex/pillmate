'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Box, Typography } from '@mui/material';

export default function CalendarPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const from = dayjs().startOf('month').format('YYYY-MM-DD');
    const to = dayjs().endOf('month').format('YYYY-MM-DD');

    fetch(`${API}/api/calendar?from=${from}&to=${to}`, { credentials: 'include' })
      .then(r => r.json())
      .then(setEvents)
      .catch(console.error);
  }, [API]);

  // notificări locale (browser) – în următoarele 5 minute
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    Notification.requestPermission().catch(() => {});

    const t = setInterval(() => {
      const now = dayjs();
      const soon = now.add(5, 'minute');

      const due = events.find(e => {
        const s = dayjs(e.start);
        return s.isAfter(now) && s.isBefore(soon);
      });

      if (due && Notification.permission === 'granted') {
        new Notification('PillMate reminder', {
          body: `${due.title} la ${dayjs(due.start).format('HH:mm')}`,
        });
      }
    }, 60_000);

    return () => clearInterval(t);
  }, [events]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Calendar</Typography>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
      />
    </Box>
  );
}
