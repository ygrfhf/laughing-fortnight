import { createContext, useContext, useLayoutEffect, useRef } from "react";
import { en as strings } from "../strings/en";

/** True once the student has moved between screens (not on the first page load). */
const FocusHeadingContext = createContext(false);

export const FocusHeadingProvider = FocusHeadingContext.Provider;

interface PageHeadingProps {
  text: string;
}

/**
 * The screen's h1. Sets the document title (WCAG 2.4.2) and, after in-app navigation, takes
 * focus so screen reader and keyboard users start at the top of the new screen.
 */
export function PageHeading({ text }: PageHeadingProps) {
  const focusOnMount = useContext(FocusHeadingContext);
  const ref = useRef<HTMLHeadingElement>(null);

  // Layout effects run before paint, so the title and focus change together with the screen.
  useLayoutEffect(() => {
    document.title = strings.app.pageTitle(text);
  }, [text]);

  // Mount only (empty deps on purpose): focus moves once per screen, never while reading.
  useLayoutEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, []);

  return (
    <h1 ref={ref} tabIndex={-1} className="lf-page__title">
      {text}
    </h1>
  );
}
