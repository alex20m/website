import React from 'react';
import Navbar from './components/Navbar';
import About from './pages/About';
import Projects from './pages/Projects';
import Chat from './pages/Chat';
import CV from './pages/CV';
import Contact from './pages/Contact';
import Experience from './pages/Experience';
import { ThemeProvider, createTheme, CssBaseline, Box, Container } from '@mui/material';
import useIsMobile from './hooks/useIsMobile';

const SectionDivider = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 0 }}>
    <Box sx={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.3))' }} />
    <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)' }} />
    <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)' }} />
    <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)' }} />
    <Box sx={{ flex: 1, height: '2px', background: 'linear-gradient(to left, transparent, rgba(0,0,0,0.3))' }} />
  </Box>
);

const Section = ({ id, children, bg }) => {
  const isMobile = useIsMobile();
  return (
    <Box
      component="section"
      id={id}
      sx={{
        scrollMarginTop: '80px',
        py: isMobile ? 6 : 8,
        backgroundColor: bg || 'transparent',
      }}
    >
      <Container maxWidth="md">{children}</Container>
    </Box>
  );
};

function App() {
  const isMobile = useIsMobile();

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
      h2: { fontWeight: 700, letterSpacing: '-0.5px', fontSize: isMobile ? '1.6rem' : '2.2rem' },
      h5: { fontWeight: 600, letterSpacing: '0.2px', fontSize: isMobile ? '1.1rem' : '1.4rem' },
      body1: { fontSize: isMobile ? '0.85rem' : '0.95rem', lineHeight: 1.7, color: '#4a5568' },
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Box component="main">
        <Section id="about"><About /></Section>
        <SectionDivider />
        <Section id="chat" bg="#ffffff"><Chat /></Section>
        <SectionDivider />
        <Section id="experience"><Experience /></Section>
        <SectionDivider />
        <Section id="projects" bg="#ffffff"><Projects /></Section>
        <SectionDivider />
        <Section id="cv"><CV /></Section>
        <SectionDivider />
        <Section id="contact" bg="#ffffff"><Contact /></Section>
      </Box>
    </ThemeProvider>
  );
}

export default App;
