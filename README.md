# AwsFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: #0f1117;
    color: #e2e8f0;
    min-height: 100vh;
    padding: 32px 24px;
  }

  .container { max-width: 900px; margin: 0 auto; }

  /* Header */
  .header { text-align: center; margin-bottom: 40px; }
  .header-badge {
    display: inline-block;
    background: #1e40af22;
    border: 1px solid #3b82f6;
    color: #60a5fa;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  .header h1 {
    font-size: 28px;
    font-weight: 800;
    color: #f1f5f9;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .header p { font-size: 14px; color: #64748b; }

  /* Layers */
  .layer { margin-bottom: 16px; }
  .layer-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 8px;
    padding-left: 4px;
  }
  .layer-row {
    display: flex;
    gap: 10px;
    align-items: stretch;
    flex-wrap: wrap;
  }

  /* Cards */
  .card {
    flex: 1;
    min-width: 120px;
    border-radius: 10px;
    padding: 14px 16px;
    border: 1px solid;
    position: relative;
    transition: transform 0.15s, box-shadow 0.15s;
    cursor: default;
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .card-icon { font-size: 20px; margin-bottom: 6px; }
  .card-name {
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 3px;
    line-height: 1.2;
  }
  .card-desc { font-size: 11px; line-height: 1.4; opacity: 0.7; }

  /* Color themes */
  .blue  { background: #0f2744; border-color: #1d4ed8; }
  .blue .card-name  { color: #60a5fa; }
  .green { background: #0d2618; border-color: #16a34a; }
  .green .card-name { color: #4ade80; }
  .purple{ background: #1a0f30; border-color: #7c3aed; }
  .purple .card-name{ color: #a78bfa; }
  .orange{ background: #2a1500; border-color: #ea580c; }
  .orange .card-name{ color: #fb923c; }
  .pink  { background: #2a0f1e; border-color: #db2777; }
  .pink .card-name  { color: #f472b6; }
  .cyan  { background: #0a2030; border-color: #0891b2; }
  .cyan .card-name  { color: #22d3ee; }
  .gray  { background: #141820; border-color: #334155; }
  .gray .card-name  { color: #94a3b8; }

  /* Connector arrows */
  .connector {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    gap: 8px;
    margin: -4px 0;
  }
  .connector-line {
    flex: 1;
    max-width: 200px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #334155, transparent);
  }
  .connector-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .connector-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #334155;
  }
  .connector-chevron {
    font-size: 12px;
    color: #334155;
    line-height: 1;
  }

  /* Flow section */
  .flow-section { margin-top: 32px; }
  .flow-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 16px;
    text-align: center;
  }
  .flow-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    flex-wrap: wrap;
    gap: 4px;
  }
  .flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 90px;
  }
  .flow-step-num {
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    font-weight: 800;
  }
  .flow-step-text { font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.3; }
  .flow-arrow { font-size: 16px; color: #334155; margin-top: -8px; }

  /* Stats */
  .stats {
    display: flex;
    gap: 12px;
    margin-top: 28px;
    flex-wrap: wrap;
  }
  .stat {
    flex: 1;
    min-width: 100px;
    background: #141820;
    border: 1px solid #1e293b;
    border-radius: 10px;
    padding: 14px;
    text-align: center;
  }
  .stat-value {
    font-size: 22px;
    font-weight: 800;
    color: #f1f5f9;
    display: block;
    margin-bottom: 4px;
  }
  .stat-label { font-size: 11px; color: #475569; }

  /* Tag pills */
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 24px; justify-content: center; }
  .tag {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    border: 1px solid;
  }

  /* Divider */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #1e293b, transparent);
    margin: 28px 0;
  }

  .link-cta {
    text-align: center;
    margin-top: 28px;
    padding: 16px;
    background: #0f2035;
    border: 1px solid #1d4ed8;
    border-radius: 12px;
  }
  .link-cta p { font-size: 13px; color: #94a3b8; margin-bottom: 6px; }
  .link-cta a {
    color: #60a5fa;
    font-weight: 700;
    font-size: 15px;
    text-decoration: none;
    letter-spacing: 0.3px;
  }
  .link-cta a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <div class="header">
    <div class="header-badge">SaaS • Full Stack • 2026</div>
    <h1>🏢 Mural Virtual de Condomínio</h1>
    <p>Plataforma que conecta moradores e prestadores de serviço com pagamento integrado</p>
  </div>

  <!-- Layer: Frontend -->
  <div class="layer">
    <div class="layer-label">☁️ Frontend — Vercel</div>
    <div class="layer-row">
      <div class="card blue">
        <div class="card-icon">⚡</div>
        <div class="card-name">Angular 21</div>
        <div class="card-desc">Standalone components, Signals, lazy loading</div>
      </div>
      <div class="card blue">
        <div class="card-icon">🎨</div>
        <div class="card-name">Angular Material</div>
        <div class="card-desc">Design system, temas, componentes UI</div>
      </div>
      <div class="card blue">
        <div class="card-icon">🌐</div>
        <div class="card-name">i18n PT/EN</div>
        <div class="card-desc">ngx-translate, múltiplos idiomas</div>
      </div>
      <div class="card blue">
        <div class="card-icon">💳</div>
        <div class="card-name">Stripe Checkout</div>
        <div class="card-desc">Redirect para hosted checkout</div>
      </div>
    </div>
  </div>

  <!-- Connector -->
  <div class="connector">
    <div class="connector-line"></div>
    <div class="connector-arrow">
      <div class="connector-dot"></div>
      <div class="connector-chevron">↕</div>
      <div class="connector-dot"></div>
    </div>
    <div class="connector-line"></div>
  </div>

  <!-- Layer: Auth -->
  <div class="layer">
    <div class="layer-label">🔐 Autenticação</div>
    <div class="layer-row">
      <div class="card purple">
        <div class="card-icon">🔑</div>
        <div class="card-name">AWS Cognito</div>
        <div class="card-desc">JWT, login, registro, forgot password, e-mail confirm</div>
      </div>
      <div class="card purple">
        <div class="card-icon">🛡️</div>
        <div class="card-name">Guards & Interceptors</div>
        <div class="card-desc">AuthGuard, RoleGuard, JWT auto-refresh</div>
      </div>
    </div>
  </div>

  <!-- Connector -->
  <div class="connector">
    <div class="connector-line"></div>
    <div class="connector-arrow">
      <div class="connector-dot"></div>
      <div class="connector-chevron">↕</div>
      <div class="connector-dot"></div>
    </div>
    <div class="connector-line"></div>
  </div>

  <!-- Layer: Backend -->
  <div class="layer">
    <div class="layer-label">⚙️ Backend — Railway (Docker)</div>
    <div class="layer-row">
      <div class="card green">
        <div class="card-icon">🚀</div>
        <div class="card-name">NestJS</div>
        <div class="card-desc">REST API, guards, pipes, interceptors</div>
      </div>
      <div class="card green">
        <div class="card-icon">🗄️</div>
        <div class="card-name">TypeORM + PostgreSQL</div>
        <div class="card-desc">Migrations, transactions, entities</div>
      </div>
      <div class="card green">
        <div class="card-icon">🐇</div>
        <div class="card-name">RabbitMQ</div>
        <div class="card-desc">Eventos assíncronos, notificações</div>
      </div>
      <div class="card green">
        <div class="card-icon">📦</div>
        <div class="card-name">Docker</div>
        <div class="card-desc">Multi-stage build, non-root user</div>
      </div>
    </div>
  </div>

  <!-- Connector -->
  <div class="connector">
    <div class="connector-line"></div>
    <div class="connector-arrow">
      <div class="connector-dot"></div>
      <div class="connector-chevron">↕</div>
      <div class="connector-dot"></div>
    </div>
    <div class="connector-line"></div>
  </div>

  <!-- Layer: Payments + AWS -->
  <div class="layer">
    <div class="layer-label">💰 Pagamentos & Cloud</div>
    <div class="layer-row">
      <div class="card orange">
        <div class="card-icon">💳</div>
        <div class="card-name">Stripe</div>
        <div class="card-desc">Checkout Session, webhooks, assinatura validada</div>
      </div>
      <div class="card orange">
        <div class="card-icon">🔀</div>
        <div class="card-name">Stripe Connect</div>
        <div class="card-desc">Split 95/5 automático, conta Express</div>
      </div>
      <div class="card orange">
        <div class="card-icon">📧</div>
        <div class="card-name">AWS SES</div>
        <div class="card-desc">E-mails transacionais</div>
      </div>
      <div class="card orange">
        <div class="card-icon">📣</div>
        <div class="card-name">AWS SNS</div>
        <div class="card-desc">Notificações push por condomínio</div>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Payment Flow -->
  <div class="flow-section">
    <div class="flow-title">🔄 Fluxo de Pagamento</div>
    <div class="flow-steps">
      <div class="flow-step">
        <div class="flow-step-num" style="background:#1e3a5f;color:#60a5fa">1</div>
        <div class="flow-step-text">Cliente seleciona serviço</div>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-step-num" style="background:#1a2f1a;color:#4ade80">2</div>
        <div class="flow-step-text">Backend cria Checkout Session</div>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-step-num" style="background:#2a1a00;color:#fb923c">3</div>
        <div class="flow-step-text">Stripe processa pagamento</div>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-step-num" style="background:#1a0a2a;color:#a78bfa">4</div>
        <div class="flow-step-text">Webhook confirma no banco</div>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step">
        <div class="flow-step-num" style="background:#0a2020;color:#22d3ee">5</div>
        <div class="flow-step-text">Split automático 95/5</div>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Stats -->
  <div class="stats">
    <div class="stat">
      <span class="stat-value">Angular<br><span style="font-size:14px;color:#60a5fa">21</span></span>
      <div class="stat-label">Versão mais recente</div>
    </div>
    <div class="stat">
      <span class="stat-value" style="color:#4ade80">5%</span>
      <div class="stat-label">Taxa da plataforma</div>
    </div>
    <div class="stat">
      <span class="stat-value" style="color:#fb923c">2</span>
      <div class="stat-label">Perfis de usuário</div>
    </div>
    <div class="stat">
      <span class="stat-value" style="color:#a78bfa">CI/CD</span>
      <div class="stat-label">GitHub Actions</div>
    </div>
    <div class="stat">
      <span class="stat-value" style="color:#f472b6">Git<br><span style="font-size:14px">Flow</span></span>
      <div class="stat-label">Branches organizados</div>
    </div>
    <div class="stat">
      <span class="stat-value" style="color:#22d3ee">HTTPS</span>
      <div class="stat-label">Tudo criptografado</div>
    </div>
  </div>

  <!-- Tags -->
  <div class="tags">
    <span class="tag" style="color:#60a5fa;border-color:#1d4ed8;background:#0f2035">#Angular</span>
    <span class="tag" style="color:#4ade80;border-color:#16a34a;background:#0d2018">#NestJS</span>
    <span class="tag" style="color:#fb923c;border-color:#ea580c;background:#200f00">#Stripe</span>
    <span class="tag" style="color:#a78bfa;border-color:#7c3aed;background:#130a20">#AWS</span>
    <span class="tag" style="color:#22d3ee;border-color:#0891b2;background:#051520">#TypeScript</span>
    <span class="tag" style="color:#f472b6;border-color:#db2777;background:#1a0510">#Docker</span>
    <span class="tag" style="color:#94a3b8;border-color:#334155;background:#0d1117">#PostgreSQL</span>
    <span class="tag" style="color:#fbbf24;border-color:#d97706;background:#1a1000">#RabbitMQ</span>
    <span class="tag" style="color:#34d399;border-color:#059669;background:#021510">#Vercel</span>
    <span class="tag" style="color:#f87171;border-color:#dc2626;background:#1a0505">#Railway</span>
  </div>

  <!-- CTA -->
  <div class="link-cta">
    <p>🚀 Acesse o projeto em produção</p>
    <a href="https://virtual-mural-aws-project.vercel.app/login" target="_blank">
      virtual-mural-aws-project.vercel.app
    </a>
  </div>

</div>
</body>
</html>

[mural_virtual_architecture.html](https://github.com/user-attachments/files/27365090/mural_virtual_architecture.html)


Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
