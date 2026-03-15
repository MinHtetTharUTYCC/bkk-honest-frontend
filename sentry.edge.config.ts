import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://303e6100aa536daf3d56ee4f7af954f0@o4509073042767872.ingest.us.sentry.io/4509073367105536",
  tracesSampleRate: 1,
  debug: false,
});
