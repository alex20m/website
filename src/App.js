import React from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import { ThemeProvider, createTheme, CssBaseline, Box, Container, Paper, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#263238',
      light: '#4f5b62',
      dark: '#000a12',
    },
    background: {
      default: '#f5f5f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a237e',
      secondary: '#37474f',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
      fontSize: '2.5rem',
    },
    h5: {
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
    body1: {
      fontSize: '1.1rem',
      letterSpacing: '0.15px',
      lineHeight: 1.8,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function App() {
  console.log('App is rendering');
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          backgroundAttachment: 'fixed',
        }}
      >
        <Navbar />
        <Container maxWidth="lg" sx={{ flexGrow: 1, py: 3 }}>
          <Paper
            elevation={3}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 6,
                p: 6,
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <section id="home" style={{ scrollMarginTop: '100px' }}>
                  <Home />
                </section>
                <Divider sx={{ my: 6 }} />
                <section id="cv" style={{ scrollMarginTop: '100px' }}>
                  <Resume />
                </section>
                <Divider sx={{ my: 6 }} />
                <section id="projects" style={{ scrollMarginTop: '100px' }}>
                  <Projects />
                </section>
                <Divider sx={{ my: 6 }} />
                <section id="contact" style={{ scrollMarginTop: '100px' }}>
                  <Contact />
                </section>
              </motion.div>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 