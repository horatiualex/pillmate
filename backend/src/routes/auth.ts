import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

const router = Router();

function signJwt(payload: { sub: number; email: string }) {
  const secret = process.env.JWT_SECRET || 'dev';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email și parola sunt necesare.' });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Email deja înregistrat.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: name || null, email, password: hashed },
      select: { id: true, name: true, email: true },
    });

    const token = signJwt({ sub: user.id, email: user.email });
    return res.json({ user, token });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ message: 'Eroare internă' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email și parola sunt necesare.' });
    }

    const userRecord = await prisma.user.findUnique({ where: { email } });
    if (!userRecord) {
      return res.status(401).json({ message: 'Credențiale invalide.' });
    }

    const ok = await bcrypt.compare(password, userRecord.password);
    if (!ok) {
      return res.status(401).json({ message: 'Credențiale invalide.' });
    }

    const user = { id: userRecord.id, name: userRecord.name, email: userRecord.email };
    const token = signJwt({ sub: user.id, email: user.email });

    return res.json({ user, token });
  } catch (err) {
    console.error('Signin error', err);
    return res.status(500).json({ message: 'Eroare internă' });
  }
});

router.get('/verify', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) return res.status(401).json({ ok: false, message: 'Lipsă token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    return res.json({ ok: true, decoded });
  } catch {
    return res.status(401).json({ ok: false, message: 'Token invalid/expirat' });
  }
});

export default router;
