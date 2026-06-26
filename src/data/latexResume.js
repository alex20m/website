// Paste your LaTeX resume section here to update the Experience page.
// Just paste raw LaTeX — no need to escape backslashes.
// Lines starting with % are treated as comments and ignored automatically.

const latexResume = String.raw`
%-----------EXPERIENCE-----------%
\section{Experience}
\resumeSubHeadingListStart

    \resumeSubheading
    {AI \& Cloud Developer Intern}{Jun 2026 -- Present}
    {KONE}{Espoo, Finland}
    \resumeItemListStart
        \resumeItem{Built and deployed AI agents on AWS AgentCore as part of an internal agentic AI platform}
        \resumeItem{Developed full stack features across the platform using TypeScript and React}
    \resumeItemListEnd

    \resumeSubheading
    {Master’s Thesis Worker}{Jan 2026 -- May 2026}
    {KONE}{Espoo, Finland}
    \resumeItemListStart
        \resumeItem{Developed agentic AI systems as part of my Master’s thesis}
        \resumeItem{Designed and built AI agents and supporting infrastructure on AWS}
        \resumeItem{Integrated MCP servers to enable communication between AI agents and internal systems}
    \resumeItemListEnd

    \resumeSubheading
    {Software Engineer Intern}{May 2025 -- Dec 2025}
    {KONE}{Espoo, Finland}
    \resumeItemListStart
        \resumeItem{Created automated tests for web applications using Python, Robot Framework, Selenium and Playwright}
        \resumeItem{Designed and implemented CI/CD pipelines and supporting infrastructure using Docker and YAML to automate development, testing, and deployment processes}
        \resumeItem{Developed backend services using Python for an internal platform, leveraging AWS Lambda and DynamoDB}
        \resumeItem{Used AWS to interact with cloud-hosted systems and manage data storage}
    \resumeItemListEnd

    \resumeSubheading
    {Software Engineer Intern}{May 2024 -- Aug 2024}
    {Danfoss Drives}{Vaasa, Finland}
    \resumeItemListStart
        \resumeItem{Developed automated tests for embedded systems using Python and Robot Framework}
        \resumeItem{Software development for embedded systems using C}
        \resumeItem{Built Python scripts to automate repetitive tasks in the development process}
    \resumeItemListEnd

    \resumeSubheading
    {Automation Engineer Intern}{May 2022 -- Aug 2023}
    {Wärtsilä}{Vaasa, Finland}
    \resumeItemListStart
        \resumeItem{Conducted investigations on returned automation parts from field installations}
        \resumeItem{Handled customer deliveries of engine automation software tools}
    \resumeItemListEnd
    
    \resumeSubheading
    {Teaching Assistant}{Sep 2022 -- Dec 2022}
    {Aalto University}{Espoo, Finland}
    \resumeItemListStart
        \resumeItem{Worked part-time as a teaching assistant in a basics in Python programming course}
        \resumeItem{Assisted students with their homework}
        \resumeItem{Graded home assignments}
    \resumeItemListEnd

\resumeSubHeadingListEnd
`;

export default latexResume;
