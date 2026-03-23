BEGIN;

-- Helper: UK-wide seed using approximate city/region centers.

-- East London
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('Allpress Espresso','https://www.allpressespresso.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:allpress-espresso'),
('Andronicas Coffee','https://andronicas.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:andronicas-coffee'),
('Climpson & Sons','https://climpsonandsons.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:climpson-and-sons'),
('Colombian Coffee Company','https://www.thecolombiancoffeeco.org/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:colombian-coffee-company'),
('Exmouth Coffee Roasters','https://exmouthcoffeeroasters.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:exmouth-coffee-roasters'),
('Gentlemen Baristas','https://www.thegentlemenbaristas.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:gentlemen-baristas'),
('Hermanos Colombian Coffee Roasters','https://hermanoscoffeeroasters.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:hermanos-colombian-coffee-roasters'),
('Liberty Coffee Co.','https://libertycoffeeco.co.uk/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:liberty-coffee-co'),
('London Grade Coffee','https://londongradecoffee.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:london-grade-coffee'),
('Long and Short','https://longshortlondon.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:long-and-short'),
('Nord Coffee Roasters','','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:nord-coffee-roasters'),
('Notes Coffee Roasters','https://notescoffee.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:notes-coffee-roasters'),
('Nude Coffee Roasters','https://www.nudeespresso.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:nude-coffee-roasters'),
('Ozone Coffee Roasters','https://ozonecoffee.co.uk/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:ozone-coffee-roasters'),
('Perception Coffee Roasters','https://perceptioncoffee.co.uk/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:perception-coffee-roasters'),
('Perky Blenders','https://perkyblenders.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:perky-blenders'),
('Plot Roasting','https://plotroasting.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:plot-roasting'),
('Roasting Plant','https://roastingplant.co.uk/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:roasting-plant'),
('The Roasting Shed','https://theroastingshed.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:the-roasting-shed'),
('Saint Espresso','https://www.saintespresso.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:saint-espresso'),
('Square Mile Coffee Roasters','https://shop.squaremilecoffee.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:square-mile-coffee-roasters'),
('Union Coffee Roasters','https://www.unionroasted.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:union-coffee-roasters'),
('Watch House','https://watchhouse.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:watch-house'),
('Workshop Coffee','https://workshopcoffee.com/','','London','East London','United Kingdom',51.539,0.004,'seed','seed:london-east:workshop-coffee')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

-- South London
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('80 Stone Coffee Roasters','https://80stonecoffeeroasters.co.uk/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:80-stone-coffee-roasters'),
('Alchemy Coffee Roasters','https://alchemycoffee.co.uk/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:alchemy-coffee-roasters'),
('Assembly Coffee Roasters','https://assemblycoffee.co.uk/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:assembly-coffee-roasters'),
('Brew Coffee Plus','','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:brew-coffee-plus'),
('Cafédirect','https://www.cafedirect.co.uk/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:cafedirect'),
('Capital Coffee Roasters','https://capitalcoffee.co.uk/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:capital-coffee-roasters'),
('Carnival Coffee Roasters','https://carnivalcoffee.co.uk/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:carnival-coffee-roasters'),
('Eight PM Coffee','https://eightpmcoffee.com/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:eight-pm-coffee'),
('Elsewhere Coffee Roasters','https://elsewherecoffee.co.uk/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:elsewhere-coffee-roasters'),
('Full Bloom','https://fullbloom.coffee/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:full-bloom'),
('Lomond Coffee Roasters','https://lomondcoffee.co.uk/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:lomond-coffee-roasters'),
('Mission Coffee Works','https://missioncoffeeworks.com/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:mission-coffee-works'),
('Monmouth Coffee Company','https://monmouthcoffee.co.uk/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:monmouth-coffee-company'),
('Mont 58 Coffee','https://mont58coffee.com/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:mont-58-coffee'),
('Old Spike','https://oldspikeroastery.com/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:old-spike'),
('Volcano Coffee Works','https://www.volcanocoffeeworks.com/','','London','South London','United Kingdom',51.45,-0.09,'seed','seed:london-south:volcano-coffee-works')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

