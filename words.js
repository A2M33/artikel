/*
 * Word list for artikel.
 *
 * One noun per line:  article | noun | plural | English | Persian
 * Plural is written without its article. "–" means the noun is (almost)
 * never used in the plural.
 *
 * Rules for adding a word:
 *  - Standard German gender only (Duden). Leave out nouns that have two
 *    genders or change meaning with the article (der/die See, der/das Teil,
 *    das/der Band, die/der Leiter, ...). tests/words.test.mjs keeps a list.
 *  - Leave out nouns that are normally plural-only (Eltern, Leute, Ferien).
 *  - Leave out adjectival nouns (der/die Deutsche, der/die Vorgesetzte).
 *
 * Plain script on purpose: ES modules do not load from file://, and the
 * site has to work when index.html is opened straight from disk.
 */
(function (root) {
  "use strict";

  var A1 = `
der|Tisch|Tische|table|میز
der|Stuhl|Stühle|chair|صندلی
das|Bett|Betten|bed|تخت‌خواب
der|Schrank|Schränke|cupboard, wardrobe|کمد
das|Sofa|Sofas|sofa|کاناپه
der|Sessel|Sessel|armchair|مبل تک‌نفره
die|Lampe|Lampen|lamp|چراغ
das|Fenster|Fenster|window|پنجره
die|Tür|Türen|door|در
die|Wand|Wände|wall|دیوار
der|Boden|Böden|floor, ground|کف؛ زمین
das|Haus|Häuser|house|خانه
die|Wohnung|Wohnungen|flat, apartment|آپارتمان
das|Zimmer|Zimmer|room|اتاق
die|Küche|Küchen|kitchen|آشپزخانه
das|Bad|Bäder|bathroom|حمام
das|Schlafzimmer|Schlafzimmer|bedroom|اتاق خواب
das|Wohnzimmer|Wohnzimmer|living room|اتاق نشیمن
der|Garten|Gärten|garden|باغچه
der|Balkon|Balkone|balcony|بالکن
die|Treppe|Treppen|stairs|راه‌پله
der|Schlüssel|Schlüssel|key|کلید
das|Dach|Dächer|roof|بام
die|Miete|Mieten|rent|اجاره
der|Kühlschrank|Kühlschränke|fridge|یخچال
der|Herd|Herde|cooker, stove|اجاق گاز
die|Dusche|Duschen|shower|دوش
die|Toilette|Toiletten|toilet|توالت
der|Spiegel|Spiegel|mirror|آینه
das|Regal|Regale|shelf|قفسه
der|Teppich|Teppiche|carpet, rug|فرش
die|Uhr|Uhren|clock, watch|ساعت
das|Bild|Bilder|picture|تصویر
das|Buch|Bücher|book|کتاب
das|Heft|Hefte|exercise book|دفتر
der|Kuli|Kulis|ballpoint pen|خودکار
der|Bleistift|Bleistifte|pencil|مداد
das|Papier|Papiere|paper|کاغذ
die|Tasche|Taschen|bag; pocket|کیف؛ جیب
der|Computer|Computer|computer|کامپیوتر
das|Handy|Handys|mobile phone|گوشی موبایل
das|Telefon|Telefone|telephone|تلفن
der|Fernseher|Fernseher|television set|تلویزیون
die|Zeitung|Zeitungen|newspaper|روزنامه
der|Brief|Briefe|letter|نامه
die|Postkarte|Postkarten|postcard|کارت پستال
die|Karte|Karten|card; map; ticket|کارت؛ نقشه؛ بلیت
das|Foto|Fotos|photo|عکس
die|Brille|Brillen|glasses|عینک
der|Kalender|Kalender|calendar|تقویم
die|Kamera|Kameras|camera|دوربین
das|Licht|Lichter|light|نور
die|Heizung|Heizungen|heating|سیستم گرمایش
die|Liste|Listen|list|فهرست
der|Zettel|Zettel|slip of paper, note|برگهٔ یادداشت
die|Tafel|Tafeln|board (in class)|تخته
der|Mann|Männer|man|مرد
die|Frau|Frauen|woman; Mrs|زن؛ خانم
das|Kind|Kinder|child|بچه
das|Baby|Babys|baby|نوزاد
das|Mädchen|Mädchen|girl|دختر
der|Vater|Väter|father|پدر
die|Mutter|Mütter|mother|مادر
der|Bruder|Brüder|brother|برادر
die|Schwester|Schwestern|sister|خواهر
der|Sohn|Söhne|son|پسر
die|Tochter|Töchter|daughter|دختر (فرزند)
die|Oma|Omas|grandma|مادربزرگ
der|Opa|Opas|grandpa|پدربزرگ
die|Familie|Familien|family|خانواده
der|Freund|Freunde|friend; boyfriend|دوست؛ دوست‌پسر
die|Freundin|Freundinnen|friend (female); girlfriend|دوست (زن)؛ دوست‌دختر
der|Nachbar|Nachbarn|neighbour|همسایه
der|Mensch|Menschen|human being|انسان
die|Person|Personen|person|شخص
der|Herr|Herren|gentleman; Mr|آقا
die|Dame|Damen|lady|خانم
der|Gast|Gäste|guest|مهمان
der|Name|Namen|name|نام
der|Vorname|Vornamen|first name|نام کوچک
der|Nachname|Nachnamen|surname|نام خانوادگی
das|Alter|–|age|سن
die|Adresse|Adressen|address|نشانی
die|Straße|Straßen|street|خیابان
die|Hausnummer|Hausnummern|house number|پلاک
die|Postleitzahl|Postleitzahlen|postcode|کد پستی
die|Telefonnummer|Telefonnummern|phone number|شماره تلفن
der|Wohnort|Wohnorte|place of residence|محل سکونت
der|Geburtsort|Geburtsorte|place of birth|محل تولد
das|Geburtsdatum|Geburtsdaten|date of birth|تاریخ تولد
der|Familienstand|–|marital status|وضعیت تأهل
die|Stadt|Städte|town, city|شهر
das|Dorf|Dörfer|village|روستا
das|Land|Länder|country; countryside|کشور؛ روستا و حومه
die|Sprache|Sprachen|language|زبان
der|Beruf|Berufe|profession|حرفه
die|Arbeit|Arbeiten|work|کار
der|Job|Jobs|job|شغل
die|Firma|Firmen|company|شرکت
das|Büro|Büros|office|دفتر کار
der|Chef|Chefs|boss|رئیس
der|Kollege|Kollegen|colleague|همکار
die|Kollegin|Kolleginnen|colleague (female)|همکار (زن)
die|Pause|Pausen|break|استراحت؛ زنگ تفریح
der|Lehrer|Lehrer|teacher|معلم
die|Lehrerin|Lehrerinnen|teacher (female)|معلم (زن)
der|Arzt|Ärzte|doctor|پزشک
die|Ärztin|Ärztinnen|doctor (female)|پزشک (زن)
der|Schüler|Schüler|pupil|دانش‌آموز
der|Student|Studenten|student|دانشجو
der|Kellner|Kellner|waiter|پیشخدمت
der|Koch|Köche|cook, chef|آشپز
der|Verkäufer|Verkäufer|shop assistant|فروشنده
der|Bäcker|Bäcker|baker|نانوا
der|Fahrer|Fahrer|driver|راننده
die|Krankenschwester|Krankenschwestern|nurse|پرستار
der|Polizist|Polizisten|police officer|مأمور پلیس
die|Polizei|–|police|پلیس
die|Schule|Schulen|school|مدرسه
der|Kurs|Kurse|course|دوره؛ کلاس
die|Klasse|Klassen|class|کلاس
die|Lektion|Lektionen|lesson, unit|درس
die|Frage|Fragen|question|پرسش
die|Antwort|Antworten|answer|پاسخ
das|Wort|Wörter|word|واژه
der|Satz|Sätze|sentence|جمله
der|Buchstabe|Buchstaben|letter (of the alphabet)|حرف الفبا
die|Seite|Seiten|page; side|صفحه؛ طرف
die|Hausaufgabe|Hausaufgaben|homework|تکلیف خانه
die|Prüfung|Prüfungen|exam|امتحان
die|Zahl|Zahlen|number|عدد
die|Nummer|Nummern|number|شماره
der|Tag|Tage|day|روز
die|Woche|Wochen|week|هفته
der|Monat|Monate|month|ماه
das|Jahr|Jahre|year|سال
die|Stunde|Stunden|hour; lesson|ساعت (۶۰ دقیقه)؛ جلسهٔ درس
die|Minute|Minuten|minute|دقیقه
die|Sekunde|Sekunden|second|ثانیه
die|Zeit|Zeiten|time|زمان
die|Uhrzeit|Uhrzeiten|time of day|ساعت (زمان روز)
das|Datum|Daten|date|تاریخ
der|Termin|Termine|appointment|وقت ملاقات
der|Vormittag|Vormittage|late morning|پیش از ظهر
der|Mittag|Mittage|noon, midday|ظهر
der|Nachmittag|Nachmittage|afternoon|بعدازظهر
der|Abend|Abende|evening|عصر؛ سر شب
die|Nacht|Nächte|night|شب
das|Wochenende|Wochenenden|weekend|آخر هفته
der|Montag|Montage|Monday|دوشنبه
der|Dienstag|Dienstage|Tuesday|سه‌شنبه
der|Mittwoch|Mittwoche|Wednesday|چهارشنبه
der|Donnerstag|Donnerstage|Thursday|پنجشنبه
der|Freitag|Freitage|Friday|جمعه
der|Samstag|Samstage|Saturday|شنبه
der|Sonntag|Sonntage|Sunday|یکشنبه
der|Januar|Januare|January|ژانویه
der|Februar|Februare|February|فوریه
der|März|Märze|March|مارس
der|April|Aprile|April|آوریل
der|Mai|Maie|May|مه
der|Juni|Junis|June|ژوئن
der|Juli|Julis|July|ژوئیه
der|August|Auguste|August|اوت
der|September|September|September|سپتامبر
der|Oktober|Oktober|October|اکتبر
der|November|November|November|نوامبر
der|Dezember|Dezember|December|دسامبر
der|Frühling|Frühlinge|spring|بهار
der|Sommer|Sommer|summer|تابستان
der|Herbst|Herbste|autumn|پاییز
der|Winter|Winter|winter|زمستان
das|Wetter|–|weather|آب‌وهوا
die|Sonne|Sonnen|sun|خورشید
der|Regen|–|rain|باران
der|Schnee|–|snow|برف
der|Wind|Winde|wind|باد
die|Wolke|Wolken|cloud|ابر
das|Essen|Essen|food; meal|غذا؛ وعدهٔ غذا
das|Getränk|Getränke|drink|نوشیدنی
das|Brot|Brote|bread|نان
das|Brötchen|Brötchen|bread roll|نان گرد کوچک
die|Butter|–|butter|کره
der|Käse|–|cheese|پنیر
die|Wurst|Würste|sausage|سوسیس؛ کالباس
das|Ei|Eier|egg|تخم‌مرغ
die|Milch|–|milk|شیر
das|Wasser|–|water|آب
der|Saft|Säfte|juice|آبمیوه
der|Kaffee|Kaffees|coffee|قهوه
der|Tee|Tees|tea|چای
das|Bier|Biere|beer|آبجو
der|Wein|Weine|wine|شراب
der|Apfel|Äpfel|apple|سیب
die|Banane|Bananen|banana|موز
die|Orange|Orangen|orange|پرتقال
die|Kartoffel|Kartoffeln|potato|سیب‌زمینی
die|Tomate|Tomaten|tomato|گوجه‌فرنگی
die|Zwiebel|Zwiebeln|onion|پیاز
der|Salat|Salate|salad; lettuce|سالاد؛ کاهو
das|Gemüse|–|vegetables|سبزیجات
das|Obst|–|fruit|میوه
das|Fleisch|–|meat|گوشت
der|Fisch|Fische|fish|ماهی
das|Hähnchen|Hähnchen|chicken (as food)|مرغ
die|Nudel|Nudeln|noodle, pasta|ماکارونی؛ رشته
die|Suppe|Suppen|soup|سوپ
der|Kuchen|Kuchen|cake|کیک
die|Schokolade|Schokoladen|chocolate|شکلات
die|Marmelade|Marmeladen|jam|مربا
der|Honig|–|honey|عسل
die|Pizza|Pizzas|pizza|پیتزا
der|Hamburger|Hamburger|hamburger|همبرگر
der|Zucker|–|sugar|شکر
das|Salz|–|salt|نمک
der|Pfeffer|–|pepper|فلفل
das|Frühstück|Frühstücke|breakfast|صبحانه
das|Mittagessen|Mittagessen|lunch|ناهار
das|Abendessen|Abendessen|dinner|شام
das|Glas|Gläser|glass|لیوان
die|Tasse|Tassen|cup|فنجان
der|Teller|Teller|plate|بشقاب
die|Flasche|Flaschen|bottle|بطری
der|Löffel|Löffel|spoon|قاشق
die|Gabel|Gabeln|fork|چنگال
das|Restaurant|Restaurants|restaurant|رستوران
das|Café|Cafés|café|کافه
die|Rechnung|Rechnungen|bill, invoice|صورت‌حساب
der|Preis|Preise|price; prize|قیمت؛ جایزه
das|Geld|Gelder|money|پول
das|Kilo|Kilos|kilo|کیلو
das|Stück|Stücke|piece|تکه
die|Packung|Packungen|packet|بسته
die|Dose|Dosen|tin, can|قوطی
die|Größe|Größen|size; height|اندازه؛ قد
das|Angebot|Angebote|offer|پیشنهاد ویژه؛ حراج
der|Supermarkt|Supermärkte|supermarket|سوپرمارکت
der|Markt|Märkte|market|بازار
die|Bäckerei|Bäckereien|bakery|نانوایی
das|Geschäft|Geschäfte|shop; business|مغازه؛ کسب‌وکار
die|Kasse|Kassen|till, checkout|صندوق
der|Bahnhof|Bahnhöfe|railway station|ایستگاه قطار
der|Zug|Züge|train|قطار
der|Bus|Busse|bus|اتوبوس
das|Auto|Autos|car|ماشین
das|Fahrrad|Fahrräder|bicycle|دوچرخه
das|Taxi|Taxis|taxi|تاکسی
die|U-Bahn|U-Bahnen|underground, subway|مترو
die|Straßenbahn|Straßenbahnen|tram|تراموا
das|Flugzeug|Flugzeuge|aeroplane|هواپیما
der|Flughafen|Flughäfen|airport|فرودگاه
die|Haltestelle|Haltestellen|stop (bus, tram)|ایستگاه اتوبوس یا تراموا
die|Fahrkarte|Fahrkarten|ticket (travel)|بلیت
das|Ticket|Tickets|ticket|بلیت
der|Weg|Wege|way, path|راه
der|Plan|Pläne|plan|برنامه؛ نقشه
der|Stadtplan|Stadtpläne|city map|نقشهٔ شهر
die|Reise|Reisen|journey, trip|سفر
der|Urlaub|Urlaube|holiday, leave|تعطیلات؛ مرخصی
das|Hotel|Hotels|hotel|هتل
der|Pass|Pässe|passport|گذرنامه
die|Bank|Banken|bank|بانک
die|Post|–|post office; mail|ادارهٔ پست؛ نامه‌ها
die|Apotheke|Apotheken|pharmacy|داروخانه
das|Krankenhaus|Krankenhäuser|hospital|بیمارستان
die|Kirche|Kirchen|church|کلیسا
das|Kino|Kinos|cinema|سینما
das|Museum|Museen|museum|موزه
der|Zoo|Zoos|zoo|باغ‌وحش
der|Park|Parks|park|پارک
der|Platz|Plätze|square; seat; space|میدان؛ جا
die|Kreuzung|Kreuzungen|crossroads|چهارراه
die|Ampel|Ampeln|traffic light|چراغ راهنمایی
die|Brücke|Brücken|bridge|پل
das|Meer|Meere|sea|دریا
der|Berg|Berge|mountain|کوه
der|Fluss|Flüsse|river|رودخانه
der|Baum|Bäume|tree|درخت
die|Blume|Blumen|flower|گل
der|Hund|Hunde|dog|سگ
die|Katze|Katzen|cat|گربه
das|Tier|Tiere|animal|حیوان
der|Vogel|Vögel|bird|پرنده
das|Pferd|Pferde|horse|اسب
der|Körper|Körper|body|بدن
der|Kopf|Köpfe|head|سر
das|Auge|Augen|eye|چشم
das|Ohr|Ohren|ear|گوش
die|Nase|Nasen|nose|بینی
der|Mund|Münder|mouth|دهان
der|Zahn|Zähne|tooth|دندان
die|Hand|Hände|hand|دست
der|Arm|Arme|arm|بازو
das|Bein|Beine|leg|پا (ساق)
der|Fuß|Füße|foot|پا
der|Bauch|Bäuche|belly|شکم
der|Rücken|Rücken|back|پشت؛ کمر
das|Haar|Haare|hair|مو
das|Gesicht|Gesichter|face|صورت
der|Finger|Finger|finger|انگشت
die|Krankheit|Krankheiten|illness|بیماری
das|Kleid|Kleider|dress|پیراهن زنانه
die|Bluse|Blusen|blouse|بلوز زنانه
die|Hose|Hosen|trousers|شلوار
der|Rock|Röcke|skirt|دامن
das|Hemd|Hemden|shirt|پیراهن مردانه
das|T-Shirt|T-Shirts|T-shirt|تی‌شرت
die|Jacke|Jacken|jacket|کت؛ کاپشن
der|Mantel|Mäntel|coat|پالتو
der|Schuh|Schuhe|shoe|کفش
der|Stiefel|Stiefel|boot|چکمه
die|Socke|Socken|sock|جوراب
der|Pullover|Pullover|jumper, sweater|پلیور
die|Mütze|Mützen|woolly hat, cap|کلاه بافتنی
die|Farbe|Farben|colour; paint|رنگ
die|Freizeit|–|free time|اوقات فراغت
das|Spiel|Spiele|game; match|بازی؛ مسابقه
der|Sport|–|sport|ورزش
der|Fußball|Fußbälle|football|فوتبال؛ توپ فوتبال
der|Ball|Bälle|ball|توپ
die|Musik|–|music|موسیقی
das|Lied|Lieder|song|آهنگ؛ ترانه
der|Film|Filme|film|فیلم
das|Hobby|Hobbys|hobby|سرگرمی
die|Party|Partys|party|مهمانی
das|Geschenk|Geschenke|present, gift|هدیه
der|Geburtstag|Geburtstage|birthday|تولد (سالروز)
das|Fest|Feste|celebration|جشن
die|Einladung|Einladungen|invitation|دعوت؛ دعوت‌نامه
der|Hunger|–|hunger|گرسنگی
der|Durst|–|thirst|تشنگی
die|Liebe|–|love|عشق
die|Hilfe|Hilfen|help|کمک
das|Problem|Probleme|problem|مشکل
die|Idee|Ideen|idea|ایده
die|Information|Informationen|information|اطلاعات
die|Nachricht|Nachrichten|message; news item|پیام؛ خبر
das|Formular|Formulare|form (to fill in)|فرم
die|Unterschrift|Unterschriften|signature|امضا
der|Ausweis|Ausweise|ID card|کارت شناسایی
die|Welt|Welten|world|جهان
der|Anfang|Anfänge|beginning|آغاز
das|Ende|Enden|end|پایان
die|Mitte|Mitten|middle|وسط
die|Ecke|Ecken|corner|گوشه
das|Paket|Pakete|parcel|بستهٔ پستی
die|Briefmarke|Briefmarken|stamp|تمبر
die|Zigarette|Zigaretten|cigarette|سیگار
die|Luft|–|air|هوا
`;

  var A2 = `
die|Ausbildung|Ausbildungen|vocational training|دورهٔ آموزش حرفه‌ای
der|Ausbilder|Ausbilder|trainer, instructor|مربی آموزش حرفه‌ای
der|Azubi|Azubis|trainee, apprentice|کارآموز
das|Praktikum|Praktika|internship|دورهٔ کارآموزی
die|Bewerbung|Bewerbungen|job application|درخواست کار
der|Lebenslauf|Lebensläufe|CV, résumé|رزومه
das|Zeugnis|Zeugnisse|certificate; school report|گواهی؛ کارنامه
die|Erfahrung|Erfahrungen|experience|تجربه
das|Gespräch|Gespräche|conversation|گفت‌وگو
das|Vorstellungsgespräch|Vorstellungsgespräche|job interview|مصاحبهٔ استخدامی
der|Vertrag|Verträge|contract|قرارداد
der|Lohn|Löhne|wage|دستمزد
die|Stelle|Stellen|job, position; place|موقعیت شغلی؛ جا
die|Abteilung|Abteilungen|department|بخش
der|Betrieb|Betriebe|company, firm|شرکت؛ کارگاه
die|Werkstatt|Werkstätten|workshop|کارگاه
das|Werkzeug|Werkzeuge|tool|ابزار
die|Maschine|Maschinen|machine|دستگاه
die|Besprechung|Besprechungen|meeting|جلسه
die|Aufgabe|Aufgaben|task; exercise|وظیفه؛ تمرین
das|Ziel|Ziele|goal; destination|هدف؛ مقصد
die|Möglichkeit|Möglichkeiten|possibility|امکان
die|Erlaubnis|Erlaubnisse|permission|اجازه
der|Feierabend|Feierabende|end of the working day|پایان ساعت کاری
der|Arbeitsplatz|Arbeitsplätze|workplace; job|محل کار؛ شغل
der|Ingenieur|Ingenieure|engineer|مهندس
der|Mechaniker|Mechaniker|mechanic|مکانیک
der|Elektriker|Elektriker|electrician|برق‌کار
der|Friseur|Friseure|hairdresser|آرایشگر
der|Krankenpfleger|Krankenpfleger|nurse (male)|پرستار (مرد)
der|Pilot|Piloten|pilot|خلبان
die|Gesundheit|–|health|سلامتی
der|Unfall|Unfälle|accident|تصادف؛ حادثه
die|Versicherung|Versicherungen|insurance|بیمه
die|Krankenkasse|Krankenkassen|health insurance fund|صندوق بیمهٔ درمانی
das|Rezept|Rezepte|prescription; recipe|نسخه؛ دستور آشپزی
die|Tablette|Tabletten|tablet, pill|قرص
das|Medikament|Medikamente|medicine|دارو
der|Schmerz|Schmerzen|pain|درد
das|Fieber|–|fever|تب
die|Erkältung|Erkältungen|cold|سرماخوردگی
der|Husten|–|cough|سرفه
die|Grippe|Grippen|flu|آنفلوانزا
die|Praxis|Praxen|doctor's surgery; practice|مطب؛ تجربهٔ عملی
der|Zahnarzt|Zahnärzte|dentist|دندان‌پزشک
der|Vermieter|Vermieter|landlord|صاحب‌خانه
der|Mieter|Mieter|tenant|مستأجر
die|Kaution|Kautionen|deposit|ودیعه
der|Umzug|Umzüge|move (house)|اسباب‌کشی
das|Stockwerk|Stockwerke|floor, storey|طبقه
der|Aufzug|Aufzüge|lift, elevator|آسانسور
der|Keller|Keller|cellar|زیرزمین
das|Rathaus|Rathäuser|town hall|شهرداری
der|Müll|–|rubbish|زباله
die|Mülltonne|Mülltonnen|wheelie bin|سطل زباله
die|Umwelt|–|environment|محیط زیست
die|Natur|–|nature|طبیعت
der|Wald|Wälder|forest|جنگل
das|Feld|Felder|field|کشتزار
die|Wiese|Wiesen|meadow|چمنزار
der|Strand|Strände|beach|ساحل
die|Insel|Inseln|island|جزیره
das|Gebirge|Gebirge|mountain range|رشته‌کوه
der|Himmel|Himmel|sky; heaven|آسمان
der|Stern|Sterne|star|ستاره
der|Mond|Monde|moon|ماه (قمر)
die|Temperatur|Temperaturen|temperature|دما
das|Gewitter|Gewitter|thunderstorm|طوفان رعدوبرق
der|Nebel|Nebel|fog|مه
das|Eis|–|ice; ice cream|یخ؛ بستنی
die|Jahreszeit|Jahreszeiten|season|فصل
der|Feiertag|Feiertage|public holiday|تعطیل رسمی
die|Hochzeit|Hochzeiten|wedding|عروسی
die|Ehe|Ehen|marriage|ازدواج
der|Ehemann|Ehemänner|husband|شوهر
die|Ehefrau|Ehefrauen|wife|همسر (زن)
das|Paar|Paare|couple; pair|زوج؛ جفت
der|Onkel|Onkel|uncle|عمو؛ دایی
die|Tante|Tanten|aunt|عمه؛ خاله
der|Cousin|Cousins|cousin (male)|پسرعمو؛ پسرخاله
die|Cousine|Cousinen|cousin (female)|دخترعمو؛ دخترخاله
der|Enkel|Enkel|grandson|نوه (پسر)
die|Enkelin|Enkelinnen|granddaughter|نوه (دختر)
der|Partner|Partner|partner|شریک زندگی؛ شریک
die|Beziehung|Beziehungen|relationship|رابطه
das|Gefühl|Gefühle|feeling|احساس
die|Angst|Ängste|fear|ترس
die|Freude|Freuden|joy|شادی
der|Spaß|Späße|fun; joke|تفریح؛ شوخی
das|Glück|–|luck; happiness|شانس؛ خوشبختی
der|Ärger|–|trouble; annoyance|دردسر؛ دلخوری
die|Lust|Lüste|desire, wish|میل؛ حوصله
der|Liebling|Lieblinge|darling; favourite|عزیز؛ محبوب
die|Meinung|Meinungen|opinion|نظر
der|Grund|Gründe|reason; ground|دلیل؛ زمین
der|Fehler|Fehler|mistake|اشتباه
die|Lösung|Lösungen|solution|راه‌حل
das|Beispiel|Beispiele|example|مثال
die|Erklärung|Erklärungen|explanation|توضیح
die|Bedeutung|Bedeutungen|meaning|معنی
die|Übung|Übungen|exercise|تمرین
der|Text|Texte|text|متن
die|Grammatik|Grammatiken|grammar|دستور زبان
das|Wörterbuch|Wörterbücher|dictionary|واژه‌نامه
die|Note|Noten|grade, mark; musical note|نمره؛ نُت
das|Studium|Studien|university studies|تحصیل دانشگاهی
die|Universität|Universitäten|university|دانشگاه
die|Bibliothek|Bibliotheken|library|کتابخانه
das|Fach|Fächer|school subject; compartment|درس؛ قفسه
das|Gymnasium|Gymnasien|academic secondary school|دبیرستان (گیمنازیوم)
der|Kindergarten|Kindergärten|nursery school|مهدکودک
der|Unterricht|–|lessons, teaching|کلاس درس؛ تدریس
die|Schwierigkeit|Schwierigkeiten|difficulty|دشواری
die|Kleinigkeit|Kleinigkeiten|small thing, trifle|چیز جزئی
die|Pünktlichkeit|–|punctuality|وقت‌شناسی
die|Zukunft|–|future|آینده
die|Vergangenheit|–|past|گذشته
die|Gegenwart|–|present|زمان حال
das|Leben|Leben|life|زندگی
der|Tod|Tode|death|مرگ
die|Geburt|Geburten|birth|تولد؛ زایمان
die|Jugend|–|youth|جوانی
die|Kindheit|–|childhood|کودکی
die|Sache|Sachen|thing, matter|چیز؛ موضوع
das|Ding|Dinge|thing|چیز
der|Gegenstand|Gegenstände|object|شیء
das|Geräusch|Geräusche|noise, sound|صدا
die|Stimme|Stimmen|voice; vote|صدا؛ رأی
der|Lärm|–|noise, din|سروصدا
die|Ruhe|–|quiet, calm|آرامش
die|Sicherheit|Sicherheiten|safety, security|امنیت
die|Gefahr|Gefahren|danger|خطر
das|Feuer|Feuer|fire|آتش
die|Feuerwehr|Feuerwehren|fire brigade|آتش‌نشانی
der|Notfall|Notfälle|emergency|وضعیت اضطراری
der|Rettungswagen|Rettungswagen|ambulance|آمبولانس
das|Gesetz|Gesetze|law|قانون
die|Regel|Regeln|rule|قاعده
das|Amt|Ämter|public office, authority|اداره
die|Behörde|Behörden|authority (government)|ادارهٔ دولتی
der|Antrag|Anträge|application (form)|درخواست
die|Anmeldung|Anmeldungen|registration|ثبت‌نام
die|Gebühr|Gebühren|fee|کارمزد؛ هزینه
das|Konto|Konten|bank account|حساب بانکی
die|Überweisung|Überweisungen|bank transfer|انتقال وجه
die|Kreditkarte|Kreditkarten|credit card|کارت اعتباری
der|Automat|Automaten|vending machine|دستگاه خودکار
das|Kleingeld|–|change (coins)|پول خرد
die|Münze|Münzen|coin|سکه
der|Schein|Scheine|banknote; certificate|اسکناس؛ گواهی
die|Quittung|Quittungen|receipt|رسید
der|Rabatt|Rabatte|discount|تخفیف
die|Werbung|–|advertising|تبلیغات
das|Kaufhaus|Kaufhäuser|department store|فروشگاه بزرگ
der|Laden|Läden|shop|مغازه
der|Kiosk|Kioske|kiosk|دکه
die|Metzgerei|Metzgereien|butcher's shop|قصابی
die|Drogerie|Drogerien|chemist's (no prescriptions)|فروشگاه لوازم بهداشتی
die|Kleidung|–|clothing|لباس؛ پوشاک
die|Mode|Moden|fashion|مد
der|Anzug|Anzüge|suit|کت‌وشلوار
die|Krawatte|Krawatten|tie|کراوات
der|Gürtel|Gürtel|belt|کمربند
der|Handschuh|Handschuhe|glove|دستکش
der|Schal|Schals|scarf|شال‌گردن
der|Ring|Ringe|ring|انگشتر؛ حلقه
die|Kette|Ketten|chain; necklace|زنجیر؛ گردنبند
der|Regenschirm|Regenschirme|umbrella|چتر
der|Koffer|Koffer|suitcase|چمدان
der|Rucksack|Rucksäcke|backpack|کوله‌پشتی
das|Gepäck|–|luggage|بار سفر
die|Abfahrt|Abfahrten|departure|حرکت
die|Ankunft|Ankünfte|arrival|رسیدن؛ ورود
der|Bahnsteig|Bahnsteige|platform|سکوی قطار
das|Gleis|Gleise|track; platform|ریل؛ سکو
die|Verspätung|Verspätungen|delay|تأخیر
die|Verbindung|Verbindungen|connection|اتصال؛ ارتباط
der|Fahrplan|Fahrpläne|timetable|جدول حرکت
die|Station|Stationen|station, stop; hospital ward|ایستگاه؛ بخش بیمارستان
die|Autobahn|Autobahnen|motorway|بزرگراه
der|Verkehr|–|traffic|ترافیک؛ رفت‌وآمد
der|Stau|Staus|traffic jam|راه‌بندان
der|Parkplatz|Parkplätze|car park; parking space|پارکینگ؛ جای پارک
die|Tankstelle|Tankstellen|petrol station|پمپ بنزین
der|Führerschein|Führerscheine|driving licence|گواهینامهٔ رانندگی
das|Motorrad|Motorräder|motorbike|موتورسیکلت
das|Schiff|Schiffe|ship|کشتی
der|Hafen|Häfen|harbour, port|بندر
die|Grenze|Grenzen|border; limit|مرز؛ حد
das|Ausland|–|abroad, foreign countries|خارج از کشور
die|Heimat|–|homeland, home|میهن؛ زادگاه
die|Hauptstadt|Hauptstädte|capital city|پایتخت
das|Zentrum|Zentren|centre|مرکز
die|Gegend|Gegenden|area, region|منطقه؛ اطراف
die|Richtung|Richtungen|direction|جهت
die|Nationalität|Nationalitäten|nationality|ملیت
die|Spezialität|Spezialitäten|speciality|غذای مخصوص
die|Aktivität|Aktivitäten|activity|فعالیت
die|Ausstellung|Ausstellungen|exhibition|نمایشگاه
das|Theater|Theater|theatre|تئاتر
das|Konzert|Konzerte|concert|کنسرت
die|Veranstaltung|Veranstaltungen|event|برنامه؛ مراسم
der|Verein|Vereine|club, association|باشگاه؛ انجمن
die|Mannschaft|Mannschaften|team|تیم
das|Training|Trainings|training|تمرین
das|Stadion|Stadien|stadium|ورزشگاه
das|Schwimmbad|Schwimmbäder|swimming pool|استخر
der|Spaziergang|Spaziergänge|walk|پیاده‌روی
die|Wanderung|Wanderungen|hike|کوه‌پیمایی؛ پیاده‌روی طولانی
der|Ausflug|Ausflüge|excursion, day trip|گردش؛ سفر یک‌روزه
der|Tanz|Tänze|dance|رقص
das|Instrument|Instrumente|instrument|ساز
die|Gitarre|Gitarren|guitar|گیتار
das|Klavier|Klaviere|piano|پیانو
das|Album|Alben|album|آلبوم
die|Geschichte|Geschichten|story; history|داستان؛ تاریخ
das|Märchen|Märchen|fairy tale|قصهٔ پریان
der|Roman|Romane|novel|رمان
die|Zeitschrift|Zeitschriften|magazine|مجله
das|Programm|Programme|programme|برنامه
die|Sendung|Sendungen|broadcast, show|برنامهٔ رادیو یا تلویزیون
das|Internet|–|internet|اینترنت
der|Bildschirm|Bildschirme|screen|صفحه‌نمایش
die|Tastatur|Tastaturen|keyboard|صفحه‌کلید
der|Drucker|Drucker|printer|چاپگر
die|Datei|Dateien|file|فایل
das|Passwort|Passwörter|password|رمز عبور
das|Gerät|Geräte|device, appliance|دستگاه
der|Akku|Akkus|rechargeable battery|باتری قابل شارژ
die|Batterie|Batterien|battery|باتری
das|Ladegerät|Ladegeräte|charger|شارژر
der|Anruf|Anrufe|phone call|تماس تلفنی
die|Verabredung|Verabredungen|date, arrangement to meet|قرار ملاقات
der|Besuch|Besuche|visit; visitors|دیدار؛ مهمان
die|Mahlzeit|Mahlzeiten|meal|وعدهٔ غذایی
die|Speisekarte|Speisekarten|menu|منوی غذا
das|Gericht|Gerichte|dish; court of law|خوراک؛ دادگاه
die|Vorspeise|Vorspeisen|starter|پیش‌غذا
die|Nachspeise|Nachspeisen|dessert|دسر
das|Trinkgeld|Trinkgelder|tip|انعام
der|Geschmack|Geschmäcker|taste|مزه؛ سلیقه
das|Öl|Öle|oil|روغن
der|Essig|–|vinegar|سرکه
das|Mehl|–|flour|آرد
die|Sahne|–|cream|خامه
das|Würstchen|Würstchen|small sausage|سوسیس کوچک
das|Plätzchen|Plätzchen|biscuit, cookie|شیرینی خشک
die|Erdbeere|Erdbeeren|strawberry|توت‌فرنگی
die|Birne|Birnen|pear; light bulb|گلابی؛ لامپ
die|Zitrone|Zitronen|lemon|لیموترش
die|Traube|Trauben|grape|انگور
die|Gurke|Gurken|cucumber|خیار
die|Karotte|Karotten|carrot|هویج
der|Knoblauch|–|garlic|سیر
das|Rindfleisch|–|beef|گوشت گاو
das|Schweinefleisch|–|pork|گوشت خوک
der|Topf|Töpfe|pot, saucepan|قابلمه
die|Pfanne|Pfannen|frying pan|ماهیتابه
der|Ofen|Öfen|oven; stove|فر؛ بخاری
die|Spülmaschine|Spülmaschinen|dishwasher|ماشین ظرف‌شویی
die|Waschmaschine|Waschmaschinen|washing machine|ماشین لباسشویی
das|Handtuch|Handtücher|towel|حوله
die|Seife|Seifen|soap|صابون
die|Zahnbürste|Zahnbürsten|toothbrush|مسواک
der|Kamm|Kämme|comb|شانه (مو)
das|Kissen|Kissen|pillow, cushion|بالش
die|Decke|Decken|blanket; ceiling|پتو؛ سقف
der|Vorhang|Vorhänge|curtain|پرده
das|Apartment|Apartments|small flat|آپارتمان کوچک
die|Pflanze|Pflanzen|plant|گیاه
das|Gras|Gräser|grass|علف؛ چمن
das|Blatt|Blätter|leaf; sheet of paper|برگ
die|Kuh|Kühe|cow|گاو
das|Schwein|Schweine|pig|خوک
das|Schaf|Schafe|sheep|گوسفند
die|Maus|Mäuse|mouse|موش
die|Biene|Bienen|bee|زنبور عسل
das|Kaninchen|Kaninchen|rabbit|خرگوش
der|Hals|Hälse|neck; throat|گردن؛ گلو
die|Schulter|Schultern|shoulder|شانه (کتف)
das|Knie|Knie|knee|زانو
der|Magen|Mägen|stomach|معده
das|Herz|Herzen|heart|قلب
die|Haut|Häute|skin|پوست
das|Blut|–|blood|خون
die|Lippe|Lippen|lip|لب
die|Zunge|Zungen|tongue|زبان (عضو بدن)
die|Brust|Brüste|chest; breast|سینه
das|Gewicht|Gewichte|weight|وزن
`;

  var B1 = `
die|Gesellschaft|Gesellschaften|society; company|جامعه؛ شرکت
die|Wirtschaft|Wirtschaften|economy|اقتصاد
die|Politik|–|politics; policy|سیاست
die|Regierung|Regierungen|government|دولت
die|Wahl|Wahlen|election; choice|انتخابات؛ انتخاب
der|Staat|Staaten|state|دولت؛ کشور
die|Demokratie|Demokratien|democracy|دموکراسی
das|Parlament|Parlamente|parliament|مجلس
das|Ministerium|Ministerien|ministry|وزارتخانه
das|Recht|Rechte|right; law|حق؛ حقوق (قانون)
die|Pflicht|Pflichten|duty|وظیفه
die|Freiheit|Freiheiten|freedom|آزادی
die|Verantwortung|–|responsibility|مسئولیت
die|Entscheidung|Entscheidungen|decision|تصمیم
die|Entwicklung|Entwicklungen|development|توسعه؛ رشد
die|Forschung|Forschungen|research|پژوهش
die|Wissenschaft|Wissenschaften|science|علم
die|Technik|Techniken|technology; technique|فناوری؛ فن
die|Erfindung|Erfindungen|invention|اختراع
der|Fortschritt|Fortschritte|progress|پیشرفت
das|Experiment|Experimente|experiment|آزمایش
die|Umfrage|Umfragen|survey|نظرسنجی
das|Ergebnis|Ergebnisse|result|نتیجه
die|Ursache|Ursachen|cause|علت
die|Folge|Folgen|consequence; episode|پیامد؛ قسمت (سریال)
der|Zusammenhang|Zusammenhänge|connection, context|ارتباط؛ بافت
die|Voraussetzung|Voraussetzungen|precondition|پیش‌شرط
die|Bedingung|Bedingungen|condition|شرط
die|Kenntnis|Kenntnisse|knowledge|آگاهی؛ دانش
die|Fähigkeit|Fähigkeiten|ability|توانایی
die|Leistung|Leistungen|performance, achievement|عملکرد؛ دستاورد
der|Erfolg|Erfolge|success|موفقیت
die|Karriere|Karrieren|career|پیشرفت شغلی
die|Stellenanzeige|Stellenanzeigen|job advertisement|آگهی استخدام
der|Arbeitgeber|Arbeitgeber|employer|کارفرما
der|Arbeitnehmer|Arbeitnehmer|employee|کارمند؛ کارگر
der|Mitarbeiter|Mitarbeiter|member of staff|کارمند
die|Arbeitslosigkeit|–|unemployment|بیکاری
die|Gewerkschaft|Gewerkschaften|trade union|اتحادیهٔ کارگری
der|Streik|Streiks|strike|اعتصاب
die|Kündigung|Kündigungen|notice, termination|فسخ قرارداد؛ اخراج
die|Rente|Renten|pension|حقوق بازنشستگی
das|Einkommen|Einkommen|income|درآمد
die|Überstunde|Überstunden|hour of overtime|اضافه‌کاری
die|Schicht|Schichten|shift; layer|شیفت کاری؛ لایه
die|Berufsschule|Berufsschulen|vocational school|هنرستان؛ مدرسهٔ فنی‌وحرفه‌ای
der|Lehrling|Lehrlinge|apprentice|شاگرد؛ کارآموز
der|Abschluss|Abschlüsse|degree, qualification; conclusion|مدرک تحصیلی؛ پایان
die|Weiterbildung|Weiterbildungen|further training|آموزش تکمیلی
das|Seminar|Seminare|seminar|سمینار
die|Qualifikation|Qualifikationen|qualification|صلاحیت؛ مدرک
der|Experte|Experten|expert|متخصص
der|Fachmann|Fachleute|specialist|کارشناس
der|Informatiker|Informatiker|computer scientist|متخصص رایانه
der|Handwerker|Handwerker|tradesperson|پیشه‌ور؛ صنعتگر
der|Tischler|Tischler|carpenter, joiner|نجار
der|Maler|Maler|painter|نقاش
der|Anwalt|Anwälte|lawyer|وکیل
der|Richter|Richter|judge|قاضی
der|Journalist|Journalisten|journalist|روزنامه‌نگار
der|Politiker|Politiker|politician|سیاستمدار
der|Soldat|Soldaten|soldier|سرباز
die|Leitung|Leitungen|management; pipe, line|مدیریت؛ لوله
der|Auftrag|Aufträge|order, assignment|سفارش؛ مأموریت
die|Lieferung|Lieferungen|delivery|تحویل
das|Produkt|Produkte|product|محصول
die|Produktion|Produktionen|production|تولید
die|Ware|Waren|goods, merchandise|کالا
der|Hersteller|Hersteller|manufacturer|سازنده؛ تولیدکننده
die|Qualität|Qualitäten|quality|کیفیت
die|Menge|Mengen|amount; crowd|مقدار؛ جمعیت
der|Verbraucher|Verbraucher|consumer|مصرف‌کننده
der|Umsatz|Umsätze|turnover, sales|گردش مالی
der|Gewinn|Gewinne|profit; prize|سود؛ جایزه
der|Verlust|Verluste|loss|ضرر
der|Vorteil|Vorteile|advantage|مزیت
der|Nachteil|Nachteile|disadvantage|عیب
die|Ausnahme|Ausnahmen|exception|استثنا
die|Mehrheit|Mehrheiten|majority|اکثریت
die|Minderheit|Minderheiten|minority|اقلیت
die|Bevölkerung|–|population|جمعیت
der|Einwohner|Einwohner|inhabitant|ساکن
der|Bürger|Bürger|citizen|شهروند
die|Staatsangehörigkeit|Staatsangehörigkeiten|citizenship|تابعیت
die|Aufenthaltserlaubnis|Aufenthaltserlaubnisse|residence permit|اجازهٔ اقامت
das|Visum|Visa|visa|ویزا؛ روادید
die|Integration|–|integration|ادغام اجتماعی
die|Herkunft|Herkünfte|origin|خاستگاه؛ اصل‌ونسب
die|Religion|Religionen|religion|دین
die|Tradition|Traditionen|tradition|سنت
die|Kultur|Kulturen|culture|فرهنگ
die|Gewohnheit|Gewohnheiten|habit|عادت
das|Verhalten|–|behaviour|رفتار
der|Charakter|Charaktere|character|شخصیت؛ منش
die|Persönlichkeit|Persönlichkeiten|personality|شخصیت
die|Eigenschaft|Eigenschaften|characteristic, trait|ویژگی
die|Geduld|–|patience|صبر
das|Vertrauen|–|trust|اعتماد
der|Respekt|–|respect|احترام
die|Höflichkeit|Höflichkeiten|politeness|ادب
die|Toleranz|–|tolerance|مدارا
der|Streit|Streite|argument, quarrel|دعوا
die|Diskussion|Diskussionen|discussion|بحث
das|Argument|Argumente|argument (reason)|استدلال
der|Vorschlag|Vorschläge|suggestion|پیشنهاد
die|Kritik|Kritiken|criticism; review|انتقاد؛ نقد
die|Beschwerde|Beschwerden|complaint|شکایت
die|Entschuldigung|Entschuldigungen|apology; excuse|عذرخواهی؛ بهانه
das|Kompliment|Komplimente|compliment|تعریف و تمجید
die|Absicht|Absichten|intention|قصد
der|Wunsch|Wünsche|wish|آرزو؛ خواسته
die|Hoffnung|Hoffnungen|hope|امید
die|Sorge|Sorgen|worry|نگرانی
der|Stress|–|stress|استرس
die|Erholung|–|rest, recovery|استراحت؛ تجدید قوا
die|Ernährung|–|diet, nutrition|تغذیه
die|Bewegung|Bewegungen|movement; exercise|حرکت؛ تحرک
die|Verletzung|Verletzungen|injury|آسیب‌دیدگی
die|Wunde|Wunden|wound|زخم
die|Behandlung|Behandlungen|treatment|درمان
die|Operation|Operationen|operation|عمل جراحی
die|Untersuchung|Untersuchungen|examination; investigation|معاینه؛ بررسی
die|Krankmeldung|Krankmeldungen|notice of sickness|اعلام بیماری به کارفرما
die|Allergie|Allergien|allergy|حساسیت
der|Patient|Patienten|patient|بیمار
die|Pflege|–|care, nursing|مراقبت؛ پرستاری
die|Umgebung|Umgebungen|surroundings|محیط اطراف
der|Klimawandel|–|climate change|تغییرات اقلیمی
das|Klima|–|climate|اقلیم؛ آب‌وهوا
die|Energie|Energien|energy|انرژی
die|Verschmutzung|Verschmutzungen|pollution|آلودگی
der|Abfall|Abfälle|waste|پسماند
der|Rohstoff|Rohstoffe|raw material|مادهٔ خام
die|Landwirtschaft|–|agriculture|کشاورزی
die|Industrie|Industrien|industry|صنعت
die|Fabrik|Fabriken|factory|کارخانه
das|Unternehmen|Unternehmen|company, enterprise|شرکت؛ بنگاه
die|Gründung|Gründungen|founding|تأسیس
die|Konkurrenz|–|competition (business)|رقابت؛ رقبا
das|Medium|Medien|medium|رسانه
die|Presse|–|the press|مطبوعات
der|Artikel|Artikel|article|مقاله؛ حرف تعریف
der|Bericht|Berichte|report|گزارش
die|Meldung|Meldungen|report, announcement|خبر؛ اعلام
die|Quelle|Quellen|source; spring|منبع؛ چشمه
die|Öffentlichkeit|–|the public|افکار عمومی؛ عموم مردم
das|Ereignis|Ereignisse|event|رویداد
die|Erinnerung|Erinnerungen|memory; reminder|خاطره؛ یادآوری
das|Gedächtnis|Gedächtnisse|memory (ability to remember)|حافظه
der|Gedanke|Gedanken|thought|فکر
die|Vorstellung|Vorstellungen|idea; performance; introduction|تصور؛ اجرا؛ معرفی
die|Fantasie|Fantasien|imagination|خیال‌پردازی
die|Kunst|Künste|art|هنر
der|Künstler|Künstler|artist|هنرمند
das|Gemälde|Gemälde|painting|تابلوی نقاشی
die|Literatur|Literaturen|literature|ادبیات
das|Gedicht|Gedichte|poem|شعر
der|Dichter|Dichter|poet|شاعر
der|Schriftsteller|Schriftsteller|writer|نویسنده
das|Werk|Werke|work (of art); plant, factory|اثر؛ کارخانه
die|Bühne|Bühnen|stage|صحنه
das|Publikum|–|audience|تماشاگران
der|Zuschauer|Zuschauer|spectator, viewer|تماشاگر؛ بیننده
der|Wettbewerb|Wettbewerbe|competition, contest|مسابقه؛ رقابت
der|Sieg|Siege|victory|پیروزی
die|Niederlage|Niederlagen|defeat|شکست
der|Gegner|Gegner|opponent|حریف
die|Meisterschaft|Meisterschaften|championship|قهرمانی
die|Beratung|Beratungen|advice, counselling|مشاوره
der|Berater|Berater|adviser, consultant|مشاور
die|Vereinbarung|Vereinbarungen|agreement|توافق
die|Bestätigung|Bestätigungen|confirmation|تأیید
die|Genehmigung|Genehmigungen|permit, approval|مجوز
das|Dokument|Dokumente|document|سند؛ مدرک
die|Bescheinigung|Bescheinigungen|certificate|گواهی
der|Nachweis|Nachweise|proof|مدرک اثبات
die|Frist|Fristen|deadline|مهلت
der|Zeitraum|Zeiträume|period of time|بازهٔ زمانی
der|Zustand|Zustände|condition, state|وضعیت؛ حالت
die|Lage|Lagen|situation; location|وضعیت؛ موقعیت مکانی
die|Situation|Situationen|situation|موقعیت
die|Position|Positionen|position|جایگاه
die|Region|Regionen|region|منطقه
die|Funktion|Funktionen|function|کارکرد
die|Reaktion|Reaktionen|reaction|واکنش
die|Nation|Nationen|nation|ملت
die|Realität|Realitäten|reality|واقعیت
die|Tätigkeit|Tätigkeiten|activity, occupation|فعالیت؛ کار
die|Geschwindigkeit|Geschwindigkeiten|speed|سرعت
die|Schönheit|Schönheiten|beauty|زیبایی
das|Verhältnis|Verhältnisse|relationship; ratio|رابطه؛ نسبت
der|Unterschied|Unterschiede|difference|تفاوت
die|Gemeinsamkeit|Gemeinsamkeiten|thing in common|وجه اشتراک
der|Vergleich|Vergleiche|comparison|مقایسه
die|Änderung|Änderungen|change, alteration|تغییر
die|Veränderung|Veränderungen|change, transformation|دگرگونی
der|Wechsel|Wechsel|change, switch|تعویض؛ تغییر
die|Verbesserung|Verbesserungen|improvement|بهبود
die|Herausforderung|Herausforderungen|challenge|چالش
das|Risiko|Risiken|risk|خطر؛ ریسک
die|Chance|Chancen|chance, opportunity|شانس؛ فرصت
die|Gelegenheit|Gelegenheiten|opportunity, occasion|فرصت مناسب
der|Zweck|Zwecke|purpose|منظور؛ هدف
die|Methode|Methoden|method|روش
das|System|Systeme|system|سامانه؛ سیستم
die|Struktur|Strukturen|structure|ساختار
das|Element|Elemente|element|عنصر
das|Kriterium|Kriterien|criterion|معیار
die|Organisation|Organisationen|organisation|سازمان؛ سازمان‌دهی
die|Planung|Planungen|planning|برنامه‌ریزی
die|Vorbereitung|Vorbereitungen|preparation|آماده‌سازی
die|Durchführung|Durchführungen|carrying out|اجرا
die|Teilnahme|–|participation|شرکت؛ مشارکت
der|Teilnehmer|Teilnehmer|participant|شرکت‌کننده
das|Mitglied|Mitglieder|member|عضو
die|Mitgliedschaft|Mitgliedschaften|membership|عضویت
die|Gemeinschaft|Gemeinschaften|community|اجتماع؛ جامعه
die|Nachbarschaft|Nachbarschaften|neighbourhood|همسایگی؛ محله
die|Freundschaft|Freundschaften|friendship|دوستی
die|Partnerschaft|Partnerschaften|partnership|شراکت؛ رابطهٔ زوجی
die|Trennung|Trennungen|separation|جدایی
die|Scheidung|Scheidungen|divorce|طلاق
die|Erziehung|–|upbringing|تربیت
die|Bildung|–|education|آموزش؛ تحصیلات
die|Gleichberechtigung|–|equal rights|برابری حقوق
die|Gerechtigkeit|–|justice|عدالت
die|Wahrheit|Wahrheiten|truth|حقیقت
die|Lüge|Lügen|lie|دروغ
das|Geheimnis|Geheimnisse|secret|راز
der|Zufall|Zufälle|chance, coincidence|اتفاق؛ تصادف
das|Schicksal|Schicksale|fate|سرنوشت
das|Abenteuer|Abenteuer|adventure|ماجراجویی
der|Traum|Träume|dream|رؤیا؛ خواب
die|Sehnsucht|Sehnsüchte|longing|اشتیاق؛ دلتنگی
das|Heimweh|–|homesickness|دلتنگی برای وطن
die|Einsamkeit|–|loneliness|تنهایی
die|Zufriedenheit|–|satisfaction|رضایت
die|Enttäuschung|Enttäuschungen|disappointment|ناامیدی؛ سرخوردگی
die|Überraschung|Überraschungen|surprise|غافلگیری
die|Neugier|–|curiosity|کنجکاوی
der|Mut|–|courage|شجاعت
der|Stolz|–|pride|غرور
der|Neid|–|envy|حسادت
die|Wut|–|rage, fury|خشم
die|Trauer|–|grief, mourning|سوگ؛ اندوه
der|Zweifel|Zweifel|doubt|تردید
der|Optimismus|–|optimism|خوش‌بینی
der|Pessimismus|–|pessimism|بدبینی
der|Tourismus|–|tourism|گردشگری
der|Rassismus|–|racism|نژادپرستی
der|Flüchtling|Flüchtlinge|refugee|پناهنده
der|Neuling|Neulinge|newcomer, beginner|تازه‌کار
der|Zwilling|Zwillinge|twin|دوقلو
der|Schmetterling|Schmetterlinge|butterfly|پروانه
das|Eichhörnchen|Eichhörnchen|squirrel|سنجاب
die|Unterkunft|Unterkünfte|accommodation|محل اقامت
die|Buchung|Buchungen|booking|رزرو
die|Reservierung|Reservierungen|reservation|رزرو
die|Sehenswürdigkeit|Sehenswürdigkeiten|sight, attraction|جاذبهٔ دیدنی
die|Landschaft|Landschaften|landscape|چشم‌انداز طبیعی
das|Ufer|Ufer|bank, shore|کرانه؛ ساحل
der|Hügel|Hügel|hill|تپه
das|Tal|Täler|valley|دره
die|Wüste|Wüsten|desert|بیابان
der|Ozean|Ozeane|ocean|اقیانوس
die|Erde|–|earth; soil|زمین؛ خاک
der|Planet|Planeten|planet|سیاره
das|Weltall|–|outer space|کیهان؛ فضا
die|Distanz|Distanzen|distance|فاصله
die|Konferenz|Konferenzen|conference|کنفرانس
die|Existenz|Existenzen|existence; livelihood|هستی؛ معاش
`;

  var DASH = "–";

  function parse(block, lvl) {
    var out = [];
    var lines = block.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.charAt(0) === "#") continue;
      var f = line.split("|");
      if (f.length !== 5) {
        throw new Error("words.js " + lvl + ": expected 5 fields in \"" + line + "\"");
      }
      out.push({
        w: f[1].trim(),
        a: f[0].trim(),
        pl: f[2].trim() || DASH,
        en: f[3].trim(),
        fa: f[4].trim(),
        lvl: lvl
      });
    }
    return out;
  }

  root.WORDS = [].concat(parse(A1, "A1"), parse(A2, "A2"), parse(B1, "B1"));
})(typeof globalThis !== "undefined" ? globalThis : this);
