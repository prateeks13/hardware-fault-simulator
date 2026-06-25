import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Skills ──────────────────────────────────────────────────────────────────
  const [reading, listening, writing] = await Promise.all([
    db.skill.upsert({ where: { name: "READING" },   update: {}, create: { name: "READING",   label: "Reading",   emoji: "📖" } }),
    db.skill.upsert({ where: { name: "LISTENING" }, update: {}, create: { name: "LISTENING", label: "Listening", emoji: "🎧" } }),
    db.skill.upsert({ where: { name: "WRITING" },   update: {}, create: { name: "WRITING",   label: "Writing",   emoji: "✍️"  } }),
  ]);

  // ─── Achievements ─────────────────────────────────────────────────────────────
  const achievements = [
    { key: "FIRST_EXERCISE",  title: "First Step",      description: "Complete your first exercise", emoji: "🎯", xpBonus: 10  },
    { key: "STREAK_7",        title: "Week Warrior",    description: "7-day streak",                emoji: "🔥", xpBonus: 50  },
    { key: "STREAK_30",       title: "Monthly Master",  description: "30-day streak",               emoji: "💎", xpBonus: 200 },
    { key: "LEVEL_10",        title: "Intermédiaire",   description: "Reach level 10",              emoji: "⭐", xpBonus: 100 },
    { key: "PERFECT_SCORE",   title: "Parfait !",       description: "100% accuracy on any exercise", emoji: "💯", xpBonus: 25 },
    { key: "WORDS_100",       title: "Vocabulaire",     description: "Review 100 flashcards",       emoji: "🃏", xpBonus: 30  },
    { key: "FIRST_MOCK",      title: "Test-Ready",      description: "Complete a TEF/DELF mock test", emoji: "📝", xpBonus: 50 },
    { key: "AI_GRADED",       title: "AI Assessed",     description: "Receive AI feedback on writing", emoji: "🤖", xpBonus: 20 },
  ];
  for (const a of achievements) {
    await db.achievement.upsert({ where: { key: a.key }, update: {}, create: a });
  }

  // ─── Reading sections ─────────────────────────────────────────────────────────
  const readingSections = [
    { type: "MCQ_MOCK_TEST",          title: "TEF/DELF Mock Tests (MCQ)",        description: "Timed multiple-choice comprehension passages scored like the real exam.", order: 1, icon: "📝" },
    { type: "TRUE_FALSE_NOT_GIVEN",   title: "True / False / Not Given",          description: "Judge statements against a reading passage.",                            order: 2, icon: "✅" },
    { type: "CLOZE_FILL_BLANK",       title: "Cloze / Fill-in-the-blank",         description: "Choose the right word to complete a text.",                             order: 3, icon: "🔤" },
    { type: "ARTICLE_COMPREHENSION",  title: "Article Comprehension",             description: "Longer authentic texts with open and MCQ questions.",                    order: 4, icon: "📰" },
    { type: "SENTENCE_ORDERING",      title: "Sentence Ordering",                 description: "Reorder scrambled sentences into a coherent paragraph.",                order: 5, icon: "🔀" },
    { type: "GRAMMAR_IN_CONTEXT",     title: "Grammar in Context",                description: "Pick the grammatically correct form within a reading.",                  order: 6, icon: "📖" },
    { type: "SKIMMING_SCANNING",      title: "Skimming & Scanning (timed)",       description: "Find specific information against the clock.",                          order: 7, icon: "⏱️" },
    { type: "VOCABULARY_FLASHCARDS",  title: "Vocabulary Flashcards (SRS)",       description: "Spaced-repetition word and phrase review.",                             order: 8, icon: "🃏" },
  ] as const;

  const readingSectionRecords: Record<string, Awaited<ReturnType<typeof db.section.upsert>>> = {};
  for (const s of readingSections) {
    readingSectionRecords[s.type] = await db.section.upsert({
      where:  { skillId_order: { skillId: reading.id, order: s.order } },
      update: { title: s.title, description: s.description },
      create: { skillId: reading.id, type: s.type as never, title: s.title, description: s.description, order: s.order, icon: s.icon },
    });
  }

  // ─── Listening sections ───────────────────────────────────────────────────────
  const listeningSections = [
    { type: "LISTENING_MOCK_TEST",    title: "TEF/DELF Listening Mock Tests",     description: "Audio clips with timed multiple-choice questions.",                     order: 1, icon: "🎧" },
    { type: "DICTATION",              title: "Dictation (dictée)",                 description: "Type exactly what you hear — auto-diff against the answer.",            order: 2, icon: "✍️"  },
    { type: "AUDIO_TRUE_FALSE",       title: "Audio True/False",                  description: "Judge statements about what was said in the clip.",                     order: 3, icon: "🔊" },
    { type: "FILL_GAP_AUDIO",         title: "Fill the Gap from Audio",           description: "Complete a transcript while listening.",                                order: 4, icon: "🎵" },
    { type: "MATCH_AUDIO",            title: "Match Audio to Meaning",            description: "Pair clips with the correct option.",                                  order: 5, icon: "🎯" },
    { type: "SPEED_DRILLS",           title: "Speed Drills",                      description: "Same clip at slow vs natural speed, comprehension checks.",             order: 6, icon: "⚡" },
    { type: "DIALOGUE_COMPREHENSION", title: "Dialogue Comprehension",            description: "Multi-speaker conversations with questions.",                           order: 7, icon: "💬" },
    { type: "SHADOWING",              title: "Shadowing / Repeat",                description: "Listen, record yourself, and compare.",                                 order: 8, icon: "🎤" },
  ] as const;

  const listeningSectionRecords: Record<string, Awaited<ReturnType<typeof db.section.upsert>>> = {};
  for (const s of listeningSections) {
    listeningSectionRecords[s.type] = await db.section.upsert({
      where:  { skillId_order: { skillId: listening.id, order: s.order } },
      update: { title: s.title, description: s.description },
      create: { skillId: listening.id, type: s.type as never, title: s.title, description: s.description, order: s.order, icon: s.icon },
    });
  }

  // ─── Writing sections ─────────────────────────────────────────────────────────
  const writingSections = [
    { type: "WRITING_TASK",           title: "TEF/DELF Writing Tasks",            description: "Guided email/essay prompts with scoring rubric and word counts.",       order: 1, icon: "📄" },
    { type: "JUMBLE_WORDS",           title: "Jumble Words",                      description: "Drag-and-drop to unscramble a sentence.",                              order: 2, icon: "🧩" },
    { type: "SENTENCE_CONSTRUCTION",  title: "Sentence Construction",             description: "Build a correct sentence from a prompt and word bank.",                order: 3, icon: "🏗️" },
    { type: "GUIDED_PARAGRAPH",       title: "Guided Paragraph Writing",          description: "Structured prompts with model answers and rubric self-check.",          order: 4, icon: "🖊️" },
    { type: "GRAMMAR_CORRECTION",     title: "Grammar Correction",                description: "Find and fix errors in a given sentence or paragraph.",                order: 5, icon: "🔧" },
    { type: "TRANSLATION",            title: "Translation (EN → FR)",             description: "Translate prompts; compare to accepted answers.",                      order: 6, icon: "🌐" },
    { type: "VERB_CONJUGATION",       title: "Verb Conjugation Drills",           description: "By tense: présent, passé composé, imparfait, futur, subjonctif.",      order: 7, icon: "🔄" },
    { type: "SPELLING_ACCENTS",       title: "Spelling / Accents Drill",          description: "Type words with correct accents and agreements.",                      order: 8, icon: "é"  },
  ] as const;

  const writingSectionRecords: Record<string, Awaited<ReturnType<typeof db.section.upsert>>> = {};
  for (const s of writingSections) {
    writingSectionRecords[s.type] = await db.section.upsert({
      where:  { skillId_order: { skillId: writing.id, order: s.order } },
      update: { title: s.title, description: s.description },
      create: { skillId: writing.id, type: s.type as never, title: s.title, description: s.description, order: s.order, icon: s.icon },
    });
  }

  // ─── Helper to create exercises ───────────────────────────────────────────────
  async function createExercise(data: Parameters<typeof db.exercise.create>[0]["data"]) {
    const existing = await db.exercise.findFirst({
      where: { sectionId: data.sectionId as string, title: data.title as string },
    });
    if (existing) return existing;
    return db.exercise.create({ data });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // READING EXERCISES
  // ═══════════════════════════════════════════════════════════════════════════════

  // 1. MCQ Mock Tests
  const mcqSec = readingSectionRecords["MCQ_MOCK_TEST"];
  await createExercise({
    sectionId: mcqSec.id, level: "B1", title: "TEF Reading Mock Test — Café Society", isFree: true,
    xpReward: 30, maxScore: 100, durationSeconds: 900,
    payload: {
      passage: `Les cafés français jouent un rôle central dans la vie sociale du pays. Depuis le XVIIe siècle, ces établissements servent non seulement des boissons, mais aussi de lieu de rencontre pour les intellectuels, les artistes et les hommes politiques. Des philosophes comme Voltaire et Rousseau fréquentaient régulièrement les cafés parisiens pour débattre des idées des Lumières. Aujourd'hui, le café reste un symbole de la culture française, un endroit où l'on peut s'asseoir pendant des heures sans être pressé de partir.`,
      questions: [
        { text: "What has been the main role of French cafés since the 17th century?", options: ["Serving food only", "A social meeting place", "A place for commerce", "A tourist attraction"] },
        { text: "Which philosophers are mentioned as regular café visitors?", options: ["Descartes and Pascal", "Voltaire and Rousseau", "Sartre and de Beauvoir", "Montaigne and Molière"] },
        { text: "What does the author suggest about sitting in a French café today?", options: ["You must order every 30 minutes", "You are welcome to stay as long as you like", "It is expensive and exclusive", "Reservations are required"] },
      ],
      timeLimit: 900,
    },
    answerKey: { answers: ["A social meeting place", "Voltaire and Rousseau", "You are welcome to stay as long as you like"] },
  });

  await createExercise({
    sectionId: mcqSec.id, level: "B2", title: "TEF Reading Mock Test — Le Réchauffement Climatique",
    xpReward: 35, maxScore: 100, durationSeconds: 900,
    payload: {
      passage: `Le réchauffement climatique est l'un des défis les plus urgents de notre époque. Selon les scientifiques, la température moyenne de la Terre a augmenté d'environ 1,1°C depuis l'ère préindustrielle. Cette hausse, bien que semblant minime, a des conséquences dramatiques : montée des eaux, événements météorologiques extrêmes, et perte de biodiversité. Les gouvernements du monde entier ont signé l'Accord de Paris en 2015, s'engageant à limiter le réchauffement à 1,5°C. Cependant, les experts avertissent que les engagements actuels sont insuffisants pour atteindre cet objectif.`,
      questions: [
        { text: "By how much has the Earth's average temperature risen since pre-industrial times?", options: ["0.5°C", "1.1°C", "2°C", "3°C"] },
        { text: "What was agreed upon in the Paris Agreement of 2015?", options: ["To stop all emissions by 2030", "To limit warming to 1.5°C", "To fund renewable energy", "To ban fossil fuels"] },
        { text: "What is the experts' view on current commitments?", options: ["They are more than sufficient", "They are insufficient to meet the target", "They will be revised upward", "They are being fully implemented"] },
      ],
      timeLimit: 900,
    },
    answerKey: { answers: ["1.1°C", "To limit warming to 1.5°C", "They are insufficient to meet the target"] },
  });

  await createExercise({
    sectionId: mcqSec.id, level: "A2", title: "DELF A2 Reading — La Vie en Ville",
    xpReward: 20, maxScore: 100, durationSeconds: 600,
    payload: {
      passage: `Marie habite à Paris depuis cinq ans. Elle travaille dans un bureau au centre-ville et prend le métro tous les jours. Le matin, elle achète un café dans une boulangerie près de chez elle. Le soir, elle aime se promener dans les jardins du Luxembourg. Le week-end, elle visite souvent des musées ou va au cinéma avec ses amis.`,
      questions: [
        { text: "How long has Marie lived in Paris?", options: ["Two years", "Three years", "Five years", "Ten years"] },
        { text: "How does Marie travel to work?", options: ["By car", "By bicycle", "By metro", "On foot"] },
        { text: "What does Marie do in the evenings?", options: ["Goes to the cinema", "Walks in the Luxembourg Gardens", "Has dinner at restaurants", "Studies French"] },
      ],
      timeLimit: 600,
    },
    answerKey: { answers: ["Five years", "By metro", "Walks in the Luxembourg Gardens"] },
  });

  // 2. True/False/Not Given
  const tfSec = readingSectionRecords["TRUE_FALSE_NOT_GIVEN"];
  await createExercise({
    sectionId: tfSec.id, level: "B1", title: "True/False/Not Given — French Cuisine",
    xpReward: 20, maxScore: 100, isFree: true,
    payload: {
      passage: `La cuisine française est reconnue mondialement pour sa sophistication et sa diversité. En 2010, l'UNESCO a inscrit le repas gastronomique des Français au patrimoine culturel immatériel de l'humanité. Les repas en France sont traditionnellement composés de plusieurs plats : une entrée, un plat principal, du fromage et un dessert. Le pain, notamment la baguette, est présent à chaque repas. La France produit plus de 1 200 variétés de fromages différents.`,
      statements: [
        { text: "French cuisine was recognized by UNESCO in 2010." },
        { text: "A typical French meal has exactly three courses." },
        { text: "France produces over 1,200 varieties of cheese." },
        { text: "The baguette was invented in the 19th century." },
      ],
    },
    answerKey: { answers: ["true", "false", "true", "not_given"] },
  });

  await createExercise({
    sectionId: tfSec.id, level: "B2", title: "True/False/Not Given — La Révolution Française",
    xpReward: 25, maxScore: 100,
    payload: {
      passage: `La Révolution française, qui débuta en 1789, fut l'un des événements les plus transformateurs de l'histoire mondiale. Elle mit fin à la monarchie absolue et établit les principes de liberté, d'égalité et de fraternité. La prise de la Bastille, le 14 juillet 1789, reste le symbole le plus emblématique de la révolution. La Déclaration des droits de l'homme et du citoyen fut adoptée la même année. Napoléon Bonaparte profita du chaos révolutionnaire pour s'emparer du pouvoir en 1799.`,
      statements: [
        { text: "The French Revolution ended absolute monarchy." },
        { text: "The storming of the Bastille took place on 14 July 1789." },
        { text: "The Declaration was adopted before the storming of the Bastille." },
        { text: "Napoleon participated directly in the storming of the Bastille." },
        { text: "Napoleon took power in 1799." },
      ],
    },
    answerKey: { answers: ["true", "true", "false", "not_given", "true"] },
  });

  // 3. Cloze Fill-in-the-blank
  const clozeSec = readingSectionRecords["CLOZE_FILL_BLANK"];
  await createExercise({
    sectionId: clozeSec.id, level: "A2", title: "Cloze: Daily Routine", isFree: true,
    xpReward: 15, maxScore: 100,
    payload: {
      text: "Je {{BLANK_0}} à sept heures du matin. Ensuite, je prends mon petit-déjeuner qui {{BLANK_1}} du café et des croissants. Je {{BLANK_2}} au travail à huit heures et demie.",
      blanks: 3,
      hint: "Use: me lève / comprend / pars",
    },
    answerKey: { answers: ["me lève", "comprend", "pars"] },
  });

  await createExercise({
    sectionId: clozeSec.id, level: "B1", title: "Cloze: Les Vacances",
    xpReward: 20, maxScore: 100,
    payload: {
      text: "Pendant les grandes vacances, les Français {{BLANK_0}} souvent à la mer ou à la montagne. Il est {{BLANK_1}} de réserver longtemps à l'avance car les hébergements se remplissent rapidement. La France {{BLANK_2}} le pays le plus visité au monde.",
      blanks: 3,
      hint: "Use: partent / conseillé / est",
    },
    answerKey: { answers: ["partent", "conseillé", "est"] },
  });

  await createExercise({
    sectionId: clozeSec.id, level: "B2", title: "Cloze: L'Immigration en France",
    xpReward: 25, maxScore: 100,
    payload: {
      text: "La France a une longue histoire d'immigration qui a {{BLANK_0}} considérablement à sa culture et à son économie. Les immigrants {{BLANK_1}} souvent de pays francophones d'Afrique ou du Maghreb. Le processus d'intégration {{BLANK_2}} de nombreux défis, notamment linguistiques et culturels.",
      blanks: 3,
      hint: "Use: contribué / proviennent / présente",
    },
    answerKey: { answers: ["contribué", "proviennent", "présente"] },
  });

  // 4. Article Comprehension
  const articleSec = readingSectionRecords["ARTICLE_COMPREHENSION"];
  await createExercise({
    sectionId: articleSec.id, level: "B1", title: "Article: Le Système Éducatif Français",
    xpReward: 25, maxScore: 100,
    payload: {
      passage: `Le système éducatif français est l'un des plus anciens et des plus respectés au monde. Il est organisé en plusieurs niveaux : l'école maternelle pour les enfants de 3 à 6 ans, l'école élémentaire jusqu'à 11 ans, le collège de 11 à 15 ans, et le lycée de 15 à 18 ans. Le baccalauréat, ou "bac", est l'examen national qui sanctionne la fin des études secondaires et permet l'accès à l'université. L'enseignement est public, laïque et gratuit du primaire jusqu'à l'université. La laïcité, principe fondamental de la République française, signifie que la religion est exclue de l'espace scolaire.`,
      questions: [
        { text: "At what age do children start école maternelle in France?", options: ["2 years old", "3 years old", "4 years old", "5 years old"] },
        { text: "What is the baccalauréat?", options: ["A primary school exam", "A university entrance exam only", "The national exam marking the end of secondary education", "A professional qualification"] },
        { text: "What does 'laïcité' mean in the context of French schools?", options: ["Schools are private", "Religion is excluded from school spaces", "Students must study religion", "Schools close on religious holidays"] },
      ],
    },
    answerKey: { answers: ["3 years old", "The national exam marking the end of secondary education", "Religion is excluded from school spaces"] },
  });

  await createExercise({
    sectionId: articleSec.id, level: "B2", title: "Article: L'Intelligence Artificielle en France",
    xpReward: 30, maxScore: 100,
    payload: {
      passage: `La France s'est positionnée comme l'un des pays leaders en Europe dans le domaine de l'intelligence artificielle. En 2018, le gouvernement a publié le rapport Villani, du nom du mathématicien et député Cédric Villani, qui proposait une stratégie nationale pour le développement de l'IA. Ce rapport recommandait d'investir 1,5 milliard d'euros sur cinq ans dans la recherche et l'innovation en IA. La France accueille également de nombreuses startups spécialisées dans ce domaine, notamment à Paris, qui est devenu un hub technologique majeur. Des entreprises comme Mistral AI ont émergé comme des acteurs mondiaux dans le développement de modèles de langage.`,
      questions: [
        { text: "What was the Villani Report of 2018?", options: ["A report on climate change", "A national AI development strategy", "A cybersecurity plan", "An education reform proposal"] },
        { text: "How much investment did the report recommend?", options: ["€500 million", "€1 billion", "€1.5 billion over 5 years", "€2 billion"] },
        { text: "What is Mistral AI mentioned as?", options: ["A French government agency", "A hardware manufacturer", "A global player in language model development", "A social media platform"] },
      ],
    },
    answerKey: { answers: ["A national AI development strategy", "€1.5 billion over 5 years", "A global player in language model development"] },
  });

  // 5. Sentence Ordering
  const sentOrdSec = readingSectionRecords["SENTENCE_ORDERING"];
  await createExercise({
    sectionId: sentOrdSec.id, level: "B1", title: "Sentence Ordering: Une Journée Typique", isFree: true,
    xpReward: 20, maxScore: 100,
    payload: {
      sentences: [
        "Il commence par prendre une douche et s'habiller.",
        "Pierre se réveille à sept heures du matin.",
        "Ensuite, il mange un rapide petit-déjeuner avant de partir.",
        "Le soir, il rentre chez lui fatigué mais content.",
        "Il passe la journée au bureau à travailler sur ses projets.",
      ],
    },
    answerKey: { order: [1, 0, 2, 4, 3] },
  });

  await createExercise({
    sectionId: sentOrdSec.id, level: "B2", title: "Sentence Ordering: La Révolution Numérique",
    xpReward: 25, maxScore: 100,
    payload: {
      sentences: [
        "Cette révolution a profondément transformé notre façon de travailler et de communiquer.",
        "Internet est apparu dans les années 1990, d'abord réservé aux chercheurs et aux militaires.",
        "En conséquence, de nouvelles professions ont émergé tandis que d'autres ont disparu.",
        "Progressivement, il s'est démocratisé et est devenu accessible au grand public.",
        "Aujourd'hui, il est difficile d'imaginer notre vie sans connexion numérique.",
      ],
    },
    answerKey: { order: [1, 3, 0, 2, 4] },
  });

  // 6. Grammar in Context
  const grammarCtxSec = readingSectionRecords["GRAMMAR_IN_CONTEXT"];
  await createExercise({
    sectionId: grammarCtxSec.id, level: "B1", title: "Grammar in Context: Passé Composé vs Imparfait",
    xpReward: 20, maxScore: 100,
    payload: {
      passage: "Quand j'{{BLANK_0}} enfant, je {{BLANK_1}} souvent au parc avec mes amis. Un jour, nous {{BLANK_2}} un chien abandonné.",
      blanks: 3,
      hint: "Choose the correct form for each context",
    },
    answerKey: { answers: ["étais", "allais", "avons trouvé"] },
  });

  await createExercise({
    sectionId: grammarCtxSec.id, level: "B2", title: "Grammar in Context: Subjonctif",
    xpReward: 25, maxScore: 100,
    payload: {
      passage: "Il faut que tu {{BLANK_0}} tes devoirs avant de sortir. Je doute qu'il {{BLANK_1}} la vérité. Bien qu'elle {{BLANK_2}} fatiguée, elle continue à travailler.",
      blanks: 3,
      hint: "Use subjunctive forms",
    },
    answerKey: { answers: ["fasses", "dise", "soit"] },
  });

  // 7. Skimming & Scanning
  const skimSec = readingSectionRecords["SKIMMING_SCANNING"];
  await createExercise({
    sectionId: skimSec.id, level: "B1", title: "Scanning: Programme du Festival",
    xpReward: 25, maxScore: 100, durationSeconds: 120,
    payload: {
      passage: `Festival de Musique de Lyon — Programme 2024\n\nVendredi 14 juin:\n18h00 — Ouverture officielle, Place Bellecour\n20h00 — Concert Jazz avec le Quartet Dubois\n22h30 — Feu d'artifice\n\nSamedi 15 juin:\n14h00 — Ateliers de chant pour enfants (gratuit, jusqu'à 12 ans)\n17h00 — Concert Classique — Orchestre de Lyon\n19h30 — Concert Rock — Les Nouveaux Romantiques\n21h00 — Headliner: Christine and the Queens\n\nDimanche 16 juin:\n11h00 — Marché artisanal\n14h00 — Concert Chanson Française — Zaz\n16h30 — Clôture officielle`,
      questions: [
        { text: "At what time does the Jazz concert start on Friday?", options: ["18h00", "20h00", "22h30", "21h00"] },
        { text: "Which event on Saturday is free for children?", options: ["Jazz concert", "Rock concert", "Singing workshops", "Classical concert"] },
        { text: "Who is the Sunday afternoon performer?", options: ["Christine and the Queens", "Zaz", "Les Nouveaux Romantiques", "Quartet Dubois"] },
      ],
      timeLimit: 120,
    },
    answerKey: { answers: ["20h00", "Singing workshops", "Zaz"] },
  });

  await createExercise({
    sectionId: skimSec.id, level: "A2", title: "Scanning: Annonce Immobilière", isFree: true,
    xpReward: 15, maxScore: 100, durationSeconds: 90,
    payload: {
      passage: `À LOUER — Appartement meublé, 3ème arrondissement de Paris\n\nSurface: 45 m²\nPièces: 2 (salon + chambre)\nÉtage: 4ème sur 6 (avec ascenseur)\nLoyer: 1 200€/mois (charges comprises)\nDisponible: 1er septembre 2024\nMétro: Temple (ligne 3) — 3 minutes à pied\nContact: 06 12 34 56 78\nRéférence: APT-2024-089`,
      questions: [
        { text: "What is the monthly rent?", options: ["€950", "€1,100", "€1,200", "€1,500"] },
        { text: "What floor is the apartment on?", options: ["2nd", "3rd", "4th", "6th"] },
        { text: "When is the apartment available?", options: ["1 July 2024", "1 August 2024", "1 September 2024", "1 October 2024"] },
      ],
      timeLimit: 90,
    },
    answerKey: { answers: ["€1,200", "4th", "1 September 2024"] },
  });

  // 8. Vocabulary Flashcards
  const flashSec = readingSectionRecords["VOCABULARY_FLASHCARDS"];
  await createExercise({
    sectionId: flashSec.id, level: "A1", title: "Flashcards: Common Verbs", isFree: true,
    xpReward: 10, maxScore: 100,
    payload: {
      cards: [
        { front: "manger",    back: "to eat",    example: "Je mange une pomme." },
        { front: "boire",     back: "to drink",  example: "Elle boit de l'eau." },
        { front: "parler",    back: "to speak",  example: "Nous parlons français." },
        { front: "écouter",   back: "to listen", example: "Il écoute la radio." },
        { front: "travailler",back: "to work",   example: "Vous travaillez beaucoup." },
        { front: "dormir",    back: "to sleep",  example: "Les enfants dorment." },
        { front: "partir",    back: "to leave",  example: "Je pars à huit heures." },
        { front: "venir",     back: "to come",   example: "Tu viens avec moi?" },
      ],
    },
    answerKey: {},
  });

  await createExercise({
    sectionId: flashSec.id, level: "B1", title: "Flashcards: TEF Vocabulary",
    xpReward: 15, maxScore: 100,
    payload: {
      cards: [
        { front: "la mondialisation",  back: "globalization",    example: "La mondialisation a transformé l'économie." },
        { front: "le développement durable", back: "sustainable development", example: "Nous devons favoriser le développement durable." },
        { front: "la citoyenneté",    back: "citizenship",       example: "La citoyenneté implique des droits et des devoirs." },
        { front: "l'inégalité",       back: "inequality",        example: "Les inégalités sociales persistent dans notre société." },
        { front: "le patrimoine",     back: "heritage/patrimony",example: "La Tour Eiffel fait partie du patrimoine français." },
        { front: "la solidarité",     back: "solidarity",        example: "La solidarité est une valeur républicaine." },
        { front: "l'entrepreneuriat", back: "entrepreneurship",  example: "L'entrepreneuriat est encouragé par le gouvernement." },
        { front: "la laïcité",        back: "secularism",        example: "La laïcité est un principe fondamental en France." },
      ],
    },
    answerKey: {},
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // LISTENING EXERCISES
  // ═══════════════════════════════════════════════════════════════════════════════

  // 1. Listening Mock Tests (using TTS placeholder — real app would use audio files)
  const listenMockSec = listeningSectionRecords["LISTENING_MOCK_TEST"];
  await createExercise({
    sectionId: listenMockSec.id, level: "B1", title: "TEF Listening Mock — Au Restaurant", isFree: true,
    xpReward: 30, maxScore: 100, durationSeconds: 600,
    payload: {
      audioUrl: "/audio/restaurant-dialogue.mp3",
      transcript: "[Audio: A dialogue in a French restaurant between a waiter and customers]",
      questions: [
        { text: "How many people are dining?", options: ["Two", "Three", "Four", "Five"] },
        { text: "What does the woman order as a starter?", options: ["Soup", "Salad", "Pâté", "Foie gras"] },
        { text: "Why does the man ask for a different table?", options: ["Too noisy", "Near a draft", "Too hot", "Bad view"] },
      ],
    },
    answerKey: { answers: ["Two", "Salad", "Too noisy"] },
  });

  await createExercise({
    sectionId: listenMockSec.id, level: "B2", title: "TEF Listening Mock — Radio Actualités",
    xpReward: 35, maxScore: 100, durationSeconds: 720,
    payload: {
      audioUrl: "/audio/radio-news.mp3",
      transcript: "[Audio: A French radio news segment]",
      questions: [
        { text: "What is the main topic of the news report?", options: ["Sports results", "Economic reforms", "Environmental legislation", "Cultural events"] },
        { text: "What percentage reduction in emissions is being proposed?", options: ["20%", "35%", "50%", "65%"] },
        { text: "When is the proposed measure expected to take effect?", options: ["2025", "2030", "2035", "2040"] },
      ],
    },
    answerKey: { answers: ["Environmental legislation", "50%", "2030"] },
  });

  // 2. Dictation
  const dictSec = listeningSectionRecords["DICTATION"];
  await createExercise({
    sectionId: dictSec.id, level: "A2", title: "Dictée A2: La Famille", isFree: true,
    xpReward: 20, maxScore: 100,
    payload: {
      audioUrl: "/audio/dictee-famille.mp3",
      transcript: "J'ai une grande famille. Mon père s'appelle Jean et ma mère s'appelle Marie. J'ai deux sœurs et un frère.",
      plays: 3,
    },
    answerKey: { answers: ["J'ai une grande famille. Mon père s'appelle Jean et ma mère s'appelle Marie. J'ai deux sœurs et un frère."] },
    referenceAnswer: "J'ai une grande famille. Mon père s'appelle Jean et ma mère s'appelle Marie. J'ai deux sœurs et un frère.",
  });

  await createExercise({
    sectionId: dictSec.id, level: "B1", title: "Dictée B1: La Vie Quotidienne",
    xpReward: 25, maxScore: 100,
    payload: {
      audioUrl: "/audio/dictee-quotidien.mp3",
      transcript: "Chaque matin, je me lève de bonne heure pour préparer mon petit-déjeuner. Après avoir mangé, je prends le métro pour aller au travail. La journée est souvent longue mais satisfaisante.",
      plays: 2,
    },
    answerKey: { answers: ["Chaque matin, je me lève de bonne heure pour préparer mon petit-déjeuner. Après avoir mangé, je prends le métro pour aller au travail. La journée est souvent longue mais satisfaisante."] },
    referenceAnswer: "Chaque matin, je me lève de bonne heure pour préparer mon petit-déjeuner. Après avoir mangé, je prends le métro pour aller au travail. La journée est souvent longue mais satisfaisante.",
  });

  // 3. Audio True/False
  const audioTFSec = listeningSectionRecords["AUDIO_TRUE_FALSE"];
  await createExercise({
    sectionId: audioTFSec.id, level: "B1", title: "Audio True/False — Météo",
    xpReward: 20, maxScore: 100,
    payload: {
      audioUrl: "/audio/meteo.mp3",
      transcript: "[Audio: French weather forecast for the week]",
      statements: [
        { text: "It will rain in Paris on Monday." },
        { text: "The south of France will have temperatures above 30°C." },
        { text: "Snow is expected in the Alps." },
        { text: "The weekend will be cloudy everywhere." },
      ],
    },
    answerKey: { answers: ["true", "true", "true", "false"] },
  });

  await createExercise({
    sectionId: audioTFSec.id, level: "A2", title: "Audio True/False — Shopping", isFree: true,
    xpReward: 15, maxScore: 100,
    payload: {
      audioUrl: "/audio/shopping.mp3",
      transcript: "[Audio: A conversation between two friends planning a shopping trip]",
      statements: [
        { text: "The two friends are going to the Champs-Élysées." },
        { text: "They plan to meet at 10am." },
        { text: "One of them wants to buy a birthday gift." },
      ],
    },
    answerKey: { answers: ["false", "true", "true"] },
  });

  // 4. Fill Gap from Audio
  const fillGapSec = listeningSectionRecords["FILL_GAP_AUDIO"];
  await createExercise({
    sectionId: fillGapSec.id, level: "B1", title: "Fill the Gap — Bulletin d'information", isFree: true,
    xpReward: 25, maxScore: 100,
    payload: {
      audioUrl: "/audio/bulletin.mp3",
      text: "Le gouvernement a annoncé un nouveau plan pour réduire les {{BLANK_0}} d'ici 2030. Ce plan prévoit d'investir {{BLANK_1}} milliards d'euros dans les énergies {{BLANK_2}}.",
      blanks: 3,
    },
    answerKey: { answers: ["émissions", "cinquante", "renouvelables"] },
  });

  await createExercise({
    sectionId: fillGapSec.id, level: "B2", title: "Fill the Gap — Conférence Scientifique",
    xpReward: 30, maxScore: 100,
    payload: {
      audioUrl: "/audio/conference.mp3",
      text: "Les chercheurs ont découvert que le {{BLANK_0}} joue un rôle crucial dans la régulation du {{BLANK_1}} humain. Cette découverte pourrait révolutionner le traitement de certaines {{BLANK_2}}.",
      blanks: 3,
    },
    answerKey: { answers: ["microbiome", "système immunitaire", "maladies"] },
  });

  // 5. Match Audio
  const matchAudioSec = listeningSectionRecords["MATCH_AUDIO"];
  await createExercise({
    sectionId: matchAudioSec.id, level: "A2", title: "Match Audio: Situations Quotidiennes", isFree: true,
    xpReward: 20, maxScore: 100,
    payload: {
      audioUrl: "/audio/situations.mp3",
      questions: [
        { text: "Clip 1 — Where does this conversation take place?", options: ["At a bank", "At a pharmacy", "At a supermarket", "At a post office"] },
        { text: "Clip 2 — What is the speaker doing?", options: ["Booking a hotel", "Ordering food", "Buying a train ticket", "Renting a car"] },
        { text: "Clip 3 — What is the relationship between the speakers?", options: ["Boss and employee", "Doctor and patient", "Teacher and student", "Friends"] },
      ],
    },
    answerKey: { answers: ["At a pharmacy", "Buying a train ticket", "Doctor and patient"] },
  });

  await createExercise({
    sectionId: matchAudioSec.id, level: "B1", title: "Match Audio: Registres de Langue",
    xpReward: 25, maxScore: 100,
    payload: {
      audioUrl: "/audio/registres.mp3",
      questions: [
        { text: "Clip 1 — What register is being used?", options: ["Formal", "Informal", "Technical", "Slang"] },
        { text: "Clip 2 — What emotion does the speaker convey?", options: ["Joy", "Anger", "Sadness", "Surprise"] },
        { text: "Clip 3 — What is the main purpose of the speech?", options: ["To inform", "To persuade", "To entertain", "To apologize"] },
      ],
    },
    answerKey: { answers: ["Formal", "Anger", "To persuade"] },
  });

  // 6. Speed Drills
  const speedSec = listeningSectionRecords["SPEED_DRILLS"];
  await createExercise({
    sectionId: speedSec.id, level: "B1", title: "Speed Drill: Slow vs Normal Speed",
    xpReward: 25, maxScore: 100, isFree: true,
    payload: {
      audioSlowUrl: "/audio/speed-slow.mp3",
      audioNormalUrl: "/audio/speed-normal.mp3",
      questions: [
        { text: "What product is being advertised?", options: ["A car", "A phone", "A vacation package", "An insurance plan"] },
        { text: "What is the main selling point?", options: ["Price", "Quality", "Speed of delivery", "Environmental impact"] },
      ],
    },
    answerKey: { answers: ["A vacation package", "Price"] },
  });

  await createExercise({
    sectionId: speedSec.id, level: "B2", title: "Speed Drill: Discours Rapide",
    xpReward: 30, maxScore: 100,
    payload: {
      audioNormalUrl: "/audio/discours-rapide.mp3",
      questions: [
        { text: "What political position is being argued for?", options: ["Lower taxes", "Free university education", "Universal basic income", "Stricter immigration"] },
        { text: "What statistic is mentioned?", options: ["30% unemployment", "€1,200/month minimum", "2 million students", "45% poverty rate"] },
      ],
    },
    answerKey: { answers: ["Universal basic income", "€1,200/month minimum"] },
  });

  // 7. Dialogue Comprehension
  const dialogueSec = listeningSectionRecords["DIALOGUE_COMPREHENSION"];
  await createExercise({
    sectionId: dialogueSec.id, level: "B1", title: "Dialogue: Interview d'Embauche", isFree: true,
    xpReward: 25, maxScore: 100,
    payload: {
      audioUrl: "/audio/interview.mp3",
      transcript: "[A dialogue between a job applicant (Sophie) and an interviewer (M. Dupont) at a marketing firm]",
      questions: [
        { text: "How many years of experience does Sophie have?", options: ["1 year", "2 years", "3 years", "5 years"] },
        { text: "What is the main reason Sophie wants to change jobs?", options: ["Better salary", "Career advancement", "Company culture", "Location"] },
        { text: "When is the second interview scheduled?", options: ["Next Monday", "Next Wednesday", "Next Friday", "In two weeks"] },
      ],
    },
    answerKey: { answers: ["3 years", "Career advancement", "Next Wednesday"] },
  });

  await createExercise({
    sectionId: dialogueSec.id, level: "B2", title: "Dialogue: Débat Politique",
    xpReward: 30, maxScore: 100,
    payload: {
      audioUrl: "/audio/debat.mp3",
      transcript: "[A political debate between two candidates on economic policy]",
      questions: [
        { text: "What economic policy does the first candidate advocate?", options: ["Tax cuts for businesses", "Higher minimum wage", "Reduced public spending", "Trade tariffs"] },
        { text: "How does the second candidate respond to the deficit argument?", options: ["Agrees completely", "Disputes the figures", "Changes the subject", "Attacks personally"] },
        { text: "What do both candidates agree on?", options: ["Immigration policy", "Education reform", "Need to reduce unemployment", "Environmental regulation"] },
      ],
    },
    answerKey: { answers: ["Higher minimum wage", "Disputes the figures", "Need to reduce unemployment"] },
  });

  // 8. Shadowing
  const shadowSec = listeningSectionRecords["SHADOWING"];
  await createExercise({
    sectionId: shadowSec.id, level: "B1", title: "Shadowing: Prononciation Avancée", isFree: true,
    xpReward: 20, maxScore: 100,
    payload: {
      audioUrl: "/audio/shadow-phrase.mp3",
      phrases: [
        "La grenouille a sauté par-dessus le ruisseau.",
        "J'aimerais que tu m'accompagnes au théâtre ce soir.",
        "Nous devrions envisager une solution plus durable.",
      ],
      instructions: "Listen to each phrase, then record yourself repeating it at the same speed and rhythm. Pay attention to liaisons and nasal vowels.",
    },
    answerKey: {},
  });

  await createExercise({
    sectionId: shadowSec.id, level: "B2", title: "Shadowing: Discours Formel",
    xpReward: 25, maxScore: 100,
    payload: {
      audioUrl: "/audio/shadow-formal.mp3",
      phrases: [
        "Nous sommes réunis aujourd'hui pour examiner les défis auxquels fait face notre société.",
        "Il convient de souligner l'importance de la coopération internationale dans ce contexte.",
      ],
      instructions: "Shadow this formal speech segment. Focus on the rhythm of formal French and proper stress patterns.",
    },
    answerKey: {},
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // WRITING EXERCISES
  // ═══════════════════════════════════════════════════════════════════════════════

  const DELF_RUBRIC = {
    taskType: "DELF B1 - formal email",
    wordRange: [120, 150] as [number, number],
    criteria: [
      { id: "task",      label: "Task completion / register", max: 25 },
      { id: "coherence", label: "Coherence & cohesion",       max: 25 },
      { id: "vocab",     label: "Vocabulary range & accuracy", max: 25 },
      { id: "grammar",   label: "Grammar & spelling/accents", max: 25 },
    ],
    total: 100,
  };

  const TEF_ESSAY_RUBRIC = {
    taskType: "TEF B2 - argumentative essay",
    wordRange: [200, 250] as [number, number],
    criteria: [
      { id: "task",      label: "Task fulfillment & argumentation", max: 30 },
      { id: "coherence", label: "Coherence, cohesion & organisation", max: 25 },
      { id: "vocab",     label: "Vocabulary range & precision",       max: 25 },
      { id: "grammar",   label: "Grammatical accuracy",               max: 20 },
    ],
    total: 100,
  };

  // 1. Writing Tasks
  const writingTaskSec = writingSectionRecords["WRITING_TASK"];
  await createExercise({
    sectionId: writingTaskSec.id, level: "B1", title: "DELF B1 Email: Plainte au Propriétaire", isFree: true,
    xpReward: 40, maxScore: 100,
    rubric: DELF_RUBRIC as never,
    referenceAnswer: "Monsieur/Madame, Je me permets de vous contacter concernant les problèmes que je rencontre dans mon appartement depuis plusieurs semaines. En effet, le chauffage ne fonctionne plus correctement et la fenêtre de la cuisine est cassée. J'ai déjà tenté de vous joindre par téléphone à plusieurs reprises sans succès. Je vous serais reconnaissant(e) de bien vouloir faire effectuer les réparations nécessaires dans les plus brefs délais. En attendant votre réponse, je vous prie d'agréer, Monsieur/Madame, l'expression de mes salutations distinguées.",
    payload: {
      prompt: "You are renting an apartment and there are several problems: the heating doesn't work and a window is broken. Write a formal complaint email to your landlord requesting urgent repairs. (120-150 words)",
      context: "DELF B1 Writing Task",
      wordRange: [120, 150],
      rubric: DELF_RUBRIC,
    },
    answerKey: {},
  });

  await createExercise({
    sectionId: writingTaskSec.id, level: "B2", title: "TEF B2 Essay: Les Réseaux Sociaux",
    xpReward: 50, maxScore: 100,
    rubric: TEF_ESSAY_RUBRIC as never,
    referenceAnswer: "Les réseaux sociaux ont profondément transformé nos modes de communication et d'information. D'un côté, ils permettent de maintenir des liens sociaux, de partager des informations rapidement et de donner une voix à des groupes marginalisés. D'un autre côté, ils favorisent la désinformation, créent des bulles idéologiques et peuvent nuire à la santé mentale des utilisateurs, notamment des jeunes. Il est indéniable que les plateformes numériques sont devenues des espaces de pouvoir qui influencent l'opinion publique et même les processus démocratiques. Face à ces défis, une régulation équilibrée s'impose, qui protège la liberté d'expression tout en limitant les abus. En conclusion, si les réseaux sociaux offrent d'indéniables opportunités, leur impact négatif nécessite une approche critique et une utilisation consciente.",
    payload: {
      prompt: "Les réseaux sociaux : bienfait ou fléau pour la société ? Rédigez un texte argumenté en français présentant différents points de vue. (200-250 mots)",
      context: "TEF B2 Writing Task",
      wordRange: [200, 250],
      rubric: TEF_ESSAY_RUBRIC,
    },
    answerKey: {},
  });

  await createExercise({
    sectionId: writingTaskSec.id, level: "A2", title: "DELF A2 Email: Invitation",
    xpReward: 25, maxScore: 100,
    rubric: { taskType: "DELF A2 - informal email", wordRange: [60, 80] as [number, number], criteria: [{ id: "task", label: "Task completion", max: 50 }, { id: "grammar", label: "Grammar & vocabulary", max: 50 }], total: 100 } as never,
    referenceAnswer: "Salut Marie ! Je t'écris pour t'inviter à mon anniversaire. La fête aura lieu samedi prochain chez moi, à partir de 20 heures. Il y aura de la musique et un buffet. J'espère que tu pourras venir ! N'oublie pas de me répondre. À bientôt, Sophie",
    payload: {
      prompt: "Write an informal email to a friend inviting them to your birthday party next Saturday at 8pm. Include the address and what to expect. (60-80 words)",
      context: "DELF A2 Writing Task",
      wordRange: [60, 80],
      rubric: { taskType: "DELF A2 - informal email", wordRange: [60, 80], criteria: [{ id: "task", label: "Task completion", max: 50 }, { id: "grammar", label: "Grammar & vocabulary", max: 50 }], total: 100 },
    },
    answerKey: {},
  });

  // 2. Jumble Words
  const jumbleSec = writingSectionRecords["JUMBLE_WORDS"];
  await createExercise({
    sectionId: jumbleSec.id, level: "A1", title: "Jumble: Présentation Personnelle", isFree: true,
    xpReward: 10, maxScore: 100,
    payload: {
      words: ["Paris.", "J'habite", "Dupont.", "m'appelle", "Je", "à", "Marie"],
      hint: "Build a sentence: My name is Marie Dupont. I live in Paris.",
    },
    answerKey: { sentence: "Je m'appelle Marie Dupont. J'habite à Paris." },
  });

  await createExercise({
    sectionId: jumbleSec.id, level: "A2", title: "Jumble: Au Restaurant",
    xpReward: 15, maxScore: 100,
    payload: {
      words: ["une", "Je", "et", "s'il", "boire", "voudrais", "salade", "de", "l'eau", "vous", "plaît."],
      hint: "Order food at a restaurant.",
    },
    answerKey: { sentence: "Je voudrais une salade et boire de l'eau s'il vous plaît." },
  });

  await createExercise({
    sectionId: jumbleSec.id, level: "B1", title: "Jumble: Subjonctif",
    xpReward: 20, maxScore: 100,
    payload: {
      words: ["que", "fasses", "Il", "avant", "tes", "faut", "de", "devoirs", "tu", "sortir."],
      hint: "Use the subjunctive mood correctly.",
    },
    answerKey: { sentence: "Il faut que tu fasses tes devoirs avant de sortir." },
  });

  // 3. Sentence Construction
  const sentConsSec = writingSectionRecords["SENTENCE_CONSTRUCTION"];
  await createExercise({
    sectionId: sentConsSec.id, level: "A2", title: "Sentence Construction: Daily Activities", isFree: true,
    xpReward: 15, maxScore: 100,
    payload: {
      words: ["faire", "la", "cuisine", "chaque", "j'aime", "soir"],
      hint: "Build a sentence about liking to cook every evening.",
    },
    answerKey: { sentence: "J'aime faire la cuisine chaque soir." },
  });

  await createExercise({
    sectionId: sentConsSec.id, level: "B1", title: "Sentence Construction: Relative Clauses",
    xpReward: 20, maxScore: 100,
    payload: {
      words: ["que", "rencontré", "hier", "L'homme", "professeur.", "j'ai", "est", "mon"],
      hint: "Use a relative clause with 'que'.",
    },
    answerKey: { sentence: "L'homme que j'ai rencontré hier est mon professeur." },
  });

  await createExercise({
    sectionId: sentConsSec.id, level: "B2", title: "Sentence Construction: Passive Voice",
    xpReward: 25, maxScore: 100,
    payload: {
      words: ["par", "construit", "a", "La", "été", "1889.", "tour", "en", "Eiffel", "Gustave"],
      hint: "Construct a sentence in the passive voice.",
    },
    answerKey: { sentence: "La tour Eiffel a été construite par Gustave en 1889." },
  });

  // 4. Guided Paragraph
  const guidedSec = writingSectionRecords["GUIDED_PARAGRAPH"];
  await createExercise({
    sectionId: guidedSec.id, level: "B1", title: "Guided Paragraph: Mon Quartier", isFree: true,
    xpReward: 35, maxScore: 100,
    rubric: { taskType: "Guided paragraph - description", wordRange: [80, 120] as [number, number], criteria: [{ id: "task", label: "Description quality", max: 40 }, { id: "vocab", label: "Vocabulary", max: 30 }, { id: "grammar", label: "Grammar", max: 30 }], total: 100 } as never,
    referenceAnswer: "J'habite dans le quartier du Marais, dans le 3ème arrondissement de Paris. C'est un quartier très animé avec de nombreux cafés, restaurants et galeries d'art. J'adore me promener dans les petites rues pavées et découvrir les boulangeries artisanales. Le week-end, il y a toujours beaucoup de touristes qui visitent la Place des Vosges. Mon endroit préféré est un petit café au coin de la rue où je passe souvent mes matinées à lire.",
    payload: {
      prompt: "Write a paragraph (80-120 words) describing your neighbourhood. Include: where it is located, what you like about it, what facilities it has, and your favourite place there.",
      context: "Guided paragraph writing",
      wordRange: [80, 120],
      rubric: { taskType: "Guided paragraph - description", wordRange: [80, 120], criteria: [{ id: "task", label: "Description quality", max: 40 }, { id: "vocab", label: "Vocabulary", max: 30 }, { id: "grammar", label: "Grammar", max: 30 }], total: 100 },
    },
    answerKey: {},
  });

  await createExercise({
    sectionId: guidedSec.id, level: "B2", title: "Guided Paragraph: Argumenter — Le Télétravail",
    xpReward: 45, maxScore: 100,
    rubric: { taskType: "Guided paragraph - argumentation", wordRange: [150, 200] as [number, number], criteria: [{ id: "task", label: "Argumentation & structure", max: 40 }, { id: "coherence", label: "Coherence", max: 25 }, { id: "vocab", label: "Vocabulary", max: 20 }, { id: "grammar", label: "Grammar", max: 15 }], total: 100 } as never,
    referenceAnswer: "Le télétravail a connu une expansion massive depuis la pandémie de Covid-19. Si cette pratique offre indéniablement des avantages — gain de temps dans les transports, meilleur équilibre vie professionnelle/personnelle, réduction de l'empreinte carbone — elle présente aussi des inconvénients notables. L'isolement social, la difficulté à séparer vie privée et professionnelle, et les risques pour la santé physique liés à la sédentarité constituent des défis réels. De plus, le télétravail n'est pas accessible à tous les secteurs d'activité, ce qui creuse les inégalités. Une approche hybride, combinant présence au bureau et travail à domicile, semble être la solution la plus équilibrée pour répondre aux besoins des entreprises et des salariés.",
    payload: {
      prompt: "Rédigez un paragraphe argumenté (150-200 mots) sur les avantages et inconvénients du télétravail. Présentez les deux côtés et concluez avec votre opinion.",
      context: "Guided paragraph - argumentation",
      wordRange: [150, 200],
      rubric: { taskType: "Guided paragraph - argumentation", wordRange: [150, 200], criteria: [{ id: "task", label: "Argumentation & structure", max: 40 }, { id: "coherence", label: "Coherence", max: 25 }, { id: "vocab", label: "Vocabulary", max: 20 }, { id: "grammar", label: "Grammar", max: 15 }], total: 100 },
    },
    answerKey: {},
  });

  // 5. Grammar Correction
  const gramCorrSec = writingSectionRecords["GRAMMAR_CORRECTION"];
  await createExercise({
    sectionId: gramCorrSec.id, level: "A2", title: "Grammar Correction: Accord des Adjectifs", isFree: true,
    xpReward: 15, maxScore: 100,
    payload: {
      text: "Hier, j'ai acheté une robe nouveau et des chaussures blanc pour la fête. Ma sœur est venu avec moi au magasin.",
      instruction: "Find and correct all grammar errors in the text above.",
      errorCount: 3,
    },
    answerKey: {
      corrections: [
        { wrong: "robe nouveau", correct: "robe nouvelle", reason: "robe is feminine, so the adjective must be feminine: nouvelle" },
        { wrong: "chaussures blanc", correct: "chaussures blanches", reason: "chaussures is feminine plural: blanches" },
        { wrong: "Ma sœur est venu", correct: "Ma sœur est venue", reason: "With être, past participle agrees with subject (feminine): venue" },
      ],
    },
  });

  await createExercise({
    sectionId: gramCorrSec.id, level: "B1", title: "Grammar Correction: Temps du Passé",
    xpReward: 20, maxScore: 100,
    payload: {
      text: "Quand j'ai été jeune, je jouais souvent au football. Un jour, j'ai tombé et me suis blessé le genou. Depuis ce jour, je n'ai plus joué au sport.",
      instruction: "Find and correct all grammar errors.",
      errorCount: 2,
    },
    answerKey: {
      corrections: [
        { wrong: "j'ai été jeune", correct: "j'étais jeune", reason: "Habitual or descriptive past states use the imparfait, not passé composé" },
        { wrong: "j'ai tombé", correct: "je suis tombé", reason: "Tomber is conjugated with être, not avoir, in passé composé" },
      ],
    },
  });

  await createExercise({
    sectionId: gramCorrSec.id, level: "B2", title: "Grammar Correction: Subjonctif et Conditionnel",
    xpReward: 25, maxScore: 100,
    payload: {
      text: "Si j'aurais su, j'aurais venu plus tôt. Il faut que vous faites attention à vos affaires. Je voudrais que tu m'aides demain.",
      instruction: "Identify and correct all errors. Note: some sentences are correct.",
      errorCount: 2,
    },
    answerKey: {
      corrections: [
        { wrong: "Si j'aurais su", correct: "Si j'avais su", reason: "In si-clauses expressing unreality, use plus-que-parfait, not conditionnel passé" },
        { wrong: "que vous faites", correct: "que vous fassiez", reason: "After 'il faut que', use the subjunctive: fassiez" },
      ],
    },
  });

  // 6. Translation
  const translSec = writingSectionRecords["TRANSLATION"];
  await createExercise({
    sectionId: translSec.id, level: "A2", title: "Translation: Introducing Yourself", isFree: true,
    xpReward: 15, maxScore: 100,
    rubric: { taskType: "Translation EN>FR", wordRange: [30, 50] as [number, number], criteria: [{ id: "accuracy", label: "Accuracy", max: 60 }, { id: "vocab", label: "Vocabulary choice", max: 20 }, { id: "grammar", label: "Grammar", max: 20 }], total: 100 } as never,
    referenceAnswer: "Bonjour, je m'appelle Thomas. J'ai vingt-cinq ans et je viens de Londres. Je travaille comme ingénieur et j'apprends le français depuis deux ans.",
    payload: {
      translationText: "Hello, my name is Thomas. I am twenty-five years old and I come from London. I work as an engineer and I have been learning French for two years.",
      prompt: "Translate the above sentence into French.",
      rubric: { taskType: "Translation EN>FR", wordRange: [30, 50], criteria: [{ id: "accuracy", label: "Accuracy", max: 60 }, { id: "vocab", label: "Vocabulary choice", max: 20 }, { id: "grammar", label: "Grammar", max: 20 }], total: 100 },
    },
    answerKey: {},
  });

  await createExercise({
    sectionId: translSec.id, level: "B1", title: "Translation: Environmental Paragraph",
    xpReward: 25, maxScore: 100,
    rubric: { taskType: "Translation EN>FR - B1", wordRange: [60, 90] as [number, number], criteria: [{ id: "accuracy", label: "Translation accuracy", max: 50 }, { id: "vocab", label: "Register & vocabulary", max: 25 }, { id: "grammar", label: "Grammar & syntax", max: 25 }], total: 100 } as never,
    referenceAnswer: "La protection de l'environnement est l'un des défis les plus importants de notre époque. Chaque individu peut contribuer en réduisant sa consommation d'énergie, en recyclant ses déchets et en choisissant des modes de transport plus écologiques. Les gouvernements doivent également jouer leur rôle en adoptant des politiques environnementales ambitieuses.",
    payload: {
      translationText: "Protecting the environment is one of the most important challenges of our time. Every individual can contribute by reducing their energy consumption, recycling their waste, and choosing more eco-friendly means of transport. Governments must also play their role by adopting ambitious environmental policies.",
      prompt: "Translate the above paragraph into French.",
      rubric: { taskType: "Translation EN>FR - B1", wordRange: [60, 90], criteria: [{ id: "accuracy", label: "Translation accuracy", max: 50 }, { id: "vocab", label: "Register & vocabulary", max: 25 }, { id: "grammar", label: "Grammar & syntax", max: 25 }], total: 100 },
    },
    answerKey: {},
  });

  await createExercise({
    sectionId: translSec.id, level: "B2", title: "Translation: Business Email",
    xpReward: 35, maxScore: 100,
    rubric: { taskType: "Translation EN>FR - formal B2", wordRange: [80, 110] as [number, number], criteria: [{ id: "accuracy", label: "Accuracy & register", max: 50 }, { id: "vocab", label: "Professional vocabulary", max: 30 }, { id: "grammar", label: "Grammar", max: 20 }], total: 100 } as never,
    referenceAnswer: "Madame, Monsieur, Je vous contacte au sujet de votre offre d'emploi pour le poste d'ingénieur logiciel publiée sur votre site web. Fort d'une expérience de cinq ans dans le développement d'applications mobiles, je souhaite vous soumettre ma candidature. Vous trouverez ci-joint mon curriculum vitae et ma lettre de motivation. Je suis disponible pour un entretien à votre convenance. Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    payload: {
      translationText: "Dear Sir/Madam, I am writing to you regarding your job offer for the software engineer position posted on your website. With five years of experience in mobile application development, I wish to submit my application. Please find attached my CV and cover letter. I am available for an interview at your convenience. Yours faithfully.",
      prompt: "Translate this business email into formal French.",
      rubric: { taskType: "Translation EN>FR - formal B2", wordRange: [80, 110], criteria: [{ id: "accuracy", label: "Accuracy & register", max: 50 }, { id: "vocab", label: "Professional vocabulary", max: 30 }, { id: "grammar", label: "Grammar", max: 20 }], total: 100 },
    },
    answerKey: {},
  });

  // 7. Verb Conjugation Drills
  const conjugSec = writingSectionRecords["VERB_CONJUGATION"];
  await createExercise({
    sectionId: conjugSec.id, level: "A1", title: "Présent: Verbes Réguliers -ER", isFree: true,
    xpReward: 15, maxScore: 100,
    payload: {
      instructions: "Conjugate each verb in the présent de l'indicatif.",
      items: [
        { verb: "parler",  pronoun: "je",   tense: "Présent" },
        { verb: "manger",  pronoun: "nous", tense: "Présent" },
        { verb: "travailler", pronoun: "vous", tense: "Présent" },
        { verb: "écouter", pronoun: "ils",  tense: "Présent" },
        { verb: "aimer",   pronoun: "tu",   tense: "Présent" },
      ],
    },
    answerKey: { answers: ["parle", "mangeons", "travaillez", "écoutent", "aimes"] },
  });

  await createExercise({
    sectionId: conjugSec.id, level: "A2", title: "Passé Composé: Verbes Irréguliers",
    xpReward: 20, maxScore: 100,
    payload: {
      instructions: "Conjugate in passé composé. Note which verbs use être or avoir.",
      items: [
        { verb: "aller",   pronoun: "je (m.)",  tense: "Passé Composé" },
        { verb: "venir",   pronoun: "elle",     tense: "Passé Composé" },
        { verb: "faire",   pronoun: "nous",     tense: "Passé Composé" },
        { verb: "prendre", pronoun: "ils",      tense: "Passé Composé" },
        { verb: "avoir",   pronoun: "vous",     tense: "Passé Composé" },
      ],
    },
    answerKey: { answers: ["suis allé", "est venue", "avons fait", "ont pris", "avez eu"] },
  });

  await createExercise({
    sectionId: conjugSec.id, level: "B1", title: "Subjonctif Présent",
    xpReward: 25, maxScore: 100,
    payload: {
      instructions: "Conjugate in the subjonctif présent after 'Il faut que...' or 'Je veux que...'",
      items: [
        { verb: "être",   pronoun: "tu",   tense: "Subjonctif Présent" },
        { verb: "avoir",  pronoun: "vous", tense: "Subjonctif Présent" },
        { verb: "faire",  pronoun: "ils",  tense: "Subjonctif Présent" },
        { verb: "aller",  pronoun: "je",   tense: "Subjonctif Présent" },
        { verb: "savoir", pronoun: "elle", tense: "Subjonctif Présent" },
      ],
    },
    answerKey: { answers: ["sois", "ayez", "fassent", "aille", "sache"] },
  });

  // 8. Spelling & Accents
  const spellSec = writingSectionRecords["SPELLING_ACCENTS"];
  await createExercise({
    sectionId: spellSec.id, level: "A1", title: "Accents: Type with Correct Accents", isFree: true,
    xpReward: 10, maxScore: 100,
    payload: {
      text: "Type the following words with correct accents:\nBlank 0: café (coffee)\nBlank 1: être (to be)\nBlank 2: façade (facade)\nBlank 3: naïf (naive)\nBlank 4: fête (party)",
      blanks: 5,
      hint: "é è ê ë à â ù û ô ç î ï œ æ",
    },
    answerKey: { answers: ["café", "être", "façade", "naïf", "fête"] },
  });

  await createExercise({
    sectionId: spellSec.id, level: "B1", title: "Accents: Homophones and Accents",
    xpReward: 20, maxScore: 100,
    payload: {
      text: "Choose the correctly spelled word in context:\nBlank 0: Il {{BLANK_0}} venu tard. (a/à)\nBlank 1: Je préfère le café {{BLANK_1}} thé. (au/aux)\nBlank 2: C'{{BLANK_2}} mon livre préféré. (est/et)\nBlank 3: Il ne veut {{BLANK_3}} partir. (pas/peut)\nBlank 4: Je l'{{BLANK_4}} rencontré hier. (ai/est)",
      blanks: 5,
    },
    answerKey: { answers: ["a", "au", "est", "pas", "ai"] },
  });

  await createExercise({
    sectionId: spellSec.id, level: "B2", title: "Dictée Orthographique: Accords Complexes",
    xpReward: 30, maxScore: 100,
    payload: {
      text: "Type the plural and feminine forms:\nBlank 0: beau (feminine singular): {{BLANK_0}}\nBlank 1: vieil (masculine plural): {{BLANK_1}}\nBlank 2: long (feminine plural): {{BLANK_2}}\nBlank 3: nouveau (feminine plural): {{BLANK_3}}\nBlank 4: doux (feminine singular): {{BLANK_4}}",
      blanks: 5,
    },
    answerKey: { answers: ["belle", "vieux", "longues", "nouvelles", "douce"] },
  });

  console.log("✅ Seeding complete!");
  console.log("📖 Reading:   sections + exercises seeded");
  console.log("🎧 Listening: sections + exercises seeded");
  console.log("✍️  Writing:   sections + exercises seeded");
  console.log("🏆 Achievements seeded");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
