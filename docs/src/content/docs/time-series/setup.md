---
title: Setup
description: How to configure time-series for use.
---

## Database

This section will go over how to set up the `postgresql` database for the first time.

First, install and enable the `postgresql` server. Typically this would be
`systemctl enable --now postgresql` inside of a linux environment.

Next, configure `.env` using `.env.example` as a template, changing its variables
to your actual setup. This file holds configuration of
how to connect to the database.

Now, create the database, schema and user on the `postgresql` server. Locally,
this can be done with `sudo -u postgres psql`:

```sql
CREATE DATABASE timeseriesdb;

\c timeseriesdb

CREATE SCHEMA timeseries;

CREATE USER timeseries WITH PASSWORD 'your_secure_password';

GRANT ALL PRIVILEGES ON DATABASE timeseriesdb TO timeseries;
GRANT ALL PRIVILEGES ON SCHEMA timeseries TO timeseries;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA timeseries TO timeseries;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA timeseries TO timeseries;

ALTER DEFAULT PRIVILEGES IN SCHEMA timeseries 
  GRANT ALL PRIVILEGES ON TABLES TO timeseries;
ALTER DEFAULT PRIVILEGES IN SCHEMA timeseries 
  GRANT ALL PRIVILEGES ON SEQUENCES TO timeseries;

\q
```

Finally run `alembic upgrade head` to populate the database with tables.

:::note
You may need to configure your `pg_hba.conf` file to allow for password logins.
Find this file by using `sudo find /var -name pg_hba.conf` on the database host,
and add the following two lines:

```conf
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
```

If changed, remember to run `systemctl reload postgresql` to reload its configuration.
:::
