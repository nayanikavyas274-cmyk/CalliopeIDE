import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import Home from '@/pages/index';
import { THEME_STORAGE_KEY } from '@/lib/theme';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('framer-motion', () => {
  const React = require('react');

  const createMotionComponent = (tag: string) => {
    const Component = React.forwardRef(
      (
        {
          children,
          initial,
          animate,
          transition,
          whileInView,
          viewport,
          variants,
          ...props
        }: Record<string, unknown>,
        ref: React.Ref<HTMLElement>,
      ) => React.createElement(tag, { ref, ...props }, children),
    );

    Component.displayName = `MockMotion(${tag})`;

    return Component;
  };

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => createMotionComponent(tag),
      },
    ),
    useScroll: () => ({ scrollYProgress: 0 }),
    useTransform: () => 0,
  };
});

function ThemeState() {
  const { theme } = useTheme();

  return <span data-testid="theme-state">{theme}</span>;
}

describe('Theme Toggle Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.dataset.theme = '';
    document.documentElement.style.colorScheme = '';
  });

  it('persists a user-selected theme and updates the root class immediately', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
        <ThemeState />
      </ThemeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('theme-state')).toHaveTextContent('dark'));
    expect(document.documentElement).toHaveClass('dark');

    await user.click(screen.getByTestId('theme-toggle'));

    await waitFor(() => expect(screen.getByTestId('theme-state')).toHaveTextContent('light'));
    expect(document.documentElement).not.toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    await user.click(screen.getByTestId('theme-toggle'));

    await waitFor(() => expect(screen.getByTestId('theme-state')).toHaveTextContent('dark'));
    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('hydrates from localStorage on reload', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');

    render(
      <ThemeProvider>
        <ThemeToggle />
        <ThemeState />
      </ThemeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('theme-state')).toHaveTextContent('light'));
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('keeps themed sidebar, editor, and chat surfaces mounted when switching themes', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <Home />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('sidebar-surface')).toHaveClass('theme-sidebar-surface');
    expect(screen.getByTestId('editor-surface')).toHaveClass('theme-editor-surface');
    expect(screen.getByTestId('chat-panel-surface')).toHaveClass('theme-chat-surface');
    expect(screen.getByTestId('chat-surface')).toHaveClass('theme-panel');

    await user.click(screen.getByTestId('theme-toggle'));

    expect(document.documentElement).not.toHaveClass('dark');
    expect(screen.getByTestId('sidebar-surface')).toBeInTheDocument();
    expect(screen.getByTestId('editor-surface')).toBeInTheDocument();
    expect(screen.getByTestId('chat-panel-surface')).toBeInTheDocument();
    expect(screen.getByTestId('chat-surface')).toBeInTheDocument();
  });
});