-- West London
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('106 Coffee Roasters','https://106coffee.com/','','London','West London','United Kingdom',51.50,-0.30,'seed','seed:london-west:106-coffee-roasters'),
('39 Steps Coffee Roasters','https://39stepscoffee.com/','','London','West London','United Kingdom',51.50,-0.30,'seed','seed:london-west:39-steps-coffee-roasters'),
('Arise Coffee Roasters','https://arisecoffee.co.uk/','','London','West London','United Kingdom',51.50,-0.30,'seed','seed:london-west:arise-coffee-roasters'),
('Chapter Coffee Roasters','https://chaptercoffeeroasters.com/','','London','West London','United Kingdom',51.50,-0.30,'seed','seed:london-west:chapter-coffee-roasters'),
('Curious Roo Coffee Roasters','https://curiousroo.com/','','London','West London','United Kingdom',51.50,-0.30,'seed','seed:london-west:curious-roo-coffee-roasters'),
('Electric Coffee Co','https://electriccoffee.co/','','London','West London','United Kingdom',51.50,-0.30,'seed','seed:london-west:electric-coffee-co'),
('Ground Coffee Society','https://groundcoffeesociety.com/','','London','West London','United Kingdom',51.50,-0.30,'seed','seed:london-west:ground-coffee-society'),
('Press Coffee','https://presscoffee.co.uk/','','London','West London','United Kingdom',51.50,-0.30,'seed','seed:london-west:press-coffee'),
('Redemption Roasters','https://redemptionroasters.com/','','London','West London','United Kingdom',51.50,-0.30,'seed','seed:london-west:redemption-roasters')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

-- North London
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('Campbell & Syme','https://campbellandsyme.com/','','London','North London','United Kingdom',51.56,-0.12,'seed','seed:london-north:campbell-and-syme'),
('Caravan Coffee Roasters','https://www.caravancoffeeroasters.co.uk/','','London','North London','United Kingdom',51.56,-0.12,'seed','seed:london-north:caravan-coffee-roasters'),
('Conscious With Coffee','','','London','North London','United Kingdom',51.56,-0.12,'seed','seed:london-north:conscious-with-coffee'),
('Cricklewood Coffee Roasters','','','London','North London','United Kingdom',51.56,-0.12,'seed','seed:london-north:cricklewood-coffee-roasters'),
('Meletius','','','London','North London','United Kingdom',51.56,-0.12,'seed','seed:london-north:meletius'),
('Scarlett Coffee Roastery','','','London','North London','United Kingdom',51.56,-0.12,'seed','seed:london-north:scarlett-coffee-roastery'),
('Terrone Coffee Roasters','','','London','North London','United Kingdom',51.56,-0.12,'seed','seed:london-north:terrone-coffee-roasters'),
('Vagabond Coffee Roasters','','','London','North London','United Kingdom',51.56,-0.12,'seed','seed:london-north:vagabond-coffee-roasters'),
('Weanie Beans','','','London','North London','United Kingdom',51.56,-0.12,'seed','seed:london-north:weanie-beans'),
('Wood Street Coffee Roasters','','','London','North London','United Kingdom',51.56,-0.12,'seed','seed:london-north:wood-street-coffee-roasters')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

