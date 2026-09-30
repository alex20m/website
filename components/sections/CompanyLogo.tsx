'use client';

import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { companyLogoName } from '@/lib/companyLogo';

/**
 * Renders a company's logo from `public/logos/<name>.png`, or nothing if
 * that file doesn't exist — a plain <img> lets the browser's own 404
 * trigger `onError`, which is simpler than probing for the file up front.
 */
export default function CompanyLogo({ company }: { company: string }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // The <img> already exists in the server-rendered HTML, so the browser
    // can start — and finish — loading it before this component hydrates
    // and `onError` below is wired up. Resource `error` events don't bubble
    // and never replay, so a fast 404 that beats hydration is otherwise lost
    // entirely, leaving a permanently broken image. This catches that case
    // by checking the already-settled state once mounted.
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

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
        ref={imgRef}
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
