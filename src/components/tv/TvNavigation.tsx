'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TvNavigation() {
  const router = useRouter();

  useEffect(() => {
    function getFocusables(): HTMLElement[] {
      return Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex="0"], iframe[tabindex]'
        )
      ).filter((el) => {
        if (el.offsetParent === null && el.tagName !== 'IFRAME') return false;
        return el.offsetWidth > 0 && el.offsetHeight > 0;
      });
    }

    function center(el: HTMLElement) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function isInSidebar(el: HTMLElement): boolean {
      return !!el.closest('[data-tv-nav="sidebar"]') || !!el.getAttribute('data-tv-nav');
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

        // If moving right from sidebar, only look at content area
        if (direction === 'right' && currentInSidebar && isInSidebar(el)) continue;
        // If moving left into sidebar, only look at sidebar items
        if (direction === 'left' && !currentInSidebar && !isInSidebar(el)) continue;

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

      // Back button — go back in history
      if (e.key === 'Escape' || e.keyCode === 27 || e.keyCode === 4) {
        e.preventDefault();
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

        // If nothing focused, focus first sidebar item
        if (!active || active === document.body || active === document.documentElement) {
          const first = document.querySelector<HTMLElement>('[data-tv-nav="sidebar"]');
          if (first) {
            first.focus();
            return;
          }
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
          // Scroll content area down
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
          try {
            active.querySelector('iframe')?.contentWindow?.postMessage(
              '{"event":"command","func":"playVideo","args":""}', '*'
            );
          } catch {}
          (active as HTMLIFrameElement).contentWindow?.postMessage(
            '{"event":"command","func":"playVideo","args":""}', '*'
          );
          active.click();
          return;
        }
        if (active && active !== document.body) {
          e.preventDefault();
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

    // Auto-focus first content item after page load
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