-- South East (regional city groups)
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('Pelicano Coffee','https://pelicanocoffee.com/','','Brighton','South East','United Kingdom',50.830,-0.140,'seed','seed:brighton:pelicano-coffee'),
('Pharmacie Coffee','https://pharmacie.coffee/','','Brighton','South East','United Kingdom',50.830,-0.140,'seed','seed:brighton:pharmacie-coffee'),
('Red Roaster','https://redroaster.co.uk/','','Brighton','South East','United Kingdom',50.830,-0.140,'seed','seed:brighton:red-roaster'),
('Small Batch Coffee Roasters','https://www.smallbatchcoffeeroasters.co.uk/','','Brighton','South East','United Kingdom',50.830,-0.140,'seed','seed:brighton:small-batch-coffee-roasters'),
('Bohemia Roasts','','','Cambridge','South East','United Kingdom',52.205,0.121,'seed','seed:cambridge:bohemia-roasts'),
('Hot Numbers','https://hotnumberscoffee.co.uk/','','Cambridge','South East','United Kingdom',52.205,0.121,'seed','seed:cambridge:hot-numbers'),
('Sidewallk Coffee Roasters','','','Cambridge','South East','United Kingdom',52.205,0.121,'seed','seed:cambridge:sidewallk-coffee-roasters'),
('Coffee World','','','Cambridge','South East','United Kingdom',52.205,0.121,'seed','seed:cambridge:coffee-world'),
('Little Fin','','','Essex','South East','United Kingdom',51.772,0.486,'seed','seed:essex:little-fin'),
('Redber Coffee Roasters','https://redber.co.uk/','','Guildford','South East','United Kingdom',51.236,-0.570,'seed','seed:guildford:redber-coffee-roasters'),
('Anvil Coffee Roasters','https://anvilcoffee.co.uk/','','Hampshire','South East','United Kingdom',51.057,-1.308,'seed','seed:hampshire:anvil-coffee-roasters'),
('Hayling Island Coffee Society','','','Hampshire','South East','United Kingdom',51.057,-1.308,'seed','seed:hampshire:hayling-island-coffee-society'),
('Moonroast Coffee','https://moonroast.com/','','Hampshire','South East','United Kingdom',51.057,-1.308,'seed','seed:hampshire:moonroast-coffee'),
('Peaberry Coffee Roasters','','','Hampshire','South East','United Kingdom',51.057,-1.308,'seed','seed:hampshire:peaberry-coffee-roasters'),
('Winchester Coffee Roasters','','','Hampshire','South East','United Kingdom',51.057,-1.308,'seed','seed:hampshire:winchester-coffee-roasters'),
('Campervan Coffee Co','https://campervancoffee.co.uk/','','Hertfordshire','South East','United Kingdom',51.800,-0.200,'seed','seed:hertfordshire:campervan-coffee-co'),
('Viento Coffee Company','','','Hertfordshire','South East','United Kingdom',51.800,-0.200,'seed','seed:hertfordshire:viento-coffee-company'),
('Coffee Link','','','Ipswich','South East','United Kingdom',52.056,1.148,'seed','seed:ipswich:coffee-link'),
('&Bloss','','','Kent','South East','United Kingdom',51.278,0.521,'seed','seed:kent:and-bloss'),
('Curve Coffee Roasters','https://curvecoffee.co.uk/','','Kent','South East','United Kingdom',51.278,0.521,'seed','seed:kent:curve-coffee-roasters'),
('Eighty Seven +','','','Kent','South East','United Kingdom',51.278,0.521,'seed','seed:kent:eighty-seven-plus'),
('Garage Coffee','','','Kent','South East','United Kingdom',51.278,0.521,'seed','seed:kent:garage-coffee'),
('Lost Sheep Coffee','https://lostsheepcoffee.com/','','Kent','South East','United Kingdom',51.278,0.521,'seed','seed:kent:lost-sheep-coffee'),
('Mr.Coffee','','','Kent','South East','United Kingdom',51.278,0.521,'seed','seed:kent:mr-coffee'),
('Real Deal Roasters','','','Kent','South East','United Kingdom',51.278,0.521,'seed','seed:kent:real-deal-roasters'),
('Bean Smitten Coffee Roasters','https://beansmitten.com/','','Kent','South East','United Kingdom',51.278,0.521,'seed','seed:kent:bean-smitten-coffee-roasters'),
('Corban Coffee Roasters','','','Kent','South East','United Kingdom',51.278,0.521,'seed','seed:kent:corban-coffee-roasters'),
('We Are Here','','','Margate','South East','United Kingdom',51.381,1.386,'seed','seed:margate:we-are-here'),
('Strangers Coffee','https://strangerscoffee.com/','','Norwich','South East','United Kingdom',52.630,1.297,'seed','seed:norwich:strangers-coffee'),
('Smokey Barn Coffee Roasters','','','Norwich','South East','United Kingdom',52.630,1.297,'seed','seed:norwich:smokey-barn-coffee-roasters'),
('Symposium Coffee Roasters','','','Norwich','South East','United Kingdom',52.630,1.297,'seed','seed:norwich:symposium-coffee-roasters'),
('Happy Donkey','https://happy-donkey.co.uk/','','Reading','South East','United Kingdom',51.454,-0.978,'seed','seed:reading:happy-donkey'),
('Lincoln Coffee Roasters','','','Reading','South East','United Kingdom',51.454,-0.978,'seed','seed:reading:lincoln-coffee-roasters'),
('Cast Iron Coffee Roasters','https://castironroasters.com/','','Chichester','West Sussex','United Kingdom',50.836,-0.774,'seed','seed:chichester:cast-iron-coffee-roasters'),
('Sunday Coffee Roasters','','','Portsmouth','South East','United Kingdom',50.819,-1.088,'seed','seed:portsmouth:sunday-coffee-roasters'),
('Mozzo Coffee','https://mozzocoffee.com/','','Southampton','South East','United Kingdom',50.909,-1.404,'seed','seed:southampton:mozzo-coffee'),
('So Roast Coffee','','','Southampton','South East','United Kingdom',50.909,-1.404,'seed','seed:southampton:so-roast-coffee'),
('Cuckfield Coffee Co','','','Sussex','South East','United Kingdom',50.928,-0.298,'seed','seed:sussex:cuckfield-coffee-co'),
('Macondo Coffee Roasters','https://macondocoffee.com/','','Sussex','South East','United Kingdom',50.928,-0.298,'seed','seed:sussex:macondo-coffee-roasters'),
('Horsham Coffee Roasters','','','Sussex','South East','United Kingdom',50.928,-0.298,'seed','seed:sussex:horsham-coffee-roasters'),
('Edgecumbs Coffee Roasters','','','Littlehampton','West Sussex','United Kingdom',50.810,-0.541,'seed','seed:littlehampton:edgecumbs-coffee-roasters')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

