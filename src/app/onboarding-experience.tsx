"use client";

import { useMemo, useState } from "react";

type ExperienceLevel = "private" | "public" | "beginner";
type FlowStep = "preparation" | "assessment" | "account";

type CourseCard = {
  title: string;
  body: string;
  bullets: string[];
};

type SiteRule = {
  title: string;
  description: string;
  items: string[];
};

type GlossaryTerm = {
  term: string;
  definition: string;
};

type ReadingTopic = {
  id: string;
  label: string;
  detail: string;
};

type ChoiceOption = {
  label: string;
  value: string;
};

type AnswerValue = string | string[];

type EvaluationQuestion = {
  id: string;
  category: string;
  prompt: string;
  type: "choice" | "number";
  selectionMode?: "single" | "multiple";
  helper?: string;
  placeholder?: string;
  options?: ChoiceOption[];
  acceptedValues: string[];
  correctLabel: string;
  explanation: string;
  resultAlert?: string;
  reviewLabel: string;
};

const courseCards: CourseCard[] = [
  {
    title: "Ce que le tracker voit",
    body: "Le tracker voit surtout les annonces envoyées par le client et les compteurs transmis : uploaded, downloaded, left et l'état du torrent.",
    bullets: [
      "Le suivi d'activité permet d'appliquer les règles du site.",
      "L'URL d'annonce et le passkey restent strictement personnels.",
      "Ces informations servent au ratio, au seed time et au suivi du compte."
    ]
  },
  {
    title: "Ce qui change sur tracker privé",
    body: "Un torrent privé reste dans l'écosystème du site : tracker dédié, passkey personnel et client autorisé.",
    bullets: [
      "Le passkey rattache l'activité au compte.",
      "Il faut configurer son client torrent sans DHT, PEX ni LSD pour les torrents privés.",
      "Un client non autorisé peut fausser ou bloquer les statistiques(Risque de Ban)."
    ]
  },
  {
    title: "Client, port et VPN",
    body: "Pour bien seeder, il faut pouvoir recevoir des connexions entrantes. Un VPN peut aider s'il propose du port forwarding, à condition de reporter le bon port dans le client.",
    bullets: [
      "Clients recommandés : qBittorrent, Transmission et rTorrent.",
      "Vérifier le port d'écoute pour que le client soit joignable.",
      "Un port ouvert expose l'application qui écoute derrière ce port."
    ]
  },
  {
    title: "Ratio, seed et H&R",
    body: "Le bon comportement ne se limite pas au téléchargement. Le site attend du seed, du seed time et l'absence de hit and run.",
    bullets: [
      "Laisser le client actif une fois le download terminé.",
      "Éviter d'enchaîner trop de téléchargements à la fois.",
      "Profiter du freeleech sans couper le seed trop vite."
    ]
  }
];

const siteRules: SiteRule[] = [
  {
    title: "Whitelist client",
    description: "Le site n'accepte que des clients supportés pour limiter les statistiques incohérentes et les abus.",
    items: [
      "Clients recommandés : qBittorrent, Transmission et rTorrent.",
      "Garder une version stable et non modifiée.",
      "Tout outil de triche au ratio est interdit et entraînera le bannissement du compte."
    ]
  },
  {
    title: "Passkey et torrents privés",
    description: "Le passkey est personnel. Il relie l'activité du tracker au compte et ne doit jamais sortir du client.",
    items: [
      "Ne jamais partager son fichier .torrent ou son URL d'annonce.",
      "Rester sur les pairs fournis par le tracker privé.",
      "Configurer le client torrent avec DHT, PEX et LSD désactivés pour ces torrents."
    ]
  },
  {
    title: "Tokens du site",
    description: "Les tokens servent à récompenser le seed long terme et certaines contributions utiles à la communauté.",
    items: [
      "Upload approuvé : +22 tokens",
      "Signalement validé : +3 tokens",
      "Requête remplie : +15 tokens minimum + bounty"
    ]
  },
  {
    title: "Comportement attendu",
    description: "Le site surveille le ratio, le seed time et les comportements de type hit and run.",
    items: [
      "Ratio minimum autorisé : 0,85. En dessous, les téléchargements sont bloqués.",
      "Éviter de prendre un torrent qu'on ne pourra pas seeder.",
      "Garder le client actif une fois le download terminé.",
      "Le freeleech aide le ratio, mais n'annule pas les règles de seed."
    ]
  }
];

const glossary: GlossaryTerm[] = [
  {
    term: "P2P",
    definition: "Échange direct entre utilisateurs plutôt qu'un envoi centralisé unique."
  },
  {
    term: "Tracker",
    definition: "Service qui met les pairs en relation et reçoit les statistiques annoncées par le client."
  },
  {
    term: "Passkey",
    definition: "Identifiant personnel inclus dans l'URL du tracker. Il ne se partage jamais."
  },
  {
    term: "H&R",
    definition: "Hit and run : arrêter trop tôt après le téléchargement, sans seed suffisant."
  },
  {
    term: "Freeleech",
    definition: "Le download ne compte pas dans le ratio, l'upload compte toujours."
  },
  {
    term: "DHT / PEX / LSD",
    definition: "Mécanismes de découverte de pairs à éviter sur les torrents privés."
  }
];

