import { Typography, Box, Avatar, Chip, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import ProfilePhoto from '../assets/profile.png';

const skills = [
  'Agentic AI',
  'Cloud Technologies',
  'Software Development',
  'CI/CD',
  'Data Science',
  'Machine Learning',
  'Test Automation'
];

function About() {
  return (
    <Box
      sx={{
        pt: { xs: 8, md: 14 },
        pb: 2,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'center', md: 'flex-start' },
        gap: { xs: 3, md: 6 },
      }}
    >
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <Avatar
          src={ProfilePhoto}
          alt="Alex Mecklin"
          sx={{
            width: { xs: 120, md: 180 },
            height: { xs: 120, md: 180 },
            border: '4px solid #e3eaf6',
            boxShadow: '0 8px 24px rgba(10,25,41,0.12)',
            '& img': { objectFit: 'cover', objectPosition: 'center 70%', transform: 'scale(1.2)' },
          }}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h2" sx={{ color: '#0a1929', mb: 1 }}>
            Alex Mecklin
          </Typography>
          <Typography variant="h5" sx={{ color: '#1565c0', mb: 2 }}>
            M.Sc. Student · Aalto University
          </Typography>
          <Typography variant="body1" sx={{ mb: { xs: 2, md: 3 }, maxWidth: 540 }}>
            Computer science student specializing in big data and large scale computing.
            Currently working on agentic AI software development, with prior experience in web development, 
            test automation and embedded systems. Interested in agentic AI and cloud technologies.
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5} justifyContent={{ xs: 'center', md: 'flex-start' }}>
            {skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{
                  backgroundColor: '#e3eaf6',
                  color: '#0a1929',
                }}
              />
            ))}
          </Stack>
        </Box>
      </motion.div>
    </Box>
  );
}

export default About;