-- South West
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('Coffee Factory','','','Axminster','South West','United Kingdom',50.781,-2.997,'seed','seed:axminster:coffee-factory'),
('Caer Urfa Coffee','','','Bournemouth','South West','United Kingdom',50.719,-1.880,'seed','seed:bournemouth:caer-urfa-coffee'),
('Wellington Coffee Roasters','','','Bournemouth','South West','United Kingdom',50.719,-1.880,'seed','seed:bournemouth:wellington-coffee-roasters'),
('Colonna Coffee','https://colonnacoffee.com/','','Bath','South West','United Kingdom',51.381,-2.359,'seed','seed:bath:colonna-coffee'),
('Gillards of Bath','https://www.gillardsofbath.co.uk/','','Bath','South West','United Kingdom',51.381,-2.359,'seed','seed:bath:gillards-of-bath'),
('Roundhill Roastery','','','Bath','South West','United Kingdom',51.381,-2.359,'seed','seed:bath:roundhill-roastery'),
('Blind Owl','','','Bristol','South West','United Kingdom',51.454,-2.587,'seed','seed:bristol:blind-owl'),
('Boona Boona','https://boonaboona.co.uk/','','Bristol','South West','United Kingdom',51.454,-2.587,'seed','seed:bristol:boona-boona'),
('Clifton Coffee Roasters','https://cliftoncoffee.co.uk/','','Bristol','South West','United Kingdom',51.454,-2.587,'seed','seed:bristol:clifton-coffee-roasters'),
('Extract Coffee Roasters','https://extractcoffee.co.uk/','','Bristol','South West','United Kingdom',51.454,-2.587,'seed','seed:bristol:extract-coffee-roasters'),
('Lost Horizon','','','Bristol','South West','United Kingdom',51.454,-2.587,'seed','seed:bristol:lost-horizon'),
('Triple Co Roast','','','Bristol','South West','United Kingdom',51.454,-2.587,'seed','seed:bristol:triple-co-roast'),
('Two Day Coffee Roasters','','','Bristol','South West','United Kingdom',51.454,-2.587,'seed','seed:bristol:two-day-coffee-roasters'),
('Wogan Coffee','https://wogancoffee.com/','','Bristol','South West','United Kingdom',51.454,-2.587,'seed','seed:bristol:wogan-coffee'),
('Ritual Coffee Roasters','','','Cheltenham','South West','United Kingdom',51.899,-2.078,'seed','seed:cheltenham:ritual-coffee-roasters'),
('Rave Coffee Roasters','https://ravecoffee.co.uk/','','Cirencester','South West','United Kingdom',51.717,-1.968,'seed','seed:cirencester:rave-coffee-roasters'),
('Fire and Flow Coffee Roasters','','','Cirencester','South West','United Kingdom',51.717,-1.968,'seed','seed:cirencester:fire-and-flow-coffee-roasters'),
('Freehand Coffee Roasters','https://freehandcoffee.co.uk/','','Cornwall','South West','United Kingdom',50.266,-5.052,'seed','seed:cornwall:freehand-coffee-roasters'),
('Foundation Coffee Roasters','','','Cornwall','South West','United Kingdom',50.266,-5.052,'seed','seed:cornwall:foundation-coffee-roasters'),
('Ol Factory','','','Cornwall','South West','United Kingdom',50.266,-5.052,'seed','seed:cornwall:ol-factory'),
('Hands On Coffee','','','Cornwall','South West','United Kingdom',50.266,-5.052,'seed','seed:cornwall:hands-on-coffee'),
('Origin Coffee Roasters','https://www.origincoffee.co.uk/','','Cornwall','South West','United Kingdom',50.266,-5.052,'seed','seed:cornwall:origin-coffee-roasters'),
('Yallah Coffee Roasters','https://yallahcoffee.co.uk/','','Cornwall','South West','United Kingdom',50.266,-5.052,'seed','seed:cornwall:yallah-coffee-roasters'),
('Cannonball Coffee Company','','','Dorset','South West','United Kingdom',50.748,-2.344,'seed','seed:dorset:cannonball-coffee-company'),
('Crankhouse Coffee Roasters','https://crankhousecoffee.co.uk/','','Exeter','South West','United Kingdom',50.718,-3.533,'seed','seed:exeter:crankhouse-coffee-roasters'),
('EXE Coffee Roasters','','','Exeter','South West','United Kingdom',50.718,-3.533,'seed','seed:exeter:exe-coffee-roasters'),
('Littlestone Coffee Roasters','','','Exeter','South West','United Kingdom',50.718,-3.533,'seed','seed:exeter:littlestone-coffee-roasters'),
('Ethical Addictions','','','Gloucester','South West','United Kingdom',51.864,-2.245,'seed','seed:gloucester:ethical-addictions'),
('Boost Coffee Roasters','','','Gloucester','South West','United Kingdom',51.864,-2.245,'seed','seed:gloucester:boost-coffee-roasters')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

