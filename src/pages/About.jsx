import { Typography, Box, Avatar, Chip, Stack, Button, IconButton, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { motion } from 'framer-motion';
import ProfilePhoto from '../assets/profile.png';
import useIsMobile from '../hooks/useIsMobile';
import { contacts, cv } from '../data/personal.jsx';

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
  const isMobile = useIsMobile();
  return (
    <Box
      sx={{
        pt: isMobile ? 8 : 14,
        pb: 2,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        gap: isMobile ? 3 : 6,
      }}
    >
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <Avatar
          src={ProfilePhoto}
          alt="Alex Mecklin"
          sx={{
            width: isMobile ? 120 : 180,
            height: isMobile ? 120 : 180,
            border: '4px solid #e3eaf6',
            boxShadow: '0 8px 24px rgba(10,25,41,0.12)',
            '& img': { objectFit: 'cover', objectPosition: 'center 70%', transform: 'scale(1.2)' },
          }}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
        <Stack sx={{ textAlign: isMobile ? 'center' : 'left' }} gap={2}>
          <Box>
            <Typography variant="h2" sx={{ color: '#0a1929', mb: 0.5 }}>
              Alex Mecklin
            </Typography>
            <Typography variant="h5" sx={{ color: '#1565c0' }}>
              M.Sc. Student · Aalto University
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ maxWidth: isMobile ? 'none' : 540 }}>
            Computer science student specializing in big data and large scale computing.
            Currently working on agentic AI software development, with prior experience in web development, 
            test automation and embedded systems. Interested in agentic AI and cloud technologies.
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5} justifyContent={isMobile ? 'center' : 'flex-start'}>
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
          <Stack direction="row" alignItems="center" gap={1} justifyContent={isMobile ? 'center' : 'flex-start'}>
            <Button
              variant="outlined"
              href={cv.file}
              download={cv.filename}
              startIcon={<DownloadIcon />}
              sx={{
                borderColor: '#0a1929',
                color: '#0a1929',
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': { backgroundColor: '#0a1929', color: '#fff' },
              }}
            >
              Download CV
            </Button>
            {contacts.map((c) => (
              <Tooltip key={c.label} title={c.value}>
                <IconButton
                  component="a"
                  href={c.href}
                  target={c.external ? '_blank' : undefined}
                  rel={c.external ? 'noopener noreferrer' : undefined}
                  sx={{ color: '#0a1929', '&:hover': { color: '#1565c0' } }}
                >
                  {c.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Stack>
      </motion.div>
    </Box>
  );
}

export default About;
