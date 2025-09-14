// @see https://nextjs.org/docs/app/guides/instrumentation
// @see https://opentelemetry.io/docs/concepts/observability-primer/

import { initMetrics } from "@/lib/metrics";

export const metrics = initMetrics();
