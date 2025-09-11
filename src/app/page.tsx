'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Button } from '@mui/material';
import { Dashboard, CalendarMonth, Medication, QrCodeScanner } from '@mui/icons-material';
import Link from 'next/link';

export default function HomePage() {
  const quickActions = [
    { title: 'Dashboard', description: 'View your daily summary and medication adherence', icon: <Dashboard />, href: '/dashboard', color: 'primary' },
    { title: 'Calendar', description: 'Manage your medication schedule', icon: <CalendarMonth />, href: '/calendar', color: 'secondary' },
    { title: 'Medications', description: 'View and manage your medication list', icon: <Medication />, href: '/medications', color: 'success' },
    { title: 'Scan Pill', description: 'Scan a pill to identify medication', icon: <QrCodeScanner />, href: '/scan', color: 'info' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" gutterBottom>Welcome to PillMate</Typography>
        <Typography variant="h5" color="text.secondary" paragraph>Your comprehensive medication management solution</Typography>
        <Typography variant="body1" color="text.secondary">Track your medications, scan pills, and maintain your health with ease</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {quickActions.map((action) => (
          <Card key={action.title} sx={{ height: '100%' }}>
            <CardActionArea component={Link} href={action.href} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', bgcolor: `${action.color}.light`, color: `${action.color}.main`, mb: 2 }}>
                    {action.icon}
                  </Box>
                </Box>
                <Typography variant="h6" gutterBottom>{action.title}</Typography>
                <Typography variant="body2" color="text.secondary">{action.description}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Getting Started</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Use the sidebar navigation to explore all features, or click on any of the cards above to get started quickly.
        </Typography>
        <Button variant="contained" size="large" component={Link} href="/dashboard" sx={{ mr: 2 }}>Go to Dashboard</Button>
        <Button variant="outlined" size="large" component={Link} href="/medications/add">Add First Medication</Button>
      </Box>
    </Box>
  );
}
