import { Typography, Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ResumeFile from '../assets/Alex_Mecklin_CV.pdf';

function Resume() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 2.5, md: 4 },
        px: { xs: 2, md: 3 },
        borderRadius: 4,
        border: '2px dashed #c8d6e5',
        backgroundColor: '#f0f4fa',
      }}
    >
      <DescriptionOutlinedIcon sx={{ fontSize: { xs: 32, md: 48 }, color: '#1565c0', mb: { xs: 1, md: 2 } }} />
      <Typography variant="h2" sx={{ mb: { xs: 1, md: 1 }, fontWeight: 'bold', color: '#0a1929' }}>CV</Typography>
      <Typography variant="body1" sx={{ mb: { xs: 2, md: 3 } }}>
        Download my full CV for a detailed overview of my education, skills, and experience.
      </Typography>
      <Button
        variant="contained"
        href={ResumeFile}
        download="Alex_Mecklin_CV.pdf"
        size="large"
        startIcon={<DownloadIcon />}
        sx={{
          py: { xs: 1, md: 1.5 },
          px: { xs: 3, md: 5 },
          backgroundColor: '#0a1929',
          borderRadius: 2,
          '&:hover': { backgroundColor: '#1565c0' },
        }}
      >
        Download CV
      </Button>
    </Box>
  );
}

export default Resume;
