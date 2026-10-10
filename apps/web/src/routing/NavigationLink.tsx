import type { AnchorHTMLAttributes } from "react";
import { navigate } from "./navigation.js";
export function NavigationLink({
  href,
  replace = false,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  replace?: boolean;
}) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey ||
          (props.target && props.target.toLowerCase() !== "_self") ||
          (props.download !== undefined && props.download !== false) ||
          href.startsWith("#")
        )
          return;
        let url: URL;
        try {
          url = new URL(href, window.location.href);
        } catch {
          return;
        }
        if (
          url.origin !== window.location.origin ||
          !["http:", "https:"].includes(url.protocol)
        )
          return;
        event.preventDefault();
        navigate(`${url.pathname}${url.search}${url.hash}`, { replace });
      }}
    />
  );
}
