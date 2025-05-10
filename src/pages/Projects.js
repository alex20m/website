import { Typography, Box, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useState, useRef, useEffect } from 'react';

function Projects() {
  const [showArrow, setShowArrow] = useState(true);
  const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const isAtEnd = Math.abs(scrollWidth - clientWidth - scrollLeft) < 1;
      setShowArrow(!isAtEnd);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const projects = [
    {
      title: "Personal Website",
      description: "Personal website built using Cursor AI, trying out its AI capabilities.",
      technologies: ["JavaScript", "React.js"],
      github: "https://github.com/alex20m/website",
    },
    {
      title: "Salary Predictor",
      description: "Machine learning model used to predict salaries for employees.",
      technologies: ["Python", "Machine Learning"],
      github: "https://github.com/alex20m/Salary_predictor",
    },
    {
      title: "Test Project 1",
      description: "Coming soon...",
      technologies: ["Coming", "Soon"],
      github: "https://github.com/alex20m/test1",
    },
    {
      title: "Test Project 2",
      description: "Coming soon...",
      technologies: ["Coming", "Soon"],
      github: "https://github.com/alex20m/test2",
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

      <Box sx={{ position: 'relative' }}>
        {showArrow && (
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  opacity: 0.5,
                  transform: 'translateY(-50%) translateX(0)',
                },
                '50%': {
                  opacity: 1,
                  transform: 'translateY(-50%) translateX(-10px)',
                },
                '100%': {
                  opacity: 0.5,
                  transform: 'translateY(-50%) translateX(0)',
                },
              },
            }}
          >
            <ArrowForwardIosIcon 
              sx={{ 
                color: 'primary.main',
                fontSize: '2rem',
              }} 
            />
          </Box>
        )}

        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            px: 2,
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
            msOverflowStyle: 'none',
            '&::after': {
              content: '""',
              minWidth: '40px',
              height: '100%',
            },
          }}
        >
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Box
                sx={{
                  minWidth: 275,
                  maxWidth: 275,
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(0)',
                  transition: 'all 0.2s ease-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
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
    </Box>
  );
}

export default Projects; 