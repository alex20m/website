import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import LandingPage from './pages/LandingPage';
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
  const [navbarStyle, setNavbarStyle] = useState({
    position: 'fixed',
    width: '100%',
    top: 0,
    left: 0,
    opacity: 0,
    transform: 'translateY(-100%) rotateX(20deg)',
    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    transformOrigin: 'top',
    zIndex: 1100,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > window.innerHeight / 2) {
        setNavbarStyle((prevStyle) => ({
          ...prevStyle,
          opacity: 1,
          transform: 'translateY(0) rotateX(0deg)',
        }));
      } else {
        setNavbarStyle((prevStyle) => ({
          ...prevStyle,
          opacity: 0,
          transform: 'translateY(-100%) rotateX(20deg)',
        }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          backgroundAttachment: 'fixed',
        }}
      >
        <div style={navbarStyle}>
          <Navbar />
        </div>
        <LandingPage />
        <Container id="main-content" maxWidth="lg" sx={{ flexGrow: 1, py: 3 }}>
          <Paper
            elevation={3}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
                <section id="home" style={{ scrollMarginTop: '120px', paddingTop: '2rem' }}>
                  <Home />
                </section>
                <Divider sx={{ my: 6 }} />
                <section id="cv" style={{ scrollMarginTop: '64px' }}>
                  <Resume />
                </section>
                <Divider sx={{ my: 6 }} />
                <section id="projects" style={{ scrollMarginTop: '64px' }}>
                  <Projects />
                </section>
                <Divider sx={{ my: 6 }} />
                <section id="contact" style={{ scrollMarginTop: '64px' }}>
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