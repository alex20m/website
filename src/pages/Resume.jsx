import { Typography, Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import useIsMobile from '../hooks/useIsMobile';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { cv } from '../data/personal.jsx';

function Resume() {
  const isMobile = useIsMobile();
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: isMobile ? 2.5 : 4,
        px: isMobile ? 2 : 3,
        borderRadius: 4,
        border: '2px dashed #c8d6e5',
        backgroundColor: '#f0f4fa',
      }}
    >
      <DescriptionOutlinedIcon sx={{ fontSize: isMobile ? 32 : 48, color: '#1565c0', mb: isMobile ? 1 : 2 }} />
      <Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: '#0a1929' }}>CV</Typography>
      <Typography variant="body1" sx={{ mb: isMobile ? 2 : 3 }}>
        Download my full CV for a detailed overview of my education, skills, and experience.
      </Typography>
      <Button
        variant="contained"
        href={cv.file}
        download={cv.filename}
        size="large"
        startIcon={<DownloadIcon />}
        sx={{
          py: isMobile ? 1 : 1.5,
          px: isMobile ? 3 : 5,
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
