import { NextRequest, NextResponse } from "next/server";
import { getKeyspaceOf } from "@/lib/metrics";
import { cacheL1 } from "@/lib/cache/l1";
import { metrics } from "@/instrumentation";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/data/[key]">,
) {
  const { key } = await params;
  const {
    cacheLookupLatency,
    cacheRequests,
    responseSource,
    cacheSet,
    sourceQueryLatency,
  } = metrics;
  const keyspace = getKeyspaceOf(key);

  const stopTimerL1 = cacheLookupLatency.startTimer({
    tier: "L1",
    keyspace,
  });
  try {
    const value = await cacheL1.get(key);
    stopTimerL1();

    if (value !== undefined) {
      cacheRequests.inc({ tier: "L1", outcome: "hit", keyspace });
      responseSource.inc({ source: "L1", keyspace });

      return NextResponse.json({
        source: "L1",
        key,
        value,
      });
    }

    cacheRequests.inc({ tier: "L1", outcome: "miss", keyspace });
  } catch {
    stopTimerL1();
    cacheRequests.inc({ tier: "L1", outcome: "error", keyspace });
  }

  // L2
  const stopTimerL2 = cacheLookupLatency.startTimer({
    tier: "L2",
    keyspace,
  });
  try {
    // get value
    stopTimerL2();

    // validate value

    // return value

    cacheRequests.inc({ tier: "L2", outcome: "miss", keyspace });
  } catch {
    stopTimerL2();
    cacheRequests.inc({ tier: "L2", outcome: "error", keyspace });
  }

  // L3
  const stopTimerL3 = cacheLookupLatency.startTimer({
    tier: "L3",
    keyspace,
  });
  try {
    // get value
    stopTimerL3();

    // validate value

    // return value

    cacheRequests.inc({ tier: "L3", outcome: "miss", keyspace });
  } catch {
    stopTimerL3();
    cacheRequests.inc({ tier: "L3", outcome: "error", keyspace });
  }

  // source of truth
  const stopTimerSource = sourceQueryLatency.startTimer({ keyspace });
  const valueAtSource = "Deep Dive: Cache";
  stopTimerSource();

  // write-through
  try {
    await cacheL1.set(key, valueAtSource);
    cacheSet.inc({ tier: "L1", keyspace });
  } catch {}

  responseSource.inc({ source: "Source", keyspace });
  return NextResponse.json({
    source: "Source",
    key,
    value: valueAtSource,
  });
}
