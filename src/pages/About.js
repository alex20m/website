import { Container, Typography, Box, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import ProfilePhoto from '../assets/profile.png'; // Changed from .jpg to .png

function About() {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Avatar
          src={ProfilePhoto}
          alt="Alex Mecklin"
          sx={{
            width: 200,
            height: 200,
            mb: 2,
            border: '4px solid white',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          color="primary"
          sx={{ 
            mb: 4,
            fontWeight: 'bold'
          }}
        >
          About me
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{  
            maxWidth: '800px', 
            textAlign: 'center', 
            lineHeight: 1.6,
          }}
        >
          I'm Alex Mecklin, a computer science master's student at Aalto University, specializing in big data and large scale computing.
          I have a background in automation and robotics, and most of my work experience is in test automation, both for web applications and embedded systems.          
        </Typography>
      </motion.div>
    </Box>
  );
}

export default About; 