-- Midlands
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('Quarter Horse Coffee','https://quarterhorsecoffee.com/','','Birmingham','Midlands','United Kingdom',52.486,-1.890,'seed','seed:birmingham:quarter-horse-coffee'),
('Yorks Coffee Roasters','https://yorks.coffee/','','Birmingham','Midlands','United Kingdom',52.486,-1.890,'seed','seed:birmingham:yorks-coffee-roasters'),
('Ngopi Coffee Roasters','','','Birmingham','Midlands','United Kingdom',52.486,-1.890,'seed','seed:birmingham:ngopi-coffee-roasters'),
('Azorie Blue','','','Derby','Midlands','United Kingdom',52.922,-1.477,'seed','seed:derby:azorie-blue'),
('The Bean Works','','','Derby','Midlands','United Kingdom',52.922,-1.477,'seed','seed:derby:the-bean-works'),
('Sacred Bean','','','Derby','Midlands','United Kingdom',52.922,-1.477,'seed','seed:derby:sacred-bean'),
('St Martins Coffee Roasters','','','Leicester','Midlands','United Kingdom',52.636,-1.139,'seed','seed:leicester:st-martins-coffee-roasters'),
('200 Degrees Coffee','https://200degs.com/','','Nottingham','Midlands','United Kingdom',52.954,-1.158,'seed','seed:nottingham:200-degrees-coffee'),
('47 Degrees Coffee Roasters','','','Nottingham','Midlands','United Kingdom',52.954,-1.158,'seed','seed:nottingham:47-degrees-coffee-roasters'),
('Cartwheel Coffee','','','Nottingham','Midlands','United Kingdom',52.954,-1.158,'seed','seed:nottingham:cartwheel-coffee'),
('Coffee Central','','','Nottingham','Midlands','United Kingdom',52.954,-1.158,'seed','seed:nottingham:coffee-central'),
('Outpost Coffee Roasters','https://outpostcoffee.com/','','Nottingham','Midlands','United Kingdom',52.954,-1.158,'seed','seed:nottingham:outpost-coffee-roasters'),
('The Roasting House','','','Nottingham','Midlands','United Kingdom',52.954,-1.158,'seed','seed:nottingham:the-roasting-house'),
('Stewarts of Trent Bridge','','','Nottingham','Midlands','United Kingdom',52.954,-1.158,'seed','seed:nottingham:stewarts-of-trent-bridge'),
('Two Chimps Coffee Roasters','https://twochimpscoffee.com/','','Oakham','Midlands','United Kingdom',52.669,-0.733,'seed','seed:oakham:two-chimps-coffee-roasters'),
('Colombia Coffee Roasters','','','Oxford','Midlands','United Kingdom',51.752,-1.258,'seed','seed:oxford:colombia-coffee-roasters'),
('Jericho Coffee Traders','','','Oxford','Midlands','United Kingdom',51.752,-1.258,'seed','seed:oxford:jericho-coffee-traders'),
('Missing Bean','https://missingbean.co.uk/','','Oxford','Midlands','United Kingdom',51.752,-1.258,'seed','seed:oxford:missing-bean'),
('New Ground Coffee Roasters','','','Oxford','Midlands','United Kingdom',51.752,-1.258,'seed','seed:oxford:new-ground-coffee-roasters'),
('UE Coffee Roasters','','','Oxford','Midlands','United Kingdom',51.752,-1.258,'seed','seed:oxford:ue-coffee-roasters'),
('Has Bean Coffee Roasters','https://hasbean.co.uk/','','Staffordshire','Midlands','United Kingdom',52.806,-2.116,'seed','seed:staffordshire:has-bean-coffee-roasters'),
('Full Spectrum Coffee Roasters','','','Shrewsbury','Midlands','United Kingdom',52.707,-2.755,'seed','seed:shrewsbury:full-spectrum-coffee-roasters')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

