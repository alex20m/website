// Paste your LaTeX resume section here to update the Experience page.
// Just paste raw LaTeX — no need to escape backslashes.
// Lines starting with % are treated as comments and ignored automatically.

const latexResume = String.raw`
%-----------EXPERIENCE-----------%
\section{Experience}
\resumeSubHeadingListStart

    \resumeSubheading
    {Consultant}{Oct 2026 -- Present}
    {Netlight}{Helsinki, Finland}
    \resumeItemListStart
        \resumeItem{Software engineering consulting}
    \resumeItemListEnd

    \resumeSubheading
    {AI \& Cloud Developer}{Jun 2026 -- Sep 2026}
    {KONE}{Espoo, Finland}
    \resumeItemListStart
        \resumeItem{Owned end-to-end design and implementation of an AI assistant for a company-wide internal AI portal}
        \resumeItem{Designed a LangGraph orchestrator agent coordinating specialized subagents on AWS Bedrock AgentCore}
        \resumeItem{Built subagents using RAG and MCP tools to help employees find knowledge and take actions via chat}
        \resumeItem{Designed and built the chat as a full-stack Next.js and React application, streaming agent responses in real time}
        \resumeItem{Owned agent-side DevOps: CI/CD, tests, response quality evals, AWS CDK infrastructure and observability}
    \resumeItemListEnd

    \resumeSubheading
    {Master's Thesis Worker}{Jan 2026 -- May 2026}
    {KONE}{Espoo, Finland}
    \resumeItemListStart
        \resumeItem{Researched MCP-based tool integration for AI agents as part of a Master's thesis}
        \resumeItem{Built AI agents and supporting infrastructure on AWS Bedrock AgentCore}
        \resumeItem{Connected the agents to internal systems through MCP servers, giving them access to company tools and data}
    \resumeItemListEnd

    \resumeSubheading
    {Software Engineer}{May 2025 -- Dec 2025}
    {KONE}{Espoo, Finland}
    \resumeItemListStart
        \resumeItem{Led test migration from Selenium to Playwright, improving test stability and reducing test execution time}
        \resumeItem{Mapped cross-team dependencies and wrote Robot Framework tests that catch breaking changes before releases, reducing manual testing}
        \resumeItem{Designed CI/CD pipelines and supporting infrastructure with Docker and YAML to automate deployments}
        \resumeItem{Developed a Python backend for a shared test-resource booking service built on AWS Lambda and DynamoDB}
    \resumeItemListEnd

    \resumeSubheading
    {Software Engineer}{May 2024 -- Aug 2024}
    {Danfoss Drives}{Vaasa, Finland}
    \resumeItemListStart
        \resumeItem{Developed safety-critical temperature control firmware in C for variable frequency drives}
        \resumeItem{Wrote automated tests in Python and Robot Framework to verify temperature control logic on drive simulators}
        \resumeItem{Maintained and extended the drive simulators and built Python scripts to automate repetitive development tasks}
    \resumeItemListEnd

    \resumeSubheading
    {Automation Engineer}{May 2022 -- Aug 2023}
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
