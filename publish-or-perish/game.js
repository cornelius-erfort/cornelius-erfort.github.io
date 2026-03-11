/**
 * Publish or Perish – Political Science Academy
 * Phase 1: Character select + BA (courses, free time, thesis, escape to heaven)
 */

(function () {
  const STAT_NAMES = ['intelligence', 'network', 'mentalHealth', 'luck', 'money', 'hIndex'];
  const STAT_MIN = 0;
  const STAT_MAX = 100;
  const CONFERENCE_COST = 25; // research day / showcase (BA); Skip costs 0
  const SAVE_VERSION = 2;
  const CONFERENCE_MA_COST = 35; // colloquium/workshop cost (MA)
  const RANDOM_VARIANCE = 6; // ± for each effect
  const SOCIAL_FREE_TIME_IDS = ['party', 'drinks', 'mixer', 'study-group']; // choices that count as "socializing" for random kids event
  const KIDS_THRESHOLD = 2; // how many social free-time picks before roll
  const KIDS_EFFECTS = { intelligence: -6, network: 4, mentalHealth: -14, luck: 0 }; // time and stress
  const SABBATICAL_MENTAL_HEALTH_THRESHOLD = 18; // below this: forced sabbatical
  const SABBATICAL_RECOVERY = 36; // mental health restored after completing the mini-game
  const SABBATICAL_STRESS_PER_CLICK = 15; // stress (100→0) drained per "Rest" click
  const BUREAUCRACY_BLUE_SIGNS_NEEDED = 5;
  const BUREAUCRACY_STRIKES_MAX = 3;
  const BUREAUCRACY_FORM_COLORS = ['red', 'green', 'yellow', 'blue'];
  const BUREAUCRACY_FORM_NAMES = [
    'Form 7B – Sign here', 'Annex C (Declaration)', 'Request for extension – Section 2',
    'Module registration – Page 3', 'Data consent form (GDPR)', 'Room booking – Block A',
    'Travel expenses – Part 1', 'Ethics checklist – Signature', 'Supervisor meeting log',
    'Library access renewal', 'Exam deferral – Appendix B', 'Thesis submission form',
    'Conference leave request', 'Equipment loan agreement', 'Room 101 – Enquiry slip',
    'Teaching evaluation – Cover sheet', 'Grant budget – Approval line', 'Leave form L2',
    'Workshop attendance – Sign', 'Peer review consent', 'Department memo – Acknowledge',
    'IT access request – Final page', 'Lab safety – Section 4', 'Committee minutes – Approve',
    'Referee request form', 'Course change – Registrar copy', 'Fee waiver – Declaration',
    'Transcript request – Authorise', 'Plagiarism declaration', 'Co-author agreement – Sign'
  ];
  const BUREAUCRACY_REWARD = { intelligence: 0, network: 0, mentalHealth: 4, luck: 2, money: 0 };
  const COURSE_FULL_BASE_CHANCE = 0.28;
  const COURSE_FULL_LUCK_FACTOR = 0.25;
  const MAX_COURSES_DISPLAY = 4;
  // Each entry: label on the window, hint given when you're at a *wrong* window pointing to this one
  const BUREAUCRACY_WINDOWS = [
    { label: 'Room 101 – General enquiries', hint: 'the one that sends everyone else away with a leaflet' },
    { label: 'Form 7B desk', hint: 'where you hand in the blue form they gave you at enrolment' },
    { label: 'Registrar', hint: 'the main student registry — not the building, the actual desk' },
    { label: 'Student services', hint: 'the office that deals with extensions and hardship' },
    { label: 'Floor 2 – Permits', hint: 'second floor, for the thing you need to enter the exam hall' },
    { label: 'Room 204 – Stamps', hint: 'the room with the stamp machine everyone queues for' },
    { label: 'Examinations office', hint: 'where they tell you which room your exam is in' },
    { label: 'Finance – Fee clearance', hint: 'where you prove you paid so you can register' },
    { label: 'Dept. secretary', hint: 'the person who signs the form your supervisor already signed' },
  ];

  const SABBATICAL_DAY_MESSAGES = [
    'Day 1: You stare at the wall. It’s fine.',
    'Day 2: You take a nap. No emails.',
    'Day 3: You go for a walk. You forget what an inbox is.',
    'Day 4: You read a book. Not a manuscript. A book.',
    'Day 5: You do nothing. It’s recommended.',
    'Day 6: You sleep in. The department survives without you.',
    'Day 7: You feel almost human. Sabbatical complete.',
  ];
  const SABBATICAL_COIN_VALUE = 5;
  const SABBATICAL_DRINK_MH_PENALTY = -8;
  const SABBATICAL_GRAVITY = 0.38;
  const SABBATICAL_SCROLL_SPEED = 2.8;
  const SABBATICAL_JUMP_GAP_VY = -10;
  const SABBATICAL_JUMP_HOP_VY = -5.5;
  const SABBATICAL_CHAR_SCREEN_X = 100;
  const SABBATICAL_GROUND_Y_RATIO = 0.78;
  const SABBATICAL_SEGMENT_COUNT = 28;
  const SABBATICAL_GAP_WIDTH_MIN = 42;
  const SABBATICAL_GAP_WIDTH_MAX = 72;
  const SABBATICAL_PLATFORM_SHORT_MIN = 50;
  const SABBATICAL_PLATFORM_SHORT_MAX = 85;
  const SABBATICAL_PLATFORM_LONG_MIN = 95;
  const SABBATICAL_PLATFORM_LONG_MAX = 140;
  const SABBATICAL_SPLASHES_MAX = 3;

  const PHD_APP_MONEY_PER = 22;
  const PHD_APP_MH_PER = -12;
  const PHD_APP_MAX = 5;
  const PHD_APP_MIN_MH_AFTER = 18;
  const PHD_APP_REST_MH = 22; // wellbeing from "Take a break" when stuck

  const BIKE_COURIER_EUROS_PER_DELIVERY = 8;
  const BIKE_COURIER_MH_BONUS = 8; // wellbeing from exercise and fresh air
  const BIKE_COURIER_MAX_CRASHES = 3;
  const BIKE_COURIER_OBSTACLE_SPEED = 4;
  const BIKE_COURIER_JUMP_VY = -9;
  const BIKE_COURIER_GRAVITY = 0.4;
  const BIKE_COURIER_GROUND_Y_RATIO = 0.82;
  const BIKE_COURIER_SPAWN_INTERVAL_MIN = 70;
  const BIKE_COURIER_SPAWN_INTERVAL_MAX = 140;

  const PHD_PROGRAMS = [
    { id: 'safe', name: 'Solid regional programme', desc: 'High acceptance rate. No special requirements.', baseAccept: 0.58, minNetwork: 0, minLuck: 0 },
    { id: 'mid', name: 'Competitive department', desc: 'Good reputation. Standard odds.', baseAccept: 0.42, minNetwork: 0, minLuck: 0 },
    { id: 'teaching', name: 'Teaching-heavy programme', desc: 'More teaching, less pressure to publish. Slightly easier to get in.', baseAccept: 0.50, minNetwork: 0, minLuck: 0 },
    { id: 'prestigious', name: 'Prestigious university', desc: 'Requires a decent network — they want to know who you are.', baseAccept: 0.28, minNetwork: 48, minLuck: 0 },
    { id: 'dream_network', name: 'Dream programme (well-connected)', desc: 'Only visible if your network is strong. Very competitive.', baseAccept: 0.18, minNetwork: 68, minLuck: 0 },
    { id: 'dream_luck', name: 'Dream programme (long shot)', desc: 'Sometimes the stars align. Requires luck to even consider applying.', baseAccept: 0.12, minNetwork: 0, minLuck: 55 },
  ];

  const DIFFICULTIES = {
    easy: {
      name: 'Easy',
      description: 'See stat effects and random-event chances. Lower bars to pass. Less variance, fewer surprises.',
      variance: 3,
      gainScale: 1.0,
      kidsChance: 0.12,
      maInt: 38,
      maMentalHealth: 20,
      showTransparency: true,
      formDisplayMs: 1400,
      formPauseMs: 500,
    },
    medium: {
      name: 'Medium',
      description: 'Default. No effect hints. Standard thresholds and randomness. Gains are reduced so stats rarely max out.',
      variance: 6,
      gainScale: 0.78,
      kidsChance: 0.28,
      maInt: 45,
      maMentalHealth: 25,
      showTransparency: false,
      formDisplayMs: 1000,
      formPauseMs: 350,
    },
    hard: {
      name: 'Hard',
      description: 'No hints. Higher bars to pass. More variance, more random events (e.g. kids). Gains reduced further.',
      variance: 9,
      gainScale: 0.6,
      kidsChance: 0.45,
      maInt: 52,
      maMentalHealth: 32,
      showTransparency: false,
      formDisplayMs: 700,
      formPauseMs: 220,
    },
  };

  // ----- Content: Characters -----
  const CHARACTERS = [
    {
      id: 'resilient',
      name: 'The Resilient',
      description: 'You bounce back. Grades might take a bit longer to click, but you don’t crack under pressure.',
      flavour: 'Starts strong in one area, weaker in another. Survives longer; gets smart slower.',
      start: { intelligence: 35, network: 40, mentalHealth: 75, luck: 45, money: 28, hIndex: 0 },
      gainMult: { intelligence: 0.85, network: 1.0, mentalHealth: 1.25, luck: 1.0, money: 1.0, hIndex: 1.0 },
      lossMult: { intelligence: 1.0, network: 1.0, mentalHealth: 0.75, luck: 1.0, money: 1.0, hIndex: 1.0 },
      avatar: { head: '#e0c4a0', body: '#5a7a5a', leg: '#3d3d2a', book: '#8fbc8f' },
    },
    {
      id: 'natural',
      name: 'The Natural',
      description: 'Things just make sense. Too bad you’d rather read than schmooze.',
      flavour: 'Grades come easy. Networking does not.',
      start: { intelligence: 70, network: 30, mentalHealth: 50, luck: 50, money: 32, hIndex: 0 },
      gainMult: { intelligence: 1.2, network: 0.8, mentalHealth: 1.0, luck: 1.0, money: 1.0, hIndex: 1.0 },
      lossMult: { intelligence: 0.9, network: 1.0, mentalHealth: 1.0, luck: 1.0, money: 1.0, hIndex: 1.0 },
      avatar: { head: '#e0c4a0', body: '#7aa2f7', leg: '#4a4a6a', book: '#ffcc00' },
    },
    {
      id: 'connector',
      name: 'The Connector',
      description: 'Everyone knows you. You’re great at people. You’re also exhausted.',
      flavour: 'Great at people; burns out easier.',
      start: { intelligence: 45, network: 70, mentalHealth: 40, luck: 45, money: 35, hIndex: 0 },
      gainMult: { intelligence: 1.0, network: 1.25, mentalHealth: 0.9, luck: 1.0, money: 1.0, hIndex: 1.0 },
      lossMult: { intelligence: 1.0, network: 0.9, mentalHealth: 1.2, luck: 1.0, money: 1.0, hIndex: 1.0 },
      avatar: { head: '#e0c4a0', body: '#c47a5a', leg: '#3a3a4a', book: '#a08060' },
    },
    {
      id: 'lucky',
      name: 'The Lucky One',
      description: 'The dice like you. Your baseline stats are nothing special — but when it matters, things tend to go your way.',
      flavour: 'RNG is kinder. The rest is average.',
      start: { intelligence: 45, network: 45, mentalHealth: 50, luck: 75, money: 30, hIndex: 0 },
      gainMult: { intelligence: 1.0, network: 1.0, mentalHealth: 1.0, luck: 1.2, money: 1.0, hIndex: 1.0 },
      lossMult: { intelligence: 1.0, network: 1.0, mentalHealth: 1.0, luck: 0.8, money: 1.0, hIndex: 1.0 },
      avatar: { head: '#e0c4a0', body: '#9a7aca', leg: '#4a4a5a', book: '#e8b824' },
    },
  ];

  // ----- Content: BA choices -----
  const BA_COURSES_Y1 = [
    {
      id: 'methods-strict',
      title: 'Quantitative Methods I',
      desc: 'Prof. Strict — “R is your friend.” Rigorous, notorious grader.',
      effects: { intelligence: 14, network: -2, mentalHealth: -8, luck: 0 },
      lectureType: 'formal',
    },
    {
      id: 'theory-weber',
      title: 'Classical Political Theory',
      desc: 'Prof. Weber — Great lectures, heavy reading. You’ll know your Hobbes.',
      effects: { intelligence: 10, network: 4, mentalHealth: -4, luck: 0 },
      lectureType: 'seminar',
    },
    {
      id: 'ir-global',
      title: 'Introduction to IR',
      desc: 'Prof. Global — Big name, big seminar. Networking goldmine.',
      effects: { intelligence: 6, network: 16, mentalHealth: -6, luck: 0 },
      lectureType: 'seminar',
    },
    {
      id: 'comparative-easy',
      title: 'Comparative Politics Survey',
      desc: 'Prof. Easy — Lighter load, friendly. Your GPA will thank you.',
      effects: { intelligence: 4, network: 6, mentalHealth: 6, luck: 2 },
      lectureType: 'casual',
    },
    {
      id: 'qual-y1',
      title: 'Introduction to Qualitative Methods',
      desc: 'Prof. Field — Interviews, case studies, “thick description”. You learn to say “it’s more nuanced” with a straight face.',
      effects: { intelligence: 10, network: 6, mentalHealth: -2, luck: 0 },
      lectureType: 'casual',
    },
    {
      id: 'programming-y1',
      title: 'Programming for Social Science',
      desc: 'Prof. Script — R and Python basics. Half the class still can’t install the toolchain. You might become the other half.',
      effects: { intelligence: 12, network: 2, mentalHealth: -6, luck: 4 },
      lectureType: 'formal',
    },
    {
      id: 'casual-y1',
      title: 'Politics & Society: The Basics',
      desc: 'Prof. Chill — “Read the news. We’ll discuss.” Actually not a joke. Very popular. You might even enjoy it.',
      effects: { intelligence: 5, network: 10, mentalHealth: 8, luck: 2 },
      lectureType: 'casual',
    },
  ];

  const BA_COURSES_Y2 = [
    {
      id: 'methods-ii',
      title: 'Quantitative Methods II',
      desc: 'Prof. Strict again. Regression, causal inference. Your future self will thank you.',
      effects: { intelligence: 18, network: 0, mentalHealth: -12, luck: 0 },
      lectureType: 'formal',
    },
    {
      id: 'normative',
      title: 'Normative Political Theory',
      desc: 'Prof. Kant — Rawls, Nozick, justice. Tough but rewarding.',
      effects: { intelligence: 12, network: 2, mentalHealth: -6, luck: 0 },
      lectureType: 'seminar',
    },
    {
      id: 'eu-policy',
      title: 'EU Politics & Policy',
      desc: 'Prof. Brussels — Policy-focused, lots of guest speakers. Good for connections.',
      effects: { intelligence: 6, network: 14, mentalHealth: -2, luck: 0 },
      lectureType: 'seminar',
    },
    {
      id: 'elective-fun',
      title: 'Elective: Politics of Pop Culture',
      desc: 'Prof. Fun — Lighter, interesting. A breath of fresh air.',
      effects: { intelligence: 4, network: 8, mentalHealth: 10, luck: 4 },
      lectureType: 'casual',
    },
    {
      id: 'qual-y2',
      title: 'Case Studies & Process Tracing',
      desc: 'Prof. Narrative — “How do we know what we know?” Lots of debate. Very qualitative. Someone will mention mechanism.',
      effects: { intelligence: 11, network: 4, mentalHealth: -4, luck: 0 },
      lectureType: 'casual',
    },
    {
      id: 'programming-y2',
      title: 'Data Wrangling & Reproducibility',
      desc: 'Prof. Script — Git, tidy data, “your code should run in 2030”. Half the room still on Stack Overflow. You fit right in.',
      effects: { intelligence: 14, network: 4, mentalHealth: -8, luck: 2 },
      lectureType: 'formal',
    },
    {
      id: 'casual-y2',
      title: 'Elective: Why Your Uncle Is Wrong at Thanksgiving',
      desc: 'Prof. Jokes — Evidence, rhetoric, and family dinners. Surprisingly useful. The readings are actually good.',
      effects: { intelligence: 6, network: 8, mentalHealth: 12, luck: 6 },
      lectureType: 'casual',
    },
  ];

  function getLectureSceneForCourse(courseId) {
    const c = BA_COURSES_Y1.find(x => x.id === courseId) || BA_COURSES_Y2.find(x => x.id === courseId) ||
      MA_COURSES_Y1.find(x => x.id === courseId) || MA_COURSES_Y2.find(x => x.id === courseId);
    const t = c && c.lectureType ? c.lectureType : 'seminar';
    return 'lecture-' + t;
  }

  // ----- Content: MA courses (harder than BA) -----
  const MA_COURSES_Y1 = [
    { id: 'ma-adv-methods', title: 'Advanced Quantitative Methods', desc: 'Prof. Strict, again. Now with causal inference. Your brain will hurt.', effects: { intelligence: 20, network: -2, mentalHealth: -12, luck: 0 }, lectureType: 'formal' },
    { id: 'ma-theory-seminar', title: 'Graduate Political Theory Seminar', desc: 'Prof. Kant. Rawls, Habermas, and one paper per week.', effects: { intelligence: 16, network: 6, mentalHealth: -10, luck: 0 }, lectureType: 'seminar' },
    { id: 'ma-ir-theory', title: 'Theories of International Relations', desc: 'Prof. Global. Realism, liberalism, constructivism. You can finally tell them apart.', effects: { intelligence: 12, network: 14, mentalHealth: -8, luck: 0 }, lectureType: 'seminar' },
    { id: 'ma-research-design', title: 'Research Design in Political Science', desc: 'Prof. Rigor. Your thesis proposal starts here.', effects: { intelligence: 18, network: 4, mentalHealth: -10, luck: 2 }, lectureType: 'formal' },
    { id: 'ma-qual-adv', title: 'Advanced Qualitative Methods', desc: 'Prof. Narrative. Process tracing, interviews, “so what’s your mechanism?”', effects: { intelligence: 14, network: 8, mentalHealth: -6, luck: 0 }, lectureType: 'casual' },
    { id: 'ma-elective', title: 'Elective: Policy Analysis', desc: 'Prof. Brussels. Good for connections and a slightly lighter load.', effects: { intelligence: 8, network: 12, mentalHealth: -2, luck: 2 }, lectureType: 'casual' },
  ];

  const MA_COURSES_Y2 = [
    { id: 'ma-thesis-seminar', title: 'Thesis Seminar', desc: 'You present your draft. Everyone has opinions.', effects: { intelligence: 10, network: 16, mentalHealth: -14, luck: 4 }, lectureType: 'seminar' },
    { id: 'ma-specialization', title: 'Specialization: Your Subfield', desc: 'Deep dive. You’re almost a real expert now.', effects: { intelligence: 16, network: 6, mentalHealth: -8, luck: 0 }, lectureType: 'seminar' },
    { id: 'ma-teaching-intro', title: 'Teaching Practicum', desc: 'You TA for the first time. The undergrads survive. So do you.', effects: { intelligence: 4, network: 14, mentalHealth: -10, luck: 2 }, lectureType: 'casual' },
    { id: 'ma-writing', title: 'Academic Writing Workshop', desc: 'Prof. Edit. “Revise and resubmit” becomes your mantra.', effects: { intelligence: 12, network: 4, mentalHealth: -6, luck: 0 }, lectureType: 'formal' },
    { id: 'ma-elective-2', title: 'Elective: Data & Democracy', desc: 'Current debates. Good for the job market narrative.', effects: { intelligence: 8, network: 10, mentalHealth: -2, luck: 4 }, lectureType: 'casual' },
  ];

  const MA_THESIS_TOPICS = [
    { id: 'ma-voting', title: 'Voting and representation (MA thesis)', desc: 'Survey data, comparative design. Strong for quantitative PhD programs.', effects: { intelligence: 18, network: 6, mentalHealth: -12, luck: 0 } },
    { id: 'ma-institutions', title: 'Institutions and reform (MA thesis)', desc: 'Case studies, mixed methods. Flexible for PhD applications.', effects: { intelligence: 14, network: 12, mentalHealth: -8, luck: 2 } },
    { id: 'ma-normative', title: 'Normative theory and democracy (MA thesis)', desc: 'Philosophy-heavy. Niche but distinctive.', effects: { intelligence: 16, network: 2, mentalHealth: -10, luck: 4 } },
    { id: 'ma-policy', title: 'EU policy and public opinion (MA thesis)', desc: 'Policy-relevant, network-friendly. Good for Brussels-adjacent PhDs.', effects: { intelligence: 10, network: 18, mentalHealth: -6, luck: 2 } },
  ];

  // MA Year 1: Graduate Colloquium
  const CONFERENCE_MA_Y1 = [
    { id: 'present', title: 'Present a paper', desc: 'Graduate Colloquium. Your first real audience. Faculty and peers.', effects: { intelligence: 8, network: 20, mentalHealth: -14, luck: 6 } },
    { id: 'attend', title: 'Attend and network', desc: 'Panels, coffee, name tags. The grind continues.', effects: { intelligence: 2, network: 18, mentalHealth: -8, luck: 2 } },
    { id: 'discussant', title: 'Be a discussant', desc: 'Pure service. If you wing it, they notice.', effects: { intelligence: 0, network: 0, mentalHealth: -8, luck: 0 }, serviceNoBenefit: true },
    { id: 'chair', title: 'Chair a session', desc: 'You run it. No credit. Get caught unprepared and your reputation suffers.', effects: { intelligence: 0, network: 0, mentalHealth: -10, luck: 0 }, serviceNoBenefit: true },
    { id: 'skip', title: 'Skip it', desc: 'Thesis and courses. You stay home.', effects: { intelligence: 6, network: -10, mentalHealth: 8, luck: 0 } },
  ];

  // MA Year 2: Thesis Workshop (present chapter, get feedback, visibility)
  const CONFERENCE_MA_Y2 = [
    { id: 'present', title: 'Present thesis chapter', desc: 'Thesis Workshop. Real feedback. Real nerves.', effects: { intelligence: 12, network: 24, mentalHealth: -16, luck: 6 } },
    { id: 'attend', title: 'Attend and network', desc: 'Job market is coming. Visibility matters.', effects: { intelligence: 4, network: 20, mentalHealth: -10, luck: 2 } },
    { id: 'discussant', title: 'Be a discussant', desc: 'Service. No benefit. You know the drill.', effects: { intelligence: 0, network: 0, mentalHealth: -8, luck: 0 }, serviceNoBenefit: true,
    },
    { id: 'chair', title: 'Chair a session', desc: 'You chair. They notice if you’re not on top of it.', effects: { intelligence: 0, network: 0, mentalHealth: -10, luck: 0 }, serviceNoBenefit: true,
    },
    { id: 'skip', title: 'Skip it', desc: 'Thesis deadline. Priorities.', effects: { intelligence: 8, network: -12, mentalHealth: 10, luck: 0 },
    },
  ];

  const CONFERENCE_SHIRK_CHANCE = 0.24; // probability you're "caught" shirking as discussant/chair
  const CONFERENCE_SHIRK_PUNISHMENT = { intelligence: 0, network: -16, mentalHealth: -8, luck: -4 };
  const ABSTRACT_ACCEPT_BASE = 0.62;
  const ABSTRACT_ACCEPT_LUCK_FACTOR = 0.18; // +0 to 0.18 from luck 0–100

  const PHD_MAX_ROUNDS = 6;
  const PHD_PAPERS_REQUIRED = 2;
  const PHD_MAX_PAPERS = 3;
  const PHD_PAPER_KILL_CHANCE = 0.14;
  const PHD_PAPER_KILL_MH = -14;
  const PHD_PROGRESS_PER_ROUND = 12;
  const PHD_STOP_THRESHOLD = 25;
  const PHD_SUBMIT_MIN_PROGRESS = 40;
  const PHD_PAPER_MH_PER_TURN = -3;
  const PHD_PAPER_NETWORK_PER_TURN = -3;
  const PHD_REJECT_MH = -6;
  const PHD_ACCEPT_EFFECTS = { intelligence: 6, network: 12, mentalHealth: 8 };
  const PHD_CONFERENCES_POOL = [
    { id: 'epfs', name: 'EPFS', fullName: 'European Political Science Federation (annual meeting)', cost: 55, desc: 'Big European crowd. Strong network payoff.' },
    { id: 'epjr', name: 'EPJR', fullName: 'European Journal of Political Research section meeting', cost: 48, desc: 'Smaller, method-focused. Good for visibility.' },
    { id: 'apsb', name: 'APSB', fullName: 'American Political Science Association annual meeting', cost: 85, desc: 'The big one. Expensive, huge network gains.' },
    { id: 'mpsb', name: 'MPSB', fullName: 'Midwest Political Science Association conference', cost: 65, desc: 'US job market central. Solid payoff.' },
    { id: 'ipsb', name: 'IPSB', fullName: 'International Political Science Association world congress', cost: 75, desc: 'Global. Every few years; high prestige.' },
    { id: 'ecpl', name: 'ECPL', fullName: 'European Consortium for Political Research general conference', cost: 52, desc: 'ECPR flagship. Strong European network.' },
    { id: 'wpsa', name: 'WPSA', fullName: 'Western Political Science Association annual meeting', cost: 45, desc: 'West coast. Cheaper, decent network.' },
    { id: 'spsa', name: 'SPSA', fullName: 'Southern Political Science Association conference', cost: 42, desc: 'Regional. Lower cost, smaller crowd.' },
    { id: 'epsn', name: 'EPSN', fullName: 'European Political Science Network workshop', cost: 38, desc: 'Small workshop. Budget option.' },
    { id: 'isa', name: 'ISA', fullName: 'International Studies Association annual convention', cost: 70, desc: 'IR and comparative. Big and costly.' },
  ];

  const PHD_CONFERENCE_ROLES = [
    { id: 'present', title: 'Present a paper', desc: 'Real audience. Real nerves.', effects: { intelligence: 10, network: 22, mentalHealth: -9, luck: 6 } },
    { id: 'attend', title: 'Attend and network', desc: 'Panels, coffee, job market prep.', effects: { intelligence: 4, network: 20, mentalHealth: -6, luck: 2 } },
    { id: 'discussant', title: 'Be a discussant', desc: 'Service. If you wing it, they notice.', effects: { intelligence: 0, network: 0, mentalHealth: -5, luck: 0 }, serviceNoBenefit: true },
    { id: 'chair', title: 'Chair a session', desc: 'You run it. No credit. Unprepared = reputation hit.', effects: { intelligence: 0, network: 0, mentalHealth: -6, luck: 0 }, serviceNoBenefit: true },
  ];

  const PHD_PAPER_TEMPLATES = [
    { title: 'Why Nobody Reads Your Literature Review: A Meta-Study', abstract: 'We systematically review 400 papers that cite themselves in the first paragraph. Findings: nobody else does either.' },
    { title: 'Coffee Consumption and Productivity in Political Science Departments: An Ethnography of the Break Room', abstract: 'Twelve months of field notes. Main result: the machine is broken again.' },
    { title: 'The Ontology of the Overdue Book: Library Fines as Structural Violence', abstract: 'We argue that late fees are a form of epistemic exclusion. Our interlibrary loan request is still pending.' },
    { title: 'Email Response Latency and Academic Prestige: Evidence from 10,000 "Sorry for the delay" Messages', abstract: 'The longer the delay, the higher the h-index. We reply to reviewers in six to eight weeks.' },
    { title: 'Committee Work and the Production of Nothing: A Bourdieusian Analysis', abstract: 'We examine how capital is accumulated through meetings that could have been emails. Our IRB is still pending.' },
    { title: 'Impostor Syndrome or Just Realism? A Measurement Model', abstract: 'New scale: "Maybe I Really Am Not Good Enough" (MRANGE). Cronbach\'s α = .94. We are not sure what that means.' },
    { title: 'The Referee Report as Genre: Stylistic Features of "While interesting..."', abstract: 'Corpus of 200 reports. "While interesting" predicts reject 89% of the time. We knew it.' },
    { title: 'Zoom Backgrounds and Perceived Competence: An Experimental Study', abstract: 'Bookshelf vs. plant vs. blur. N=3 (our department). Results: blur wins. We have no funding.' },
    { title: 'Citation Cartels and the Crisis of Legitimacy: Who Cites Whom and Why It Might Be You', abstract: 'Network analysis of mutual citation in one subfield. We found ourselves. It was awkward.' },
    { title: 'The Longue Durée of the To-Be-Read Pile: Historicity and Guilt', abstract: 'We draw on Braudel to explain why the book from 2019 is still on the floor. The book did not consent to be cited.' },
    { title: 'Grant Rejection and the Production of Humility: A Longitudinal Mixed-Methods Design', abstract: 'Twelve rejections, one acceptance. We study the twelve. The one was a fluke.' },
    { title: 'Colleague Small Talk as Ritual: Durkheim in the Corridor', abstract: 'When we say "How are you?" we do not mean it. Except sometimes. We are still coding.' },
    { title: 'The Syllabus as Contract: Legal Realism and the Late Penalty', abstract: 'We analyse 500 syllabi. "No late work" appears in 94%. We submitted this manuscript late.' },
    { title: 'Procrastination and Creativity: A Curvilinear Relationship We Will Test Later', abstract: 'Theory: moderate procrastination boosts creativity. We will run the analysis next week. Or the week after.' },
    { title: 'Office Hours and the Empty Chair: Attendance Patterns in the Age of Email', abstract: 'Nobody came. We had office hours. We wrote this instead. It counts as service.' },
    { title: 'The Co-Author Who Vanished: Attribution and Disappearance in Collaborative Work', abstract: 'We had four authors. Now we have three. The fourth moved to industry. We kept the footnote.' },
    { title: 'Peer Review as Hazing: Initiation Rituals in Academic Publishing', abstract: 'We argue that review is performative cruelty. This paper was rejected four times. We are fine.' },
    { title: 'The Thesis as Unfinished Object: Heidegger and the Second Chapter', abstract: 'We apply being-toward-death to the chapter we have been avoiding. Dasein is in the methods section.' },
    { title: 'Networking at Conferences: A Survival Analysis', abstract: 'Time until first awkward conversation. Median: 4.2 minutes. We left early.' },
    { title: 'Why We Keep Saying "Further Research Is Needed": A Reflexive Account', abstract: 'We needed a conclusion. Further research is needed on why we needed a conclusion. Send help.' },
  ];

  // Real-style journals: prestige 1=top, 4=lower; hIndex flavor; desk/R&R/direct probs (decisions next round)
  const PHD_JOURNALS = [
    { id: 'apsr', name: 'American Political Science Review', prestige: 1, hIndex: 12, deskReject: 0.58, rr: 0.39, directAccept: 0.03 },
    { id: 'ajps', name: 'American Journal of Political Science', prestige: 1, hIndex: 10, deskReject: 0.55, rr: 0.42, directAccept: 0.03 },
    { id: 'jop', name: 'Journal of Politics', prestige: 1, hIndex: 9, deskReject: 0.52, rr: 0.45, directAccept: 0.03 },
    { id: 'wp', name: 'World Politics', prestige: 2, hIndex: 8, deskReject: 0.42, rr: 0.53, directAccept: 0.05 },
    { id: 'io', name: 'International Organization', prestige: 2, hIndex: 8, deskReject: 0.45, rr: 0.50, directAccept: 0.05 },
    { id: 'cps', name: 'Comparative Political Studies', prestige: 2, hIndex: 7, deskReject: 0.38, rr: 0.57, directAccept: 0.05 },
    { id: 'bjps', name: 'British Journal of Political Science', prestige: 2, hIndex: 6, deskReject: 0.40, rr: 0.55, directAccept: 0.05 },
    { id: 'ejpr', name: 'European Journal of Political Research', prestige: 3, hIndex: 5, deskReject: 0.28, rr: 0.65, directAccept: 0.07 },
    { id: 'jepp', name: 'Journal of European Public Policy', prestige: 3, hIndex: 5, deskReject: 0.30, rr: 0.63, directAccept: 0.07 },
    { id: 'gov', name: 'Governance', prestige: 3, hIndex: 5, deskReject: 0.25, rr: 0.68, directAccept: 0.07 },
    { id: 'polbeh', name: 'Political Behavior', prestige: 3, hIndex: 4, deskReject: 0.22, rr: 0.70, directAccept: 0.08 },
    { id: 'poq', name: 'Public Opinion Quarterly', prestige: 4, hIndex: 4, deskReject: 0.15, rr: 0.75, directAccept: 0.10 },
    { id: 'epsr', name: 'European Political Science Review', prestige: 4, hIndex: 3, deskReject: 0.12, rr: 0.78, directAccept: 0.10 },
    { id: 'polstud', name: 'Political Studies', prestige: 4, hIndex: 3, deskReject: 0.10, rr: 0.80, directAccept: 0.10 },
  ];
  const PHD_RR_MH = 2; // small boost for R&R (not a full reject)

  function getPhdJournal(id) {
    return PHD_JOURNALS.find(j => j.id === id) || null;
  }

  function rollJournalDecision(journal, paper) {
    let desk = journal.deskReject, rr = journal.rr, acc = journal.directAccept;
    const progressFactor = (paper.progress || 0) / 100;
    const luckFactor = (state.stats && state.stats.luck != null ? state.stats.luck : 50) / 100;
    const shift = 0.12 * progressFactor + 0.08 * luckFactor;
    desk = Math.max(0.05, desk - shift);
    acc = Math.min(0.25, acc + shift);
    rr = 1 - desk - acc;
    const r = Math.random();
    if (r < desk) return 'desk_reject';
    if (r < desk + rr) return 'rr';
    return 'accept';
  }

  const PHD_ROUND_ACTIVITIES = [
    { id: 'workshop', title: 'Go to a workshop', desc: 'Half-day event. Someone presents a draft. You give feedback. Your draft is still at 30%.', effects: { intelligence: 6, network: 14, mentalHealth: -5, luck: 2 } },
    { id: 'seminar', title: 'Spend time on the internal seminar', desc: 'Present a work in progress or just attend. The usual crowd. Coffee and doubt.', effects: { intelligence: 4, network: 10, mentalHealth: -2, luck: 0 } },
    { id: 'procrastinate', title: 'Procrastinate (strategically)', desc: 'You tell yourself it\'s "reading" and "thinking." The guilt is real. So is the nap.', effects: { intelligence: -2, network: -4, mentalHealth: 6, luck: 0 } },
    { id: 'drink', title: 'Have a drink with colleagues', desc: 'Pub or department kitchen. Gossip, solidarity, and the occasional useful tip.', effects: { intelligence: 0, network: 16, mentalHealth: 4, luck: 4 } },
  ];

  const PHD_SUBMIT_OPTIONS = [
    { id: 'deadline', title: 'Submit at 11:59 pm on the deadline', desc: 'Classic. The portal almost crashes. You refresh. It goes through.', outcome: 'You submitted at 11:58. The system timestamp is 11:59. Nobody will ever know.' },
    { id: 'typo', title: 'Submit and then find a typo in the abstract', desc: 'You spot it the next morning. Too late. It\'s fine. Probably.', outcome: 'You found "teh" instead of "the" on page 2. The committee has already started reading. You learn to live with it.' },
    { id: 'ack', title: 'Submit with a heartfelt acknowledgements section', desc: 'You thank the coffee machine, the library, and your cat. They deserve it.', outcome: 'The external examiner later says the acknowledgements were the best part. You\'re not sure how to feel.' },
    { id: 'read', title: 'One more read, then submit', desc: 'Just one. You find three more things to fix. Then you submit anyway.', outcome: 'You fixed two. The third is still there. You submitted. The weight lifts. So does the dread.' },
  ];

  const PHD_DEFEND_OPTIONS = [
    { id: 'wing', title: 'Wing the methodology section', desc: 'You know it well enough. Probably. The committee has read it. They will ask.', outcome: 'Someone asked about the robustness checks. You said "good question" and talked about something related. They nodded. You passed.' },
    { id: 'overprepare', title: 'Overprepare and recite the whole thing', desc: 'You memorise every slide. You will not be caught off guard. You might collapse after.', outcome: 'You knew every answer. You also forgot to breathe. You passed. The nap afterward was legendary.' },
    { id: 'nod', title: 'Nod and say "good question" a lot', desc: 'It works in seminars. It might work here. You have a 50% chance of meaning it.', outcome: 'You said "good question" seven times. One was genuine. The committee seemed satisfied. You passed.' },
    { id: 'quote', title: 'Quote your critics and then disagree politely', desc: 'Show you\'ve read everything. Then show you\'re right. Easy.', outcome: 'You cited the grumpiest referee. You said "with respect." The committee smiled. You passed.' },
  ];

  const POSTDOC_PROGRAMS = [
    { id: 'erc', name: 'ERC-style project (dream)', desc: 'Big grant, your own project. Very competitive.', baseAccept: 0.15, minNetwork: 55, minLuck: 0 },
    { id: 'teaching', name: 'Teaching-focused fellowship', desc: 'More teaching, some research. Easier to get.', baseAccept: 0.45, minNetwork: 0, minLuck: 0 },
    { id: 'fixed', name: 'Fixed-term research contract', desc: 'Someone else\'s project. Two years. You\'re the hired hand.', baseAccept: 0.38, minNetwork: 30, minLuck: 0 },
    { id: 'abroad', name: 'Post-doc abroad', desc: 'New country, new department. Network helps.', baseAccept: 0.28, minNetwork: 45, minLuck: 25 },
  ];
  const POSTDOC_APP_MONEY_PER = 15;
  const POSTDOC_APP_MH_PER = -8;
  const POSTDOC_APP_MAX = 4;

  // BA Year 1: Department Research Day (posters, short talks)
  const CONFERENCE_Y1 = [
    {
      id: 'present',
      title: 'Present a poster or short talk',
      desc: 'Department Research Day. You have a half-baked idea. The audience is students and one bored professor. Go for it.',
      effects: { intelligence: 4, network: 14, mentalHealth: -10, luck: 4 },
    },
    {
      id: 'attend',
      title: 'Just attend and network',
      desc: 'No presentation. Show up, chat at the coffee break, look at other posters.',
      effects: { intelligence: 0, network: 12, mentalHealth: -4, luck: 2 },
    },
    {
      id: 'discussant',
      title: 'Be a respondent',
      desc: 'You comment on others’ papers. No credit, pure service. If you skim and get caught, it’s bad.',
      effects: { intelligence: 0, network: 0, mentalHealth: -6, luck: 0 },
      serviceNoBenefit: true,
    },
    {
      id: 'chair',
      title: 'Help run a session',
      desc: 'You chair a slot: intro speakers, keep time. No one will cite you for it. If you’re clearly winging it, people notice.',
      effects: { intelligence: 0, network: 0, mentalHealth: -8, luck: 0 },
      serviceNoBenefit: true,
    },
    {
      id: 'skip',
      title: 'Skip it',
      desc: 'You have reading to do. Or sleep. Definitely sleep.',
      effects: { intelligence: 2, network: -6, mentalHealth: 8, luck: 0 },
    },
  ];

  // BA Year 2: Department Thesis Showcase
  const CONFERENCE_Y2 = [
    {
      id: 'present',
      title: 'Present your thesis idea',
      desc: 'Thesis Showcase. Early feedback from real faculty. Terrifying but useful.',
      effects: { intelligence: 8, network: 18, mentalHealth: -12, luck: 4 },
    },
    {
      id: 'attend',
      title: 'Attend and network',
      desc: 'Good for letters and visibility. Faculty and grad students are there.',
      effects: { intelligence: 2, network: 16, mentalHealth: -6, luck: 2 },
    },
    {
      id: 'discussant',
      title: 'Be a respondent',
      desc: 'You discuss. Zero benefit. If someone notices you didn’t read the papers, your network remembers.',
      effects: { intelligence: 0, network: 0, mentalHealth: -6, luck: 0 },
      serviceNoBenefit: true,
    },
    {
      id: 'chair',
      title: 'Chair a session',
      desc: 'You chair. Pure service. Get caught checking your phone or mixing up names and it hurts.',
      effects: { intelligence: 0, network: 0, mentalHealth: -8, luck: 0 },
      serviceNoBenefit: true,
    },
    {
      id: 'skip',
      title: 'Skip it',
      desc: 'Thesis crunch. You can’t afford the time.',
      effects: { intelligence: 4, network: -8, mentalHealth: 6, luck: 0 },
    },
  ];

  const EMAIL_POOL = [
    {
      phase: 'both',
      from: 'Prof. Strict <strict@uni.edu>',
      subject: 'Re: Your regression output',
      body: 'I had a look. You need to fix the standard errors — they should be clustered. Also the table caption is wrong. Send a new draft by Friday.',
      replies: [
        { label: 'Fix everything and send by Thursday', desc: 'Overdeliver. Maybe they notice.', outcome: 'They replied: "Good." Not much, but it counts.', effects: { intelligence: 6, network: 4, mentalHealth: -10, luck: 0 } },
        { label: 'Send a short reply asking for a week', desc: 'You need time to re-run everything.', outcome: 'They said fine. You spent the weekend on it anyway.', effects: { intelligence: 2, network: 0, mentalHealth: -6, luck: 0 } },
        { label: 'Ignore until Friday, then send a quick fix', desc: 'Risky. They might be annoyed.', outcome: 'They noticed. "I said Friday, not Saturday." Your reputation takes a small hit.', effects: { intelligence: 0, network: -8, mentalHealth: -4, luck: -2 } },
      ],
    },
    {
      phase: 'ma',
      from: 'PhD Student <m.phd@uni.edu>',
      subject: 'Quick question about your thesis chapter',
      body: 'Hi, I\'m writing on a similar topic and wondered if you could share your code for the main analysis? I\'d cite you of course. Would save me weeks. Thanks!',
      replies: [
        { label: 'Share the code and offer to chat', desc: 'Generous. They might become a collaborator.', outcome: 'They were grateful. Word gets around that you help. Network +10.', effects: { intelligence: 0, network: 12, mentalHealth: 4, luck: 2 } },
        { label: 'Reply politely but say the code is messy', desc: 'You send a simplified version. Fair middle ground.', outcome: 'They thanked you. No drama.', effects: { intelligence: 0, network: 4, mentalHealth: 0, luck: 0 } },
        { label: 'Ignore', desc: 'You have your own deadlines.', outcome: 'They asked again. You feel a bit guilty. Someone else might have helped.', effects: { intelligence: 2, network: -4, mentalHealth: -4, luck: 0 } },
      ],
    },
    {
      phase: 'phd',
      from: 'Department Admin <admin@dept.edu>',
      subject: 'Room booking for your guest lecture',
      body: 'The room you requested (A.101) is not available. We have B.204 at 10:00 or C.12 at 14:00. Please confirm by tomorrow or we assign one.',
      replies: [
        { label: 'Take B.204 and confirm immediately', desc: 'Morning slot. Less chance of no-shows.', outcome: 'Done. The morning slot was fine. No stress.', effects: { intelligence: 0, network: 0, mentalHealth: 2, luck: 0 } },
        { label: 'Take C.12 and confirm', desc: 'Afternoon. You prefer it.', outcome: 'C.12 turned out to be tiny. A few people had to stand. Slightly awkward.', effects: { intelligence: 0, network: -2, mentalHealth: -2, luck: 0 } },
        { label: 'Reply asking if anything else is free', desc: 'Maybe they find a better option.', outcome: 'They assigned B.204 anyway. "We had to close the list."', effects: { intelligence: 0, network: -4, mentalHealth: -4, luck: -2 } },
      ],
    },
    {
      phase: 'phd',
      from: 'Journal Editor <editor@journal.org>',
      subject: 'Your submission – decision',
      body: 'Dear Author, We have now received the reports. The decision is Revise and Resubmit. The reviewers raise substantive points. We hope you will choose to revise. Deadline: 3 months.',
      replies: [
        { label: 'Accept and start revising', desc: 'It\'s a chance. Hard work ahead.', outcome: 'You draft a revision plan. Mental health dips, but you\'re in the game.', effects: { intelligence: 4, network: 0, mentalHealth: -12, luck: 4 } },
        { label: 'Reply asking for an extension', desc: 'You need four months.', outcome: 'They gave you one extra month. Slightly less pressure.', effects: { intelligence: 0, network: 0, mentalHealth: -4, luck: 2 } },
        { label: 'Withdraw and submit elsewhere', desc: 'You\'re tired of these reviewers.', outcome: 'Your co-author isn\'t thrilled. Network -6. You might resubmit later.', effects: { intelligence: 0, network: -8, mentalHealth: 2, luck: -2 } },
      ],
    },
    {
      phase: 'ma',
      from: 'Undergrad <student99@mail.edu>',
      subject: 'Missed the deadline – possible extension?',
      body: 'Hi, I had family issues and couldn\'t hand in the essay on time. I can submit by next week. Is that ok? I understand if not.',
      replies: [
        { label: 'Grant extension, no penalty', desc: 'Kind. They might remember.', outcome: 'They thanked you. You feel like a human. Small mental health boost.', effects: { intelligence: 0, network: 2, mentalHealth: 6, luck: 0 } },
        { label: 'Grant extension with a small grade penalty', desc: 'Fair but strict.', outcome: 'They weren\'t happy but accepted. No lasting effect.', effects: { intelligence: 0, network: 0, mentalHealth: 0, luck: 0 } },
        { label: 'No extension – policy is policy', desc: 'You stick to the syllabus.', outcome: 'They complained to the programme. A colleague mentions it. Network -4.', effects: { intelligence: 0, network: -6, mentalHealth: -4, luck: 0 } },
      ],
    },
    {
      phase: 'phd',
      from: 'Co-author <coauthor@otheruni.edu>',
      subject: 'Re: Who writes the methods section?',
      body: 'I think you should do it – you ran the models. I\'ll do intro and discussion. Unless you\'re swamped? We need to submit by end of month.',
      replies: [
        { label: 'Agree and draft the methods', desc: 'You take the extra work.', outcome: 'You send a draft. They\'re happy. Paper moves forward. Network +6.', effects: { intelligence: 4, network: 8, mentalHealth: -8, luck: 0 } },
        { label: 'Suggest splitting methods 50/50', desc: 'Fair share.', outcome: 'They agreed. Slightly slower but less burden on you.', effects: { intelligence: 2, network: 4, mentalHealth: -2, luck: 0 } },
        { label: 'Say you\'re swamped, ask for two weeks', desc: 'You need time.', outcome: 'They found someone else to help. You\'re a bit sidelined. Network -4.', effects: { intelligence: 0, network: -6, mentalHealth: 2, luck: -2 } },
      ],
    },
    {
      phase: 'ma',
      from: 'Conference Organiser <conf@annualmeeting.org>',
      subject: 'Your panel – discussant dropped out',
      body: 'Unfortunately the discussant for your panel can\'t make it. We could (a) find a replacement, (b) run with 3 papers and no discussant, or (c) merge your panel with another. Preferences?',
      replies: [
        { label: 'Offer to find a replacement', desc: 'You know someone.', outcome: 'You found a last-minute discussant. Organisers are grateful. Network +10.', effects: { intelligence: 0, network: 12, mentalHealth: -6, luck: 2 } },
        { label: 'Run without discussant', desc: 'Simpler. Less feedback.', outcome: 'Panel went fine. Nobody complained.', effects: { intelligence: 0, network: 0, mentalHealth: 0, luck: 0 } },
        { label: 'Ask to merge panels', desc: 'Less visibility for your paper.', outcome: 'You got merged. Your slot was cut to 10 minutes. Slightly frustrating.', effects: { intelligence: 0, network: -4, mentalHealth: -6, luck: 0 } },
      ],
    },
    {
      phase: 'ma',
      from: 'Supervisor <supervisor@uni.edu>',
      subject: 'Meeting tomorrow – agenda',
      body: 'Can we move to 3pm? And can you send the latest draft of chapter 2 by tonight? I want to read it before we meet. Thanks.',
      replies: [
        { label: 'Agree and send the draft tonight', desc: 'You pull a late one.', outcome: 'They had feedback. It was useful. You\'re tired. Intelligence +4, mental health -8.', effects: { intelligence: 6, network: 2, mentalHealth: -10, luck: 0 } },
        { label: 'Agree but say draft is still rough', desc: 'Set expectations.', outcome: 'They said send it anyway. Meeting was fine.', effects: { intelligence: 2, network: 0, mentalHealth: -4, luck: 0 } },
        { label: 'Ask to move meeting – draft not ready', desc: 'You need more time.', outcome: 'They sounded annoyed. "We need to keep momentum." Network -4.', effects: { intelligence: 0, network: -6, mentalHealth: -6, luck: -2 } },
      ],
    },
    {
      phase: 'ba',
      from: 'Prof. Weber <weber@uni.edu>',
      subject: 'Re: Your essay draft',
      body: 'You handed in a first draft last week. I have some comments – mainly the argument in section 2 needs tightening. Can you come to my office hour on Thursday to go through it? Bring a printed copy.',
      replies: [
        { label: 'Confirm and prepare questions', desc: 'You re-read the draft and note where you\'re unsure.', outcome: 'The meeting helped. Your revision was much stronger. Intelligence +6.', effects: { intelligence: 8, network: 2, mentalHealth: -4, luck: 0 } },
        { label: 'Confirm but only skim the comments', desc: 'You\'re short on time.', outcome: 'You got a bit lost in the meeting. Still useful, but you had to catch up later.', effects: { intelligence: 4, network: 0, mentalHealth: -2, luck: 0 } },
        { label: 'Ask to do it by email instead', desc: 'You\'re nervous about office hours.', outcome: 'They said they prefer in person. You went anyway. Slightly awkward start.', effects: { intelligence: 2, network: -2, mentalHealth: -4, luck: 0 } },
      ],
    },
    {
      phase: 'ba',
      from: 'Fellow student <j.smith@mail.edu>',
      subject: 'Group project – who does slides?',
      body: 'Hi, we need to present next Tuesday. I can do the intro and conclusion. Can you do the middle part (methods and results)? Or we could split differently. Let me know.',
      replies: [
        { label: 'Take methods and results', desc: 'You\'re okay with the technical bit.', outcome: 'You met up and it went well. The presentation was clear. Network +4.', effects: { intelligence: 4, network: 6, mentalHealth: -2, luck: 0 } },
        { label: 'Suggest doing intro together', desc: 'Share the load more evenly.', outcome: 'They agreed. You both contributed. No drama.', effects: { intelligence: 2, network: 4, mentalHealth: 0, luck: 0 } },
        { label: 'Reply late – you forgot to check email', desc: 'Oops.', outcome: 'They were a bit annoyed. "We had to decide without you." Network -4.', effects: { intelligence: 0, network: -6, mentalHealth: -4, luck: -2 } },
      ],
    },
    {
      phase: 'ba',
      from: 'Library <library@uni.edu>',
      subject: 'Overdue book – reminder',
      body: 'You have 1 item overdue: "Introduction to Political Science" (3 days). Please return or renew. Fines apply after 7 days.',
      replies: [
        { label: 'Renew online and return next week', desc: 'You need it a bit longer.', outcome: 'Renewed. You returned it on time. No fine.', effects: { intelligence: 0, network: 0, mentalHealth: 0, luck: 0 } },
        { label: 'Return it today', desc: 'You drop it in the returns box.', outcome: 'Done. One less thing to worry about.', effects: { intelligence: 0, network: 0, mentalHealth: 2, luck: 0 } },
        { label: 'Ignore for now', desc: 'You\'ll deal with it later.', outcome: 'You forgot. A small fine and a block on your account until you paid. Money -5, luck -2.', effects: { intelligence: 0, network: 0, mentalHealth: -4, luck: -2, money: -5 } },
      ],
    },
    {
      phase: 'ba',
      from: 'Student Services <services@uni.edu>',
      subject: 'Enrolment confirmation – action needed',
      body: 'Your enrolment for this semester is not complete. Please confirm your module choices in the portal by Friday. If we don\'t hear from you, we assume you are continuing as planned.',
      replies: [
        { label: 'Log in and confirm today', desc: 'Get it done.', outcome: 'All set. No admin stress.', effects: { intelligence: 0, network: 0, mentalHealth: 2, luck: 0 } },
        { label: 'Confirm on Friday', desc: 'You\'ll do it before the deadline.', outcome: 'You did it Thursday evening. Cut it close but fine.', effects: { intelligence: 0, network: 0, mentalHealth: -2, luck: 0 } },
        { label: 'Ignore – you\'re sure you\'re enrolled', desc: 'They send these every year.', outcome: 'They had to chase you. "Please check your email." Slightly embarrassing.', effects: { intelligence: 0, network: -2, mentalHealth: -4, luck: -2 } },
      ],
    },
    {
      phase: 'ba',
      from: 'Course coordinator <coordinator@uni.edu>',
      subject: 'Missed seminar – catch-up',
      body: 'You weren\'t in the seminar on Tuesday. We discussed the reading and the essay question. Can you come to my office hour this week or next to catch up? It\'s in the syllabus.',
      replies: [
        { label: 'Book a slot and skim the reading', desc: 'You catch up before you go.', outcome: 'You were prepared. They were impressed you\'d read it. Intelligence +4, network +2.', effects: { intelligence: 6, network: 4, mentalHealth: -2, luck: 0 } },
        { label: 'Book a slot', desc: 'You\'ll be honest that you\'re behind.', outcome: 'They gave you a quick summary. You left with a reading list. Fine.', effects: { intelligence: 2, network: 0, mentalHealth: 0, luck: 0 } },
        { label: 'Reply saying you\'ll read the slides', desc: 'You hope that\'s enough.', outcome: 'They said "the slides don\'t cover it – come to office hours." You went. Slightly awkward.', effects: { intelligence: 0, network: -2, mentalHealth: -4, luck: 0 } },
      ],
    },
  ];

  const FREE_TIME_OPTIONS = [
    {
      id: 'party',
      title: 'Party',
      desc: 'Go out. Meet people. Forget the reading for a night.',
      effects: { intelligence: -4, network: 12, mentalHealth: 8, luck: 2, money: -10 },
    },
    {
      id: 'drinks',
      title: 'Drinks with coursemates',
      desc: 'Pub or flat. You talk about the programme, then about everything else.',
      effects: { intelligence: -2, network: 10, mentalHealth: 6, luck: 2, money: -8 },
    },
    {
      id: 'mixer',
      title: 'Department mixer',
      desc: 'Wine and name tags. You show up, you mingle, you leave before the speeches.',
      effects: { intelligence: 0, network: 12, mentalHealth: 4, luck: 2, money: -6 },
    },
    {
      id: 'study-group',
      title: 'Study group (with pizza)',
      desc: 'You meet to go over the problem set. Half of it is actually studying.',
      effects: { intelligence: 6, network: 8, mentalHealth: 2, luck: 0, money: -4 },
    },
    {
      id: 'reading',
      title: 'Extra reading',
      desc: 'Stay in. Catch up on the reading list.',
      effects: { intelligence: 12, network: -2, mentalHealth: -4, luck: 0, money: 0 },
    },
    {
      id: 'library',
      title: 'Library day',
      desc: 'You camp in the quiet section. Books, laptop, and the same coffee twice.',
      effects: { intelligence: 10, network: -4, mentalHealth: -2, luck: 0, money: -2 },
    },
    {
      id: 'notes',
      title: 'Rework your notes',
      desc: 'Turn scribbles into something you can revise from. Boring but useful.',
      effects: { intelligence: 8, network: 0, mentalHealth: -2, luck: 0, money: 0 },
    },
    {
      id: 'student-job',
      title: 'Student job',
      desc: 'Work a few hours. Pays less than the bar, but you pick up skills and meet people from uni. (You’ll need it for workshops and travel.)',
      effects: { intelligence: 4, network: 8, mentalHealth: -2, luck: 2, money: 12 },
    },
    {
      id: 'bar-shift',
      title: 'Bar shift',
      desc: 'Someone\'s got to pour the drinks. Better pay, but your brain goes on standby.',
      effects: { intelligence: -6, network: 6, mentalHealth: -4, luck: 2, money: 24 },
    },
    {
      id: 'sleep',
      title: 'Sleep',
      desc: 'Just sleep. You need it.',
      effects: { intelligence: 2, network: 0, mentalHealth: 14, luck: 0, money: 0 },
    },
    {
      id: 'netflix',
      title: 'Netflix and nothing',
      desc: 'You switch off. No guilt. Well, a little guilt.',
      effects: { intelligence: -2, network: 0, mentalHealth: 10, luck: 0, money: 0 },
    },
    {
      id: 'walk',
      title: 'Long walk',
      desc: 'Fresh air, no screen. You come back feeling almost human.',
      effects: { intelligence: 0, network: 0, mentalHealth: 12, luck: 2, money: 0 },
    },
  ];

  const THESIS_TOPICS = [
    {
      id: 'voting',
      title: 'Voting behaviour in [Country]',
      desc: 'Survey data, turnout, party choice. Classic and method-heavy.',
      effects: { intelligence: 16, network: 4, mentalHealth: -10, luck: 0 },
    },
    {
      id: 'institutions',
      title: 'Institutional design and reform',
      desc: 'Comparative institutions, case studies. Good for theory + empirics.',
      effects: { intelligence: 12, network: 8, mentalHealth: -6, luck: 0 },
    },
    {
      id: 'eu-integration',
      title: 'EU integration and public opinion',
      desc: 'Eurobarometer, attitudes. Policy-relevant and network-friendly.',
      effects: { intelligence: 8, network: 14, mentalHealth: -4, luck: 2 },
    },
    {
      id: 'normative-thesis',
      title: 'A normative argument about democracy',
      desc: 'Philosophy-heavy, less data. Risky but distinctive.',
      effects: { intelligence: 10, network: 2, mentalHealth: -8, luck: 6 },
    },
  ];

  const FAKE_CV_NAMES = [
    'Eleanor Vane',
    'J. Whitmore',
    'Rosa Lindqvist',
    'M. van der Berg',
    'Thomas Webb',
    'A. Kowalski',
  ];
  const FAKE_UNIVERSITIES = [
    'University of North Wessex',
    'St. Cuthbert\'s College',
    'Humboldt-Institut für Politikwissenschaft',
    'European School of Governance',
    'Rutherford Polytechnic',
    'Collège des Sciences Sociales',
  ];

  const CV_RANDOM_BA = [
    'Student assistant, department office',
    'Debate society, member',
    'Summer school: Introduction to R',
    'Language certificate: English C1',
    'Relevant coursework: Statistics, EU Law',
    'Erasmus semester (optional)',
    'Student representative, year 2',
    'Internship: local MP office (2 months)',
    'Tutor for first-year methods',
    'Department newsletter, contributing editor',
  ];

  const CV_RANDOM_MA = [
    'TA: Introduction to International Relations',
    'Research assistant to Prof. Rigor',
    'Presented at Graduate Colloquium',
    'Department diversity committee, student rep',
    'Methods workshop: Causal inference',
    'Guest lecture assistance (Prof. Global)',
    'Thesis writing group, co-organiser',
    'Conference attendance: ECPR General Conference',
    'Student rep, curriculum committee',
    'R and Stata training, self-directed',
  ];

  const CV_RANDOM_PHD = [
    'Conference paper, APSA Annual Meeting',
    'Invited talk, Comparative Politics Workshop (external)',
    'Ad-hoc reviewer, Journal of Political Institutions',
    'Teaching: Introduction to Comparative Politics',
    'Co-organiser, PhD colloquium series',
    'Research stay, partner university (3 months)',
    'Fellowship: Early-career grant (foundation)',
    'Panel chair, regional ISA conference',
    'Department seminar series, coordinator',
    'Reviewer, Political Behavior (2 reports)',
  ];

  function cvSeededPick(arr, n, seed) {
    const out = [];
    const indices = [];
    for (let i = 0; i < arr.length; i++) indices.push(i);
    let s = (seed || 0);
    for (let k = 0; k < n && indices.length > 0; k++) {
      s = (s * 1103515245 + 12345) >>> 0;
      const idx = (s % indices.length);
      const i = indices.splice(idx, 1)[0];
      out.push(arr[i]);
    }
    return out;
  }

  // ----- Game state -----
  let state = {
    difficulty: null,
    character: null,
    stats: null,
    step: 'character',
    phase: 'ba', // 'ba' | 'ma' | 'phd'
    playerName: '',
    cvName: null,
    cvUniversity: null,
    universityBA: null,
    universityMA: null,
    resumeStep: null,
    outcomeText: null,
    resumeToken: null,
    currentScene: 'campus',
    hasKids: false,
    socializingCount: 0,
    ba: {
      year1Courses: [],
      year2Courses: [],
      thesisTopic: null,
    },
    ma: {
      year1Courses: [],
      year2Courses: [],
      thesisTopic: null,
    },
    phd: {
      round: 1,
      papers: [],
      nextPaperId: 1,
    },
    conferences: [],
  };

  function getCharacter() {
    return CHARACTERS.find(c => c.id === state.character) || null;
  }

  function getDifficulty() {
    return state.difficulty && DIFFICULTIES[state.difficulty] ? DIFFICULTIES[state.difficulty] : DIFFICULTIES.medium;
  }

  function getVariance() {
    return getDifficulty().variance;
  }

  function getKidsChance() {
    return getDifficulty().kidsChance;
  }

  function getMAThreshold() {
    const d = getDifficulty();
    return { int: d.maInt, mh: d.maMentalHealth };
  }

  const MA_ACCEPT_BASE = 0.12;
  const MA_ACCEPT_ELIGIBLE_BONUS = 0.22;
  function getMAAcceptChance(eligibleMA) {
    const int = (state.stats.intelligence || 0) / 100;
    const net = (state.stats.network || 0) / 100;
    const luck = (state.stats.luck || 0) / 100;
    const mh = (state.stats.mentalHealth || 0) / 100;
    let chance = MA_ACCEPT_BASE + int * 0.28 + net * 0.26 + luck * 0.18 + mh * 0.08;
    if (eligibleMA) chance += MA_ACCEPT_ELIGIBLE_BONUS;
    return Math.max(0.04, Math.min(0.92, chance));
  }

  function getMARejectionReason() {
    const int = state.stats.intelligence || 0;
    const net = state.stats.network || 0;
    const luck = state.stats.luck || 0;
    const mh = state.stats.mentalHealth || 0;
    const reasons = [];
    if (int < 45) reasons.push({ stat: 'intelligence', msg: 'One letter said your "analytical depth" was "not yet evident." You\'re not sure what that means. You looked it up. It didn\'t help.' });
    if (net < 40) reasons.push({ stat: 'network', msg: 'Your recommenders sent the letters three days late. One programme wrote back: "We never received them." They had. They just hadn\'t opened the folder.' });
    if (luck < 35) reasons.push({ stat: 'luck', msg: 'The admissions officer\'s cat deleted your file. They said so in the rejection. You think they were joking. You\'re not sure.' });
    if (mh < 30) reasons.push({ stat: 'mentalHealth', msg: 'Your personal statement may have mentioned "existential dread" one too many times. The feedback form said "fit."' });
    if (reasons.length === 0) reasons.push({ stat: 'luck', msg: 'The letter says "strong pool." You\'ve met the pool. You\'re pretty sure the pool is just a filing cabinet.' });
    const weakest = [int, net, luck].indexOf(Math.min(int, net, luck));
    const statOrder = ['intelligence', 'network', 'luck'];
    const weakStat = statOrder[weakest];
    const match = reasons.find(r => r.stat === weakStat);
    const pool = match ? [match.msg] : reasons.map(r => r.msg);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const MA_SIT_OUT_OPTIONS = [
    { id: 'industry', title: 'Take an industry job', desc: 'You get a "real" job for a year. The pay is okay. Everyone asks when you\'re going back to the thesis.', effects: { intelligence: -4, network: 14, mentalHealth: 6, luck: 4, money: 22 } },
    { id: 'nothing', title: 'Do nothing (strategically)', desc: 'You call it a gap year. You sleep. You watch the entire back catalogue of something. You feel vaguely guilty.', effects: { intelligence: -6, network: -8, mentalHealth: 18, luck: 2, money: -8 } },
    { id: 'world_trip', title: 'Go on a world trip', desc: 'You have savings. You use them. You come back tanned and unable to explain what you "did" in a way that sounds academic.', effects: { intelligence: 2, network: 4, mentalHealth: 16, luck: 12, money: -25 } },
    { id: 'temp_dept', title: 'Temp at the department', desc: 'You run errands, invigilate exams, and get coffee for the same people who rejected you. They smile. You smile back. It\'s fine.', effects: { intelligence: 2, network: 20, mentalHealth: -6, luck: 0, money: 8 } },
    { id: 'retreat', title: 'Go to a writing retreat', desc: 'You pay to sit in a cabin and write. You mostly stared at the wall. The wall was very supportive.', effects: { intelligence: 10, network: -6, mentalHealth: 10, luck: 0, money: -18 } },
    { id: 'pub', title: 'Work at a pub', desc: 'You pull pints. You hear more about politics than you did in undergrad. Nobody asks for your h-index.', effects: { intelligence: -2, network: 12, mentalHealth: 8, luck: 6, money: 14 } },
  ];

  function showTransparency() {
    return getDifficulty().showTransparency;
  }

  function formatEffects(effects) {
    const parts = STAT_NAMES.map(stat => {
      const v = effects[stat];
      if (v === undefined || v === 0) return null;
      const label = stat === 'mentalHealth' ? 'Mental health' : stat === 'hIndex' ? 'H-index' : stat.charAt(0).toUpperCase() + stat.slice(1);
      return v > 0 ? `${label} +${v}` : `${label} ${v}`;
    }).filter(Boolean);
    return parts.length ? 'Effects: ' + parts.join(', ') + '.' : '';
  }

  function clampStat(value) {
    return Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(value)));
  }

  function randomVariance() {
    return (Math.random() - 0.5) * 2 * getVariance();
  }

  function applyEffects(effects) {
    const char = getCharacter();
    if (!char || !state.stats) return;
    const difficultyScale = getDifficulty().gainScale != null ? getDifficulty().gainScale : 1;

    STAT_NAMES.forEach(stat => {
      const base = effects[stat] || 0;
      const variance = randomVariance();
      let delta = base + variance;
      const mult = delta >= 0 ? char.gainMult[stat] : char.lossMult[stat];
      delta *= mult;
      if (delta > 0) delta *= difficultyScale;
      state.stats[stat] = clampStat(state.stats[stat] + delta);
    });
  }

  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.remove('hidden');

    const showStats = screenId !== 'screen-difficulty' && screenId !== 'screen-character' && screenId !== 'screen-heaven';
    document.getElementById('stat-bars').classList.toggle('hidden', !showStats);

    const showStage = screenId === 'screen-choice' || screenId === 'screen-outcome' || screenId === 'screen-sabbatical' || screenId === 'screen-bureaucracy' || screenId === 'screen-report-card';
    const stage = document.getElementById('game-stage');
    if (stage) stage.classList.toggle('hidden', !showStage);
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.classList.toggle('hidden', !state.stats);
    const cvBtn = document.getElementById('cv-btn');
    if (cvBtn) cvBtn.classList.toggle('hidden', !state.stats);
    const nameEl = document.getElementById('player-name-display');
    if (nameEl) {
      nameEl.textContent = state.stats ? (state.playerName || 'Academic') : '';
      nameEl.classList.toggle('hidden', !state.stats);
    }
  }

  function formatStatValue(stat, value) {
    const v = Math.round(value);
    switch (stat) {
      case 'money': return '$' + v;
      case 'intelligence': return (70 + Math.round(value * 0.6)) + ' IQ';
      case 'network': return (50 + Math.round(value * 2.5)) + ' conn., ' + Math.round(value * 1.5) + ' fol.';
      case 'mentalHealth': return v + '/100';
      case 'luck': return v + '';
      case 'hIndex': return '' + Math.round(value * 0.2);
      default: return '' + v;
    }
  }

  function updateStatBars() {
    if (!state.stats) return;
    STAT_NAMES.forEach(stat => {
      const fill = document.getElementById(`stat-${stat}`);
      if (fill) fill.style.width = state.stats[stat] + '%';
      const valueEl = document.getElementById(`stat-value-${stat}`);
      if (valueEl) valueEl.textContent = formatStatValue(stat, state.stats[stat]);
    });
  }

  const REPORT_CARD_GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'B+', 'A-', 'B'];

  const REPORT_CARD_EXTRA_ITEMS = [
    'Seminar participation',
    'Attendance',
    'Methods exam',
    'Research colloquium',
    'Department service',
    'Thesis progress (interim)',
    'Presentation skills',
    'Peer review (course)',
  ];

  function showReportCard(year, isMA, courseIds, onContinue, effects) {
    const prefix = isMA ? 'MA' : 'BA';
    const courseList = isMA
      ? (year === 1 ? MA_COURSES_Y1 : MA_COURSES_Y2)
      : (year === 1 ? BA_COURSES_Y1 : BA_COURSES_Y2);
    const courses = courseIds.map(id => courseList.find(c => c.id === id)).filter(Boolean);
    const grades = courses.map(() => REPORT_CARD_GRADES[Math.floor(Math.random() * REPORT_CARD_GRADES.length)]);

    document.getElementById('report-card-title').textContent = prefix + ' Year ' + year + ' – Grades';
    const introText = year === 1
      ? 'The envelope arrives. You tear it open. Your heart sinks. Or soars. Anyway — the registrar has spoken. Here\'s your report card.'
      : 'Another year, another envelope. You\'ve learned to open these with one eye closed. Your transcript, as promised.';
    document.getElementById('report-card-intro').textContent = introText;

    const inner = document.getElementById('report-card-inner');
    inner.innerHTML = '';
    courses.forEach((c, i) => {
      const row = document.createElement('div');
      row.className = 'report-card-row';
      row.innerHTML = '<span class="report-card-course">' + (c.title || c.id) + '</span><span class="report-card-grade">' + grades[i] + '</span>';
      inner.appendChild(row);
    });
    const extraPool = REPORT_CARD_EXTRA_ITEMS.slice();
    const nExtra = 2 + Math.floor(Math.random() * 2);
    for (let e = 0; e < nExtra && extraPool.length > 0; e++) {
      const idx = Math.floor(Math.random() * extraPool.length);
      const label = extraPool.splice(idx, 1)[0];
      const grade = REPORT_CARD_GRADES[Math.floor(Math.random() * REPORT_CARD_GRADES.length)];
      const row = document.createElement('div');
      row.className = 'report-card-row';
      row.innerHTML = '<span class="report-card-course">' + label + '</span><span class="report-card-grade">' + grade + '</span>';
      inner.appendChild(row);
    }

    showScreen('screen-report-card');
    showGameStage(state.currentScene || 'campus');
    updateStatBars();

    const btn = document.getElementById('report-card-continue');
    btn.onclick = () => {
      if (effects && Object.keys(effects).some(k => effects[k] !== 0)) {
        setTimeout(() => animateFlyingPoints(effects), 80);
      }
      onContinue();
    };
  }

  function getCourseTitleById(id, list) {
    const c = list.find(x => x.id === id);
    return c ? (c.title || id) : id;
  }

  function recordConference(phase, yearOrRound, role, eventName) {
    if (!state.conferences) state.conferences = [];
    const roleLabel = role === 'present' ? 'Presented' : role === 'attend' ? 'Attended' : role === 'discussant' ? 'Discussant' : role === 'chair' ? 'Chair' : 'Attended';
    state.conferences.push({ phase: phase, year: yearOrRound, role: roleLabel, event: eventName });
  }

  function getCVData() {
    if (!state.cvName) state.cvName = FAKE_CV_NAMES[Math.floor(Math.random() * FAKE_CV_NAMES.length)];
    const uniBA = state.universityBA || state.cvUniversity || FAKE_UNIVERSITIES[0];
    const uniMA = state.universityMA || state.cvUniversity || FAKE_UNIVERSITIES[1];
    const baseName = (state.cvName || '').replace(/^(Dr\.?|Prof\.?)\s+/i, '').trim() || state.cvName;
    const playerName = (state.playerName || '').trim();
    const nameForCV = playerName || baseName;
    const displayName = state.phase === 'phd' ? 'Dr. ' + nameForCV : nameForCV;
    const current = (state.phase === 'phd' ? uniMA : state.phase === 'ma' ? uniMA : uniBA);
    const sections = [];

    const educationLines = [];
    if (state.ba && (state.ba.year1Courses.length > 0 || state.ba.year2Courses.length > 0 || state.ba.thesisTopic)) {
      const y1 = state.ba.year1Courses.map(id => getCourseTitleById(id, BA_COURSES_Y1)).join('; ');
      const y2 = state.ba.year2Courses.map(id => getCourseTitleById(id, BA_COURSES_Y2)).join('; ');
      let ba = 'BA Political Science, ' + uniBA;
      if (y1) ba += '. Year 1: ' + y1;
      if (y2) ba += '. Year 2: ' + y2;
      if (state.ba.thesisTopic) {
        const t = THESIS_TOPICS.find(x => x.id === state.ba.thesisTopic);
        ba += '. Thesis: ' + (t ? t.title : state.ba.thesisTopic);
      }
      educationLines.push(ba);
    }
    if (state.ma && (state.ma.year1Courses.length > 0 || state.ma.year2Courses.length > 0 || state.ma.thesisTopic)) {
      const y1 = state.ma.year1Courses.map(id => getCourseTitleById(id, MA_COURSES_Y1)).join('; ');
      const y2 = state.ma.year2Courses.map(id => getCourseTitleById(id, MA_COURSES_Y2)).join('; ');
      let ma = 'MA Political Science / IR, ' + uniMA;
      if (y1) ma += '. Year 1: ' + y1;
      if (y2) ma += '. Year 2: ' + y2;
      if (state.ma.thesisTopic) {
        const t = MA_THESIS_TOPICS.find(x => x.id === state.ma.thesisTopic);
        ma += '. Thesis: ' + (t ? t.title : state.ma.thesisTopic);
      }
      educationLines.push(ma);
    }
    if (state.phase === 'phd' && state.phd) {
      let phdLine = 'PhD (in progress), ' + uniMA + '. Year ' + state.phd.round + '.';
      if (state.phdProgram) phdLine += ' ' + state.phdProgram + '.';
      educationLines.push(phdLine);
    }
    if (educationLines.length > 0) sections.push({ title: 'Education', lines: educationLines });

    const cvSeed = ((state.cvName || '').length + (state.character || '').length) * 31 + (state.phd ? state.phd.round : 0) * 7 + (state.ba ? state.ba.year1Courses.length + state.ba.year2Courses.length : 0);

    if (state.ba) {
      const baExtras = cvSeededPick(CV_RANDOM_BA, 2 + (cvSeed % 2), cvSeed);
      if (baExtras.length > 0) sections.push({ title: 'Experience & activities', lines: baExtras });
    }
    if (state.ma) {
      const maExtras = cvSeededPick(CV_RANDOM_MA, 2 + ((cvSeed + 1) % 2), cvSeed + 100);
      if (maExtras.length > 0) sections.push({ title: 'Graduate experience', lines: maExtras });
    }
    if (state.phase === 'phd' && state.phd) {
      const phdExtras = cvSeededPick(CV_RANDOM_PHD, 2 + (cvSeed % 3), cvSeed + 200);
      if (phdExtras.length > 0) sections.push({ title: 'Conferences, teaching & service', lines: phdExtras });
    }
    if (state.conferences && state.conferences.length > 0) {
      const confLines = state.conferences.map(c => {
        const when = c.phase === 'phd' ? 'PhD Year ' + c.year : (c.phase === 'ba' ? 'BA' : 'MA') + ' Year ' + c.year;
        return when + ', ' + c.event + ' — ' + c.role;
      });
      sections.push({ title: 'Conference participation', lines: confLines });
    }
    if (state.stats && state.stats.hIndex > 0) {
      sections.push({ title: 'Publications', lines: ['H-index: ' + Math.round(state.stats.hIndex * 0.2)] });
    }

    return { name: displayName, current, sections };
  }

  function buildCVContent() {
    const data = getCVData();
    const lines = [];
    lines.push('<div class="cv-name">' + data.name + '</div>');
    lines.push('Current: ' + data.current);
    lines.push('');
    data.sections.forEach(sec => {
      lines.push('<div class="cv-section">' + sec.title.replace(/&/g, '&amp;') + '</div>');
      sec.lines.forEach(l => { lines.push('<div class="cv-line">' + l + '</div>'); });
    });
    return lines.join('\n');
  }

  function exportCVAsPDF() {
    if (typeof window.jspdf === 'undefined') {
      alert('PDF export is not loaded. Please refresh the page.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const data = getCVData();
    const doc = new jsPDF({ format: 'a4', unit: 'mm' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const marginRight = 20;
    const maxW = pageW - margin - marginRight;
    let y = margin;
    const lineHeight = 5.5;
    const sectionGap = 4;
    const titleSize = 14;
    const sectionSize = 11;
    const bodySize = 10;

    doc.setFont('times', 'normal');
    doc.setFontSize(titleSize);
    doc.setFont('times', 'bold');
    doc.text(data.name, margin, y);
    y += lineHeight + 2;

    doc.setFont('times', 'normal');
    doc.setFontSize(bodySize);
    doc.text('Current: ' + data.current, margin, y);
    y += lineHeight + sectionGap;

    data.sections.forEach(sec => {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.setFontSize(sectionSize);
      doc.setFont('times', 'bold');
      doc.text(sec.title, margin, y);
      y += lineHeight;
      doc.setFont('times', 'normal');
      doc.setFontSize(bodySize);
      sec.lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = margin; }
        const split = doc.splitTextToSize(line, maxW - 8);
        doc.text(split, margin + 4, y);
        y += lineHeight * split.length;
      });
      y += sectionGap;
    });

    const safeName = (data.name || 'CV').replace(/[^\w\s\-\.]/g, '').trim().slice(0, 40) || 'CV';
    doc.save(safeName + '_curriculum_vitae.pdf');
  }

  function showCV() {
    document.getElementById('cv-content').innerHTML = buildCVContent();
    document.getElementById('cv-overlay').classList.remove('hidden');
  }

  function hideCV() {
    document.getElementById('cv-overlay').classList.add('hidden');
  }

  function animateFlyingPoints(effects) {
    if (!effects || !state.stats) return;
    const container = document.getElementById('flying-points-container');
    if (!container) return;
    const statsWithChange = STAT_NAMES.filter(stat => effects[stat] !== undefined && effects[stat] !== 0);
    if (statsWithChange.length === 0) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const duration = 500;
    const stagger = 80;

    statsWithChange.forEach((stat, index) => {
      const value = effects[stat];
      const el = document.querySelector(`.stat[data-stat="${stat}"]`);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const barCenterX = rect.left + rect.width / 2;
      const barCenterY = rect.top + rect.height / 2;

      const span = document.createElement('span');
      span.className = 'flying-point ' + (value > 0 ? 'flying-point-gain' : 'flying-point-loss');
      span.textContent = value > 0 ? '+' + value : String(value);
      span.style.left = barCenterX + 'px';
      span.style.top = barCenterY + 'px';

      if (value > 0) {
        span.classList.add('flying-point-anim-in');
        span.style.setProperty('--fly-dx', (centerX - barCenterX) + 'px');
        span.style.setProperty('--fly-dy', (centerY - barCenterY) + 'px');
      } else {
        span.classList.add('flying-point-anim-out');
        span.style.setProperty('--fly-dx', (barCenterX - centerX < 0 ? -60 : 60) + 'px');
        span.style.setProperty('--fly-dy', '-40px');
      }

      container.appendChild(span);

      const startTime = 50 + index * stagger;
      const addReady = () => span.classList.add('flying-point-ready');
      const removeSpan = () => {
        span.remove();
      };

      setTimeout(addReady, startTime);
      setTimeout(removeSpan, startTime + duration + 100);
    });
  }

  function setStageTitle(title) {
    const el = document.getElementById('stage-title');
    if (el) el.textContent = title;
  }

  function applyCharacterAvatar(el, characterId) {
    if (!el) return;
    const c = CHARACTERS.find(ch => ch.id === characterId);
    const a = c && c.avatar ? c.avatar : { head: '#e0c4a0', body: '#7aa2f7', leg: '#4a4a6a', book: '#ffcc00' };
    ['head', 'body', 'leg', 'book'].forEach(part => {
      const rect = el.querySelector('.char-' + part);
      if (rect) rect.setAttribute('fill', a[part]);
    });
  }

  function showGameStage(scene) {
    const stage = document.getElementById('game-stage');
    const char = document.getElementById('game-stage-character');
    if (!stage || !char) return;
    stage.classList.remove('hidden');
    stage.className = 'game-stage scene-' + (scene || 'campus');
    document.querySelectorAll('.game-stage-bg .scene-svg').forEach(function (svg) {
      svg.classList.add('hidden');
    });
    const sceneEl = document.getElementById('scene-' + (scene || 'campus'));
    if (sceneEl) sceneEl.classList.remove('hidden');
    char.style.left = '50%';
    char.classList.remove('anim-walk', 'anim-walk-in', 'anim-stress', 'anim-happy');
    char.classList.add('anim-idle');
    applyCharacterAvatar(char, state.character);
  }

  function hideGameStage() {
    const stage = document.getElementById('game-stage');
    if (stage) stage.classList.add('hidden');
  }

  function playCharacterAnim(animName, durationMs, thenIdle) {
    const char = document.getElementById('game-stage-character');
    if (!char) return;
    char.classList.remove('anim-idle', 'anim-walk', 'anim-walk-in', 'anim-stress', 'anim-happy');
    char.classList.add('anim-' + animName);
    const d = durationMs != null ? durationMs : (animName === 'stress' || animName === 'happy' ? 600 : 900);
    setTimeout(() => {
      char.classList.remove('anim-' + animName);
      if (thenIdle !== false) {
        char.classList.add('anim-idle');
        if (animName === 'walk' || animName === 'walk-in') char.style.left = '50%';
      }
    }, d);
  }

  // ----- Difficulty select -----
  function renderDifficultySelect() {
    setStageTitle('Political Science Academy');
    const list = document.getElementById('difficulty-list');
    list.innerHTML = '';

    Object.entries(DIFFICULTIES).forEach(([id, d]) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `
        <span class="choice-title">${d.name}</span>
        <span class="choice-desc">${d.description}</span>
      `;
      btn.addEventListener('click', () => selectDifficulty(id));
      list.appendChild(btn);
    });

    const startBlock = document.getElementById('start-block');
    const difficultyBlock = document.getElementById('difficulty-block');
    if (startBlock) startBlock.classList.remove('hidden');
    if (difficultyBlock) difficultyBlock.classList.add('hidden');
    updatePlayButtonState();
    showScreen('screen-difficulty');
  }

  function updatePlayButtonState() {
    const nameInput = document.getElementById('player-name-input');
    const playBtn = document.getElementById('play-btn');
    if (!playBtn || !nameInput) return;
    const hasName = (nameInput.value || '').trim().length > 0;
    playBtn.disabled = !hasName;
  }

  function selectDifficulty(id) {
    const nameInput = document.getElementById('player-name-input');
    state.playerName = (nameInput ? (nameInput.value || '').trim() : '') || 'Academic';
    state.difficulty = id;
    renderCharacterSelect();
  }

  function getCharacterAvatarSvg(avatar) {
    const a = avatar || { head: '#e0c4a0', body: '#7aa2f7', leg: '#4a4a6a', book: '#ffcc00' };
    return `<svg class="choice-avatar-sprite" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="0" width="8" height="8" fill="${a.head}"/>
      <rect x="4" y="8" width="16" height="10" fill="${a.body}"/>
      <rect x="4" y="18" width="6" height="14" fill="${a.leg}"/>
      <rect x="14" y="18" width="6" height="14" fill="${a.leg}"/>
      <rect x="20" y="10" width="4" height="6" fill="${a.book}"/>
    </svg>`;
  }

  // ----- Character select -----
  function renderCharacterSelect() {
    setStageTitle('Political Science Academy');
    const list = document.getElementById('character-list');
    list.innerHTML = '';

    CHARACTERS.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn choice-btn-with-avatar';
      btn.innerHTML = `
        <span class="choice-avatar-wrap">${getCharacterAvatarSvg(c.avatar)}</span>
        <span class="choice-btn-text">
          <span class="choice-title">${c.name}</span>
          <span class="choice-desc">${c.description}</span>
        </span>
      `;
      btn.addEventListener('click', () => selectCharacter(c.id));
      list.appendChild(btn);
    });
    showScreen('screen-character');
  }

  function runBAYear1CourseSelection() {
    setStageTitle('BA – Year 1');
    tryTwoCourseChoice(
      'Choose two courses for your first year. Pick your first, then your second.',
      'Now pick your second course.',
      BA_COURSES_Y1,
      'year1_courses_1',
      'lecture-seminar',
      (choice1, choice2) => {
        state.ba.year1Courses.push(choice1.id);
        state.ba.year1Courses.push(choice2.id);
        applyEffects(choice1.effects);
        applyEffects(choice2.effects);
        state.currentScene = getLectureSceneForCourse(choice2.id);
        showGameStage(state.currentScene);
        const mergedEffects = {};
        STAT_NAMES.forEach(s => { mergedEffects[s] = (choice1.effects[s] || 0) + (choice2.effects[s] || 0); });
        showReportCard(1, false, [choice1.id, choice2.id], () => goToFreeTime(1), mergedEffects);
      }
    );
  }

  function selectCharacter(id) {
    state.character = id;
    const char = getCharacter();
    state.stats = { ...char.start };
    state.universityBA = FAKE_UNIVERSITIES[Math.floor(Math.random() * FAKE_UNIVERSITIES.length)];
    state.step = 'ba_year1_courses';
    updateStatBars();
    runBAYear1CourseSelection();
  }

  function goToFreeTime(year) {
    const isMA = state.phase === 'ma';
    const prefix = isMA ? 'MA' : 'BA';
    const label = year === 1 ? 'Year 1' : 'Year 2';
    setStageTitle(`${prefix} – ${label} (free time)`);
    const resumeStep = isMA ? `ma_year${year}_freetime` : (year === 1 ? 'year1_freetime' : 'year2_freetime');
    const resumeToken = isMA ? `goToMAConference_${year}` : (year === 1 ? 'goToConference_1' : 'goToConference_2');
    showChoice(
      year === 1
        ? 'How do you spend your free time this year?'
        : 'How do you spend your free time in your second year?',
      FREE_TIME_OPTIONS,
      choice => {
        applyEffects(choice.effects);
        if (['reading', 'library', 'notes'].includes(choice.id)) {
          state.currentScene = 'library';
          showGameStage('library');
        } else if (['party', 'drinks', 'mixer', 'study-group', 'bar-shift'].includes(choice.id)) {
          state.currentScene = 'party';
          showGameStage('party');
        }
        if (SOCIAL_FREE_TIME_IDS.includes(choice.id)) {
          state.socializingCount += 1;
        }
        const nextStep = year === 1 ? () => goToConference(1) : () => goToConference(2);
        let normalMessage = year === 1
          ? 'Good call. Department Research Day is coming up.'
          : 'Year 2 done. Thesis Showcase next, then the thesis.';
        if (isMA) normalMessage = year === 1 ? 'Good call. The Graduate Colloquium is coming up.' : 'Year 2 done. Thesis Workshop next, then the MA thesis.';
        const shouldGetKids = state.socializingCount >= KIDS_THRESHOLD && !state.hasKids && Math.random() < getKidsChance();
        if (shouldGetKids) {
          state.hasKids = true;
          applyEffects(KIDS_EFFECTS);
          showOutcome(
            'You spent a lot of time socializing. One thing led to another. You have kids now. (They’re great. You’re also very tired.)',
            nextStep,
            { effects: KIDS_EFFECTS },
            resumeToken
          );
        } else {
          const opts = { effects: choice.effects };
          if (showTransparency() && state.socializingCount >= KIDS_THRESHOLD && !state.hasKids) {
            opts.kidsChancePercent = Math.round(getKidsChance() * 100);
          }
          showOutcome(normalMessage, nextStep, opts, resumeToken);
        }
      },
      'campus',
      resumeStep
    );
  }

  function goToConference(year) {
    const isMA = state.phase === 'ma';
    const isY1 = year === 1;
    const options = isMA ? (isY1 ? CONFERENCE_MA_Y1 : CONFERENCE_MA_Y2) : (isY1 ? CONFERENCE_Y1 : CONFERENCE_Y2);
    const skipOption = options.find(o => o.id === 'skip');
    const cost = isMA ? CONFERENCE_MA_COST : CONFERENCE_COST;
    const prefix = isMA ? 'MA' : 'BA';
    setStageTitle(isMA ? `${prefix} – Year ${year} (colloquium)` : `${prefix} – Year ${year} (research day)`);
    const confResumeStep = isMA ? `ma_year${year}_conference` : (isY1 ? 'year1_conference' : 'year2_conference');
    const confResumeToken = isMA ? `goToMAEmails_${year}` : (isY1 ? 'goToEmails_1' : 'goToEmails_2');
    const prompt = isMA
      ? (isY1 ? 'The Graduate Colloquium is coming up. Present, attend, discussant/chair, or skip? (Going costs money.)' : 'The Thesis Workshop is coming up. Present, attend, discussant/chair, or skip? (Going costs money.)')
      : (isY1 ? 'Department Research Day is coming up. Present, attend, help out, or skip? (Going costs money.)' : 'The Thesis Showcase is coming up. Present, attend, help out, or skip? (Going costs money.)');

    function showMainChoice(opts) {
      showChoice(
        prompt,
        opts,
        choice => {
        const canAfford = state.stats.money >= cost;
        const goingCostsMoney = choice.id !== 'skip';
        if (goingCostsMoney && !canAfford) {
          const canApplyFunding = isMA;
          if (canApplyFunding) {
            showChoice(
              "You can't afford to go. You can apply for funding (department or a foundation — chosen at random). Try?",
              [
                { id: 'apply', title: 'Apply for funding' },
                { id: 'stay', title: 'Stay home' }
              ],
              fundingChoice => {
                if (fundingChoice.id === 'stay') {
                  applyEffects(skipOption.effects);
                  showOutcome("You couldn't afford the trip. You stayed home.", () => goToEmails(year), { effects: skipOption.effects }, confResumeToken);
                  return;
                }
                const source = Math.random() < 0.5 ? 'department' : 'foundation';
                const granted = Math.random() < 0.5;
                const jokes = {
                  department: {
                    granted: [
                      "The committee liked your \"methodological diversity\" (you mentioned both surveys and interviews). Funding granted.",
                      "Someone on the panel thought you were their advisee. They didn't correct it. Funding granted.",
                      "The department had money left over from a cancelled catered lunch. You got the remainder."
                    ],
                    denied: [
                      "The head said funding is for \"research that moves the field.\" Yours, they said, \"moves the field into the filing cabinet.\"",
                      "You were told the budget is \"prioritised for impact.\" Your abstract was used as a sleep aid.",
                      "The committee praised your ambition, then awarded the money to someone who'd already published in the same journal."
                    ]
                  },
                  foundation: {
                    granted: [
                      "The foundation's algorithm flagged \"underrepresented methodology.\" You got the grant.",
                      "Your project title had the right buzzwords. The reviewers admitted they didn't read the rest.",
                      "A donor had specified \"support for early-career scholars who look tired.\" You qualified."
                    ],
                    denied: [
                      "The foundation replied: \"We do not fund travel to events that have a free livestream.\" Yours did.",
                      "Your application was \"not aligned with current strategic priorities.\" So was everyone else's.",
                      "You were rejected for \"insufficient dissemination plan.\" You'd said you'd present at the event."
                    ]
                  }
                };
                const pool = jokes[source][granted ? 'granted' : 'denied'];
                const msg = pool[Math.floor(Math.random() * pool.length)];
                if (granted) {
                  applyEffects(choice.effects);
                  const eventName = isY1 ? 'Graduate Colloquium' : 'Thesis Workshop';
                  recordConference('ma', year, choice.id, eventName);
                  showOutcome(msg + " You went. " + (isY1 ? "Event over. Your inbox is still there." : "Event over. So is your inbox. Then: the MA thesis."), () => goToEmails(year), { effects: choice.effects }, confResumeToken);
                } else {
                  applyEffects(skipOption.effects);
                  showOutcome(msg + " You stayed home.", () => goToEmails(year), { effects: skipOption.effects }, confResumeToken);
                }
              },
              'conference',
              confResumeStep
            );
            return;
          }
          applyEffects(skipOption.effects);
          showOutcome(
            'You couldn’t afford the trip — registration, travel, or both. You stayed home. (Money matters. Student jobs help.)',
            () => goToEmails(year),
            { effects: skipOption.effects },
            confResumeToken
          );
          return;
        }
        applyEffects(choice.effects);
        if (goingCostsMoney) state.stats.money = clampStat(state.stats.money - cost);
        const eventNameBA = isY1 ? 'Department Research Day' : 'Thesis Showcase';
        const eventNameMA = isY1 ? 'Graduate Colloquium' : 'Thesis Workshop';
        recordConference(isMA ? 'ma' : 'ba', year, choice.id, isMA ? eventNameMA : eventNameBA);
        let message = isMA ? (isY1 ? 'Colloquium over. Your inbox is still there.' : 'Workshop over. So is your inbox. Then: the MA thesis.') : (isY1 ? 'Research Day over. Your inbox, meanwhile, is not.' : 'Showcase over. So is your inbox. Then: the thesis.');
        let outcomeEffects = choice.effects;
        if (choice.serviceNoBenefit && Math.random() < CONFERENCE_SHIRK_CHANCE) {
          applyEffects(CONFERENCE_SHIRK_PUNISHMENT);
          outcomeEffects = CONFERENCE_SHIRK_PUNISHMENT;
          message = choice.id === 'chair'
            ? 'Someone noticed you hadn’t really read the papers / were checking your phone. Word gets around. Your reputation takes a hit.'
            : 'Someone noticed you hadn’t read the papers. It did not go well. The room remembers.';
        }
        showOutcome(
          message,
          () => goToEmails(year),
          { effects: outcomeEffects },
          confResumeToken
        );
      },
      'conference',
      confResumeStep
    );
    }

    showChoice(
      'First: submit an abstract? (You need an accepted abstract to present.)',
      [
        { id: 'submit_abstract', title: 'Submit an abstract', desc: 'If accepted, you can present. If rejected, you can still attend or skip.', effects: {} },
        { id: 'no_abstract', title: "Don't submit", desc: "You'll only be able to attend, help out, or skip.", effects: {} },
      ],
      abstractChoice => {
        const optionsWithoutPresent = options.filter(o => o.id !== 'present');
        if (abstractChoice.id === 'no_abstract') {
          showMainChoice(optionsWithoutPresent);
          return;
        }
        const acceptChance = Math.min(0.95, ABSTRACT_ACCEPT_BASE + (state.stats.luck / 100) * ABSTRACT_ACCEPT_LUCK_FACTOR);
        const accepted = Math.random() < acceptChance;
        if (!accepted) {
          showOutcome(
            "Your abstract was rejected. The feedback was vague. You can still attend, help out, or skip.",
            () => showMainChoice(optionsWithoutPresent),
            {},
            confResumeToken
          );
          return;
        }
        showMainChoice(options);
      },
      'conference',
      confResumeStep
    );
  }

  function pickFourConferences() {
    const copy = PHD_CONFERENCES_POOL.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 4);
  }

  function goToPhDConference() {
    state.resumeStep = 'phd_conference';
    state.currentScene = 'conference';
    showGameStage('conference');
    setStageTitle('PhD – Conferences');
    const resumeToken = 'goToPhDRound';
    const skipEffects = { intelligence: 6, network: -10, mentalHealth: 8, luck: 0 };

    showChoice(
      'First: submit an abstract? (If accepted, you can Present at any conference you attend.)',
      [
        { id: 'submit_abstract', title: 'Submit an abstract', desc: 'If accepted, you can present. If rejected, only attend/discussant/chair.', effects: {} },
        { id: 'no_abstract', title: "Don't submit", desc: "You'll only be able to attend, discussant, or chair.", effects: {} },
      ],
      abstractChoice => {
        let canPresent = false;
        if (abstractChoice.id === 'submit_abstract') {
          const acceptChance = Math.min(0.95, ABSTRACT_ACCEPT_BASE + (state.stats.luck / 100) * ABSTRACT_ACCEPT_LUCK_FACTOR);
          canPresent = Math.random() < acceptChance;
          if (!canPresent) {
            showOutcome(
              "Your abstract was rejected. You can still attend, discussant, or chair at conferences you choose.",
              () => showPhDConferenceSelect(canPresent),
              {},
              resumeToken
            );
            return;
          }
        }
        showPhDConferenceSelect(canPresent);
      },
      'conference',
      'phd_conference'
    );
  }

  function showPhDConferenceSelect(canPresent) {
    const four = pickFourConferences();
    const selected = new Set();

    function totalCost() {
      let sum = 0;
      selected.forEach(id => {
        const c = four.find(f => f.id === id);
        if (c) sum += c.cost;
      });
      return sum;
    }

    function render() {
      document.getElementById('choice-prompt').textContent = 'Which conferences this round? Click to select or deselect. Different cost and payoff. Then confirm.';
      const feedbackEl = document.getElementById('choice-feedback');
      if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.classList.add('hidden'); }
      const listEl = document.getElementById('choice-list');
      listEl.innerHTML = '';
      four.forEach(conf => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn' + (selected.has(conf.id) ? ' choice-selected' : '');
        btn.innerHTML = (selected.has(conf.id) ? '✓ ' : '') + '<span class="choice-title">' + conf.name + ' – €' + conf.cost + '</span><span class="choice-desc">' + conf.desc + '</span>';
        btn.onclick = () => {
          if (selected.has(conf.id)) selected.delete(conf.id); else selected.add(conf.id);
          render();
        };
        listEl.appendChild(btn);
      });
      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.className = 'btn btn-primary';
      confirmBtn.textContent = selected.size === 0 ? 'Confirm – skip conferences' : 'Confirm – ' + selected.size + ' selected, €' + totalCost();
      confirmBtn.onclick = () => {
        const list = four.filter(c => selected.has(c.id));
        if (list.length === 0) {
          applyEffects(skipEffects);
          showOutcome('You skipped the conference season. Back to the grind.', () => goToPhDRound(), { effects: skipEffects }, resumeToken);
          return;
        }
        const cost = totalCost();
        const canAfford = (state.stats.money || 0) >= cost;
        if (!canAfford) {
          showChoice(
            "You can't afford all selected (€" + cost + "). Apply for funding or go back to choose fewer.",
            [
              { id: 'apply', title: 'Apply for funding' },
              { id: 'back', title: 'Back to conference list' }
            ],
            fc => {
              if (fc.id === 'back') { showPhDConferenceSelect(canPresent); return; }
              const granted = Math.random() < 0.5;
              const msg = granted ? "Funding granted. You're going." : "Funding denied. Back to the list.";
              if (granted) state.stats.money = clampStat((state.stats.money || 0) + cost);
              showOutcome(msg, () => granted ? doRolesForConferences(list, canPresent) : showPhDConferenceSelect(canPresent), {}, resumeToken);
            },
            'conference',
            'phd_conference'
          );
          return;
        }
        doRolesForConferences(list, canPresent);
      };
      listEl.appendChild(confirmBtn);
      showScreen('screen-choice');
    }

    render();
  }

  function doRolesForConferences(conferences, canPresent) {
    const roles = canPresent ? PHD_CONFERENCE_ROLES : PHD_CONFERENCE_ROLES.filter(r => r.id !== 'present');
    let index = 0;
    const allEffects = { intelligence: 0, network: 0, mentalHealth: 0, luck: 0 };

    function next() {
      if (index >= conferences.length) {
        applyEffects(allEffects);
        showOutcome('Conferences over. Back to papers and reviews.', () => goToPhDRound(), { effects: allEffects }, 'goToPhDRound');
        return;
      }
      const conf = conferences[index];
      state.stats.money = clampStat((state.stats.money || 0) - conf.cost);
      updateStatBars();
      const roleOptions = roles.map(r => ({
        id: r.id,
        title: r.title,
        desc: r.desc + ' (€' + conf.cost + ' already deducted.)',
        effects: r.effects,
        serviceNoBenefit: r.serviceNoBenefit
      }));
      showChoice(
        conf.name + ' (' + conf.fullName + '). Your role?',
        roleOptions,
        choice => {
          STAT_NAMES.forEach(s => { allEffects[s] = (allEffects[s] || 0) + (choice.effects[s] || 0); });
          recordConference('phd', state.phd.round, choice.id, conf.name);
          let outcomeEffects = choice.effects;
          if (choice.serviceNoBenefit && Math.random() < CONFERENCE_SHIRK_CHANCE) {
            applyEffects(CONFERENCE_SHIRK_PUNISHMENT);
            outcomeEffects = CONFERENCE_SHIRK_PUNISHMENT;
          } else {
            applyEffects(choice.effects);
          }
          updateStatBars();
          index++;
          if (index >= conferences.length) {
            showOutcome('All done. Back to the grind.', () => goToPhDRound(), { effects: allEffects }, 'goToPhDRound');
          } else {
            showOutcome(choice.id === 'present' ? 'Paper presented.' : choice.id === 'attend' ? 'Networked.' : 'Session done.', () => next(), { effects: outcomeEffects }, 'goToPhDRound');
          }
        },
        'conference',
        'phd_conference'
      );
    }

    next();
  }

  const EMAILS_PER_SESSION = 2;

  function goToEmails(year) {
    const isMA = state.phase === 'ma';
    const prefix = isMA ? 'MA' : 'BA';
    setStageTitle(prefix + ' – Year ' + year + ' (inbox)');
    const emailResumeStep = isMA ? 'ma_year' + year + '_emails' : (year === 1 ? 'year1_emails' : 'year2_emails');
    const nextStep = isMA
      ? (year === 1 ? () => goToMAYear2Courses() : () => goToMAThesis())
      : (year === 1 ? () => runBureaucracyGame(() => goToYear2Courses()) : () => goToThesis());
    const outcomeMsg = isMA
      ? (year === 1 ? 'Inbox (mostly) handled. Year 2 courses next.' : 'You did what you could. Now: the MA thesis.')
      : (year === 1 ? 'Inbox (mostly) handled. Then: admin week. The department wants forms.' : 'You did what you could. Now: the thesis.');
    const nextToken = isMA ? (year === 1 ? 'goToMAYear2Courses' : 'goToMAThesis') : (year === 1 ? 'runBureaucracy' : 'goToThesis');

    const phase = state.phase || 'ba';
    const pool = EMAIL_POOL.filter(e => e.phase === 'both' || e.phase === phase).slice();
    const emails = [];
    for (let i = 0; i < Math.min(EMAILS_PER_SESSION, pool.length); i++) {
      emails.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    showEmailRound(emails, 0, nextStep, nextToken, outcomeMsg, emailResumeStep);
  }

  function showEmailRound(emails, index, nextStep, nextToken, outcomeMsg, emailResumeStep) {
    state.resumeStep = emailResumeStep;
    state.currentScene = 'office';
    showGameStage('office');

    if (index >= emails.length) {
      showOutcome(outcomeMsg, nextStep, {}, nextToken);
      return;
    }

    const email = emails[index];
    const prompt = 'From: ' + email.from + '\nSubject: ' + email.subject + '\n\n' + email.body + '\n\nHow do you reply?';
    const options = email.replies.map(r => ({
      title: r.label,
      desc: r.desc,
      outcome: r.outcome,
      effects: r.effects || {},
    }));

    showChoice(
      prompt,
      options,
      choice => {
        applyEffects(choice.effects);
        const nextIndex = index + 1;
        if (nextIndex >= emails.length) {
          showOutcome(choice.outcome, nextStep, { effects: choice.effects }, nextToken);
        } else {
          state.emailGame = { emails, index: nextIndex, nextToken, outcomeMsg, emailResumeStep };
          showOutcome(choice.outcome, () => runResume('emailNext'), { effects: choice.effects }, 'emailNext');
        }
      },
      'office',
      emailResumeStep
    );
  }

  function runBureaucracyGame(onComplete) {
    state.resumeStep = 'year1_bureaucracy';
    setStageTitle('Admin week');
    document.getElementById('bureaucracy-game').classList.remove('hidden');
    document.getElementById('bureaucracy-instruction').textContent = 'Sign only the BLUE form when it appears. Don\'t click red, green, or yellow. Speed depends on difficulty.';
    document.getElementById('bureaucracy-feedback').textContent = '';
    document.getElementById('bureaucracy-form-area').innerHTML = '';
    document.getElementById('bureaucracy-score').textContent = '';
    document.getElementById('bureaucracy-done').classList.add('hidden');
    showScreen('screen-bureaucracy');
    document.getElementById('stat-bars').classList.remove('hidden');

    const difficulty = getDifficulty();
    const formDisplayMs = difficulty.formDisplayMs != null ? difficulty.formDisplayMs : 1000;
    const formPauseMs = difficulty.formPauseMs != null ? difficulty.formPauseMs : 350;

    let signedCount = 0;
    let wrongCount = 0;
    let missedCount = 0;
    let formTimeoutId = null;
    const feedbackEl = document.getElementById('bureaucracy-feedback');
    const formAreaEl = document.getElementById('bureaucracy-form-area');
    const scoreEl = document.getElementById('bureaucracy-score');

    function updateScore() {
      const strikes = wrongCount + missedCount;
      scoreEl.textContent = 'Signed: ' + signedCount + ' / ' + BUREAUCRACY_BLUE_SIGNS_NEEDED + '  —  Wrong: ' + wrongCount + '  Missed: ' + missedCount + '  (' + strikes + ' / ' + BUREAUCRACY_STRIKES_MAX + ')';
    }

    function endGame(won) {
      if (formTimeoutId) clearTimeout(formTimeoutId);
      formTimeoutId = null;
      formAreaEl.innerHTML = '';
      document.getElementById('bureaucracy-game').classList.add('hidden');
      document.getElementById('bureaucracy-done').classList.remove('hidden');
      document.getElementById('bureaucracy-done-text').textContent = won
        ? 'You got the stamp. Bureaucracy defeated. (For now.)'
        : 'Too many wrong forms. The queue moves on without you. Try again next year.';
      if (won) {
        applyEffects(BUREAUCRACY_REWARD);
        updateStatBars();
      }
      document.getElementById('bureaucracy-continue-btn').onclick = onComplete;
    }

    function offerRestart() {
      if (formTimeoutId) clearTimeout(formTimeoutId);
      formTimeoutId = null;
      formAreaEl.innerHTML = '';
      feedbackEl.textContent = 'Wrong + missed = 3. Restart or give up?';
      feedbackEl.style.color = 'var(--text)';
      const wrap = document.createElement('div');
      wrap.className = 'bureaucracy-restart-buttons';
      const restartBtn = document.createElement('button');
      restartBtn.className = 'btn btn-primary';
      restartBtn.textContent = 'Restart';
      restartBtn.onclick = function () {
        signedCount = 0;
        wrongCount = 0;
        missedCount = 0;
        updateScore();
        setTimeout(showNextForm, formPauseMs);
      };
      const giveUpBtn = document.createElement('button');
      giveUpBtn.className = 'btn';
      giveUpBtn.textContent = 'Give up';
      giveUpBtn.onclick = function () { endGame(false); };
      wrap.appendChild(restartBtn);
      wrap.appendChild(giveUpBtn);
      formAreaEl.appendChild(wrap);
    }

    function showNextForm() {
      formAreaEl.innerHTML = '';
      feedbackEl.textContent = '';
      updateScore();

      const color = BUREAUCRACY_FORM_COLORS[Math.floor(Math.random() * BUREAUCRACY_FORM_COLORS.length)];
      const isBlue = color === 'blue';

      const formBox = document.createElement('div');
      formBox.className = 'bureaucracy-form-box bureaucracy-form-' + color;
      formBox.textContent = BUREAUCRACY_FORM_NAMES[Math.floor(Math.random() * BUREAUCRACY_FORM_NAMES.length)];
      formBox.dataset.color = color;

      const handleClick = function () {
        if (formTimeoutId) clearTimeout(formTimeoutId);
        formTimeoutId = null;
        formBox.remove();
        if (isBlue) {
          signedCount++;
          feedbackEl.textContent = 'Signed!';
          feedbackEl.style.color = 'var(--good)';
          if (signedCount >= BUREAUCRACY_BLUE_SIGNS_NEEDED) {
            endGame(true);
          } else {
            setTimeout(showNextForm, formPauseMs);
          }
        } else {
          wrongCount++;
          feedbackEl.textContent = 'Wrong form! Only sign the blue one.';
          feedbackEl.style.color = 'var(--bad)';
          updateScore();
          if (wrongCount + missedCount >= BUREAUCRACY_STRIKES_MAX) {
            offerRestart();
          } else {
            setTimeout(showNextForm, formPauseMs);
          }
        }
      };

      formBox.addEventListener('click', handleClick);
      formAreaEl.appendChild(formBox);

      formTimeoutId = setTimeout(function () {
        formTimeoutId = null;
        if (!formBox.parentNode) return;
        formBox.remove();
        if (isBlue) {
          missedCount++;
          feedbackEl.textContent = 'You missed the blue form!';
          feedbackEl.style.color = 'var(--warn)';
          updateScore();
          if (wrongCount + missedCount >= BUREAUCRACY_STRIKES_MAX) {
            offerRestart();
          } else {
            setTimeout(showNextForm, formPauseMs);
          }
        } else {
          setTimeout(showNextForm, formPauseMs);
        }
      }, formDisplayMs);
    }

    updateScore();
    const bureaucracyStartWrap = document.getElementById('bureaucracy-start-wrap');
    if (bureaucracyStartWrap) bureaucracyStartWrap.style.display = 'block';
    document.getElementById('bureaucracy-start-game-btn').onclick = function () {
      if (bureaucracyStartWrap) bureaucracyStartWrap.style.display = 'none';
      showNextForm();
    };
  }

  function goToYear2Courses() {
    state.step = 'ba_year2_courses';
    setStageTitle('BA – Year 2');
    tryTwoCourseChoice(
      'Choose two courses for Year 2. Pick your first, then your second.',
      'Now pick your second course.',
      BA_COURSES_Y2,
      'year2_courses_1',
      'lecture-seminar',
      (choice1, choice2) => {
        state.ba.year2Courses.push(choice1.id);
        state.ba.year2Courses.push(choice2.id);
        applyEffects(choice1.effects);
        applyEffects(choice2.effects);
        state.currentScene = getLectureSceneForCourse(choice2.id);
        showGameStage(state.currentScene);
        const mergedEffectsY2 = {};
        STAT_NAMES.forEach(s => { mergedEffectsY2[s] = (choice1.effects[s] || 0) + (choice2.effects[s] || 0); });
        showReportCard(2, false, [choice1.id, choice2.id], () => goToFreeTime(2), mergedEffectsY2);
      }
    );
  }

  function goToThesis() {
    state.step = 'ba_thesis';
    setStageTitle('BA – Thesis');
    showChoice(
      'Pick your thesis topic. This will shape your profile for the MA — or for life outside academia.',
      THESIS_TOPICS,
      choice => {
        state.ba.thesisTopic = choice.id;
        applyEffects(choice.effects);
        const th = getMAThreshold();
        const passed = state.stats.intelligence >= th.int && state.stats.mentalHealth >= th.mh;
        showOutcome(
          passed
            ? 'You defended your thesis. You’re eligible to apply for the MA — or you can leave now and never look back.'
            : 'You got through the thesis. It was rough. You’re not sure the MA is for you — but you could try, or leave now.',
          () => showBACrossroads(passed),
          { effects: choice.effects },
          'showBACrossroads'
        );
      },
      'campus',
      'year2_thesis'
    );
  }

  function showBACrossroads(eligibleMA) {
    setStageTitle('BA – What next?');
    const choices = [
      {
        id: 'leave',
        title: 'Leave academia',
        desc: 'Get a job. Sleep. Have a life. (You have a feeling something good awaits.)',
        effects: {},
      },
      {
        id: 'ma',
        title: 'Apply for the MA',
        desc: eligibleMA
          ? 'You meet the bar. Time to see if they take you.'
          : 'It’s a long shot. But you could try.',
        effects: {},
      },
    ];
    showChoice(
      'What do you do?',
      choices,
      choice => {
        if (choice.id === 'leave') {
          triggerHeaven();
        } else {
          const acceptChance = getMAAcceptChance(eligibleMA);
          const gotIn = Math.random() < acceptChance;
          if (gotIn) {
            const otherUnis = FAKE_UNIVERSITIES.filter(u => u !== state.universityBA);
            const maOptions = [];
            const n = Math.min(3, otherUnis.length);
            for (let i = 0; i < n; i++) {
              const idx = Math.floor(Math.random() * otherUnis.length);
              const uni = otherUnis.splice(idx, 1)[0];
              maOptions.push({ id: 'ma_uni_' + i, title: uni, desc: 'You got in here. Different city, same grind.', effects: {}, university: uni });
            }
            showChoice(
              'You got in — to more than one place. Where do you go for the MA?',
              maOptions,
              choice => {
                state.universityMA = choice.university;
                showOutcome(
                  'You\'re heading to ' + state.universityMA + '. The MA awaits: tougher courses, colloquia and workshops, and a thesis that actually matters.',
                  () => startMA(),
                  {},
                  'startMA'
                );
              },
              'campus',
              'ma_uni_choice'
            );
          } else {
            const rejectionMsg = getMARejectionReason();
            showOutcome(
              'Rejected. ' + rejectionMsg + ' You could sit out a year and try again — or leave to heaven now.',
              () => showMARejectedChoice(),
              {},
              'heavenAfterReject'
            );
            document.getElementById('outcome-continue').textContent = 'Next';
          }
        }
      },
      'campus',
      'crossroads'
    );
  }

  function showMARejectedChoice() {
    state.resumeStep = 'ma_rejected_choice';
    showChoice(
      'What do you do?',
      [
        { id: 'sit_out', title: 'Sit out a year', desc: 'Take a year. Do something. Apply again next cycle.', effects: {} },
        { id: 'leave', title: 'Leave to heaven', desc: 'Enough. Corporate life awaits.', effects: {} },
      ],
      sitChoice => {
        if (sitChoice.id === 'leave') {
          triggerHeaven();
          return;
        }
        showMASitOutYear();
      },
      'campus',
      'ma_sit_out'
    );
  }

  function showMASitOutYear() {
    state.resumeStep = 'ma_sit_out';
    showChoice(
      'How do you spend your year out?',
      MA_SIT_OUT_OPTIONS,
      sitOutChoice => {
        applyEffects(sitOutChoice.effects);
        updateStatBars();
        const outcomes = {
          industry: 'You survived the office. Your new colleagues asked when you\'re "going back to uni." You said soon. You applied again.',
          nothing: 'You did nothing. It was glorious. You also forgot some methods. Your brain is rested. Your CV has a gap. You explain it as "reflection."',
          world_trip: 'You came back with stories and no savings. One programme asked what you learned. You said "perspective." They nodded. You\'re not sure they believed you.',
          temp_dept: 'You fetched a lot of coffee. You also got to know the grad director. They remembered your name when you applied again. That might help. Or not.',
          retreat: 'The wall was a great listener. You wrote 8,000 words. You deleted 7,200. The rest might become something. You applied again.',
          pub: 'You can now recommend a beer for every methodology. The regulars gave better feedback than your last reviewer. You applied again.',
        };
        const msg = outcomes[sitOutChoice.id] || 'You did something. You applied again.';
        showOutcome(
          msg,
          () => showMAApplyAgainChoice(),
          { effects: sitOutChoice.effects },
          'ma_sit_out_done'
        );
      },
      'campus',
      'ma_sit_out'
    );
  }

  function showMAApplyAgainChoice() {
    const th = getMAThreshold();
    const passedNow = (state.stats.intelligence || 0) >= th.int && (state.stats.mentalHealth || 0) >= th.mh;
    state.resumeStep = 'crossroads';
    showChoice(
      'Next cycle. Apply for the MA again?',
      [
        { id: 'apply', title: 'Apply again', desc: 'Your stats have changed. Maybe this time.', effects: {} },
        { id: 'leave', title: 'Leave to heaven', desc: 'You\'ve had enough of rejection letters.', effects: {} },
      ],
      againChoice => {
        if (againChoice.id === 'leave') triggerHeaven();
        else showBACrossroads(passedNow);
      },
      'campus',
      'crossroads'
    );
  }

  function startMA() {
    state.phase = 'ma';
    state.ma = { year1Courses: [], year2Courses: [], thesisTopic: null };
    state.step = 'ma_year1_courses';
    state.resumeStep = 'ma_year1_courses_1';
    setStageTitle('MA – Year 1');
    tryTwoCourseChoice(
      'Choose two courses for your first year of the MA. Pick your first, then your second.',
      'Now pick your second course.',
      MA_COURSES_Y1,
      'ma_year1_courses_1',
      'lecture-seminar',
      (choice1, choice2) => {
        state.ma.year1Courses.push(choice1.id);
        state.ma.year1Courses.push(choice2.id);
        applyEffects(choice1.effects);
        applyEffects(choice2.effects);
        state.currentScene = getLectureSceneForCourse(choice2.id);
        showGameStage(state.currentScene);
        const merged = {};
        STAT_NAMES.forEach(s => { merged[s] = (choice1.effects[s] || 0) + (choice2.effects[s] || 0); });
        showReportCard(1, true, [choice1.id, choice2.id], () => goToFreeTime(1), merged);
      }
    );
  }

  function goToMAYear2Courses() {
    state.step = 'ma_year2_courses';
    setStageTitle('MA – Year 2');
    tryTwoCourseChoice(
      'Choose two courses for Year 2 of the MA. Pick your first, then your second.',
      'Now pick your second course.',
      MA_COURSES_Y2,
      'ma_year2_courses_1',
      'lecture-seminar',
      (choice1, choice2) => {
        state.ma.year2Courses.push(choice1.id);
        state.ma.year2Courses.push(choice2.id);
        applyEffects(choice1.effects);
        applyEffects(choice2.effects);
        state.currentScene = getLectureSceneForCourse(choice2.id);
        showGameStage(state.currentScene);
        const merged = {};
        STAT_NAMES.forEach(s => { merged[s] = (choice1.effects[s] || 0) + (choice2.effects[s] || 0); });
        showReportCard(2, true, [choice1.id, choice2.id], () => goToFreeTime(2), merged);
      }
    );
  }

  function goToMAThesis() {
    state.step = 'ma_thesis';
    setStageTitle('MA – Thesis');
    showChoice(
      'Pick your MA thesis topic. This will shape your profile for the PhD — or for life outside academia.',
      MA_THESIS_TOPICS,
      choice => {
        state.ma.thesisTopic = choice.id;
        applyEffects(choice.effects);
        showOutcome(
          'You defended your MA thesis. You can apply for the PhD — or leave to heaven.',
          () => showMACrossroads(),
          { effects: choice.effects },
          'showMACrossroads'
        );
      },
      'campus',
      'ma_thesis'
    );
  }

  function startPhD(programName) {
    state.phase = 'phd';
    state.phd = { round: 1, papers: [], nextPaperId: 1, papersAccepted: 0 };
    if (programName) state.phdProgram = programName;
    const msg = programName
      ? "You got into " + programName + ". PhD life begins. You'll work on paper projects — start new ones, drop ones that aren't progressing. Watch out: sometimes someone publishes the same idea first, or a draft gets stolen."
      : "You got in. PhD life begins. You'll work on paper projects — start new ones, drop ones that aren't progressing. Watch out: sometimes someone publishes the same idea first, or a draft gets stolen.";
    showOutcome(msg, () => goToPhDRound(), {}, 'goToPhDRound');
  }

  function startPhDApplication() {
    state.resumeStep = 'phd_application';
    state.currentScene = 'campus';
    showGameStage('campus');
    setStageTitle('PhD applications');
    showPhDApplicationChoice([]);
  }

  function showPhDApplicationChoice(selected) {
    const money = state.stats.money || 0;
    const mh = state.stats.mentalHealth || 0;
    const n = selected.length;
    const canAddMore = n < PHD_APP_MAX &&
      money >= (n + 1) * PHD_APP_MONEY_PER &&
      mh + (n + 1) * PHD_APP_MH_PER >= PHD_APP_MIN_MH_AFTER;
    const unlocked = PHD_PROGRAMS.filter(p =>
      (state.stats.network || 0) >= p.minNetwork && (state.stats.luck || 0) >= p.minLuck
    );
    const available = unlocked.filter(p => !selected.find(s => s.id === p.id) && canAddMore);

    let prompt = 'Choose programmes to apply to. Each application costs €' + PHD_APP_MONEY_PER + ' and costs mental health (' + PHD_APP_MH_PER + '). You can apply to at most ' + PHD_APP_MAX + '. Your network and luck determine which options you see.';
    if (n > 0) {
      prompt += ' Applied so far: ' + selected.map(s => s.name).join(', ') + '. Money left: €' + Math.max(0, money - n * PHD_APP_MONEY_PER) + ', mental health after apps: ' + Math.max(0, mh + n * PHD_APP_MH_PER) + '.';
    } else {
      prompt += ' You have €' + money + ' and mental health ' + mh + '.';
    }

    const options = [];
    available.forEach(p => {
      options.push({
        id: 'apply_' + p.id,
        program: p,
        title: 'Apply to: ' + p.name,
        desc: p.desc + ' (€' + PHD_APP_MONEY_PER + ', ' + PHD_APP_MH_PER + ' MH)',
        effects: {},
      });
    });
    if (n >= 1) {
      options.push({
        id: 'done',
        title: 'Done – submit ' + n + ' application' + (n === 1 ? '' : 's'),
        desc: 'Send your applications and see who responds.',
        effects: {},
      });
    }

    if (options.length === 0) {
      if (n === 0) {
        showChoice(
          "You can't afford any applications right now (need €" + PHD_APP_MONEY_PER + " and enough mental health), or no programmes are unlocked.",
          [
            { id: 'leave', title: 'Leave academia', desc: 'Enough. Heaven awaits.', effects: {} },
            { id: 'rest', title: 'Take a break', desc: 'Step back and recover. +' + PHD_APP_REST_MH + ' mental health.', effects: { mentalHealth: PHD_APP_REST_MH } },
            { id: 'bike', title: 'Work as a bike courier', desc: 'Earn money and get some fresh air. +€ per delivery, +' + BIKE_COURIER_MH_BONUS + ' mental health.', effects: {} },
          ],
          choice => {
            if (choice.id === 'leave') {
              triggerHeaven();
            } else if (choice.id === 'rest') {
              applyEffects({ mentalHealth: PHD_APP_REST_MH });
              showOutcome('You took a break and feel a bit better. Back to the application pile.', () => showPhDApplicationChoice([]), { mentalHealth: PHD_APP_REST_MH }, 'phd_application');
            } else {
              runBikeCourierGame(() => showPhDApplicationChoice([]));
            }
          },
          'campus',
          'ma_crossroads'
        );
        return;
      }
      showOutcome(
        "You've reached the maximum applications or your budget is used up. Submitting " + n + " application(s) now.",
        () => resolvePhDApplications(selected),
        {},
        'phd_application'
      );
      return;
    }

    showChoice(
      prompt,
      options,
      choice => {
        if (choice.id === 'done') {
          resolvePhDApplications(selected);
          return;
        }
        if (choice.program) {
          const nextSelected = selected.concat([choice.program]);
          showPhDApplicationChoice(nextSelected);
        }
      },
      'campus',
      'phd_application'
    );
  }

  function resolvePhDApplications(selected) {
    const totalCost = selected.length * PHD_APP_MONEY_PER;
    const totalMH = selected.length * PHD_APP_MH_PER;
    state.stats.money = clampStat((state.stats.money || 0) - totalCost);
    state.stats.mentalHealth = clampStat((state.stats.mentalHealth || 0) + totalMH);

    const int = (state.stats.intelligence || 0) / 100;
    const net = (state.stats.network || 0) / 100;
    const luck = (state.stats.luck || 0) / 100;
    const variance = getVariance();

    const results = selected.map(prog => {
      let chance = prog.baseAccept + int * 0.22 + net * 0.15 + luck * 0.12 + (Math.random() - 0.5) * 2 * (variance / 100);
      chance = Math.max(0.05, Math.min(0.92, chance));
      const accept = Math.random() < chance;
      return { program: prog, accept };
    });

    const accepted = results.filter(r => r.accept);
    if (accepted.length > 0) {
      const picked = accepted[Math.floor(Math.random() * accepted.length)].program;
      startPhD(picked.name);
      return;
    }

    const programList = selected.map(p => p.name).join(', ');
    showOutcome(
      "No offers. You applied to: " + programList + ". The rejection letters were generic. You can take a year to recover and try again, or leave academia.",
      () => {
        applyEffects({ mentalHealth: 8, money: 0 });
        showChoice(
          'What do you do?',
          [
            { id: 'retry', title: 'Try again next cycle', desc: 'Apply again. Your mental health has recovered a little.', effects: {} },
            { id: 'leave', title: 'Leave academia', desc: 'Enough. Heaven awaits.', effects: {} },
          ],
          c => {
            if (c.id === 'leave') triggerHeaven();
            else startPhDApplication();
          },
          'campus',
          'ma_crossroads'
        );
      },
      {},
      'phd_application'
    );
  }

  function getSubmittablePapers() {
    return (state.phd.papers || []).filter(p =>
      p.status === 'active' &&
      p.progress >= PHD_SUBMIT_MIN_PROGRESS &&
      state.phd.round > (p.startedRound ?? 0)
    );
  }

  function showPapersMenu() {
    state.resumeStep = 'phd_round';
    state.currentScene = 'campus';
    showGameStage('campus');
    setStageTitle('PhD – Papers');

    const activePapers = state.phd.papers.filter(p => p.status === 'active');
    const underReviewPapers = state.phd.papers.filter(p => p.status === 'under_review');
    const submittable = getSubmittablePapers();
    const canStart = state.phd.papers.length < PHD_MAX_PAPERS;

    const options = [];
    if (canStart) {
      options.push({ id: 'start', title: 'Start a new paper', desc: 'Pick a project and add it to your pile.', effects: {}, paper: null });
    }
    activePapers.forEach(p => {
      const subDesc = (p.progress >= PHD_SUBMIT_MIN_PROGRESS && state.phd.round > (p.startedRound ?? 0))
        ? 'Progress ' + p.progress + '%. Can end or submit.'
        : 'Progress ' + p.progress + '%. Can end (submit after at least one round since start).';
      options.push({
        id: 'paper_' + p.id,
        title: (p.title || 'Paper #' + p.id) + ' (' + p.progress + '%)',
        desc: (p.abstract ? (p.abstract.length > 100 ? p.abstract.slice(0, 97) + '...' : p.abstract) : subDesc),
        effects: {},
        paper: p,
      });
    });
    underReviewPapers.forEach(p => {
      const j = getPhdJournal(p.submittedTo);
      const journalName = j ? j.name : 'Unknown';
      options.push({
        id: 'paper_' + p.id,
        title: (p.title || 'Paper #' + p.id) + ' (under review)',
        desc: 'At ' + journalName + '. Decision next year.',
        effects: {},
        paper: p,
      });
    });
    options.push({ id: 'back', title: 'Back to round', desc: 'Return to the main menu.', effects: {}, paper: null });

    if (options.length === 1) {
      showOutcome('No active papers and you\'re at the max. Go back and spend the year.', () => goToPhDRound(), {}, 'goToPhDRound');
      return;
    }

    showChoice(
      'Your papers. Start a new one, or open one to end or submit (submit only after at least one round since you started it).',
      options,
      choice => {
        if (choice.id === 'back') {
          goToPhDRound();
          return;
        }
        if (choice.id === 'start') {
          const template = PHD_PAPER_TEMPLATES[Math.floor(Math.random() * PHD_PAPER_TEMPLATES.length)];
          const id = state.phd.nextPaperId++;
          state.phd.papers.push({
            id,
            progress: 0,
            status: 'active',
            title: template.title,
            abstract: template.abstract,
            startedRound: state.phd.round,
          });
          showOutcome(
            'You started a new paper: «' + template.title + '». ' + template.abstract,
            () => showPapersMenu(),
            {},
            'phd_round'
          );
          return;
        }
        if (choice.paper) {
          showPaperDetail(choice.paper);
        }
      },
      'campus',
      'phd_round'
    );
  }

  function showPaperDetail(paper) {
    if (paper.status === 'under_review') {
      const j = getPhdJournal(paper.submittedTo);
      const journalName = j ? j.name : 'Unknown';
      showChoice(
        (paper.title || 'Paper #' + paper.id) + '\n\n' + (paper.abstract || 'No abstract.') + '\n\nUnder review at ' + journalName + '. Decision next year.',
        [{ id: 'back', title: 'Back to paper list', desc: '', effects: {}, paper: null }],
        c => {
          if (c.id === 'back') showPapersMenu();
        },
        'campus',
        'phd_round'
      );
      return;
    }
    const submittable = paper.status === 'active' && paper.progress >= PHD_SUBMIT_MIN_PROGRESS && state.phd.round > (paper.startedRound ?? 0);
    const opts = [
      { id: 'end', title: 'End this paper', desc: 'Drop the project. It will be marked stopped.', effects: {}, paper: paper },
      { id: 'back', title: 'Back to paper list', desc: '', effects: {}, paper: null },
    ];
    if (submittable) {
      opts.unshift({ id: 'submit', title: 'Submit to a journal', desc: 'Progress ' + paper.progress + '%. Decision next year: desk reject / R&R / rarely direct accept.', effects: {}, paper: paper });
    }
    showChoice(
      (paper.title || 'Paper #' + paper.id) + '\n\n' + (paper.abstract || 'No abstract.'),
      opts,
      c => {
        if (c.id === 'back') {
          showPapersMenu();
          return;
        }
        if (c.id === 'end') {
          const p = state.phd.papers.find(x => x.id === paper.id);
          if (p) p.status = 'stopped';
          showOutcome('You ended «' + (paper.title || 'Paper #' + paper.id) + '». One less thing.', () => showPapersMenu(), {}, 'phd_round');
          return;
        }
        if (c.id === 'submit') {
          const journalOptions = PHD_JOURNALS.map(j => ({
            id: j.id,
            title: j.name,
            desc: 'Prestige ' + j.prestige + ', h-index ' + j.hIndex + '. Decision next year: desk reject / R&R / rarely direct accept.',
            effects: {},
            journal: j,
          }));
          showChoice('Which journal?', journalOptions, journalChoice => {
            const journal = journalChoice.journal;
            const p = state.phd.papers.find(x => x.id === paper.id);
            if (p) {
              p.status = 'under_review';
              p.submittedTo = journal.id;
              p.submittedRound = state.phd.round;
            }
            showOutcome(
              '«' + (paper.title || paper.id) + '» submitted to ' + journal.name + '. You\'ll get a decision next year (desk reject, R&R, or rarely direct acceptance).',
              () => showPapersMenu(),
              {},
              'phd_round'
            );
          }, 'campus', 'phd_round');
        }
      },
      'campus',
      'phd_round'
    );
  }

  function goToPhDRound() {
    state.resumeStep = 'phd_round';
    state.currentScene = 'campus';
    showGameStage('campus');
    setStageTitle('PhD – Year ' + state.phd.round);

    const pendingDecisions = (state.phd.papers || []).filter(p => p.status === 'under_review' && p.submittedRound === state.phd.round - 1);
    if (pendingDecisions.length > 0) {
      const messages = [];
      const totalEffects = { intelligence: 0, network: 0, mentalHealth: 0, luck: 0 };
      pendingDecisions.forEach(paper => {
        const journal = getPhdJournal(paper.submittedTo);
        const journalName = journal ? journal.name : 'Unknown';
        const decision = journal ? rollJournalDecision(journal, paper) : 'desk_reject';
        if (decision === 'accept') {
          state.phd.papers = state.phd.papers.filter(p => p.id !== paper.id);
          state.phd.papersAccepted = (state.phd.papersAccepted || 0) + 1;
          Object.keys(PHD_ACCEPT_EFFECTS).forEach(k => { totalEffects[k] = (totalEffects[k] || 0) + (PHD_ACCEPT_EFFECTS[k] || 0); });
          messages.push('«' + (paper.title || paper.id) + '» at ' + journalName + ': Direct acceptance. Published.');
        } else if (decision === 'desk_reject') {
          paper.status = 'active';
          totalEffects.mentalHealth = (totalEffects.mentalHealth || 0) + PHD_REJECT_MH;
          messages.push('«' + (paper.title || paper.id) + '» at ' + journalName + ': Desk reject. You can resubmit elsewhere.');
        } else {
          paper.status = 'active';
          totalEffects.mentalHealth = (totalEffects.mentalHealth || 0) + PHD_RR_MH;
          messages.push('«' + (paper.title || paper.id) + '» at ' + journalName + ': R&R (revise and resubmit). You can resubmit next round.');
        }
      });
      applyEffects(totalEffects);
      showOutcome(
        'Decisions are in.\n\n' + messages.join('\n\n'),
        () => goToPhDRound(),
        { effects: totalEffects },
        'goToPhDRound'
      );
      return;
    }

    const activePapers = state.phd.papers.filter(p => p.status === 'active');
    if (activePapers.length > 0) {
      applyEffects({
        mentalHealth: activePapers.length * PHD_PAPER_MH_PER_TURN,
        network: activePapers.length * PHD_PAPER_NETWORK_PER_TURN,
      });
    }

    let prompt = 'PhD Year ' + state.phd.round + '. ';
    if (state.phd.papers.length === 0) {
      prompt += 'No papers yet. Open the paper menu to start one. ';
    } else {
      prompt += 'Papers: ' + state.phd.papers.map(p => {
        if (p.status === 'active') return (p.title ? p.title.slice(0, 28) + (p.title.length > 28 ? '…' : '') : 'Paper') + ' (' + p.progress + '%)';
        if (p.status === 'under_review') {
          const j = getPhdJournal(p.submittedTo);
          return (p.title ? p.title.slice(0, 20) + (p.title.length > 20 ? '…' : '') : 'Paper') + ' (under review at ' + (j ? j.name : '?') + ')';
        }
        return p.status;
      }).join('; ') + '. ';
      if (activePapers.length > 0) {
        prompt += 'Keeping projects running costs mental health and network each year. ';
      }
    }
    prompt += 'You need ' + PHD_PAPERS_REQUIRED + ' papers accepted by end of Year ' + PHD_MAX_ROUNDS + '. So far: ' + (state.phd.papersAccepted || 0) + '. What do you do this year?';

    const options = [];
    options.push({ id: 'papers', title: 'Open paper menu', desc: 'Start, end, or submit papers. View titles and abstracts.', effects: {} });
    PHD_ROUND_ACTIVITIES.forEach(a => {
      options.push({ id: a.id, title: a.title, desc: a.desc, effects: a.effects, activity: a });
    });
    options.push({ id: 'conference', title: 'Go to a conference', desc: 'Present, attend, or skip. Costs money.', effects: {} });
    options.push({ id: 'continue', title: 'Spend the year on teaching, admin & drafts', desc: 'Teaching, committees, and writing. Papers inch forward — or get scooped.', effects: {} });

    showChoice(prompt, options, choice => {
      if (choice.id === 'papers') {
        showPapersMenu();
        return;
      }
      if (choice.activity) {
        applyEffects(choice.activity.effects);
        showOutcome(
          choice.activity.title + '. ' + (choice.activity.desc || ''),
          () => goToPhDRound(),
          { effects: choice.activity.effects },
          'goToPhDRound'
        );
        return;
      }
      if (choice.id === 'conference') {
        goToPhDConference();
        return;
      }
      if (choice.id === 'continue') {
        const killed = [];
        activePapers.forEach(p => {
          if (Math.random() < PHD_PAPER_KILL_CHANCE) {
            p.status = 'killed';
            killed.push(p.id);
            applyEffects({ mentalHealth: PHD_PAPER_KILL_MH });
          } else {
            p.progress = Math.min(100, p.progress + PHD_PROGRESS_PER_ROUND);
          }
        });
        state.phd.round++;
        let msg = 'Year over. ';
        if (killed.length > 0) {
          msg += 'One of your papers was scooped — someone had the same idea or it got stolen. It happens. ';
        }
        if (state.phd.round > PHD_MAX_ROUNDS) {
          const accepted = state.phd.papersAccepted || 0;
          if (accepted >= PHD_PAPERS_REQUIRED) {
            msg += 'End of Year 6. You have ' + accepted + ' paper(s) accepted. Time to submit the thesis and defend.';
            showOutcome(msg, () => goToSubmitThesis(), {}, 'phd_submit');
            document.getElementById('outcome-continue').textContent = 'Continue';
          } else {
            msg += 'End of Year 6. You needed ' + PHD_PAPERS_REQUIRED + ' papers accepted; you have ' + accepted + '. The department suggests you leave. You get a job in industry anyway.';
            showOutcome(msg, () => triggerHeaven('phd_thrown_out'), {}, 'phd_thrown_out');
            document.getElementById('outcome-continue').textContent = 'Continue';
          }
        } else {
          msg += 'Next year. You need ' + PHD_PAPERS_REQUIRED + ' papers accepted by end of Year ' + PHD_MAX_ROUNDS + '. So far: ' + (state.phd.papersAccepted || 0) + '.';
          showOutcome(msg, () => goToPhDRound(), {}, 'goToPhDRound');
        }
      }
    }, 'campus', 'phd_round');
  }

  function goToSubmitThesis() {
    state.resumeStep = 'phd_submit';
    state.currentScene = 'campus';
    showGameStage('campus');
    setStageTitle('PhD – Submit thesis');
    const opts = PHD_SUBMIT_OPTIONS.map(o => ({
      id: o.id,
      title: o.title,
      desc: o.desc,
      effects: {},
      outcome: o.outcome,
    }));
    showChoice(
      'How do you submit your thesis?',
      opts,
      choice => {
        const opt = PHD_SUBMIT_OPTIONS.find(o => o.id === choice.id);
        const outcome = (opt && opt.outcome) || 'Submitted. Now the defence.';
        showOutcome(outcome, () => goToDefend(), {}, 'phd_defend');
      },
      'campus',
      'phd_submit'
    );
  }

  function goToDefend() {
    state.resumeStep = 'phd_defend';
    state.currentScene = 'campus';
    showGameStage('campus');
    setStageTitle('PhD – Defence');
    const opts = PHD_DEFEND_OPTIONS.map(o => ({
      id: o.id,
      title: o.title,
      desc: o.desc,
      effects: {},
      outcome: o.outcome,
    }));
    showChoice(
      'How do you defend?',
      opts,
      choice => {
        const opt = PHD_DEFEND_OPTIONS.find(o => o.id === choice.id);
        const outcome = (opt && opt.outcome) || 'You passed. Dr. You.';
        showOutcome(outcome + ' You are officially Dr. ' + (state.playerName || state.cvName || 'You') + '. What next?', () => showAfterPhDChoice(), {}, 'after_phd');
      },
      'campus',
      'phd_defend'
    );
  }

  function showAfterPhDChoice() {
    state.resumeStep = 'after_phd';
    setStageTitle('After the PhD');
    showChoice(
      'You have a doctorate. The world is your oyster. Or at least the job market is.',
      [
        { id: 'leave', title: 'Leave academia', desc: 'Industry, policy, consulting. You\'ve had enough.', effects: {} },
        { id: 'postdoc', title: 'Apply for post-doc positions', desc: 'More grants, more papers. The grind continues.', effects: {} },
      ],
      choice => {
        if (choice.id === 'leave') {
          triggerHeaven();
        } else {
          startPostDocApplication();
        }
      },
      'campus',
      'after_phd'
    );
  }

  function startPostDocApplication() {
    state.resumeStep = 'postdoc_application';
    state.currentScene = 'campus';
    showGameStage('campus');
    setStageTitle('Post-doc applications');
    showPostDocChoice([]);
  }

  function showPostDocChoice(selected) {
    const money = state.stats.money || 0;
    const mh = state.stats.mentalHealth || 0;
    const n = selected.length;
    const canAddMore = n < POSTDOC_APP_MAX &&
      money >= (n + 1) * POSTDOC_APP_MONEY_PER &&
      mh + (n + 1) * POSTDOC_APP_MH_PER >= 15;
    const unlocked = POSTDOC_PROGRAMS.filter(p =>
      (state.stats.network || 0) >= p.minNetwork && (state.stats.luck || 0) >= p.minLuck
    );
    const available = unlocked.filter(p => !selected.find(s => s.id === p.id) && canAddMore);

    let prompt = 'Apply to post-doc positions. Each application costs €' + POSTDOC_APP_MONEY_PER + ' and ' + POSTDOC_APP_MH_PER + ' mental health. Max ' + POSTDOC_APP_MAX + '.';
    if (n > 0) prompt += ' Applied: ' + selected.map(s => s.name).join(', ') + '.';
    const options = available.map(p => ({
      id: 'apply_' + p.id,
      program: p,
      title: 'Apply: ' + p.name,
      desc: p.desc,
      effects: {},
    }));
    if (n >= 1) options.push({ id: 'done', title: 'Submit ' + n + ' application(s)', desc: 'See who responds.', effects: {} });
    if (options.length === 0 && n === 0) {
      showOutcome('You can\'t afford any applications or no positions are unlocked. You leave for industry.', () => triggerHeaven(), {}, 'phd_done');
      return;
    }
    if (options.length === 0) {
      resolvePostDocApplications(selected);
      return;
    }
    showChoice(prompt, options, choice => {
      if (choice.id === 'done') {
        resolvePostDocApplications(selected);
        return;
      }
      if (choice.program) {
        showPostDocChoice(selected.concat([choice.program]));
      }
    }, 'campus', 'postdoc_application');
  }

  function resolvePostDocApplications(selected) {
    const totalCost = selected.length * POSTDOC_APP_MONEY_PER;
    const totalMH = selected.length * POSTDOC_APP_MH_PER;
    state.stats.money = clampStat((state.stats.money || 0) - totalCost);
    state.stats.mentalHealth = clampStat((state.stats.mentalHealth || 0) + totalMH);
    const int = (state.stats.intelligence || 0) / 100;
    const net = (state.stats.network || 0) / 100;
    const luck = (state.stats.luck || 0) / 100;
    const variance = getVariance();
    const results = selected.map(prog => {
      let chance = prog.baseAccept + int * 0.2 + net * 0.18 + luck * 0.1 + (Math.random() - 0.5) * 2 * (variance / 100);
      chance = Math.max(0.05, Math.min(0.88, chance));
      return { program: prog, accept: Math.random() < chance };
    });
    const accepted = results.filter(r => r.accept);
    if (accepted.length > 0) {
      const picked = accepted[Math.floor(Math.random() * accepted.length)].program;
      triggerHeaven('postdoc');
      return;
    }
    const programList = selected.map(p => p.name).join(', ');
    showOutcome(
      'No post-doc offers. You applied to: ' + programList + '. You leave for industry.',
      () => triggerHeaven(),
      {},
      'phd_done'
    );
  }

  function showMACrossroads() {
    setStageTitle('MA – What next?');
    const choices = [
      { id: 'leave', title: 'Leave academia', desc: 'You have an MA. Corporate, policy, consulting. (Heaven awaits.)', effects: {} },
      { id: 'phd', title: 'Apply for the PhD', desc: 'The long road. More papers, more reviews, more stress. You know the drill.', effects: {} },
    ];
    showChoice(
      'What do you do?',
      choices,
      choice => {
        if (choice.id === 'leave') {
          triggerHeaven();
        } else {
          startPhDApplication();
        }
      },
      'campus',
      'ma_crossroads'
    );
  }

  function pickMaxOptions(arr, max) {
    if (!arr.length || max >= arr.length) return arr.slice();
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, max);
  }

  function showChoice(promptText, options, onSelect, scene, resumeStep) {
    if (resumeStep != null) state.resumeStep = resumeStep;
    state.currentScene = scene || 'campus';
    showGameStage(state.currentScene);
    document.getElementById('choice-prompt').textContent = promptText;
    const feedbackEl = document.getElementById('choice-feedback');
    if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.classList.add('hidden'); }
    const list = document.getElementById('choice-list');
    list.innerHTML = '';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = opt.desc
        ? `<span class="choice-title">${opt.title}</span>\t<span class="choice-desc">${opt.desc}</span>`
        : `<span class="choice-title">${opt.title}</span>`;
      btn.addEventListener('click', () => {
        playCharacterAnim('walk', 900);
        setTimeout(() => onSelect(opt), 900);
      });
      list.appendChild(btn);
    });
    showScreen('screen-choice');
  }

  function getCourseFullChance() {
    if (!state.stats) return 0.1;
    const luck = state.stats.luck || 0;
    return Math.max(0.03, COURSE_FULL_BASE_CHANCE - (luck / 100) * COURSE_FULL_LUCK_FACTOR);
  }

  function tryCourseChoice(prompt, options, resumeStep, scene, onSuccess) {
    if (options.length === 0) return;
    showChoice(prompt, options, choice => {
      if (Math.random() < getCourseFullChance()) {
        const remaining = options.filter(c => c.id !== choice.id);
        showOutcome(
          'That course is full — you missed the deadline. Choose another.',
          () => {
            if (remaining.length > 0) {
              tryCourseChoice(prompt, remaining, resumeStep, scene, onSuccess);
            } else {
              onSuccess(choice);
            }
          },
          {},
          null
        );
        return;
      }
      onSuccess(choice);
    }, scene, resumeStep);
  }

  function tryTwoCourseChoice(promptFirst, promptSecond, allCourses, resumeStep, scene, onBothSuccess) {
    if (!allCourses || allCourses.length < 2) return;
    if (resumeStep != null) state.resumeStep = resumeStep;
    state.currentScene = scene || 'lecture-seminar';
    showGameStage(state.currentScene);

    const displayedOptions = pickMaxOptions(allCourses, MAX_COURSES_DISPLAY);
    let firstSelected = null;
    const promptEl = document.getElementById('choice-prompt');
    const feedbackEl = document.getElementById('choice-feedback');
    const listEl = document.getElementById('choice-list');

    function clearFeedback() {
      feedbackEl.textContent = '';
      feedbackEl.classList.add('hidden');
    }

    function renderList(options, onPick) {
      listEl.innerHTML = '';
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = opt.desc
          ? '<span class="choice-title">' + opt.title + '</span>\t<span class="choice-desc">' + opt.desc + '</span>'
          : '<span class="choice-title">' + opt.title + '</span>';
        btn.addEventListener('click', () => {
          clearFeedback();
          playCharacterAnim('walk', 400);
          setTimeout(() => onPick(opt), 400);
        });
        listEl.appendChild(btn);
      });
    }

    function handlePick(choice) {
      const full = Math.random() < getCourseFullChance();
      if (full) {
        feedbackEl.textContent = 'That course is full — you missed the deadline. Choose another.';
        feedbackEl.classList.remove('hidden');
        return;
      }
      if (firstSelected === null) {
        firstSelected = choice;
        promptEl.textContent = promptSecond;
        const remaining = displayedOptions.filter(c => c.id !== choice.id);
        renderList(remaining, handlePick);
      } else {
        onBothSuccess(firstSelected, choice);
      }
    }

    promptEl.textContent = promptFirst;
    clearFeedback();
    renderList(displayedOptions, handlePick);
    showScreen('screen-choice');
  }

  function showOutcome(text, onContinue, opts = {}, resumeToken) {
    if (resumeToken != null) {
      state.resumeStep = 'outcome';
      state.outcomeText = text;
      state.resumeToken = resumeToken;
    }
    showGameStage(state.currentScene || 'campus');
    playCharacterAnim('stress', 500);
    document.getElementById('outcome-text').textContent = text;
    const transparencyEl = document.getElementById('outcome-transparency');
    if (showTransparency() && (opts.effects || opts.kidsChancePercent != null)) {
      const lines = [];
      if (opts.effects) lines.push(formatEffects(opts.effects));
      if (opts.kidsChancePercent != null) lines.push(`When you socialize a lot, there's a ~${opts.kidsChancePercent}% chance of a random life event.`);
      transparencyEl.textContent = lines.join(' ');
      transparencyEl.classList.remove('hidden');
    } else {
      transparencyEl.textContent = '';
      transparencyEl.classList.add('hidden');
    }
    const btn = document.getElementById('outcome-continue');
    btn.classList.remove('hidden');
    btn.textContent = 'Continue';
    btn.onclick = () => maybeSabbaticalThen(onContinue);
    showScreen('screen-outcome');
    updateStatBars();
    if (opts.effects && Object.keys(opts.effects).some(k => opts.effects[k] !== 0)) {
      setTimeout(() => animateFlyingPoints(opts.effects), 80);
    }
  }

  function maybeSabbaticalThen(nextStep) {
    if (!state.stats || state.stats.mentalHealth >= SABBATICAL_MENTAL_HEALTH_THRESHOLD) {
      nextStep();
      return;
    }
    startSabbatical(nextStep);
  }

  function runResume(token) {
    const actions = {
      goToFreeTime_1: () => goToFreeTime(1),
      goToFreeTime_2: () => goToFreeTime(2),
      goToConference_1: () => goToConference(1),
      goToConference_2: () => goToConference(2),
      goToEmails_1: () => goToEmails(1),
      goToEmails_2: () => goToEmails(2),
      runBureaucracy: () => runBureaucracyGame(() => goToYear2Courses()),
      goToYear2Courses: () => goToYear2Courses(),
      goToThesis: () => goToThesis(),
      showBACrossroads: () => { const th = getMAThreshold(); const passed = state.stats.intelligence >= th.int && state.stats.mentalHealth >= th.mh; showBACrossroads(passed); },
      startMA: () => startMA(),
      goToMAYear2Courses: () => goToMAYear2Courses(),
      goToMAThesis: () => goToMAThesis(),
      showMACrossroads: () => showMACrossroads(),
      goToPhDRound: () => goToPhDRound(),
      phd_submit: () => goToSubmitThesis(),
      phd_defend: () => goToDefend(),
      after_phd: () => showAfterPhDChoice(),
      postdoc_application: () => startPostDocApplication(),
      phd_thrown_out: () => triggerHeaven('phd_thrown_out'),
      phd_done: () => triggerHeaven(),
      heavenAfterReject: () => showMARejectedChoice(),
      ma_sit_out_done: () => showMAApplyAgainChoice(),
      emailNext: () => {
        const g = state.emailGame;
        if (!g) return;
        const nextStep = () => runResume(g.nextToken);
        showEmailRound(g.emails, g.index, nextStep, g.nextToken, g.outcomeMsg, g.emailResumeStep);
      },
    };
    if (actions[token]) actions[token]();
  }

  function resumeGame(step) {
    if (step === 'outcome' && state.outcomeText && state.resumeToken) {
      document.getElementById('outcome-text').textContent = state.outcomeText;
      document.getElementById('outcome-transparency').textContent = '';
      document.getElementById('outcome-transparency').classList.add('hidden');
      document.getElementById('outcome-continue').classList.remove('hidden');
      document.getElementById('outcome-continue').textContent = 'Continue';
      document.getElementById('outcome-continue').onclick = () => maybeSabbaticalThen(() => runResume(state.resumeToken));
      showScreen('screen-outcome');
      updateStatBars();
      return;
    }
    const steps = {
      year1_courses_1: () => runBAYear1CourseSelection(),
      year1_courses_2: () => { state.ba.year1Courses = []; runBAYear1CourseSelection(); },
      year1_freetime: () => goToFreeTime(1),
      year1_conference: () => goToConference(1),
      year1_emails: () => goToEmails(1),
      year1_bureaucracy: () => runBureaucracyGame(() => goToYear2Courses()),
      year2_courses_1: () => goToYear2Courses(),
      year2_courses_2: () => { state.ba.year2Courses = []; goToYear2Courses(); },
      year2_freetime: () => goToFreeTime(2),
      year2_conference: () => goToConference(2),
      year2_emails: () => goToEmails(2),
      year2_thesis: () => goToThesis(),
      crossroads: () => { const th = getMAThreshold(); showBACrossroads(state.stats.intelligence >= th.int && state.stats.mentalHealth >= th.mh); },
      ma_rejected_choice: () => showMARejectedChoice(),
      ma_sit_out: () => showMASitOutYear(),
      ma_uni_choice: () => { if (!state.universityMA) { const other = FAKE_UNIVERSITIES.filter(u => u !== state.universityBA); state.universityMA = other[Math.floor(Math.random() * other.length)] || FAKE_UNIVERSITIES[1]; } startMA(); },
      ma_year1_courses_1: () => startMA(),
      ma_year1_courses_2: () => { state.ma.year1Courses = []; startMA(); },
      ma_year1_freetime: () => goToFreeTime(1),
      ma_year1_conference: () => goToConference(1),
      ma_year1_emails: () => goToEmails(1),
      ma_year2_courses_1: () => goToMAYear2Courses(),
      ma_year2_courses_2: () => { state.ma.year2Courses = []; goToMAYear2Courses(); },
      ma_year2_freetime: () => goToFreeTime(2),
      ma_year2_conference: () => goToConference(2),
      ma_year2_emails: () => goToEmails(2),
      ma_thesis: () => goToMAThesis(),
      ma_crossroads: () => showMACrossroads(),
      phd_application: () => startPhDApplication(),
      phd_round: () => goToPhDRound(),
      phd_conference: () => goToPhDConference(),
      phd_submit: () => goToSubmitThesis(),
      phd_defend: () => goToDefend(),
      after_phd: () => showAfterPhDChoice(),
      postdoc_application: () => startPostDocApplication(),
    };
    if (steps[step]) steps[step]();
  }

  function saveGame() {
    const payload = { version: SAVE_VERSION, state: state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'publish-or-perish-save.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function loadGameFromData(data) {
    if (!data || data.version !== SAVE_VERSION || !data.state) return false;
    const s = data.state;
    if (!s.stats || !s.character || !s.resumeStep) return false;
    if (!s.phase) s.phase = 'ba';
    if (!s.ma) s.ma = { year1Courses: [], year2Courses: [], thesisTopic: null };
    if (!s.phd) s.phd = { round: 1, papers: [], nextPaperId: 1, papersAccepted: 0 };
    if (s.phd && s.phd.papersAccepted === undefined) s.phd.papersAccepted = 0;
    if (!s.conferences) s.conferences = [];
    if (!s.universityBA) s.universityBA = null;
    if (!s.universityMA) s.universityMA = null;
    state = s;
    STAT_NAMES.forEach(stat => { if (state.stats[stat] === undefined) state.stats[stat] = 0; });
    updateStatBars();
    document.getElementById('pause-overlay').classList.add('hidden');
    if (state.resumeStep === 'outcome') resumeGame('outcome');
    else resumeGame(state.resumeStep);
    return true;
  }

  function startSabbatical(nextStep) {
    setStageTitle('Sabbatical');
    document.getElementById('sabbatical-intro-text').textContent =
      'Your mental health has dropped. The department suggests a sabbatical. (They mean well.)';
    document.getElementById('sabbatical-intro').classList.remove('hidden');
    document.getElementById('sabbatical-game').classList.add('hidden');
    document.getElementById('sabbatical-done').classList.add('hidden');
    state.currentScene = 'sabbatical';
    showGameStage('sabbatical');
    showScreen('screen-sabbatical');

    document.getElementById('sabbatical-start-btn').onclick = () => {
      document.getElementById('sabbatical-intro').classList.add('hidden');
      document.getElementById('sabbatical-game').classList.remove('hidden');
      runIslandHoppingGame(nextStep);
    };
  }

function runIslandHoppingGame(nextStep) {
    const canvas = document.getElementById('sabbatical-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const groundY = H * SABBATICAL_GROUND_Y_RATIO;
    const platformH = 22;
    const charW = 20;
    const charH = 28;
    const coinR = 10;
    const itemH = 20;

    const segments = [];
    let x = 0;
    for (let i = 0; i < SABBATICAL_SEGMENT_COUNT - 1; i++) {
      if (i % 2 === 0) {
        const isLong = Math.random() < 0.35;
        const width = isLong
          ? SABBATICAL_PLATFORM_LONG_MIN + Math.random() * (SABBATICAL_PLATFORM_LONG_MAX - SABBATICAL_PLATFORM_LONG_MIN)
          : SABBATICAL_PLATFORM_SHORT_MIN + Math.random() * (SABBATICAL_PLATFORM_SHORT_MAX - SABBATICAL_PLATFORM_SHORT_MIN);
        const seg = { type: 'platform', xStart: x, width, xEnd: x + width, hasCoin: false, hasDrink: false, coinCollected: false, drinkHit: false };
        if (isLong) {
          if (Math.random() < 0.6) seg.hasCoin = true; else seg.hasDrink = true;
        }
        segments.push(seg);
        x += width;
      } else {
        const width = SABBATICAL_GAP_WIDTH_MIN + Math.random() * (SABBATICAL_GAP_WIDTH_MAX - SABBATICAL_GAP_WIDTH_MIN);
        segments.push({ type: 'gap', xStart: x, width, xEnd: x + width });
        x += width;
      }
    }
    segments.push({ type: 'platform', xStart: x, width: 120, xEnd: x + 120 });
    const worldWidth = x + 120;

    let worldX = -SABBATICAL_CHAR_SCREEN_X + segments[0].width / 2;
    let char = { y: groundY - platformH - charH, vy: 0 };
    let coinsCollected = 0;
    let drinkHits = 0;
    let splashes = 0;
    let gameOver = false;
    let animId = null;

    const gameDiv = document.getElementById('sabbatical-game');
    const doneDiv = document.getElementById('sabbatical-done');
    const doneTextEl = document.getElementById('sabbatical-done-text');
    const coinsEl = document.getElementById('sabbatical-coins');
    const mhEl = document.getElementById('sabbatical-mh');
    const jumpBtn = document.getElementById('sabbatical-jump-btn');

    function getCharWorldX() { return worldX + SABBATICAL_CHAR_SCREEN_X; }
    function getSegmentAt(wx) {
      for (let i = 0; i < segments.length; i++) {
        if (wx >= segments[i].xStart && wx < segments[i].xEnd) return { seg: segments[i], i };
      }
      return null;
    }

    function updateHUD() {
      coinsEl.textContent = 'Coins: ' + coinsCollected;
      mhEl.textContent = 'Splashes: ' + splashes + ' / ' + SABBATICAL_SPLASHES_MAX + '  |  MH lost: ' + (drinkHits * (-SABBATICAL_DRINK_MH_PENALTY));
    }

    function finishSabbatical() {
      gameOver = true;
      cleanup();
      if (animId) cancelAnimationFrame(animId);
      animId = null;
      gameDiv.classList.add('hidden');
      doneDiv.classList.remove('hidden');
      const moneyGain = coinsCollected * SABBATICAL_COIN_VALUE;
      doneTextEl.textContent = "You're back. Still academic. But rested. Coins: +" + (coinsCollected * SABBATICAL_COIN_VALUE) + " money. Mental health restored.";
      playCharacterAnim('happy', 600);
      const mhRecovery = SABBATICAL_RECOVERY + drinkHits * SABBATICAL_DRINK_MH_PENALTY;
      document.getElementById('sabbatical-continue-btn').onclick = () => {
        applyEffects({ intelligence: 0, network: 0, mentalHealth: mhRecovery, luck: 0, money: moneyGain });
        updateStatBars();
        nextStep();
      };
    }

    function cleanup() {
      document.removeEventListener('keydown', keyHandler);
    }

    function doJump() {
      if (gameOver) return;
      const wx = getCharWorldX();
      const cur = getSegmentAt(wx);
      const onGround = char.vy >= 0 && char.y >= groundY - platformH - charH - 2;
      if (!onGround) return;

      const next = cur ? getSegmentAt(wx + 55) : null;
      const gapAhead = next && next.seg.type === 'gap';
      const inSecondHalf = cur && cur.seg.type === 'platform' && (wx - cur.seg.xStart) > cur.seg.width * 0.45;

      if (gapAhead && inSecondHalf) {
        char.vy = SABBATICAL_JUMP_GAP_VY;
      } else if (cur && cur.seg.type === 'platform' && cur.seg.hasCoin && !cur.seg.coinCollected) {
        char.vy = SABBATICAL_JUMP_HOP_VY;
      } else if (cur && cur.seg.type === 'platform' && cur.seg.hasDrink) {
        return;
      } else if (cur && cur.seg.type === 'platform') {
        char.vy = SABBATICAL_JUMP_HOP_VY;
      }
    }

    function keyHandler(e) {
      if (e.code === 'Space') { e.preventDefault(); doJump(); }
    }
    document.addEventListener('keydown', keyHandler);
    jumpBtn.onclick = doJump;

    function tick() {
      if (gameOver) return;

      worldX += SABBATICAL_SCROLL_SPEED;
      char.vy += SABBATICAL_GRAVITY;
      char.y += char.vy;

      const wx = getCharWorldX();
      const cur = getSegmentAt(wx);
      const platformTop = groundY - platformH;

      if (cur && cur.seg.type === 'platform') {
        if (char.vy >= 0 && char.y + charH >= platformTop - 2 && char.y + charH <= platformTop + platformH + 6) {
          char.y = platformTop - charH;
          char.vy = 0;
        }
        if (char.vy < 0 && cur.seg.hasCoin && !cur.seg.coinCollected) {
          const coinY = platformTop - itemH - coinR - 4;
          if (char.y + charH / 2 < coinY + coinR && char.y > coinY - coinR - charH) {
            cur.seg.coinCollected = true;
            coinsCollected++;
            updateHUD();
          }
        }
        if (char.vy < 0 && cur.seg.hasDrink && !cur.seg.drinkHit) {
          const drinkY = platformTop - itemH - 4;
          if (char.y + charH / 2 < drinkY + itemH && char.y > drinkY - charH) {
            cur.seg.drinkHit = true;
            drinkHits++;
            updateHUD();
          }
        }
      }

      if (cur && cur.seg.type === 'gap' && char.y + charH >= groundY - 4) {
        splashes++;
        updateHUD();
        if (splashes >= SABBATICAL_SPLASHES_MAX) {
          finishSabbatical();
          return;
        }
        for (let i = cur.i + 1; i < segments.length; i++) {
          if (segments[i].type === 'platform') {
            worldX = segments[i].xStart - SABBATICAL_CHAR_SCREEN_X + 20;
            char.y = platformTop - charH;
            char.vy = 0;
            break;
          }
        }
      }

      if (char.y > H + 30) {
        for (let i = 0; i < segments.length; i++) {
          if (segments[i].type === 'platform' && segments[i].xEnd > wx) {
            worldX = segments[i].xStart - SABBATICAL_CHAR_SCREEN_X + 15;
            char.y = platformTop - charH;
            char.vy = 0;
            splashes++;
            updateHUD();
            if (splashes >= SABBATICAL_SPLASHES_MAX) finishSabbatical();
            break;
          }
        }
      }

      if (worldX >= worldWidth - W) {
        finishSabbatical();
        return;
      }

      draw();
      if (!gameOver) animId = requestAnimationFrame(tick);
    }

    function draw() {
      ctx.fillStyle = '#1a3a5c';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#0e2a44';
      ctx.fillRect(0, groundY, W, H - groundY);

      const camLeft = worldX;
      const camRight = worldX + W;

      segments.forEach(seg => {
        const screenLeft = seg.xStart - camLeft;
        const screenRight = seg.xEnd - camLeft;
        if (screenRight < 0 || screenLeft > W) return;
        const drawLeft = Math.max(0, screenLeft);
        const drawRight = Math.min(W, screenRight);
        const drawW = drawRight - drawLeft;
        if (seg.type === 'gap') {
          ctx.fillStyle = '#2567a8';
          ctx.fillRect(drawLeft, groundY, drawW, H - groundY);
          ctx.strokeStyle = '#1a4d7a';
          ctx.lineWidth = 2;
          ctx.strokeRect(drawLeft, groundY, drawW, H - groundY);
        } else {
          ctx.fillStyle = '#2d5a3d';
          ctx.fillRect(drawLeft, groundY - platformH, drawW, platformH);
          ctx.strokeStyle = '#4a7c59';
          ctx.lineWidth = 2;
          ctx.strokeRect(drawLeft, groundY - platformH, drawW, platformH);
          if (seg.hasCoin && !seg.coinCollected) {
            const cx = seg.xStart + seg.width / 2 - camLeft;
            if (cx >= -20 && cx <= W + 20) {
              ctx.fillStyle = '#e8c547';
              ctx.beginPath();
              ctx.arc(cx, groundY - platformH - coinR - 4, coinR, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#b8962e';
              ctx.stroke();
            }
          }
          if (seg.hasDrink && !seg.drinkHit) {
            const dx = seg.xStart + seg.width / 2 - camLeft;
            if (dx >= -15 && dx <= W + 15) {
              ctx.fillStyle = 'rgba(139, 69, 19, 0.95)';
              ctx.fillRect(dx - 9, groundY - platformH - itemH - 4, 18, itemH);
              ctx.strokeStyle = '#5a3510';
              ctx.strokeRect(dx - 9, groundY - platformH - itemH - 4, 18, itemH);
            }
          }
        }
      });

      ctx.fillStyle = '#7aa2f7';
      ctx.fillRect(Math.round(SABBATICAL_CHAR_SCREEN_X - 2), Math.round(char.y), charW + 4, charH);
      ctx.strokeStyle = '#5a82c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(SABBATICAL_CHAR_SCREEN_X - 2), Math.round(char.y), charW + 4, charH);
    }

    document.getElementById('sabbatical-coin-btn').style.display = 'none';
    const sabbaticalStartWrap = document.getElementById('sabbatical-start-wrap');
    if (sabbaticalStartWrap) sabbaticalStartWrap.style.display = 'block';
    document.getElementById('sabbatical-start-game-btn').onclick = function () {
      if (sabbaticalStartWrap) sabbaticalStartWrap.style.display = 'none';
      tick();
    };
    updateHUD();
  }

    function runBikeCourierGame(onDone) {
    const canvas = document.getElementById('bike-courier-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const groundY = H * BIKE_COURIER_GROUND_Y_RATIO;
    const bikeW = 24;
    const bikeH = 28;
    const bikeX = 70;

    document.getElementById('bike-courier-intro').classList.remove('hidden');
    document.getElementById('bike-courier-game').classList.add('hidden');
    document.getElementById('bike-courier-done').classList.add('hidden');
    showScreen('screen-bike-courier');

    document.getElementById('bike-courier-start-btn').onclick = () => {
      document.getElementById('bike-courier-intro').classList.add('hidden');
      document.getElementById('bike-courier-game').classList.remove('hidden');
      startBikeGame();
    };

    function startBikeGame() {
      let bikeY = groundY - bikeH;
      let bikeVy = 0;
      const obstacles = [];
      let deliveries = 0;
      let crashes = 0;
      let frameCount = 0;
      let nextSpawn = BIKE_COURIER_SPAWN_INTERVAL_MIN + Math.random() * (BIKE_COURIER_SPAWN_INTERVAL_MAX - BIKE_COURIER_SPAWN_INTERVAL_MIN);
      let gameOver = false;
      let animId = null;

      const gameDiv = document.getElementById('bike-courier-game');
      const doneDiv = document.getElementById('bike-courier-done');
      const earnedEl = document.getElementById('bike-courier-earned');
      const crashesEl = document.getElementById('bike-courier-crashes');
      const doneTextEl = document.getElementById('bike-courier-done-text');
      const jumpBtn = document.getElementById('bike-courier-jump-btn');

      function updateHUD() {
        earnedEl.textContent = 'Earned: €' + (deliveries * BIKE_COURIER_EUROS_PER_DELIVERY);
        crashesEl.textContent = 'Crashes: ' + crashes + ' / ' + BIKE_COURIER_MAX_CRASHES;
      }

      function endShift() {
        gameOver = true;
        if (animId) cancelAnimationFrame(animId);
        document.removeEventListener('keydown', keyHandler);
        gameDiv.classList.add('hidden');
        doneDiv.classList.remove('hidden');
        const earned = deliveries * BIKE_COURIER_EUROS_PER_DELIVERY;
        doneTextEl.textContent = 'Shift over. You earned €' + earned + ' and feel a bit better from the exercise (+' + BIKE_COURIER_MH_BONUS + ' mental health). Back to the application pile.';
        applyEffects({ money: earned, mentalHealth: BIKE_COURIER_MH_BONUS });
        updateStatBars();
        document.getElementById('bike-courier-continue-btn').onclick = () => onDone();
      }

      function keyHandler(e) {
        if (e.code === 'Space') {
          e.preventDefault();
          if (gameOver) return;
          if (bikeY >= groundY - bikeH - 2) {
            bikeVy = BIKE_COURIER_JUMP_VY;
          }
        }
      }
      document.addEventListener('keydown', keyHandler);
      jumpBtn.onclick = () => {
        if (!gameOver && bikeY >= groundY - bikeH - 2) bikeVy = BIKE_COURIER_JUMP_VY;
      };

      function tick() {
        if (gameOver) return;

        frameCount++;
        bikeVy += BIKE_COURIER_GRAVITY;
        bikeY += bikeVy;
        if (bikeY >= groundY - bikeH) {
          bikeY = groundY - bikeH;
          bikeVy = 0;
        }

        if (frameCount >= nextSpawn) {
          const obsH = 18 + Math.random() * 22;
          obstacles.push({
            x: W,
            w: 28 + Math.random() * 24,
            h: obsH,
            y: groundY - obsH,
          });
          nextSpawn = frameCount + BIKE_COURIER_SPAWN_INTERVAL_MIN + Math.random() * (BIKE_COURIER_SPAWN_INTERVAL_MAX - BIKE_COURIER_SPAWN_INTERVAL_MIN);
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i];
          o.x -= BIKE_COURIER_OBSTACLE_SPEED;
          if (o.x + o.w < bikeX) {
            deliveries++;
            obstacles.splice(i, 1);
            continue;
          }
          const onGround = bikeY >= groundY - bikeH - 2;
          const overlapX = bikeX < o.x + o.w && bikeX + bikeW > o.x;
          const overlapY = bikeY + bikeH > o.y && bikeY < o.y + o.h;
          if (onGround && overlapX && overlapY) {
            crashes++;
            obstacles.splice(i, 1);
            if (crashes >= BIKE_COURIER_MAX_CRASHES) {
              endShift();
              return;
            }
          }
        }

        ctx.fillStyle = '#87a0b0';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#5a6a75';
        ctx.fillRect(0, groundY, W, H - groundY);

        obstacles.forEach(o => {
          ctx.fillStyle = '#3d4a52';
          ctx.fillRect(o.x, o.y, o.w, o.h);
          ctx.strokeStyle = '#2a3338';
          ctx.lineWidth = 2;
          ctx.strokeRect(o.x, o.y, o.w, o.h);
        });

        ctx.fillStyle = '#2d4a1f';
        ctx.fillRect(bikeX, bikeY, bikeW, bikeH);
        ctx.strokeStyle = '#4a7c35';
        ctx.lineWidth = 2;
        ctx.strokeRect(bikeX, bikeY, bikeW, bikeH);

        updateHUD();
        animId = requestAnimationFrame(tick);
      }

      const bikeStartWrap = document.getElementById('bike-courier-start-wrap');
      if (bikeStartWrap) bikeStartWrap.style.display = 'block';
      document.getElementById('bike-courier-start-game-btn').onclick = function () {
        if (bikeStartWrap) bikeStartWrap.style.display = 'none';
        tick();
      };
      updateHUD();
    }
  }

  function triggerHeaven(reason) {
    showScreen('screen-heaven');
    let heavenText = 'Corporate job. Work–life balance. A salary. You’re pretty sure this is what people mean by “making it”.';
    if (reason === 'phd_thrown_out') {
      heavenText = "You didn't get two papers in time. The department suggested you leave. You got a job in industry anyway. It's fine. Really.";
    } else if (reason === 'postdoc') {
      heavenText = "You got a post-doc! More papers, more reviews, more grant applications. The saga continues. (Or you could have left. You didn't.)";
    }
    if (state.hasKids && reason !== 'phd_thrown_out') {
      heavenText += ' Your kids will grow up with a parent who has evenings. Nice.';
    }
    document.getElementById('heaven-text').textContent = heavenText;
    runConfetti();
    document.getElementById('heaven-restart').onclick = () => restart();
  }

  function runConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    const colors = ['#7aa2f7', '#9ece6a', '#e0af68', '#f7768e', '#bb9af7', '#7dcfff'];
    const count = 80;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = '-10px';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(el);

      const duration = 2000 + Math.random() * 2000;
      const delay = Math.random() * 500;
      const endTop = 100 + Math.random() * 20;
      const drift = (Math.random() - 0.5) * 100;

      el.animate(
        [
          { transform: `translateY(0) translateX(0) rotate(0deg)`, opacity: 1 },
          {
            transform: `translateY(${endTop}vh) translateX(${drift}px) rotate(${720 + Math.random() * 360}deg)`,
            opacity: 0.6,
          },
        ],
        { duration, delay, fill: 'forwards' }
      );
    }

    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  }

  function restart() {
    state = {
      difficulty: null,
      character: null,
      stats: null,
      step: 'character',
      phase: 'ba',
      playerName: '',
      currentScene: 'campus',
      hasKids: false,
      socializingCount: 0,
      ba: { year1Courses: [], year2Courses: [], thesisTopic: null },
      ma: { year1Courses: [], year2Courses: [], thesisTopic: null },
      phd: { round: 1, papers: [], nextPaperId: 1, papersAccepted: 0 },
      conferences: [],
      resumeStep: null,
      outcomeText: null,
      resumeToken: null,
      cvName: null,
      cvUniversity: null,
      universityBA: null,
      universityMA: null,
    };
    document.getElementById('outcome-continue').classList.remove('hidden');
    document.getElementById('outcome-continue').textContent = 'Continue';
    document.getElementById('pause-overlay').classList.add('hidden');
    renderDifficultySelect();
  }

  function handleLoadGameFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!loadGameFromData(data)) {
          alert('Invalid or outdated save file.');
          return;
        }
        document.getElementById('pause-overlay').classList.add('hidden');
      } catch (err) {
        alert('Invalid save file.');
      }
    };
    reader.readAsText(file);
  }

  // ----- Init -----
  document.getElementById('outcome-continue').addEventListener('click', () => {});

  document.getElementById('pause-btn').addEventListener('click', () => {
    document.getElementById('pause-overlay').classList.remove('hidden');
  });
  document.getElementById('pause-resume-btn').addEventListener('click', () => {
    document.getElementById('pause-overlay').classList.add('hidden');
  });
  document.getElementById('cv-btn').addEventListener('click', () => showCV());
  document.getElementById('cv-btn-pause').addEventListener('click', () => {
    document.getElementById('pause-overlay').classList.add('hidden');
    showCV();
  });
  document.getElementById('cv-close-btn').addEventListener('click', () => hideCV());
  document.getElementById('cv-export-pdf-btn').addEventListener('click', () => exportCVAsPDF());
  document.getElementById('pause-save-btn').addEventListener('click', () => {
    saveGame();
  });
  document.getElementById('load-file-input').addEventListener('change', (e) => {
    const input = e.target;
    handleLoadGameFile(input.files[0]);
    input.value = '';
  });
  document.getElementById('load-game-start-btn').addEventListener('click', () => {
    document.getElementById('load-file-input').click();
  });
  document.getElementById('play-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('player-name-input');
    const name = (nameInput && nameInput.value ? nameInput.value.trim() : '') || '';
    if (!name) return;
    state.playerName = name;
    document.getElementById('start-block').classList.add('hidden');
    document.getElementById('difficulty-block').classList.remove('hidden');
  });
  document.getElementById('player-name-input').addEventListener('input', () => {
    updatePlayButtonState();
  });
  document.getElementById('player-name-input').addEventListener('keyup', () => {
    updatePlayButtonState();
  });
  document.getElementById('pause-quit-btn').addEventListener('click', () => {
    restart();
  });

  renderDifficultySelect();
})();
