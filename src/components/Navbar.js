import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function Navbar() {
  const [showArrow, setShowArrow] = useState(false);
  const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const isAtEnd = Math.abs(scrollWidth - clientWidth - scrollLeft) < 1;
      const hasOverflow = scrollWidth > clientWidth;
      setShowArrow(hasOverflow && !isAtEnd);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      // Add resize listener to recheck on window resize
      window.addEventListener('resize', handleScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <AppBar 
      sx={{ 
        mb: 2,
        backgroundColor: '#1976d2',
        boxShadow: 3,
      }}
    >
      <Toolbar sx={{ position: 'relative' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mr: 4,
            fontWeight: 'bold',
            color: 'white',
            flexShrink: 0
          }}
        >
          Alex Mecklin
        </Typography>
        <Box 
          ref={scrollContainerRef}
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            gap: 2,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '::-webkit-scrollbar': {
              display: 'none'
            },
            msOverflowStyle: 'none',
            position: 'relative',
            '&::after': {
              content: '""',
              minWidth: '40px',
              height: '100%',
            }
          }}
        >
          <Button 
            color="inherit"
            onClick={() => scrollToSection('about')}
            sx={{ color: 'white', flexShrink: 0 }}
          >
            About
          </Button>
          <Button 
            color="inherit"
            onClick={() => scrollToSection('experience')}
            sx={{ color: 'white', flexShrink: 0 }}
          >
            Experience
          </Button>
          <Button 
            color="inherit"
            onClick={() => scrollToSection('cv')}
            sx={{ color: 'white', flexShrink: 0 }}
          >
            CV
          </Button>
          <Button 
            color="inherit"
            onClick={() => scrollToSection('projects')}
            sx={{ color: 'white', flexShrink: 0 }}
          >
            Projects
          </Button>
          <Button 
            color="inherit"
            onClick={() => scrollToSection('contact')}
            sx={{ color: 'white', flexShrink: 0 }}
          >
            Contact
          </Button>
        </Box>
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
                color: 'white',
                fontSize: '1.5rem',
              }} 
            />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 