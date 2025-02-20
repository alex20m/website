import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';

function Navbar() {
  console.log('Navbar component rendering');

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Increased offset for more space
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <AppBar 
      sx={{ 
        mb: 2,
        backgroundColor: '#1976d2',
        boxShadow: 3,
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