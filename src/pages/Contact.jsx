import { Typography, Box, Link, Grid } from '@mui/material';
import useIsMobile from '../hooks/useIsMobile';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';

const contacts = [
  { icon: <EmailIcon />, label: 'Email', value: 'alex.mecklin@outlook.com', href: 'mailto:alex.mecklin@outlook.com' },
  { icon: <PhoneIcon />, label: 'Phone', value: '+358 442046661', href: 'tel:+358442046661' },
  { icon: <LinkedInIcon />, label: 'LinkedIn', value: 'linkedin.com/in/alex-mecklin', href: 'https://www.linkedin.com/in/alex-mecklin', external: true },
  { icon: <GitHubIcon />, label: 'GitHub', value: 'github.com/alex20m', href: 'https://github.com/alex20m', external: true },
];

function Contact() {
  const isMobile = useIsMobile();
  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h2" sx={{ mb: isMobile ? 3 : 5, fontWeight: 'bold', color: '#0a1929' }}>Contact</Typography>
      <Grid container spacing={isMobile ? 1.5 : 2}>
        {contacts.map((c, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Link
              href={c.href}
              target={c.external ? '_blank' : undefined}
              rel={c.external ? 'noopener noreferrer' : undefined}
              underline="none"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 1.5 : 2,
                p: isMobile ? 2 : 2.5,
                borderRadius: 3,
                border: '1px solid #e3eaf6',
                backgroundColor: '#fff',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#1565c0',
                  boxShadow: '0 2px 12px rgba(10,25,41,0.08)',
                },
              }}
            >
              <Box
                sx={{
                  width: isMobile ? 36 : 44,
                  height: isMobile ? 36 : 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#e3eaf6',
                  color: '#1565c0',
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </Box>
              <Box>
                <Typography variant="body1" sx={{ color: '#4a5568' }}>
                  {c.label}
                </Typography>
                <Typography variant="body1" sx={{ color: '#0a1929', fontWeight: 600, wordBreak: 'break-word' }}>
                  {c.value}
                </Typography>
              </Box>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Contact;
