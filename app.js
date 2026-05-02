(function() {
'use strict';

/* =============================================================================
 ATTICO PANORAMICO — App per ospiti (logica applicativa)

 Struttura:
 1. Navigazione SPA
 2. Menu Mobile e Sottomenu
 3. FAQ Accordion
 4. Accordion Mappe
 5. Pulsante"Torna in alto"
 6. Sistema di Traduzione
 7. Inizializzazione
 ============================================================================= */

/* -----------------------------------------------------------------------------
 Cache DOM — elementi riutilizzati in piu' punti
 ----------------------------------------------------------------------------- */
var dom = {};

/** Popola la cache DOM (chiamata una volta al DOMContentLoaded) */
function cacheDom() {
 dom.header = document.querySelector('.site-header');
 dom.mainNav = document.getElementById('mainNav');
 dom.menuToggle = document.querySelector('.menu-toggle');
 dom.backToTop = document.getElementById('backToTop');
 dom.langFlag = document.getElementById('langFlag');
 dom.langLabel = document.getElementById('langLabel');
 dom.langDropdown = document.getElementById('langDropdown');
 dom.langToggle = document.getElementById('langToggle');
 dom.faqGrid = document.querySelector('.faq-grid');
 dom.navList = document.querySelector('.nav-list');
 dom.logo = document.querySelector('.logo');
}

/* =============================================================================
 1. NAVIGAZIONE SPA
 Gestisce il routing basato su hash (#pagina) per la SPA.
 ============================================================================= */

/** Naviga alla pagina specificata attivando la sezione corrispondente */
function navigateTo(pagina) {
 // Disattiva tutte le pagine
 document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });

 // Attiva la pagina target con animazione di entrata
 var target = document.getElementById('page-' + pagina);
 if (target) {
 target.classList.add('active');
 target.style.animation = 'none';
 target.offsetHeight; // Forza reflow per riavviare l'animazione
 target.style.animation = '';
 }

 // Rimuovi evidenziazione link attivo nel menu
 document.querySelectorAll('.nav-list > li > a').forEach(function(a) { a.classList.remove('active'); });

 chiudiMenu();
 window.scrollTo({ top: 0, behavior: 'smooth' });
 history.pushState(null, '', '#' + pagina);
}

// Gestisce il pulsante"indietro"del browser
window.addEventListener('popstate', function() {
 var hash = location.hash.replace('#', '') || 'home';
 navigateTo(hash);
});

/** Carica la pagina dall'hash attuale nell'URL */
function caricaDaHash() {
 var hash = location.hash.replace('#', '');
 if (hash && document.getElementById('page-' + hash)) {
 navigateTo(hash);
 }
}

/* =============================================================================
 2. MENU MOBILE E SOTTOMENU
 Gestisce l'hamburger menu su mobile e i sottomenu a tendina.
 ============================================================================= */

/** Apre/chiude il menu mobile */
function toggleMenu() {
 dom.mainNav.classList.toggle('open');
 dom.menuToggle.classList.toggle('active');
 var aperto = dom.mainNav.classList.contains('open');
 dom.menuToggle.setAttribute('aria-expanded', String(aperto));
 // Blocca lo scroll del body quando il menu e' aperto
 document.body.style.overflow = aperto ? 'hidden' : '';
}

/** Chiude il menu mobile */
function chiudiMenu() {
 dom.mainNav.classList.remove('open');
 dom.menuToggle.classList.remove('active');
 document.body.style.overflow = '';
}

/** Apre/chiude un sottomenu, chiudendo gli altri */
function toggleSubmenu(e) {
 e.preventDefault();
 e.stopPropagation();
 var contenitore = e.target.closest('.has-submenu');
 var sottomenu = contenitore.querySelector('.submenu');
 var trigger = contenitore.querySelector('a[aria-haspopup]');
 // Chiudi tutti gli altri sottomenu aperti
 document.querySelectorAll('.submenu.open').forEach(function(s) {
 if (s !== sottomenu) {
 s.classList.remove('open');
 var altroTrigger = s.parentElement.querySelector('a[aria-haspopup]');
 if (altroTrigger) altroTrigger.setAttribute('aria-expanded', 'false');
 }
 });
 sottomenu.classList.toggle('open');
 if (trigger) trigger.setAttribute('aria-expanded', String(sottomenu.classList.contains('open')));
}

// Chiudi i sottomenu cliccando fuori
document.addEventListener('click', function(e) {
 if (!e.target.closest('.has-submenu')) {
 document.querySelectorAll('.submenu.open').forEach(function(s) { s.classList.remove('open'); });
 }
});

/* =============================================================================
 3. FAQ ACCORDION
 Gestisce l'apertura/chiusura delle FAQ con auto-chiusura e scroll.
 ============================================================================= */

/** Apre/chiude una FAQ card, chiudendo le altre */
function toggleFaq(card) {
 var eraAperta = card.classList.contains('open');

 // Chiudi tutte le altre FAQ aperte e aggiorna aria-expanded
 document.querySelectorAll('.faq-card.open').forEach(function(altreCard) {
 if (altreCard !== card) {
 altreCard.classList.remove('open');
 altreCard.setAttribute('aria-expanded', 'false');
 }
 });

 card.classList.toggle('open', !eraAperta);
 card.setAttribute('aria-expanded', String(!eraAperta));

 // Scroll alla card appena aperta con un leggero ritardo per l'animazione
 if (!eraAperta) {
 setTimeout(function() {
 var altezzaHeader = (dom.header && dom.header.offsetHeight) || 70;
 var posizione = card.getBoundingClientRect().top + window.pageYOffset - altezzaHeader - 10;
 window.scrollTo({ top: posizione, behavior: 'smooth' });
 }, 350);
 }
}

/* =============================================================================
 4. ACCORDION MAPPE (NEI DINTORNI)
 Gestisce l'accordion delle mappe con animazione maxHeight.
 ============================================================================= */

/** Inizializza tutti gli accordion header con eventi click */
function inizializzaAccordion() {
 document.querySelectorAll('.accordion-header').forEach(function(header) {
 // Ignora i link esterni (non sono accordion espandibili)
 if (header.tagName === 'A') return;

 header.addEventListener('click', function() {
 var elemento = header.parentElement;
 var corpo = elemento.querySelector('.accordion-body');
 var icona = header.querySelector('.accordion-icon');
 var aperto = elemento.classList.contains('open');

 // Chiudi tutti gli altri accordion aperti
 document.querySelectorAll('.accordion-item.open').forEach(function(altroElemento) {
 if (altroElemento !== elemento) {
 altroElemento.classList.remove('open');
 altroElemento.querySelector('.accordion-body').style.maxHeight = null;
 altroElemento.querySelector('.accordion-icon').textContent = '+';
 }
 });

 // Apri o chiudi l'elemento corrente
 if (aperto) {
 elemento.classList.remove('open');
 corpo.style.maxHeight = null;
 icona.textContent = '+';
 } else {
 elemento.classList.add('open');
 corpo.style.maxHeight = corpo.scrollHeight + 'px';
 icona.textContent = '\u2212'; // Simbolo meno

 // Scroll all'header dopo che l'animazione di espansione e' terminata
 corpo.addEventListener('transitionend', function gestisciScroll() {
 corpo.removeEventListener('transitionend', gestisciScroll);
 var altezzaHeader = (dom.header && dom.header.offsetHeight) || 70;
 var posizione = header.getBoundingClientRect().top + window.pageYOffset - altezzaHeader - 10;
 window.scrollTo({ top: posizione, behavior: 'smooth' });
 });

 // Aggiorna maxHeight dopo il caricamento dell'iframe (se presente)
 setTimeout(function() {
 if (elemento.classList.contains('open')) {
 corpo.style.maxHeight = corpo.scrollHeight + 'px';
 }
 }, 500);
 }
 });
 });
}

/* =============================================================================
 5. PULSANTE"TORNA IN ALTO"
 Mostra/nasconde il pulsante basandosi sulla posizione di scroll.
 ============================================================================= */

window.addEventListener('scroll', function() {
 if (dom.backToTop) {
 dom.backToTop.classList.toggle('visible', window.scrollY > 400);
 }
});

/* =============================================================================
 6. SISTEMA DI TRADUZIONE (IT/EN/DE/FR/ES)
 Gestisce il cambio lingua tramite attributi data-i18n e dropdown.
 ============================================================================= */
var linguaCorrente = 'it';

