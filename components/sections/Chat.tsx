'use client';

import { useState, useEffect, useRef, type ReactNode, type KeyboardEvent, type MouseEvent } from 'react';
import { Typography, Box, TextField, IconButton, Stack, Paper, Chip, Avatar } from '@mui/material';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';
import useIsMobile from '@/hooks/useIsMobile';
import { parseSseChunk } from '@/lib/chatStream';
import { profile } from '@/data/personal';

const CHAT_API_URL = '/api/chat';

const SUGGESTIONS = [
  'What are you working on?',
  'What are your skills?',
  'Tell me about your experience',
];

const GREETING = "Hi 👋 I'm AI Alex Mecklin. Ask me anything about my work, projects or skills!";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// The assistant may still write a bare "#section" instead of proper markdown
// link syntax — wrapping it as `[#section](#section)` first lets a single
// ReactMarkdown pass render it as a real (smooth-scrolling) link too.
const bareHashTokenRegex = /(?<!\]\()#[a-z]+/g;

function linkifyBareHashTokens(text: string): string {
  return text.replace(bareHashTokenRegex, (token) => `[${token}](${token})`);
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

const markdownComponents: Components = {
  a: ({ href, children }) => {
    const isSectionLink = href?.startsWith('#');
    return (
      <a
        href={href}
        onClick={
          isSectionLink
            ? (e: MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                scrollToSection(href!.slice(1));
              }
            : undefined
        }
        target={isSectionLink ? undefined : '_blank'}
        rel={isSectionLink ? undefined : 'noopener noreferrer'}
        style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
      >
        {children}
      </a>
    );
  },
  // Markdown wraps every paragraph in <p>, which carries browser default
  // margins that fight the chat bubble's own spacing — a block-level span
  // gets paragraph-style line breaks (via remark-breaks) without them.
  p: ({ children }) => <span style={{ display: 'block' }}>{children}</span>,
  ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: '1.2em' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '4px 0', paddingLeft: '1.2em' }}>{children}</ol>,
};

function renderMarkdown(text: string): ReactNode {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
      {linkifyBareHashTokens(text)}
    </ReactMarkdown>
  );
}

const assistantBubbleSx = {
  px: 1.75,
  py: 1,
  maxWidth: '78%',
  borderRadius: '18px 18px 18px 6px',
  backgroundColor: '#fff',
  color: '#1c1e21',
  lineHeight: 1.55,
  wordBreak: 'break-word',
} as const;

/** Alex's photo, cropped the same way as the About section's avatar. */
function ProfileAvatar({ size }: { size: number }) {
  return (
    <Avatar
      src={profile.photo.src}
      alt={profile.name}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        '& img': {
          objectFit: 'cover',
          objectPosition: `${profile.photo.focalX}% ${profile.photo.focalY}%`,
          transform: `scale(${profile.photo.zoom})`,
        },
      }}
    />
  );
}

function AssistantRow({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
      <ProfileAvatar size={28} />
      {children}
    </Box>
  );
}

function TypingDots() {
  return (
    <Box
      aria-hidden
      sx={{
        display: 'flex',
        gap: 0.5,
        alignItems: 'center',
        height: 18,
        '@keyframes chatTypingBounce': {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: 0.4 },
          '40%': { transform: 'translateY(-4px)', opacity: 1 },
        },
        '& > span': {
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: '#8a94a6',
          animation: 'chatTypingBounce 1.2s infinite ease-in-out',
        },
        '& > span:nth-of-type(2)': { animationDelay: '0.15s' },
        '& > span:nth-of-type(3)': { animationDelay: '0.3s' },
        '@media (prefers-reduced-motion: reduce)': { '& > span': { animation: 'none', opacity: 0.7 } },
      }}
    >
      <span />
      <span />
      <span />
    </Box>
  );
}

