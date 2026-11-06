import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { flushSync } from "react-dom";
import { useLocation } from "wouter";

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

function scrollToHash(hash: string) {
  document.getElementById(hash.slice(1))?.scrollIntoView();
}

/**
 * Internal link. Moves between routes inside a view transition where the browser
 * supports it, opens each page at the top, and scrolls to a sheet for "/#work".
 */
export function SiteLink({ href, onClick, children, ...props }: SiteLinkProps) {
  const [path, navigate] = useLocation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();

    const [target, hash] = href.split("#");
    const targetPath = target || path;

    if (targetPath === path) {
      if (hash) {
        window.history.pushState(null, "", `${targetPath}#${hash}`);
        scrollToHash(`#${hash}`);
      } else {
        window.scrollTo({ top: 0 });
      }
      return;
    }

    const go = () => {
      flushSync(() => navigate(href));
      if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
    };

    if (document.startViewTransition) {
      document.startViewTransition(go);
    } else {
      go();
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
