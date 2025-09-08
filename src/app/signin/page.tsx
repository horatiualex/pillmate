"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Avatar,
  Divider,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  LocalPharmacy,
} from '@mui/icons-material';
import Link from 'next/link';
import { setToken } from '../../lib/auth-client';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Email sau parolă incorectă');
      }
    } catch (err) {
      setError('Eroare de conexiune. Încercați din nou.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'visible',
            position: 'relative',
          }}
        >
          {/* Logo Section */}
          <Box
            sx={{
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              py: 4,
              textAlign: 'center',
              color: 'white',
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <LocalPharmacy sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" component="h1" fontWeight="bold">
              PillMate
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Asistentul tău pentru medicație
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" textAlign="center" gutterBottom fontWeight={600}>
              Conectare
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Introduceți datele dvs. pentru a accesa contul
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={onSubmit}>
              <TextField
                fullWidth
                label="Adresa de email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                label="Parola"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !email || !password}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Conectare'
                )}
              </Button>

              <Divider sx={{ my: 2 }}>sau</Divider>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Nu aveți cont?{' '}
                  <MuiLink
                    component={Link}
                    href="/signup"
                    underline="none"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Creați un cont nou
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
