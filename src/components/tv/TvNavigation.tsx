'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    __tvApp?: boolean;
    __tvSidebarOpen?: () => void;
    __tvSidebarClose?: () => void;
    __tvSidebarIsOpen?: () => boolean;
  }
}

export default function TvNavigation() {
  const router = useRouter();

  useEffect(() => {
    function getFocusables(): HTMLElement[] {
      return Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex="0"], iframe[tabindex]'
        )
      ).filter((el) => {
        // Skip hidden elements (but allow sidebar overlay items when menu is open)
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        // Skip elements that are off-screen to the left (hidden sidebar in app mode)
        if (rect.right < 0) return false;
        return true;
      });
    }

    function center(el: HTMLElement) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function isInSidebar(el: HTMLElement): boolean {
      return !!el.closest('[data-tv-nav="sidebar"]') || el.getAttribute('data-tv-nav') === 'sidebar';
    }

    function isSidebarOpen(): boolean {
      return window.__tvSidebarIsOpen?.() ?? false;
    }

    function isAtLeftEdge(el: HTMLElement): boolean {
      // Check if this is the leftmost focusable in its row (no other content element to the left)
      const items = getFocusables().filter(e => !isInSidebar(e));
      const cur = center(el);
      return !items.some(e => {
        if (e === el) return false;
        const c = center(e);
        // Something to the left within the same vertical band
        return c.x < cur.x - 20 && Math.abs(c.y - cur.y) < 80;
      });
    }

    function findNearest(
      current: HTMLElement,
      direction: 'up' | 'down' | 'left' | 'right'
    ): HTMLElement | null {
      const items = getFocusables();
      const cur = center(current);
      const currentInSidebar = isInSidebar(current);
      let best: HTMLElement | null = null;
      let bestDist = Infinity;

      for (const el of items) {
        if (el === current) continue;
        const elInSidebar = isInSidebar(el);

        // When sidebar overlay is open:
        // - If in sidebar, right arrow should go to content (close sidebar)
        // - If in content somehow, left arrow should go to sidebar
        if (isSidebarOpen()) {
          if (direction === 'right' && currentInSidebar && elInSidebar) continue;
          if (direction === 'left' && !currentInSidebar && !elInSidebar) continue;
        } else {
          // Sidebar closed — skip sidebar items entirely
          if (elInSidebar) continue;
        }

        const c = center(el);
        const dx = c.x - cur.x;
        const dy = c.y - cur.y;

        let valid = false;
        if (direction === 'right' && dx > 20) valid = true;
        if (direction === 'left' && dx < -20) valid = true;
        if (direction === 'down' && dy > 20) valid = true;
        if (direction === 'up' && dy < -20) valid = true;

        if (valid) {
          let dist: number;
          if (direction === 'right' || direction === 'left') {
            dist = Math.abs(dx) + Math.abs(dy) * 3;
          } else {
            dist = Math.abs(dy) + Math.abs(dx) * 3;
          }
          if (dist < bestDist) {
            bestDist = dist;
            best = el;
          }
        }
      }
      return best;
    }

    let iframeFocused = false;

    function handleKeyDown(e: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null;

      // If inside iframe (YouTube player), only intercept Back/Escape
      if (iframeFocused) {
        if (e.key === 'Escape' || e.keyCode === 27 || e.keyCode === 4) {
          e.preventDefault();
          iframeFocused = false;
          const iframe = document.querySelector<HTMLElement>('iframe[tabindex]');
          if (iframe) iframe.focus();
        }
        return;
      }

      // Back button
      if (e.key === 'Escape' || e.keyCode === 27 || e.keyCode === 4) {
        e.preventDefault();
        // If sidebar overlay is open, close it
        if (isSidebarOpen()) {
          window.__tvSidebarClose?.();
          // Re-focus first content card
          setTimeout(() => {
            const firstCard = document.querySelector<HTMLElement>('.tv-card');
            if (firstCard) firstCard.focus();
          }, 50);
          return;
        }
        router.back();
        return;
      }

      let dir: 'up' | 'down' | 'left' | 'right' | null = null;
      if (e.key === 'ArrowRight' || e.keyCode === 39) dir = 'right';
      if (e.key === 'ArrowLeft' || e.keyCode === 37) dir = 'left';
      if (e.key === 'ArrowDown' || e.keyCode === 40) dir = 'down';
      if (e.key === 'ArrowUp' || e.keyCode === 38) dir = 'up';

      if (dir) {
        e.preventDefault();

        // If nothing focused, focus first card
        if (!active || active === document.body || active === document.documentElement) {
          const first = document.querySelector<HTMLElement>('.tv-card');
          if (first) {
            first.focus();
            return;
          }
        }

        // LEFT at left edge of content -> open sidebar overlay (in app mode)
        if (dir === 'left' && active && !isInSidebar(active) && !isSidebarOpen()) {
          if (isAtLeftEdge(active)) {
            // In app mode, open the sidebar overlay
            if (window.__tvApp) {
              window.__tvSidebarOpen?.();
              // Focus first sidebar item after it slides in
              setTimeout(() => {
                const firstNav = document.querySelector<HTMLElement>('[data-tv-nav="sidebar"]');
                if (firstNav) firstNav.focus();
              }, 350);
              return;
            }
            // In browser mode, focus the sidebar directly
            const firstNav = document.querySelector<HTMLElement>('[data-tv-nav="sidebar"]');
            if (firstNav) {
              firstNav.focus();
              return;
            }
          }
        }

        // RIGHT from sidebar -> close overlay and focus content
        if (dir === 'right' && active && isInSidebar(active)) {
          if (window.__tvApp) {
            window.__tvSidebarClose?.();
          }
          setTimeout(() => {
            const firstCard = document.querySelector<HTMLElement>('.tv-card');
            if (firstCard) firstCard.focus();
          }, 50);
          return;
        }

        const next = findNearest(active!, dir);
        if (next) {
          next.focus();
          // Scroll the parent row if it's a card in a horizontal row
          const row = next.closest('.tv-row');
          if (row) {
            const rowRect = row.getBoundingClientRect();
            const nextRect = next.getBoundingClientRect();
            if (nextRect.right > rowRect.right - 50) {
              row.scrollLeft += nextRect.width + 16;
            } else if (nextRect.left < rowRect.left + 50) {
              row.scrollLeft -= nextRect.width + 16;
            }
          }
          // Scroll vertically if needed
          if (!isInSidebar(next)) {
            next.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }
        } else if (dir === 'down' && active && !isInSidebar(active)) {
          const content = document.getElementById('tv-content');
          if (content) content.scrollBy({ top: 300, behavior: 'smooth' });
        } else if (dir === 'up' && active && !isInSidebar(active)) {
          const content = document.getElementById('tv-content');
          if (content) content.scrollBy({ top: -300, behavior: 'smooth' });
        }
        return;
      }

      // Enter/Select button
      if (e.key === 'Enter' || e.keyCode === 13 || e.keyCode === 66) {
        if (active && active.tagName === 'IFRAME') {
          e.preventDefault();
          iframeFocused = true;
          (active as HTMLIFrameElement).contentWindow?.postMessage(
            '{"event":"command","func":"playVideo","args":""}', '*'
          );
          return;
        }
        if (active && active !== document.body) {
          e.preventDefault();
          // For Next.js Link elements, find the actual anchor and use programmatic navigation
          const anchor = active.tagName === 'A' ? active as HTMLAnchorElement : active.querySelector('a');
          if (anchor?.href) {
            const url = new URL(anchor.href);
            // Use router for internal navigation
            if (url.origin === window.location.origin) {
              // Close sidebar if open
              if (isSidebarOpen()) {
                window.__tvSidebarClose?.();
              }
              router.push(url.pathname + url.search);
              return;
            }
          }
          active.click();
        }
      }
    }

    // Setup iframes as focusable
    function setupIframes() {
      document.querySelectorAll('iframe').forEach((iframe) => {
        if (!iframe.hasAttribute('tabindex')) {
          iframe.setAttribute('tabindex', '0');
        }
        const src = iframe.src || '';
        if (src.includes('youtube') && !src.includes('autoplay')) {
          iframe.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1&enablejsapi=1';
        }
      });
    }

    document.addEventListener('keydown', handleKeyDown, true);
    setupIframes();

    // Re-setup on DOM changes (Next.js navigation)
    const observer = new MutationObserver(() => {
      setupIframes();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Auto-focus first content card after page load
    setTimeout(() => {
      setupIframes();
      const firstCard = document.querySelector<HTMLElement>('.tv-card');
      if (firstCard) firstCard.focus();
    }, 500);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      observer.disconnect();
    };
  }, [router]);

  return null;
}
