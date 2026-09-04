'use client';

import Navbar from '@/components/Navbar';
import { Section, SectionDivider } from '@/components/Section';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Chat from '@/components/sections/Chat';
import CV from '@/components/sections/CV';
import Contact from '@/components/sections/Contact';
import Experience from '@/components/sections/Experience';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import useIsMobile from '@/hooks/useIsMobile';

export default function PortfolioApp() {
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
