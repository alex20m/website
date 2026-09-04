'use client';

import { Typography, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import latexResume from '@/data/latexResume';
import { parseLatexExperience } from '@/lib/parseLatexExperience';
import { truncateDescription } from '@/lib/truncateDescription';
import useIsMobile from '@/hooks/useIsMobile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CompanyLogo from '@/components/sections/CompanyLogo';

const experiences = parseLatexExperience(latexResume);
const MOBILE_CHAR_LIMIT = 100;

export default function Experience() {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const isMobile = useIsMobile();

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: isMobile ? 3 : 5, fontWeight: 'bold', color: '#0a1929' }}>Experience</Typography>
      <Box sx={{ position: 'relative', pl: isMobile ? 3 : 5 }}>
        {/* Timeline line */}
        <Box
          sx={{
            position: 'absolute',
            left: isMobile ? 6 : 14,
            top: 8,
            bottom: 8,
            width: 2,
            backgroundColor: '#c8d6e5',
          }}
        />
        {experiences.map((exp, index) => {
          const isTruncatable = exp.description.join(' ').length > MOBILE_CHAR_LIMIT;
          const mobileItems = expandedItems[index]
            ? exp.description
            : truncateDescription(exp.description, MOBILE_CHAR_LIMIT);

          return (
            <motion.div
              key={`${exp.company}-${exp.title}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Box sx={{ position: 'relative', mb: index === experiences.length - 1 ? 0 : 4 }}>
                {/* Timeline dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: isMobile ? -21 : -29,
                    top: 6,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#1565c0',
                    border: '3px solid #e3eaf6',
                  }}
                />
                <Typography variant="body1" sx={{ color: '#1565c0', mb: 0.5 }}>
                  {exp.period}
                </Typography>
                <Typography variant="h5" sx={{ color: '#0a1929' }}>
                  {exp.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <CompanyLogo company={exp.company} />
                  <Typography variant="body1" sx={{ color: '#4a5568' }}>
                    {exp.company} · {exp.location}
                  </Typography>
                </Box>
                {exp.description.length > 0 && (
                  <>
                    {/* Desktop: show full list */}
                    <Box
                      component="ul"
                      sx={{
                        m: 0,
                        pl: 2.5,
                        color: '#4a5568',
                        display: isMobile ? 'none' : 'block',
                        fontSize: '0.95rem',
                        '& li': { mb: 0.5 },
                      }}
                    >
                      {exp.description.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </Box>

                    {/* Mobile: show truncated or full */}
                    <Box
                      component="ul"
                      sx={{
                        m: 0,
                        pl: 2.5,
                        color: '#4a5568',
                        display: isMobile ? 'block' : 'none',
                        fontSize: '0.85rem',
                        '& li': { mb: 0.5 },
                      }}
                    >
                      {mobileItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </Box>

                    {isTruncatable && (
                      <Button
                        size="small"
                        onClick={() => toggleExpand(index)}
                        endIcon={expandedItems[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{
                          display: isMobile ? 'inline-flex' : 'none',
                          mt: 1,
                          color: '#1565c0',
                          textTransform: 'none',
                          padding: '4px 8px',
                        }}
                      >
                        {expandedItems[index] ? 'Show less' : 'Show more'}
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}
