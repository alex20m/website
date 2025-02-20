import React, { useCallback } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

function LandingPage() {
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  const handleScroll = () => {
    const homeSection = document.getElementById('home');
    if (homeSection) {
      const offset = 120;
      const elementPosition = homeSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        textAlign: 'center',
        padding: 4,
        position: 'relative',
      }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            opacity: 0,
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#3498db",
            },
            links: {
              color: "#2980b9",
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1.5,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 60,
            },
            opacity: {
              value: 0.7,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />
      <Container 
        maxWidth="md" 
        sx={{ 
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{
              textShadow: '2px 2px 8px rgba(52, 152, 219, 0.3)',
              color: '#ecf0f1',
            }}
          >
            Hello, I'm Alex
          </Typography>
          <Typography 
            variant="h5" 
            color="textSecondary" 
            sx={{ 
              mb: 4,
              textShadow: '1px 1px 4px rgba(52, 152, 219, 0.2)',
              color: '#bdc3c7',
            }}
          >
            I'm a computer science student at Aalto University
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ 
              mt: 3,
              backdropFilter: 'blur(10px)',
              background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(33, 203, 243, 0.3)',
                background: 'linear-gradient(45deg, #21CBF3 30%, #2196f3 90%)',
              },
            }}
            onClick={handleScroll}
            endIcon={<ArrowDownwardIcon />}
          >
            Learn more about me
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
}

export default LandingPage; 