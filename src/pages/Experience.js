import { Typography, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import latexResume from '../data/latexResume';
import { useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function parseLatexExperience(latexString) {
  const experiences = [];
  const lines = latexString.split('\n').filter(line => !line.trim().startsWith('%'));
  const cleanedLatex = lines.join('\n');
  const subheadingRegex = /\\resumeSubheading\s*\{([^}]*)\}\{([^}]*)\}\s*\{([^}]*)\}\{([^}]*)\}/g;
  let match;
  while ((match = subheadingRegex.exec(cleanedLatex)) !== null) {
    const title = match[1].trim();
    const period = match[2].trim().replace(/--/g, '-');
    const company = match[3].trim();
    const location = match[4].trim();
    const startPos = match.index + match[0].length;
    const remainingText = cleanedLatex.substring(startPos);
    const itemsMatch = remainingText.match(/\\resumeItemListStart([\s\S]*?)\\resumeItemListEnd/);
    const description = [];
    if (itemsMatch) {
      const itemsText = itemsMatch[1];
      const itemRegex = /\\resumeItem\{([^}]*)\}/g;
      let itemMatch;
      while ((itemMatch = itemRegex.exec(itemsText)) !== null) {
        description.push(itemMatch[1].trim());
      }
    }
    experiences.push({ title, company, location, description, period });
  }
  return experiences;
}

const experiences = parseLatexExperience(latexResume);

function CompanyLogo({ company }) {
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    // Convert company name to lowercase with underscores
    const logoName = company.toLowerCase().replace(/\s+/g, '_');
    
    // Try to load logo based on company name
    import(`../assets/logos/${logoName}.png`)
      .then(module => setLogo(module.default))
      .catch(() => {
        // Try jpg if png fails
        import(`../assets/logos/${logoName}.jpg`)
          .then(module => setLogo(module.default))
          .catch(() => setLogo(null));
      });
  }, [company]);

  if (!logo) return null;

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
        src={logo}
        alt={company}
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

function Experience() {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: { xs: 3, md: 5 }, fontWeight: 'bold', color: '#0a1929' }}>Experience</Typography>
      <Box sx={{ position: 'relative', pl: { xs: 3, md: 5 } }}>
        {/* Timeline line */}
        <Box
          sx={{
            position: 'absolute',
            left: { xs: 6, md: 14 },
            top: 8,
            bottom: 8,
            width: 2,
            backgroundColor: '#c8d6e5',
          }}
        />
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Box sx={{ position: 'relative', mb: index === experiences.length - 1 ? 0 : 4 }}>
              {/* Timeline dot */}
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: -21, md: -29 },
                  top: 6,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#1565c0',
                  border: '3px solid #e3eaf6',
                }}
              />
              <Typography
                variant="body1"
                sx={{ color: '#1565c0', mb: 0.5 }}
              >
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
                      display: { xs: 'none', md: 'block' },
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
                      display: { xs: 'block', md: 'none' },
                      fontSize: '0.85rem',
                      '& li': { mb: 0.5 },
                    }}
                  >
                    {(() => {
                      const fullText = exp.description.join(' ');
                      const charLimit = 100;
                      
                      if (expandedItems[index] || fullText.length <= charLimit) {
                        return exp.description.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ));
                      }
                      
                      // Truncate text at character limit
                      let charCount = 0;
                      const truncatedItems = [];
                      
                      for (let item of exp.description) {
                        if (charCount + item.length <= charLimit) {
                          truncatedItems.push(<li key={truncatedItems.length}>{item}</li>);
                          charCount += item.length;
                        } else if (charCount < charLimit) {
                          const remaining = charLimit - charCount;
                          // Find last complete word before limit
                          let truncatedText = item.substring(0, remaining);
                          const lastSpaceIndex = truncatedText.lastIndexOf(' ');
                          if (lastSpaceIndex > 0) {
                            truncatedText = truncatedText.substring(0, lastSpaceIndex);
                          }
                          truncatedItems.push(
                            <li key={truncatedItems.length}>{truncatedText}...</li>
                          );
                          break;
                        } else {
                          break;
                        }
                      }
                      
                      return truncatedItems;
                    })()}
                  </Box>
                  
                  {exp.description.join(' ').length > 100 && (
                    <Button
                      size="small"
                      onClick={() => toggleExpand(index)}
                      endIcon={expandedItems[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{
                        display: { xs: 'inline-flex', md: 'none' },
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
        ))}
      </Box>
    </Box>
  );
}

export default Experience;