-- Wales
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('Bridge Coffee Roasters','','','Cardiff','Wales','United Kingdom',51.481,-3.179,'seed','seed:cardiff:bridge-coffee-roasters'),
('Quantum Coffee Roasters','','','Cardiff','Wales','United Kingdom',51.481,-3.179,'seed','seed:cardiff:quantum-coffee-roasters'),
('Lufkin Coffee','','','Cardiff','Wales','United Kingdom',51.481,-3.179,'seed','seed:cardiff:lufkin-coffee'),
('Uncommon Ground Coffee Roasters','','','Cardiff','Wales','United Kingdom',51.481,-3.179,'seed','seed:cardiff:uncommon-ground-coffee-roasters')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

-- North West
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('Jaunty Goat','https://jauntygoat.co.uk/','','Chester','North West','United Kingdom',53.193,-2.893,'seed','seed:chester:jaunty-goat'),
('Third Wave Coffee Roasters','','','Bradford','North West','United Kingdom',53.795,-1.759,'seed','seed:bradford:third-wave-coffee-roasters'),
('White Rose Coffee Roasters','','','Halifax','North West','United Kingdom',53.721,-1.863,'seed','seed:halifax:white-rose-coffee-roasters'),
('Bean Brothers','','','Huddersfield','North West','United Kingdom',53.646,-1.780,'seed','seed:huddersfield:bean-brothers'),
('Rinaldo’s Speciality Coffee','','','The Lake District','North West','United Kingdom',54.460,-3.089,'seed','seed:lake-district:rinaldos-speciality-coffee'),
('Atkinsons Coffee Roasters','https://atkinsonsoflancaster.co.uk/','','Lancaster','North West','United Kingdom',54.048,-2.800,'seed','seed:lancaster:atkinsons-coffee-roasters'),
('92 Degrees Coffee Roasters','https://92degrees.coffee/','','Liverpool','North West','United Kingdom',53.408,-2.991,'seed','seed:liverpool:92-degrees-coffee-roasters'),
('Adams and Russell Coffee Roasters','','','Liverpool','North West','United Kingdom',53.408,-2.991,'seed','seed:liverpool:adams-and-russell-coffee-roasters'),
('Crosby Coffee','','','Liverpool','North West','United Kingdom',53.408,-2.991,'seed','seed:liverpool:crosby-coffee'),
('Joe Black Coffee','','','Liverpool','North West','United Kingdom',53.408,-2.991,'seed','seed:liverpool:joe-black-coffee'),
('Neighbourhood Coffee Roasters','','','Liverpool','North West','United Kingdom',53.408,-2.991,'seed','seed:liverpool:neighbourhood-coffee-roasters'),
('Now Coffee','','','Liverpool','North West','United Kingdom',53.408,-2.991,'seed','seed:liverpool:now-coffee'),
('Ancoats Coffee','','','Manchester','North West','United Kingdom',53.480,-2.242,'seed','seed:manchester:ancoats-coffee'),
('Blossom Coffee Roasters','','','Manchester','North West','United Kingdom',53.480,-2.242,'seed','seed:manchester:blossom-coffee-roasters'),
('Grindsmith Coffee Roasters','https://grindsmith.com/','','Manchester','North West','United Kingdom',53.480,-2.242,'seed','seed:manchester:grindsmith-coffee-roasters'),
('Heart and Graft Coffee Roasters','','','Manchester','North West','United Kingdom',53.480,-2.242,'seed','seed:manchester:heart-and-graft-coffee-roasters'),
('Mancoco Coffee Roasters','https://mancoco.co.uk/','','Manchester','North West','United Kingdom',53.480,-2.242,'seed','seed:manchester:mancoco-coffee-roasters'),
('Passion Fruit Coffee Roasters','','','Manchester','North West','United Kingdom',53.480,-2.242,'seed','seed:manchester:passion-fruit-coffee-roasters'),
('Salford Roasters','','','Manchester','North West','United Kingdom',53.480,-2.242,'seed','seed:manchester:salford-roasters'),
('Swansong Coffee','','','Manchester','North West','United Kingdom',53.480,-2.242,'seed','seed:manchester:swansong-coffee'),
('Black Bag Coffee Co','','','Sheffield','North West','United Kingdom',53.382,-1.465,'seed','seed:sheffield:black-bag-coffee-co'),
('Cafeology','','','Sheffield','North West','United Kingdom',53.382,-1.465,'seed','seed:sheffield:cafeology'),
('Forge Coffee Roasters','','','Sheffield','North West','United Kingdom',53.382,-1.465,'seed','seed:sheffield:forge-coffee-roasters'),
('Foundry Coffee Roasters','','','Sheffield','North West','United Kingdom',53.382,-1.465,'seed','seed:sheffield:foundry-coffee-roasters'),
('Frazers Coffee Roasters','','','Sheffield','North West','United Kingdom',53.382,-1.465,'seed','seed:sheffield:frazers-coffee-roasters'),
('Pollards Coffee','','','Sheffield','North West','United Kingdom',53.382,-1.465,'seed','seed:sheffield:pollards-coffee')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

