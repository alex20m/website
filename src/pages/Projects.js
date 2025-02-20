import { Typography, Box, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import GitHubIcon from '@mui/icons-material/GitHub';

function Projects() {
  const projects = [
    {
      title: "Portfolio Website",
      description: "A modern, responsive portfolio website built with React and Material-UI. Features include smooth animations, component-based architecture, and responsive design.",
      technologies: ["React", "TypeScript", "Material-UI", "Node.js"],
      github: "https://github.com/alex20m/website",
    },
    {
      title: "Test Project 1",
      description: "This is a test project to demonstrate the horizontal scrolling layout. It shows how projects would appear in the portfolio.",
      technologies: ["React", "Node.js", "Example Tech", "Demo"],
      github: "https://github.com/alex20m/test1",
    },
    {
      title: "Test Project 2",
      description: "Another example project showcasing the card layout and hover effects. Not a real project, just for demonstration.",
      technologies: ["Demo", "Test", "Example", "Layout"],
      github: "https://github.com/alex20m/test2",
    },
    {
      title: "Test Project 3",
      description: "A third test project to show how multiple projects appear in the horizontal scroll view. This is just for demonstration purposes.",
      technologies: ["Sample", "Demo", "Test", "Layout"],
      github: "https://github.com/alex20m/test3",
    },
  ];

  return (
    <Box>
      <Typography 
        variant="h2" 
        gutterBottom 
        color="primary"
        sx={{ 
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4
        }}
      >
        My Projects
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 2, // Add padding bottom for scrollbar
          '::-webkit-scrollbar': {
            height: 8,
          },
          '::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: 4,
          },
          '::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          },
          scrollBehavior: 'smooth',
          msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
        }}
      >
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ y: -5 }}
          >
            <Box
              sx={{
                minWidth: 300,
                maxWidth: 300,
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(255,255,255,0.7)',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                },
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                {project.title}
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2,
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {project.description}
              </Typography>

              <Box sx={{ mb: 2 }}>
                {project.technologies.map((tech, i) => (
                  <Chip
                    key={i}
                    label={tech}
                    size="small"
                    sx={{ 
                      mr: 1, 
                      mb: 1,
                      background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
                      color: 'white',
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                mt: 'auto'
              }}>
                {project.github && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<GitHubIcon />}
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub
                  </Button>
                )}
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}

export default Projects; 