/** Dizionario traduzioni. Le chiavi corrispondono agli attributi data-i18n nell'HTML. */
var traduzioni = {
 en: {
 // Header e Navigazione
 tagline:"Your oasis in Milazzo!",
 nav_home:"Home",
 nav_faq:"FAQ",
 nav_nearby:"Maps",
 nav_position:"Our location",
 nav_things:"Things to Do \u25BE",
 nav_experiences:"Experiences",
 nav_bikes:"Bicycle Rental",
 nav_tarnav:"Mini Cruises - Tarnav",
 nav_navisal:"Mini Cruises - Navisal",
 nav_boat:"Aeolian Islands Boat Tour",
 nav_tripadvisor:"On Tripadvisor",
 nav_numbers:"Useful Numbers",
 nav_reviews:"Reviews",
 nav_availability:"Availability",
 nav_vtour:"Castle Virtual Tour",
 nav_mapsicily:"Sicily Map",
 nav_mapitaly:"Italy Map",

 // Home
 welcome_title:"Welcome to our holiday home!",
 welcome_1:"Dear guests, Welcome to our holiday home in Milazzo! We are here to guarantee you an unforgettable stay, taking care of every detail to make you feel at home.",
 welcome_2:"The house is designed to offer you comfort and relaxation, with a fully equipped kitchen, cozy living spaces and comfortable bedrooms.",
 welcome_3:"Milazzo awaits you with its history, culture and natural beauty. We are happy to share with you the best tips to make your experience even more enjoyable.",
 welcome_4:"We remain at your disposal for any need.",
 welcome_enjoy:"Enjoy your Stay!",
 contacts:"Contacts",

 // FAQ - Categorie
 faq_title:"Frequently Asked Questions",
 faq_subtitle:"Everything you need to know for your stay",
 faq_cat_access:"Check-in & Arrival",
 faq_cat_climate:"Climate & Comfort",
 faq_cat_kitchen:"Kitchen",
 faq_cat_electric:"Electricity & Technology",
 faq_cat_cleaning:"Cleaning & Housekeeping",
 faq_cat_veranda:"Veranda & Outdoors",
 faq_cat_safety:"Safety",

 // FAQ - WiFi e Contatti
 faq_wifi:"WiFi & Contacts",
 faq_wifi_net:"WiFi Networks",
 faq_wifi_pass:"WiFi Password",
 faq_wifi_copy:"Copy",
 faq_wifi_copied:"Copied!",
 faq_wifi_notebook:"Notebook Password",
 faq_wifi_phone:"Phone",
 faq_wifi_wa:"WhatsApp",

 // FAQ - Chiavi
 faq_keys:"Keys",
 faq_keys_1:"Remote control for garage gate",
 faq_keys_2:"Black \u2013 Apartment entrance door",
 faq_keys_3:"Light blue \u2013 House entrance front door",
 faq_keys_4:"Blue \u2013 Building entrance door",
 faq_keys_5:"Green \u2013 Garage door to elevator",
 faq_keys_6:"Red \u2013 Garage tilt-up door",

 // FAQ - Termostato
 faq_thermo:"Heating Thermostat",
 faq_thermo_loc:"Location: to the right of the kitchen entrance door.",
 faq_thermo_sim:"Open Interactive Simulator",

 // FAQ - Climatizzatori
 faq_ac:"Air Conditioning",
 faq_ac_0:"Dear guests, we hope your stay is pleasant and comfortable. Here are some important recommendations for using the air conditioning:",
 faq_ac_1:"Set the temperature to 24-26 degrees Celsius. Lower temperatures are harmful to health and energy consumption.",
 faq_ac_2:"Keep doors and windows closed during use. Turn off when you are away.",

 // FAQ - Tecnologia
 faq_usb:"USB Charging Station",
 faq_usb_desc:"Located on the living room cabinet, it has 6 USB 3.0 ports for fast and simultaneous charging of 6 devices.",
 faq_projector:"Video Projector",
 faq_projector_loc:"Switch: to the left of the living room entrance door.",
 faq_projector_r1:"<strong>Remote 1</strong> \u2013 screen navigation",
 faq_projector_r2:"<strong>Remote 2</strong> \u2013 on/off (press the red button)",

 // FAQ - Cucina
 faq_hotwater:"If Hot Water Doesn't Work",
 faq_hotwater_desc:"Simply turn the switch back on in the left bathroom (hot water switch).",
 faq_stove:"ON/OFF Stovetop - Oven",
 faq_stove_desc:"The switch is used to turn on and off the electrical power to the oven and stovetop.",
 faq_oven:"Electric Oven",
 faq_oven_proc:"Procedure:",
 faq_oven_1:"Press the ON button",
 faq_oven_2:"Use the programs area, select the desired symbol",
 faq_oven_3:"Adjust temperature in the settings area",
 faq_oven_4:"Verify program light is on, press Start",
 faq_oven_5:"End: return selector to 0 or press ON",
 faq_oven_warn:"<strong>Safety:</strong> use only suitable trays, no plastic/paper, the oven gets very hot.",
 faq_dishwasher:"Dishwasher",
 faq_dishwasher_model:"Electrolux ESL5205LO \u2014 control panel on the top edge of the door.",
 faq_dishwasher_how:"How to start a wash cycle",
 faq_dishwasher_s1:"Open the door and load the dishes",
 faq_dishwasher_s2:"Place a detergent tablet in the dispenser on the inside of the door",
 faq_dishwasher_s3:"Close the door",
 faq_dishwasher_s4:"Press the <strong>ON/OFF</strong> button (on the left)",
 faq_dishwasher_s5:"Press the <strong>Program</strong> button repeatedly to select the program (the corresponding light turns on)",
 faq_dishwasher_s6:"The wash cycle starts automatically after a few seconds",
 faq_dishwasher_prog:"Recommended programs",
 faq_dishwasher_eco:"Daily use, energy saving",
 faq_dishwasher_normal:"Normal soiling",
 faq_dishwasher_intensive:"Pots and stubborn dirt",
 faq_dishwasher_quick:"Quick wash ~30 min",
 faq_dishwasher_rinse:"Rinse only, no detergent",
 faq_dishwasher_tip1:"<strong>Tip:</strong> for everyday use, <strong>ECO 50\u00b0</strong> is the ideal program.",
 faq_dishwasher_tip2:"<strong>Delayed start:</strong> press <strong>3h Delay</strong> to start the wash in 3 hours.",
 faq_dishwasher_reset:"<strong>Reset:</strong> <span style=\"color:#e0e0e0;\">hold the Program button for 3 seconds.</span>",

 // FAQ - Pulizie
 faq_linen:"Cleaning & Linen Change",
 faq_linen_1:"<strong>Clean linen is in the central drawer, marked with an arrow.</strong>",
 faq_linen_2:"For stays longer than one week:",
 faq_linen_spare:"Spare linen is available in the same drawer.",
 faq_linen_used:"Used linen should be placed in a bag and left outside the door by 8:00 AM, after notifying us for pickup.",
 faq_linen_clean:"Professional cleaning service: <strong>\u20AC 60 per session</strong>, with agreed day and time.",
 faq_clothesline:"Drying Rack",

 // FAQ - Rifiuti
 faq_waste:"Waste Sorting & Recycling",
 faq_waste_loc:"Bins are inside the apartment on the veranda.",
 day:"Day",
 waste_type:"Waste Type",
 monday:"Monday",
 tuesday:"Tuesday",
 wednesday:"Wednesday",
 thursday:"Thursday",
 friday:"Friday",
 saturday:"Saturday",
 sunday:"Sunday",
 organic:"Organic",
 unsorted:"Unsorted waste",
 paper:"Paper & Cardboard",
 organic2:"Organic",
 plastic:"Plastic & Cans",
 organic_glass:"Organic & Glass",
 no_collection:"No collection",
 faq_waste_deposit:"Please deposit waste <strong>every day</strong>, starting from <strong>8:00 PM the day before</strong>, in the appropriate bin located <strong>to the right of the entrance gate</strong>, across from gate no. 17.",
 faq_waste_note:"We kindly ask you to <strong style=\"color:#c62828;\">SORT WASTE CORRECTLY</strong> to avoid any fines.",

 // FAQ - Piante e Veranda
 faq_plants:"Plant Watering",
 faq_plants_0:"Most plants have an automatic hydroponic system and require no care.",
 faq_plants_1:"Only two large round plants need to be watered at least twice a week during summer.",
 faq_plants_2:"Pour one watering can in the smaller pot and two in the larger one. Green watering can on the veranda.",
 faq_rain:"Rain",
 faq_rain_warn:"Close the veranda windows when you are away or in case of heavy rain/storms. Failure to close them may cause flooding of the veranda.",

 // FAQ - Elettricita
 faq_power:"ON/OFF Electricity",
 faq_power_1:"In case of power outage: go to the ground floor, to the right of the elevator, open the right sliding door of the cabinet, and reset.",
 faq_power_2: 'Meter indicated by the arrow labeled"Russo".',
 faq_veranda_light:"Balcony-Veranda Light",
 faq_veranda_light_desc:"Switches: one in the kitchen next to the fridge, the other in the left bathroom next to the hot water switch.",

 // FAQ - Infissi e Tende
 faq_shutters:"External Shutters",
 faq_shutters_1:"The roller shutters go up/down by pressing the indicated buttons.",
 faq_shutters_2:"Glass door: slides with the handle downward; locks when the handle is pushed upward.",
 faq_curtain:"Blackout Curtain - Small Bedroom",
 faq_curtain_desc:"First bedroom on the left. The blackout curtain is operated with the white remote control.",

 // FAQ - Tasse e Parcheggio
 faq_tax:"Tourist Tax",
 faq_tax_1:"The tourist tax is <strong>\u20AC 1 per day per guest</strong> and applies for a maximum of <strong>5 consecutive days</strong>.",
 faq_tax_2:"Children under <strong>13 years old</strong> are exempt from payment.",
 faq_tax_3:"Before your departure, a <strong>proper receipt</strong> will be issued for the amount paid.",
 faq_tax_4:"We thank you for your cooperation and wish you a pleasant stay in our holiday home. We remain available for any questions or needs.",
 faq_tax_ref:"Regulation: Act No. 62 dated June 26, 2023",
 faq_parking:"Paid Parking",
 faq_parking_1:"Blue-striped spaces require payment via parking meter, accepting coins and contactless payments (VISA, Mastercard, Apple Pay, Google Pay, Samsung Pay). Here are the parking hours:",
 faq_parking_hours_paid:"<strong>Paid:</strong> 8:30 AM - 1:30 PM and 3:30 PM - 8:30 PM every day",
 faq_parking_hours_free:"<strong>Free:</strong> 1:30 PM - 3:30 PM and from 8:30 PM to 8:30 AM the next day",
 faq_parking_2:"To pay, enter your license plate on the display and choose the method: coins in the slot or card/contactless on the blue wave symbol.",

 // FAQ - Auto elettriche e Sicurezza
 faq_ev_charging:"Electric Car Charging",
 faq_ev_charging_desc:"Nearest Enel X charging station, on Via XX Settembre, about 200 meters from the apartment.",
 faq_extinguisher:"Fire Extinguisher",
 faq_extinguisher_loc:"Located on the balcony-veranda.",
 faq_firstaid:"First Aid Kit",
 faq_firstaid_loc:"The cabinet is on the balcony-veranda.",
 faq_devices:"Safety Devices",
 faq_devices_intro:"To ensure maximum safety during your stay, the apartment is equipped with the following devices:",
 faq_devices_smoke:"Smoke detector",
 faq_devices_co:"Carbon monoxide detector",
 faq_devices_gas:"Combustible gas detector",
 faq_devices_valve:"Automatic safety solenoid valve that shuts off the gas supply in case of a leak",
 faq_devices_check:"All devices are regularly inspected.",
 faq_devices_alert:"In case of an audible alarm, please notify us immediately.",
 faq_devices_priority:"Your safety is our priority.",

 // Regole di Convivenza
 faq_cat_rules:"House Rules",
 faq_quiet:"Quiet Hours",
 faq_quiet_intro:"To respect everyone's rest, guests and neighbours, we kindly ask you to keep quiet during the following hours:",
 faq_quiet_night:"Night rest",
 faq_quiet_afternoon:"Afternoon rest",
 faq_quiet_schedule:"Quiet hours",
 faq_quiet_band1:"<strong>22:00 \u2013 8:00</strong> \u2014 Night rest",
 faq_quiet_band2:"<strong>14:00 \u2013 16:00</strong> \u2014 Afternoon rest",
 faq_quiet_legend:"= Quiet time",
 faq_quiet_thanks:"Thank you for your cooperation.",

 // Mappe - Nei Dintorni
 nearby_title:"Maps",
 nearby_subtitle:"Walking routes from Attico Panoramico",
 cat_restaurants:"Restaurants & Bars",
 supermarket:"Conad Supermarket",
 chantilly:"Chantilly - Pastry Bar",
 cat_services:"Services",
 ev_charging:"Electric Car Charging",
 ev_charging_desc:"Enel X Charging Station - Via XX Settembre",
 medical_guard:"Medical Guard",
 open247:"Open 24/7",
 pharmacy:"Nearest Pharmacy",
 pedestrian:"Pedestrian Area",
 cat_beaches:"Beaches & Sea",
 fenice_desc:"Modern beach resort on the western waterfront. Umbrellas, sun loungers, bar and restaurant.",
 ponente_beach:"Ponente Beach",
 croce_beach:"Croce di Mare Beach",
 cat_eolie:"Aeolian Islands",
 eolie_port:"Aeolian Islands Embarkation",
 eolie_depart:"Departures from the port of Milazzo",
 cat_attractions:"Attractions",
 cat_geomaps:"Geographic Maps",
 cat_castle:"Milazzo Castle",
 cat_venus:"Venus Pool",

 // Posizione
 pos_title:"Our Location",
 pos_subtitle:"Here's where to find us in Milazzo",

 // Numeri Utili
 num_title:"Useful Numbers",
 num_subtitle:"Emergency numbers and services in Milazzo",
 num_public:"Public Offices",
 num_municipality:"Municipality of Milazzo",
 num_social:"Social Services",
 num_harbor:"Harbor Authority",
 num_customs:"Customs Agency",
 num_localpolice:"Local Police",
 num_employment:"Employment Office",
 num_health:"Health",
 num_er:"Emergency Room",
 num_medguard:"Medical Guard",
 num_hospital:"Hospital",
 num_cup:"Hospital - Booking",
 num_security:"Security",
 num_carabinieri:"Carabinieri",
 num_police:"Police",
 num_fire:"Fire Department",
 num_finance:"Financial Police",
 num_coastguard:"Coast Guard",
 num_aci:"ACI Roadside Assistance",
 num_highway:"Highway Police",
 num_forest:"Forestry Corps",

 // Calendario
 cal_title:"Availability",
 cal_subtitle:"Check apartment availability",
 cal_available:"Available",
 cal_unavailable:"Not available",
 cal_note:"For bookings and information contact us directly:",

 // Footer
 footer_copy:"\u00A9 Attico Panoramico - Your oasis in Milazzo!"
 },

 de: {
 // Header e Navigazione
 tagline:"Ihre Oase in Milazzo!",
 nav_home:"Startseite",
 nav_faq:"FAQ",
 nav_nearby:"Karten",
 nav_position:"Unsere Lage",
 nav_things:"Aktivit\u00e4ten \u25BE",
 nav_experiences:"Erlebnisse",
 nav_bikes:"Fahrradverleih",
 nav_tarnav:"Mini-Kreuzfahrten - Tarnav",
 nav_navisal:"Mini-Kreuzfahrten - Navisal",
 nav_boat:"Bootstour \u00c4olische Inseln",
 nav_tripadvisor:"Auf Tripadvisor",
 nav_numbers:"N\u00fctzliche Nummern",
 nav_reviews:"Bewertungen",
 nav_availability:"Verf\u00fcgbarkeit",
 nav_vtour:"Virtuelle Burgtour",
 nav_mapsicily:"Sizilien-Karte",
 nav_mapitaly:"Italien-Karte",

 // Home
 welcome_title:"Willkommen in unserem Ferienhaus!",
 welcome_1:"Liebe G\u00e4ste, willkommen in unserem Ferienhaus in Milazzo! Wir sind hier, um Ihnen einen unvergesslichen Aufenthalt zu garantieren und jedes Detail zu pflegen, damit Sie sich wie zu Hause f\u00fchlen.",
 welcome_2:"Das Haus ist darauf ausgelegt, Ihnen Komfort und Entspannung zu bieten, mit einer voll ausgestatteten K\u00fcche, gem\u00fctlichen Wohnbereichen und bequemen Schlafzimmern.",
 welcome_3:"Milazzo erwartet Sie mit seiner Geschichte, Kultur und nat\u00fcrlichen Sch\u00f6nheit. Wir teilen gerne die besten Tipps mit Ihnen, um Ihr Erlebnis noch angenehmer zu gestalten.",
 welcome_4:"Wir stehen Ihnen f\u00fcr jedes Anliegen zur Verf\u00fcgung.",
 welcome_enjoy:"Genie\u00dfen Sie Ihren Aufenthalt!",
 contacts:"Kontakte",

 // FAQ - Categorie
 faq_title:"H\u00e4ufig gestellte Fragen",
 faq_subtitle:"Alles, was Sie f\u00fcr Ihren Aufenthalt wissen m\u00fcssen",
 faq_cat_access:"Check-in & Ankunft",
 faq_cat_climate:"Klima & Komfort",
 faq_cat_kitchen:"K\u00fcche",
 faq_cat_electric:"Strom & Technik",
 faq_cat_cleaning:"Reinigung & Haushalt",
 faq_cat_veranda:"Veranda & Au\u00dfenbereich",
 faq_cat_safety:"Sicherheit",

 // FAQ - WiFi e Contatti
 faq_wifi:"WLAN & Kontakte",
 faq_wifi_net:"WLAN-Netzwerke",
 faq_wifi_pass:"WLAN-Passwort",
 faq_wifi_copy:"Kopieren",
 faq_wifi_copied:"Kopiert!",
 faq_wifi_notebook:"Notebook-Passwort",
 faq_wifi_phone:"Telefon",
 faq_wifi_wa:"WhatsApp",

 // FAQ - Chiavi
 faq_keys:"Schl\u00fcssel",
 faq_keys_1:"Fernbedienung f\u00fcr das Garagentor",
 faq_keys_2:"Schwarz \u2013 Wohnungseingangst\u00fcr",
 faq_keys_3:"Hellblau \u2013 Hauseingangst\u00fcr vorne",
 faq_keys_4:"Blau \u2013 Geb\u00e4udeeingangst\u00fcr",
 faq_keys_5:"Gr\u00fcn \u2013 Garagen-Aufzugt\u00fcr",
 faq_keys_6:"Rot \u2013 Garagen-Kipptor",

 // FAQ - Termostato
 faq_thermo:"Heizungsthermostat",
 faq_thermo_loc:"Standort: rechts neben der K\u00fccheneingangst\u00fcr.",
 faq_thermo_sim:"Interaktiven Simulator \u00f6ffnen",

 // FAQ - Climatizzatori
 faq_ac:"Klimaanlage",
 faq_ac_0:"Liebe G\u00e4ste, wir hoffen, dass Ihr Aufenthalt angenehm und komfortabel ist. Hier sind einige wichtige Empfehlungen zur Nutzung der Klimaanlage:",
 faq_ac_1:"Stellen Sie die Temperatur auf 24\u201326 Grad Celsius ein. Niedrigere Temperaturen sind sch\u00e4dlich f\u00fcr die Gesundheit und den Energieverbrauch.",
 faq_ac_2:"Halten Sie T\u00fcren und Fenster w\u00e4hrend der Nutzung geschlossen. Schalten Sie das Ger\u00e4t aus, wenn Sie abwesend sind.",

 // FAQ - Tecnologia
 faq_usb:"USB-Ladestation",
 faq_usb_desc:"Befindet sich auf dem Wohnzimmerschrank und verf\u00fcgt \u00fcber 6 USB-3.0-Anschl\u00fcsse zum schnellen und gleichzeitigen Laden von 6 Ger\u00e4ten.",
 faq_projector:"Videoprojektor",
 faq_projector_loc:"Schalter: links neben der Wohnzimmert\u00fcr.",
 faq_projector_r1:"<strong>Fernbedienung 1</strong> \u2013 Bildschirmnavigation",
 faq_projector_r2:"<strong>Fernbedienung 2</strong> \u2013 Ein/Aus (rote Taste dr\u00fccken)",

 // FAQ - Cucina
 faq_hotwater:"Wenn kein Warmwasser kommt",
 faq_hotwater_desc:"Schalten Sie einfach den Schalter im linken Badezimmer wieder ein (Warmwasserschalter).",
 faq_stove:"EIN/AUS Herdplatte - Backofen",
 faq_stove_desc:"Der Schalter dient zum Ein- und Ausschalten der Stromversorgung von Backofen und Herdplatte.",
 faq_oven:"Elektrischer Backofen",
 faq_oven_proc:"Vorgehensweise:",
 faq_oven_1:"Dr\u00fccken Sie die EIN-Taste",
 faq_oven_2:"W\u00e4hlen Sie im Programmbereich das gew\u00fcnschte Symbol",
 faq_oven_3:"Stellen Sie die Temperatur im Einstellungsbereich ein",
 faq_oven_4:"\u00dcberpr\u00fcfen Sie, ob die Programmleuchte an ist, dr\u00fccken Sie Start",
 faq_oven_5:"Ende: Wahlschalter auf 0 zur\u00fcckstellen oder EIN dr\u00fccken",
 faq_oven_warn:"<strong>Sicherheit:</strong> Verwenden Sie nur geeignete Bleche, kein Plastik/Papier, der Backofen wird sehr hei\u00df.",
 faq_dishwasher:"Geschirrsp\u00fcler",
 faq_dishwasher_model:"Electrolux ESL5205LO \u2014 Bedienfeld an der Oberkante der T\u00fcr.",
 faq_dishwasher_how:"So starten Sie einen Sp\u00fclgang",
 faq_dishwasher_s1:"\u00d6ffnen Sie die T\u00fcr und beladen Sie das Geschirr",
 faq_dishwasher_s2:"Legen Sie eine Sp\u00fclmaschinentablette in den Spender an der T\u00fcrinnenseite",
 faq_dishwasher_s3:"Schlie\u00dfen Sie die T\u00fcr",
 faq_dishwasher_s4:"Dr\u00fccken Sie die <strong>EIN/AUS</strong>-Taste (links)",
 faq_dishwasher_s5:"Dr\u00fccken Sie die <strong>Programm</strong>-Taste wiederholt, um das Programm zu w\u00e4hlen (die entsprechende Leuchte geht an)",
 faq_dishwasher_s6:"Der Sp\u00fclgang startet automatisch nach wenigen Sekunden",
 faq_dishwasher_prog:"Empfohlene Programme",
 faq_dishwasher_eco:"T\u00e4glicher Gebrauch, Energiesparen",
 faq_dishwasher_normal:"Normale Verschmutzung",
 faq_dishwasher_intensive:"T\u00f6pfe und hartn\u00e4ckiger Schmutz",
 faq_dishwasher_quick:"Schnellw\u00e4sche ~30 Min.",
 faq_dishwasher_rinse:"Nur Sp\u00fclen, ohne Reinigungsmittel",
 faq_dishwasher_tip1:"<strong>Tipp:</strong> F\u00fcr den t\u00e4glichen Gebrauch ist <strong>ECO 50\u00b0</strong> das ideale Programm.",
 faq_dishwasher_tip2:"<strong>Verz\u00f6gerter Start:</strong> Dr\u00fccken Sie <strong>3h Delay</strong>, um den Sp\u00fclgang in 3 Stunden zu starten.",
 faq_dishwasher_reset:"<strong>Zur\u00fccksetzen:</strong> <span style=\"color:#e0e0e0;\">Halten Sie die Programm-Taste 3 Sekunden lang gedr\u00fcckt.</span>",

 // FAQ - Pulizie
 faq_linen:"Reinigung & Bettw\u00e4schewechsel",
 faq_linen_1:"<strong>Saubere Bettw\u00e4sche befindet sich in der mittleren Schublade, mit einem Pfeil markiert.</strong>",
 faq_linen_2:"F\u00fcr Aufenthalte l\u00e4nger als eine Woche:",
 faq_linen_spare:"Ersatzbettw\u00e4sche ist in derselben Schublade verf\u00fcgbar.",
 faq_linen_used:"Gebrauchte Bettw\u00e4sche bitte in einen Beutel legen und bis 8:00 Uhr morgens vor die T\u00fcr stellen, nachdem Sie uns f\u00fcr die Abholung benachrichtigt haben.",
 faq_linen_clean:"Professioneller Reinigungsservice: <strong>\u20AC 60 pro Einsatz</strong>, an einem vereinbarten Tag und Uhrzeit.",
 faq_clothesline:"W\u00e4schest\u00e4nder",

 // FAQ - Rifiuti
 faq_waste:"M\u00fclltrennung & Recycling",
 faq_waste_loc:"Die M\u00fclleimer befinden sich in der Wohnung auf der Veranda.",
 day:"Tag",
 waste_type:"Abfallart",
 monday:"Montag",
 tuesday:"Dienstag",
 wednesday:"Mittwoch",
 thursday:"Donnerstag",
 friday:"Freitag",
 saturday:"Samstag",
 sunday:"Sonntag",
 organic:"Biom\u00fcll",
 unsorted:"Restm\u00fcll",
 paper:"Papier & Karton",
 organic2:"Biom\u00fcll",
 plastic:"Kunststoff & Dosen",
 organic_glass:"Biom\u00fcll & Glas",
 no_collection:"Keine Abholung",
 faq_waste_deposit:"Bitte entsorgen Sie den M\u00fcll <strong>jeden Tag</strong> ab <strong>20:00 Uhr des Vortages</strong> in der entsprechenden Tonne <strong>rechts neben dem Eingangstor</strong>, gegen\u00fcber Tor Nr. 17.",
 faq_waste_note:"Wir bitten Sie, den <strong style=\"color:#c62828;\">M\u00dcLL KORREKT ZU TRENNEN</strong>, um Bu\u00dfgelder zu vermeiden.",

 // FAQ - Piante e Veranda
 faq_plants:"Pflanzenbew\u00e4sserung",
 faq_plants_0:"Die meisten Pflanzen haben ein automatisches Hydroponiksystem und ben\u00f6tigen keine Pflege.",
 faq_plants_1:"Nur zwei gro\u00dfe runde Pflanzen m\u00fcssen im Sommer mindestens zweimal pro Woche gegossen werden.",
 faq_plants_2:"Gie\u00dfen Sie eine Gie\u00dfkanne in den kleineren Topf und zwei in den gr\u00f6\u00dferen. Gr\u00fcne Gie\u00dfkanne auf der Veranda.",
 faq_rain:"Regen",
 faq_rain_warn:"Schlie\u00dfen Sie die Verandafenster, wenn Sie abwesend sind oder bei starkem Regen/Sturm. Wenn sie nicht geschlossen werden, kann die Veranda \u00fcberflutet werden.",

 // FAQ - Elettricita
 faq_power:"EIN/AUS Strom",
 faq_power_1:"Bei Stromausfall: Gehen Sie ins Erdgeschoss, rechts neben dem Aufzug, \u00f6ffnen Sie die rechte Schiebet\u00fcr des Schranks und setzen Sie den Schalter zur\u00fcck.",
 faq_power_2: 'Z\u00e4hler mit dem Pfeil \"Russo\"gekennzeichnet.',
 faq_veranda_light:"Balkon-Veranda-Licht",
 faq_veranda_light_desc:"Schalter: einer in der K\u00fcche neben dem K\u00fchlschrank, der andere im linken Badezimmer neben dem Warmwasserschalter.",

 // FAQ - Infissi e Tende
 faq_shutters:"Au\u00dfenroll\u00e4den",
 faq_shutters_1:"Die Rolll\u00e4den fahren durch Dr\u00fccken der angegebenen Tasten hoch/runter.",
 faq_shutters_2:"Glast\u00fcr: gleitet mit dem Griff nach unten; verriegelt, wenn der Griff nach oben gedr\u00fcckt wird.",
 faq_curtain:"Verdunkelungsvorhang - Kleines Schlafzimmer",
 faq_curtain_desc:"Erstes Schlafzimmer links. Der Verdunkelungsvorhang wird mit der wei\u00dfen Fernbedienung bedient.",

 // FAQ - Tasse e Parcheggio
 faq_tax:"Kurtaxe",
 faq_tax_1:"Die Kurtaxe betr\u00e4gt <strong>\u20AC 1 pro Tag und Gast</strong> und gilt f\u00fcr maximal <strong>5 aufeinanderfolgende Tage</strong>.",
 faq_tax_2:"Kinder unter <strong>13 Jahren</strong> sind von der Zahlung befreit.",
 faq_tax_3:"Vor Ihrer Abreise wird eine <strong>ordnungsgem\u00e4\u00dfe Quittung</strong> \u00fcber den gezahlten Betrag ausgestellt.",
 faq_tax_4:"Wir danken Ihnen f\u00fcr Ihre Mitarbeit und w\u00fcnschen Ihnen einen angenehmen Aufenthalt in unserem Ferienhaus. Wir stehen Ihnen f\u00fcr alle Fragen oder Anliegen zur Verf\u00fcgung.",
 faq_tax_ref:"Verordnung: Beschluss Nr. 62 vom 26. Juni 2023",
 faq_parking:"Kostenpflichtiges Parken",
 faq_parking_1:"Blau markierte Pl\u00e4tze erfordern eine Zahlung am Parkautomaten, der M\u00fcnzen und kontaktloses Bezahlen (VISA, Mastercard, Apple Pay, Google Pay, Samsung Pay) akzeptiert. Hier sind die Parkzeiten:",
 faq_parking_hours_paid:"<strong>Kostenpflichtig:</strong> 8:30 \u2013 13:30 Uhr und 15:30 \u2013 20:30 Uhr t\u00e4glich",
 faq_parking_hours_free:"<strong>Kostenlos:</strong> 13:30 \u2013 15:30 Uhr und von 20:30 bis 8:30 Uhr am n\u00e4chsten Tag",
 faq_parking_2:"Geben Sie zur Bezahlung Ihr Kennzeichen auf dem Display ein und w\u00e4hlen Sie die Zahlungsart: M\u00fcnzen im Schlitz oder Karte/Kontaktlos auf dem blauen Wellensymbol.",

 // FAQ - Auto elettriche e Sicurezza
 faq_ev_charging:"Elektroauto-Ladestation",
 faq_ev_charging_desc:"N\u00e4chste Enel-X-Ladestation in der Via XX Settembre, ca. 200 Meter von der Wohnung entfernt.",
 faq_extinguisher:"Feuerl\u00f6scher",
 faq_extinguisher_loc:"Befindet sich auf dem Balkon/der Veranda.",
 faq_firstaid:"Erste-Hilfe-Kasten",
 faq_firstaid_loc:"Der Schrank befindet sich auf dem Balkon/der Veranda.",
 faq_devices:"Sicherheitsger\u00e4te",
 faq_devices_intro:"Um maximale Sicherheit w\u00e4hrend Ihres Aufenthalts zu gew\u00e4hrleisten, ist die Wohnung mit folgenden Ger\u00e4ten ausgestattet:",
 faq_devices_smoke:"Rauchmelder",
 faq_devices_co:"Kohlenmonoxidmelder",
 faq_devices_gas:"Brenngasmelder",
 faq_devices_valve:"Automatisches Sicherheitsmagnetventil, das die Gasversorgung bei einem Leck absperrt",
 faq_devices_check:"Alle Ger\u00e4te werden regelm\u00e4\u00dfig \u00fcberpr\u00fcft.",
 faq_devices_alert:"Bitte benachrichtigen Sie uns sofort bei einem akustischen Alarm.",
 faq_devices_priority:"Ihre Sicherheit hat f\u00fcr uns h\u00f6chste Priorit\u00e4t.",

 // Regole di Convivenza
 faq_cat_rules:"Hausordnung",
 faq_quiet:"Ruhezeiten",
 faq_quiet_intro:"Zur Einhaltung der Ruhe aller, G\u00e4ste und Nachbarn, bitten wir Sie, w\u00e4hrend der folgenden Zeiten Ruhe zu bewahren:",
 faq_quiet_night:"Nachtruhe",
 faq_quiet_afternoon:"Mittagsruhe",
 faq_quiet_schedule:"Ruhezeiten",
 faq_quiet_band1:"<strong>22:00 \u2013 8:00</strong> \u2014 Nachtruhe",
 faq_quiet_band2:"<strong>14:00 \u2013 16:00</strong> \u2014 Mittagsruhe",
 faq_quiet_legend:"= Ruhezeit",
 faq_quiet_thanks:"Vielen Dank f\u00fcr Ihre Mitarbeit.",

 // Mappe - Nei Dintorni
 nearby_title:"Karten",
 nearby_subtitle:"Fu\u00dfwege vom Attico Panoramico",
 cat_restaurants:"Restaurants & Bars",
 supermarket:"Conad Supermarkt",
 chantilly:"Chantilly - Konditoreicaf\u00e9",
 cat_services:"Dienstleistungen",
 ev_charging:"Elektroauto-Ladestation",
 ev_charging_desc:"Enel X Ladestation - Via XX Settembre",
 medical_guard:"\u00c4rztlicher Bereitschaftsdienst",
 open247:"24/7 ge\u00f6ffnet",
 pharmacy:"N\u00e4chste Apotheke",
 pedestrian:"Fu\u00dfg\u00e4ngerzone",
 cat_beaches:"Str\u00e4nde & Meer",
 fenice_desc:"Modernes Strandbad an der westlichen Uferpromenade. Sonnenschirme, Liegen, Bar und Restaurant.",
 ponente_beach:"Ponente-Strand",
 croce_beach:"Croce di Mare-Strand",
 cat_eolie:"\u00c4olische Inseln",
 eolie_port:"Einschiffung \u00c4olische Inseln",
 eolie_depart:"Abfahrten vom Hafen Milazzo",
 cat_attractions:"Sehensw\u00fcrdigkeiten",
 cat_geomaps:"Geographische Karten",
 cat_castle:"Burg von Milazzo",
 cat_venus:"Venus-Pool",

 // Posizione
 pos_title:"Unsere Lage",
 pos_subtitle:"Hier finden Sie uns in Milazzo",

 // Numeri Utili
 num_title:"N\u00fctzliche Nummern",
 num_subtitle:"Notrufnummern und Dienste in Milazzo",
 num_public:"\u00d6ffentliche \u00c4mter",
 num_municipality:"Gemeinde Milazzo",
 num_social:"Sozialdienste",
 num_harbor:"Hafenbeh\u00f6rde",
 num_customs:"Zollamt",
 num_localpolice:"Gemeindepolizei",
 num_employment:"Arbeitsamt",
 num_health:"Gesundheit",
 num_er:"Notaufnahme",
 num_medguard:"\u00c4rztlicher Bereitschaftsdienst",
 num_hospital:"Krankenhaus",
 num_cup:"Krankenhaus - Terminvergabe",
 num_security:"Sicherheit",
 num_carabinieri:"Carabinieri",
 num_police:"Polizei",
 num_fire:"Feuerwehr",
 num_finance:"Finanzpolizei",
 num_coastguard:"K\u00fcstenwache",
 num_aci:"ACI Pannenhilfe",
 num_highway:"Autobahnpolizei",
 num_forest:"Forstkorps",

 // Calendario
 cal_title:"Verf\u00fcgbarkeit",
 cal_subtitle:"Verf\u00fcgbarkeit der Wohnung pr\u00fcfen",
 cal_available:"Verf\u00fcgbar",
 cal_unavailable:"Nicht verf\u00fcgbar",
 cal_note:"F\u00fcr Buchungen und Informationen kontaktieren Sie uns direkt:",

 // Footer
 footer_copy:"\u00A9 Attico Panoramico - Ihre Oase in Milazzo!"
 },

 fr: {
 // Header e Navigazione
 tagline:"Votre oasis \u00e0 Milazzo !",
 nav_home:"Accueil",
 nav_faq:"FAQ",
 nav_nearby:"Cartes",
 nav_position:"Notre position",
 nav_things:"Activit\u00e9s \u25BE",
 nav_experiences:"Exp\u00e9riences",
 nav_bikes:"Location de v\u00e9los",
 nav_tarnav:"Mini-croisi\u00e8res - Tarnav",
 nav_navisal:"Mini-croisi\u00e8res - Navisal",
 nav_boat:"Tour en bateau des \u00celes \u00c9oliennes",
 nav_tripadvisor:"Sur Tripadvisor",
 nav_numbers:"Num\u00e9ros utiles",
 nav_reviews:"Avis",
 nav_availability:"Disponibilit\u00e9",
 nav_vtour:"Visite virtuelle du ch\u00e2teau",
 nav_mapsicily:"Carte de la Sicile",
 nav_mapitaly:"Carte de l'Italie",

 // Home
 welcome_title:"Bienvenue dans notre maison de vacances !",
 welcome_1:"Chers h\u00f4tes, bienvenue dans notre maison de vacances \u00e0 Milazzo ! Nous sommes l\u00e0 pour vous garantir un s\u00e9jour inoubliable, en soignant chaque d\u00e9tail pour que vous vous sentiez comme chez vous.",
 welcome_2:"La maison est con\u00e7ue pour vous offrir confort et d\u00e9tente, avec une cuisine enti\u00e8rement \u00e9quip\u00e9e, des espaces de vie accueillants et des chambres confortables.",
 welcome_3:"Milazzo vous attend avec son histoire, sa culture et sa beaut\u00e9 naturelle. Nous sommes heureux de partager avec vous les meilleurs conseils pour rendre votre exp\u00e9rience encore plus agr\u00e9able.",
 welcome_4:"Nous restons \u00e0 votre disposition pour tout besoin.",
 welcome_enjoy:"Bon s\u00e9jour !",
 contacts:"Contacts",

 // FAQ - Categorie
 faq_title:"Questions fr\u00e9quentes",
 faq_subtitle:"Tout ce que vous devez savoir pour votre s\u00e9jour",
 faq_cat_access:"Arriv\u00e9e & Check-in",
 faq_cat_climate:"Climat & Confort",
 faq_cat_kitchen:"Cuisine",
 faq_cat_electric:"\u00c9lectricit\u00e9 & Technologie",
 faq_cat_cleaning:"M\u00e9nage & Entretien",
 faq_cat_veranda:"V\u00e9randa & Ext\u00e9rieur",
 faq_cat_safety:"S\u00e9curit\u00e9",

 // FAQ - WiFi e Contatti
 faq_wifi:"WiFi & Contacts",
 faq_wifi_net:"R\u00e9seaux WiFi",
 faq_wifi_pass:"Mot de passe WiFi",
 faq_wifi_copy:"Copier",
 faq_wifi_copied:"Copi\u00e9 !",
 faq_wifi_notebook:"Mot de passe ordinateur",
 faq_wifi_phone:"T\u00e9l\u00e9phone",
 faq_wifi_wa:"WhatsApp",

 // FAQ - Chiavi
 faq_keys:"Cl\u00e9s",
 faq_keys_1:"T\u00e9l\u00e9commande pour le portail du garage",
 faq_keys_2:"Noire \u2013 Porte d'entr\u00e9e de l'appartement",
 faq_keys_3:"Bleu clair \u2013 Porte d'entr\u00e9e principale de la maison",
 faq_keys_4:"Bleue \u2013 Porte d'entr\u00e9e de l'immeuble",
 faq_keys_5:"Verte \u2013 Porte du garage vers l'ascenseur",
 faq_keys_6:"Rouge \u2013 Porte basculante du garage",

 // FAQ - Termostato
 faq_thermo:"Thermostat de chauffage",
 faq_thermo_loc:"Emplacement : \u00e0 droite de la porte d'entr\u00e9e de la cuisine.",
 faq_thermo_sim:"Ouvrir le simulateur interactif",

 // FAQ - Climatizzatori
 faq_ac:"Climatisation",
 faq_ac_0:"Chers h\u00f4tes, nous esp\u00e9rons que votre s\u00e9jour est agr\u00e9able et confortable. Voici quelques recommandations importantes pour l'utilisation de la climatisation :",
 faq_ac_1:"R\u00e9glez la temp\u00e9rature entre 24 et 26 degr\u00e9s Celsius. Des temp\u00e9ratures plus basses nuisent \u00e0 la sant\u00e9 et \u00e0 la consommation d'\u00e9nergie.",
 faq_ac_2:"Gardez les portes et fen\u00eatres ferm\u00e9es pendant l'utilisation. \u00c9teignez lorsque vous \u00eates absent.",

 // FAQ - Tecnologia
 faq_usb:"Station de charge USB",
 faq_usb_desc:"Situ\u00e9e sur le meuble du salon, elle dispose de 6 ports USB 3.0 pour la charge rapide et simultan\u00e9e de 6 appareils.",
 faq_projector:"Vid\u00e9oprojecteur",
 faq_projector_loc:"Interrupteur : \u00e0 gauche de la porte d'entr\u00e9e du salon.",
 faq_projector_r1:"<strong>T\u00e9l\u00e9commande 1</strong> \u2013 navigation \u00e0 l'\u00e9cran",
 faq_projector_r2:"<strong>T\u00e9l\u00e9commande 2</strong> \u2013 marche/arr\u00eat (appuyer sur le bouton rouge)",

 // FAQ - Cucina
 faq_hotwater:"Si l'eau chaude ne fonctionne pas",
 faq_hotwater_desc:"Il suffit de remettre l'interrupteur dans la salle de bain de gauche (interrupteur eau chaude).",
 faq_stove:"ON/OFF Plaque de cuisson - Four",
 faq_stove_desc:"L'interrupteur sert \u00e0 allumer et \u00e9teindre l'alimentation \u00e9lectrique du four et de la plaque de cuisson.",
 faq_oven:"Four \u00e9lectrique",
 faq_oven_proc:"Proc\u00e9dure :",
 faq_oven_1:"Appuyez sur le bouton ON",
 faq_oven_2:"Dans la zone programmes, s\u00e9lectionnez le symbole souhait\u00e9",
 faq_oven_3:"R\u00e9glez la temp\u00e9rature dans la zone de param\u00e8tres",
 faq_oven_4:"V\u00e9rifiez que le voyant du programme est allum\u00e9, appuyez sur Start",
 faq_oven_5:"Fin : remettez le s\u00e9lecteur sur 0 ou appuyez sur ON",
 faq_oven_warn:"<strong>S\u00e9curit\u00e9 :</strong> utilisez uniquement des plateaux adapt\u00e9s, pas de plastique/papier, le four devient tr\u00e8s chaud.",
 faq_dishwasher:"Lave-vaisselle",
 faq_dishwasher_model:"Electrolux ESL5205LO \u2014 panneau de commande sur le bord sup\u00e9rieur de la porte.",
 faq_dishwasher_how:"Comment lancer un cycle de lavage",
 faq_dishwasher_s1:"Ouvrez la porte et chargez la vaisselle",
 faq_dishwasher_s2:"Placez une pastille de d\u00e9tergent dans le distributeur \u00e0 l'int\u00e9rieur de la porte",
 faq_dishwasher_s3:"Fermez la porte",
 faq_dishwasher_s4:"Appuyez sur le bouton <strong>ON/OFF</strong> (\u00e0 gauche)",
 faq_dishwasher_s5:"Appuyez plusieurs fois sur le bouton <strong>Programme</strong> pour s\u00e9lectionner le programme (le voyant correspondant s'allume)",
 faq_dishwasher_s6:"Le cycle de lavage d\u00e9marre automatiquement apr\u00e8s quelques secondes",
 faq_dishwasher_prog:"Programmes recommand\u00e9s",
 faq_dishwasher_eco:"Usage quotidien, \u00e9conomie d'\u00e9nergie",
 faq_dishwasher_normal:"Salissure normale",
 faq_dishwasher_intensive:"Casseroles et salissures tenaces",
 faq_dishwasher_quick:"Lavage rapide ~30 min",
 faq_dishwasher_rinse:"Rin\u00e7age seul, sans d\u00e9tergent",
 faq_dishwasher_tip1:"<strong>Conseil :</strong> pour un usage quotidien, <strong>ECO 50\u00b0</strong> est le programme id\u00e9al.",
 faq_dishwasher_tip2:"<strong>D\u00e9part diff\u00e9r\u00e9 :</strong> appuyez sur <strong>3h Delay</strong> pour lancer le lavage dans 3 heures.",
 faq_dishwasher_reset:"<strong>R\u00e9initialisation :</strong> <span style=\"color:#e0e0e0;\">maintenez le bouton Programme enfonc\u00e9 pendant 3 secondes.</span>",

 // FAQ - Pulizie
 faq_linen:"M\u00e9nage & Changement de linge",
 faq_linen_1:"<strong>Le linge propre se trouve dans le tiroir central, marqu\u00e9 d'une fl\u00e8che.</strong>",
 faq_linen_2:"Pour les s\u00e9jours de plus d'une semaine :",
 faq_linen_spare:"Du linge de rechange est disponible dans le m\u00eame tiroir.",
 faq_linen_used:"Le linge utilis\u00e9 doit \u00eatre plac\u00e9 dans un sac et laiss\u00e9 devant la porte avant 8h00, apr\u00e8s nous avoir pr\u00e9venus pour la collecte.",
 faq_linen_clean:"Service de nettoyage professionnel : <strong>\u20AC 60 par s\u00e9ance</strong>, avec jour et heure convenus.",
 faq_clothesline:"S\u00e9choir \u00e0 linge",

 // FAQ - Rifiuti
 faq_waste:"Tri des d\u00e9chets & Recyclage",
 faq_waste_loc:"Les poubelles se trouvent dans l'appartement sur la v\u00e9randa.",
 day:"Jour",
 waste_type:"Type de d\u00e9chet",
 monday:"Lundi",
 tuesday:"Mardi",
 wednesday:"Mercredi",
 thursday:"Jeudi",
 friday:"Vendredi",
 saturday:"Samedi",
 sunday:"Dimanche",
 organic:"Organique",
 unsorted:"D\u00e9chets r\u00e9siduels",
 paper:"Papier & Carton",
 organic2:"Organique",
 plastic:"Plastique & Conserves",
 organic_glass:"Organique & Verre",
 no_collection:"Pas de collecte",
 faq_waste_deposit:"Veuillez d\u00e9poser les d\u00e9chets <strong>chaque jour</strong> \u00e0 partir de <strong>20h00 la veille</strong>, dans la poubelle appropri\u00e9e situ\u00e9e <strong>\u00e0 droite du portail d'entr\u00e9e</strong>, en face du portail n\u00b0 17.",
 faq_waste_note:"Nous vous prions de <strong style=\"color:#c62828;\">TRIER CORRECTEMENT LES D\u00c9CHETS</strong> afin d'\u00e9viter toute amende.",

 // FAQ - Piante e Veranda
 faq_plants:"Arrosage des plantes",
 faq_plants_0:"La plupart des plantes disposent d'un syst\u00e8me hydroponique automatique et ne n\u00e9cessitent aucun entretien.",
 faq_plants_1:"Seules deux grandes plantes rondes doivent \u00eatre arros\u00e9es au moins deux fois par semaine en \u00e9t\u00e9.",
 faq_plants_2:"Versez un arrosoir dans le petit pot et deux dans le grand. Arrosoir vert sur la v\u00e9randa.",
 faq_rain:"Pluie",
 faq_rain_warn:"Fermez les fen\u00eatres de la v\u00e9randa lorsque vous \u00eates absent ou en cas de forte pluie/temp\u00eate. Ne pas les fermer peut provoquer une inondation de la v\u00e9randa.",

 // FAQ - Elettricita
 faq_power:"ON/OFF \u00c9lectricit\u00e9",
 faq_power_1:"En cas de coupure de courant : descendez au rez-de-chauss\u00e9e, \u00e0 droite de l'ascenseur, ouvrez la porte coulissante droite de l'armoire et r\u00e9enclenchez.",
 faq_power_2: 'Compteur indiqu\u00e9 par la fl\u00e8che \"Russo\".',
 faq_veranda_light:"Lumi\u00e8re balcon-v\u00e9randa",
 faq_veranda_light_desc:"Interrupteurs : un dans la cuisine pr\u00e8s du r\u00e9frig\u00e9rateur, l'autre dans la salle de bain gauche pr\u00e8s de l'interrupteur d'eau chaude.",

 // FAQ - Infissi e Tende
 faq_shutters:"Volets roulants ext\u00e9rieurs",
 faq_shutters_1:"Les volets roulants montent/descendent en appuyant sur les boutons indiqu\u00e9s.",
 faq_shutters_2:"Porte vitr\u00e9e : coulisse avec la poign\u00e9e vers le bas ; se verrouille lorsque la poign\u00e9e est pouss\u00e9e vers le haut.",
 faq_curtain:"Rideau occultant - Petite chambre",
 faq_curtain_desc:"Premi\u00e8re chambre \u00e0 gauche. Le rideau occultant est command\u00e9 par la t\u00e9l\u00e9commande blanche.",

 // FAQ - Tasse e Parcheggio
 faq_tax:"Taxe de s\u00e9jour",
 faq_tax_1:"La taxe de s\u00e9jour est de <strong>\u20AC 1 par jour et par personne</strong> et s'applique pour un maximum de <strong>5 jours cons\u00e9cutifs</strong>.",
 faq_tax_2:"Les enfants de moins de <strong>13 ans</strong> sont exempt\u00e9s du paiement.",
 faq_tax_3:"Avant votre d\u00e9part, un <strong>re\u00e7u en bonne et due forme</strong> sera d\u00e9livr\u00e9 pour le montant pay\u00e9.",
 faq_tax_4:"Nous vous remercions de votre coop\u00e9ration et vous souhaitons un agr\u00e9able s\u00e9jour dans notre maison de vacances. Nous restons \u00e0 votre disposition pour toute question ou besoin.",
 faq_tax_ref:"R\u00e8glement : D\u00e9lib\u00e9ration n\u00b0 62 du 26 juin 2023",
 faq_parking:"Stationnement payant",
 faq_parking_1:"Les places \u00e0 bandes bleues n\u00e9cessitent un paiement \u00e0 l'horodateur, acceptant les pi\u00e8ces et le paiement sans contact (VISA, Mastercard, Apple Pay, Google Pay, Samsung Pay). Voici les horaires de stationnement :",
 faq_parking_hours_paid:"<strong>Payant :</strong> 8h30 - 13h30 et 15h30 - 20h30 chaque jour",
 faq_parking_hours_free:"<strong>Gratuit :</strong> 13h30 - 15h30 et de 20h30 \u00e0 8h30 le lendemain",
 faq_parking_2:"Pour payer, saisissez votre plaque d'immatriculation sur l'\u00e9cran et choisissez le mode : pi\u00e8ces dans la fente ou carte/sans contact sur le symbole bleu.",

 // FAQ - Auto elettriche e Sicurezza
 faq_ev_charging:"Recharge de voiture \u00e9lectrique",
 faq_ev_charging_desc:"Station de recharge Enel X la plus proche, Via XX Settembre, \u00e0 environ 200 m\u00e8tres de l'appartement.",
 faq_extinguisher:"Extincteur",
 faq_extinguisher_loc:"Situ\u00e9 sur le balcon-v\u00e9randa.",
 faq_firstaid:"Trousse de premiers secours",
 faq_firstaid_loc:"L'armoire se trouve sur le balcon-v\u00e9randa.",
 faq_devices:"Dispositifs de s\u00e9curit\u00e9",
 faq_devices_intro:"Pour assurer une s\u00e9curit\u00e9 maximale durant votre s\u00e9jour, l'appartement est \u00e9quip\u00e9 des dispositifs suivants :",
 faq_devices_smoke:"D\u00e9tecteur de fum\u00e9e",
 faq_devices_co:"D\u00e9tecteur de monoxyde de carbone",
 faq_devices_gas:"D\u00e9tecteur de gaz combustible",
 faq_devices_valve:"\u00c9lectrovanne de s\u00e9curit\u00e9 automatique coupant l'alimentation en gaz en cas de fuite",
 faq_devices_check:"Tous les dispositifs sont r\u00e9guli\u00e8rement v\u00e9rifi\u00e9s.",
 faq_devices_alert:"En cas d'alarme sonore, veuillez nous pr\u00e9venir imm\u00e9diatement.",
 faq_devices_priority:"Votre s\u00e9curit\u00e9 est notre priorit\u00e9.",

 // Regole di Convivenza
 faq_cat_rules:"R\u00e8glement int\u00e9rieur",
 faq_quiet:"Heures de silence",
 faq_quiet_intro:"Pour respecter le repos de tous, h\u00f4tes et voisins, nous vous prions de maintenir le calme pendant les horaires suivants :",
 faq_quiet_night:"Repos nocturne",
 faq_quiet_afternoon:"Repos de l'apr\u00e8s-midi",
 faq_quiet_schedule:"Heures de silence",
 faq_quiet_band1:"<strong>22h00 \u2013 8h00</strong> \u2014 Repos nocturne",
 faq_quiet_band2:"<strong>14h00 \u2013 16h00</strong> \u2014 Repos de l'apr\u00e8s-midi",
 faq_quiet_legend:"= Heure de silence",
 faq_quiet_thanks:"Merci de votre coop\u00e9ration.",

 // Mappe - Nei Dintorni
 nearby_title:"Cartes",
 nearby_subtitle:"Itin\u00e9raires \u00e0 pied depuis l'Attico Panoramico",
 cat_restaurants:"Restaurants & Bars",
 supermarket:"Supermarch\u00e9 Conad",
 chantilly:"Chantilly - P\u00e2tisserie Bar",
 cat_services:"Services",
 ev_charging:"Recharge de voiture \u00e9lectrique",
 ev_charging_desc:"Station de recharge Enel X - Via XX Settembre",
 medical_guard:"M\u00e9decin de garde",
 open247:"Ouvert 24h/24",
 pharmacy:"Pharmacie la plus proche",
 pedestrian:"Zone pi\u00e9tonne",
 cat_beaches:"Plages & Mer",
 fenice_desc:"\u00c9tablissement baln\u00e9aire moderne sur le front de mer ouest. Parasols, transats, bar et restaurant.",
 ponente_beach:"Plage de Ponente",
 croce_beach:"Plage de Croce di Mare",
 cat_eolie:"\u00celes \u00c9oliennes",
 eolie_port:"Embarquement \u00celes \u00c9oliennes",
 eolie_depart:"D\u00e9parts du port de Milazzo",
 cat_attractions:"Attractions",
 cat_geomaps:"Cartes g\u00e9ographiques",
 cat_castle:"Ch\u00e2teau de Milazzo",
 cat_venus:"Piscine de V\u00e9nus",

 // Posizione
 pos_title:"Notre position",
 pos_subtitle:"Voici o\u00f9 nous trouver \u00e0 Milazzo",

 // Numeri Utili
 num_title:"Num\u00e9ros utiles",
 num_subtitle:"Num\u00e9ros d'urgence et services \u00e0 Milazzo",
 num_public:"Administrations publiques",
 num_municipality:"Mairie de Milazzo",
 num_social:"Services sociaux",
 num_harbor:"Capitainerie du port",
 num_customs:"Douanes",
 num_localpolice:"Police municipale",
 num_employment:"Bureau de l'emploi",
 num_health:"Sant\u00e9",
 num_er:"Urgences",
 num_medguard:"M\u00e9decin de garde",
 num_hospital:"H\u00f4pital",
 num_cup:"H\u00f4pital - R\u00e9servation",
 num_security:"S\u00e9curit\u00e9",
 num_carabinieri:"Carabiniers",
 num_police:"Police",
 num_fire:"Pompiers",
 num_finance:"Police financi\u00e8re",
 num_coastguard:"Garde c\u00f4ti\u00e8re",
 num_aci:"ACI Assistance routi\u00e8re",
 num_highway:"Police autorouti\u00e8re",
 num_forest:"Corps forestier",

 // Calendario
 cal_title:"Disponibilit\u00e9",
 cal_subtitle:"V\u00e9rifier la disponibilit\u00e9 de l'appartement",
 cal_available:"Disponible",
 cal_unavailable:"Non disponible",
 cal_note:"Pour les r\u00e9servations et informations, contactez-nous directement :",

 // Footer
 footer_copy:"\u00A9 Attico Panoramico - Votre oasis \u00e0 Milazzo !"
 },

 es: {
 // Header e Navigazione
 tagline:"\u00a1Tu oasis en Milazzo!",
 nav_home:"Inicio",
 nav_faq:"FAQ",
 nav_nearby:"Mapas",
 nav_position:"Nuestra ubicaci\u00f3n",
 nav_things:"Qu\u00e9 hacer \u25BE",
 nav_experiences:"Experiencias",
 nav_bikes:"Alquiler de bicicletas",
 nav_tarnav:"Minicruceros - Tarnav",
 nav_navisal:"Minicruceros - Navisal",
 nav_boat:"Tour en barco Islas Eolias",
 nav_tripadvisor:"En Tripadvisor",
 nav_numbers:"N\u00fameros \u00fatiles",
 nav_reviews:"Rese\u00f1as",
 nav_availability:"Disponibilidad",
 nav_vtour:"Tour virtual del castillo",
 nav_mapsicily:"Mapa de Sicilia",
 nav_mapitaly:"Mapa de Italia",

 // Home
 welcome_title:"\u00a1Bienvenidos a nuestra casa de vacaciones!",
 welcome_1:"Queridos hu\u00e9spedes, \u00a1bienvenidos a nuestra casa de vacaciones en Milazzo! Estamos aqu\u00ed para garantizarles una estancia inolvidable, cuidando cada detalle para que se sientan como en casa.",
 welcome_2:"La casa est\u00e1 dise\u00f1ada para ofrecerles comodidad y relax, con una cocina totalmente equipada, espacios acogedores y dormitorios confortables.",
 welcome_3:"Milazzo les espera con su historia, cultura y belleza natural. Estamos encantados de compartir con ustedes los mejores consejos para hacer su experiencia a\u00fan m\u00e1s agradable.",
 welcome_4:"Quedamos a su disposici\u00f3n para cualquier necesidad.",
 welcome_enjoy:"\u00a1Disfruten de su estancia!",
 contacts:"Contactos",

 // FAQ - Categorie
 faq_title:"Preguntas frecuentes",
 faq_subtitle:"Todo lo que necesita saber para su estancia",
 faq_cat_access:"Check-in y llegada",
 faq_cat_climate:"Clima y confort",
 faq_cat_kitchen:"Cocina",
 faq_cat_electric:"Electricidad y tecnolog\u00eda",
 faq_cat_cleaning:"Limpieza y mantenimiento",
 faq_cat_veranda:"Terraza y exteriores",
 faq_cat_safety:"Seguridad",

 // FAQ - WiFi e Contatti
 faq_wifi:"WiFi y contactos",
 faq_wifi_net:"Redes WiFi",
 faq_wifi_pass:"Contrase\u00f1a WiFi",
 faq_wifi_copy:"Copiar",
 faq_wifi_copied:"\u00a1Copiado!",
 faq_wifi_notebook:"Contrase\u00f1a del port\u00e1til",
 faq_wifi_phone:"Tel\u00e9fono",
 faq_wifi_wa:"WhatsApp",

 // FAQ - Chiavi
 faq_keys:"Llaves",
 faq_keys_1:"Mando a distancia para la puerta del garaje",
 faq_keys_2:"Negra \u2013 Puerta de entrada del apartamento",
 faq_keys_3:"Azul claro \u2013 Puerta principal de entrada de la casa",
 faq_keys_4:"Azul \u2013 Puerta de entrada del edificio",
 faq_keys_5:"Verde \u2013 Puerta del garaje al ascensor",
 faq_keys_6:"Roja \u2013 Puerta basculante del garaje",

 // FAQ - Termostato
 faq_thermo:"Termostato de calefacci\u00f3n",
 faq_thermo_loc:"Ubicaci\u00f3n: a la derecha de la puerta de entrada de la cocina.",
 faq_thermo_sim:"Abrir simulador interactivo",

 // FAQ - Climatizzatori
 faq_ac:"Aire acondicionado",
 faq_ac_0:"Queridos hu\u00e9spedes, esperamos que su estancia sea agradable y confortable. Aqu\u00ed tienen algunas recomendaciones importantes para el uso del aire acondicionado:",
 faq_ac_1:"Ajusten la temperatura entre 24 y 26 grados Celsius. Temperaturas m\u00e1s bajas son perjudiciales para la salud y el consumo energ\u00e9tico.",
 faq_ac_2:"Mantengan puertas y ventanas cerradas durante el uso. Apaguen el equipo cuando se ausenten.",

 // FAQ - Tecnologia
 faq_usb:"Estaci\u00f3n de carga USB",
 faq_usb_desc:"Ubicada en el mueble del sal\u00f3n, cuenta con 6 puertos USB 3.0 para la carga r\u00e1pida y simult\u00e1nea de 6 dispositivos.",
 faq_projector:"Videoproyector",
 faq_projector_loc:"Interruptor: a la izquierda de la puerta de entrada del sal\u00f3n.",
 faq_projector_r1:"<strong>Mando 1</strong> \u2013 navegaci\u00f3n en pantalla",
 faq_projector_r2:"<strong>Mando 2</strong> \u2013 encendido/apagado (pulse el bot\u00f3n rojo)",

 // FAQ - Cucina
 faq_hotwater:"Si el agua caliente no funciona",
 faq_hotwater_desc:"Simplemente vuelva a encender el interruptor en el ba\u00f1o izquierdo (interruptor de agua caliente).",
 faq_stove:"ON/OFF Placa de cocci\u00f3n - Horno",
 faq_stove_desc:"El interruptor sirve para encender y apagar la alimentaci\u00f3n el\u00e9ctrica del horno y la placa de cocci\u00f3n.",
 faq_oven:"Horno el\u00e9ctrico",
 faq_oven_proc:"Procedimiento:",
 faq_oven_1:"Pulse el bot\u00f3n ON",
 faq_oven_2:"En la zona de programas, seleccione el s\u00edmbolo deseado",
 faq_oven_3:"Ajuste la temperatura en la zona de configuraci\u00f3n",
 faq_oven_4:"Verifique que la luz del programa est\u00e9 encendida, pulse Start",
 faq_oven_5:"Fin: devuelva el selector a 0 o pulse ON",
 faq_oven_warn:"<strong>Seguridad:</strong> use solo bandejas adecuadas, no pl\u00e1stico/papel, el horno se calienta mucho.",
 faq_dishwasher:"Lavavajillas",
 faq_dishwasher_model:"Electrolux ESL5205LO \u2014 panel de control en el borde superior de la puerta.",
 faq_dishwasher_how:"C\u00f3mo iniciar un ciclo de lavado",
 faq_dishwasher_s1:"Abra la puerta y cargue la vajilla",
 faq_dishwasher_s2:"Coloque una pastilla de detergente en el dispensador del interior de la puerta",
 faq_dishwasher_s3:"Cierre la puerta",
 faq_dishwasher_s4:"Pulse el bot\u00f3n <strong>ON/OFF</strong> (a la izquierda)",
 faq_dishwasher_s5:"Pulse repetidamente el bot\u00f3n <strong>Programa</strong> para seleccionar el programa (se enciende el indicador correspondiente)",
 faq_dishwasher_s6:"El ciclo de lavado se inicia autom\u00e1ticamente tras unos segundos",
 faq_dishwasher_prog:"Programas recomendados",
 faq_dishwasher_eco:"Uso diario, ahorro energ\u00e9tico",
 faq_dishwasher_normal:"Suciedad normal",
 faq_dishwasher_intensive:"Ollas y suciedad persistente",
 faq_dishwasher_quick:"Lavado r\u00e1pido ~30 min",
 faq_dishwasher_rinse:"Solo aclarado, sin detergente",
 faq_dishwasher_tip1:"<strong>Consejo:</strong> para el uso diario, <strong>ECO 50\u00b0</strong> es el programa ideal.",
 faq_dishwasher_tip2:"<strong>Inicio diferido:</strong> pulse <strong>3h Delay</strong> para iniciar el lavado en 3 horas.",
 faq_dishwasher_reset:"<strong>Reinicio:</strong> <span style=\"color:#e0e0e0;\">mantenga pulsado el bot\u00f3n Programa durante 3 segundos.</span>",

 // FAQ - Pulizie
 faq_linen:"Limpieza y cambio de ropa de cama",
 faq_linen_1:"<strong>La ropa de cama limpia est\u00e1 en el caj\u00f3n central, marcado con una flecha.</strong>",
 faq_linen_2:"Para estancias de m\u00e1s de una semana:",
 faq_linen_spare:"Hay ropa de cama de repuesto disponible en el mismo caj\u00f3n.",
 faq_linen_used:"La ropa de cama usada debe colocarse en una bolsa y dejarse fuera de la puerta antes de las 8:00, tras avisarnos para la recogida.",
 faq_linen_clean:"Servicio de limpieza profesional: <strong>\u20AC 60 por sesi\u00f3n</strong>, en d\u00eda y hora acordados.",
 faq_clothesline:"Tendedero",

 // FAQ - Rifiuti
 faq_waste:"Separaci\u00f3n de residuos y reciclaje",
 faq_waste_loc:"Los cubos est\u00e1n dentro del apartamento en la terraza.",
 day:"D\u00eda",
 waste_type:"Tipo de residuo",
 monday:"Lunes",
 tuesday:"Martes",
 wednesday:"Mi\u00e9rcoles",
 thursday:"Jueves",
 friday:"Viernes",
 saturday:"S\u00e1bado",
 sunday:"Domingo",
 organic:"Org\u00e1nico",
 unsorted:"Residuos no separados",
 paper:"Papel y cart\u00f3n",
 organic2:"Org\u00e1nico",
 plastic:"Pl\u00e1stico y latas",
 organic_glass:"Org\u00e1nico y vidrio",
 no_collection:"Sin recogida",
 faq_waste_deposit:"Por favor, deposite los residuos <strong>todos los d\u00edas</strong> a partir de las <strong>20:00 del d\u00eda anterior</strong>, en el contenedor correspondiente situado <strong>a la derecha de la puerta de entrada</strong>, frente al portal n.\u00ba 17.",
 faq_waste_note:"Les rogamos que <strong style=\"color:#c62828;\">SEPAREN CORRECTAMENTE LOS RESIDUOS</strong> para evitar multas.",

 // FAQ - Piante e Veranda
 faq_plants:"Riego de plantas",
 faq_plants_0:"La mayor\u00eda de las plantas tienen un sistema hidrop\u00f3nico autom\u00e1tico y no necesitan cuidados.",
 faq_plants_1:"Solo dos plantas grandes y redondas necesitan regarse al menos dos veces por semana en verano.",
 faq_plants_2:"Vierta una regadera en la maceta peque\u00f1a y dos en la grande. Regadera verde en la terraza.",
 faq_rain:"Lluvia",
 faq_rain_warn:"Cierre las ventanas de la terraza cuando se ausente o en caso de lluvia intensa/tormenta. No cerrarlas puede provocar la inundaci\u00f3n de la terraza.",

 // FAQ - Elettricita
 faq_power:"ON/OFF Electricidad",
 faq_power_1:"En caso de corte de luz: baje a la planta baja, a la derecha del ascensor, abra la puerta corredera derecha del armario y restablezca el interruptor.",
 faq_power_2: 'Contador indicado con la flecha \"Russo\".',
 faq_veranda_light:"Luz del balc\u00f3n-terraza",
 faq_veranda_light_desc:"Interruptores: uno en la cocina junto al frigor\u00edfico, otro en el ba\u00f1o izquierdo junto al interruptor de agua caliente.",

 // FAQ - Infissi e Tende
 faq_shutters:"Persianas exteriores",
 faq_shutters_1:"Las persianas enrollables suben/bajan pulsando los botones indicados.",
 faq_shutters_2:"Puerta de cristal: se desliza con el tirador hacia abajo; se bloquea cuando el tirador se empuja hacia arriba.",
 faq_curtain:"Cortina opaca - Dormitorio peque\u00f1o",
 faq_curtain_desc:"Primer dormitorio a la izquierda. La cortina opaca se acciona con el mando a distancia blanco.",

 // FAQ - Tasse e Parcheggio
 faq_tax:"Tasa tur\u00edstica",
 faq_tax_1:"La tasa tur\u00edstica es de <strong>\u20AC 1 por d\u00eda y por hu\u00e9sped</strong> y se aplica durante un m\u00e1ximo de <strong>5 d\u00edas consecutivos</strong>.",
 faq_tax_2:"Los ni\u00f1os menores de <strong>13 a\u00f1os</strong> est\u00e1n exentos del pago.",
 faq_tax_3:"Antes de su partida, se emitir\u00e1 un <strong>recibo adecuado</strong> por el importe pagado.",
 faq_tax_4:"Les agradecemos su colaboraci\u00f3n y les deseamos una agradable estancia en nuestra casa de vacaciones. Quedamos a su disposici\u00f3n para cualquier consulta o necesidad.",
 faq_tax_ref:"Normativa: Acta N.\u00ba 62 de 26 de junio de 2023",
 faq_parking:"Aparcamiento de pago",
 faq_parking_1:"Las plazas con franjas azules requieren pago en el parqu\u00edmetro, que acepta monedas y pago sin contacto (VISA, Mastercard, Apple Pay, Google Pay, Samsung Pay). Estos son los horarios de aparcamiento:",
 faq_parking_hours_paid:"<strong>De pago:</strong> 8:30 - 13:30 y 15:30 - 20:30 todos los d\u00edas",
 faq_parking_hours_free:"<strong>Gratuito:</strong> 13:30 - 15:30 y de 20:30 a 8:30 del d\u00eda siguiente",
 faq_parking_2:"Para pagar, introduzca su matr\u00edcula en la pantalla y elija el m\u00e9todo: monedas en la ranura o tarjeta/contactless en el s\u00edmbolo azul.",

 // FAQ - Auto elettriche e Sicurezza
 faq_ev_charging:"Carga de coche el\u00e9ctrico",
 faq_ev_charging_desc:"Estaci\u00f3n de carga Enel X m\u00e1s cercana, en Via XX Settembre, a unos 200 metros del apartamento.",
 faq_extinguisher:"Extintor",
 faq_extinguisher_loc:"Ubicado en el balc\u00f3n-terraza.",
 faq_firstaid:"Botiqu\u00edn de primeros auxilios",
 faq_firstaid_loc:"El armario est\u00e1 en el balc\u00f3n-terraza.",
 faq_devices:"Dispositivos de seguridad",
 faq_devices_intro:"Para garantizar la m\u00e1xima seguridad durante su estancia, el apartamento est\u00e1 equipado con los siguientes dispositivos:",
 faq_devices_smoke:"Detector de humo",
 faq_devices_co:"Detector de mon\u00f3xido de carbono",
 faq_devices_gas:"Detector de gas combustible",
 faq_devices_valve:"Electrov\u00e1lvula de seguridad autom\u00e1tica que corta el suministro de gas en caso de fuga",
 faq_devices_check:"Todos los dispositivos se revisan peri\u00f3dicamente.",
 faq_devices_alert:"En caso de alarma sonora, notif\u00edquenos de inmediato.",
 faq_devices_priority:"Su seguridad es nuestra prioridad.",

 // Regole di Convivenza
 faq_cat_rules:"Normas de convivencia",
 faq_quiet:"Horario de silencio",
 faq_quiet_intro:"Para respetar el descanso de todos, hu\u00e9spedes y vecinos, les rogamos mantener el silencio durante los siguientes horarios:",
 faq_quiet_night:"Descanso nocturno",
 faq_quiet_afternoon:"Descanso de la tarde",
 faq_quiet_schedule:"Horario de silencio",
 faq_quiet_band1:"<strong>22:00 \u2013 8:00</strong> \u2014 Descanso nocturno",
 faq_quiet_band2:"<strong>14:00 \u2013 16:00</strong> \u2014 Descanso de la tarde",
 faq_quiet_legend:"= Horario de silencio",
 faq_quiet_thanks:"Gracias por su colaboraci\u00f3n.",

 // Mappe - Nei Dintorni
 nearby_title:"Mapas",
 nearby_subtitle:"Rutas a pie desde el Attico Panoramico",
 cat_restaurants:"Restaurantes y bares",
 supermarket:"Supermercado Conad",
 chantilly:"Chantilly - Pasteler\u00eda Bar",
 cat_services:"Servicios",
 ev_charging:"Carga de coche el\u00e9ctrico",
 ev_charging_desc:"Estaci\u00f3n de carga Enel X - Via XX Settembre",
 medical_guard:"M\u00e9dico de guardia",
 open247:"Abierto 24/7",
 pharmacy:"Farmacia m\u00e1s cercana",
 pedestrian:"Zona peatonal",
 cat_beaches:"Playas y mar",
 fenice_desc:"Establecimiento balneario moderno en el paseo mar\u00edtimo occidental. Sombrillas, tumbonas, bar y restaurante.",
 ponente_beach:"Playa de Ponente",
 croce_beach:"Playa de Croce di Mare",
 cat_eolie:"Islas Eolias",
 eolie_port:"Embarque Islas Eolias",
 eolie_depart:"Salidas desde el puerto de Milazzo",
 cat_attractions:"Atracciones",
 cat_geomaps:"Mapas geogr\u00e1ficos",
 cat_castle:"Castillo de Milazzo",
 cat_venus:"Piscina de Venus",

 // Posizione
 pos_title:"Nuestra ubicaci\u00f3n",
 pos_subtitle:"Aqu\u00ed nos encuentra en Milazzo",

 // Numeri Utili
 num_title:"N\u00fameros \u00fatiles",
 num_subtitle:"N\u00fameros de emergencia y servicios en Milazzo",
 num_public:"Oficinas p\u00fablicas",
 num_municipality:"Ayuntamiento de Milazzo",
 num_social:"Servicios sociales",
 num_harbor:"Capitan\u00eda del puerto",
 num_customs:"Agencia de aduanas",
 num_localpolice:"Polic\u00eda local",
 num_employment:"Oficina de empleo",
 num_health:"Salud",
 num_er:"Urgencias",
 num_medguard:"M\u00e9dico de guardia",
 num_hospital:"Hospital",
 num_cup:"Hospital - Citas",
 num_security:"Seguridad",
 num_carabinieri:"Carabineros",
 num_police:"Polic\u00eda",
 num_fire:"Bomberos",
 num_finance:"Polic\u00eda financiera",
 num_coastguard:"Guardia costera",
 num_aci:"ACI Asistencia en carretera",
 num_highway:"Polic\u00eda de autopista",
 num_forest:"Cuerpo forestal",

 // Calendario
 cal_title:"Disponibilidad",
 cal_subtitle:"Consultar la disponibilidad del apartamento",
 cal_available:"Disponible",
 cal_unavailable:"No disponible",
 cal_note:"Para reservas e informaci\u00f3n, cont\u00e1ctenos directamente:",

 // Footer
 footer_copy:"\u00A9 Attico Panoramico - \u00a1Tu oasis en Milazzo!"
 }
};

