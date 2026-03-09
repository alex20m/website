import { Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import latexResume from '../data/latexResume';

// To update: open src/data/latexResume.js and paste your raw LaTeX directly.
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
    experiences.push({ title, company, description, period });
  }
  return experiences;
}

const experiences = parseLatexExperience(latexResume);

function Experience() {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          color="primary"
          sx={{ 
            mb: 4,
            fontWeight: 'bold'
          }}
        >
          Experience
        </Typography>
      </motion.div>

      <Box sx={{ 
        width: '100%', 
        maxWidth: '800px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {experiences.map((exp, index) => (
            <Box key={index} sx={{ mb: index === experiences.length - 1 ? 0 : 4 }}>
              <Typography 
                variant="h5" 
                color="primary"
                sx={{ fontWeight: 600 }}
              >
                {exp.title}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ mt: 1, fontWeight: 500 }}
              >
                {exp.company}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.6 }}
              >
                {Array.isArray(exp.description) ? (
                  <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                    {exp.description.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  exp.description
                )}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 1, fontStyle: 'italic' }}
              >
                {exp.period}
              </Typography>
            </Box>
          ))}
        </motion.div>
      </Box>
    </Box>
  );
}

export default Experience;
