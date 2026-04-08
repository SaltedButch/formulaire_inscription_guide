"use client";

import { useMemo, useState } from "react";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type RatioAction = {
  label: string;
  downloaded: number;
  uploaded: number;
  description: string;
};

const lessons = [
  {
    title: "Peer-to-peer",
    body: "Les utilisateurs echangent directement des morceaux de fichiers entre eux, sans serveur central qui envoie tout le contenu."
  },
  {
    title: "Tracker prive",
    body: "Le tracker coordonne les pairs autorises, suit l'activite et applique des regles de communaute comme le ratio."
  },
  {
    title: "Ratio",
    body: "Le ratio compare ce que tu as envoye avec ce que tu as telecharge. Un bon membre partage autant que possible apres un telechargement."
  }
];

const quiz: QuizQuestion[] = [
  {
    question: "Que mesure principalement le ratio sur un tracker prive ?",
    options: [
      "La vitesse de la connexion internet",
      "Le volume envoye compare au volume telecharge",
      "Le nombre de fichiers presents sur le disque"
    ],
    answer: 1,
    explanation: "Ratio = donnees envoyees / donnees telechargees."
  },
  {
    question: "Pourquoi laisser un torrent en seed apres un telechargement ?",
    options: [
      "Pour aider les autres pairs a recuperer les morceaux",
      "Pour rendre le fichier plus petit",
      "Pour masquer le tracker"
    ],
    answer: 0,
    explanation: "Le seed maintient la disponibilite et soutient la communaute."
  },
  {
    question: "Quel comportement est le plus sain dans une communaute privee ?",
    options: [
      "Telecharger puis supprimer immediatement",
      "Partager uniquement si quelqu'un demande",
      "Respecter les regles, rester en seed et surveiller son ratio"
    ],
    answer: 2,
    explanation: "Un tracker prive repose sur des regles explicites et une contribution continue."
  },
  {
    question: "Quel contenu faut-il privilegier pour rester dans un cadre legal ?",
    options: [
      "Des contenus dont tu as les droits ou qui sont libres de diffusion",
      "Tout contenu populaire",
      "Uniquement les fichiers les plus lourds"
    ],
    answer: 0,
    explanation: "Le peer-to-peer est une technologie neutre, mais l'usage doit respecter les droits applicables."
  }
];

const ratioActions: RatioAction[] = [
  {
    label: "Seeder 1 Go",
    downloaded: 0,
    uploaded: 1,
    description: "Tu laisses le client ouvert et tu aides les autres membres."
  },
  {
    label: "Telecharger 1 Go",
    downloaded: 1,
    uploaded: 0.1,
    description: "Tu recuperes du contenu legal et tu renvoies quelques morceaux pendant le telechargement."
  },
  {
    label: "Seed longue duree",
    downloaded: 0,
    uploaded: 0.6,
    description: "Tu gardes un torrent actif meme apres avoir fini le telechargement."
  },
  {
    label: "Hit and run",
    downloaded: 0.8,
    uploaded: 0,
    description: "Tu pars trop tot : c'est mauvais pour le ratio et la disponibilite."
  }
];

const initialRatio = {
  downloaded: 2,
  uploaded: 0.7,
  log: ["Depart: 2 Go telecharges, 0.7 Go envoyes."]
};

