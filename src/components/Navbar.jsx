import { AppBar, Toolbar, Button, Box, Typography, IconButton, Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import { useState } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import MenuIcon from '@mui/icons-material/Menu';

const navItems = [
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'CV', id: 'cv' },
  { label: 'Contact', id: 'contact' },
];

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const scrollToSection = (id) => {
    setDrawerOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: '#0a1929',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 'md', width: '100%', mx: 'auto' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '-0.3px' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Alex Mecklin
          </Typography>

          {/* Desktop nav */}
          <Box sx={{ display: isMobile ? 'none' : 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            sx={{ display: isMobile ? 'flex' : 'none', color: '#fff' }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 220, backgroundColor: '#0a1929', color: '#fff' } }}
      >
        <List sx={{ pt: 4 }}>
          {navItems.map((item) => (
            <ListItemButton key={item.id} onClick={() => scrollToSection(item.id)}>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500, color: '#fff' }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
}

export default Navbar;
