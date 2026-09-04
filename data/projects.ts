export interface Project {
  title: string;
  description: string;
  technologies: string[];
  github?: string;
  link?: string;
  linkLabel?: string;
  private?: boolean;
}

const projects: Project[] = [
  {
    title: 'Elixia Booker',
    description: 'Automatically books group fitness classes at Elixia (SATS Group) the moment booking opens, using QStash to wake up and book at the exact release millisecond.',
    technologies: ['Next.js', 'TypeScript', 'React', 'Neon', 'Vercel', 'QStash'],
    github: 'https://github.com/alex20m/elixia_booker',
    link: 'https://elixia.alexmecklin.com',
    linkLabel: 'Visit Website',
  },
  {
    title: 'Job Application Tracker',
    description: 'Cross-device job application tracker with authentication, persistent storage, and PWA support. Installable on mobile and desktop.',
    technologies: ['Next.js', 'TypeScript', 'React', 'Supabase', 'Vercel', 'Tailwind CSS'],
    github: 'https://github.com/alex20m/application_tracker',
    link: 'https://job.alexmecklin.com',
    linkLabel: 'Visit Website',
  },
  {
    title: 'Trip Planner',
    description: 'A PWA for planning trips together, with a shared weekly calendar, email invitations, offline mode, and calendar sync via .ics feeds.',
    technologies: ['Next.js', 'TypeScript', 'React', 'Supabase', 'Vercel', 'Tailwind CSS'],
    github: 'https://github.com/alex20m/trip_planner',
    link: 'https://trips.alexmecklin.com',
    linkLabel: 'Visit Website',
  },
  {
    title: 'Personal Website',
    description: 'This personal portfolio website showcasing my projects and experience.',
    technologies: ['TypeScript', 'Next.js', 'React'],
    github: 'https://github.com/alex20m/website',
  },
  {
    title: 'Home Assistant Automations',
    description: 'Personal home automation project using Home Assistant to integrate smart devices, sensors, and custom automations for a smarter home.',
    technologies: ['YAML', 'MQTT', 'IoT'],
    link: 'https://www.home-assistant.io/',
    private: true,
  },
  {
    title: 'Salary Predictor',
    description: 'Machine learning model used to predict salaries for employees.',
    technologies: ['Python', 'Machine Learning'],
    github: 'https://github.com/alex20m/Salary_predictor',
  },
];

export default projects;
