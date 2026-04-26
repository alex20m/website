import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import ResumeFile from '../assets/Alex_Mecklin_CV.pdf';

export const contacts = [
  { icon: <EmailIcon />, label: 'Email', value: 'alex.mecklin@outlook.com', href: 'mailto:alex.mecklin@outlook.com' },
  { icon: <PhoneIcon />, label: 'Phone', value: '+358 442046661', href: 'tel:+358442046661' },
  { icon: <LinkedInIcon />, label: 'LinkedIn', value: 'linkedin.com/in/alex-mecklin', href: 'https://www.linkedin.com/in/alex-mecklin', external: true },
  { icon: <GitHubIcon />, label: 'GitHub', value: 'github.com/alex20m', href: 'https://github.com/alex20m', external: true },
];

export const cv = {
  file: ResumeFile,
  filename: 'Alex_Mecklin_CV.pdf',
};
