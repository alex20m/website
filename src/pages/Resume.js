import { Container, Typography, Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ResumeFile from '../assets/resume.pdf';
import { motion } from 'framer-motion';
import { useState } from 'react';

function Resume() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography 
            variant="h2" 
            gutterBottom 
            color="primary"
            sx={{ 
              fontWeight: 'bold',
              mb: 4
            }}
          >
            CV
          </Typography>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="contained" 
              color="primary"
              href={ResumeFile}
              download="Alex_Mecklin_CV.pdf"
              size="large"
              onClick={handleDownload}
              startIcon={
                <motion.div
                  animate={isDownloading ? { y: [0, -8, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <DownloadIcon sx={{ fontSize: '1.2rem' }} />
                </motion.div>
              }
              sx={{ 
                py: 2,
                px: 4,
                background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '& .MuiButton-startIcon': {
                  marginRight: 1,
                  marginLeft: 0
                }
              }}
            >
              {isDownloading ? "Downloading..." : "Download CV"}
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    </Container>
  );
}

export default Resume; 