/**
 * Hero bottom-panel regression tests.
 *
 * Guards the exact bug from commit bcace6d: the panel existed in the DOM but was
 * hidden behind the page body wrapper because it was nested inside the hero
 * container (`fixed inset-0 z-0`) while the body wrapper used `relative z-10`.
 *
 * Screenshot baselines are intentionally NOT captured here. This repo has no
 * browser binary available (Playwright's Chromium/Firefox cannot launch — the
 * sandbox lacks root to install the required system libraries, e.g.
 * libatk-1.0.so.0). A full visual regression suite would require a CI environment
 * with those deps. The DOM, visibility, stacking, and route assertions below are
 * sufficient to catch the regression class this file exists to prevent.
 */
const { expect, describe, it, afterEach } = require('@jest/globals');
const { render, screen, cleanup } = require('@testing-library/react');
const React = require('react');
const path = require('path');
const HomePageModule = require(path.resolve(__dirname, '../app/page'));
const HomePage = HomePageModule.default || HomePageModule;

const PANEL_SELECTOR = '[class*="inset-x-0"][class*="bottom-0"]';

function inDoc(text) {
  return document.body.textContent.includes(text);
}

describe('hero bottom panel', () => {
  afterEach(() => cleanup());

  it('renders all required copy', () => {
    render(React.createElement(HomePage));
    expect(inDoc('Ready to Start Your Social Media Business?')).toBe(true);
    expect(inDoc('Join hundreds of Kenyan entrepreneurs already earning with Janjez Business Side.')).toBe(true);
    expect(inDoc('Janjez Business Side')).toBe(true);
    expect(inDoc("Kenya's infrastructure for social media entrepreneurs.")).toBe(true);
  });

  it('CTA routes to /auth/sign-in', () => {
    render(React.createElement(HomePage));
    const cta = screen.getByRole('link', { name: 'Get Started — Free' });
    expect(cta).not.toBeNull();
    expect(cta.getAttribute('href')).toBe('/auth/sign-in');
  });

  it('category pills route to correct destinations with no duplicates', () => {
    render(React.createElement(HomePage));
    const panel = document.querySelector(PANEL_SELECTOR);
    expect(panel).not.toBeNull();

    const pills = Array.from(panel.querySelectorAll('a[href]'));
    const hrefs = pills.map((a) => a.getAttribute('href')).filter(Boolean);

    expect(hrefs).toContain('#categories');
    expect(hrefs).toContain('#how-it-works');
    expect(hrefs).toContain('#product');
    expect(hrefs).toContain('https://janjez.social');

    const unique = new Set(hrefs);
    expect(unique.size).toBe(hrefs.length);
  });

  it('panel is anchored to the hero, not fixed to the viewport', () => {
    render(React.createElement(HomePage));
    const panel = document.querySelector(PANEL_SELECTOR);
    expect(panel).not.toBeNull();
    const position = getComputedStyle(panel).position;
    expect(position).not.toBe('fixed');
  });
});