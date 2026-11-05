'use client';

import { Typography, Box, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import useIsMobile from '@/hooks/useIsMobile';
import { cv } from '@/data/personal';

export default function CV() {
  const isMobile = useIsMobile();
  return (
    <>
      <Typography variant="h2" sx={{ mb: isMobile ? 3 : 5, fontWeight: 'bold', color: '#0a1929' }}>CV</Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isMobile ? 3 : 4,
          p: isMobile ? 2.5 : 4,
          borderRadius: 4,
          border: '1px solid #e3eaf6',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 24px rgba(10,25,41,0.06)',
        }}
      >
        <Box
          component="a"
          href={cv.file}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'block',
            width: isMobile ? 180 : 240,
            mt: 1,
            transform: 'rotate(-2deg)',
            transition: 'transform 0.25s ease',
            '&:hover, &:focus-visible': { transform: 'rotate(0deg) scale(1.03)' },
          }}
        >
          <Box
            component="img"
            src={cv.preview.src}
            width={cv.preview.width}
            height={cv.preview.height}
            alt="First page of my CV"
            sx={{
              display: 'block',
              width: '100%',
              height: 'auto',
              borderRadius: 1,
              border: '1px solid #e3eaf6',
              boxShadow: '0 12px 32px rgba(10,25,41,0.18), 0 2px 6px rgba(10,25,41,0.08)',
            }}
          />
        </Box>
        <Button
          variant="contained"
          href={cv.file}
          target="_blank"
          rel="noopener noreferrer"
          fullWidth={isMobile}
          startIcon={<OpenInNewIcon />}
          sx={{ backgroundColor: '#0a1929', '&:hover': { backgroundColor: '#1565c0' } }}
        >
          Open CV
        </Button>
      </Box>
    </>
  );
}
