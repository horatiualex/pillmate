'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, IconButton, Stack, Button, Chip } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Medication as MedicationIcon } from '@mui/icons-material';

type Med = {
  id: number; userId: number; name: string; dosage: string; frequency: string;
  startDate: string; endDate?: string | null; notes?: string | null; reminderTime?: string | null;
  createdAt: string; updatedAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

function fmt(d?: string | null) {
  if (!d) return '';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d! : dt.toISOString().slice(0, 10);
}

export default function MedicationsPage() {
  const [items, setItems] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      console.log('Fetching from:', `${API}/api/medications`);
      const res = await fetch(`${API}/api/medications`, { cache: 'no-store' });
      console.log('Response status:', res.status);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Received data:', data);
      setItems(data);
    } catch (error) {
      console.error('Fetch error:', error);
      alert(`Failed to load medications: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onDelete(id: number) {
    if (!confirm('Delete this medication?')) return;
    const res = await fetch(`${API}/api/medications/${id}`, { method: 'DELETE' });
    if (res.ok) setItems(prev => prev.filter(x => x.id !== id));
    else alert('Delete failed');
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Medications</Typography>
        <Button component={Link} href="/medications/add" startIcon={<AddIcon />} variant="contained">
          Add Medication
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>Current Medications</Typography>

          {loading ? (
            <Typography>Loading…</Typography>
          ) : items.length === 0 ? (
            <Typography>No medications yet.</Typography>
          ) : (
            <List>
              {items.map(m => (
                <ListItem
                  key={m.id}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton aria-label="edit" component={Link} href={`/medications/${m.id}/edit`}><EditIcon /></IconButton>
                      <IconButton aria-label="delete" onClick={() => onDelete(m.id)}><DeleteIcon /></IconButton>
                    </Stack>
                  }
                >
                  <MedicationIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={600}>{m.name}</Typography>
                        <Chip size="small" label={m.dosage} />
                        <Chip size="small" label={m.frequency} variant="outlined" />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {`Start: ${fmt(m.startDate)} `}
                        {m.endDate ? `• End: ${fmt(m.endDate)} ` : ''}
                        {m.reminderTime ? `• Reminder: ${m.reminderTime}` : ''}
                        {m.notes ? ` • Notes: ${m.notes}` : ''}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
