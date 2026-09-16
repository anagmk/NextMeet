interface AboutNextMeetProps {
  /** Where the "View the code" buttons link to. Defaults to the GitHub
   * profile — pass the exact repo URL as a prop if it differs. */
  repoUrl?: string;
}

const features: { title: string; body: string }[] = [
  {
    title: "Live video",
    body: "One-to-one calls built on WebRTC, with a lobby to check your camera and mic before you join.",
  },
  {
    title: "Real-time chat",
    body: "Message alongside the call without breaking focus or switching tabs.",
  },
  {
    title: "Shared code editor",
    body: "A Monaco-powered editor both sides can see and edit live, right inside the room.",
  },
  {
    title: "Simple to join",
    body: "Unique, collision-safe meeting codes — no account required to join a call.",
  },
  {
    title: "Secure by default",
    body: "JWT auth with short-lived access tokens and rotating, hashed refresh tokens.",
  },
];

const stack: string[] = [
  "React",
  "TypeScript",
  "Vite",
  "Node.js",
  "Express",
  "MongoDB",
  "Socket.io",
  "WebRTC",
  "Monaco Editor",
  "JWT",
];

export default function AboutNextMeet({
  repoUrl = "https://github.com/anagmk",
}: AboutNextMeetProps) {
  return (
    <div className="nm2-page">
      <style>{`
        .nm2-page {
          --bg: #ffffff;
          --bg-subtle: #f6f7fb;
          --text: #14171f;
          --muted: #5b6272;
          --accent: #4338ca;
          --accent-soft: #eef0fe;
          --border: #e6e8f0;
          font-family: "Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: var(--bg);
          color: var(--text);
        }
        .nm2-inner {
          max-width: 880px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .nm2-hero {
          padding: 96px 0 64px;
        }
        .nm2-hero .nm2-inner {
          max-width: 680px;
          text-align: center;
        }
        .nm2-kicker {
          color: var(--accent);
          font-weight: 700;
          font-size: 14px;
          margin: 0 0 16px;
        }
        .nm2-hero h1 {
          font-size: 42px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin: 0 0 20px;
        }
        .nm2-sub {
          font-size: 17px;
          line-height: 1.65;
          color: var(--muted);
          margin: 0 0 32px;
        }
        .nm2-cta {
          display: inline-block;
          background: var(--accent);
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          padding: 13px 26px;
          border-radius: 8px;
          transition: opacity 0.15s ease;
        }
        .nm2-cta:hover { opacity: 0.88; }
        @media (prefers-reduced-motion: reduce) {
          .nm2-cta { transition: none; }
        }
        .nm2-section {
          padding: 56px 0;
          border-top: 1px solid var(--border);
        }
        .nm2-mission {
          font-size: 22px;
          line-height: 1.55;
          font-weight: 500;
          max-width: 600px;
        }
        .nm2-section h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 16px;
        }
        .nm2-built p {
          font-size: 16px;
          line-height: 1.7;
          color: var(--muted);
          max-width: 640px;
          margin: 0;
        }
        .nm2-subtle {
          background: var(--bg-subtle);
          border-top: none;
          border-bottom: 1px solid var(--border);
        }
        .nm2-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .nm2-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
        }
        .nm2-card h3 {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 8px;
        }
        .nm2-card p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--muted);
          margin: 0;
        }
        .nm2-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .nm2-pill {
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 999px;
        }
        .nm2-status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        .nm2-status-grid h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--muted);
          margin: 0 0 10px;
        }
        .nm2-status-grid p {
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }
        .nm2-footer-cta {
          text-align: center;
          padding: 64px 0 80px;
        }
        .nm2-footer-cta p {
          color: var(--muted);
          font-size: 15px;
          margin: 0 0 24px;
        }
        @media (max-width: 640px) {
          .nm2-hero { padding: 64px 0 48px; }
          .nm2-hero h1 { font-size: 30px; }
          .nm2-grid { grid-template-columns: 1fr; }
          .nm2-status-grid { grid-template-columns: 1fr; gap: 24px; }
        }
      `}</style>

      <div className="nm2-hero">
        <div className="nm2-inner">
          <p className="nm2-kicker">NextMeet</p>
          <h1>One call. Video, chat, and code — together.</h1>
          <p className="nm2-sub">
            NextMeet brings live video, real-time chat, and a shared code
            editor into a single room — built for interviews that need to
            see how someone actually thinks, not just hear about it.
          </p>
          <a className="nm2-cta" href={repoUrl} target="_blank" rel="noopener noreferrer">
            View the code
          </a>
        </div>
      </div>

      <div className="nm2-section">
        <div className="nm2-inner">
          <p className="nm2-mission">
            The goal is simple: make technical interviews feel like working
            together, not performing under a spotlight.
          </p>
        </div>
      </div>

      <div className="nm2-section nm2-built">
        <div className="nm2-inner">
          <h2>Built by</h2>
          <p>
            Anag, a full-stack (MERN) developer based in Kannur, Kerala.
            NextMeet is an independent project, built following a Full
            Stack Developer internship at Knovista Technologies and the
            MERN Stack program at Brototype, Kochi.
          </p>
        </div>
      </div>

      <div className="nm2-section nm2-subtle">
        <div className="nm2-inner">
          <h2>What's inside</h2>
          <div className="nm2-grid">
            {features.map((f) => (
              <div className="nm2-card" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="nm2-section">
        <div className="nm2-inner">
          <h2>Built with</h2>
          <div className="nm2-pills">
            {stack.map((s) => (
              <span className="nm2-pill" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="nm2-section nm2-subtle">
        <div className="nm2-inner">
          <div className="nm2-status-grid">
            <div>
              <h3>Live now</h3>
              <p>
                Video calling, real-time chat, the collaborative editor,
                and secure meeting links.
              </p>
            </div>
            <div>
              <h3>Building next</h3>
              <p>
                AI-powered interview evaluation paired with an LLM for
                assessment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="nm2-footer-cta">
        <div className="nm2-inner">
          <h2>Take a look</h2>
          <p>The full source is on GitHub.</p>
          <a className="nm2-cta" href={repoUrl} target="_blank" rel="noopener noreferrer">
            View the code
          </a>
        </div>
      </div>
    </div>
  );
}