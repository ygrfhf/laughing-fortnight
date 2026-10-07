import { useSyncExternalStore } from "react";

/**
 * Tiny hash router: "#/" is Today, "#/assignment/<id>" is one assignment. Hash routes work
 * offline and in kiosk mode with no server configuration, and the browser Back button works.
 */
export type Route = { readonly name: "today" } | { readonly name: "assignment"; readonly assignmentId: string };

const TODAY: Route = Object.freeze({ name: "today" });
const ASSIGNMENT_HASH = /^#\/assignment\/([^/]+)$/;

/** Anything unrecognized or malformed goes to Today, never to an error page. */
export function parseHash(hash: string): Route {
  const match = ASSIGNMENT_HASH.exec(hash);
  if (!match) {
    return TODAY;
  }
  try {
    return { name: "assignment", assignmentId: decodeURIComponent(match[1]!) };
  } catch {
    return TODAY; // Malformed percent-encoding.
  }
}

export function routeToHash(route: Route): string {
  return route.name === "assignment" ? `#/assignment/${encodeURIComponent(route.assignmentId)}` : "#/";
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const getHash = (): string => window.location.hash;

/** The current route; re-renders when the hash changes (links, Back button, typed URL). */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash, () => "");
  return parseHash(hash);
}
