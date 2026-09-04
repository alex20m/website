'use client';

import type { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import useIsMobile from '@/hooks/useIsMobile';

export function SectionDivider() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 0 }}>
      <Box sx={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.3))' }} />
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)' }} />
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)' }} />
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.35)' }} />
      <Box sx={{ flex: 1, height: '2px', background: 'linear-gradient(to left, transparent, rgba(0,0,0,0.3))' }} />
    </Box>
  );
}

interface SectionProps {
  id: string;
  children: ReactNode;
  bg?: string;
}

export function Section({ id, children, bg }: SectionProps) {
  const isMobile = useIsMobile();
  return (
    <Box
      component="section"
      id={id}
      sx={{
        scrollMarginTop: '80px',
        py: isMobile ? 6 : 8,
        backgroundColor: bg || 'transparent',
      }}
    >
      <Container maxWidth="md">{children}</Container>
    </Box>
  );
}
