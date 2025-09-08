"use client";

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Divider,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Container,
  IconButton,
} from '@mui/material';
import {
  CameraAlt,
  Upload,
  Medication,
  Info,
  Warning,
  Schedule,
  LocalPharmacy,
  Science,
  Refresh,
  PhotoCamera,
  Description,
} from '@mui/icons-material';

interface ScanResult {
  medication: {
    name: string;
    activeIngredient: string;
    dosage: string;
    manufacturer: string;
    type: string;
  };
  identification: {
    confidence: number;
    color: string;
    shape: string;
    imprint: string;
  };
  information: {
    indications: string[];
    dosageInstructions: string;
    sideEffects: string[];
    warnings: string[];
    interactions: string[];
  };
  safety: {
    riskLevel: 'low' | 'medium' | 'high';
    prescriptionRequired: boolean;
    ageRestrictions: string;
  };
}

export default function ScanPage() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageData(e.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  async function onSubmit() {
    if (!imageData) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        body: JSON.stringify({ image: imageData }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      
      if (res.ok && data.result) {
        // Simulez un rezultat detaliat pentru demonstrație
        const mockResult: ScanResult = {
          medication: {
            name: data.result.includes('Aspirin') ? 'Aspirin 500mg' : 'Medicament identificat',
            activeIngredient: 'Acid acetilsalicilic',
            dosage: '500mg',
            manufacturer: 'Pharmaceuticals SA',
            type: 'Comprimat'
          },
          identification: {
            confidence: 92,
            color: 'Alb',
            shape: 'Rotund',
            imprint: 'ASP 500'
          },
          information: {
            indications: ['Durere', 'Febră', 'Inflamație', 'Prevenție cardiovasculară'],
            dosageInstructions: '1 comprimat la 6-8 ore, maximum 4 pe zi',
            sideEffects: ['Iritație gastrică', 'Greață', 'Tinitus', 'Sângerări'],
            warnings: ['Nu luați pe stomacul gol', 'Evitați alcoolul', 'Consultați medicul pentru utilizare pe termen lung'],
            interactions: ['Anticoagulante', 'Corticosteroizi', 'Metothrexat']
          },
          safety: {
            riskLevel: 'medium',
            prescriptionRequired: false,
            ageRestrictions: 'Nu se recomandă sub 16 ani'
          }
        };
        setResult(mockResult);
      } else {
        setError(data.error || 'Nu am putut identifica medicamentul din imagine');
      }
    } catch (err) {
      setError('Eroare la scanarea imaginii. Încercați din nou.');
    } finally {
      setLoading(false);
    }
  }

  const resetScan = () => {
    setImageData(null);
    setResult(null);
    setError(null);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'low': return 'Risc scăzut';
      case 'medium': return 'Risc moderat';
      case 'high': return 'Risc ridicat';
      default: return 'Necunoscut';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main',
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          }}
        >
          <Medication sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Scanare Pastilă
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Identifică medicamentul și primește informații detaliate despre siguranță
        </Typography>
      </Box>

      {/* Upload Section */}
      {!imageData && (
        <Fade in={!imageData}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 3,
            }}
          >
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PhotoCamera />}
                  onClick={handleCameraCapture}
                  fullWidth
                  sx={{
                    py: 2,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    fontSize: '1.1rem',
                  }}
                >
                  Fotografiază
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Upload />}
                  onClick={handleUploadClick}
                  fullWidth
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  Încarcă imagine
                </Button>
              </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Fotografiază pastila pe un fundal deschis pentru cele mai bune rezultate
            </Typography>
          </Paper>
        </Fade>
      )}

      {/* Image Preview */}
      {imageData && !result && (
        <Fade in={!!imageData}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Imagine încărcată</Typography>
                <IconButton onClick={resetScan} color="primary">
                  <Refresh />
                </IconButton>
              </Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <img
                  src={imageData}
                  alt="Pastila scanată"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={onSubmit}
                disabled={loading}
                fullWidth
                sx={{
                  py: 2,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                }}
              >
                {loading ? 'Scanez...' : 'Analizează pastila'}
              </Button>
              {loading && <LinearProgress sx={{ mt: 2 }} />}
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Error Display */}
      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Results */}
      {result && (
        <Fade in={!!result}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Rezultat scanare
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={resetScan}
              >
                Scanează din nou
              </Button>
            </Box>

            <Grid container spacing={3}>
              {/* Medication Info */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalPharmacy sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Informații medicament</Typography>
                    </Box>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Nume"
                          secondary={result.medication.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Substanță activă"
                          secondary={result.medication.activeIngredient}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Dozaj"
                          secondary={result.medication.dosage}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Producător"
                          secondary={result.medication.manufacturer}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Identification */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Science sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Identificare</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`Încredere: ${result.identification.confidence}%`}
                        color={result.identification.confidence > 80 ? 'success' : 'warning'}
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Culoare" secondary={result.identification.color} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Formă" secondary={result.identification.shape} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Marcaj" secondary={result.identification.imprint} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Safety Information */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Warning sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="h6">Informații de siguranță</Typography>
                      <Chip
                        label={getRiskText(result.safety.riskLevel)}
                        color={getRiskColor(result.safety.riskLevel) as any}
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          <Schedule sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                          Mod de administrare
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {result.information.dosageInstructions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Restricții vârstă: {result.safety.ageRestrictions}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          <Warning sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                          Efecte secundare
                        </Typography>
                        {result.information.sideEffects.map((effect, index) => (
                          <Chip
                            key={index}
                            label={effect}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          <Info sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                          Avertismente
                        </Typography>
                        {result.information.warnings.map((warning, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                            • {warning}
                          </Typography>
                        ))}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Indications */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Description sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Indicații
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {result.information.indications.map((indication, index) => (
                        <Chip
                          key={index}
                          label={indication}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Interactions */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Science sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Interacțiuni
                    </Typography>
                    {result.information.interactions.map((interaction, index) => (
                      <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                        {interaction}
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Atenție:</strong> Aceste informații sunt cu scop educativ. 
                Consultați întotdeauna un medic sau farmacist pentru sfaturi medicale personalizate.
              </Typography>
            </Alert>
          </Box>
        </Fade>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />
    </Container>
  );
}
