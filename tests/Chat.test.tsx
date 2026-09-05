// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Chat from '@/components/sections/Chat';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Builds a fetch Response whose body streams the given SSE frames as UTF-8 chunks. */
function sseResponse(frames: string[], { ok = true, status = 200 } = {}): Response {
  const encoder = new TextEncoder();
  let i = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i < frames.length) {
        controller.enqueue(encoder.encode(frames[i]));
        i++;
      } else {
        controller.close();
      }
    },
  });
  return new Response(ok ? body : null, { status });
}

function tokenFrame(token: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content: token } }] })}\n\n`;
}

const DONE_FRAME = 'data: [DONE]\n\n';

describe('Chat', () => {
  it('shows the empty state with every suggestion', () => {
    render(<Chat />);
    expect(screen.getByText('Ask me anything about Alex')).toBeVisible();
    for (const suggestion of ['What is Alex working on?', 'What are his skills?', 'Tell me about his experience']) {
      expect(screen.getByText(suggestion)).toBeVisible();
    }
  });

  it('disables the send button until there is non-whitespace input', () => {
    render(<Chat />);
    const sendButton = screen.getByRole('button', { name: 'Send message' });
    const textbox = screen.getByPlaceholderText('Type a message...');

    expect(sendButton).toBeDisabled();

    fireEvent.change(textbox, { target: { value: '   ' } });
    expect(sendButton).toBeDisabled();

    fireEvent.change(textbox, { target: { value: 'Hello' } });
    expect(sendButton).toBeEnabled();
  });

  it('sends the typed message, streams the reply token by token, and clears the input', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([tokenFrame('Hel'), tokenFrame('lo!'), DONE_FRAME]));
    vi.stubGlobal('fetch', fetchMock);

    render(<Chat />);
    const textbox = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(textbox, { target: { value: 'Hi Alex' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    // Message bubbles mount via framer-motion's opacity/y entrance animation
    // (motion.div initial={{opacity:0}}), so an assertion made in the very
    // same tick as the click can catch it mid-animation — waitFor (real
    // timers, unlike fake ones) gives it the tick it needs to finish.
    await waitFor(() => expect(screen.getByText('Hi Alex')).toBeVisible());
    expect(textbox).toHaveValue('');

    await waitFor(() => expect(screen.getByText('Hello!')).toBeVisible());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/chat');
    expect(JSON.parse(init.body)).toEqual({ messages: [{ role: 'user', content: 'Hi Alex' }] });
  });

  it('sends a suggestion when it is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([tokenFrame('Sure!'), DONE_FRAME]));
    vi.stubGlobal('fetch', fetchMock);

    render(<Chat />);
    fireEvent.click(screen.getByText('What is Alex working on?'));

    // The suggestion re-appears as the echoed user message bubble, which is
    // also framer-motion-animated — see the note above.
    await waitFor(() => expect(screen.getByText('What is Alex working on?')).toBeVisible());
    await waitFor(() => expect(screen.getByText('Sure!')).toBeVisible());
  });

  it('sends on Enter and inserts a newline instead on Shift+Enter', () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([DONE_FRAME]));
    vi.stubGlobal('fetch', fetchMock);

    render(<Chat />);
    const textbox = screen.getByPlaceholderText('Type a message...');

    fireEvent.change(textbox, { target: { value: 'Line one' } });
    fireEvent.keyDown(textbox, { key: 'Enter', shiftKey: true });
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.keyDown(textbox, { key: 'Enter', shiftKey: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shows a "Thinking..." indicator while the request is in flight', async () => {
    let resolveFetch!: (value: Response) => void;
    const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((resolve) => (resolveFetch = resolve)));
    vi.stubGlobal('fetch', fetchMock);

    render(<Chat />);
    fireEvent.change(screen.getByPlaceholderText('Type a message...'), { target: { value: 'Wait for it' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    // The indicator is also framer-motion-animated in — see the note above.
    await waitFor(() => expect(screen.getByText('Thinking...')).toBeVisible());

    resolveFetch(sseResponse([tokenFrame('Done.'), DONE_FRAME]));
    await waitFor(() => expect(screen.getByText('Done.')).toBeVisible());
    expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
  });

  it('shows a fallback message when the API responds with a non-ok status', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 502 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<Chat />);
    fireEvent.change(screen.getByPlaceholderText('Type a message...'), { target: { value: 'This will fail' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => expect(screen.getByText('Sorry, something went wrong. Please try again.')).toBeVisible());
  });

  it('shows a fallback message when the request throws', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    render(<Chat />);
    fireEvent.change(screen.getByPlaceholderText('Type a message...'), { target: { value: 'No network' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => expect(screen.getByText('Sorry, something went wrong. Please try again.')).toBeVisible());
  });

  it('shows a fallback message when the stream ends without producing any tokens', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([DONE_FRAME]));
    vi.stubGlobal('fetch', fetchMock);

    render(<Chat />);
    fireEvent.change(screen.getByPlaceholderText('Type a message...'), { target: { value: 'Say nothing' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => expect(screen.getByText('Sorry, I could not generate a response.')).toBeVisible());
  });

  it('carries the full conversation history in the request body on a second turn', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(sseResponse([tokenFrame('First answer.'), DONE_FRAME]))
      .mockResolvedValueOnce(sseResponse([tokenFrame('Second answer.'), DONE_FRAME]));
    vi.stubGlobal('fetch', fetchMock);

    render(<Chat />);
    const textbox = screen.getByPlaceholderText('Type a message...');

    fireEvent.change(textbox, { target: { value: 'First question' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(screen.getByText('First answer.')).toBeVisible());

    fireEvent.change(textbox, { target: { value: 'Second question' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(screen.getByText('Second answer.')).toBeVisible());

    const secondCallBody = JSON.parse(fetchMock.mock.calls[1]![1].body);
    expect(secondCallBody.messages).toEqual([
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'First answer.' },
      { role: 'user', content: 'Second question' },
    ]);
  });
});