export default function Chat() {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageFontSize = isMobile ? '0.875rem' : '0.9375rem';

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(CHAT_API_URL, {
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
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { text: chunkContent, remainder, done: sseDone } = parseSseChunk(buffer);
        buffer = remainder;
        streamDone = sseDone;

        if (chunkContent) {
          if (firstToken) {
            // First chunk: swap the typing indicator for the assistant message
            setLoading(false);
            setMessages([...newMessages, { role: 'assistant', content: chunkContent }]);
            firstToken = false;
          } else {
            setMessages((prev) => {
              // The assistant's message was added with the first token, so it is the last one.
              return prev.map((message, i) =>
                i === prev.length - 1 ? { ...message, content: message.content + chunkContent } : message,
              );
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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: '#0a1929' }}>Ask AI</Typography>
      <Typography variant="body1" sx={{ mb: isMobile ? 2 : 3, color: '#4a5568' }}>
        Curious about my work? Ask the AI version of me.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 4,
          border: '1px solid #e5e9f0',
          boxShadow: '0 10px 30px -12px rgba(10,25,41,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? 460 : 540,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2, py: 1.25, backgroundColor: '#0a1929', color: '#fff' }}>
          <ProfileAvatar size={40} />
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.2, color: '#fff' }}>
              {profile.name}
              <Box
                component="span"
                sx={{ ml: 0.75, px: 0.75, py: '1px', borderRadius: 1, fontSize: '0.65rem', backgroundColor: 'rgba(255,255,255,0.15)', verticalAlign: 'middle' }}
              >
                AI
              </Box>
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#8fb3dd', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              Typically replies instantly
            </Typography>
          </Box>
        </Box>

        {/* Messages area */}
        <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', backgroundColor: '#f0f2f5' }}>
          {/* margin-top: auto keeps a short conversation anchored to the
              bottom, next to the input, the way a messaging app does —
              without justify-content: flex-end, which would clip the top of a
              long one instead of letting it scroll. */}
          <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ alignSelf: 'center', fontSize: '0.7rem', color: '#8a94a6' }}>Today</Typography>

            <AssistantRow>
              <Box sx={{ ...assistantBubbleSx, fontSize: messageFontSize }}>{GREETING}</Box>
            </AssistantRow>

            {messages.length === 0 && (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
                {SUGGESTIONS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    onClick={() => sendMessage(s)}
                    variant="outlined"
                    sx={{
                      borderWidth: 1.5,
                      borderColor: '#1565c0',
                      backgroundColor: '#fff',
                      color: '#1565c0',
                      fontWeight: 500,
                      fontSize: '0.82rem',
                      '&&:hover': { backgroundColor: '#1565c0', color: '#fff' },
                    }}
                  />
                ))}
              </Stack>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {msg.role === 'user' ? (
                  <Box
                    sx={{
                      alignSelf: 'flex-end',
                      px: 1.75,
                      py: 1,
                      maxWidth: '78%',
                      borderRadius: '18px 18px 6px 18px',
                      backgroundColor: '#1565c0',
                      color: '#fff',
                      fontSize: messageFontSize,
                      lineHeight: 1.5,
                      // The user's own text is shown verbatim (their literal
                      // newlines from Shift+Enter preserved); the assistant's
                      // is rendered markdown, which lays out its own breaks.
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.content}
                  </Box>
                ) : (
                  <AssistantRow>
                    <Box sx={{ ...assistantBubbleSx, fontSize: messageFontSize }}>{renderMarkdown(msg.content)}</Box>
                  </AssistantRow>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AssistantRow>
                  <Box role="status" aria-label="Alex is typing" sx={{ ...assistantBubbleSx, py: 1.25 }}>
                    <TypingDots />
                  </Box>
                </AssistantRow>
              </motion.div>
            )}
          </Box>
        </Box>

        {/* Input area */}
        <Box sx={{ p: 1.25, borderTop: '1px solid #e5e9f0', backgroundColor: '#fff', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
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
                borderRadius: '20px',
                backgroundColor: '#f0f2f5',
                px: 2,
                // Anything below 16px makes iOS Safari zoom the whole page in
                // when this field gets focus, so mobile can't go as small as
                // the rest of the chat UI.
                fontSize: isMobile ? '16px' : '0.9375rem',
              },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1.5px solid #1565c0' },
            }}
          />
          <IconButton
            aria-label="Send message"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            sx={{
              color: '#1565c0',
              width: 40,
              height: 40,
              '&:hover': { backgroundColor: '#e3edfb' },
              '&.Mui-disabled': { color: '#b8c2d1' },
            }}
          >
            <SendIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
