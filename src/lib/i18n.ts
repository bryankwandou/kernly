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

  "chat.material":
    "Reference material",
  "chat.url.title":
    "Load a page",
  "chat.url.load":
    "Load",
  "chat.url.loading":
    "Loading…",
  "chat.url.note":
    "The built-in samples are small. Paste a long article and the compressor has something to actually decide about.",
  "chat.url.loaded":
    "Loaded:",
  "chat.edit":
    "Edit what is being sent",
  "chat.hide":
    "Hide the text",
  "chat.chars":
    "characters",
  "chat.model":
    "Model",
  "chat.ratio":
    "Target ratio",
  "chat.note":
    "Both columns hit the same model with the same question. Only the reference material differs, so any gap in the answers is the compression and nothing else.",
  "chat.preview":
    "At this setting",
  "chat.preview.cut":
    "cut",
  "chat.preview.confidence":
    "confidence",
  "chat.preview.escalate":
    "The gate would flag this run before you read it. Raise the ratio.",
  "chat.tokens":
    "tokens",
  "chat.tokIn":
    "tok in",
  "chat.empty":
    "Ask anything. The reference material is preferred when it answers; when it does not, the model says so and answers anyway.",
  "chat.placeholder":
    "Ask a question…",
  "chat.ask":
    "Ask both",
  "chat.asking":
    "Asking…",
  "chat.full":
    "Full context",
  "chat.compressed":
    "Kernly compressed",
  "chat.verdict.saved":
    "fewer prompt tokens billed",
  "chat.verdict.share.a":
    "Answers share",
  "chat.verdict.share.b":
    "of their content words — a word-level check, not a judgement of correctness. Read both.",
  "chat.verdict.drift":
    "Worth noticing: the full context answered from the document and the compressed one answered from the model's own knowledge. That is the compression losing the answer, even where the two replies read alike.",
  "chat.outside":
    "Not from the reference material",
  "chat.noreply":
    "No reply.",
  "chat.coverage":
    "of the question's rare terms survived",
  "chat.ownCount":
    "by Kernly's own count",
  "chat.escalated":
    "Confidence fell below the gate on this run. Kernly is flagging the compressed answer as untrustworthy before you read it — raise the ratio or send the original.",

  "page.chat.title":
    "Chat",
  "page.chat.lede":
    "Kernly is not a model. It is the layer that decides what a model gets to read. Your question goes to the same model twice — once with the whole document, once with the compressed version — and both replies land here side by side. Load a long page of your own if the samples look too convenient. The model is not fenced into the reference material: when the answer is not in there, it says so and answers anyway.",
  "page.playground.title":
    "Playground",
  "page.playground.lede":
    "Everything below runs locally. The text never leaves the tab, no request is made to any model, and the timing in the receipt is the real cost of the pipeline on this device.",
  "page.verify.title":
    "Verify a receipt",
  "page.verify.lede":
    "Paste a devnet transaction signature and the original context. This page fetches the attestation off the chain, re-runs the pipeline locally, and compares the two digests. If they match, the savings claim held; if they do not, something was changed after the fact. No Kernly server is involved in either half of that check.",

  "chat.verdict.didNotFit":
    "The uncompressed request did not fit.",
  "chat.verdict.didNotFit.note":
    "The provider refused it before reading a word. The compressed one went through and answered.",

  "chat.ceiling.only":
    "Too big for this model's free-tier minute budget uncompressed — only the compressed column will get through. That is the demonstration. Pick a Gemini model to see both.",
  "chat.ceiling.neither":
    "Too big for this model's free-tier minute budget even compressed. Lower the ratio, or pick a Gemini model.",

  "chat.fitted.a":
    "This page is bigger than the model's free-tier minute budget, so the ratio was tightened to",
  "chat.fitted.b":
    "which is small enough to send. That is the compressor doing its job rather than the demo moving to a roomier provider. Watch the gate: past a point it warns, and past a further point the answer is wrong.",

  "chat.fellback":
    "had no quota left, so this was answered by",

  "chat.demo.title":
    "See it work",
  "chat.demo.note":
    "One click loads a real article of 100,000 characters or more and asks a question whose answer sits deep inside it. Too large to send uncompressed on the free tier.",

  "chat.nothing.title":
    "Nothing was measured here.",
  "chat.nothing.body":
    "Both columns answered from the model's own knowledge, because the reference material had nothing on this. That is the model talking, not the compressor — the two columns will agree no matter what compression does. Load an article above and ask something it actually covers.",

  "chat.nothing.cta":
    "Try one that does",
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

  "chat.material":
    "Bahan rujukan",
  "chat.url.title":
    "Muat sebuah halaman",
  "chat.url.load":
    "Muat",
  "chat.url.loading":
    "Memuat…",
  "chat.url.note":
    "Contoh bawaan berukuran kecil. Tempelkan artikel panjang, barulah pemampat punya sesuatu untuk benar-benar dipilah.",
  "chat.url.loaded":
    "Termuat:",
  "chat.edit":
    "Ubah isi yang dikirim",
  "chat.hide":
    "Sembunyikan teksnya",
  "chat.chars":
    "karakter",
  "chat.model":
    "Model",
  "chat.ratio":
    "Rasio sasaran",
  "chat.note":
    "Kedua kolom menembak model yang sama dengan pertanyaan yang sama. Yang berbeda hanya bahan rujukannya, jadi selisih jawaban murni berasal dari pemampatan.",
  "chat.preview":
    "Pada setelan ini",
  "chat.preview.cut":
    "terpangkas",
  "chat.preview.confidence":
    "keyakinan",
  "chat.preview.escalate":
    "Gerbang akan menandai hasil ini sebelum Anda membacanya. Naikkan rasionya.",
  "chat.tokens":
    "token",
  "chat.tokIn":
    "token masuk",
  "chat.empty":
    "Tanyakan apa saja. Bahan rujukan dipakai lebih dahulu bila memuat jawabannya; bila tidak, model mengatakannya lalu tetap menjawab.",
  "chat.placeholder":
    "Ajukan pertanyaan…",
  "chat.ask":
    "Tanya keduanya",
  "chat.asking":
    "Menanya…",
  "chat.full":
    "Konteks utuh",
  "chat.compressed":
    "Dimampatkan Kernly",
  "chat.verdict.saved":
    "token prompt yang ditagih lebih sedikit",
  "chat.verdict.share.a":
    "Kedua jawaban berbagi",
  "chat.verdict.share.b":
    "kata isinya — pemeriksaan tingkat kata, bukan penilaian benar atau salah. Baca keduanya.",
  "chat.verdict.drift":
    "Perlu dicermati: konteks utuh menjawab dari dokumen, sedangkan yang dimampatkan menjawab dari pengetahuan model sendiri. Itu berarti pemampatan kehilangan jawabannya, sekalipun kedua balasan terbaca mirip.",
  "chat.outside":
    "Bukan dari bahan rujukan",
  "chat.noreply":
    "Tidak ada balasan.",
  "chat.coverage":
    "istilah langka pertanyaan yang selamat",
  "chat.ownCount":
    "menurut hitungan Kernly sendiri",
  "chat.escalated":
    "Keyakinan jatuh di bawah ambang gerbang pada percobaan ini. Kernly menandai jawaban yang dimampatkan sebagai tidak layak dipercaya sebelum Anda membacanya — naikkan rasionya atau kirim naskah aslinya.",

  "page.chat.title":
    "Obrolan",
  "page.chat.lede":
    "Kernly bukan model. Ia lapisan yang menentukan apa yang boleh dibaca sebuah model. Pertanyaan Anda dikirim ke model yang sama dua kali — sekali dengan dokumen utuh, sekali dengan versi yang dimampatkan — dan kedua balasannya muncul berdampingan di sini. Muat halaman panjang milik Anda sendiri bila contoh bawaan terasa terlalu mudah. Model tidak dipagari oleh bahan rujukan: bila jawabannya tidak ada di sana, ia mengatakannya lalu tetap menjawab.",
  "page.playground.title":
    "Uji Coba",
  "page.playground.lede":
    "Semua yang di bawah ini berjalan di perangkat Anda. Teksnya tidak pernah keluar dari tab, tidak ada permintaan ke model mana pun, dan waktu pada bukti adalah ongkos nyata pipeline di alat ini.",
  "page.verify.title":
    "Periksa sebuah bukti",
  "page.verify.lede":
    "Tempelkan tanda tangan transaksi devnet beserta konteks aslinya. Halaman ini mengambil atestasinya dari rantai, menjalankan ulang pipeline di sini, lalu membandingkan kedua ringkasan digitalnya. Bila cocok, klaim penghematannya sahih; bila tidak, ada yang diubah setelahnya. Tidak ada server Kernly yang terlibat pada kedua sisi pemeriksaan itu.",

  "chat.verdict.didNotFit":
    "Permintaan tanpa pemampatan tidak muat.",
  "chat.verdict.didNotFit.note":
    "Penyedia menolaknya sebelum sempat membaca sepatah kata. Yang dimampatkan lolos dan menjawab.",

  "chat.ceiling.only":
    "Terlalu besar untuk jatah per menit tingkat gratis model ini bila tidak dimampatkan — hanya kolom yang dimampatkan yang akan lolos. Justru itu pembuktiannya. Pilih model Gemini untuk melihat keduanya.",
  "chat.ceiling.neither":
    "Terlalu besar untuk jatah per menit tingkat gratis model ini bahkan setelah dimampatkan. Turunkan rasionya, atau pilih model Gemini.",

  "chat.fitted.a":
    "Halaman ini lebih besar daripada jatah per menit tingkat gratis model ini, jadi rasionya dirapatkan menjadi",
  "chat.fitted.b":
    "yang sudah cukup kecil untuk dikirim. Itulah pemampat menjalankan tugasnya, bukan demo yang kabur ke penyedia berjatah lebih longgar. Perhatikan gerbangnya: lewat satu titik ia memperingatkan, dan lewat titik berikutnya jawabannya keliru.",

  "chat.fellback":
    "kehabisan kuota, jadi ini dijawab oleh",

  "chat.demo.title":
    "Lihat cara kerjanya",
  "chat.demo.note":
    "Sekali klik memuat artikel sungguhan 100.000 karakter ke atas dan mengajukan pertanyaan yang jawabannya terkubur jauh di dalamnya. Terlalu besar untuk dikirim tanpa pemampatan di tingkat gratis.",

  "chat.nothing.title":
    "Tidak ada yang terukur di sini.",
  "chat.nothing.body":
    "Kedua kolom menjawab dari ingatan modelnya sendiri, sebab bahan rujukannya memang tidak memuat soal ini. Itu modelnya yang bicara, bukan pemampatnya — kedua kolom akan tetap sama apa pun yang dilakukan pemampatan. Muat artikel di atas, lalu tanyakan hal yang memang dibahasnya.",

  "chat.nothing.cta":
    "Coba yang memang membuktikan",
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

  "chat.material":
    "Material de referencia",
  "chat.url.title":
    "Cargar una página",
  "chat.url.load":
    "Cargar",
  "chat.url.loading":
    "Cargando…",
  "chat.url.note":
    "Las muestras incluidas son pequeñas. Pega un artículo largo y el compresor tendrá algo real que decidir.",
  "chat.url.loaded":
    "Cargado:",
  "chat.edit":
    "Editar lo que se envía",
  "chat.hide":
    "Ocultar el texto",
  "chat.chars":
    "caracteres",
  "chat.model":
    "Modelo",
  "chat.ratio":
    "Ratio objetivo",
  "chat.note":
    "Ambas columnas van al mismo modelo con la misma pregunta. Solo cambia el material de referencia, así que cualquier diferencia entre las respuestas es la compresión y nada más.",
  "chat.preview":
    "Con este ajuste",
  "chat.preview.cut":
    "recortado",
  "chat.preview.confidence":
    "confianza",
  "chat.preview.escalate":
    "El guardián marcaría esta ejecución antes de que la leas. Sube el ratio.",
  "chat.tokens":
    "tokens",
  "chat.tokIn":
    "tok entrada",
  "chat.empty":
    "Pregunta lo que quieras. El material de referencia tiene prioridad cuando responde; cuando no, el modelo lo dice y responde igualmente.",
  "chat.placeholder":
    "Haz una pregunta…",
  "chat.ask":
    "Preguntar a ambos",
  "chat.asking":
    "Preguntando…",
  "chat.full":
    "Contexto completo",
  "chat.compressed":
    "Comprimido por Kernly",
  "chat.verdict.saved":
    "menos tokens de prompt facturados",
  "chat.verdict.share.a":
    "Las respuestas comparten",
  "chat.verdict.share.b":
    "de sus palabras de contenido: una comprobación léxica, no un juicio de corrección. Lee ambas.",
  "chat.verdict.drift":
    "Conviene notarlo: el contexto completo respondió desde el documento y el comprimido respondió desde el conocimiento propio del modelo. Eso es la compresión perdiendo la respuesta, aunque ambas se lean parecidas.",
  "chat.outside":
    "No procede del material de referencia",
  "chat.noreply":
    "Sin respuesta.",
  "chat.coverage":
    "de los términos raros de la pregunta sobrevivieron",
  "chat.ownCount":
    "según el propio recuento de Kernly",
  "chat.escalated":
    "La confianza cayó por debajo del umbral en esta ejecución. Kernly marca la respuesta comprimida como poco fiable antes de que la leas: sube el ratio o envía el original.",

  "page.chat.title":
    "Chat",
  "page.chat.lede":
    "Kernly no es un modelo. Es la capa que decide qué llega a leer un modelo. Tu pregunta va al mismo modelo dos veces — una con el documento entero y otra con la versión comprimida — y ambas respuestas aparecen aquí, lado a lado. Carga una página larga tuya si las muestras te parecen demasiado cómodas. El modelo no está encerrado en el material de referencia: cuando la respuesta no está ahí, lo dice y responde igualmente.",
  "page.playground.title":
    "Banco de pruebas",
  "page.playground.lede":
    "Todo lo de abajo se ejecuta en local. El texto nunca sale de la pestaña, no se hace ninguna petición a ningún modelo, y el tiempo del recibo es el coste real de la tubería en este dispositivo.",
  "page.verify.title":
    "Verificar un recibo",
  "page.verify.lede":
    "Pega una firma de transacción de devnet y el contexto original. Esta página recoge la atestación de la cadena, vuelve a ejecutar la tubería en local y compara los dos resúmenes. Si coinciden, la afirmación de ahorro se sostuvo; si no, algo se cambió después. Ningún servidor de Kernly interviene en ninguna de las dos mitades de esa comprobación.",

  "chat.verdict.didNotFit":
    "La petición sin comprimir no cabía.",
  "chat.verdict.didNotFit.note":
    "El proveedor la rechazó antes de leer una palabra. La comprimida pasó y respondió.",

  "chat.ceiling.only":
    "Demasiado grande sin comprimir para el presupuesto por minuto del nivel gratuito de este modelo: solo pasará la columna comprimida. Esa es la demostración. Elige un modelo Gemini para ver ambas.",
  "chat.ceiling.neither":
    "Demasiado grande para el presupuesto por minuto del nivel gratuito de este modelo incluso comprimido. Baja el ratio o elige un modelo Gemini.",

  "chat.fitted.a":
    "Esta página supera el presupuesto por minuto del nivel gratuito del modelo, así que el ratio se ajustó a",
  "chat.fitted.b":
    "que ya cabe. Eso es el compresor haciendo su trabajo, no la demo huyendo a un proveedor más holgado. Mira el guardián: pasado un punto avisa, y pasado otro la respuesta es falsa.",

  "chat.fellback":
    "se quedó sin cuota, así que esto lo respondió",

  "chat.demo.title":
    "Míralo funcionar",
  "chat.demo.note":
    "Un clic carga un artículo real de 100.000 caracteres o más y hace una pregunta cuya respuesta está enterrada dentro. Demasiado grande para enviarlo sin comprimir en el nivel gratuito.",

  "chat.nothing.title":
    "Aquí no se midió nada.",
  "chat.nothing.body":
    "Ambas columnas respondieron desde el conocimiento del propio modelo, porque el material de referencia no traía nada sobre esto. Habla el modelo, no el compresor: las dos columnas coincidirán haga lo que haga la compresión. Carga un artículo arriba y pregunta algo que sí trate.",

  "chat.nothing.cta":
    "Prueba una que sí lo haga",
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

  "chat.material":
    "Material de referência",
  "chat.url.title":
    "Carregar uma página",
  "chat.url.load":
    "Carregar",
  "chat.url.loading":
    "Carregando…",
  "chat.url.note":
    "As amostras embutidas são pequenas. Cole um artigo longo e o compressor passa a ter algo de verdade para decidir.",
  "chat.url.loaded":
    "Carregado:",
  "chat.edit":
    "Editar o que está sendo enviado",
  "chat.hide":
    "Ocultar o texto",
  "chat.chars":
    "caracteres",
  "chat.model":
    "Modelo",
  "chat.ratio":
    "Razão alvo",
  "chat.note":
    "As duas colunas batem no mesmo modelo com a mesma pergunta. Só muda o material de referência, então qualquer diferença entre as respostas é a compressão e nada mais.",
  "chat.preview":
    "Neste ajuste",
  "chat.preview.cut":
    "cortado",
  "chat.preview.confidence":
    "confiança",
  "chat.preview.escalate":
    "O portão marcaria esta execução antes de você ler. Aumente a razão.",
  "chat.tokens":
    "tokens",
  "chat.tokIn":
    "tok entrada",
  "chat.empty":
    "Pergunte o que quiser. O material de referência vem primeiro quando responde; quando não responde, o modelo avisa e responde assim mesmo.",
  "chat.placeholder":
    "Faça uma pergunta…",
  "chat.ask":
    "Perguntar aos dois",
  "chat.asking":
    "Perguntando…",
  "chat.full":
    "Contexto inteiro",
  "chat.compressed":
    "Comprimido pela Kernly",
  "chat.verdict.saved":
    "menos tokens de prompt cobrados",
  "chat.verdict.share.a":
    "As respostas compartilham",
  "chat.verdict.share.b":
    "das palavras de conteúdo — uma conferência lexical, não um juízo de correção. Leia as duas.",
  "chat.verdict.drift":
    "Vale reparar: o contexto inteiro respondeu a partir do documento e o comprimido respondeu do conhecimento do próprio modelo. Isso é a compressão perdendo a resposta, mesmo que as duas se pareçam.",
  "chat.outside":
    "Não veio do material de referência",
  "chat.noreply":
    "Sem resposta.",
  "chat.coverage":
    "dos termos raros da pergunta sobreviveram",
  "chat.ownCount":
    "pela contagem da própria Kernly",
  "chat.escalated":
    "A confiança caiu abaixo do portão nesta execução. A Kernly marca a resposta comprimida como pouco confiável antes de você ler — aumente a razão ou mande o original.",

  "page.chat.title":
    "Conversa",
  "page.chat.lede":
    "A Kernly não é um modelo. É a camada que decide o que um modelo chega a ler. A sua pergunta vai ao mesmo modelo duas vezes — uma com o documento inteiro, outra com a versão comprimida — e as duas respostas aparecem aqui lado a lado. Carregue uma página longa sua se as amostras parecerem convenientes demais. O modelo não está cercado pelo material de referência: quando a resposta não está lá, ele diz isso e responde mesmo assim.",
  "page.playground.title":
    "Laboratório",
  "page.playground.lede":
    "Tudo abaixo roda localmente. O texto nunca sai da aba, nenhum pedido é feito a modelo algum, e o tempo no recibo é o custo real do pipeline neste aparelho.",
  "page.verify.title":
    "Conferir um recibo",
  "page.verify.lede":
    "Cole uma assinatura de transação da devnet e o contexto original. Esta página busca a atestação na cadeia, roda o pipeline de novo aqui e compara os dois resumos. Se baterem, a alegação de economia se sustentou; se não, algo foi mexido depois. Nenhum servidor da Kernly entra em qualquer das duas metades dessa conferência.",

  "chat.verdict.didNotFit":
    "O pedido sem compressão não coube.",
  "chat.verdict.didNotFit.note":
    "O provedor o recusou antes de ler uma palavra. O comprimido passou e respondeu.",

  "chat.ceiling.only":
    "Grande demais sem compressão para a cota por minuto do nível gratuito deste modelo — só a coluna comprimida vai passar. É justamente essa a demonstração. Escolha um modelo Gemini para ver as duas.",
  "chat.ceiling.neither":
    "Grande demais para a cota por minuto do nível gratuito deste modelo mesmo comprimido. Baixe a razão ou escolha um modelo Gemini.",

  "chat.fitted.a":
    "Esta página excede a cota por minuto do nível gratuito do modelo, então a razão foi apertada para",
  "chat.fitted.b":
    "que já cabe. É o compressor fazendo o seu trabalho, não a demonstração fugindo para um provedor mais folgado. Repare no portão: passado um ponto ele avisa, e passado outro a resposta é falsa.",

  "chat.fellback":
    "ficou sem cota, então quem respondeu foi",

  "chat.demo.title":
    "Veja funcionando",
  "chat.demo.note":
    "Um clique carrega um artigo real de 100.000 caracteres ou mais e faz uma pergunta cuja resposta está lá no meio. Grande demais para enviar sem compressão no nível gratuito.",

  "chat.nothing.title":
    "Aqui não se mediu nada.",
  "chat.nothing.body":
    "As duas colunas responderam a partir do conhecimento do próprio modelo, porque o material de referência não tinha nada sobre isso. É o modelo falando, não o compressor — as colunas vão concordar faça o que fizer a compressão. Carregue um artigo acima e pergunte algo que ele cubra.",

  "chat.nothing.cta":
    "Experimente uma que prove",
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

  "chat.material":
    "Matériau de référence",
  "chat.url.title":
    "Charger une page",
  "chat.url.load":
    "Charger",
  "chat.url.loading":
    "Chargement…",
  "chat.url.note":
    "Les exemples fournis sont courts. Collez un long article et le compresseur aura enfin de quoi trancher.",
  "chat.url.loaded":
    "Chargé :",
  "chat.edit":
    "Modifier ce qui est envoyé",
  "chat.hide":
    "Masquer le texte",
  "chat.chars":
    "caractères",
  "chat.model":
    "Modèle",
  "chat.ratio":
    "Taux visé",
  "chat.note":
    "Les deux colonnes interrogent le même modèle avec la même question. Seul le matériau de référence change, donc tout écart entre les réponses vient de la compression et de rien d’autre.",
  "chat.preview":
    "À ce réglage",
  "chat.preview.cut":
    "retiré",
  "chat.preview.confidence":
    "confiance",
  "chat.preview.escalate":
    "Le garde-fou signalerait cette exécution avant votre lecture. Remontez le taux.",
  "chat.tokens":
    "jetons",
  "chat.tokIn":
    "jetons entrée",
  "chat.empty":
    "Posez n’importe quelle question. Le matériau de référence prime lorsqu’il répond ; sinon le modèle le dit et répond quand même.",
  "chat.placeholder":
    "Posez une question…",
  "chat.ask":
    "Interroger les deux",
  "chat.asking":
    "En cours…",
  "chat.full":
    "Contexte entier",
  "chat.compressed":
    "Compressé par Kernly",
  "chat.verdict.saved":
    "jetons de prompt facturés en moins",
  "chat.verdict.share.a":
    "Les réponses partagent",
  "chat.verdict.share.b":
    "de leurs mots de contenu — une vérification lexicale, non un jugement d’exactitude. Lisez les deux.",
  "chat.verdict.drift":
    "À remarquer : le contexte entier a répondu depuis le document, le contexte compressé depuis les connaissances propres du modèle. C’est la compression qui perd la réponse, même quand les deux se lisent pareil.",
  "chat.outside":
    "Ne vient pas du matériau de référence",
  "chat.noreply":
    "Aucune réponse.",
  "chat.coverage":
    "des termes rares de la question ont survécu",
  "chat.ownCount":
    "selon le décompte de Kernly",
  "chat.escalated":
    "La confiance est passée sous le seuil sur cette exécution. Kernly signale la réponse compressée comme peu fiable avant que vous la lisiez — remontez le taux ou envoyez l’original.",

  "page.chat.title":
    "Discussion",
  "page.chat.lede":
    "Kernly n’est pas un modèle. C’est la couche qui décide de ce qu’un modèle a le droit de lire. Votre question part deux fois vers le même modèle — une fois avec le document entier, une fois avec la version compressée — et les deux réponses arrivent ici côte à côte. Chargez une longue page de votre choix si les exemples vous semblent trop commodes. Le modèle n’est pas enfermé dans le matériau de référence : quand la réponse ne s’y trouve pas, il le dit et répond quand même.",
  "page.playground.title":
    "Atelier",
  "page.playground.lede":
    "Tout ce qui suit tourne en local. Le texte ne quitte jamais l’onglet, aucune requête n’est faite vers un modèle, et la durée indiquée sur le reçu est le coût réel de la chaîne sur cet appareil.",
  "page.verify.title":
    "Vérifier un reçu",
  "page.verify.lede":
    "Collez une signature de transaction devnet et le contexte d’origine. Cette page récupère l’attestation sur la chaîne, rejoue la chaîne de traitement en local et compare les deux empreintes. Si elles concordent, l’économie annoncée tenait ; sinon, quelque chose a été modifié après coup. Aucun serveur Kernly n’intervient dans l’une ou l’autre moitié de ce contrôle.",

  "chat.verdict.didNotFit":
    "La requête non compressée n’entrait pas.",
  "chat.verdict.didNotFit.note":
    "Le fournisseur l’a refusée sans en lire un mot. La version compressée est passée et a répondu.",

  "chat.ceiling.only":
    "Trop volumineux non compressé pour le quota par minute de l’offre gratuite de ce modèle : seule la colonne compressée passera. C’est précisément la démonstration. Choisissez un modèle Gemini pour voir les deux.",
  "chat.ceiling.neither":
    "Trop volumineux pour le quota par minute de l’offre gratuite de ce modèle, même compressé. Baissez le taux ou choisissez un modèle Gemini.",

  "chat.fitted.a":
    "Cette page dépasse le quota par minute de l’offre gratuite du modèle, le taux a donc été resserré à",
  "chat.fitted.b":
    "ce qui passe. C’est le compresseur qui fait son travail, non la démo qui se réfugie chez un fournisseur plus large. Surveillez le garde-fou : au-delà d’un point il alerte, au-delà d’un autre la réponse est fausse.",

  "chat.fellback":
    "n’avait plus de quota, la réponse vient donc de",

  "chat.demo.title":
    "Voyez-le à l’œuvre",
  "chat.demo.note":
    "Un clic charge un vrai article de 100 000 caractères ou plus et pose une question dont la réponse est enfouie dedans. Trop volumineux pour partir non compressé sur l’offre gratuite.",

  "chat.nothing.title":
    "Rien n’a été mesuré ici.",
  "chat.nothing.body":
    "Les deux colonnes ont répondu depuis la mémoire du modèle, le matériau de référence n’en disait rien. C’est le modèle qui parle, pas le compresseur : les deux colonnes s’accorderont quoi que fasse la compression. Chargez un article ci-dessus et posez une question qu’il traite vraiment.",

  "chat.nothing.cta":
    "Essayer une qui le fait",
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

  "chat.material":
    "Referenzmaterial",
  "chat.url.title":
    "Eine Seite laden",
  "chat.url.load":
    "Laden",
  "chat.url.loading":
    "Lädt…",
  "chat.url.note":
    "Die mitgelieferten Beispiele sind kurz. Fügen Sie einen langen Artikel ein, dann hat die Verdichtung wirklich etwas zu entscheiden.",
  "chat.url.loaded":
    "Geladen:",
  "chat.edit":
    "Bearbeiten, was gesendet wird",
  "chat.hide":
    "Text ausblenden",
  "chat.chars":
    "Zeichen",
  "chat.model":
    "Modell",
  "chat.ratio":
    "Zielquote",
  "chat.note":
    "Beide Spalten treffen dasselbe Modell mit derselben Frage. Nur das Referenzmaterial unterscheidet sich, jeder Unterschied in den Antworten ist also die Verdichtung und sonst nichts.",
  "chat.preview":
    "Bei dieser Einstellung",
  "chat.preview.cut":
    "eingespart",
  "chat.preview.confidence":
    "Vertrauen",
  "chat.preview.escalate":
    "Der Wächter würde diesen Lauf melden, bevor Sie ihn lesen. Erhöhen Sie die Quote.",
  "chat.tokens":
    "Token",
  "chat.tokIn":
    "Token rein",
  "chat.empty":
    "Fragen Sie, was Sie wollen. Das Referenzmaterial hat Vorrang, wenn es die Antwort enthält; wenn nicht, sagt das Modell es und antwortet trotzdem.",
  "chat.placeholder":
    "Eine Frage stellen…",
  "chat.ask":
    "Beide fragen",
  "chat.asking":
    "Frage läuft…",
  "chat.full":
    "Ganzer Kontext",
  "chat.compressed":
    "Von Kernly verdichtet",
  "chat.verdict.saved":
    "weniger abgerechnete Prompt-Token",
  "chat.verdict.share.a":
    "Die Antworten teilen",
  "chat.verdict.share.b":
    "ihrer Inhaltswörter — eine Wortprüfung, kein Urteil über Richtigkeit. Lesen Sie beide.",
  "chat.verdict.drift":
    "Beachtenswert: Der ganze Kontext antwortete aus dem Dokument, der verdichtete aus dem eigenen Wissen des Modells. Das ist die Verdichtung, die die Antwort verliert, auch wenn beide gleich klingen.",
  "chat.outside":
    "Nicht aus dem Referenzmaterial",
  "chat.noreply":
    "Keine Antwort.",
  "chat.coverage":
    "der seltenen Begriffe der Frage überlebten",
  "chat.ownCount":
    "nach Kernlys eigener Zählung",
  "chat.escalated":
    "Das Vertrauen fiel bei diesem Lauf unter die Schwelle. Kernly kennzeichnet die verdichtete Antwort als unzuverlässig, bevor Sie sie lesen — erhöhen Sie die Quote oder senden Sie das Original.",

  "page.chat.title":
    "Chat",
  "page.chat.lede":
    "Kernly ist kein Modell. Es ist die Schicht, die entscheidet, was ein Modell zu lesen bekommt. Ihre Frage geht zweimal an dasselbe Modell — einmal mit dem ganzen Dokument, einmal mit der verdichteten Fassung — und beide Antworten landen hier nebeneinander. Laden Sie eine eigene lange Seite, falls die Beispiele zu bequem wirken. Das Modell ist nicht auf das Referenzmaterial eingezäunt: Steht die Antwort nicht darin, sagt es das und antwortet trotzdem.",
  "page.playground.title":
    "Testfeld",
  "page.playground.lede":
    "Alles hier unten läuft lokal. Der Text verlässt den Tab nie, es geht keine Anfrage an irgendein Modell, und die Zeit im Beleg ist der echte Aufwand der Pipeline auf diesem Gerät.",
  "page.verify.title":
    "Einen Beleg prüfen",
  "page.verify.lede":
    "Fügen Sie eine Devnet-Transaktionssignatur und den ursprünglichen Kontext ein. Diese Seite holt den Nachweis von der Kette, lässt die Pipeline lokal erneut laufen und vergleicht die beiden Prüfsummen. Stimmen sie überein, hielt die Einsparungsbehauptung; sonst wurde nachträglich etwas geändert. An keiner der beiden Hälften dieser Prüfung ist ein Kernly-Server beteiligt.",

  "chat.verdict.didNotFit":
    "Die unverdichtete Anfrage passte nicht.",
  "chat.verdict.didNotFit.note":
    "Der Anbieter wies sie ab, bevor er ein Wort gelesen hatte. Die verdichtete ging durch und antwortete.",

  "chat.ceiling.only":
    "Unverdichtet zu groß für das Minutenbudget der Gratisstufe dieses Modells — nur die verdichtete Spalte kommt durch. Genau das ist die Demonstration. Wählen Sie ein Gemini-Modell, um beide zu sehen.",
  "chat.ceiling.neither":
    "Auch verdichtet zu groß für das Minutenbudget der Gratisstufe dieses Modells. Senken Sie die Quote oder wählen Sie ein Gemini-Modell.",

  "chat.fitted.a":
    "Diese Seite übersteigt das Minutenbudget der Gratisstufe des Modells, daher wurde die Quote verschärft auf",
  "chat.fitted.b":
    "was klein genug zum Senden ist. Das ist die Verdichtung bei der Arbeit, nicht die Demo auf der Flucht zu einem großzügigeren Anbieter. Achten Sie auf den Wächter: ab einem Punkt warnt er, ab einem weiteren ist die Antwort falsch.",

  "chat.fellback":
    "hatte kein Kontingent mehr, geantwortet hat daher",

  "chat.demo.title":
    "Sehen Sie es arbeiten",
  "chat.demo.note":
    "Ein Klick lädt einen echten Artikel von 100.000 Zeichen oder mehr und stellt eine Frage, deren Antwort tief darin steckt. Zu groß, um unverdichtet auf der Gratisstufe zu gehen.",

  "chat.nothing.title":
    "Hier wurde nichts gemessen.",
  "chat.nothing.body":
    "Beide Spalten antworteten aus dem eigenen Wissen des Modells, weil im Referenzmaterial dazu nichts stand. Da spricht das Modell, nicht die Verdichtung — die Spalten werden übereinstimmen, was die Verdichtung auch tut. Laden Sie oben einen Artikel und fragen Sie etwas, das darin vorkommt.",

  "chat.nothing.cta":
    "Eine nehmen, die es zeigt",
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

  "chat.material":
    "Materiale di riferimento",
  "chat.url.title":
    "Carica una pagina",
  "chat.url.load":
    "Carica",
  "chat.url.loading":
    "Caricamento…",
  "chat.url.note":
    "Gli esempi inclusi sono brevi. Incolla un articolo lungo e il compressore avrà davvero qualcosa da decidere.",
  "chat.url.loaded":
    "Caricato:",
  "chat.edit":
    "Modifica ciò che viene inviato",
  "chat.hide":
    "Nascondi il testo",
  "chat.chars":
    "caratteri",
  "chat.model":
    "Modello",
  "chat.ratio":
    "Rapporto obiettivo",
  "chat.note":
    "Le due colonne colpiscono lo stesso modello con la stessa domanda. Cambia solo il materiale di riferimento, quindi ogni scarto fra le risposte è la compressione e nient’altro.",
  "chat.preview":
    "Con questa impostazione",
  "chat.preview.cut":
    "tagliato",
  "chat.preview.confidence":
    "fiducia",
  "chat.preview.escalate":
    "Il varco segnalerebbe questa esecuzione prima che tu la legga. Alza il rapporto.",
  "chat.tokens":
    "token",
  "chat.tokIn":
    "token in",
  "chat.empty":
    "Chiedi qualunque cosa. Il materiale di riferimento ha la precedenza quando risponde; quando non risponde, il modello lo dice e risponde comunque.",
  "chat.placeholder":
    "Fai una domanda…",
  "chat.ask":
    "Chiedi a entrambi",
  "chat.asking":
    "In corso…",
  "chat.full":
    "Contesto intero",
  "chat.compressed":
    "Compresso da Kernly",
  "chat.verdict.saved":
    "token di prompt fatturati in meno",
  "chat.verdict.share.a":
    "Le risposte condividono",
  "chat.verdict.share.b":
    "delle loro parole di contenuto — un controllo lessicale, non un giudizio di correttezza. Leggile entrambe.",
  "chat.verdict.drift":
    "Da notare: il contesto intero ha risposto dal documento, quello compresso dalle conoscenze proprie del modello. È la compressione che perde la risposta, anche quando le due si leggono uguali.",
  "chat.outside":
    "Non viene dal materiale di riferimento",
  "chat.noreply":
    "Nessuna risposta.",
  "chat.coverage":
    "dei termini rari della domanda sono sopravvissuti",
  "chat.ownCount":
    "secondo il conteggio di Kernly",
  "chat.escalated":
    "La fiducia è scesa sotto la soglia in questa esecuzione. Kernly segnala la risposta compressa come inaffidabile prima che tu la legga: alza il rapporto o manda l’originale.",

  "page.chat.title":
    "Chat",
  "page.chat.lede":
    "Kernly non è un modello. È lo strato che decide cosa un modello arriva a leggere. La tua domanda va allo stesso modello due volte — una col documento intero, una con la versione compressa — e le due risposte compaiono qui affiancate. Carica una pagina lunga tua se gli esempi ti sembrano troppo comodi. Il modello non è recintato nel materiale di riferimento: quando la risposta non c’è, lo dice e risponde lo stesso.",
  "page.playground.title":
    "Banco di prova",
  "page.playground.lede":
    "Tutto qui sotto gira in locale. Il testo non lascia mai la scheda, non parte nessuna richiesta verso alcun modello, e il tempo nella ricevuta è il costo reale della catena su questo dispositivo.",
  "page.verify.title":
    "Controllare una ricevuta",
  "page.verify.lede":
    "Incolla una firma di transazione devnet e il contesto originale. Questa pagina recupera l’attestazione dalla catena, riesegue la catena in locale e confronta le due impronte. Se coincidono, l’affermazione sul risparmio reggeva; altrimenti qualcosa è stato cambiato dopo. Nessun server Kernly entra in nessuna delle due metà di questo controllo.",

  "chat.verdict.didNotFit":
    "La richiesta non compressa non ci stava.",
  "chat.verdict.didNotFit.note":
    "Il fornitore l’ha rifiutata prima di leggerne una parola. Quella compressa è passata e ha risposto.",

  "chat.ceiling.only":
    "Troppo grande non compresso per il budget al minuto del piano gratuito di questo modello: passerà solo la colonna compressa. È proprio questa la dimostrazione. Scegli un modello Gemini per vederle entrambe.",
  "chat.ceiling.neither":
    "Troppo grande per il budget al minuto del piano gratuito di questo modello anche compresso. Abbassa il rapporto o scegli un modello Gemini.",

  "chat.fitted.a":
    "Questa pagina supera il budget al minuto del piano gratuito del modello, quindi il rapporto è stato stretto a",
  "chat.fitted.b":
    "che ci sta. È il compressore che fa il suo lavoro, non la demo che scappa da un fornitore più largo. Guarda il varco: oltre un punto avverte, oltre un altro la risposta è falsa.",

  "chat.fellback":
    "non aveva più quota, quindi ha risposto",

  "chat.demo.title":
    "Guardalo all’opera",
  "chat.demo.note":
    "Un clic carica un articolo vero da 100.000 caratteri o più e pone una domanda la cui risposta sta sepolta dentro. Troppo grande da inviare non compresso sul piano gratuito.",

  "chat.nothing.title":
    "Qui non è stato misurato nulla.",
  "chat.nothing.body":
    "Entrambe le colonne hanno risposto dalla conoscenza del modello, perché il materiale di riferimento non ne parlava. È il modello a parlare, non il compressore: le due colonne concorderanno qualunque cosa faccia la compressione. Carica un articolo sopra e chiedi qualcosa che tratti davvero.",

  "chat.nothing.cta":
    "Provane una che lo dimostri",
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

  "chat.material":
    "Referentiemateriaal",
  "chat.url.title":
    "Een pagina laden",
  "chat.url.load":
    "Laden",
  "chat.url.loading":
    "Laden…",
  "chat.url.note":
    "De meegeleverde voorbeelden zijn kort. Plak een lang artikel en de compressie heeft eindelijk iets te kiezen.",
  "chat.url.loaded":
    "Geladen:",
  "chat.edit":
    "Bewerk wat verstuurd wordt",
  "chat.hide":
    "Verberg de tekst",
  "chat.chars":
    "tekens",
  "chat.model":
    "Model",
  "chat.ratio":
    "Streefverhouding",
  "chat.note":
    "Beide kolommen gaan naar hetzelfde model met dezelfde vraag. Alleen het referentiemateriaal verschilt, dus elk verschil tussen de antwoorden is de compressie en niets anders.",
  "chat.preview":
    "Bij deze stand",
  "chat.preview.cut":
    "weggesneden",
  "chat.preview.confidence":
    "vertrouwen",
  "chat.preview.escalate":
    "De poort zou deze run melden voordat je hem leest. Zet de verhouding hoger.",
  "chat.tokens":
    "tokens",
  "chat.tokIn":
    "tok in",
  "chat.empty":
    "Vraag wat je wilt. Het referentiemateriaal gaat voor als het antwoord erin staat; zo niet, dan zegt het model dat en antwoordt alsnog.",
  "chat.placeholder":
    "Stel een vraag…",
  "chat.ask":
    "Vraag het beide",
  "chat.asking":
    "Bezig…",
  "chat.full":
    "Hele context",
  "chat.compressed":
    "Door Kernly gecomprimeerd",
  "chat.verdict.saved":
    "minder gefactureerde prompttokens",
  "chat.verdict.share.a":
    "De antwoorden delen",
  "chat.verdict.share.b":
    "van hun inhoudswoorden — een woordcontrole, geen oordeel over juistheid. Lees ze allebei.",
  "chat.verdict.drift":
    "Het opvallen waard: de hele context antwoordde uit het document, de gecomprimeerde uit de eigen kennis van het model. Dat is de compressie die het antwoord kwijtraakt, ook als beide gelijk lezen.",
  "chat.outside":
    "Niet uit het referentiemateriaal",
  "chat.noreply":
    "Geen antwoord.",
  "chat.coverage":
    "van de zeldzame woorden uit de vraag overleefden",
  "chat.ownCount":
    "volgens Kernly’s eigen telling",
  "chat.escalated":
    "Het vertrouwen zakte deze run onder de drempel. Kernly markeert het gecomprimeerde antwoord als onbetrouwbaar voordat je het leest — zet de verhouding hoger of stuur het origineel.",

  "page.chat.title":
    "Gesprek",
  "page.chat.lede":
    "Kernly is geen model. Het is de laag die bepaalt wat een model te lezen krijgt. Je vraag gaat twee keer naar hetzelfde model — één keer met het hele document, één keer met de gecomprimeerde versie — en beide antwoorden komen hier naast elkaar te staan. Laad een eigen lange pagina als de voorbeelden te gemakkelijk lijken. Het model zit niet opgesloten in het referentiemateriaal: staat het antwoord er niet in, dan zegt het dat en antwoordt alsnog.",
  "page.playground.title":
    "Proeftuin",
  "page.playground.lede":
    "Alles hieronder draait lokaal. De tekst verlaat het tabblad nooit, er gaat geen verzoek naar welk model dan ook, en de tijd op het bewijs is de echte kostprijs van de pijplijn op dit apparaat.",
  "page.verify.title":
    "Een bewijs controleren",
  "page.verify.lede":
    "Plak een devnet-transactiehandtekening en de oorspronkelijke context. Deze pagina haalt de attestatie van de keten, draait de pijplijn hier opnieuw en vergelijkt de twee vingerafdrukken. Komen ze overeen, dan hield de besparingsclaim stand; zo niet, dan is er achteraf iets veranderd. Aan geen van beide helften van die controle komt een Kernly-server te pas.",

  "chat.verdict.didNotFit":
    "Het ongecomprimeerde verzoek paste niet.",
  "chat.verdict.didNotFit.note":
    "De aanbieder weigerde het voordat er een woord gelezen was. Het gecomprimeerde kwam erdoor en antwoordde.",

  "chat.ceiling.only":
    "Ongecomprimeerd te groot voor het minuutbudget van de gratis laag van dit model — alleen de gecomprimeerde kolom komt erdoor. Dat is precies de demonstratie. Kies een Gemini-model om beide te zien.",
  "chat.ceiling.neither":
    "Zelfs gecomprimeerd te groot voor het minuutbudget van de gratis laag van dit model. Verlaag de verhouding of kies een Gemini-model.",

  "chat.fitted.a":
    "Deze pagina gaat over het minuutbudget van de gratis laag van dit model heen, dus is de verhouding aangescherpt naar",
  "chat.fitted.b":
    "wat wel past. Dat is de compressie die haar werk doet, niet de demo die uitwijkt naar een ruimere aanbieder. Let op de poort: voorbij een punt waarschuwt hij, voorbij een volgend punt klopt het antwoord niet.",

  "chat.fellback":
    "had geen quotum meer, dus dit is beantwoord door",

  "chat.demo.title":
    "Zie het werken",
  "chat.demo.note":
    "Eén klik laadt een echt artikel van 100.000 tekens of meer en stelt een vraag waarvan het antwoord er diep in zit. Te groot om ongecomprimeerd te versturen op de gratis laag.",

  "chat.nothing.title":
    "Hier is niets gemeten.",
  "chat.nothing.body":
    "Beide kolommen antwoordden uit de eigen kennis van het model, want het referentiemateriaal zei hier niets over. Dat is het model, niet de compressie — de kolommen zullen het eens zijn wat de compressie ook doet. Laad hierboven een artikel en vraag iets wat het echt behandelt.",

  "chat.nothing.cta":
    "Probeer er een die dat wel doet",
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

  "chat.material":
    "Materiał źródłowy",
  "chat.url.title":
    "Wczytaj stronę",
  "chat.url.load":
    "Wczytaj",
  "chat.url.loading":
    "Wczytywanie…",
  "chat.url.note":
    "Wbudowane przykłady są krótkie. Wklej długi artykuł, a kompresor będzie miał co naprawdę rozstrzygać.",
  "chat.url.loaded":
    "Wczytano:",
  "chat.edit":
    "Edytuj to, co jest wysyłane",
  "chat.hide":
    "Ukryj tekst",
  "chat.chars":
    "znaków",
  "chat.model":
    "Model",
  "chat.ratio":
    "Docelowy stopień",
  "chat.note":
    "Obie kolumny trafiają w ten sam model z tym samym pytaniem. Różni się tylko materiał źródłowy, więc każda rozbieżność odpowiedzi to kompresja i nic więcej.",
  "chat.preview":
    "Przy tym ustawieniu",
  "chat.preview.cut":
    "ucięte",
  "chat.preview.confidence":
    "pewność",
  "chat.preview.escalate":
    "Bramka oznaczyłaby ten przebieg, zanim go przeczytasz. Podnieś stopień.",
  "chat.tokens":
    "tokenów",
  "chat.tokIn":
    "tok. wejścia",
  "chat.empty":
    "Pytaj o cokolwiek. Materiał źródłowy ma pierwszeństwo, gdy zawiera odpowiedź; gdy nie zawiera, model mówi o tym i odpowiada mimo to.",
  "chat.placeholder":
    "Zadaj pytanie…",
  "chat.ask":
    "Zapytaj obu",
  "chat.asking":
    "Pytam…",
  "chat.full":
    "Pełny kontekst",
  "chat.compressed":
    "Skompresowane przez Kernly",
  "chat.verdict.saved":
    "mniej rozliczonych tokenów promptu",
  "chat.verdict.share.a":
    "Odpowiedzi dzielą",
  "chat.verdict.share.b":
    "swoich słów treściowych — to sprawdzenie na poziomie słów, nie ocena poprawności. Przeczytaj obie.",
  "chat.verdict.drift":
    "Warto zauważyć: pełny kontekst odpowiedział z dokumentu, a skompresowany z własnej wiedzy modelu. To kompresja gubiąca odpowiedź, nawet gdy obie brzmią podobnie.",
  "chat.outside":
    "Nie z materiału źródłowego",
  "chat.noreply":
    "Brak odpowiedzi.",
  "chat.coverage":
    "rzadkich słów pytania przetrwało",
  "chat.ownCount":
    "według własnego liczenia Kernly",
  "chat.escalated":
    "Pewność spadła w tym przebiegu poniżej progu. Kernly oznacza skompresowaną odpowiedź jako niegodną zaufania, zanim ją przeczytasz — podnieś stopień albo wyślij oryginał.",

  "page.chat.title":
    "Rozmowa",
  "page.chat.lede":
    "Kernly nie jest modelem. To warstwa, która decyduje, co model dostaje do czytania. Twoje pytanie trafia do tego samego modelu dwa razy — raz z całym dokumentem, raz z wersją skompresowaną — a obie odpowiedzi lądują tu obok siebie. Wczytaj własną długą stronę, jeśli przykłady wyglądają zbyt wygodnie. Model nie jest zamknięty w materiale źródłowym: gdy odpowiedzi tam nie ma, mówi o tym i odpowiada mimo to.",
  "page.playground.title":
    "Warsztat",
  "page.playground.lede":
    "Wszystko poniżej działa lokalnie. Tekst nigdy nie opuszcza karty, nie idzie żadne zapytanie do jakiegokolwiek modelu, a czas na pokwitowaniu to rzeczywisty koszt potoku na tym urządzeniu.",
  "page.verify.title":
    "Sprawdzić pokwitowanie",
  "page.verify.lede":
    "Wklej podpis transakcji z devnetu i pierwotny kontekst. Ta strona pobiera poświadczenie z łańcucha, uruchamia potok ponownie u siebie i porównuje oba skróty. Jeśli się zgadzają, deklaracja oszczędności się broni; jeśli nie, coś zmieniono po fakcie. W żadnej z połówek tego sprawdzenia nie uczestniczy serwer Kernly.",

  "chat.verdict.didNotFit":
    "Nieskompresowane żądanie się nie zmieściło.",
  "chat.verdict.didNotFit.note":
    "Dostawca odrzucił je, zanim przeczytał choć słowo. Skompresowane przeszło i odpowiedziało.",

  "chat.ceiling.only":
    "Nieskompresowane jest za duże na minutowy budżet darmowego progu tego modelu — przejdzie tylko kolumna skompresowana. I właśnie to jest dowód. Wybierz model Gemini, aby zobaczyć obie.",
  "chat.ceiling.neither":
    "Za duże na minutowy budżet darmowego progu tego modelu nawet po kompresji. Obniż stopień albo wybierz model Gemini.",

  "chat.fitted.a":
    "Ta strona przekracza minutowy budżet darmowego progu modelu, więc stopień zacieśniono do",
  "chat.fitted.b":
    "co już się mieści. To kompresor wykonuje swoją pracę, a nie demo uciekające do dostawcy z większym limitem. Patrz na bramkę: za pewnym punktem ostrzega, a za kolejnym odpowiedź jest zmyślona.",

  "chat.fellback":
    "wyczerpał limit, więc odpowiedzi udzielił",

  "chat.demo.title":
    "Zobacz, jak działa",
  "chat.demo.note":
    "Jedno kliknięcie wczytuje prawdziwy artykuł na 100 000 znaków lub więcej i zadaje pytanie, którego odpowiedź tkwi głęboko w środku. Za duży, by wysłać go nieskompresowanego na darmowym progu.",

  "chat.nothing.title":
    "Tu niczego nie zmierzono.",
  "chat.nothing.body":
    "Obie kolumny odpowiedziały z własnej wiedzy modelu, bo materiał źródłowy nic o tym nie mówił. To mówi model, nie kompresor — kolumny będą zgodne cokolwiek zrobi kompresja. Wczytaj artykuł powyżej i zapytaj o coś, co faktycznie omawia.",

  "chat.nothing.cta":
    "Spróbuj takiego, który to pokaże",
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

  "chat.material":
    "Справочный материал",
  "chat.url.title":
    "Загрузить страницу",
  "chat.url.load":
    "Загрузить",
  "chat.url.loading":
    "Загрузка…",
  "chat.url.note":
    "Встроенные образцы коротки. Вставьте длинную статью — и сжатию будет что решать по-настоящему.",
  "chat.url.loaded":
    "Загружено:",
  "chat.edit":
    "Изменить то, что отправляется",
  "chat.hide":
    "Скрыть текст",
  "chat.chars":
    "символов",
  "chat.model":
    "Модель",
  "chat.ratio":
    "Целевая доля",
  "chat.note":
    "Обе колонки бьют в одну модель одним вопросом. Различается только справочный материал, поэтому любой разрыв в ответах — это сжатие и ничто иное.",
  "chat.preview":
    "При этой настройке",
  "chat.preview.cut":
    "срезано",
  "chat.preview.confidence":
    "уверенность",
  "chat.preview.escalate":
    "Затвор пометил бы этот прогон ещё до того, как вы его прочтёте. Поднимите долю.",
  "chat.tokens":
    "токенов",
  "chat.tokIn":
    "токенов на входе",
  "chat.empty":
    "Спрашивайте о чём угодно. Справочный материал в приоритете, когда содержит ответ; когда не содержит, модель говорит об этом и всё равно отвечает.",
  "chat.placeholder":
    "Задайте вопрос…",
  "chat.ask":
    "Спросить обоих",
  "chat.asking":
    "Спрашиваю…",
  "chat.full":
    "Полный контекст",
  "chat.compressed":
    "Сжато Kernly",
  "chat.verdict.saved":
    "меньше оплаченных токенов запроса",
  "chat.verdict.share.a":
    "Ответы разделяют",
  "chat.verdict.share.b":
    "своих значимых слов — проверка по словам, а не суждение о правильности. Прочтите оба.",
  "chat.verdict.drift":
    "Стоит заметить: полный контекст ответил из документа, а сжатый — из собственных знаний модели. Это сжатие потеряло ответ, даже если оба ответа читаются одинаково.",
  "chat.outside":
    "Не из справочного материала",
  "chat.noreply":
    "Ответа нет.",
  "chat.coverage":
    "редких слов вопроса уцелело",
  "chat.ownCount":
    "по собственному счёту Kernly",
  "chat.escalated":
    "Уверенность на этом прогоне упала ниже порога. Kernly помечает сжатый ответ как ненадёжный до того, как вы его прочтёте: поднимите долю или отправьте оригинал.",

  "page.chat.title":
    "Чат",
  "page.chat.lede":
    "Kernly — не модель. Это слой, который решает, что модель получит на чтение. Ваш вопрос уходит к одной и той же модели дважды: с целым документом и со сжатой версией, и оба ответа ложатся здесь рядом. Загрузите свою длинную страницу, если образцы кажутся слишком удобными. Модель не заперта в справочном материале: когда ответа там нет, она говорит об этом и всё равно отвечает.",
  "page.playground.title":
    "Песочница",
  "page.playground.lede":
    "Всё, что ниже, работает локально. Текст не покидает вкладку, ни к какой модели запрос не уходит, а время в расписке — это настоящая цена конвейера на этом устройстве.",
  "page.verify.title":
    "Проверить расписку",
  "page.verify.lede":
    "Вставьте подпись транзакции devnet и исходный контекст. Страница достаёт свидетельство из цепочки, заново прогоняет конвейер локально и сравнивает две свёртки. Совпали — заявление об экономии устояло; нет — что-то поменяли задним числом. Ни в одной половине этой проверки сервер Kernly не участвует.",

  "chat.verdict.didNotFit":
    "Несжатый запрос не поместился.",
  "chat.verdict.didNotFit.note":
    "Провайдер отклонил его, не прочитав ни слова. Сжатый прошёл и ответил.",

  "chat.ceiling.only":
    "В несжатом виде это больше минутного лимита бесплатного тарифа для этой модели — пройдёт только сжатая колонка. В этом и состоит доказательство. Выберите модель Gemini, чтобы увидеть обе.",
  "chat.ceiling.neither":
    "Больше минутного лимита бесплатного тарифа этой модели даже в сжатом виде. Снизьте долю или выберите модель Gemini.",

  "chat.fitted.a":
    "Эта страница превышает минутный лимит бесплатного тарифа модели, поэтому доля ужата до",
  "chat.fitted.b":
    "что уже проходит. Это сжатие делает свою работу, а не демонстрация убегает к провайдеру с лимитом побольше. Следите за затвором: за одной чертой он предупреждает, за другой ответ оказывается выдуманным.",

  "chat.fellback":
    "исчерпала квоту, поэтому ответила",

  "chat.demo.title":
    "Посмотрите в деле",
  "chat.demo.note":
    "Один щелчок загружает настоящую статью на 100 000 знаков и больше и задаёт вопрос, ответ на который спрятан в её глубине. Слишком велика, чтобы уйти несжатой на бесплатном тарифе.",

  "chat.nothing.title":
    "Здесь ничего не измерено.",
  "chat.nothing.body":
    "Обе колонки ответили из собственных знаний модели, потому что в справочном материале об этом не было ничего. Говорит модель, а не сжатие: колонки совпадут, что бы сжатие ни делало. Загрузите статью выше и спросите о том, что в ней действительно есть.",

  "chat.nothing.cta":
    "Попробуйте тот, где видно",
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

  "chat.material":
    "Довідковий матеріал",
  "chat.url.title":
    "Завантажити сторінку",
  "chat.url.load":
    "Завантажити",
  "chat.url.loading":
    "Завантаження…",
  "chat.url.note":
    "Вбудовані зразки короткі. Вставте довгу статтю — і стисненню буде що справді вирішувати.",
  "chat.url.loaded":
    "Завантажено:",
  "chat.edit":
    "Змінити те, що надсилається",
  "chat.hide":
    "Сховати текст",
  "chat.chars":
    "символів",
  "chat.model":
    "Модель",
  "chat.ratio":
    "Цільова частка",
  "chat.note":
    "Обидві колонки б’ють в одну модель одним питанням. Різниться лише довідковий матеріал, тож будь-який розрив у відповідях — це стиснення і ніщо інше.",
  "chat.preview":
    "За цього налаштування",
  "chat.preview.cut":
    "зрізано",
  "chat.preview.confidence":
    "впевненість",
  "chat.preview.escalate":
    "Затвор позначив би цей прогін ще до того, як ви його прочитаєте. Підніміть частку.",
  "chat.tokens":
    "токенів",
  "chat.tokIn":
    "токенів на вході",
  "chat.empty":
    "Питайте про що завгодно. Довідковий матеріал у пріоритеті, коли містить відповідь; коли ні — модель це каже й усе одно відповідає.",
  "chat.placeholder":
    "Поставте питання…",
  "chat.ask":
    "Спитати обох",
  "chat.asking":
    "Питаю…",
  "chat.full":
    "Повний контекст",
  "chat.compressed":
    "Стиснуто Kernly",
  "chat.verdict.saved":
    "менше оплачених токенів запиту",
  "chat.verdict.share.a":
    "Відповіді поділяють",
  "chat.verdict.share.b":
    "своїх значущих слів — перевірка за словами, а не судження про правильність. Прочитайте обидві.",
  "chat.verdict.drift":
    "Варто помітити: повний контекст відповів із документа, а стиснутий — із власних знань моделі. Це стиснення втратило відповідь, навіть якщо обидві читаються однаково.",
  "chat.outside":
    "Не з довідкового матеріалу",
  "chat.noreply":
    "Відповіді немає.",
  "chat.coverage":
    "рідкісних слів питання вціліло",
  "chat.ownCount":
    "за власним підрахунком Kernly",
  "chat.escalated":
    "Впевненість на цьому прогоні впала нижче порога. Kernly позначає стиснуту відповідь як ненадійну, перш ніж ви її прочитаєте: підніміть частку або надішліть оригінал.",

  "page.chat.title":
    "Чат",
  "page.chat.lede":
    "Kernly — не модель. Це шар, який вирішує, що модель отримає на читання. Ваше питання йде до тієї самої моделі двічі: з цілим документом і зі стиснутою версією, і обидві відповіді лягають тут поруч. Завантажте власну довгу сторінку, якщо зразки видаються надто зручними. Модель не замкнена в довідковому матеріалі: коли відповіді там немає, вона це каже й усе одно відповідає.",
  "page.playground.title":
    "Пісочниця",
  "page.playground.lede":
    "Усе, що нижче, працює локально. Текст не покидає вкладку, до жодної моделі запит не йде, а час у квитанції — це справжня ціна конвеєра на цьому пристрої.",
  "page.verify.title":
    "Перевірити квитанцію",
  "page.verify.lede":
    "Вставте підпис транзакції devnet і початковий контекст. Сторінка дістає засвідчення з ланцюга, наново проганяє конвеєр локально й порівнює дві згортки. Збіглися — заява про заощадження встояла; ні — щось змінили заднім числом. У жодній половині цієї перевірки сервер Kernly не бере участі.",

  "chat.verdict.didNotFit":
    "Нестиснутий запит не вмістився.",
  "chat.verdict.didNotFit.note":
    "Постачальник відхилив його, не прочитавши й слова. Стиснутий пройшов і відповів.",

  "chat.ceiling.only":
    "У нестиснутому вигляді це більше за хвилинний ліміт безкоштовного тарифу цієї моделі — пройде лише стиснута колонка. У цьому й полягає доказ. Оберіть модель Gemini, щоб побачити обидві.",
  "chat.ceiling.neither":
    "Більше за хвилинний ліміт безкоштовного тарифу цієї моделі навіть у стиснутому вигляді. Знизьте частку або оберіть модель Gemini.",

  "chat.fitted.a":
    "Ця сторінка перевищує хвилинний ліміт безкоштовного тарифу моделі, тож частку стиснуто до",
  "chat.fitted.b":
    "що вже проходить. Це стиснення робить свою роботу, а не демонстрація тікає до постачальника з більшим лімітом. Стежте за затвором: за однією межею він попереджає, за іншою відповідь виявляється вигаданою.",

  "chat.fellback":
    "вичерпала квоту, тому відповіла",

  "chat.demo.title":
    "Погляньте в дії",
  "chat.demo.note":
    "Один клац завантажує справжню статтю на 100 000 знаків і більше та ставить питання, відповідь на яке заховано в її глибині. Завелика, щоб піти нестиснутою на безкоштовному тарифі.",

  "chat.nothing.title":
    "Тут нічого не виміряно.",
  "chat.nothing.body":
    "Обидві колонки відповіли з власних знань моделі, бо в довідковому матеріалі про це не було нічого. Говорить модель, а не стиснення: колонки збігатимуться, хоч би що стиснення робило. Завантажте статтю вище й запитайте про те, що в ній справді є.",

  "chat.nothing.cta":
    "Спробуйте той, де видно",
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

  "chat.material":
    "Kaynak metin",
  "chat.url.title":
    "Bir sayfa yükle",
  "chat.url.load":
    "Yükle",
  "chat.url.loading":
    "Yükleniyor…",
  "chat.url.note":
    "Yerleşik örnekler kısa. Uzun bir yazı yapıştırın; sıkıştırıcının gerçekten karar vereceği bir şey olsun.",
  "chat.url.loaded":
    "Yüklendi:",
  "chat.edit":
    "Gönderileni düzenle",
  "chat.hide":
    "Metni gizle",
  "chat.chars":
    "karakter",
  "chat.model":
    "Model",
  "chat.ratio":
    "Hedef oran",
  "chat.note":
    "İki sütun da aynı modele aynı soruyu soruyor. Yalnızca kaynak metin değişiyor, dolayısıyla yanıtlar arasındaki her fark sıkıştırmadan gelir, başka bir şeyden değil.",
  "chat.preview":
    "Bu ayarda",
  "chat.preview.cut":
    "kırpıldı",
  "chat.preview.confidence":
    "güven",
  "chat.preview.escalate":
    "Kapı bu çalıştırmayı siz okumadan işaretlerdi. Oranı yükseltin.",
  "chat.tokens":
    "jeton",
  "chat.tokIn":
    "girdi jetonu",
  "chat.empty":
    "Ne isterseniz sorun. Yanıtı içerdiğinde kaynak metin önceliklidir; içermediğinde model bunu söyler ve yine de yanıtlar.",
  "chat.placeholder":
    "Bir soru sorun…",
  "chat.ask":
    "İkisine de sor",
  "chat.asking":
    "Soruluyor…",
  "chat.full":
    "Tam bağlam",
  "chat.compressed":
    "Kernly ile sıkıştırılmış",
  "chat.verdict.saved":
    "daha az faturalanan istem jetonu",
  "chat.verdict.share.a":
    "Yanıtlar içerik sözcüklerinin",
  "chat.verdict.share.b":
    "kadarını paylaşıyor — sözcük düzeyinde bir denetim, doğruluk yargısı değil. İkisini de okuyun.",
  "chat.verdict.drift":
    "Dikkate değer: tam bağlam belgeden yanıtladı, sıkıştırılmış olan modelin kendi bilgisinden. Bu, iki yanıt birbirine benzese bile sıkıştırmanın cevabı yitirmesidir.",
  "chat.outside":
    "Kaynak metinden gelmiyor",
  "chat.noreply":
    "Yanıt yok.",
  "chat.coverage":
    "sorunun seyrek terimlerinden sağ kalan",
  "chat.ownCount":
    "Kernly’nin kendi sayımına göre",
  "chat.escalated":
    "Bu çalıştırmada güven eşiğin altına düştü. Kernly sıkıştırılmış yanıtı siz okumadan güvenilmez diye işaretliyor — oranı yükseltin ya da aslını gönderin.",

  "page.chat.title":
    "Sohbet",
  "page.chat.lede":
    "Kernly bir model değil. Bir modelin neyi okuyacağına karar veren katman. Sorunuz aynı modele iki kez gider — biri belgenin tamamıyla, biri sıkıştırılmış sürümüyle — ve iki yanıt burada yan yana durur. Örnekler fazla kolay görünüyorsa kendi uzun sayfanızı yükleyin. Model kaynak metnin içine kapatılmış değil: yanıt orada yoksa bunu söyler ve yine de yanıtlar.",
  "page.playground.title":
    "Deneme alanı",
  "page.playground.lede":
    "Aşağıdaki her şey yerelde çalışır. Metin sekmeden hiç çıkmaz, hiçbir modele istek gitmez ve makbuzdaki süre, hattın bu cihazdaki gerçek maliyetidir.",
  "page.verify.title":
    "Bir makbuzu doğrula",
  "page.verify.lede":
    "Bir devnet işlem imzasıyla özgün bağlamı yapıştırın. Bu sayfa tasdiği zincirden çeker, hattı yerelde yeniden çalıştırır ve iki özeti karşılaştırır. Tutuyorlarsa tasarruf iddiası ayakta kalmıştır; tutmuyorlarsa sonradan bir şey değiştirilmiştir. Bu denetimin iki yarısının hiçbirine Kernly sunucusu karışmaz.",

  "chat.verdict.didNotFit":
    "Sıkıştırılmamış istek sığmadı.",
  "chat.verdict.didNotFit.note":
    "Sağlayıcı tek kelime okumadan geri çevirdi. Sıkıştırılmış olan geçti ve yanıtladı.",

  "chat.ceiling.only":
    "Sıkıştırılmamış hâli bu modelin ücretsiz kademedeki dakika bütçesine sığmıyor — yalnızca sıkıştırılmış sütun geçecek. Gösterilmek istenen tam da bu. İkisini birden görmek için bir Gemini modeli seçin.",
  "chat.ceiling.neither":
    "Sıkıştırılmış hâliyle bile bu modelin ücretsiz kademedeki dakika bütçesine sığmıyor. Oranı düşürün ya da bir Gemini modeli seçin.",

  "chat.fitted.a":
    "Bu sayfa modelin ücretsiz kademedeki dakika bütçesini aşıyor, bu yüzden oran şuna sıkılaştırıldı:",
  "chat.fitted.b":
    "artık gönderilebilecek kadar küçük. Bu, sıkıştırıcının işini yapmasıdır; demonun daha bol kotalı bir sağlayıcıya kaçması değil. Kapıyı izleyin: bir noktadan sonra uyarır, bir başkasından sonra yanıt uydurmadır.",

  "chat.fellback":
    "kotası bitmişti, bu yüzden yanıtı veren:",

  "chat.demo.title":
    "İş başında görün",
  "chat.demo.note":
    "Tek tıkla 100.000 karakter ve üzeri gerçek bir makale yüklenir ve yanıtı içinde gömülü duran bir soru sorulur. Ücretsiz kademede sıkıştırılmadan gönderilemeyecek kadar büyük.",

  "chat.nothing.title":
    "Burada hiçbir şey ölçülmedi.",
  "chat.nothing.body":
    "İki sütun da modelin kendi bilgisinden yanıtladı, çünkü kaynak metinde buna dair bir şey yoktu. Konuşan model, sıkıştırıcı değil — sıkıştırma ne yaparsa yapsın iki sütun aynı diyecek. Yukarıdan bir makale yükleyin ve gerçekten içinde geçen bir şeyi sorun.",

  "chat.nothing.cta":
    "Bunu gösteren birini deneyin",
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

  "chat.material":
    "Tài liệu tham chiếu",
  "chat.url.title":
    "Nạp một trang",
  "chat.url.load":
    "Nạp",
  "chat.url.loading":
    "Đang nạp…",
  "chat.url.note":
    "Các mẫu có sẵn đều ngắn. Dán vào một bài dài thì bộ nén mới thật sự có gì để cân nhắc.",
  "chat.url.loaded":
    "Đã nạp:",
  "chat.edit":
    "Sửa phần đang gửi đi",
  "chat.hide":
    "Ẩn phần văn bản",
  "chat.chars":
    "ký tự",
  "chat.model":
    "Mô hình",
  "chat.ratio":
    "Tỉ lệ mục tiêu",
  "chat.note":
    "Hai cột cùng hỏi một mô hình với cùng một câu hỏi. Chỉ tài liệu tham chiếu là khác, nên mọi chênh lệch trong câu trả lời đều do việc nén, không do gì khác.",
  "chat.preview":
    "Ở mức này",
  "chat.preview.cut":
    "đã cắt",
  "chat.preview.confidence":
    "độ tin cậy",
  "chat.preview.escalate":
    "Cổng chặn sẽ đánh dấu lần chạy này trước khi bạn đọc. Hãy nâng tỉ lệ lên.",
  "chat.tokens":
    "token",
  "chat.tokIn":
    "token vào",
  "chat.empty":
    "Hỏi bất cứ điều gì. Tài liệu tham chiếu được ưu tiên khi nó có câu trả lời; khi không có, mô hình nói rõ rồi vẫn trả lời.",
  "chat.placeholder":
    "Đặt một câu hỏi…",
  "chat.ask":
    "Hỏi cả hai",
  "chat.asking":
    "Đang hỏi…",
  "chat.full":
    "Ngữ cảnh đầy đủ",
  "chat.compressed":
    "Kernly đã nén",
  "chat.verdict.saved":
    "token nhắc bị tính tiền ít hơn",
  "chat.verdict.share.a":
    "Hai câu trả lời dùng chung",
  "chat.verdict.share.b":
    "số từ mang nghĩa — một phép đối chiếu ở mức từ, không phải phán xét đúng sai. Hãy đọc cả hai.",
  "chat.verdict.drift":
    "Đáng để ý: ngữ cảnh đầy đủ trả lời từ tài liệu, còn bản nén trả lời từ kiến thức sẵn có của mô hình. Đó là việc nén đã đánh mất câu trả lời, dù hai câu đọc lên na ná nhau.",
  "chat.outside":
    "Không lấy từ tài liệu tham chiếu",
  "chat.noreply":
    "Không có phản hồi.",
  "chat.coverage":
    "số từ hiếm trong câu hỏi còn sót lại",
  "chat.ownCount":
    "theo cách đếm của chính Kernly",
  "chat.escalated":
    "Độ tin cậy trong lần chạy này rơi xuống dưới ngưỡng. Kernly đánh dấu câu trả lời đã nén là không đáng tin trước khi bạn đọc — hãy nâng tỉ lệ hoặc gửi bản gốc.",

  "page.chat.title":
    "Trò chuyện",
  "page.chat.lede":
    "Kernly không phải một mô hình. Nó là lớp quyết định mô hình được đọc những gì. Câu hỏi của bạn đi tới cùng một mô hình hai lần — một lần với trọn tài liệu, một lần với bản đã nén — rồi cả hai câu trả lời nằm cạnh nhau ở đây. Hãy nạp một trang dài của riêng bạn nếu các mẫu có sẵn trông quá dễ. Mô hình không bị rào trong tài liệu tham chiếu: khi câu trả lời không nằm ở đó, nó nói rõ rồi vẫn trả lời.",
  "page.playground.title":
    "Thử nghiệm",
  "page.playground.lede":
    "Mọi thứ bên dưới chạy ngay tại máy bạn. Văn bản không bao giờ rời khỏi thẻ trình duyệt, không có yêu cầu nào gửi tới bất kỳ mô hình nào, và thời gian ghi trên biên nhận là chi phí thật của quy trình trên thiết bị này.",
  "page.verify.title":
    "Kiểm chứng một biên nhận",
  "page.verify.lede":
    "Dán chữ ký giao dịch devnet cùng ngữ cảnh gốc. Trang này lấy chứng thực từ chuỗi, chạy lại quy trình ngay tại đây, rồi so hai bản tóm lược. Khớp nhau thì lời tuyên bố tiết kiệm đứng vững; không khớp thì đã có gì đó bị sửa về sau. Không có máy chủ Kernly nào dự phần vào cả hai nửa của phép kiểm đó.",

  "chat.verdict.didNotFit":
    "Yêu cầu chưa nén không vừa.",
  "chat.verdict.didNotFit.note":
    "Nhà cung cấp từ chối trước khi đọc lấy một chữ. Bản đã nén thì lọt qua và trả lời được.",

  "chat.ceiling.only":
    "Ở dạng chưa nén thì vượt hạn mức mỗi phút của gói miễn phí cho mô hình này — chỉ cột đã nén lọt qua được. Đó chính là điều cần chứng minh. Chọn một mô hình Gemini để xem cả hai.",
  "chat.ceiling.neither":
    "Vượt hạn mức mỗi phút của gói miễn phí cho mô hình này ngay cả khi đã nén. Hãy hạ tỉ lệ xuống, hoặc chọn một mô hình Gemini.",

  "chat.fitted.a":
    "Trang này vượt hạn mức mỗi phút của gói miễn phí cho mô hình, nên tỉ lệ đã siết xuống còn",
  "chat.fitted.b":
    "đủ nhỏ để gửi đi. Đó là bộ nén làm đúng việc của nó, chứ không phải bản trình diễn chạy sang nhà cung cấp rộng rãi hơn. Hãy để ý cổng chặn: quá một mức nó cảnh báo, quá mức nữa thì câu trả lời là bịa.",

  "chat.fellback":
    "đã hết hạn mức, nên câu này do mô hình sau trả lời:",

  "chat.demo.title":
    "Xem nó chạy",
  "chat.demo.note":
    "Một cú nhấp nạp một bài viết thật từ 100.000 ký tự trở lên và đặt câu hỏi có đáp án nằm sâu bên trong. Quá lớn để gửi đi khi chưa nén ở gói miễn phí.",

  "chat.nothing.title":
    "Ở đây không đo được gì cả.",
  "chat.nothing.body":
    "Cả hai cột đều trả lời từ kiến thức sẵn có của mô hình, vì tài liệu tham chiếu không có gì về chuyện này. Đó là mô hình đang nói, không phải bộ nén — hai cột sẽ giống nhau dù việc nén làm gì đi nữa. Hãy nạp một bài ở trên rồi hỏi điều mà bài đó thật sự bàn tới.",

  "chat.nothing.cta":
    "Thử một câu chứng minh được",
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

  "chat.material":
    "เอกสารอ้างอิง",
  "chat.url.title":
    "โหลดหน้าเว็บ",
  "chat.url.load":
    "โหลด",
  "chat.url.loading":
    "กำลังโหลด…",
  "chat.url.note":
    "ตัวอย่างที่ให้มานั้นสั้น ลองวางบทความยาว ๆ ดู แล้วตัวบีบอัดจะมีอะไรให้ตัดสินใจจริงจัง",
  "chat.url.loaded":
    "โหลดแล้ว:",
  "chat.edit":
    "แก้ไขสิ่งที่กำลังส่ง",
  "chat.hide":
    "ซ่อนข้อความ",
  "chat.chars":
    "อักขระ",
  "chat.model":
    "โมเดล",
  "chat.ratio":
    "สัดส่วนเป้าหมาย",
  "chat.note":
    "ทั้งสองคอลัมน์ยิงไปที่โมเดลเดียวกันด้วยคำถามเดียวกัน ต่างกันแค่เอกสารอ้างอิง ช่องว่างใดก็ตามในคำตอบจึงมาจากการบีบอัดล้วน ๆ",
  "chat.preview":
    "ที่การตั้งค่านี้",
  "chat.preview.cut":
    "ตัดออก",
  "chat.preview.confidence":
    "ความเชื่อมั่น",
  "chat.preview.escalate":
    "ประตูกันจะทำเครื่องหมายรอบนี้ก่อนที่คุณจะได้อ่าน ลองเพิ่มสัดส่วนขึ้น",
  "chat.tokens":
    "โทเคน",
  "chat.tokIn":
    "โทเคนเข้า",
  "chat.empty":
    "ถามอะไรก็ได้ เอกสารอ้างอิงจะถูกใช้ก่อนเมื่อมีคำตอบอยู่ ถ้าไม่มี โมเดลจะบอกแล้วตอบให้อยู่ดี",
  "chat.placeholder":
    "ตั้งคำถาม…",
  "chat.ask":
    "ถามทั้งสองฝั่ง",
  "chat.asking":
    "กำลังถาม…",
  "chat.full":
    "บริบทเต็ม",
  "chat.compressed":
    "Kernly บีบอัดแล้ว",
  "chat.verdict.saved":
    "โทเคนพรอมต์ที่ถูกเรียกเก็บน้อยลง",
  "chat.verdict.share.a":
    "คำตอบทั้งสองใช้คำเนื้อหาร่วมกัน",
  "chat.verdict.share.b":
    "เป็นการตรวจระดับคำ ไม่ใช่การตัดสินว่าถูกหรือผิด อ่านทั้งสองเถอะ",
  "chat.verdict.drift":
    "น่าสังเกต: บริบทเต็มตอบจากเอกสาร ส่วนฉบับบีบอัดตอบจากความรู้เดิมของโมเดลเอง นั่นคือการบีบอัดทำคำตอบหาย ถึงแม้ทั้งสองจะอ่านคล้ายกัน",
  "chat.outside":
    "ไม่ได้มาจากเอกสารอ้างอิง",
  "chat.noreply":
    "ไม่มีคำตอบ",
  "chat.coverage":
    "ของคำหายากในคำถามที่รอดมาได้",
  "chat.ownCount":
    "ตามการนับของ Kernly เอง",
  "chat.escalated":
    "ความเชื่อมั่นในรอบนี้ตกต่ำกว่าเกณฑ์ Kernly กำลังทำเครื่องหมายว่าคำตอบที่บีบอัดไม่น่าเชื่อถือก่อนที่คุณจะอ่าน — เพิ่มสัดส่วนหรือส่งต้นฉบับไป",

  "page.chat.title":
    "สนทนา",
  "page.chat.lede":
    "Kernly ไม่ใช่โมเดล แต่เป็นชั้นที่ตัดสินว่าโมเดลจะได้อ่านอะไร คำถามของคุณถูกส่งไปยังโมเดลเดียวกันสองครั้ง ครั้งหนึ่งพร้อมเอกสารทั้งฉบับ อีกครั้งพร้อมฉบับที่บีบอัดแล้ว และคำตอบทั้งสองจะมาวางเคียงกันตรงนี้ ถ้าตัวอย่างที่ให้มาดูง่ายเกินไป ลองโหลดหน้าเว็บยาว ๆ ของคุณเองดู โมเดลไม่ได้ถูกล้อมไว้ในเอกสารอ้างอิง เมื่อคำตอบไม่ได้อยู่ในนั้น มันจะบอกแล้วตอบให้อยู่ดี",
  "page.playground.title":
    "ลานทดลอง",
  "page.playground.lede":
    "ทุกอย่างข้างล่างนี้ทำงานในเครื่องคุณ ข้อความไม่เคยออกจากแท็บ ไม่มีการเรียกไปยังโมเดลใด และเวลาที่ปรากฏบนใบรับรองคือต้นทุนจริงของกระบวนการบนอุปกรณ์นี้",
  "page.verify.title":
    "ตรวจสอบใบรับรอง",
  "page.verify.lede":
    "วางลายเซ็นธุรกรรมของ devnet พร้อมบริบทต้นฉบับ หน้านี้จะดึงหลักฐานจากบล็อกเชน แล้วรันกระบวนการซ้ำในเครื่องคุณ จากนั้นเทียบค่าย่อยทั้งสอง ถ้าตรงกันแปลว่าคำกล่าวอ้างเรื่องการประหยัดยังยืนอยู่ ถ้าไม่ตรงแปลว่ามีบางอย่างถูกแก้ทีหลัง ไม่มีเซิร์ฟเวอร์ของ Kernly เข้ามาเกี่ยวข้องกับครึ่งใดของการตรวจนี้เลย",

  "chat.verdict.didNotFit":
    "คำขอที่ยังไม่บีบอัดนั้นใหญ่เกินไป",
  "chat.verdict.didNotFit.note":
    "ผู้ให้บริการปฏิเสธก่อนจะได้อ่านสักคำ ส่วนฉบับที่บีบอัดแล้วผ่านเข้าไปและตอบได้",

  "chat.ceiling.only":
    "ขนาดที่ยังไม่บีบอัดเกินโควตาต่อนาทีของแพ็กเกจฟรีสำหรับโมเดลนี้ — จะมีแต่คอลัมน์ที่บีบอัดแล้วเท่านั้นที่ผ่านไปได้ นั่นแหละคือสิ่งที่ต้องการพิสูจน์ เลือกโมเดล Gemini หากอยากเห็นทั้งสองฝั่ง",
  "chat.ceiling.neither":
    "เกินโควตาต่อนาทีของแพ็กเกจฟรีสำหรับโมเดลนี้ แม้จะบีบอัดแล้วก็ตาม ลองลดสัดส่วนลง หรือเลือกโมเดล Gemini",

  "chat.fitted.a":
    "หน้านี้เกินโควตาต่อนาทีของแพ็กเกจฟรีสำหรับโมเดลนี้ จึงรัดสัดส่วนลงเหลือ",
  "chat.fitted.b":
    "ซึ่งเล็กพอจะส่งได้แล้ว นี่คือตัวบีบอัดทำงานของมัน ไม่ใช่การสาธิตหนีไปหาผู้ให้บริการที่โควตาใหญ่กว่า จับตาดูประตูกันไว้ พ้นจุดหนึ่งมันจะเตือน และพ้นอีกจุดคำตอบจะกลายเป็นเรื่องแต่ง",

  "chat.fellback":
    "โควตาหมดแล้ว คำตอบนี้จึงมาจาก",

  "chat.demo.title":
    "ดูมันทำงาน",
  "chat.demo.note":
    "คลิกเดียวโหลดบทความจริงขนาดหนึ่งแสนอักขระขึ้นไป แล้วถามคำถามที่คำตอบฝังอยู่ลึกข้างใน ใหญ่เกินกว่าจะส่งแบบไม่บีบอัดในแพ็กเกจฟรี",

  "chat.nothing.title":
    "ตรงนี้ไม่ได้วัดอะไรเลย",
  "chat.nothing.body":
    "ทั้งสองคอลัมน์ตอบจากความรู้เดิมของโมเดลเอง เพราะเอกสารอ้างอิงไม่มีเรื่องนี้อยู่ นั่นคือโมเดลพูด ไม่ใช่ตัวบีบอัด สองคอลัมน์จะตรงกันไม่ว่าการบีบอัดจะทำอะไร ลองโหลดบทความข้างบนแล้วถามสิ่งที่บทความนั้นพูดถึงจริง ๆ",

  "chat.nothing.cta":
    "ลองอันที่พิสูจน์ได้",
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

  "chat.material":
    "संदर्भ सामग्री",
  "chat.url.title":
    "कोई पृष्ठ लाएँ",
  "chat.url.load":
    "लाएँ",
  "chat.url.loading":
    "आ रहा है…",
  "chat.url.note":
    "अंतर्निहित नमूने छोटे हैं। कोई लंबा लेख चिपकाइए, तभी संपीड़क के पास सचमुच तय करने को कुछ होगा।",
  "chat.url.loaded":
    "आ गया:",
  "chat.edit":
    "जो भेजा जा रहा है उसे बदलें",
  "chat.hide":
    "पाठ छिपाएँ",
  "chat.chars":
    "अक्षर",
  "chat.model":
    "मॉडल",
  "chat.ratio":
    "लक्ष्य अनुपात",
  "chat.note":
    "दोनों स्तंभ एक ही मॉडल से एक ही प्रश्न पूछते हैं। केवल संदर्भ सामग्री बदलती है, इसलिए उत्तरों में जो भी अंतर है वह संपीड़न है और कुछ नहीं।",
  "chat.preview":
    "इस सेटिंग पर",
  "chat.preview.cut":
    "कटा",
  "chat.preview.confidence":
    "विश्वास",
  "chat.preview.escalate":
    "आप पढ़ें उससे पहले ही द्वार इस दौर को चिह्नित कर देता। अनुपात बढ़ाइए।",
  "chat.tokens":
    "टोकन",
  "chat.tokIn":
    "टोकन भीतर",
  "chat.empty":
    "कुछ भी पूछिए। जब संदर्भ सामग्री में उत्तर हो तो उसे पहले लिया जाता है; जब न हो तो मॉडल यह कहकर फिर भी उत्तर देता है।",
  "chat.placeholder":
    "प्रश्न पूछिए…",
  "chat.ask":
    "दोनों से पूछें",
  "chat.asking":
    "पूछ रहे हैं…",
  "chat.full":
    "पूरा संदर्भ",
  "chat.compressed":
    "Kernly ने संपीड़ित किया",
  "chat.verdict.saved":
    "कम प्रॉम्प्ट टोकन का बिल",
  "chat.verdict.share.a":
    "दोनों उत्तर साझा करते हैं",
  "chat.verdict.share.b":
    "अपने अर्थवान शब्दों का — यह शब्द-स्तर की जाँच है, सही-गलत का निर्णय नहीं। दोनों पढ़िए।",
  "chat.verdict.drift":
    "ध्यान देने योग्य: पूरे संदर्भ ने दस्तावेज़ से उत्तर दिया और संपीड़ित ने मॉडल के अपने ज्ञान से। यह संपीड़न का उत्तर खो देना है, चाहे दोनों उत्तर एक-से पढ़े जाएँ।",
  "chat.outside":
    "संदर्भ सामग्री से नहीं",
  "chat.noreply":
    "कोई उत्तर नहीं।",
  "chat.coverage":
    "प्रश्न के दुर्लभ शब्द बचे",
  "chat.ownCount":
    "Kernly की अपनी गिनती से",
  "chat.escalated":
    "इस दौर में विश्वास द्वार से नीचे गिर गया। आप पढ़ें उससे पहले Kernly संपीड़ित उत्तर को अविश्वसनीय बता रहा है — अनुपात बढ़ाइए या मूल भेजिए।",

  "page.chat.title":
    "बातचीत",
  "page.chat.lede":
    "Kernly कोई मॉडल नहीं है। यह वह परत है जो तय करती है कि मॉडल को पढ़ने को क्या मिलेगा। आपका प्रश्न उसी मॉडल के पास दो बार जाता है — एक बार पूरे दस्तावेज़ के साथ, एक बार संपीड़ित रूप के साथ — और दोनों उत्तर यहाँ अगल-बगल आ जाते हैं। यदि दिए गए नमूने बहुत आसान लगें तो अपना कोई लंबा पृष्ठ ले आइए। मॉडल संदर्भ सामग्री में बंद नहीं है: जब उत्तर वहाँ नहीं होता, वह यह कहकर फिर भी उत्तर देता है।",
  "page.playground.title":
    "प्रयोगशाला",
  "page.playground.lede":
    "नीचे सब कुछ आपके ही यंत्र पर चलता है। पाठ कभी इस टैब से बाहर नहीं जाता, किसी मॉडल को कोई अनुरोध नहीं भेजा जाता, और रसीद में दिया समय इस यंत्र पर इस प्रक्रिया की असली लागत है।",
  "page.verify.title":
    "किसी रसीद की जाँच",
  "page.verify.lede":
    "devnet का लेन-देन हस्ताक्षर और मूल संदर्भ चिपकाइए। यह पृष्ठ शृंखला से प्रमाणन उठाता है, प्रक्रिया यहीं दोबारा चलाता है, और दोनों संक्षेपों को मिलाता है। मिल जाएँ तो बचत का दावा टिका रहा; न मिलें तो बाद में कुछ बदला गया। इस जाँच के किसी भी आधे हिस्से में Kernly का कोई सर्वर शामिल नहीं है।",

  "chat.verdict.didNotFit":
    "बिना संपीड़न वाला अनुरोध समा नहीं पाया।",
  "chat.verdict.didNotFit.note":
    "प्रदाता ने एक शब्द पढ़े बिना ही उसे लौटा दिया। संपीड़ित वाला भीतर गया और उत्तर दे आया।",

  "chat.ceiling.only":
    "बिना संपीड़न के यह इस मॉडल के नि:शुल्क स्तर की प्रति-मिनट सीमा से बड़ा है — केवल संपीड़ित स्तंभ ही भीतर जाएगा। यही तो दिखाना है। दोनों देखने हों तो कोई Gemini मॉडल चुनिए।",
  "chat.ceiling.neither":
    "संपीड़ित करने पर भी यह इस मॉडल के नि:शुल्क स्तर की प्रति-मिनट सीमा से बड़ा है। अनुपात घटाइए, या कोई Gemini मॉडल चुनिए।",

  "chat.fitted.a":
    "यह पृष्ठ मॉडल की नि:शुल्क स्तर वाली प्रति-मिनट सीमा से बड़ा है, इसलिए अनुपात कसकर कर दिया गया",
  "chat.fitted.b":
    "जो भेजने लायक छोटा है। यह संपीड़क का अपना काम करना है, न कि प्रदर्शन का किसी ढीली सीमा वाले प्रदाता के पास भाग जाना। द्वार पर नज़र रखिए: एक बिंदु के बाद वह चेताता है, और उससे आगे उत्तर गढ़ा हुआ निकलता है।",

  "chat.fellback":
    "का कोटा समाप्त था, इसलिए उत्तर दिया",

  "chat.demo.title":
    "इसे काम करते देखिए",
  "chat.demo.note":
    "एक क्लिक में एक लाख या उससे अधिक अक्षरों का असली लेख आता है और ऐसा प्रश्न पूछा जाता है जिसका उत्तर उसके भीतर गहरे दबा है। नि:शुल्क स्तर पर बिना संपीड़न भेजने के लिए बहुत बड़ा।",

  "chat.nothing.title":
    "यहाँ कुछ भी नहीं मापा गया।",
  "chat.nothing.body":
    "दोनों स्तंभों ने मॉडल के अपने ज्ञान से उत्तर दिया, क्योंकि संदर्भ सामग्री में इस बारे में कुछ था ही नहीं। यह मॉडल बोल रहा है, संपीड़क नहीं — संपीड़न कुछ भी करे, दोनों स्तंभ सहमत ही रहेंगे। ऊपर से कोई लेख लाइए और वही पूछिए जो उसमें सचमुच है।",

  "chat.nothing.cta":
    "ऐसा एक आज़माइए जो दिखाए",
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

  "chat.material":
    "المادة المرجعية",
  "chat.url.title":
    "حمّل صفحة",
  "chat.url.load":
    "حمّل",
  "chat.url.loading":
    "جارٍ التحميل…",
  "chat.url.note":
    "النماذج المرفقة قصيرة. الصق مقالًا طويلًا، عندئذ يصير أمام الضاغط ما يقرّر فيه فعلًا.",
  "chat.url.loaded":
    "حُمّل:",
  "chat.edit":
    "عدّل ما يُرسَل",
  "chat.hide":
    "أخفِ النص",
  "chat.chars":
    "حرفًا",
  "chat.model":
    "النموذج",
  "chat.ratio":
    "النسبة المستهدفة",
  "chat.note":
    "العمودان يقصدان النموذج نفسه بالسؤال نفسه. لا يختلف إلا المادة المرجعية، فأي فجوة بين الإجابتين هي الضغط ولا شيء سواه.",
  "chat.preview":
    "عند هذا الضبط",
  "chat.preview.cut":
    "اقتُطع",
  "chat.preview.confidence":
    "الثقة",
  "chat.preview.escalate":
    "كان البوّاب سيؤشّر على هذه المحاولة قبل أن تقرأها. ارفع النسبة.",
  "chat.tokens":
    "رمزًا",
  "chat.tokIn":
    "رموز داخلة",
  "chat.empty":
    "اسأل ما شئت. تُقدَّم المادة المرجعية متى كانت تحوي الجواب؛ وإن لم تكن، قال النموذج ذلك وأجاب على أي حال.",
  "chat.placeholder":
    "اطرح سؤالًا…",
  "chat.ask":
    "اسأل كليهما",
  "chat.asking":
    "جارٍ السؤال…",
  "chat.full":
    "السياق الكامل",
  "chat.compressed":
    "مضغوط بـ Kernly",
  "chat.verdict.saved":
    "رموز مطالبة أقلّ محسوبة",
  "chat.verdict.share.a":
    "تتشارك الإجابتان",
  "chat.verdict.share.b":
    "من كلماتهما الدالّة — فحص على مستوى الكلمة لا حكم على الصواب. اقرأ كلتيهما.",
  "chat.verdict.drift":
    "جدير بالانتباه: أجاب السياق الكامل من الوثيقة، وأجاب المضغوط من معرفة النموذج نفسه. هذا ضغطٌ أضاع الجواب، ولو قُرئت الإجابتان متشابهتين.",
  "chat.outside":
    "ليس من المادة المرجعية",
  "chat.noreply":
    "لا جواب.",
  "chat.coverage":
    "من ألفاظ السؤال النادرة بقيت",
  "chat.ownCount":
    "بحساب Kernly ذاته",
  "chat.escalated":
    "هبطت الثقة في هذه المحاولة دون العتبة. يؤشّر Kernly على الجواب المضغوط بأنه غير جدير بالثقة قبل أن تقرأه — ارفع النسبة أو أرسل الأصل.",

  "page.chat.title":
    "محادثة",
  "page.chat.lede":
    "‏Kernly ليس نموذجًا، بل الطبقة التي تقرّر ما الذي يصل النموذج ليقرأه. يذهب سؤالك إلى النموذج نفسه مرتين: مرة مع الوثيقة كاملة ومرة مع النسخة المضغوطة، وتحطّ الإجابتان هنا جنبًا إلى جنب. حمّل صفحة طويلة من عندك إن بدت النماذج مريحة أكثر من اللازم. النموذج ليس محصورًا في المادة المرجعية: حين لا يكون الجواب فيها، يقول ذلك ويجيب على أي حال.",
  "page.playground.title":
    "ساحة التجربة",
  "page.playground.lede":
    "كل ما في الأسفل يعمل على جهازك. لا يغادر النصّ هذا اللسان قطّ، ولا يُرسَل طلب إلى أي نموذج، والزمن المدوّن في الإيصال هو الكلفة الحقيقية للمسار على هذا الجهاز.",
  "page.verify.title":
    "تحقّق من إيصال",
  "page.verify.lede":
    "الصق توقيع معاملة من devnet والسياق الأصلي. تجلب هذه الصفحة التوثيق من السلسلة، وتعيد تشغيل المسار عندك، ثم تقارن البصمتين. إن تطابقتا صمد ادّعاء التوفير، وإن لم تتطابقا فقد غُيّر شيء بعد الأمر. لا يدخل خادم لـ Kernly في أيّ من نصفَي هذا الفحص.",

  "chat.verdict.didNotFit":
    "الطلب غير المضغوط لم يتّسع.",
  "chat.verdict.didNotFit.note":
    "ردّه المزوّد قبل أن يقرأ منه كلمة. أما المضغوط فنفذ وأجاب.",

  "chat.ceiling.only":
    "غير مضغوط، يتجاوز هذا ميزانية الدقيقة في الطبقة المجانية لهذا النموذج — لن ينفذ سوى العمود المضغوط. وهذا بعينه هو البرهان. اختر نموذج Gemini لترى العمودين معًا.",
  "chat.ceiling.neither":
    "يتجاوز ميزانية الدقيقة في الطبقة المجانية لهذا النموذج حتى بعد الضغط. أنزل النسبة، أو اختر نموذج Gemini.",

  "chat.fitted.a":
    "هذه الصفحة تتجاوز ميزانية الدقيقة في الطبقة المجانية للنموذج، فشُدَّت النسبة إلى",
  "chat.fitted.b":
    "وهو قدر يسع الإرسال. هذا هو الضاغط يؤدي عمله، لا العرض يفرّ إلى مزوّد أوسع حصّة. راقب البوّاب: بعد حدّ ينذر، وبعد حدّ آخر يكون الجواب مختلقًا.",

  "chat.fellback":
    "نفدت حصته، فأجاب عن هذا",

  "chat.demo.title":
    "شاهده وهو يعمل",
  "chat.demo.note":
    "نقرة واحدة تحمّل مقالًا حقيقيًا من مئة ألف حرف فأكثر وتطرح سؤالًا جوابه مدفون في عمقه. أكبر من أن يُرسَل غير مضغوط على الطبقة المجانية.",

  "chat.nothing.title":
    "لم يُقَس هنا شيء.",
  "chat.nothing.body":
    "أجاب العمودان من معرفة النموذج نفسه، لأن المادة المرجعية لا تتضمّن شيئًا عن هذا. المتكلّم هو النموذج لا الضاغط — وسيتفق العمودان مهما فعل الضغط. حمّل مقالًا في الأعلى واسأل عمّا يتناوله فعلًا.",

  "chat.nothing.cta":
    "جرّب سؤالًا يُظهر ذلك",
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

  "chat.material":
    "参考材料",
  "chat.url.title":
    "载入一个网页",
  "chat.url.load":
    "载入",
  "chat.url.loading":
    "载入中…",
  "chat.url.note":
    "内置样例都很短。贴一篇长文进来，压缩器才真有东西可取舍。",
  "chat.url.loaded":
    "已载入：",
  "chat.edit":
    "编辑要送出的内容",
  "chat.hide":
    "隐藏文本",
  "chat.chars":
    "字符",
  "chat.model":
    "模型",
  "chat.ratio":
    "目标比例",
  "chat.note":
    "两栏打的是同一个模型、同一个问题。只有参考材料不同，所以答复之间的任何落差都只来自压缩。",
  "chat.preview":
    "在此设定下",
  "chat.preview.cut":
    "削减",
  "chat.preview.confidence":
    "置信度",
  "chat.preview.escalate":
    "在你读到之前，闸门就会标记这一次。把比例调高些。",
  "chat.tokens":
    "词元",
  "chat.tokIn":
    "词元入",
  "chat.empty":
    "随便问。参考材料里有答案时优先采用；没有时，模型会讲明并照样回答。",
  "chat.placeholder":
    "提个问题…",
  "chat.ask":
    "两边都问",
  "chat.asking":
    "询问中…",
  "chat.full":
    "完整上下文",
  "chat.compressed":
    "Kernly 压缩后",
  "chat.verdict.saved":
    "计费的提示词元更少",
  "chat.verdict.share.a":
    "两份答复共用了",
  "chat.verdict.share.b":
    "的实词——这是字面比对，不是对错判定。两份都读。",
  "chat.verdict.drift":
    "值得留意：完整上下文是照着文档答的，压缩后那份是凭模型自己的知识答的。哪怕两份读起来相像，这也是压缩把答案弄丢了。",
  "chat.outside":
    "并非出自参考材料",
  "chat.noreply":
    "没有答复。",
  "chat.coverage":
    "的问题生僻词留存",
  "chat.ownCount":
    "按 Kernly 自己的计数",
  "chat.escalated":
    "本次置信度跌破闸门。在你读之前，Kernly 就把这份压缩答复标为不可信——调高比例，或者送原文。",

  "page.chat.title":
    "对话",
  "page.chat.lede":
    "Kernly 不是模型，而是决定模型能读到什么的那一层。你的问题会送到同一个模型两次——一次带整份文档，一次带压缩后的版本——两份答复并排落在这里。要是觉得内置样例太顺手，就载入一篇你自己的长文。模型并没有被圈死在参考材料里：答案不在其中时，它会讲明，然后照样回答。",
  "page.playground.title":
    "试用台",
  "page.playground.lede":
    "下面的一切都在本地运行。文本从不离开这个标签页，不向任何模型发出请求，凭据上的耗时就是这条流水线在本机上的真实开销。",
  "page.verify.title":
    "核验一张凭据",
  "page.verify.lede":
    "贴上一条 devnet 交易签名和原始上下文。本页从链上取回存证，在本地重跑一遍流水线，再比对两个摘要。对得上，节省的说法就站得住；对不上，就是事后有人动过。这项核对的两半，都没有 Kernly 的服务器插手。",

  "chat.verdict.didNotFit":
    "未压缩的那份请求塞不下。",
  "chat.verdict.didNotFit.note":
    "服务方一个字都没读就退了回来。压缩后的那份进去了，并且答上了。",

  "chat.ceiling.only":
    "未压缩的体量超出该模型免费档的每分钟额度——只有压缩那一栏进得去。要证明的正是这件事。想两栏都看，就换成 Gemini 模型。",
  "chat.ceiling.neither":
    "即便压缩过，也仍超出该模型免费档的每分钟额度。把比例调低，或者换成 Gemini 模型。",

  "chat.fitted.a":
    "这个页面超出该模型免费档的每分钟额度，因此比例已收紧到",
  "chat.fitted.b":
    "这就送得进去了。这是压缩器在干自己的活，而不是演示逃到额度更宽的服务方去。盯着闸门看：过了一个点它会示警，再过一个点答案就是编的。",

  "chat.fellback":
    "额度已用尽，因此作答的是",

  "chat.demo.title":
    "看它怎么干活",
  "chat.demo.note":
    "一键载入一篇十万字符以上的真实文章，并提出一个答案埋在深处的问题。这个体量在免费档不压缩就送不进去。",

  "chat.nothing.title":
    "这里什么都没量到。",
  "chat.nothing.body":
    "两栏都是凭模型自己的知识作答的，因为参考材料里根本没有这件事。说话的是模型，不是压缩器——无论压缩做了什么，两栏都会一致。到上面载入一篇文章，再问它真正讲到的东西。",

  "chat.nothing.cta":
    "试一个能证明的",
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

  "chat.material":
    "参照資料",
  "chat.url.title":
    "ページを読み込む",
  "chat.url.load":
    "読み込む",
  "chat.url.loading":
    "読み込み中…",
  "chat.url.note":
    "同梱の見本は短いものばかりです。長い記事を貼れば、圧縮側にようやく選ぶ余地が生まれます。",
  "chat.url.loaded":
    "読み込み済み:",
  "chat.edit":
    "送っている中身を編集",
  "chat.hide":
    "本文を隠す",
  "chat.chars":
    "文字",
  "chat.model":
    "モデル",
  "chat.ratio":
    "目標比率",
  "chat.note":
    "二つの欄は同じモデルに同じ問いを投げています。違うのは参照資料だけなので、答えの差はすべて圧縮によるものです。",
  "chat.preview":
    "この設定では",
  "chat.preview.cut":
    "削減",
  "chat.preview.confidence":
    "確信度",
  "chat.preview.escalate":
    "あなたが読む前に関門がこの回を警告します。比率を上げてください。",
  "chat.tokens":
    "トークン",
  "chat.tokIn":
    "入力トークン",
  "chat.empty":
    "何でも尋ねてください。参照資料に答えがあればそれを優先し、なければモデルはそう断ってから答えます。",
  "chat.placeholder":
    "質問を入力…",
  "chat.ask":
    "両方に尋ねる",
  "chat.asking":
    "問い合わせ中…",
  "chat.full":
    "元の文脈",
  "chat.compressed":
    "Kernly で圧縮",
  "chat.verdict.saved":
    "請求される入力トークンの削減",
  "chat.verdict.share.a":
    "二つの答えは内容語の",
  "chat.verdict.share.b":
    "を共有しています。語の一致を見ただけで、正しさの判定ではありません。両方お読みください。",
  "chat.verdict.drift":
    "注目に値します。元の文脈は文書から答え、圧縮側はモデル自身の知識から答えました。二つの返答が似て読めても、これは圧縮が答えを失ったということです。",
  "chat.outside":
    "参照資料からではありません",
  "chat.noreply":
    "返答なし。",
  "chat.coverage":
    "の希少語が残存",
  "chat.ownCount":
    "Kernly 自身の数え方で",
  "chat.escalated":
    "この回は確信度が関門を下回りました。読む前に Kernly が圧縮側の答えを信用できないものとして示しています。比率を上げるか、原文を送ってください。",

  "page.chat.title":
    "対話",
  "page.chat.lede":
    "Kernly はモデルではありません。モデルが何を読めるかを決める層です。あなたの問いは同じモデルへ二度送られます。一度は文書まるごと、一度は圧縮した版で、双方の返答がここに並びます。同梱の見本が都合よく見えるなら、ご自分の長い頁を読み込ませてください。モデルは参照資料に閉じ込められてはいません。答えがそこに無ければ、そう断ったうえで答えます。",
  "page.playground.title":
    "試し場",
  "page.playground.lede":
    "以下はすべて手元で動きます。本文がこのタブを出ることはなく、どのモデルにも要求は送られず、控えに出る時間はこの端末での実際の処理費用です。",
  "page.verify.title":
    "控えを検証する",
  "page.verify.lede":
    "devnet の取引署名と元の文脈を貼ってください。この頁は証跡を鎖から取り寄せ、手元で処理を流し直し、二つの要約値を突き合わせます。一致すれば節約の主張は保たれ、一致しなければ後から何かが変えられています。この照合のどちらの半分にも Kernly のサーバは関わりません。",

  "chat.verdict.didNotFit":
    "圧縮していない要求は入りませんでした。",
  "chat.verdict.didNotFit.note":
    "提供側は一語も読まずに突き返しました。圧縮した側は通り、答えを返しています。",

  "chat.ceiling.only":
    "圧縮しない状態では、この模型の無料枠の毎分予算を超えます。通るのは圧縮した側だけです。示したいのはまさにそこです。両方を見るなら Gemini の模型を選んでください。",
  "chat.ceiling.neither":
    "圧縮しても、この模型の無料枠の毎分予算を超えます。比率を下げるか、Gemini の模型を選んでください。",

  "chat.fitted.a":
    "この頁は模型の無料枠の毎分予算を超えるため、比率を次まで詰めました:",
  "chat.fitted.b":
    "これなら送れます。圧縮側が仕事をしているのであって、余裕のある提供元へ逃げたのではありません。関門を見ていてください。ある点を越えると警告し、さらに越えると答えは作り話になります。",

  "chat.fellback":
    "の枠が尽きたため、答えたのは",

  "chat.demo.title":
    "働くところを見る",
  "chat.demo.note":
    "一押しで十万字以上の実在の記事を読み込み、答えがその奥に埋もれている問いを立てます。無料枠では圧縮せずに送れない大きさです。",

  "chat.nothing.title":
    "ここでは何も測れていません。",
  "chat.nothing.body":
    "どちらの欄も模型自身の知識から答えました。参照資料にこの件が無いからです。話しているのは模型であって圧縮ではなく、圧縮が何をしようと 二つの欄は一致します。上から記事を読み込み、そこに実際に書かれていることを尋ねてください。",

  "chat.nothing.cta":
    "証明できるものを試す",
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

  "chat.material":
    "참고 자료",
  "chat.url.title":
    "페이지 불러오기",
  "chat.url.load":
    "불러오기",
  "chat.url.loading":
    "불러오는 중…",
  "chat.url.note":
    "기본 예시는 짧습니다. 긴 글을 붙여 넣어야 압축기가 실제로 고를 것이 생깁니다.",
  "chat.url.loaded":
    "불러옴:",
  "chat.edit":
    "보내는 내용 수정",
  "chat.hide":
    "본문 숨기기",
  "chat.chars":
    "자",
  "chat.model":
    "모델",
  "chat.ratio":
    "목표 비율",
  "chat.note":
    "두 칸 모두 같은 모델에 같은 질문을 던집니다. 참고 자료만 다르므로 답 사이의 차이는 전부 압축에서 옵니다.",
  "chat.preview":
    "이 설정에서",
  "chat.preview.cut":
    "줄임",
  "chat.preview.confidence":
    "신뢰도",
  "chat.preview.escalate":
    "읽기도 전에 관문이 이 회차를 표시할 겁니다. 비율을 올리세요.",
  "chat.tokens":
    "토큰",
  "chat.tokIn":
    "입력 토큰",
  "chat.empty":
    "무엇이든 물어보세요. 참고 자료에 답이 있으면 그것을 먼저 쓰고, 없으면 모델이 그렇다고 밝힌 뒤 그래도 답합니다.",
  "chat.placeholder":
    "질문을 입력…",
  "chat.ask":
    "둘 다에게 묻기",
  "chat.asking":
    "묻는 중…",
  "chat.full":
    "원본 맥락",
  "chat.compressed":
    "Kernly 압축본",
  "chat.verdict.saved":
    "청구되는 프롬프트 토큰 절감",
  "chat.verdict.share.a":
    "두 답이 공유하는 내용어",
  "chat.verdict.share.b":
    "— 낱말 수준의 대조일 뿐 옳고 그름의 판정이 아닙니다. 둘 다 읽어 보세요.",
  "chat.verdict.drift":
    "눈여겨볼 대목: 원본 맥락은 문서에서 답했고 압축본은 모델 자신의 지식에서 답했습니다. 두 답이 비슷하게 읽히더라도 이는 압축이 답을 잃은 것입니다.",
  "chat.outside":
    "참고 자료에서 나온 것이 아님",
  "chat.noreply":
    "답이 없습니다.",
  "chat.coverage":
    "의 질문 희귀어가 살아남음",
  "chat.ownCount":
    "Kernly 자체 집계 기준",
  "chat.escalated":
    "이번 회차에서 신뢰도가 관문 아래로 떨어졌습니다. 읽기 전에 Kernly가 압축된 답을 믿을 수 없다고 표시합니다 — 비율을 올리거나 원문을 보내세요.",

  "page.chat.title":
    "대화",
  "page.chat.lede":
    "Kernly는 모델이 아닙니다. 모델이 무엇을 읽게 될지 정하는 층입니다. 당신의 질문은 같은 모델로 두 번 갑니다 — 한 번은 문서 전체와, 한 번은 압축본과 — 그리고 두 답이 여기 나란히 놓입니다. 기본 예시가 너무 만만해 보이면 직접 긴 글을 불러오세요. 모델은 참고 자료 안에 갇혀 있지 않습니다. 답이 거기 없으면 그렇다고 밝힌 뒤 그래도 답합니다.",
  "page.playground.title":
    "실험실",
  "page.playground.lede":
    "아래의 모든 것은 이 기기에서 돕니다. 본문은 탭을 벗어나지 않고, 어떤 모델에도 요청이 가지 않으며, 영수증에 찍힌 시간은 이 기기에서 파이프라인이 실제로 든 비용입니다.",
  "page.verify.title":
    "영수증 검증",
  "page.verify.lede":
    "devnet 거래 서명과 원본 맥락을 붙여 넣으세요. 이 페이지는 체인에서 증명을 가져오고, 파이프라인을 여기서 다시 돌린 뒤, 두 요약값을 맞춰 봅니다. 맞으면 절감 주장이 버틴 것이고, 안 맞으면 사후에 무언가 바뀐 것입니다. 이 확인의 어느 쪽 절반에도 Kernly 서버는 끼어들지 않습니다.",

  "chat.verdict.didNotFit":
    "압축하지 않은 요청은 들어가지 못했습니다.",
  "chat.verdict.didNotFit.note":
    "제공자가 한 단어도 읽기 전에 되돌려보냈습니다. 압축한 쪽은 통과해 답했습니다.",

  "chat.ceiling.only":
    "압축하지 않은 크기는 이 모델 무료 등급의 분당 한도를 넘습니다 — 압축한 쪽만 통과합니다. 보여 주려는 것이 바로 그것입니다. 둘 다 보려면 Gemini 모델을 고르세요.",
  "chat.ceiling.neither":
    "압축해도 이 모델 무료 등급의 분당 한도를 넘습니다. 비율을 낮추거나 Gemini 모델을 고르세요.",

  "chat.fitted.a":
    "이 페이지는 모델 무료 등급의 분당 한도를 넘어서, 비율을 다음까지 조였습니다:",
  "chat.fitted.b":
    "이 정도면 보낼 수 있습니다. 압축기가 제 일을 한 것이지, 시연이 한도가 넉넉한 제공자로 달아난 것이 아닙니다. 관문을 지켜보세요. 어느 지점을 넘으면 경고하고, 더 넘으면 답이 지어낸 것이 됩니다.",

  "chat.fellback":
    "의 할당량이 떨어져, 답한 것은",

  "chat.demo.title":
    "작동하는 모습 보기",
  "chat.demo.note":
    "한 번 누르면 십만 자 이상의 실제 기사를 불러오고, 답이 그 깊숙한 곳에 묻혀 있는 질문을 던집니다. 무료 등급에서는 압축하지 않고는 보낼 수 없는 크기입니다.",

  "chat.nothing.title":
    "여기서는 아무것도 측정되지 않았습니다.",
  "chat.nothing.body":
    "두 칸 모두 모델 자신의 지식에서 답했습니다. 참고 자료에 이 이야기가 없기 때문입니다. 말하고 있는 것은 모델이지 압축기가 아니며, 압축이 무엇을 하든 두 칸은 일치합니다. 위에서 글을 불러오고, 그 글이 실제로 다루는 것을 물어보세요.",

  "chat.nothing.cta":
    "증명되는 것으로 시도",
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
