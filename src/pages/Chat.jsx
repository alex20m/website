import { useState } from 'react';
import { Typography, Box, TextField, IconButton, Stack, Paper, Link, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { motion } from 'framer-motion';
import useIsMobile from '../hooks/useIsMobile';

const WORKER_URL = 'https://portfolio-chat-worker.alex-mecklin.workers.dev';

const SUGGESTIONS = [
  'What is Alex working on?',
  'What are his skills?',
  'Tell me about his experience',
];

// Helper function to convert URLs in text to clickable links
const linkifyText = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+|#[a-z]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      // Handle hash links (internal navigation)
      if (part.startsWith('#')) {
        const sectionId = part.slice(1);
        return (
          <Link
            key={i}
            href={part}
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(sectionId);
              if (element) {
                const offset = 80;
                const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
              }
            }}
            sx={{
              color: 'inherit',
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': { color: '#1565c0' },
            }}
          >
            {part}
          </Link>
        );
      }
      // Handle external links
      return (
        <Link
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'inherit',
            textDecoration: 'underline',
            '&:hover': { color: '#1565c0' },
          }}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
};

function Chat() {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok || !response.body) {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let firstToken = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        let chunkContent = '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const json = JSON.parse(data);
            const token = json.choices?.[0]?.delta?.content;
            if (token) {
              chunkContent += token;
            }
          } catch {
            // ignore malformed SSE lines
          }
        }

        if (chunkContent) {
          if (firstToken) {
            // First chunk: hide "Thinking..." and add assistant message
            setLoading(false);
            setMessages([...newMessages, { role: 'assistant', content: chunkContent }]);
            firstToken = false;
          } else {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + chunkContent,
              };
              return updated;
            });
          }
        }
      }

      // If no tokens ever came through, show fallback
      if (firstToken) {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I could not generate a response.' }]);
        setLoading(false);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: '#0a1929' }}>Ask AI</Typography>
      <Typography variant="body1" sx={{ mb: isMobile ? 2 : 3 }}>
        Have a question about me? Ask the AI assistant — it knows about my experience, skills, and projects.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          border: '1px solid #e3eaf6',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? 400 : 480,
        }}
      >
        {/* Messages area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            backgroundColor: '#f8f9fb',
          }}
        >
          {messages.length === 0 && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 2 }}>
              <SmartToyOutlinedIcon sx={{ fontSize: 40, color: '#c8d6e5' }} />
              <Typography variant="body1" sx={{ color: '#8a9bb5', textAlign: 'center' }}>
                Ask me anything about Alex
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
                {SUGGESTIONS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    onClick={() => sendMessage(s)}
                    variant="outlined"
                    sx={{
                      borderColor: '#e3eaf6',
                      backgroundColor: '#fff',
                      color: '#4a5568',
                      fontSize: '0.8rem',
                      '&:hover': { borderColor: '#1565c0', color: '#1565c0' },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: msg.role === 'user' ? '#0a1929' : '#e3eaf6',
                    color: msg.role === 'user' ? '#fff' : '#1565c0',
                    flexShrink: 0,
                    mt: 0.5,
                  }}
                >
                  {msg.role === 'user' ? <PersonOutlineIcon sx={{ fontSize: 16 }} /> : <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />}
                </Box>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: msg.role === 'user' ? '#0a1929' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#0a1929',
                    border: msg.role === 'assistant' ? '1px solid #e3eaf6' : 'none',
                    maxWidth: '80%',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.role === 'assistant' ? linkifyText(msg.content) : msg.content}
                </Box>
              </Box>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e3eaf6',
                    color: '#1565c0',
                    flexShrink: 0,
                    mt: 0.5,
                  }}
                >
                  <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    border: '1px solid #e3eaf6',
                    color: '#8a9bb5',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                  }}
                >
                  Thinking...
                </Box>
              </Box>
            </motion.div>
          )}

          <div />
        </Box>

        {/* Input area */}
        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid #e3eaf6',
            backgroundColor: '#fff',
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
          }}
        >
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            multiline
            maxRows={3}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: isMobile ? '0.85rem' : '0.9rem',
              },
            }}
          />
          <IconButton
            aria-label="Send message"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            sx={{
              backgroundColor: '#0a1929',
              color: '#fff',
              borderRadius: 2,
              width: 40,
              height: 40,
              '&:hover': { backgroundColor: '#1565c0' },
              '&.Mui-disabled': { backgroundColor: '#e3eaf6', color: '#8a9bb5' },
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

export default Chat;
