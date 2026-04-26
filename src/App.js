import React from 'react';
import Navbar from './components/Navbar';
import About from './pages/About';
import Projects from './pages/Projects';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import Experience from './pages/Experience';
import { ThemeProvider, createTheme, CssBaseline, Box, Container } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0a1929', light: '#1565c0', dark: '#050e18' },
    secondary: { main: '#1565c0' },
    background: { default: '#f8f9fb', paper: '#ffffff' },
    text: { primary: '#0a1929', secondary: '#4a5568' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: { fontWeight: 700, letterSpacing: '-0.5px', fontSize: '2.2rem', '@media (max-width:600px)': { fontSize: '1.6rem' } },
    h5: { fontWeight: 600, letterSpacing: '0.2px', fontSize: '1.4rem', '@media (max-width:600px)': { fontSize: '1.1rem' } },
    body1: { fontSize: '0.95rem', lineHeight: 1.7, color: '#4a5568', '@media (max-width:600px)': { fontSize: '0.85rem' } },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '0.95rem',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.2s ease',
        },
      },
    },
  },
});

const Section = ({ id, children, bg }) => (
  <Box
    component="section"
    id={id}
    sx={{
      scrollMarginTop: '80px',
      py: { xs: 6, md: 8 },
      backgroundColor: bg || 'transparent',
    }}
  >
    <Container maxWidth="md">{children}</Container>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Box component="main">
        <Section id="about"><About /></Section>
        <Section id="experience" bg="#ffffff"><Experience /></Section>
        <Section id="cv"><Resume /></Section>
        <Section id="projects" bg="#ffffff"><Projects /></Section>
        <Section id="contact"><Contact /></Section>
      </Box>
    </ThemeProvider>
  );
}

export default App;