// Memorizza i testi italiani originali per poterli ripristinare
var testiItaliani = {};

/** Salva tutti i testi italiani originali dagli elementi con data-i18n */
function salvaTestiItaliani() {
 document.querySelectorAll('[data-i18n]').forEach(function(elemento) {
 var chiave = elemento.getAttribute('data-i18n');
 testiItaliani[chiave] = elemento.innerHTML;
 });
}

/** Applica la lingua specificata a tutti gli elementi con data-i18n */
function applicaLingua(lingua) {
 document.querySelectorAll('[data-i18n]').forEach(function(elemento) {
 var chiave = elemento.getAttribute('data-i18n');
 if (lingua === 'it') {
 if (testiItaliani[chiave]) elemento.innerHTML = testiItaliani[chiave];
 } else if (traduzioni[lingua] && traduzioni[lingua][chiave]) {
 elemento.innerHTML = traduzioni[lingua][chiave];
 }
 });
 document.documentElement.lang = lingua;
}

var bandiere = {
 it: '',
 en: '',
 de: '',
 fr: '',
 es: ''
};

/** Aggiorna il pulsante e il menu dropdown */
function aggiornaDropdown() {
 if (!dom.langFlag) return;
 dom.langFlag.textContent = bandiere[linguaCorrente];
 dom.langLabel.textContent = linguaCorrente.toUpperCase();
 document.querySelectorAll('.lang-option').forEach(function(opt) {
 opt.classList.toggle('active', opt.getAttribute('data-lang') === linguaCorrente);
 });
}

