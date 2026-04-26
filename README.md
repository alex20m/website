# Alex Mecklin - Portfolio Website

Professional portfolio website showcasing my experience, projects, and CV. Built with a focus on recruiter accessibility - clean design, intuitive navigation, and mobile-optimized layout.

🔗 **Live Site:** [alexmecklin.com](https://alexmecklin.com)

## Overview

Single-page React application with smooth scrolling navigation between sections:
- **About** - Introduction with skills overview
- **Experience** - Timeline view of work history with company logos
- **CV** - Downloadable resume with LaTeX parsing
- **Projects** - Grid showcase of personal projects
- **Contact** - Quick access to email, phone, LinkedIn, and GitHub

## Tech Stack

- **React 18.2.0** - UI framework
- **Material-UI v5** - Component library (Typography, Box, Button, Grid, AppBar, etc.)
- **Framer Motion** - Smooth entrance animations
- **Emotion** - CSS-in-JS styling

## Key Features

### Design
- Navy blue professional theme (`#0a1929`)
- Consistent 3-level typography system (h2/h5/body1) with responsive scaling
- Always-visible navigation bar
- Smooth scroll behavior with proper offsets

### Mobile Optimization
- Responsive breakpoints (xs: <600px, md: ≥900px)
- Collapsible experience descriptions on mobile (100 char limit)
- Compact spacing and font sizes for small screens
- Hamburger menu navigation

### Experience Section
- Vertical timeline layout with visual dots
- Dynamic company logo loading from `/assets/logos/`
- Automatic LaTeX CV parsing from `data/latexResume.js`
- Show more/less functionality on mobile

## Project Structure

```
src/
├── App.js                     # Theme provider & routing
├── components/
│   └── Navbar.js              # Fixed navigation with mobile drawer
├── pages/
│   ├── About.js               # Hero with profile photo & skills
│   ├── Experience.js          # Timeline with logo components
│   ├── Resume.js              # CV download button
│   ├── Projects.js            # Project cards with tech tags
│   └── Contact.js             # Clickable contact cards
├── data/
│   └── latexResume.js         # Raw LaTeX CV content
└── assets/
    ├── Alex_Mecklin_CV.pdf    # Downloadable resume
    ├── profile.png            # Profile photo
    └── logos/                 # Company logo images
```

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (opens localhost:3000)
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Deployment

Automatic CI/CD pipeline via GitHub Actions — triggers on every push or merge to `main`.

**Workflow structure:**
```
.github/workflows/
├── main.yml           # Orchestrates the pipeline
└── jobs/
    ├── build-job.yml  # Installs deps, builds app, uploads artifact
    └── deploy-job.yml # Downloads artifact, deploys to gh-pages branch
```

**Pipeline steps:**
1. `build` — runs `npm ci` + `npm run build`, uploads `build/` as a workflow artifact
2. `deploy` — downloads the artifact and pushes it to the `gh-pages` branch via [`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages)

The artifact name is defined once in `build-job.yml` and threaded through to `deploy-job.yml` via workflow outputs. Custom domain is preserved via `public/CNAME` which React copies into `build/` automatically.

> To deploy manually: `npm run build && npm run deploy`

## Design Principles

**Typography System:**
- Section headers: `h2` (2.2rem desktop / 1.6rem mobile)
- Subsection headers: `h5` (1.4rem desktop / 1.1rem mobile)  
- Body text: `body1` (0.95rem desktop / 0.85rem mobile)
- No font size overrides - all sizing controlled via theme

**Color Palette:**
- Primary: `#0a1929` (navy)
- Accent: `#1565c0` (blue)
- Text: `#4a5568` (gray)
- Backgrounds: `#f8f9fb` / `#ffffff`

**Responsive Strategy:**
- Mobile-first collapsible content
- Grid layouts adapt to single column
- Icons and spacing scale down proportionally
- Desktop maintains comfortable reading sizes
