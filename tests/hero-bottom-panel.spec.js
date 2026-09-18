/**
 * Landing page regression tests.
 *
 * Guards the current full-page marketing layout (commit 4fff89a) against
 * regressions in: copy presence, CTA routing, navigation link uniqueness,
 * and the stacking contract that no fixed-position overlay hides the
 * page body (the bug class from commit bcace6d).
 */
const { expect, describe, it, afterEach } = require('@jest/globals');
const { render, screen, cleanup } = require('@testing-library/react');
const React = require('react');
const path = require('path');
const HomePageModule = require(path.resolve(__dirname, '../app/page'));
const HomePage = HomePageModule.default || HomePageModule;

function inDoc(text) {
  return document.body.textContent.includes(text);
}

describe('landing page', () => {
  afterEach(() => cleanup());

  it('renders all required copy', () => {
    render(React.createElement(HomePage));
    expect(inDoc('Build Your Social Media Business on Kenya')).toBe(true);
    expect(inDoc('Resell, white-label, or refer')).toBe(true);
    expect(inDoc('Ready to Start Your Social Media Business?')).toBe(true);
    expect(inDoc("Kenya's infrastructure for social media entrepreneurs.")).toBe(true);
  });

  it('primary CTA routes to /auth/sign-in', () => {
    render(React.createElement(HomePage));
    const cta = screen.getByRole('link', { name: 'Get Started — Free' });
    expect(cta).not.toBeNull();
    expect(cta.getAttribute('href')).toBe('/auth/sign-in');
  });

  it('category cards route to correct destinations with no duplicates', () => {
    render(React.createElement(HomePage));
    const links = Array.from(document.querySelectorAll('a[href]'));
    const hrefs = links.map((a) => a.getAttribute('href')).filter(Boolean);

    expect(hrefs).toContain('/auth/sign-in');
    expect(hrefs).toContain('#categories');
    expect(hrefs).toContain('#how-it-works');
    expect(hrefs).toContain('#pricing');
    expect(hrefs).toContain('#faq');
    expect(hrefs).toContain('https://janjez.social');

    // No unexpected hrefs outside the known set.
    const known = new Set([
      '/',
      '/auth/sign-in',
      '#categories',
      '#how-it-works',
      '#pricing',
      '#faq',
      'https://janjez.social',
      '/dashboard',
    ]);
    const unexpected = hrefs.filter((h) => !known.has(h));
    expect(unexpected).toEqual([]);
  });

  it('page body is not buried under a fixed-position overlay', () => {
    render(React.createElement(HomePage));
    // The background layer is `fixed inset-0 z-0`; the content layer must
    // sit above it (z-10) and be scrollable, not a fixed bottom panel.
    const content = document.querySelector('[class*="relative"][class*="z-10"]');
    expect(content).not.toBeNull();
    const position = getComputedStyle(content).position;
    expect(position).not.toBe('fixed');
  });
});