const readingTopics: ReadingTopic[] = [
  {
    id: "private-tracker",
    label: "Tracker privé",
    detail: "Comprendre le cadre fermé du site, le tracker dédié et les règles associées."
  },
  {
    id: "seed-time",
    label: "Seed et seed time",
    detail: "Retenir qu'il faut laisser tourner le client une fois le download terminé et éviter le H&R."
  },
  {
    id: "freeleech",
    label: "Freeleech",
    detail: "Savoir que le download ne compte pas dans le ratio, mais que le seed reste attendu."
  },
  {
    id: "passkey",
    label: "Passkey",
    detail: "Ne jamais partager l'identifiant personnel lié au compte et à l'activité tracker."
  },
  {
    id: "listening-port",
    label: "Port d'écoute",
    detail: "Vérifier que le client est joignable, surtout avec du port forwarding ou un VPN."
  },
  {
    id: "site-tokens",
    label: "Tokens du site",
    detail: "Identifier les usages possibles et ce qu'ils ne permettent pas de contourner."
  }
];

const evaluationOrder = [
  "Ratio",
  "Tracker privé",
  "VPN & port",
  "Tokens",
  "Glossaire"
] as const;

const evaluationQuestions: EvaluationQuestion[] = [
  {
    id: "ratio-a",
    category: "Ratio",
    prompt:
      "Sur mon compte, j'ai 12 Go d'upload et 30 Go de download. Quel est mon ratio actuel ?",
    type: "number",
    placeholder: "0.00",
    acceptedValues: ["0.4", "0.40"],
    correctLabel: "0,40",
    explanation: "Le ratio se calcule avec upload / download. Ici, 12 / 30 = 0,40.",
    reviewLabel: "Points clés avant les exercices"
  },
  {
    id: "ratio-b",
    category: "Ratio",
    prompt:
      "Sur mon compte, j'ai 50 Go d'upload et 80 Go de download. Quel upload supplémentaire me faut-il au minimum pour atteindre un ratio de 1 ?",
    type: "number",
    placeholder: "Nombre entier",
    acceptedValues: ["30"],
    correctLabel: "30 Go",
    explanation:
      "Pour atteindre un ratio de 1 avec 80 Go téléchargés, il faut 80 Go uploadés. Il manque donc 30 Go.",
    reviewLabel: "Points clés avant les exercices"
  },
  {
    id: "ratio-c",
    category: "Ratio",
    prompt:
      "Sur mon compte, j'ai 90 Go d'upload et 100 Go de download. Je télécharge 20 Go de plus, sans freeleech actif. Quel est désormais mon ratio ?",
    type: "number",
    placeholder: "0.00",
    acceptedValues: ["0.75", "0.750"],
    correctLabel: "0,75",
    explanation: "Le nouveau total est de 90 / 120, soit 0,75.",
    resultAlert:
      "Ce ratio est sous le minimum autorisé de 0,85. C'est donc un choix risqué : sans seed suffisant du dernier fichier téléchargé, le compte risque d'être bloqué pour les prochains téléchargements.",
    reviewLabel: "Points clés avant les exercices"
  },
  {
    id: "ratio-d",
    category: "Ratio",
    prompt:
      "Sur mon compte, j'ai 18 Go d'upload et 20 Go de download. Le site est actuellement en freeleech : je télécharge 8 Go et j'upload 6 Go de plus. Quel est désormais mon ratio ?",
    type: "number",
    helper: "Rappel : en freeleech, le download ne compte pas dans le ratio.",
    placeholder: "0.00",
    acceptedValues: ["1.2", "1.20"],
    correctLabel: "1,20",
    explanation:
      "Le download reste à 20 Go parce que le freeleech est actif et ne compte pas dans le ratio, tandis que l'upload monte à 24 Go. Donc 24 / 20 = 1,20.",
    reviewLabel: "Points clés avant les exercices"
  },
  {
    id: "tracker-passkey",
    category: "Tracker privé",
    prompt: "Pourquoi est-ce que je ne dois jamais partager mon passkey ?",
    type: "choice",
    options: [
      {
        label:
          "Parce qu'il permet de rattacher l'activité tracker à mon compte",
        value: "account-link"
      },
      {
        label: "Parce qu'il sert seulement à renommer mes torrents",
        value: "rename"
      },
      {
        label: "Parce qu'il accélère automatiquement mes téléchargements",
        value: "speed"
      }
    ],
    acceptedValues: ["account-link"],
    correctLabel: "Il relie l'activité tracker à mon compte.",
    explanation:
      "Mon passkey identifie mon compte côté site. En cas de fuite, les stats de mon compte peuvent être polluées ou compromises.",
    reviewLabel: "Règles principales"
  },
  {
    id: "tracker-private",
    category: "Tracker privé",
    prompt: "Quel comportement reste correct sur un torrent privé ?",
    type: "choice",
    options: [
      {
        label: "Laisser DHT, PEX et LSD trouver des pairs hors du tracker",
        value: "bypass"
      },
      {
        label: "Utiliser le tracker du site et les pairs qu'il fournit",
        value: "tracker-only"
      },
      {
        label: "Partager le .torrent à un ami pour seed plus vite",
        value: "share"
      }
    ],
    acceptedValues: ["tracker-only"],
    correctLabel: "Utiliser le tracker du site et ses pairs.",
    explanation:
      "Sur un tracker privé, on reste dans le cadre autorisé par le site et son torrent privé.",
    reviewLabel: "Règles principales"
  },
  {
    id: "vpn-connectable",
    category: "VPN & port",
    prompt: "À quoi sert surtout le port forwarding dans ce contexte ?",
    type: "choice",
    options: [
      {
        label:
          "À recevoir plus facilement des connexions entrantes pour mieux seeder",
        value: "incoming"
      },
      {
        label: "À synchroniser automatiquement le ratio avec le tracker",
        value: "ratio-sync"
      },
      {
        label: "À masquer le passkey dans les torrents",
        value: "hide"
      }
    ],
    acceptedValues: ["incoming"],
    correctLabel: "À être joignable en connexions entrantes.",
    explanation:
      "Être joignable aide les autres pairs à ouvrir une connexion vers ton client, ce qui améliore souvent le seed.",
    reviewLabel: "Points clés avant les exercices"
  },
  {
    id: "vpn-risk",
    category: "VPN & port",
    prompt: "Quel point faut-il vérifier quand le port forwarding passe par un VPN ?",
    type: "choice",
    options: [
      {
        label: "Le port fourni par le VPN doit être bien reporté dans le client torrent",
        value: "vpn-port"
      },
      {
        label: "Le port du client peut rester aléatoire tant que le VPN est actif",
        value: "random-port"
      },
      {
        label: "Le port du VPN n'a pas besoin d'être le même que celui configuré dans le client",
        value: "port-mismatch"
      }
    ],
    acceptedValues: ["vpn-port"],
    correctLabel: "Le port fourni par le VPN doit être correctement reporté dans le client.",
    explanation:
      "Avec du port forwarding via VPN, le point critique est d'utiliser dans le client le port attribué par le VPN. Sinon, le client ne sera pas correctement joignable.",
    reviewLabel: "Points clés avant les exercices"
  },
  {
    id: "tokens-a",
    category: "Tokens",
    prompt:
      "Deux torrents approuvés (+22 chacun) et trois signalements validés (+3 chacun). Combien de tokens gagnes-tu ?",
    type: "number",
    placeholder: "Nombre entier",
    acceptedValues: ["53"],
    correctLabel: "53 tokens",
    explanation: "2 x 22 = 44, puis 3 x 3 = 9. Total : 53.",
    reviewLabel: "Règles principales"
  },
  {
    id: "tokens-b",
    category: "Tokens",
    prompt:
      "Dans la boutique du site, 10 tokens donnent +5 Go d'upload. Situation de départ : 20 Go uploadés / 40 Go téléchargés. Mon ratio est donc trop bas pour continuer à télécharger (0,50). Combien d'achats minimum faut-il pour atteindre 0,85 ?",
    type: "number",
    placeholder: "Nombre entier",
    acceptedValues: ["3"],
    correctLabel: "3 achats",
    explanation:
      "La cible est 34 Go uploadés. Il faut donc ajouter 14 Go. Trois achats donnent 15 Go, c'est le minimum suffisant.",
    reviewLabel: "Règles principales"
  },
  {
    id: "tokens-c",
    category: "Tokens",
    prompt:
      "J'ai 435 tokens sur mon compte. Comment puis-je les dépenser ?",
    type: "choice",
    selectionMode: "multiple",
    helper: "Plusieurs réponses sont valides.",
    options: [
      {
        label: "Acheter de l'upload pour mon compte",
        value: "upload-credit"
      },
      {
        label: "Participer au pool global de freeleech",
        value: "freeleech-pool"
      },
      {
        label: "Mettre une prime sur une requête pour un fichier que je cherche",
        value: "request-bounty"
      },
      {
        label: "Remettre mon ratio à zéro",
        value: "ratio-reset"
      }
    ],
    acceptedValues: ["upload-credit", "freeleech-pool", "request-bounty"],
    correctLabel:
      "Acheter de l'upload pour mon compte, participer au pool global de freeleech ou mettre une prime sur une requête",
    explanation:
      "Les tokens peuvent servir à acheter de l'upload dans la boutique du site, à participer au pool global de freeleech ou à mettre une prime sur une requête. Ils ne permettent ni de contourner la whitelist, ni d'effacer le ratio.",
    reviewLabel: "Règles principales"
  },
  {
    id: "glossary-hr",
    category: "Glossaire",
    prompt: "Que signifie H&R sur un tracker privé ?",
    type: "choice",
    options: [
      {
        label: "Un arrêt trop rapide sans seed suffisant après téléchargement",
        value: "hit-run"
      },
      {
        label: "Un mode turbo de téléchargement réservé aux seedboxes",
        value: "turbo"
      },
      {
        label: "Une méthode pour cacher le client torrent",
        value: "cloak"
      }
    ],
    acceptedValues: ["hit-run"],
    correctLabel: "Arrêter trop tôt sans seed suffisant.",
    explanation:
      "Le hit and run décrit un comportement pénalisé car il dégrade la disponibilité du torrent pour les autres.",
    reviewLabel: "Termes utiles"
  },
  {
    id: "glossary-freeleech",
    category: "Glossaire",
    prompt: "Pendant une période freeleech, qu'est-ce qui compte dans le ratio ?",
    type: "choice",
    options: [
      {
        label: "L'upload compte, le download ne compte pas",
        value: "upload-only"
      },
      {
        label: "Le download compte double",
        value: "double-download"
      },
      {
        label: "Rien n'est comptabilisé",
        value: "nothing"
      }
    ],
    acceptedValues: ["upload-only"],
    correctLabel: "L'upload compte, pas le download.",
    explanation:
      "Le freeleech aide à protéger le ratio, mais le site attend toujours du seed et un bon comportement.",
    reviewLabel: "Termes utiles"
  }
];