-- North East
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('Fika Coffee Roasters','','','Durham','North East','United Kingdom',54.776,-1.575,'seed','seed:durham:fika-coffee-roasters'),
('Dark Woods Coffee LTD','https://darkwoodscoffee.co.uk/','','Huddersfield','North East','United Kingdom',53.646,-1.780,'seed','seed:huddersfield:dark-woods-coffee'),
('The Blending Room','','','Hull','North East','United Kingdom',53.745,-0.336,'seed','seed:hull:the-blending-room'),
('CLO Coffee','','','Leeds','North East','United Kingdom',53.801,-1.549,'seed','seed:leeds:clo-coffee'),
('Maude Coffee Roasters','','','Leeds','North East','United Kingdom',53.801,-1.549,'seed','seed:leeds:maude-coffee-roasters'),
('North Star Coffee Roasters','https://northstarroast.com/','','Leeds','North East','United Kingdom',53.801,-1.549,'seed','seed:leeds:north-star-coffee-roasters'),
('Goldbox Coffee Roasters','','','Newcastle','North East','United Kingdom',54.978,-1.617,'seed','seed:newcastle:goldbox-coffee-roasters'),
('Ouseburn Coffee Co','https://ouseburncoffee.co.uk/','','Newcastle','North East','United Kingdom',54.978,-1.617,'seed','seed:newcastle:ouseburn-coffee-co'),
('Pink Lane Coffee','https://pinklanecoffee.co.uk/','','Newcastle','North East','United Kingdom',54.978,-1.617,'seed','seed:newcastle:pink-lane-coffee'),
('Pumphreys Coffee','https://pumphreys.com/','','Newcastle','North East','United Kingdom',54.978,-1.617,'seed','seed:newcastle:pumphreys-coffee'),
('Tynemouth Coffee Co','https://tynemouthcoffee.com/','','Newcastle','North East','United Kingdom',54.978,-1.617,'seed','seed:newcastle:tynemouth-coffee-co'),
('Pilgrims Coffee Roasters','https://pilgrimscoffee.com/','','Northumberland','North East','United Kingdom',55.250,-2.000,'seed','seed:northumberland:pilgrims-coffee-roasters'),
('Divine Coffee Roasters','','','York','North East','United Kingdom',53.959,-1.081,'seed','seed:york:divine-coffee-roasters'),
('York Emporium','','','York','North East','United Kingdom',53.959,-1.081,'seed','seed:york:york-emporium')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

