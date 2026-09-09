/**
 * The slice of Cloudflare Turnstile this site drives.
 *
 * The widget arrives as a third-party script that hangs its API off `window`,
 * so nothing about it is knowable from an import. Only the two calls actually
 * made are declared: a full transcription of the API would be a second thing to
 * keep in step with Cloudflare for no benefit, and the compiler cannot check
 * either version against what the script really ships.
 *
 * Optional because it is: until the script has run — and on any visit where it
 * is blocked or never loads — the property is simply absent.
 */
interface TurnstileApi {
  /** Draws a widget into `container` and answers with its id. */
  render: (
    container: HTMLElement,
    options: { sitekey: string; theme?: 'auto' | 'light' | 'dark' },
  ) => string | undefined;

  /** Discards a widget and everything it had running. */
  remove: (widgetId: string) => void;
}

interface Window {
  turnstile?: TurnstileApi;
}
