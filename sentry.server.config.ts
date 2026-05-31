import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  tracesSampleRate: 1,
  debug: false,
  beforeSend(event) {
    if (event.tags && event.tags.wallet_address) {
      delete event.tags.wallet_address;
    }
    // Also remove from extra data if present
    if (event.extra && event.extra.wallet_address) {
      delete event.extra.wallet_address;
    }
    return event;
  },
});
