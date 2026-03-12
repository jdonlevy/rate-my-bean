BEGIN;

-- East London (approx center)
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id)
VALUES
  ('Allpress Espresso', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:allpress-espresso'),
  ('Andronicas Coffee', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:andronicas-coffee'),
  ('Climpson & Sons', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:climpson-and-sons'),
  ('Colombian Coffee Company', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:colombian-coffee-company'),
  ('Exmouth Coffee Roasters', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:exmouth-coffee-roasters'),
  ('Gentlemen Baristas', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:gentlemen-baristas'),
  ('Hermanos Colombian Coffee Roasters', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:hermanos-colombian-coffee-roasters'),
  ('Liberty Coffee Co.', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:liberty-coffee-co'),
  ('London Grade Coffee', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:london-grade-coffee'),
  ('Long and Short', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:long-and-short'),
  ('Nord Coffee Roasters', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:nord-coffee-roasters'),
  ('Notes Coffee Roasters', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:notes-coffee-roasters'),
  ('Nude Coffee Roasters', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:nude-coffee-roasters'),
  ('Ozone Coffee Roasters', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:ozone-coffee-roasters'),
  ('Perception Coffee Roasters', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:perception-coffee-roasters'),
  ('Perky Blenders', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:perky-blenders'),
  ('Plot Roasting', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:plot-roasting'),
  ('Roasting Plant', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:roasting-plant'),
  ('The Roasting Shed', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:the-roasting-shed'),
  ('Saint Espresso', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:saint-espresso'),
  ('Square Mile Coffee Roasters', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:square-mile-coffee-roasters'),
  ('Union Coffee Roasters', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:union-coffee-roasters'),
  ('Watch House', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:watch-house'),
  ('Workshop Coffee', '', '', 'London', 'East London', 'United Kingdom', 51.539, 0.004, 'seed', 'seed:london-east:workshop-coffee')
ON CONFLICT(source, external_id) DO UPDATE SET
  name=excluded.name,
  city=excluded.city,
  region=excluded.region,
  country=excluded.country,
  latitude=excluded.latitude,
  longitude=excluded.longitude;

-- South London (approx center)
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id)
VALUES
  ('80 Stone Coffee Roasters', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:80-stone-coffee-roasters'),
  ('Alchemy Coffee Roasters', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:alchemy-coffee-roasters'),
  ('Assembly Coffee Roasters', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:assembly-coffee-roasters'),
  ('Brew Coffee Plus', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:brew-coffee-plus'),
  ('Cafédirect', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:cafedirect'),
  ('Capital Coffee Roasters', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:capital-coffee-roasters'),
  ('Carnival Coffee Roasters', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:carnival-coffee-roasters'),
  ('Eight PM Coffee', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:eight-pm-coffee'),
  ('Elsewhere Coffee Roasters', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:elsewhere-coffee-roasters'),
  ('Full Bloom', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:full-bloom'),
  ('Lomond Coffee Roasters', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:lomond-coffee-roasters'),
  ('Mission Coffee Works', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:mission-coffee-works'),
  ('Monmouth Coffee Company', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:monmouth-coffee-company'),
  ('Mont 58 Coffee', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:mont-58-coffee'),
  ('Old Spike', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:old-spike'),
  ('Volcano Coffee Works', '', '', 'London', 'South London', 'United Kingdom', 51.45, -0.09, 'seed', 'seed:london-south:volcano-coffee-works')
ON CONFLICT(source, external_id) DO UPDATE SET
  name=excluded.name,
  city=excluded.city,
  region=excluded.region,
  country=excluded.country,
  latitude=excluded.latitude,
  longitude=excluded.longitude;

-- West London (approx center)
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id)
VALUES
  ('106 Coffee Roasters', '', '', 'London', 'West London', 'United Kingdom', 51.50, -0.30, 'seed', 'seed:london-west:106-coffee-roasters'),
  ('39 Steps Coffee Roasters', '', '', 'London', 'West London', 'United Kingdom', 51.50, -0.30, 'seed', 'seed:london-west:39-steps-coffee-roasters'),
  ('Arise Coffee Roasters', '', '', 'London', 'West London', 'United Kingdom', 51.50, -0.30, 'seed', 'seed:london-west:arise-coffee-roasters'),
  ('Chapter Coffee Roasters', '', '', 'London', 'West London', 'United Kingdom', 51.50, -0.30, 'seed', 'seed:london-west:chapter-coffee-roasters'),
  ('Curious Roo Coffee Roasters', '', '', 'London', 'West London', 'United Kingdom', 51.50, -0.30, 'seed', 'seed:london-west:curious-roo-coffee-roasters'),
  ('Electric Coffee Co', '', '', 'London', 'West London', 'United Kingdom', 51.50, -0.30, 'seed', 'seed:london-west:electric-coffee-co'),
  ('Ground Coffee Society', '', '', 'London', 'West London', 'United Kingdom', 51.50, -0.30, 'seed', 'seed:london-west:ground-coffee-society'),
  ('Press Coffee', '', '', 'London', 'West London', 'United Kingdom', 51.50, -0.30, 'seed', 'seed:london-west:press-coffee'),
  ('Redemption Roasters', '', '', 'London', 'West London', 'United Kingdom', 51.50, -0.30, 'seed', 'seed:london-west:redemption-roasters')
ON CONFLICT(source, external_id) DO UPDATE SET
  name=excluded.name,
  city=excluded.city,
  region=excluded.region,
  country=excluded.country,
  latitude=excluded.latitude,
  longitude=excluded.longitude;

-- North London (approx center)
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id)
VALUES
  ('Campbell & Syme', '', '', 'London', 'North London', 'United Kingdom', 51.56, -0.12, 'seed', 'seed:london-north:campbell-and-syme')
ON CONFLICT(source, external_id) DO UPDATE SET
  name=excluded.name,
  city=excluded.city,
  region=excluded.region,
  country=excluded.country,
  latitude=excluded.latitude,
  longitude=excluded.longitude;

COMMIT;
