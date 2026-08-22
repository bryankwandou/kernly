/**
 * Interface language.
 *
 * The site shipped as `lang="en"` with every string inline, which is a
 * reasonable place to start and a bad place to stop for a tool whose whole
 * pitch is that inference costs money everywhere, not only in California.
 *
 * What is translated and what is not, stated plainly rather than discovered:
 * the navigation, the landing copy and every control label in the playground,
 * the chat and the verifier are translated, so the tool can be operated
 * end-to-end without English. The Method page is a long technical essay and
 * stays in English — a machine rendering of an argument about BM25 length
 * normalisation into eighteen languages would read as authoritative while being
 * unreviewed by anyone who speaks them. The page says so at the top rather than
 * letting a reader find out.
 *
 * There is no translation library here on purpose. The string count is in the
 * dozens, the lookup is a property access, and pulling in an i18n runtime to
 * serve a static dictionary would cost the visitor more bytes than the
 * dictionary itself.
 */

export const LOCALES = [
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia", dir: "ltr" },
  { code: "es", label: "Spanish", native: "Español", dir: "ltr" },
  { code: "pt", label: "Portuguese", native: "Português", dir: "ltr" },
  { code: "fr", label: "French", native: "Français", dir: "ltr" },
  { code: "de", label: "German", native: "Deutsch", dir: "ltr" },
  { code: "it", label: "Italian", native: "Italiano", dir: "ltr" },
  { code: "nl", label: "Dutch", native: "Nederlands", dir: "ltr" },
  { code: "pl", label: "Polish", native: "Polski", dir: "ltr" },
  { code: "ru", label: "Russian", native: "Русский", dir: "ltr" },
  { code: "uk", label: "Ukrainian", native: "Українська", dir: "ltr" },
  { code: "tr", label: "Turkish", native: "Türkçe", dir: "ltr" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt", dir: "ltr" },
  { code: "th", label: "Thai", native: "ไทย", dir: "ltr" },
  { code: "hi", label: "Hindi", native: "हिन्दी", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "zh", label: "Chinese", native: "中文", dir: "ltr" },
  { code: "ja", label: "Japanese", native: "日本語", dir: "ltr" },
  { code: "ko", label: "Korean", native: "한국어", dir: "ltr" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";

export function dirOf(code: Locale): "ltr" | "rtl" {
  return LOCALES.find((l) => l.code === code)?.dir ?? "ltr";
}

/**
 * The English strings are the keys' source of truth; every other locale is a
 * partial map over the same shape, and a missing entry falls back to English at
 * lookup time rather than rendering an empty element.
 */
const en = {
  "nav.playground": "Playground",
  "nav.chat": "Chat",
  "nav.method": "Method",
  "nav.verify": "Verify",
  "nav.source": "Source",

  "hero.eyebrow": "Context compression, verified",
  "hero.title.a": "Keep the kernel.",
  "hero.title.b": "Drop the chaff.",
  "hero.lede":
    "Most of what an agent sends to a model is packaging. Kernly strips it out with a deterministic six-stage filter that runs in a browser tab, costs nothing to operate, and writes a checkable receipt for every token it saves.",
  "hero.cta.playground": "Compress something",
  "hero.cta.chat": "Watch it answer both ways",
  "hero.cta.method": "Read the algorithm",
  "hero.stat.cut": "Tokens cut",
  "hero.stat.cut.note": "on the sample transcript",
  "hero.stat.cost": "Compressor cost",
  "hero.stat.cost.note": "no GPU, no API call",
  "hero.stat.model": "Model needed",
  "hero.stat.model.value": "none",
  "hero.stat.model.note": "pure statistics",
  "hero.measured": "Measured live in your browser when this page loaded, not pre-rendered.",

  "footer.licence": "MIT licensed. The algorithm is the product, and it is open.",
  "footer.chain": "Attestations run on Solana devnet.",

  "ui.language": "Language",
  "ui.theme": "Colour scheme",
  "ui.theme.light": "Light",
  "ui.theme.dark": "Dark",
  "ui.theme.system": "System",

  "method.englishOnly":
    "This page is a technical argument and is published in English only. Every control elsewhere on the site is translated; this text is not, because an unreviewed machine translation of a methodology reads as authoritative while nobody has checked it.",
};

export type Key = keyof typeof en;

type Partial_ = { [K in Key]?: string };

const id: Partial_ = {
  "nav.playground": "Uji Coba",
  "nav.chat": "Obrolan",
  "nav.method": "Metode",
  "nav.verify": "Verifikasi",
  "nav.source": "Kode Sumber",
  "hero.eyebrow": "Pemampatan konteks, terbukti",
  "hero.title.a": "Simpan intinya.",
  "hero.title.b": "Buang sekamnya.",
  "hero.lede":
    "Sebagian besar isi yang dikirim agen ke model hanyalah pembungkus. Kernly membuangnya lewat penyaring enam tahap yang hasilnya selalu sama, berjalan di dalam tab peramban, tidak memakan biaya operasi, dan menuliskan bukti yang bisa diperiksa untuk setiap token yang dihemat.",
  "hero.cta.playground": "Coba mampatkan",
  "hero.cta.chat": "Lihat jawabannya dua arah",
  "hero.cta.method": "Baca algoritmanya",
  "hero.stat.cut": "Token terpangkas",
  "hero.stat.cut.note": "pada transkrip contoh",
  "hero.stat.cost": "Biaya pemampat",
  "hero.stat.cost.note": "tanpa GPU, tanpa panggilan API",
  "hero.stat.model": "Model dibutuhkan",
  "hero.stat.model.value": "tidak ada",
  "hero.stat.model.note": "murni statistik",
  "hero.measured":
    "Diukur langsung di peramban Anda saat halaman ini dimuat, bukan angka yang disiapkan sebelumnya.",
  "footer.licence": "Berlisensi MIT. Algoritmanya adalah produknya, dan ia terbuka.",
  "footer.chain": "Atestasi berjalan di Solana devnet.",
  "ui.language": "Bahasa",
  "ui.theme": "Skema warna",
  "ui.theme.light": "Terang",
  "ui.theme.dark": "Gelap",
  "ui.theme.system": "Ikuti sistem",
  "method.englishOnly":
    "Halaman ini berisi uraian teknis dan hanya diterbitkan dalam bahasa Inggris. Seluruh kendali di bagian lain situs sudah diterjemahkan; teks ini tidak, sebab terjemahan mesin atas sebuah metodologi akan terbaca meyakinkan padahal belum diperiksa siapa pun.",
};

const es: Partial_ = {
  "nav.playground": "Banco de pruebas",
  "nav.chat": "Chat",
  "nav.method": "Método",
  "nav.verify": "Verificar",
  "nav.source": "Código",
  "hero.eyebrow": "Compresión de contexto, verificada",
  "hero.title.a": "Quédate con el grano.",
  "hero.title.b": "Descarta la paja.",
  "hero.lede":
    "Casi todo lo que un agente envía a un modelo es envoltorio. Kernly lo retira con un filtro determinista de seis etapas que se ejecuta en una pestaña del navegador, no cuesta nada operar y deja un recibo comprobable por cada token ahorrado.",
  "hero.cta.playground": "Comprimir algo",
  "hero.cta.chat": "Ver ambas respuestas",
  "hero.cta.method": "Leer el algoritmo",
  "hero.stat.cut": "Tokens recortados",
  "hero.stat.cut.note": "en la transcripción de ejemplo",
  "hero.stat.cost": "Coste del compresor",
  "hero.stat.cost.note": "sin GPU, sin llamadas a API",
  "hero.stat.model": "Modelo necesario",
  "hero.stat.model.value": "ninguno",
  "hero.stat.model.note": "pura estadística",
  "hero.measured":
    "Medido en vivo en tu navegador al cargar esta página, no calculado de antemano.",
  "footer.licence": "Licencia MIT. El algoritmo es el producto, y está abierto.",
  "footer.chain": "Las atestaciones se ejecutan en la devnet de Solana.",
  "ui.language": "Idioma",
  "ui.theme": "Esquema de color",
  "ui.theme.light": "Claro",
  "ui.theme.dark": "Oscuro",
  "ui.theme.system": "Sistema",
  "method.englishOnly":
    "Esta página es una exposición técnica y se publica solo en inglés. El resto de los controles del sitio están traducidos; este texto no, porque una traducción automática sin revisar de una metodología parece autorizada sin que nadie la haya comprobado.",
};

const pt: Partial_ = {
  "nav.playground": "Laboratório",
  "nav.chat": "Conversa",
  "nav.method": "Método",
  "nav.verify": "Verificar",
  "nav.source": "Código",
  "hero.eyebrow": "Compressão de contexto, verificada",
  "hero.title.a": "Guarde o grão.",
  "hero.title.b": "Descarte a palha.",
  "hero.lede":
    "Quase tudo o que um agente envia a um modelo é embalagem. A Kernly retira isso com um filtro determinístico de seis etapas que roda numa aba do navegador, não custa nada para operar e emite um recibo verificável para cada token economizado.",
  "hero.cta.playground": "Comprimir algo",
  "hero.cta.chat": "Ver as duas respostas",
  "hero.cta.method": "Ler o algoritmo",
  "hero.stat.cut": "Tokens cortados",
  "hero.stat.cut.note": "na transcrição de exemplo",
  "hero.stat.cost": "Custo do compressor",
  "hero.stat.cost.note": "sem GPU, sem chamada de API",
  "hero.stat.model": "Modelo necessário",
  "hero.stat.model.value": "nenhum",
  "hero.stat.model.note": "estatística pura",
  "hero.measured":
    "Medido ao vivo no seu navegador quando esta página carregou, não pré-calculado.",
  "footer.licence": "Licença MIT. O algoritmo é o produto, e ele é aberto.",
  "footer.chain": "As atestações rodam na devnet da Solana.",
  "ui.language": "Idioma",
  "ui.theme": "Esquema de cores",
  "ui.theme.light": "Claro",
  "ui.theme.dark": "Escuro",
  "ui.theme.system": "Sistema",
  "method.englishOnly":
    "Esta página é uma exposição técnica e sai apenas em inglês. Os demais controles do site estão traduzidos; este texto não, porque uma tradução automática não revista de uma metodologia soa confiável sem que ninguém a tenha conferido.",
};

const fr: Partial_ = {
  "nav.playground": "Atelier",
  "nav.chat": "Discussion",
  "nav.method": "Méthode",
  "nav.verify": "Vérifier",
  "nav.source": "Sources",
  "hero.eyebrow": "Compression de contexte, vérifiée",
  "hero.title.a": "Gardez le grain.",
  "hero.title.b": "Jetez la balle.",
  "hero.lede":
    "L’essentiel de ce qu’un agent transmet à un modèle n’est que de l’emballage. Kernly l’écarte au moyen d’un filtre déterministe en six étapes qui tourne dans un onglet, ne coûte rien à faire fonctionner et délivre un reçu vérifiable pour chaque jeton épargné.",
  "hero.cta.playground": "Compresser un texte",
  "hero.cta.chat": "Comparer les deux réponses",
  "hero.cta.method": "Lire l’algorithme",
  "hero.stat.cut": "Jetons retirés",
  "hero.stat.cut.note": "sur la transcription d’exemple",
  "hero.stat.cost": "Coût du compresseur",
  "hero.stat.cost.note": "sans GPU, sans appel d’API",
  "hero.stat.model": "Modèle requis",
  "hero.stat.model.value": "aucun",
  "hero.stat.model.note": "statistique pure",
  "hero.measured":
    "Mesuré en direct dans votre navigateur au chargement de la page, et non calculé à l’avance.",
  "footer.licence": "Sous licence MIT. L’algorithme est le produit, et il est ouvert.",
  "footer.chain": "Les attestations tournent sur le devnet Solana.",
  "ui.language": "Langue",
  "ui.theme": "Thème",
  "ui.theme.light": "Clair",
  "ui.theme.dark": "Sombre",
  "ui.theme.system": "Système",
  "method.englishOnly":
    "Cette page est un exposé technique et paraît uniquement en anglais. Tous les autres éléments du site sont traduits ; ce texte ne l’est pas, car une traduction automatique non relue d’une méthodologie inspire une confiance que personne n’a vérifiée.",
};

const de: Partial_ = {
  "nav.playground": "Testfeld",
  "nav.chat": "Chat",
  "nav.method": "Methode",
  "nav.verify": "Prüfen",
  "nav.source": "Quellcode",
  "hero.eyebrow": "Kontextverdichtung, überprüft",
  "hero.title.a": "Behalte den Kern.",
  "hero.title.b": "Wirf die Spreu weg.",
  "hero.lede":
    "Das meiste, was ein Agent an ein Modell schickt, ist Verpackung. Kernly entfernt sie mit einem deterministischen Filter aus sechs Stufen, der in einem Browser-Tab läuft, im Betrieb nichts kostet und für jedes gesparte Token einen nachprüfbaren Beleg schreibt.",
  "hero.cta.playground": "Etwas verdichten",
  "hero.cta.chat": "Beide Antworten ansehen",
  "hero.cta.method": "Den Algorithmus lesen",
  "hero.stat.cut": "Eingesparte Token",
  "hero.stat.cut.note": "im Beispieltranskript",
  "hero.stat.cost": "Kosten der Verdichtung",
  "hero.stat.cost.note": "keine GPU, kein API-Aufruf",
  "hero.stat.model": "Benötigtes Modell",
  "hero.stat.model.value": "keines",
  "hero.stat.model.note": "reine Statistik",
  "hero.measured":
    "Beim Laden dieser Seite live in Ihrem Browser gemessen, nicht vorab berechnet.",
  "footer.licence": "MIT-lizenziert. Der Algorithmus ist das Produkt, und er liegt offen.",
  "footer.chain": "Die Nachweise laufen im Solana-Devnet.",
  "ui.language": "Sprache",
  "ui.theme": "Farbschema",
  "ui.theme.light": "Hell",
  "ui.theme.dark": "Dunkel",
  "ui.theme.system": "System",
  "method.englishOnly":
    "Diese Seite ist eine technische Darlegung und erscheint nur auf Englisch. Alle übrigen Bedienelemente sind übersetzt; dieser Text nicht, denn eine ungeprüfte maschinelle Übersetzung einer Methodik wirkt verbindlich, ohne dass jemand sie nachgelesen hätte.",
};

const it: Partial_ = {
  "nav.playground": "Banco di prova",
  "nav.chat": "Chat",
  "nav.method": "Metodo",
  "nav.verify": "Verifica",
  "nav.source": "Sorgenti",
  "hero.eyebrow": "Compressione del contesto, verificata",
  "hero.title.a": "Tieni il chicco.",
  "hero.title.b": "Butta la pula.",
  "hero.lede":
    "Quasi tutto ciò che un agente manda a un modello è imballaggio. Kernly lo toglie con un filtro deterministico in sei fasi che gira in una scheda del browser, non costa nulla far funzionare e rilascia una ricevuta controllabile per ogni token risparmiato.",
  "hero.cta.playground": "Comprimi qualcosa",
  "hero.cta.chat": "Guarda le due risposte",
  "hero.cta.method": "Leggi l’algoritmo",
  "hero.stat.cut": "Token tagliati",
  "hero.stat.cut.note": "sulla trascrizione di esempio",
  "hero.stat.cost": "Costo del compressore",
  "hero.stat.cost.note": "nessuna GPU, nessuna chiamata API",
  "hero.stat.model": "Modello necessario",
  "hero.stat.model.value": "nessuno",
  "hero.stat.model.note": "pura statistica",
  "hero.measured":
    "Misurato dal vivo nel tuo browser al caricamento della pagina, non calcolato prima.",
  "footer.licence": "Licenza MIT. L’algoritmo è il prodotto, ed è aperto.",
  "footer.chain": "Le attestazioni girano sulla devnet di Solana.",
  "ui.language": "Lingua",
  "ui.theme": "Schema colori",
  "ui.theme.light": "Chiaro",
  "ui.theme.dark": "Scuro",
  "ui.theme.system": "Sistema",
  "method.englishOnly":
    "Questa pagina è un’esposizione tecnica ed esce solo in inglese. Ogni altro comando del sito è tradotto; questo testo no, perché una traduzione automatica non rivista di una metodologia suona autorevole senza che nessuno l’abbia controllata.",
};

const nl: Partial_ = {
  "nav.playground": "Proeftuin",
  "nav.chat": "Gesprek",
  "nav.method": "Methode",
  "nav.verify": "Controleren",
  "nav.source": "Broncode",
  "hero.eyebrow": "Contextcompressie, gecontroleerd",
  "hero.title.a": "Hou de korrel.",
  "hero.title.b": "Laat het kaf gaan.",
  "hero.lede":
    "Het meeste van wat een agent naar een model stuurt is verpakking. Kernly haalt dat weg met een deterministisch filter in zes stappen dat in een browsertabblad draait, niets kost om te gebruiken en voor elk uitgespaard token een controleerbaar bewijs schrijft.",
  "hero.cta.playground": "Iets comprimeren",
  "hero.cta.chat": "Bekijk beide antwoorden",
  "hero.cta.method": "Lees het algoritme",
  "hero.stat.cut": "Tokens weggesneden",
  "hero.stat.cut.note": "op het voorbeeldgesprek",
  "hero.stat.cost": "Kosten van compressie",
  "hero.stat.cost.note": "geen GPU, geen API-aanroep",
  "hero.stat.model": "Model nodig",
  "hero.stat.model.value": "geen",
  "hero.stat.model.note": "pure statistiek",
  "hero.measured":
    "Live gemeten in je browser toen deze pagina laadde, niet vooraf berekend.",
  "footer.licence": "MIT-licentie. Het algoritme is het product, en het ligt open.",
  "footer.chain": "Attestaties draaien op het Solana-devnet.",
  "ui.language": "Taal",
  "ui.theme": "Kleurenschema",
  "ui.theme.light": "Licht",
  "ui.theme.dark": "Donker",
  "ui.theme.system": "Systeem",
  "method.englishOnly":
    "Deze pagina is een technisch betoog en verschijnt alleen in het Engels. Alle andere bedieningselementen zijn vertaald; deze tekst niet, want een ongecontroleerde machinevertaling van een methodiek klinkt gezaghebbend terwijl niemand haar heeft nagelezen.",
};

const pl: Partial_ = {
  "nav.playground": "Warsztat",
  "nav.chat": "Rozmowa",
  "nav.method": "Metoda",
  "nav.verify": "Sprawdź",
  "nav.source": "Kod źródłowy",
  "hero.eyebrow": "Kompresja kontekstu, sprawdzona",
  "hero.title.a": "Zostaw ziarno.",
  "hero.title.b": "Odrzuć plewy.",
  "hero.lede":
    "Większość tego, co agent wysyła do modelu, to opakowanie. Kernly je usuwa deterministycznym filtrem o sześciu etapach, który działa w karcie przeglądarki, nic nie kosztuje w użyciu i wystawia sprawdzalne pokwitowanie za każdy zaoszczędzony token.",
  "hero.cta.playground": "Skompresuj tekst",
  "hero.cta.chat": "Zobacz obie odpowiedzi",
  "hero.cta.method": "Przeczytaj algorytm",
  "hero.stat.cut": "Ucięte tokeny",
  "hero.stat.cut.note": "na przykładowym zapisie",
  "hero.stat.cost": "Koszt kompresji",
  "hero.stat.cost.note": "bez GPU, bez wywołania API",
  "hero.stat.model": "Potrzebny model",
  "hero.stat.model.value": "żaden",
  "hero.stat.model.note": "czysta statystyka",
  "hero.measured":
    "Zmierzone na żywo w przeglądarce przy wczytaniu tej strony, nie policzone wcześniej.",
  "footer.licence": "Licencja MIT. Algorytm jest produktem i jest otwarty.",
  "footer.chain": "Poświadczenia działają na devnecie Solany.",
  "ui.language": "Język",
  "ui.theme": "Schemat barw",
  "ui.theme.light": "Jasny",
  "ui.theme.dark": "Ciemny",
  "ui.theme.system": "Systemowy",
  "method.englishOnly":
    "Ta strona to wywód techniczny i ukazuje się wyłącznie po angielsku. Wszystkie pozostałe elementy serwisu są przetłumaczone; ten tekst nie, ponieważ niesprawdzone tłumaczenie maszynowe metodyki brzmi wiarygodnie, choć nikt go nie zweryfikował.",
};

const ru: Partial_ = {
  "nav.playground": "Песочница",
  "nav.chat": "Чат",
  "nav.method": "Метод",
  "nav.verify": "Проверить",
  "nav.source": "Исходники",
  "hero.eyebrow": "Сжатие контекста, с проверкой",
  "hero.title.a": "Оставь зерно.",
  "hero.title.b": "Отбрось мякину.",
  "hero.lede":
    "Почти всё, что агент отправляет модели, — это упаковка. Kernly убирает её детерминированным фильтром из шести ступеней: он работает во вкладке браузера, ничего не стоит в эксплуатации и выписывает проверяемую расписку за каждый сбережённый токен.",
  "hero.cta.playground": "Сжать текст",
  "hero.cta.chat": "Сравнить два ответа",
  "hero.cta.method": "Читать алгоритм",
  "hero.stat.cut": "Срезано токенов",
  "hero.stat.cut.note": "на образце расшифровки",
  "hero.stat.cost": "Цена сжатия",
  "hero.stat.cost.note": "без GPU и без вызова API",
  "hero.stat.model": "Нужна модель",
  "hero.stat.model.value": "нет",
  "hero.stat.model.note": "чистая статистика",
  "hero.measured":
    "Измерено прямо в вашем браузере при загрузке страницы, а не посчитано заранее.",
  "footer.licence": "Лицензия MIT. Алгоритм и есть продукт, и он открыт.",
  "footer.chain": "Свидетельства записываются в devnet Solana.",
  "ui.language": "Язык",
  "ui.theme": "Цветовая схема",
  "ui.theme.light": "Светлая",
  "ui.theme.dark": "Тёмная",
  "ui.theme.system": "Системная",
  "method.englishOnly":
    "Эта страница — техническое изложение, и она выходит только по-английски. Все прочие элементы сайта переведены, а этот текст нет: непроверенный машинный перевод методики звучит убедительно, хотя его никто не вычитывал.",
};

const uk: Partial_ = {
  "nav.playground": "Пісочниця",
  "nav.chat": "Чат",
  "nav.method": "Метод",
  "nav.verify": "Перевірити",
  "nav.source": "Код",
  "hero.eyebrow": "Стиснення контексту, з перевіркою",
  "hero.title.a": "Лиши зерно.",
  "hero.title.b": "Відкинь полову.",
  "hero.lede":
    "Майже все, що агент надсилає моделі, — це пакування. Kernly прибирає його детермінованим фільтром із шести ступенів: він працює у вкладці браузера, нічого не коштує в роботі й видає перевірну квитанцію за кожен зекономлений токен.",
  "hero.cta.playground": "Стиснути текст",
  "hero.cta.chat": "Порівняти дві відповіді",
  "hero.cta.method": "Читати алгоритм",
  "hero.stat.cut": "Зрізано токенів",
  "hero.stat.cut.note": "на зразку розшифровки",
  "hero.stat.cost": "Ціна стиснення",
  "hero.stat.cost.note": "без GPU і без виклику API",
  "hero.stat.model": "Потрібна модель",
  "hero.stat.model.value": "жодної",
  "hero.stat.model.note": "чиста статистика",
  "hero.measured":
    "Виміряно просто у вашому браузері під час завантаження сторінки, а не пораховано наперед.",
  "footer.licence": "Ліцензія MIT. Алгоритм і є продукт, і він відкритий.",
  "footer.chain": "Засвідчення виконуються в devnet Solana.",
  "ui.language": "Мова",
  "ui.theme": "Схема кольорів",
  "ui.theme.light": "Світла",
  "ui.theme.dark": "Темна",
  "ui.theme.system": "Системна",
  "method.englishOnly":
    "Ця сторінка — технічний виклад, і вона виходить лише англійською. Решта елементів сайту перекладена, а цей текст ні: неперевірений машинний переклад методики звучить переконливо, хоча його ніхто не вичитував.",
};

const tr: Partial_ = {
  "nav.playground": "Deneme alanı",
  "nav.chat": "Sohbet",
  "nav.method": "Yöntem",
  "nav.verify": "Doğrula",
  "nav.source": "Kaynak",
  "hero.eyebrow": "Bağlam sıkıştırma, doğrulanmış",
  "hero.title.a": "Taneyi sakla.",
  "hero.title.b": "Samanı at.",
  "hero.lede":
    "Bir aracın modele gönderdiğinin çoğu ambalajdır. Kernly bunu, tarayıcı sekmesinde çalışan, işletmesi hiçbir şeye mal olmayan ve kazanılan her jeton için denetlenebilir bir makbuz yazan altı aşamalı belirlenimci bir süzgeçle ayıklar.",
  "hero.cta.playground": "Bir metni sıkıştır",
  "hero.cta.chat": "İki yanıtı da gör",
  "hero.cta.method": "Algoritmayı oku",
  "hero.stat.cut": "Kırpılan jeton",
  "hero.stat.cut.note": "örnek dökümde",
  "hero.stat.cost": "Sıkıştırma maliyeti",
  "hero.stat.cost.note": "GPU yok, API çağrısı yok",
  "hero.stat.model": "Gereken model",
  "hero.stat.model.value": "yok",
  "hero.stat.model.note": "salt istatistik",
  "hero.measured":
    "Bu sayfa yüklenirken tarayıcınızda canlı ölçüldü, önceden hesaplanmadı.",
  "footer.licence": "MIT lisanslı. Ürün algoritmanın kendisi ve açık.",
  "footer.chain": "Tasdikler Solana devnet üzerinde işliyor.",
  "ui.language": "Dil",
  "ui.theme": "Renk şeması",
  "ui.theme.light": "Açık",
  "ui.theme.dark": "Koyu",
  "ui.theme.system": "Sistem",
  "method.englishOnly":
    "Bu sayfa teknik bir çözümlemedir ve yalnızca İngilizce yayımlanır. Sitedeki diğer tüm denetimler çevrildi; bu metin çevrilmedi, çünkü bir yöntemin gözden geçirilmemiş makine çevirisi kimse denetlememişken yetkin görünür.",
};

const vi: Partial_ = {
  "nav.playground": "Thử nghiệm",
  "nav.chat": "Trò chuyện",
  "nav.method": "Phương pháp",
  "nav.verify": "Kiểm chứng",
  "nav.source": "Mã nguồn",
  "hero.eyebrow": "Nén ngữ cảnh, đã kiểm chứng",
  "hero.title.a": "Giữ lại hạt.",
  "hero.title.b": "Bỏ đi trấu.",
  "hero.lede":
    "Phần lớn những gì một tác tử gửi cho mô hình chỉ là vỏ bọc. Kernly bóc lớp đó bằng bộ lọc sáu tầng cho kết quả nhất quán, chạy ngay trong thẻ trình duyệt, không tốn chi phí vận hành, và ghi một biên nhận kiểm chứng được cho mỗi token tiết kiệm.",
  "hero.cta.playground": "Nén thử một đoạn",
  "hero.cta.chat": "Xem cả hai câu trả lời",
  "hero.cta.method": "Đọc thuật toán",
  "hero.stat.cut": "Token cắt bớt",
  "hero.stat.cut.note": "trên bản ghi mẫu",
  "hero.stat.cost": "Chi phí nén",
  "hero.stat.cost.note": "không GPU, không gọi API",
  "hero.stat.model": "Mô hình cần dùng",
  "hero.stat.model.value": "không",
  "hero.stat.model.note": "thuần thống kê",
  "hero.measured":
    "Đo trực tiếp trong trình duyệt của bạn khi trang này tải, không tính sẵn từ trước.",
  "footer.licence": "Giấy phép MIT. Thuật toán chính là sản phẩm, và nó để ngỏ.",
  "footer.chain": "Chứng thực chạy trên devnet của Solana.",
  "ui.language": "Ngôn ngữ",
  "ui.theme": "Bảng màu",
  "ui.theme.light": "Sáng",
  "ui.theme.dark": "Tối",
  "ui.theme.system": "Theo hệ thống",
  "method.englishOnly":
    "Trang này là một trình bày kỹ thuật và chỉ đăng bằng tiếng Anh. Mọi nút điều khiển khác trên trang đã được dịch; văn bản này thì không, vì một bản dịch máy chưa ai rà soát về phương pháp luận vẫn đọc lên nghe rất chắc chắn.",
};

const th: Partial_ = {
  "nav.playground": "ลานทดลอง",
  "nav.chat": "สนทนา",
  "nav.method": "วิธีการ",
  "nav.verify": "ตรวจสอบ",
  "nav.source": "ซอร์สโค้ด",
  "hero.eyebrow": "การบีบอัดบริบท ที่ตรวจสอบได้",
  "hero.title.a": "เก็บเมล็ดไว้",
  "hero.title.b": "ทิ้งแกลบไป",
  "hero.lede":
    "สิ่งที่เอเจนต์ส่งให้โมเดลส่วนใหญ่เป็นเพียงเปลือกห่อ Kernly ลอกมันออกด้วยตัวกรองหกขั้นที่ให้ผลเหมือนเดิมทุกครั้ง ทำงานในแท็บเบราว์เซอร์ ไม่มีค่าใช้จ่ายในการเดินเครื่อง และออกใบรับรองที่ตรวจสอบได้สำหรับทุกโทเคนที่ประหยัดได้",
  "hero.cta.playground": "ลองบีบอัดดู",
  "hero.cta.chat": "ดูคำตอบทั้งสองแบบ",
  "hero.cta.method": "อ่านอัลกอริทึม",
  "hero.stat.cut": "โทเคนที่ตัดออก",
  "hero.stat.cut.note": "จากบทถอดความตัวอย่าง",
  "hero.stat.cost": "ต้นทุนการบีบอัด",
  "hero.stat.cost.note": "ไม่ใช้ GPU ไม่เรียก API",
  "hero.stat.model": "โมเดลที่ต้องใช้",
  "hero.stat.model.value": "ไม่ต้อง",
  "hero.stat.model.note": "สถิติล้วน",
  "hero.measured": "วัดสดในเบราว์เซอร์ของคุณตอนหน้านี้โหลด ไม่ได้คำนวณไว้ล่วงหน้า",
  "footer.licence": "สัญญาอนุญาต MIT อัลกอริทึมคือตัวสินค้า และมันเปิดอยู่",
  "footer.chain": "การรับรองทำงานบน devnet ของ Solana",
  "ui.language": "ภาษา",
  "ui.theme": "ชุดสี",
  "ui.theme.light": "สว่าง",
  "ui.theme.dark": "มืด",
  "ui.theme.system": "ตามระบบ",
  "method.englishOnly":
    "หน้านี้เป็นการอธิบายเชิงเทคนิคและเผยแพร่เป็นภาษาอังกฤษเท่านั้น ส่วนควบคุมอื่นทั้งหมดของเว็บไซต์แปลไว้แล้ว แต่ข้อความนี้ไม่ได้แปล เพราะคำแปลด้วยเครื่องที่ยังไม่มีใครตรวจของระเบียบวิธีอ่านแล้วดูน่าเชื่อถือทั้งที่ไม่มีใครสอบทาน",
};

const hi: Partial_ = {
  "nav.playground": "प्रयोगशाला",
  "nav.chat": "बातचीत",
  "nav.method": "विधि",
  "nav.verify": "जाँचें",
  "nav.source": "स्रोत",
  "hero.eyebrow": "संदर्भ संपीड़न, जाँचा हुआ",
  "hero.title.a": "दाना रख लो।",
  "hero.title.b": "भूसा छोड़ दो।",
  "hero.lede":
    "एजेंट मॉडल को जो भेजता है उसका अधिकांश केवल आवरण होता है। Kernly उसे छह चरणों वाले ऐसे छननी से हटाता है जिसका परिणाम हर बार एक-सा रहता है, जो ब्राउज़र टैब में चलता है, चलाने में कुछ खर्च नहीं होता, और बचाए गए हर टोकन की जाँची जा सकने वाली रसीद लिखता है।",
  "hero.cta.playground": "कुछ संपीड़ित करें",
  "hero.cta.chat": "दोनों उत्तर देखें",
  "hero.cta.method": "एल्गोरिद्म पढ़ें",
  "hero.stat.cut": "कटे टोकन",
  "hero.stat.cut.note": "नमूना प्रतिलेख पर",
  "hero.stat.cost": "संपीड़न की लागत",
  "hero.stat.cost.note": "न GPU, न API कॉल",
  "hero.stat.model": "आवश्यक मॉडल",
  "hero.stat.model.value": "कोई नहीं",
  "hero.stat.model.note": "शुद्ध सांख्यिकी",
  "hero.measured":
    "यह पृष्ठ खुलते ही आपके ब्राउज़र में सीधे मापा गया, पहले से गिना हुआ नहीं।",
  "footer.licence": "MIT लाइसेंस। एल्गोरिद्म ही उत्पाद है, और वह खुला है।",
  "footer.chain": "प्रमाणन Solana devnet पर चलते हैं।",
  "ui.language": "भाषा",
  "ui.theme": "रंग योजना",
  "ui.theme.light": "उजला",
  "ui.theme.dark": "गहरा",
  "ui.theme.system": "तंत्र के अनुसार",
  "method.englishOnly":
    "यह पृष्ठ एक तकनीकी विवेचन है और केवल अंग्रेज़ी में प्रकाशित है। साइट के बाकी सभी नियंत्रण अनूदित हैं; यह पाठ नहीं, क्योंकि किसी कार्यप्रणाली का बिना जाँचा मशीनी अनुवाद पढ़ने में प्रामाणिक लगता है जबकि उसे किसी ने परखा नहीं होता।",
};

const ar: Partial_ = {
  "nav.playground": "ساحة التجربة",
  "nav.chat": "محادثة",
  "nav.method": "المنهج",
  "nav.verify": "تحقّق",
  "nav.source": "الشيفرة",
  "hero.eyebrow": "ضغط السياق، موثّق",
  "hero.title.a": "أبقِ الحبّ.",
  "hero.title.b": "أذرِ التبن.",
  "hero.lede":
    "معظم ما يرسله الوكيل إلى النموذج مجرّد غلاف. يزيله Kernly بمصفاة من ستّ مراحل تعطي النتيجة ذاتها في كل مرّة، تعمل داخل لسان المتصفّح، ولا تكلّف شيئًا في التشغيل، وتكتب إيصالًا قابلًا للفحص عن كل رمز موفَّر.",
  "hero.cta.playground": "اضغط نصًّا",
  "hero.cta.chat": "شاهد الإجابتين",
  "hero.cta.method": "اقرأ الخوارزمية",
  "hero.stat.cut": "الرموز المقتطعة",
  "hero.stat.cut.note": "على النص النموذجي",
  "hero.stat.cost": "كلفة الضغط",
  "hero.stat.cost.note": "بلا معالج رسوميّ وبلا نداء واجهة",
  "hero.stat.model": "النموذج المطلوب",
  "hero.stat.model.value": "لا شيء",
  "hero.stat.model.note": "إحصاء محض",
  "hero.measured": "قيس مباشرةً في متصفّحك لحظة تحميل الصفحة، لا محسوبًا سلفًا.",
  "footer.licence": "رخصة MIT. الخوارزمية هي المنتَج، وهي مفتوحة.",
  "footer.chain": "تجري التوثيقات على شبكة Solana التجريبية.",
  "ui.language": "اللغة",
  "ui.theme": "نظام الألوان",
  "ui.theme.light": "فاتح",
  "ui.theme.dark": "داكن",
  "ui.theme.system": "حسب النظام",
  "method.englishOnly":
    "هذه الصفحة عرض تقنيّ وتنشر بالإنجليزية وحدها. تُرجمت كل عناصر التحكّم الأخرى في الموقع؛ أمّا هذا النصّ فلا، لأنّ ترجمة آليّة غير مراجَعة لمنهجيّة تبدو موثوقة دون أن يكون أحد قد دقّقها.",
};

const zh: Partial_ = {
  "nav.playground": "试用台",
  "nav.chat": "对话",
  "nav.method": "方法",
  "nav.verify": "验证",
  "nav.source": "源码",
  "hero.eyebrow": "上下文压缩，可核查",
  "hero.title.a": "留下籽粒。",
  "hero.title.b": "扬掉秕糠。",
  "hero.lede":
    "智能体发给模型的内容，大半只是包装。Kernly 用一套结果恒定的六级筛法把它剥掉：跑在浏览器标签页里，运行不花一分钱，并为省下的每一个词元开出一张可核查的凭据。",
  "hero.cta.playground": "压一段试试",
  "hero.cta.chat": "看两种答复",
  "hero.cta.method": "读算法",
  "hero.stat.cut": "削减词元",
  "hero.stat.cut.note": "在示例记录上",
  "hero.stat.cost": "压缩开销",
  "hero.stat.cost.note": "不用显卡，不调接口",
  "hero.stat.model": "所需模型",
  "hero.stat.model.value": "无",
  "hero.stat.model.note": "纯统计",
  "hero.measured": "本页加载时在你的浏览器中现场测得，并非事先算好。",
  "footer.licence": "MIT 许可。算法就是产品，而且它是敞开的。",
  "footer.chain": "存证跑在 Solana 开发网上。",
  "ui.language": "语言",
  "ui.theme": "配色",
  "ui.theme.light": "浅色",
  "ui.theme.dark": "深色",
  "ui.theme.system": "跟随系统",
  "method.englishOnly":
    "本页是技术论述，只以英文发布。站内其余控件均已翻译，这段文字没有：一份未经审校的方法论机器译文读起来很像定论，实际上无人核对过。",
};

const ja: Partial_ = {
  "nav.playground": "試し場",
  "nav.chat": "対話",
  "nav.method": "方式",
  "nav.verify": "検証",
  "nav.source": "ソース",
  "hero.eyebrow": "文脈圧縮、検証つき",
  "hero.title.a": "実を残す。",
  "hero.title.b": "殻を落とす。",
  "hero.lede":
    "エージェントがモデルへ送るものの大半は包装にすぎません。Kernly は何度動かしても同じ結果になる六段の篩でそれを取り除きます。ブラウザのタブ内で動き、運用費はかからず、節約したトークンごとに検証できる控えを残します。",
  "hero.cta.playground": "圧縮してみる",
  "hero.cta.chat": "両方の答えを見る",
  "hero.cta.method": "アルゴリズムを読む",
  "hero.stat.cut": "削ったトークン",
  "hero.stat.cut.note": "見本の記録に対して",
  "hero.stat.cost": "圧縮の費用",
  "hero.stat.cost.note": "GPU なし、API 呼び出しなし",
  "hero.stat.model": "必要なモデル",
  "hero.stat.model.value": "なし",
  "hero.stat.model.note": "統計のみ",
  "hero.measured": "この頁を読み込んだ時にあなたのブラウザで実測した値で、前もって計算したものではありません。",
  "footer.licence": "MIT ライセンス。アルゴリズムこそが製品であり、それは開かれています。",
  "footer.chain": "証跡は Solana の devnet 上で動きます。",
  "ui.language": "言語",
  "ui.theme": "配色",
  "ui.theme.light": "明るい",
  "ui.theme.dark": "暗い",
  "ui.theme.system": "端末に合わせる",
  "method.englishOnly":
    "この頁は技術的な論述で、英語のみで公開しています。サイトの他の操作部分はすべて翻訳済みですが、この本文は訳していません。手法についての未校閲の機械訳は、誰も確かめていないのに確からしく読めてしまうからです。",
};

const ko: Partial_ = {
  "nav.playground": "실험실",
  "nav.chat": "대화",
  "nav.method": "방법",
  "nav.verify": "검증",
  "nav.source": "소스",
  "hero.eyebrow": "맥락 압축, 검증된",
  "hero.title.a": "알맹이는 남기고.",
  "hero.title.b": "쭉정이는 버리고.",
  "hero.lede":
    "에이전트가 모델에 보내는 것의 대부분은 포장입니다. Kernly는 언제 돌려도 같은 결과를 내는 여섯 단계 체로 그것을 걷어냅니다. 브라우저 탭 안에서 돌고, 운영에 비용이 들지 않으며, 아낀 토큰마다 확인할 수 있는 영수증을 남깁니다.",
  "hero.cta.playground": "한번 압축해 보기",
  "hero.cta.chat": "두 답을 나란히 보기",
  "hero.cta.method": "알고리즘 읽기",
  "hero.stat.cut": "줄인 토큰",
  "hero.stat.cut.note": "예시 기록 기준",
  "hero.stat.cost": "압축 비용",
  "hero.stat.cost.note": "GPU 없이, API 호출 없이",
  "hero.stat.model": "필요한 모델",
  "hero.stat.model.value": "없음",
  "hero.stat.model.note": "순수 통계",
  "hero.measured": "이 페이지가 열릴 때 당신의 브라우저에서 바로 잰 값이며, 미리 계산해 둔 것이 아닙니다.",
  "footer.licence": "MIT 라이선스. 알고리즘이 곧 제품이고, 그것은 열려 있습니다.",
  "footer.chain": "증명은 Solana 데브넷에서 돌아갑니다.",
  "ui.language": "언어",
  "ui.theme": "색 구성",
  "ui.theme.light": "밝게",
  "ui.theme.dark": "어둡게",
  "ui.theme.system": "시스템 따름",
  "method.englishOnly":
    "이 페이지는 기술적 논의라 영어로만 냅니다. 사이트의 다른 조작 요소는 모두 옮겼지만 이 본문은 옮기지 않았습니다. 검수를 거치지 않은 방법론 기계 번역은 아무도 확인하지 않았는데도 확정된 것처럼 읽히기 때문입니다.",
};

const DICT: Record<Locale, Partial_> = {
  en,
  id,
  es,
  pt,
  fr,
  de,
  it,
  nl,
  pl,
  ru,
  uk,
  tr,
  vi,
  th,
  hi,
  ar,
  zh,
  ja,
  ko,
};

/**
 * Look up a key, falling back to English on anything a locale has not filled in.
 *
 * The fallback is not laziness about coverage — it is what keeps a half-finished
 * locale usable. A missing string rendering as English is a reader noticing one
 * untranslated label; a missing string rendering as nothing is a button with no
 * text on it.
 */
export function translate(locale: Locale, key: Key): string {
  return DICT[locale]?.[key] ?? en[key];
}

/** Best match for a browser's stated preferences, or English. */
export function negotiate(preferred: readonly string[]): Locale {
  for (const raw of preferred) {
    const base = raw.toLowerCase().split("-")[0];
    const hit = LOCALES.find((l) => l.code === base);
    if (hit) return hit.code;
  }
  return DEFAULT_LOCALE;
}
