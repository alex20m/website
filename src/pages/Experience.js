import { Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

// Add or edit experiences here
const experiences = [
  {
    title: "Test Automation Engineer, Trainee",
    company: "KONE",
    description: [
      "Developed automated tests for web applications using Python, Robot Framework and Selenium",
      "Used AWS to interact with cloud-hosted systems and manage data storage",
      "Performed manual testing to identify complex bugs and edge cases",
      "Collaborated closely with developers to understand new features and design effective test cases"
    ],
    period: "May 2025 - Present"
  },
  {
    title: "Software Engineer, Trainee",
    company: "Danfoss Drives",
    description: [
      "Developed automated tests for embedded systems using Python and Robot Framework",
      "Software development for embedded systems using C",
      "Developed Python scripts to boost efficiency and automate repetitive tasks in the development process"
    ],
    period: "May - August 2024"
  },
  {
    title: "Engine Automation Trainee ",
    company: "Wärtsilä",
    description: [
      "Conducted investigations on returned automation parts from field installations",
      "Performed maintenance on engine simulation rig",
      "Handled customer deliveries of engine automation software tools"
    ],
    period: "May 2022 - August 2023"
  }
];

function Experience() {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          color="primary"
          sx={{ 
            mb: 4,
            fontWeight: 'bold'
          }}
        >
          Experience
        </Typography>
      </motion.div>

      <Box sx={{ 
        width: '100%', 
        maxWidth: '800px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {experiences.map((exp, index) => (
            <Box key={index} sx={{ mb: index === experiences.length - 1 ? 0 : 4 }}>
              <Typography 
                variant="h5" 
                color="primary"
                sx={{ fontWeight: 600 }}
              >
                {exp.title}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ mt: 1, fontWeight: 500 }}
              >
                {exp.company}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.6 }}
              >
                {Array.isArray(exp.description) ? (
                  <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                    {exp.description.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  exp.description
                )}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 1, fontStyle: 'italic' }}
              >
                {exp.period}
              </Typography>
            </Box>
          ))}
        </motion.div>
      </Box>
    </Box>
  );
}

export default Experience; 