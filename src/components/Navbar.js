import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';

function Navbar() {
  console.log('Navbar component rendering');

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'  // This ensures the top of the section is visible
      });
    }
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        mb: 2,
        backgroundColor: '#1976d2', // Bright blue
        boxShadow: 3,
        zIndex: 1100  // Ensure navbar stays on top
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ 
            mr: 4,
            fontWeight: 'bold',
            color: 'white'
          }}
        >
          Alex Mecklin
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button 
            color="inherit"
            onClick={() => scrollToSection('home')}
            sx={{ color: 'white' }}
          >
            Home
          </Button>
          <Button 
            color="inherit"
            onClick={() => scrollToSection('cv')}
            sx={{ color: 'white' }}
          >
            CV
          </Button>
          <Button 
            color="inherit"
            onClick={() => scrollToSection('projects')}
            sx={{ color: 'white' }}
          >
            Projects
          </Button>
          <Button 
            color="inherit"
            onClick={() => scrollToSection('contact')}
            sx={{ color: 'white' }}
          >
            Contact
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 