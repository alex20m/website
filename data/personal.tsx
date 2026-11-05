import type { ReactNode } from 'react';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';

export const profile = {
  name: 'Alex Mecklin',
  title: 'AI & Cloud Engineer',
  bio: 'AI-focused engineer with hands-on experience building agentic AI systems and cloud-based full stack applications. Background spanning embedded systems and test automation. Currently working as a consultant at Netlight.',
  // focalX/focalY/zoom mirror CSS's object-position + transform: scale() —
  // the single crop definition both the live Avatar and the generated OG
  // image (which can't use those CSS properties directly) render from.
  photo: { src: '/profile.png', width: 703, height: 940, focalX: 50, focalY: 70, zoom: 1.2 },
};

export interface Contact {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

export const contacts: Contact[] = [
  { icon: <EmailIcon />, label: 'Email', value: 'alex.mecklin@outlook.com', href: 'mailto:alex.mecklin@outlook.com' },
  { icon: <PhoneIcon />, label: 'Phone', value: '+358 442046661', href: 'tel:+358442046661' },
  { icon: <LinkedInIcon />, label: 'LinkedIn', value: 'linkedin.com/in/alex-mecklin', href: 'https://www.linkedin.com/in/alex-mecklin', external: true },
  { icon: <GitHubIcon />, label: 'GitHub', value: 'github.com/alex20m', href: 'https://github.com/alex20m', external: true },
];

export const cv = {
  file: '/Alex_Mecklin_CV.pdf',
  // Rendered from `file` at build time by app/cv-preview.png/route.ts, so it
  // always shows the PDF that is actually deployed. width/height are that
  // render's pixel size (an A4 page at PREVIEW_WIDTH), given to the <img> so
  // the layout does not jump while it loads.
  preview: { src: '/cv-preview.png', width: 900, height: 1274 },
};
