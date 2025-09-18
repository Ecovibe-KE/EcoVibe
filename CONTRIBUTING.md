# Contributing Guide

Thank you for considering contributing to this project! 🎉  
This document outlines the process to follow when making contributions.

---

## 🛠 Development Workflow

We use **GitFlow** for branching:

- **main** → Production-ready code  
- **develop** → Integration branch (all features and fixes merge here first)  
- **feature/** → For new features (e.g., `feature/signup-form`)  
- **hotfix/** → For urgent fixes to production (e.g., `hotfix/login-crash`)  

### Example
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
````

---

## ✅ Commit Messages

Follow a consistent format. We recommend **Conventional Commits**:

* `feat:` for new features
* `fix:` for bug fixes
* `chore:` for maintenance tasks
* `docs:` for documentation updates

Example:

```
feat: add signup form with email validation
```

---

## 🔀 Pull Request Process

1. Create your branch from `develop`.
2. Push your branch and open a **Pull Request (PR)** → target `develop`.
3. PRs should include:

   * Clear description of changes
   * Testing instructions
   * Screenshots/logs if applicable
4. Ensure:

   * All CI/CD checks pass
   * Code is reviewed by at least **2 team members**
5. Once approved, the PR will be merged into `develop`.

> See the [Pull Request Template](.github/pull_request_template.md) for guidance.

---

## 🧪 Testing

* Write/Update unit tests for your changes.
* Run tests locally before submitting.

---

## 📄 Documentation

* Update `README.md` or other docs if your change affects setup or usage.
* For new environment variables, update `.env.example`.

---

## 🙌 Getting Help

If you have questions, open a **Discussion** or create a **Draft PR** for feedback.
