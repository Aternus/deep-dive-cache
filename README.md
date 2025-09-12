# Deep Dive: Cache

Deep dive into Cache and related concepts with this interactive playground.

## Stack Breakdown

### Infrastructure

1. [Render Web Service, Free tier](https://render.com/docs/free#free-web-services)
2. 750 instance-hours/month; spins down after 15 minutes of idle time.
3. Custom Domains.
4. Managed TLS certificates.

### Backend and Frontend

1. Backend and Frontend: [Next.js](https://nextjs.org/docs/app/getting-started).
2. Charts and visualizations: [Chart.js](https://www.chartjs.org/docs/latest/).

#### L1

1. [lru-cache](https://www.npmjs.com/package/lru-cache)
2. Type: In-process cache, part of the Backend and Frontend instance.
3. Straightforward, battle-tested implementation.
4. Single-flight behavior is available via fetch() and SWR patterns.
5. Easy to add TTL jitter by wrapping `.set()` with a jittered TTL generator.

#### L2

1. [Upstash Redis, Free tier](https://upstash.com/pricing)
2. Type: Lambda (Serverless)
3. One free DB per account.
4. Commands/API Calls: 500K / month
5. Bandwidth: 10 GB / month
6. Storage: 256 MB

#### L3

1. [Supabase PostgreSQL, Free tier](https://supabase.com/pricing)
2. Type: Instance
3. Free projects are paused after 1 week of inactivity; Max 2 active projects.
4. Commands/API Calls: Unlimited
5. Bandwidth: 5 GB / month
6. Storage: 500 MB DB, 1 GB files
7. RAM: 500 MB

## TODO
