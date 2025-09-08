'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  ChatBubble as ChatIcon,
} from '@mui/icons-material';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface PillMateAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

const PillMateAssistant: React.FC<PillMateAssistantProps> = ({
  isOpen,
  onClose,
  onMinimize,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Salut! Sunt PillMate Assistant, asistentul tău virtual pentru medicație. Cum te pot ajuta astăzi?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickSuggestions = [
    'Care sunt medicamentele mele?',
    'Când trebuie să iau următoarea doză?',
    'Informații despre efecte secundare',
    'Cum setez o nouă amintire?',
    'Ajutor cu dozarea',
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Eroare la comunicarea cu serverul');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Îmi pare rău, am întâmpinat o problemă tehnică. Te rog încearcă din nou.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Fade in={isOpen}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: { xs: '95vw', sm: 400 },
          height: { xs: '80vh', sm: 600 },
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1300,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'white',
                  color: 'primary.main',
                }}
              >
                <BotIcon />
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ color: 'white', fontWeight: 600 }}
                >
                  PillMate Assistant
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                >
                  Online
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={onMinimize}
                sx={{ color: 'white' }}
              >
                <MinimizeIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  maxWidth: '85%',
                  flexDirection: message.isUser ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: message.isUser ? 'primary.main' : 'secondary.main',
                  }}
                >
                  {message.isUser ? <PersonIcon /> : <BotIcon />}
                </Avatar>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: message.isUser
                      ? 'primary.main'
                      : 'grey.100',
                    color: message.isUser ? 'white' : 'text.primary',
                    borderRadius: 2,
                    borderTopLeftRadius: message.isUser ? 2 : 0.5,
                    borderTopRightRadius: message.isUser ? 0.5 : 2,
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                      fontSize: '0.7rem',
                      mt: 0.5,
                      display: 'block',
                    }}
                  >
                    {message.timestamp.toLocaleTimeString('ro-RO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main' }}>
                  <BotIcon />
                </Avatar>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    borderTopLeftRadius: 0.5,
                  }}
                >
                  <CircularProgress size={16} />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Scriu...
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <Box sx={{ p: 2, pt: 0, background: 'rgba(255, 255, 255, 0.95)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
              Sugestii rapide:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {quickSuggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  variant="outlined"
                  size="small"
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    fontSize: '0.7rem',
                    height: 24,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Input */}
        <Box
          sx={{
            p: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrie mesajul tău aici..."
                variant="outlined"
                size="small"
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  },
                }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              sx={{
                minWidth: 48,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default PillMateAssistant;