import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const router = express.Router();

// Zod schemas for validation
const MedCreateSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid end date").optional()
});

const MedUpdateSchema = MedCreateSchema.partial();

// Helper function to safely convert string to Date
const toDate = (dateString: string): Date => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  return date;
};

// GET all medications
router.get('/', async (req, res) => {
  try {
    const medications = await prisma.medication.findMany({
      where: { userId: 1 }, // stub user ID
      orderBy: { createdAt: 'desc' }
    });
    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

// GET medication by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const medication = await prisma.medication.findFirst({
      where: { 
        id: parseInt(id),
        userId: 1 // stub user ID
      }
    });
    
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json(medication);
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).json({ error: 'Failed to fetch medication' });
  }
});

// POST new medication
router.post('/', async (req, res) => {
  try {
    const validatedData = MedCreateSchema.parse(req.body);
    
    const medication = await prisma.medication.create({
      data: {
        userId: 1, // stub user ID
        name: validatedData.name,
        dosage: validatedData.dosage,
        frequency: validatedData.frequency,
        reminderTime: validatedData.reminderTime,
        startDate: toDate(validatedData.startDate),
        endDate: validatedData.endDate ? toDate(validatedData.endDate) : null
      }
    });
    
    res.status(201).json(medication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.issues 
      });
    }
    console.error('Error creating medication:', error);
    res.status(500).json({ error: 'Failed to create medication' });
  }
});

// PUT update medication
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = MedUpdateSchema.parse(req.body);
    
    const updateData: any = { ...validatedData };
    
    if (validatedData.startDate) {
      updateData.startDate = toDate(validatedData.startDate);
    }
    if (validatedData.endDate) {
      updateData.endDate = toDate(validatedData.endDate);
    }
    
    const medication = await prisma.medication.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    res.json(medication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.issues 
      });
    }
    console.error('Error updating medication:', error);
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

// DELETE medication
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.medication.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ error: 'Failed to delete medication' });
  }
});

export default router;
