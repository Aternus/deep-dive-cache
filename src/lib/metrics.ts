import {
  Registry,
  OpenMetricsContentType,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from "prom-client";

// @see https://github.com/siimon/prom-client

export function initMetrics() {
  const register = new Registry<OpenMetricsContentType>();
  register.setContentType(Registry.OPENMETRICS_CONTENT_TYPE);
  collectDefaultMetrics({ register });

  const cacheRequests = new Counter({
    name: "cache_requests_total",
    help: "Cache lookups by tier and outcome",
    labelNames: ["tier", "outcome", "keyspace"],
  });

  const cacheSet = new Counter({
    name: "cache_set_total",
    help: "Results of setting values in cache",
    labelNames: ["tier", "outcome", "keyspace"],
  });

  const responseSource = new Counter({
    name: "data_response_source_total",
    help: "Where the /data response was ultimately served from",
    labelNames: ["source", "keyspace"],
  });

  const cacheLookupLatency = new Histogram({
    name: "cache_lookup_seconds",
    help: "Latency of cache lookups by tier",
    labelNames: ["tier", "keyspace"],
    buckets: [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2],
  });

  const sourceOfTruthQueryLatency = new Histogram({
    name: "source_of_truth_query_seconds",
    help: "Source of truth query latency",
    labelNames: ["keyspace"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  });

  register.registerMetric(cacheRequests);
  register.registerMetric(cacheSet);
  register.registerMetric(responseSource);
  register.registerMetric(cacheLookupLatency);
  register.registerMetric(sourceOfTruthQueryLatency);

  return {
    register,
    cacheRequests,
    cacheSet,
    responseSource,
    cacheLookupLatency,
    sourceOfTruthQueryLatency,
  };
}

/**
 * Get the Keyspace of a Key
 *
 * To avoid cardinality explosion, we need to track metrics using a limited set of keys.
 *
 * Cardinality = the number of unique time series produced by a metric.
 * A time series in Prometheus: `metric_name + all label key/value combinations`.
 * Each unique combination of labels is stored separately in the time series DB.
 *
 * Example:
 * cache_requests_total{tier="L1", outcome="hit", keyspace="user"}
 * cache_requests_total{tier="L2", outcome="miss", keyspace="product"}
 *
 * tier = L1/L2/L3 - 3 values
 * outcome: hit/miss/error - 3 values
 * keyspace: user/product/other - 3 values
 *
 * 3 * 3 * 3 = 27 series
 *
 * @param key
 */
export function getKeyspaceOf(key: string): string {
  if (key.startsWith("user:")) return "user";
  if (key.startsWith("product:")) return "product";
  return "other";
}
