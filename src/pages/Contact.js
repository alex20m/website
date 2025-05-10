import { Container, Typography, Box, Link } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';

function Contact() {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    }}>
      <Typography 
        variant="h2" 
        gutterBottom 
        color="primary"
        sx={{ 
          fontWeight: 'bold',
          mb: 4
        }}
      >
        Contact me
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-start',
        gap: 3,
        maxWidth: '500px',
        width: '100%',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <EmailIcon color="primary" />
          <Typography variant="h6">
            Email: <Link href="mailto:alex.mecklin@hotmail.com" underline="hover">
              alex.mecklin@hotmail.com
            </Link>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <PhoneIcon color="primary" />
          <Typography variant="h6">
            Phone: <Link href="tel:+358442046661" underline="hover">
              +358 442046661
            </Link>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <LinkedInIcon color="primary" />
          <Typography variant="h6">
            LinkedIn: <Link href="https://www.linkedin.com/in/alex-mecklin" target="_blank" rel="noopener noreferrer" underline="hover">
            linkedin.com/in/alex-mecklin
            </Link>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <GitHubIcon color="primary" />
          <Typography variant="h6">
            GitHub: <Link href="https://github.com/alex20m" target="_blank" rel="noopener noreferrer" underline="hover">
            github.com/alex20m
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Contact; 