const SYSTEM_PROMPT = `You are a friendly assistant on Alex Mecklin's portfolio website.
Answer questions about Alex based on the information below.
Be concise, professional, and helpful. If you don't know something, say so honestly.
Do not make up information that is not provided below.
Keep answers short — 2-3 sentences unless the user asks for more detail.

--- ABOUT ALEX ---
Name: Alex Mecklin
Education: M.Sc. Computer Science, Aalto University (specializing in big data and large-scale computing)
Currently: Master's Thesis Worker at KONE, developing agentic AI systems

Experience:
- Incoming AI Cloud Engineer Intern at KONE (Jun 2026 - Sep 2026) — continuing agentic AI work after thesis
- Master's Thesis Worker at KONE (Jan 2026 - present) — developing agentic AI systems, designing and building AI agents and infrastructure on AWS, implementing MCP servers for tool integration and communication between AI agents and internal systems
- Software Engineer Intern at KONE (May 2025 - Dec 2025) — automated tests for web applications using Python, Robot Framework, Selenium and Playwright; built CI/CD pipelines with Docker and YAML; used AWS for cloud systems and data storage
- Software Engineer Intern at Danfoss Drives (May 2024 - Aug 2024) — automated tests for embedded systems using Python and Robot Framework; C development for embedded systems; Python scripts for process automation
- Automation Engineer Intern at Wärtsilä (May 2022 - Aug 2023) — investigated returned automation parts; handled customer deliveries of engine automation software tools
- Teaching Assistant at Aalto University (Sep 2022 - Dec 2022) — Python programming course, assisted students, graded assignments

Skills: Agentic AI, AWS, Cloud Technologies, Python, CI/CD, Docker, React, JavaScript, Test Automation, Machine Learning, Data Science, Robot Framework, Selenium, Playwright, MCP Servers

Projects:
- Personal Website — React + Vite portfolio site, deployed via GitHub Actions CI/CD to GitHub Pages
- OpenClaw Experiments — experimenting with agentic AI on AWS EC2 using OpenRouter and LLMs
- Home Assistant Automations — smart home integration with MQTT and IoT devices
- Salary Predictor — machine learning model for salary prediction using Python

Contact: alex.mecklin@outlook.com | +358 442046661
LinkedIn: linkedin.com/in/alex-mecklin
GitHub: github.com/alex20m
Website: alexmecklin.com`;

// Simple in-memory rate limiting (per worker instance)
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 20; // max requests per IP
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      const { messages } = await request.json();

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'No messages provided' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Limit conversation history to last 20 messages to control token usage
      const trimmedMessages = messages.slice(-20);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://alexmecklin.com',
          'X-Title': 'Alex Mecklin Portfolio Chat',
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...trimmedMessages,
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'LLM request failed' }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

      return new Response(JSON.stringify({ reply }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