export function OnboardingExperience() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [commitment, setCommitment] = useState(false);
  const [demoCreated, setDemoCreated] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [downloaded, setDownloaded] = useState(initialRatio.downloaded);
  const [uploaded, setUploaded] = useState(initialRatio.uploaded);
  const [ratioLog, setRatioLog] = useState(initialRatio.log);

  const ratio = uploaded / Math.max(downloaded, 0.1);
  const quizScore = quiz.reduce((score, question, index) => {
    return answers[index] === question.answer ? score + 1 : score;
  }, 0);

  const answeredQuestions = Object.keys(answers).length;
  const isFormReady =
    username.trim().length >= 3 &&
    email.includes("@") &&
    passphrase.length >= 8 &&
    commitment;
  const isRatioReady = ratio >= 1;
  const isQuizReady = answeredQuestions === quiz.length && quizScore >= 3;
  const completion = useMemo(() => {
    const checks = [isFormReady, isRatioReady, isQuizReady];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [isFormReady, isQuizReady, isRatioReady]);
  const isDemoCreated = demoCreated && completion === 100;

  function playRatioAction(action: RatioAction) {
    setDownloaded((value) => value + action.downloaded);
    setUploaded((value) => value + action.uploaded);
    setRatioLog((value) => [
      `${action.label}: ${action.description}`,
      ...value
    ].slice(0, 5));
  }

  function resetRatioGame() {
    setDownloaded(initialRatio.downloaded);
    setUploaded(initialRatio.uploaded);
    setRatioLog(initialRatio.log);
  }

  return (
    <main className="app-shell">
      <section className="hero panel">
        <div>
          <p className="eyebrow">Parcours ludique</p>
          <h1>Creation de compte pour tracker prive</h1>
          <p>
            Apprends les bases du peer-to-peer, teste ton comportement de
            partage et valide un QCM avant de finaliser l'inscription.
          </p>
        </div>
        <div className="progress-card" aria-label="Progression du parcours">
          <span>{completion}%</span>
          <p>progression</p>
          <div className="progress-track">
            <div style={{ width: `${completion}%` }} />
          </div>
        </div>
      </section>

      <section className="grid three-columns" aria-labelledby="basics-title">
        <div className="section-heading">
          <p className="eyebrow">Comprendre</p>
          <h2 id="basics-title">Les bases avant d'entrer</h2>
        </div>
        {lessons.map((lesson) => (
          <article className="info-card" key={lesson.title}>
            <h3>{lesson.title}</h3>
            <p>{lesson.body}</p>
          </article>
        ))}
      </section>

      <section className="grid two-columns">
        <form
          className="panel account-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="section-heading">
            <p className="eyebrow">Profil</p>
            <h2>Demande d'inscription</h2>
            <p>
              Prototype front-end uniquement : ces informations ne sont pas
              envoyees a un serveur.
            </p>
          </div>

          <label>
            Pseudo
            <input
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="ex: SeedMaster"
              type="text"
              value={username}
            />
          </label>

          <label>
            Email
            <input
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="toi@example.com"
              type="email"
              value={email}
            />
          </label>

          <label>
            Phrase de passe
            <input
              name="passphrase"
              onChange={(event) => setPassphrase(event.target.value)}
              placeholder="8 caracteres minimum"
              type="password"
              value={passphrase}
            />
          </label>

          <label className="checkbox-row">
            <input
              checked={commitment}
              onChange={(event) => setCommitment(event.target.checked)}
              type="checkbox"
            />
            <span>
              Je comprends que le partage doit concerner des contenus legaux et
              que le ratio protege la communaute.
            </span>
          </label>

          <StatusPill ready={isFormReady} text="Profil complete" />
        </form>

        <section className="panel ratio-game" aria-labelledby="ratio-title">
          <div className="section-heading">
            <p className="eyebrow">Mini-jeu</p>
            <h2 id="ratio-title">Equilibre ton ratio</h2>
            <p>
              Objectif : atteindre un ratio de 1.00 ou plus en choisissant les
              bonnes actions.
            </p>
          </div>

          <div className="ratio-meter">
            <div>
              <span>{uploaded.toFixed(1)} Go</span>
              <p>envoyes</p>
            </div>
            <div>
              <span>{downloaded.toFixed(1)} Go</span>
              <p>telecharges</p>
            </div>
            <div className={isRatioReady ? "ratio-ok" : "ratio-warn"}>
              <span>{ratio.toFixed(2)}</span>
              <p>ratio</p>
            </div>
          </div>

          <div className="action-grid">
            {ratioActions.map((action) => (
              <button
                className="secondary-button"
                key={action.label}
                onClick={() => playRatioAction(action)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>

          <button className="ghost-button" onClick={resetRatioGame} type="button">
            Reinitialiser le mini-jeu
          </button>

          <ul className="event-log">
            {ratioLog.map((event, index) => (
              <li key={`${event}-${index}`}>{event}</li>
            ))}
          </ul>

          <StatusPill ready={isRatioReady} text="Ratio responsable" />
        </section>
      </section>

      <section className="panel quiz" aria-labelledby="quiz-title">
        <div className="section-heading">
          <p className="eyebrow">QCM</p>
          <h2 id="quiz-title">Valide les notions essentielles</h2>
          <p>
            Score requis : 3 bonnes reponses sur {quiz.length}. Tu peux changer
            tes reponses.
          </p>
        </div>

        <div className="question-list">
          {quiz.map((question, questionIndex) => {
            const selectedAnswer = answers[questionIndex];
            const hasAnswered = selectedAnswer !== undefined;
            const isCorrect = selectedAnswer === question.answer;

            return (
              <article className="question-card" key={question.question}>
                <h3>{question.question}</h3>
                <div className="option-list">
                  {question.options.map((option, optionIndex) => (
                    <button
                      className={
                        selectedAnswer === optionIndex
                          ? "option-button selected"
                          : "option-button"
                      }
                      key={option}
                      onClick={() =>
                        setAnswers((value) => ({
                          ...value,
                          [questionIndex]: optionIndex
                        }))
                      }
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {hasAnswered ? (
                  <p className={isCorrect ? "feedback ok" : "feedback warn"}>
                    {isCorrect ? "Bonne reponse." : "A revoir."}{" "}
                    {question.explanation}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="summary-card">
          <div>
            <p className="eyebrow">Resultat</p>
            <h3>
              {quizScore}/{quiz.length} bonnes reponses
            </h3>
          </div>
          <StatusPill ready={isQuizReady} text="QCM valide" />
        </div>
      </section>

      <section className="panel final-card" aria-live="polite">
        <div>
          <p className="eyebrow">Finalisation</p>
          <h2>
            {isDemoCreated
              ? "Compte demo cree"
              : completion === 100
                ? "Candidature pedagogique prete"
                : "Encore quelques etapes"}
          </h2>
          <p>
            {isDemoCreated
              ? "Le parcours front-end est termine. Il reste a brancher une API, une base de donnees et une moderation si tu veux en faire une vraie inscription."
              : completion === 100
                ? "Le profil, le mini-jeu de ratio et le QCM sont valides. La prochaine etape serait d'ajouter un backend pour enregistrer les candidatures."
                : "Complete le formulaire, atteins un ratio responsable et valide le QCM pour terminer le parcours."}
          </p>
        </div>
        <button
          className="primary-button"
          disabled={completion !== 100 || isDemoCreated}
          onClick={() => setDemoCreated(true)}
          type="button"
        >
          {isDemoCreated ? "Compte demo valide" : "Creer le compte demo"}
        </button>
      </section>
    </main>
  );
}

function StatusPill({ ready, text }: { ready: boolean; text: string }) {
  return (
    <span className={ready ? "status-pill ready" : "status-pill"}>
      {ready ? "Valide" : "A completer"} - {text}
    </span>
  );
}