/** Seleziona una lingua dal dropdown */
function selezionaLingua(lingua) {
 if (linguaCorrente === lingua) return;
 linguaCorrente = lingua;
 applicaLingua(lingua);
 aggiornaDropdown();
 chiudiDropdownLingua();
}

/** Apre/chiude il dropdown */
function toggleDropdownLingua() {
 var aperto = dom.langDropdown.classList.toggle('open');
 dom.langToggle.setAttribute('aria-expanded', String(aperto));
}

/** Chiude il dropdown */
function chiudiDropdownLingua() {
 if (dom.langDropdown) {
 dom.langDropdown.classList.remove('open');
 dom.langToggle.setAttribute('aria-expanded', 'false');
 }
}

/* =============================================================================
 7. INIZIALIZZAZIONE
 Avvia tutti i moduli e collega gli eventi quando il DOM e' pronto.
 ============================================================================= */
document.addEventListener('DOMContentLoaded', function() {
 cacheDom();
 caricaDaHash();
 salvaTestiItaliani();
 inizializzaAccordion();

 // --- Delegazione eventi navigazione SPA ---
 // Intercetta click sui link interni del menu (#sezione)
 dom.navList.addEventListener('click', function(e) {
 var link = e.target.closest('a[href^="#"]');
 if (!link) return;
 // Ignora il trigger del sottomenu"Cose da Fare"
 if (link.closest('.has-submenu') && link.parentElement.classList.contains('has-submenu')) {
 toggleSubmenu(e);
 return;
 }
 e.preventDefault();
 var pagina = link.getAttribute('href').replace('#', '');
 if (pagina && document.getElementById('page-' + pagina)) {
 navigateTo(pagina);
 }
 });

 // Logo -> torna alla home
 dom.logo.addEventListener('click', function(e) {
 e.preventDefault();
 navigateTo('home');
 });

 // --- Delegazione eventi FAQ ---
 // Click sull'header di una FAQ card per aprirla/chiuderla
 if (dom.faqGrid) {
 dom.faqGrid.addEventListener('click', function(e) {
 var header = e.target.closest('.faq-header');
 if (!header) return;
 var card = header.closest('.faq-card');
 if (card) toggleFaq(card);
 });
 }

 // --- Menu mobile ---
 document.getElementById('menuToggle').addEventListener('click', toggleMenu);

 // --- Dropdown lingua ---
 dom.langToggle.addEventListener('click', function(e) {
 e.stopPropagation();
 toggleDropdownLingua();
 });
 document.querySelectorAll('.lang-option').forEach(function(opt) {
 opt.addEventListener('click', function(e) {
 e.stopPropagation();
 selezionaLingua(opt.getAttribute('data-lang'));
 });
 });
 document.addEventListener('click', function(e) {
 if (!e.target.closest('.lang-dropdown')) chiudiDropdownLingua();
 });

 // --- Pulsante torna in alto ---
 if (dom.backToTop) {
 dom.backToTop.addEventListener('click', function() {
 window.scrollTo({ top: 0, behavior: 'smooth' });
 });
 }

 // --- Link termostato: aggiorna URL con la lingua corrente ---
 var linkTermostato = document.querySelector('a[href="termostato.html"]');
 if (linkTermostato) {
 linkTermostato.addEventListener('click', function() {
 this.href = 'termostato.html?lang=' + linguaCorrente;
 });
 }
});

})();
