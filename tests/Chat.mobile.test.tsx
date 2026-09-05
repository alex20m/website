// @vitest-environment jsdom
//
// vi.mock is hoisted to the top of the module by vitest's transform, so it
// applies to every test in this file (not just one describe block) — that's
// why this is a separate file from Chat.test.tsx rather than a nested
// describe: the two can't share a module-level mock of the same hook with
// different return values. See Navbar.mobile.test.tsx for the same pattern.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Chat from '@/components/sections/Chat';

vi.mock('@/hooks/useIsMobile', () => ({ default: () => true }));

afterEach(() => {
  cleanup();
});

describe('Chat on mobile', () => {
  it('keeps the message input at 16px or larger so iOS Safari does not zoom in on focus', () => {
    render(<Chat />);
    const textbox = screen.getByPlaceholderText('Type a message...');

    const fontSize = parseFloat(getComputedStyle(textbox).fontSize);
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });
});
