'use client';

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function AddMedicationPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    notes: '',
    reminderTime: '', // "HH:mm"
  });
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        dosage: form.dosage,
        frequency: form.frequency,
        startDate: form.startDate,              // backend parsează string-ul
        endDate: form.endDate || null,
        notes: form.notes || null,
        reminderTime: form.reminderTime || null // "HH:mm"
      };
      console.log('Submitting to:', `${API}/api/medications`);
      console.log('Payload:', payload);
      const res = await fetch(`${API}/api/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('Response status:', res.status);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err?.message || `HTTP ${res.status}`);
      }
      const result = await res.json();
      console.log('Created medication:', result);
      router.push('/medications');
    } catch (error) {
      console.error('Submit error:', error);
      alert('Create failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Add Medication
        </Typography>
        <form onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                required
                value={form.name}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Dosage"
                name="dosage"
                fullWidth
                required
                placeholder="e.g., 500mg"
                value={form.dosage}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Frequency"
                name="frequency"
                fullWidth
                required
                placeholder="e.g., Daily"
                value={form.frequency}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={form.startDate}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.endDate}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes (optional)"
                name="notes"
                fullWidth
                multiline
                rows={3}
                value={form.notes}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reminder time (HH:mm)"
                name="reminderTime"
                fullWidth
                placeholder="08:00"
                value={form.reminderTime}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Saving…' : 'Add Medication'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
