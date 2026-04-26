import { Typography, Box, Button, Chip, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import useIsMobile from '../hooks/useIsMobile';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import projects from '../data/projects.js';

function Projects() {
  const isMobile = useIsMobile();
  return (
    <Box>
      <Typography variant="h2" sx={{ mb: isMobile ? 3 : 5, fontWeight: 'bold', color: '#0a1929' }}>Projects</Typography>
      <Grid container spacing={isMobile ? 2 : 3}>
        {projects.map((project, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              style={{ height: '100%' }}
            >
              <Box
                sx={{
                  p: isMobile ? 2 : 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid #e3eaf6',
                  backgroundColor: '#f8f9fb',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#1565c0',
                    boxShadow: '0 4px 20px rgba(10,25,41,0.08)',
                  },
                }}
              >
                <Typography variant="h5" sx={{ color: '#0a1929', mb: isMobile ? 0.5 : 1 }}>
                  {project.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: isMobile ? 1.5 : 2, flexGrow: 1 }}>
                  {project.description}
                </Typography>
                <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
                  {project.technologies.map((tech, i) => (
                    <Chip
                      key={i}
                      label={tech}
                      size="small"
                      sx={{
                        mr: 0.5,
                        mb: 0.5,
                        backgroundColor: '#e3eaf6',
                        color: '#0a1929',
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
                  {project.github && (
                    <Button
                      size="small"
                      startIcon={<GitHubIcon />}
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      sx={{ color: '#0a1929', borderColor: '#c8d6e5', padding: '4px 12px', '&:hover': { borderColor: '#0a1929', backgroundColor: 'rgba(10,25,41,0.04)' } }}
                    >
                      View on GitHub
                    </Button>
                  )}
                  {project.link && (
                    <Button
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      sx={{ color: '#0a1929', borderColor: '#c8d6e5', padding: '4px 12px', '&:hover': { borderColor: '#0a1929', backgroundColor: 'rgba(10,25,41,0.04)' } }}
                    >
                      {project.linkLabel || 'Learn More'}
                    </Button>
                  )}
                  {project.private && (
                    <Chip
                      label="Private"
                      size="small"
                      icon={<GitHubIcon style={{ fontSize: 14 }} />}
                      sx={{ color: '#4a5568', borderColor: '#c8d6e5', border: '1px solid', background: 'transparent' }}
                    />
                  )}
                </Box>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Projects;
