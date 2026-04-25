import { Typography, Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ResumeFile from '../assets/Alex_Mecklin_CV.pdf';

function Resume() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 4,
        px: 3,
        borderRadius: 4,
        border: '2px dashed #c8d6e5',
        backgroundColor: '#f0f4fa',
      }}
    >
      <DescriptionOutlinedIcon sx={{ fontSize: 48, color: '#1565c0', mb: 2 }} />
      <Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: '#0a1929' }}>CV</Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#4a5568' }}>
        Download my full CV for a detailed overview of my education, skills, and experience.
      </Typography>
      <Button
        variant="contained"
        href={ResumeFile}
        download="Alex_Mecklin_CV.pdf"
        size="large"
        startIcon={<DownloadIcon />}
        sx={{
          py: 1.5,
          px: 5,
          backgroundColor: '#0a1929',
          borderRadius: 2,
          fontSize: '1rem',
          '&:hover': { backgroundColor: '#1565c0' },
        }}
      >
        Download CV
      </Button>
    </Box>
  );
}

export default Resume;
