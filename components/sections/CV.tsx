'use client';

import { Typography, Box, Button, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
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
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={1.5}
          sx={{ width: isMobile ? '100%' : 'auto' }}
        >
          <Button
            variant="contained"
            href={cv.file}
            download={cv.filename}
            startIcon={<DownloadIcon />}
            sx={{ backgroundColor: '#0a1929', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            Download CV
          </Button>
          <Button
            variant="outlined"
            href={cv.file}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<VisibilityOutlinedIcon />}
            sx={{
              color: '#0a1929',
              borderColor: '#c8d6e5',
              '&:hover': { borderColor: '#1565c0', color: '#1565c0' },
            }}
          >
            View in browser
          </Button>
        </Stack>
      </Box>
    </>
  );
}
