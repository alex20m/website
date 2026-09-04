'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { companyLogoName } from '@/lib/companyLogo';

/**
 * Renders a company's logo from `public/logos/<name>.png`, or nothing if
 * that file doesn't exist — a plain <img> lets the browser's own 404
 * trigger `onError`, which is simpler than probing for the file up front.
 */
export default function CompanyLogo({ company }: { company: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderRadius: 1,
        border: '1px solid #e3eaf6',
        backgroundColor: '#fff',
        padding: '4px',
      }}
    >
      <Box
        component="img"
        src={`/logos/${companyLogoName(company)}.png`}
        alt={company}
        onError={() => setFailed(true)}
        sx={{
          maxHeight: '100%',
          maxWidth: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
}
