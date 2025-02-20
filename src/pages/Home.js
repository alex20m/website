import { Container, Typography, Box, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import ProfilePhoto from '../assets/profile.png'; // Changed from .jpg to .png

function Home() {
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
            mb: 4,
            border: '4px solid white',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          gutterBottom 
          color="primary"
          sx={{ 
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          Welcome
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <Typography 
          variant="h5" 
          color="text.secondary"
          sx={{ 
            mt: 2, 
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          I'm Alex Mecklin, a Software Engineering student at Aalto University
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
            mt: 4, 
            maxWidth: '800px', 
            textAlign: 'center', 
            lineHeight: 1.8,
          }}
        >
          With a strong foundation in software development and a passion for creating efficient solutions,
          I specialize in web development and software engineering. Currently pursuing my studies while
          actively engaging in practical projects, I combine academic knowledge with hands-on experience
          to deliver innovative solutions.
        </Typography>
      </motion.div>
    </Box>
  );
}

export default Home; 