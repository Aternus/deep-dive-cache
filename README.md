# Deep Dive: Cache

Welcome to Instant-Search ⚡

Deep dive into cache-related concepts with an application allowing you to search
for software development tags.

Feel the impact of three-tier caching while you type. ⌨️

Every keystroke flows through LRU → Redis → Postgres, and the UI streams live
hit/miss counters and latency charts so you can watch hot prefixes bubble up the
stack in real time. The entire demo fits comfortably inside free-tier quotas and
seeds itself from a single CSV in seconds.

Under the hood:

1. L1: `lru-cache` (key-value in-memory store, per instance, short term)
2. L2: Redis (key-value store, shared, long term)
3. DB (L3): Postgres (materialized view, shared, persisted)

## Stack

### Infrastructure

1. [Render Web Service, Free tier](https://render.com/docs/free#free-web-services)
2. 750 instance-hours / month; spins down after 15 minutes of idle time.
3. Bandwidth: 100 GB / month
4. Build: 500 min / month
5. Custom Domains.
6. Managed TLS certificates.

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

#### Database

1. [Supabase PostgreSQL, Free tier](https://supabase.com/pricing)
2. Type: Instance
3. Free projects are paused after 1 week of inactivity; Max 2 active projects.
4. Commands/API Calls: Unlimited
5. Bandwidth: 5 GB / month
6. Storage: 500 MB DB, 1 GB files
7. RAM: 500 MB

## Tasks

### Data

1. Seed DB with data from
   [StackOverflow: Tags with Popularity query](https://data.stackexchange.com/stackoverflow/query/1912712/stackoverflow-tags-with-popularity-mentions)
   1. Table name: `tags`
   2. Columns:
      `TagName,Mentions,SynonymsCount,SynonymsJSON,ExcerptID,Excerpt,WikiID,Wiki`
2. Create a Materialized View
   1. A DB object that stores the result of a query on disk (or in memory) so it
      can be read like a regular table.
   2. Break down the `tags` corpus to prefixes
   3. Will allow time complexity of O(1) for reads
   4. Table name: `suggestions`
   5. Columns: `prefix,suggestions`
   6. Cap `prefix` length to 6 characters to keep row count reasonable (50k tags
      × 6 prefixes = 300k rows)
   7. Order the `suggestions` based on `Mentions`
   8. `prefix` needs to be `text PRIMARY KEY` so can create a btree index on it
   9. Limit to 10 suggestions
   10. Example:
       ```
       j,[javascript,java,jquery...]
       ```
3. (optional) Setup automatic refresh for the Materialized View every 24 hours
