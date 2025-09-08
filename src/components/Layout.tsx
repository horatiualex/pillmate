'use client';

import React, { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
  IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Menu, MenuItem, useTheme, Fab,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, CalendarMonth, Medication, Add,
  QrCodeScanner, History, Settings, Help, Home, Person, ChatBubble,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import PillMateAssistant from './PillMateAssistant';
import { clearToken } from '../lib/auth-client';

interface LayoutProps { children: React.ReactNode; }

const menuItems = [
  { text: 'Acasă', icon: <Home />, href: '/' },
  { text: 'Panou principal', icon: <Dashboard />, href: '/dashboard' },
  { text: 'Calendar', icon: <CalendarMonth />, href: '/calendar' },
  { text: 'Medicații', icon: <Medication />, href: '/medications' },
  { text: 'Adaugă medicament', icon: <Add />, href: '/medications/add' },
  { text: 'Scanare pastilă', icon: <QrCodeScanner />, href: '/scan' },
  { text: 'Istoric', icon: <History />, href: '/history' },
  { text: 'Setări', icon: <Settings />, href: '/settings' },
  { text: 'Ajutor', icon: <Help />, href: '/help' },
];

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const handleDrawerToggle = () => setOpen(!open);
  const handleProfileMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleChatToggle = () => {
    if (chatMinimized) {
      setChatMinimized(false);
    } else {
      setChatOpen(!chatOpen);
    }
  };
  const handleChatClose = () => {
    setChatOpen(false);
    setChatMinimized(false);
  };
  const handleChatMinimize = () => {
    setChatMinimized(true);
    setChatOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      clearToken();
      // Așteaptă puțin pentru UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/signin');
    } catch (error) {
      console.error('Eroare la logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const drawer = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: theme.spacing(2), minHeight: 64 }}>
        <Typography variant="h6" noWrap>PillMate</Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  '&:hover': { backgroundColor: theme.palette.primary.light },
                },
              }}
            >
              <ListItemIcon sx={{ color: pathname === item.href ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text}/>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {menuItems.find(i => i.href === pathname)?.text || 'PillMate'}
          </Typography>
          <IconButton size="large" edge="end" onClick={handleProfileMenuOpen} color="inherit">
            <Avatar sx={{ width: 32, height: 32 }}><Person /></Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        anchor="left"
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            top: theme.mixins.toolbar.minHeight,
            width: { xs: '75%', md: '25%' },
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={Link} href="/profile">Profil</MenuItem>
        <MenuItem component={Link} href="/settings">Setări</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? 'Se deconectează...' : 'Deconectare'}
        </MenuItem>
      </Menu>

      {/* Chat Assistant FAB */}
      {!chatOpen && (
        <Fab
          color="primary"
          aria-label="chat"
          onClick={handleChatToggle}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
            },
          }}
        >
          <ChatBubble />
        </Fab>
      )}

      {/* PillMate Assistant */}
      <PillMateAssistant
        isOpen={chatOpen}
        onClose={handleChatClose}
        onMinimize={handleChatMinimize}
      />
    </Box>
  );
}
