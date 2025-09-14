import { NextResponse } from "next/server";
import { metrics } from "@/instrumentation";

export async function GET() {
  const { register } = metrics;
  const metricsJSON = await register.getMetricsAsJSON();
  return NextResponse.json(metricsJSON);
}
