# CI/CD — Guia de configuração e Git Flow

## Estrutura de branches (Git Flow)

```
main          ← produção (protegida, merge apenas via PR de release/* ou hotfix/*)
develop       ← integração contínua (protegida, merge via PR de feature/*)
release/x.y.z ← preparação de release (criada a partir de develop)
feature/*     ← novas funcionalidades (criadas a partir de develop)
bugfix/*      ← correções em develop (criadas a partir de develop)
hotfix/*      ← correções urgentes em produção (criadas a partir de main)
chore/*       ← tarefas técnicas, configs, docs
```

---

## Fluxo de trabalho

### Nova feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature

# ... desenvolve ...

git add .
git commit -m "feat: descrição da mudança"
git push origin feature/nome-da-feature
# Abrir PR: feature/nome-da-feature → develop
```

### Release
```bash
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# Bump de versão no package.json
git commit -m "chore: bump version to 1.2.0"
git push origin release/1.2.0

# PR 1: release/1.2.0 → main   (dispara deploy produção)
# PR 2: release/1.2.0 → develop (sincroniza develop)

# Após merge na main:
git checkout main && git pull
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### Hotfix
```bash
git checkout main
git pull origin main
git checkout -b hotfix/descricao-do-bug

git commit -m "fix: corrige bug urgente"
git push origin hotfix/descricao-do-bug

# PR 1: hotfix/* → main
# PR 2: hotfix/* → develop
```

---

## Pipelines por evento

| Evento | Workflow disparado | Jobs executados |
|---|---|---|
| PR aberto para `develop` ou `main` | `pr-validation.yml` | lint, test, build, valida nome da branch |
| Push em `develop` | `ci-cd.yml` | lint → test → build → **deploy S3 dev** → invalida CloudFront dev |
| Push em `release/*` | `ci-cd.yml` | lint → test → build (sem deploy) |
| Push em `main` | `ci-cd.yml` | lint → test → build → **deploy S3 prod** → invalida CloudFront prod |

---

## Secrets necessários no GitHub

Vá em: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Descrição |
|---|---|
| `AWS_ACCESS_KEY_ID` | Access key do IAM User de CI |
| `AWS_SECRET_ACCESS_KEY` | Secret da access key |
| `CLOUDFRONT_DIST_ID_PROD` | ID da distribuição CloudFront de produção |
| `CLOUDFRONT_DIST_ID_DEV` | ID da distribuição CloudFront de desenvolvimento |

### Política IAM mínima para o CI (frontend)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Deploy",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::virtual-mural-frontend-prod",
        "arn:aws:s3:::virtual-mural-frontend-prod/*",
        "arn:aws:s3:::virtual-mural-frontend-dev",
        "arn:aws:s3:::virtual-mural-frontend-dev/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "*"
    }
  ]
}
```

---

## Variáveis a ajustar no ci-cd.yml

```yaml
env:
  AWS_REGION: us-east-1
  S3_BUCKET_PROD: virtual-mural-frontend-prod   # nome do seu bucket S3 de produção
  S3_BUCKET_DEV: virtual-mural-frontend-dev     # nome do seu bucket S3 de dev
```

> O nome do output do Angular build está como `dist/aws-frontend/browser/`.
> Confirme em `angular.json → projects.aws-frontend.architect.build.options.outputPath`
> e ajuste o caminho no `aws s3 sync` se necessário.

---

## Proteção de branches recomendada

Em **Settings → Branches → Add rule**:

**Para `main`:**
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks: `Lint, Test & Build`
- ✅ Do not allow bypassing

**Para `develop`:**
- ✅ Require a pull request before merging
- ✅ Require status checks: `Lint, Test & Build`
