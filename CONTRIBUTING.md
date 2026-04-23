# Guia de Contribuição — Virtual Mural (Frontend)

## Estratégia de Branches

Este projeto segue uma adaptação do **Git Flow**. A regra principal é:

> **Nunca commitar diretamente na `master` ou na `develop`.** Todo trabalho deve ser feito em branches de feature ou fix criadas a partir da `develop`.

### Branches permanentes

| Branch | Propósito |
|---|---|
| `master` | Versão estável em produção. Só recebe merges via PR vindo da `develop` após validação. |
| `develop` | Branch de integração. Reúne todas as features e fixes prontos para a próxima release. |

---

## Nomenclatura de Branches

Toda branch de trabalho deve ser criada a partir da `develop` seguindo o padrão:

```
<tipo>/<escopo-curto>
```

### Tipos disponíveis

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feature/` | Nova funcionalidade | `feature/mural-card-provider` |
| `fix/` | Correção de bug | `fix/onboarding-redirect-loop` |
| `hotfix/` | Correção urgente em produção (parte da `master`) | `hotfix/login-crash-ios` |
| `refactor/` | Refatoração sem mudança de comportamento | `refactor/auth-service-cleanup` |
| `chore/` | Tarefas de manutenção (deps, CI, config) | `chore/update-angular-material` |
| `docs/` | Apenas documentação | `docs/readme-setup-guide` |

### Exemplos práticos

```bash
# Nova feature
git checkout develop
git checkout -b feature/provider-service-form

# Correção de bug
git checkout develop
git checkout -b fix/customer-search-filter

# Hotfix em produção
git checkout master
git checkout -b hotfix/token-expiry-crash
```

---

## Fluxo de Trabalho

```
master  ←──────────────────────── PR (release)
  │
develop ←── PR (feature/fix prontos)
  │
  ├── feature/mural-card-provider
  ├── fix/onboarding-redirect-loop
  └── refactor/auth-service-cleanup
```

### Passo a passo

1. **Criar a branch** a partir da `develop`:
   ```bash
   git checkout develop && git pull origin develop
   git checkout -b feature/nome-da-feature
   ```

2. **Desenvolver e commitar** seguindo o padrão de mensagens (ver abaixo).

3. **Abrir um Pull Request** da sua branch para a `develop`.

4. **Após aprovação e merge na `develop`**, quando um conjunto de features estiver pronto para produção, abre-se um PR da `develop` para a `master`.

5. **Hotfixes** são criados a partir da `master`, mergeados na `master` e depois na `develop` para manter as branches sincronizadas.

---

## Padrão de Mensagens de Commit

Seguimos o padrão **Conventional Commits**:

```
<tipo>(<escopo>): <descrição curta em minúsculas>

[corpo opcional — explica o "por quê"]

[rodapé opcional — ex: BREAKING CHANGE, closes #123]
```

### Tipos de commit

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `style` | Formatação, espaços, ponto e vírgula (sem lógica) |
| `test` | Adição ou correção de testes |
| `chore` | Tarefas de build, CI, dependências |
| `docs` | Apenas documentação |
| `perf` | Melhoria de performance |

### Exemplos

```
feat(provider-dashboard): adicionar formulário inline de criação de serviço

fix(customer-dashboard): corrigir filtro de busca por texto não reativo

refactor(onboarding): substituir localStorage por sincronização com backend

chore(deps): atualizar @angular/material para 21.2.0
```

---

## Regras de Proteção da `master`

- Commits diretos na `master` estão **bloqueados**
- Todo merge na `master` exige **Pull Request aprovado**
- A `master` deve sempre representar uma versão **funcional e testada**
