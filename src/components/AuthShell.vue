<template>
  <main class="auth-page">
    <div class="auth-terminal">
      <div class="auth-terminal__bar" aria-hidden="true">
        <span class="auth-terminal__dot"></span>
        <span class="auth-terminal__dot"></span>
        <span class="auth-terminal__dot"></span>
        <span class="auth-terminal__label">SPYDER-BOY COLOR</span>
        <span class="auth-terminal__power">POWER</span>
      </div>

      <section class="auth-card">
        <header class="auth-header">
          <svg
            class="auth-logo"
            viewBox="0 0 64 72"
            role="img"
            aria-label="SpyderTracker"
          >
            <path
              d="M32 2 60 11v24c0 18-12 29-28 35C16 64 4 53 4 35V11Z"
              fill="#2a1118"
              stroke="#ff5a5f"
              stroke-width="2"
            />
            <g fill="none" stroke="#ff5a5f" stroke-width="2" stroke-linecap="round">
              <path d="M27 30 15 22M26 35 11 33M26 40 13 48M28 44 18 56" />
              <path d="M37 30 49 22M38 35 53 33M38 40 51 48M36 44 46 56" />
            </g>
            <ellipse cx="32" cy="37" rx="6" ry="9" fill="#ff5a5f" />
            <circle cx="32" cy="25" r="5" fill="#ff5a5f" />
          </svg>

          <span class="auth-rev">REV.04</span>
          <h1 class="auth-brand">SpyderTracker</h1>
          <p class="auth-tagline">
            Terminal de Monitoreo Urbano e Inteligencia Táctica
          </p>
        </header>

        <slot />
      </section>
    </div>

    <p class="auth-page__footer" aria-hidden="true">
      Spyder Systems Inc. · 1999 · Protocolo Retro Táctico
    </p>
  </main>
</template>

<style scoped>
.auth-page {
  position: relative;
  display: grid;
  min-height: 100vh;
  padding: clamp(1.25rem, 4vw, 3rem) 1rem;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 8%, rgba(94, 225, 255, 0.22), transparent 34%),
    radial-gradient(circle at 50% 110%, rgba(255, 90, 95, 0.12), transparent 42%),
    linear-gradient(160deg, #0c2b8f 0%, #1b44c9 48%, #081538 100%);
}

.auth-page::before {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(190, 225, 255, 0.2) 1px, transparent 1px);
  background-size: 22px 22px;
  content: '';
  opacity: 0.35;
  pointer-events: none;
}

.auth-terminal {
  position: relative;
  z-index: 1;
  width: min(100%, 500px);
  padding: 10px;
  background: linear-gradient(180deg, #58d5ea 0%, #1d6f96 100%);
  border-radius: 20px;
  box-shadow:
    0 26px 80px rgba(0, 0, 0, 0.55),
    0 0 45px rgba(62, 199, 223, 0.18);
}

.auth-terminal__bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 6px 8px;
  color: #062333;
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-terminal__dot {
  width: 7px;
  height: 7px;
  background: rgba(6, 35, 51, 0.5);
  border-radius: 50%;
}

.auth-terminal__label {
  margin: 0 auto;
  padding: 2px 8px;
  background: rgba(6, 19, 29, 0.85);
  border-radius: 3px;
  color: #a4f1ff;
}

.auth-terminal__power {
  margin-left: auto;
  font-size: 0.5rem;
}

.auth-card {
  padding: clamp(1.25rem, 4vw, 1.9rem);
  background: linear-gradient(180deg, rgba(16, 26, 44, 0.98), rgba(8, 15, 26, 0.99));
  border: 1px solid rgba(62, 199, 223, 0.32);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 1.15rem;
  margin-bottom: 1.15rem;
  border-bottom: 1px solid rgba(36, 52, 78, 0.8);
  text-align: center;
}

.auth-logo {
  width: 68px;
  height: 76px;
  filter: drop-shadow(0 0 14px rgba(255, 90, 95, 0.25));
}

.auth-rev {
  margin-top: 0.3rem;
  padding: 0.12rem 0.5rem;
  background: var(--color-brand);
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 0.52rem;
  letter-spacing: 0.08em;
}

.auth-brand {
  margin-top: 0.5rem;
  color: #ffffff;
  font-size: clamp(1.6rem, 6vw, 2.2rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-shadow: 0 0 24px rgba(62, 199, 223, 0.25);
}

.auth-tagline {
  max-width: 340px;
  margin-top: 0.3rem;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  line-height: 1.35;
}

.auth-page__footer {
  position: relative;
  z-index: 1;
  margin-top: 1rem;
  color: rgba(200, 230, 255, 0.6);
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
}

@media (max-width: 520px) {
  .auth-terminal {
    padding: 7px;
    border-radius: 14px;
  }

  .auth-card {
    padding: 1.1rem;
  }

  .auth-logo {
    width: 56px;
    height: 62px;
  }

  .auth-tagline {
    font-size: 0.72rem;
  }
}
</style>