-- Scotland
INSERT INTO roasteries (name, website, address, city, region, country, latitude, longitude, source, external_id) VALUES
('Macbeans','','','Aberdeen','Scotland','United Kingdom',57.149,-2.094,'seed','seed:aberdeen:macbeans'),
('James Aimers Coffee Roasters','','','Dundee','Scotland','United Kingdom',56.462,-2.970,'seed','seed:dundee:james-aimers-coffee-roasters'),
('5 Rings Coffee','','','Edinburgh','Scotland','United Kingdom',55.953,-3.188,'seed','seed:edinburgh:5-rings-coffee'),
('Artisan Roast','https://artisanroast.co.uk/','','Edinburgh','Scotland','United Kingdom',55.953,-3.188,'seed','seed:edinburgh:artisan-roast'),
('Forth Coffee Roasters','','','Edinburgh','Scotland','United Kingdom',55.953,-3.188,'seed','seed:edinburgh:forth-coffee-roasters'),
('Fortitude Coffee Roasters','https://fortitudecoffee.com/','','Edinburgh','Scotland','United Kingdom',55.953,-3.188,'seed','seed:edinburgh:fortitude-coffee-roasters'),
('Machina Coffee Roasters','','','Edinburgh','Scotland','United Kingdom',55.953,-3.188,'seed','seed:edinburgh:machina-coffee-roasters'),
('Modern Standard','','','Edinburgh','Scotland','United Kingdom',55.953,-3.188,'seed','seed:edinburgh:modern-standard'),
('Mr Eion Coffee Roasters','','','Edinburgh','Scotland','United Kingdom',55.953,-3.188,'seed','seed:edinburgh:mr-eion-coffee-roasters'),
('Williams and Johnson Coffee Roasters','','','Edinburgh','Scotland','United Kingdom',55.953,-3.188,'seed','seed:edinburgh:williams-and-johnson-coffee-roasters'),
('Common Coffee Roasters','','','Fife','Scotland','United Kingdom',56.208,-3.149,'seed','seed:fife:common-coffee-roasters'),
('Alfie and Co Coffee Roasters','','','Glasgow','Scotland','United Kingdom',55.864,-4.251,'seed','seed:glasgow:alfie-and-co-coffee-roasters'),
('Dear Green Coffee Roasters','https://deargreencoffee.com/','','Glasgow','Scotland','United Kingdom',55.864,-4.251,'seed','seed:glasgow:dear-green-coffee-roasters'),
('The Steamie Coffee Roasters','','','Glasgow','Scotland','United Kingdom',55.864,-4.251,'seed','seed:glasgow:the-steamie-coffee-roasters'),
('Ovenbird Coffee Roasters','','','Glasgow','Scotland','United Kingdom',55.864,-4.251,'seed','seed:glasgow:ovenbird-coffee-roasters'),
('The Good Cartel','','','Glasgow','Scotland','United Kingdom',55.864,-4.251,'seed','seed:glasgow:the-good-cartel'),
('Gordon Street Coffee','','','Glasgow','Scotland','United Kingdom',55.864,-4.251,'seed','seed:glasgow:gordon-street-coffee'),
('Italian Aroma Coffee','','','Glasgow','Scotland','United Kingdom',55.864,-4.251,'seed','seed:glasgow:italian-aroma-coffee'),
('Matthew Algie','','','Glasgow','Scotland','United Kingdom',55.864,-4.251,'seed','seed:glasgow:matthew-algie'),
('Paper Cup Coffee','','','Glasgow','Scotland','United Kingdom',55.864,-4.251,'seed','seed:glasgow:paper-cup-coffee'),
('Thomson’s Coffee Roasters','','','Glasgow','Scotland','United Kingdom',55.864,-4.251,'seed','seed:glasgow:thomsons-coffee-roasters'),
('Glen Lyon Coffee Roasters','','','The Highlands','Scotland','United Kingdom',57.120,-4.710,'seed','seed:highlands:glen-lyon-coffee-roasters'),
('Wild Highlands Coffee','','','Loch Lomond','Scotland','United Kingdom',56.080,-4.640,'seed','seed:loch-lomond:wild-highlands-coffee'),
('Steam Punk Coffee Roasters','','','North Berwick','Scotland','United Kingdom',56.059,-2.719,'seed','seed:north-berwick:steam-punk-coffee-roasters'),
('Temple','','','Outer Hebrides','Scotland','United Kingdom',57.450,-7.000,'seed','seed:outer-hebrides:temple')
ON CONFLICT(source, external_id) DO UPDATE SET name=excluded.name, city=excluded.city, region=excluded.region, country=excluded.country, latitude=excluded.latitude, longitude=excluded.longitude;

COMMIT;