function normalizeTextResponse(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeNumberResponse(value: string) {
  return normalizeTextResponse(value).replace(/,/g, ".").replace(/\s+/g, "");
}

function hasAnswer(response: AnswerValue | undefined) {
  if (Array.isArray(response)) {
    return response.length > 0;
  }

  return Boolean(response?.trim());
}

function isQuestionCorrect(question: EvaluationQuestion, response: AnswerValue) {
  if (!hasAnswer(response)) {
    return false;
  }

  if (question.type === "number") {
    const normalizedResponse = normalizeNumberResponse(
      typeof response === "string" ? response : response.join(" ")
    );
    const actual = Number(normalizedResponse);

    if (Number.isNaN(actual)) {
      return false;
    }

    return question.acceptedValues.some((value) => {
      const expected = Number(normalizeNumberResponse(value));
      const tolerance = Number.isInteger(expected) ? 0.001 : 0.02;

      return Math.abs(actual - expected) <= tolerance;
    });
  }

  const selectedValues = Array.isArray(response) ? response : [response];
  const normalizedSelections = selectedValues.map((value) =>
    normalizeTextResponse(value)
  );

  if (question.selectionMode === "multiple") {
    const expectedSelections = question.acceptedValues.map((value) =>
      normalizeTextResponse(value)
    );

    return (
      normalizedSelections.length === expectedSelections.length &&
      expectedSelections.every((value) => normalizedSelections.includes(value))
    );
  }

  return question.acceptedValues.some(
    (value) => normalizedSelections[0] === normalizeTextResponse(value)
  );
}

function formatAnswer(question: EvaluationQuestion, response: AnswerValue) {
  if (!hasAnswer(response)) {
    return "Aucune réponse";
  }

  if (question.type === "choice") {
    const selectedValues = Array.isArray(response) ? response : [response];
    const labels = selectedValues.map((value) => {
      return question.options?.find((option) => option.value === value)?.label ?? value;
    });

    return labels.join(", ");
  }

  return Array.isArray(response) ? response.join(", ") : response;
}

function getExperienceCopy(experience: ExperienceLevel | "") {
  switch (experience) {
    case "private":
      return "Accès direct aux exercices, avec rappel rapide des règles si besoin.";
    case "public":
      return "Les trackers privés ajoutent des règles liées à la passkey, au seed time, aux clients autorisés et à la lutte contre les abus.";
    case "beginner":
      return "Une lecture guidée permet de revoir les notions essentielles avant les exercices.";
    default:
      return "Sélectionne un profil pour afficher le parcours adapté.";
  }
}

export function OnboardingExperience() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("preparation");
  const [experience, setExperience] = useState<ExperienceLevel | "">("");
  const [validatedReadings, setValidatedReadings] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [trackerAccepted, setTrackerAccepted] = useState(false);
  const [securityAccepted, setSecurityAccepted] = useState(false);
  const [demoCreated, setDemoCreated] = useState(false);

  const isPreparationStep = currentStep === "preparation";
  const isAssessmentStep = currentStep === "assessment";
  const isAccountStep = currentStep === "account";
  const isPrivateExperience = experience === "private";
  const hasChosenExperience = experience !== "";
  const readingConfirmed = validatedReadings.length === readingTopics.length;
  const readingRequired = hasChosenExperience && !isPrivateExperience;
  const readingReady = isPrivateExperience || readingConfirmed;
  const canStartAssessment = hasChosenExperience && readingReady;
  const totalQuestions = evaluationQuestions.length;

  const answeredCount = evaluationQuestions.filter(
    (question) => hasAnswer(answers[question.id])
  ).length;
  const allAnswered = answeredCount === totalQuestions;

  const score = evaluationQuestions.reduce((total, question) => {
    return total + (isQuestionCorrect(question, answers[question.id] ?? "") ? 1 : 0);
  }, 0);

  const minScore = Math.ceil(totalQuestions * 0.8);
  const scorePercent = Math.round((score / totalQuestions) * 100);
  const evaluationPassed = summaryVisible && allAnswered && score >= minScore;

  const isFormReady =
    username.trim().length >= 3 &&
    email.includes("@") &&
    passphrase.length >= 12 &&
    trackerAccepted &&
    securityAccepted;

  const completion = useMemo(() => {
    const checks = [
      hasChosenExperience,
      readingReady,
      currentStep !== "preparation",
      evaluationPassed,
      currentStep === "account",
      isFormReady,
      demoCreated
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [
    currentStep,
    demoCreated,
    evaluationPassed,
    hasChosenExperience,
    isFormReady,
    readingReady
  ]);

  const groupedQuestions = useMemo(() => {
    return evaluationOrder.map((category) => ({
      category,
      questions: evaluationQuestions.filter((question) => question.category === category)
    }));
  }, []);

  const categoryScores = useMemo(() => {
    return evaluationOrder.map((category) => {
      const questions = evaluationQuestions.filter(
        (question) => question.category === category
      );
      const correct = questions.filter((question) =>
        isQuestionCorrect(question, answers[question.id] ?? "")
      ).length;

      return {
        category,
        correct,
        total: questions.length
      };
    });
  }, [answers]);

  const missedQuestions = summaryVisible
    ? evaluationQuestions.filter(
        (question) => !isQuestionCorrect(question, answers[question.id] ?? "")
      )
    : [];

  const alertQuestions = summaryVisible
    ? evaluationQuestions.filter(
        (question) =>
          Boolean(question.resultAlert) &&
          isQuestionCorrect(question, answers[question.id] ?? "")
      )
    : [];

  const remediationTopics = Array.from(
    new Set(missedQuestions.map((question) => question.reviewLabel))
  );

  const nextStep = demoCreated
    ? "Compte créé."
    : isAccountStep
      ? isFormReady
        ? "Création du compte disponible."
        : "Informations du compte à compléter."
      : isAssessmentStep
        ? evaluationPassed
          ? "Accès à la création du compte disponible."
          : summaryVisible
            ? "Résultats affichés."
            : "Questions à terminer."
        : canStartAssessment
          ? "Accès aux exercices disponible."
          : readingRequired
            ? "Lecture des éléments requise."
            : "Choix du profil requis.";

  function handleExperienceChange(level: ExperienceLevel) {
    setExperience(level);
    setValidatedReadings([]);
    setAnswers({});
    setSummaryVisible(false);
    setDemoCreated(false);
  }

  function toggleReadingTopic(topicId: string) {
    if (!hasChosenExperience) {
      return;
    }

    setValidatedReadings((current) =>
      current.includes(topicId)
        ? current.filter((item) => item !== topicId)
        : [...current, topicId]
    );
    setSummaryVisible(false);
  }

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value
    }));
    setSummaryVisible(false);
    setDemoCreated(false);
  }

  function toggleChoiceAnswer(questionId: string, value: string) {
    setAnswers((current) => {
      const currentValue = current[questionId];
      const selectedValues = Array.isArray(currentValue)
        ? currentValue
        : currentValue
          ? [currentValue]
          : [];

      const nextValues = selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value];

      return {
        ...current,
        [questionId]: nextValues
      };
    });
    setSummaryVisible(false);
    setDemoCreated(false);
  }

  function resetAssessment() {
    setCurrentStep("preparation");
    setExperience("");
    setValidatedReadings([]);
    setAnswers({});
    setSummaryVisible(false);
    setUsername("");
    setEmail("");
    setPassphrase("");
    setTrackerAccepted(false);
    setSecurityAccepted(false);
    setDemoCreated(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function requestSummary() {
    if (!allAnswered) {
      return;
    }

    setSummaryVisible(true);
    setDemoCreated(false);
  }

  function startAssessment() {
    if (!canStartAssessment) {
      return;
    }

    setCurrentStep("assessment");
    setSummaryVisible(false);
    setDemoCreated(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function continueToAccount() {
    if (!evaluationPassed) {
      return;
    }

    setCurrentStep("account");
    setSummaryVisible(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const readinessPanel = (
    <section className="panel readiness-panel" aria-labelledby="readiness-title">
      <div className="section-heading">
        <p className="eyebrow">Validation</p>
        <h2 id="readiness-title">Passage aux exercices</h2>
        <p>
          Vérifie les points essentiels avant de commencer. Selon ton profil,
          confirme ensuite la lecture des notions utiles ou passe directement
          aux exercices.
        </p>
      </div>

      <div className="reading-card">
        <div className="status-row">
          <StatusPill ready={hasChosenExperience} text="Profil sélectionné" />
          <StatusPill
            ready={readingReady}
            text={isPrivateExperience ? "Lecture facultative" : "Lecture validée"}
          />
        </div>

        <div className="reading-summary">
          <p className="reading-intro">
            Éléments à avoir lus avant le lancement des exercices :
          </p>
          <div className="reading-progress" aria-live="polite">
            <span>
              {validatedReadings.length}/{readingTopics.length} éléments validés
            </span>
            <small>
              {isPrivateExperience
                ? "Lecture optionnelle pour ce profil. Tu peux passer directement aux exercices."
                : "Clique sur chaque tuile pour confirmer la lecture."}
            </small>
          </div>
          <div className="reading-list">
            {readingTopics.map((topic) => {
              const isValidated = validatedReadings.includes(topic.id);

              return (
                <button
                  aria-pressed={isValidated}
                  className={isValidated ? "reading-tile validated" : "reading-tile"}
                  disabled={!hasChosenExperience}
                  key={topic.id}
                  onClick={() => toggleReadingTopic(topic.id)}
                  type="button"
                >
                  <span className="reading-tile-state">
                    {isValidated ? "Lu" : "À valider"}
                  </span>
                  <strong>{topic.label}</strong>
                  <span>{topic.detail}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="action-row reading-actions">
          <p className="inline-note">
            {isPrivateExperience
              ? "Profil confirmé sélectionné : accès direct aux exercices."
              : "Sélectionne ton profil, valide chaque tuile utile, puis lance les exercices."}
          </p>
          <button
            className="primary-button"
            disabled={!canStartAssessment}
            onClick={startAssessment}
            type="button"
          >
            Passer aux exercices
          </button>
        </div>
      </div>
    </section>
  );

  const siteRulesPanel = (
    <section className="panel site-rules" aria-labelledby="site-rules-title">
      <div className="section-heading">
        <p className="eyebrow">À retenir</p>
        <h2 id="site-rules-title">Règles principales</h2>
        <p>
          Ces règles influencent les statistiques, la capacité à seeder et
          les sanctions possibles en cas de mauvais réglages ou de mauvais usage.
        </p>
      </div>

      <div className="rule-stack">
        {siteRules.map((rule) => (
          <article className="rule-card" key={rule.title}>
            <h3>{rule.title}</h3>
            <p>{rule.description}</p>
            <ul>
              {rule.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <main className="app-shell">
      <section className="hero panel">
        <div>
          <p className="eyebrow">Inscription</p>
          <h1>Inscription guidée pour tracker privé</h1>
          <p>
            Le parcours se fait en trois temps : éléments à comprendre et maitriser, des exercices,
            puis création du compte.
          </p>
          <div className="hero-meta">
            <span>8 à 12 min</span>
          </div>
        </div>

        <div className="progress-card" aria-label="Progression du parcours">
          <span>{completion}%</span>
          <p>Avancement</p>
          <div className="progress-track">
            <div style={{ width: `${completion}%` }} />
          </div>
          <small>{nextStep}</small>
        </div>
      </section>

      {isPreparationStep ? (
        <>
          <section className="panel notice-banner">
            <p>
              Si tu débutes dans le P2P, prends quelques minutes pour lire les
              éléments ci-dessous avant de commencer.
            </p>
          </section>

          <section className="grid two-columns top-grid">
            <section className="panel experience-panel" aria-labelledby="experience-title">
              <div className="section-heading">
                <p className="eyebrow">Niveau d'expérience</p>
                <h2 id="experience-title">Profil</h2>
                <p>{getExperienceCopy(experience)}</p>
              </div>

              <div className="experience-grid">
                <button
                  className={
                    experience === "private" ? "choice-card selected" : "choice-card"
                  }
                  onClick={() => handleExperienceChange("private")}
                  type="button"
                >
                  <strong>Habitué aux trackers privés</strong>
                  <span>Maîtrise de la passkey, du ratio et du seed time.</span>
                </button>

                <button
                  className={
                    experience === "public" ? "choice-card selected" : "choice-card"
                  }
                  onClick={() => handleExperienceChange("public")}
                  type="button"
                >
                  <strong>P2P via trackers publics</strong>
                  <span>Principes acquis, règles privées à valider.</span>
                </button>

                <button
                  className={
                    experience === "beginner" ? "choice-card selected" : "choice-card"
                  }
                  onClick={() => handleExperienceChange("beginner")}
                  type="button"
                >
                  <strong>Débutant</strong>
                  <span>Lecture guidée des bases avant les exercices.</span>
                </button>
              </div>
            </section>

            {isPrivateExperience ? readinessPanel : siteRulesPanel}
          </section>

          {isPrivateExperience ? siteRulesPanel : null}

          <section className="grid course-grid" aria-labelledby="course-basics">
            <div className="section-heading">
              <p className="eyebrow">Essentiel</p>
              <h2 id="course-basics">Points clés avant les exercices</h2>
            </div>

            {courseCards.map((card) => (
              <article className="info-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <ul>
                  {card.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </section>

          <section className="panel glossary-panel" aria-labelledby="glossary-title">
            <div className="section-heading">
              <p className="eyebrow">Vocabulaire</p>
              <h2 id="glossary-title">Termes utiles</h2>
              <p>
                Quelques termes à identifier pour lire les règles du site sans
                surcharge technique inutile.
              </p>
            </div>

            <div className="glossary-grid">
              {glossary.map((item) => (
                <article className="glossary-card" key={item.term}>
                  <h3>{item.term}</h3>
                  <p>{item.definition}</p>
                </article>
              ))}
            </div>
          </section>

          {!isPrivateExperience ? readinessPanel : null}
        </>
      ) : null}

      {isAssessmentStep ? (
        <>
          <section className="panel evaluation-panel" aria-labelledby="evaluation-title">
            <div className="section-heading">
              <p className="eyebrow">Exercices</p>
              <h2 id="evaluation-title">Questions et calculs</h2>
              <p>
                Réponds à l&apos;ensemble des questions pour afficher le résultat
                final, avec le score, le détail par catégorie et les explications
                utiles.
              </p>
            </div>

            <div className="question-groups">
              {groupedQuestions.map((group) => (
                <section className="question-group" key={group.category}>
                  <div className="group-heading">
                    <h3>{group.category}</h3>
                    <span>
                      {group.questions.length} question
                      {group.questions.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="question-list">
                    {group.questions.map((question) => (
                      <article className="question-card" key={question.id}>
                        <h4>{question.prompt}</h4>
                        {question.helper ? (
                          <p className="question-help">{question.helper}</p>
                        ) : null}

                        {question.type === "choice" ? (
                          <div className="option-list">
                            {question.options?.map((option) => (
                              <button
                                className={
                                  (Array.isArray(answers[question.id])
                                    ? answers[question.id].includes(option.value)
                                    : answers[question.id] === option.value)
                                    ? "option-button selected"
                                    : "option-button"
                                }
                                key={option.value}
                                onClick={() =>
                                  question.selectionMode === "multiple"
                                    ? toggleChoiceAnswer(question.id, option.value)
                                    : handleAnswerChange(question.id, option.value)
                                }
                                type="button"
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <label className="answer-field">
                            Ta réponse
                            <input
                              name={question.id}
                              onChange={(event) =>
                                handleAnswerChange(question.id, event.target.value)
                              }
                              placeholder={question.placeholder}
                              type="text"
                              value={answers[question.id] ?? ""}
                            />
                          </label>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="section-actions">
              <p>
                {answeredCount}/{totalQuestions} réponses enregistrées
              </p>
              <div className="action-row">
                <button
                  className="ghost-button"
                  onClick={resetAssessment}
                  type="button"
                >
                  Réinitialiser
                </button>
                <button
                  className="primary-button"
                  disabled={!allAnswered}
                  onClick={requestSummary}
                  type="button"
                >
                  Afficher les résultats
                </button>
              </div>
            </div>
          </section>

          {summaryVisible ? (
            <section className="panel summary-panel" aria-live="polite">
              <div className="summary-hero">
                <div>
                  <p className="eyebrow">Résultats</p>
                  <h2>
                    {evaluationPassed
                      ? "Validation réussie"
                      : "Validation à reprendre"}
                  </h2>
                  <p>
                    Score : {score}/{totalQuestions} ({scorePercent}%).
                    Seuil requis : {minScore}/{totalQuestions}.
                  </p>
                </div>
                <StatusPill
                  ready={evaluationPassed}
                  text={
                    evaluationPassed
                      ? "Passage au compte disponible"
                      : "Nouvelle tentative nécessaire"
                  }
                />
              </div>

              <div className="summary-grid">
                {categoryScores.map((item) => (
                  <article className="score-card" key={item.category}>
                    <h3>{item.category}</h3>
                    <strong>
                      {item.correct}/{item.total}
                    </strong>
                  </article>
                ))}
              </div>

              {!evaluationPassed ? (
                <div className="remediation-card">
                  <h3>Points à revoir</h3>
                  <ul>
                    {remediationTopics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="review-list">
                {missedQuestions.length === 0 && alertQuestions.length === 0 ? (
                  <article className="review-card success">
                    <h3>Aucune erreur à corriger</h3>
                    <p>
                      L&apos;évaluation est validée. Le passage aux informations
                      du compte est maintenant disponible.
                    </p>
                  </article>
                ) : (
                  <>
                    {alertQuestions.map((question) => (
                      <article className="review-card danger" key={`${question.id}-alert`}>
                        <h3>{question.prompt}</h3>
                        <p className="review-answer">
                          Ta réponse :{" "}
                          <strong>
                            {formatAnswer(question, answers[question.id] ?? "")}
                          </strong>
                        </p>
                        <p>{question.explanation}</p>
                        <p className="review-warning">{question.resultAlert}</p>
                      </article>
                    ))}

                    {missedQuestions.map((question) => (
                      <article className="review-card" key={question.id}>
                        <h3>{question.prompt}</h3>
                        <p className="review-answer">
                          Ta réponse :{" "}
                          <strong>
                            {formatAnswer(question, answers[question.id] ?? "")}
                          </strong>
                        </p>
                        <p className="review-answer">
                          Bonne réponse : <strong>{question.correctLabel}</strong>
                        </p>
                        <p>{question.explanation}</p>
                      </article>
                    ))}
                  </>
                )}
              </div>

              <div className="section-actions summary-actions">
                {evaluationPassed ? (
                  <button
                    className="primary-button"
                    onClick={continueToAccount}
                    type="button"
                  >
                    Continuer vers le compte
                  </button>
                ) : (
                  <button
                    className="secondary-button"
                    onClick={resetAssessment}
                    type="button"
                  >
                    Recommencer depuis le début
                  </button>
                )}
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      {isAccountStep ? (
        <>
          <section className="grid two-columns bottom-grid">
            <section className="panel account-panel" aria-labelledby="account-title">
              <div className="section-heading">
                <p className="eyebrow">Compte</p>
                <h2 id="account-title">Informations du compte</h2>
                <p>
                  La validation est acquise. Il ne reste plus qu&apos;à renseigner
                  les informations du compte.
                </p>
              </div>

              <form
                className="account-form"
                onSubmit={(event) => event.preventDefault()}
              >
                <label>
                  Pseudo
                  <input
                    name="username"
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setDemoCreated(false);
                    }}
                    placeholder="ex: SeedBuilder"
                    type="text"
                    value={username}
                  />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setDemoCreated(false);
                    }}
                    placeholder="nom@example.com"
                    type="email"
                    value={email}
                  />
                </label>

                <label>
                  Phrase de passe
                  <input
                    name="passphrase"
                    onChange={(event) => {
                      setPassphrase(event.target.value);
                      setDemoCreated(false);
                    }}
                    placeholder="12 caractères minimum"
                    type="password"
                    value={passphrase}
                  />
                </label>

                <div className="micro-checklist">
                  <ChecklistItem
                    ready={passphrase.length >= 12}
                    text="12 caractères minimum"
                  />
                  <ChecklistItem
                    ready={passphrase.includes(" ")}
                    text="Une phrase de passe est bien utilisée"
                  />
                  <ChecklistItem
                    ready={email.includes("@")}
                    text="L'adresse e-mail semble valide"
                  />
                </div>

                <label className="checkbox-row">
                  <input
                    checked={trackerAccepted}
                    onChange={(event) => {
                      setTrackerAccepted(event.target.checked);
                      setDemoCreated(false);
                    }}
                    type="checkbox"
                  />
                  <span>
                    Je confirme que mon passkey est personnel et que mon client
                    respecte les règles du site.
                  </span>
                </label>

                <label className="checkbox-row">
                  <input
                    checked={securityAccepted}
                    onChange={(event) => {
                      setSecurityAccepted(event.target.checked);
                      setDemoCreated(false);
                    }}
                    type="checkbox"
                  />
                  <span>
                    Je comprends qu'un mot de passe doit être stocké de façon
                    hachée et jamais en clair.
                  </span>
                </label>

                <StatusPill ready={isFormReady} text="Formulaire prêt" />
              </form>
            </section>

            <section className="panel security-panel" aria-labelledby="security-title">
              <div className="section-heading">
                <p className="eyebrow">Bonnes pratiques</p>
                <h2 id="security-title">Repères utiles</h2>
              </div>

              <div className="security-stack">
                <article className="note-card">
                  <h3>Avant de télécharger</h3>
                  <p>
                    Vérifie que le client est autorisé, que le port d&apos;écoute
                    est correct et que tu pourras assurer le seed ensuite.
                  </p>
                </article>

                <article className="note-card">
                  <h3>Pendant le seed</h3>
                  <p>
                    Le ratio aide à mesurer le partage, mais le site regarde
                    aussi le temps de seed, les H&amp;R et les comportements répétés.
                  </p>
                </article>

                <article className="note-card">
                  <h3>Pour les tokens</h3>
                  <p>
                    Les tokens récompensent le seed long terme et certaines
                    actions utiles. Ils ne remplacent pas un bon comportement.
                  </p>
                </article>
              </div>
            </section>
          </section>

          <section className="panel final-card" aria-live="polite">
            <div>
              <p className="eyebrow">Création du compte</p>
              <h2>{demoCreated ? "Compte créé" : "Compte prêt à être créé"}</h2>
              <p>
                {demoCreated
                  ? "Le parcours est validé : profil, exercices et création locale du compte."
                  : "Le formulaire de compte peut maintenant être finalisé."}
              </p>
            </div>

            <button
              className="primary-button"
              disabled={!isFormReady || demoCreated}
              onClick={() => setDemoCreated(true)}
              type="button"
            >
              {demoCreated ? "Compte validé" : "Créer le compte"}
            </button>
          </section>
        </>
      ) : null}
    </main>
  );
}

function StatusPill({ ready, text }: { ready: boolean; text: string }) {
  return (
    <span className={ready ? "status-pill ready" : "status-pill"}>
      {ready ? "Validé" : "À compléter"} - {text}
    </span>
  );
}

function ChecklistItem({ ready, text }: { ready: boolean; text: string }) {
  return (
    <span className={ready ? "check-item ready" : "check-item"}>{text}</span>
  );
}
