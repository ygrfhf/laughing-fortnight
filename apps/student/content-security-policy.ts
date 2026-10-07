/**
 * Content Security Policy for production builds: the student client may only load code,
 * styles, fonts, and images from its own origin, and may only talk to its own origin
 * (all AI and data requests go through our backend). No third-party scripts, trackers,
 * CDNs, inline scripts, or plugins.
 *
 * Injected as a <meta> tag by vite.config.ts at build time (Vite's dev server needs inline
 * scripts, so dev is excluded). When the app is deployed, the server should also send this as
 * an HTTP header and add `frame-ancestors 'none'`, which a <meta> tag cannot set.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");
