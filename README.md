# EcoVibe (ECK)

Welcome to EcoVibe, a web application designed to promote eco-friendly living and sustainable practices. This repository contains the source code for both the client-side and server-side applications.

## Table of Contents

- [Project Overview](#project-overview)
- [Project Diagram](#project-diagram)
- [Folder Structure](#folder-structure)
- [Workflow Approach](#workflow-approach)
- [Tools Used](#tools-used)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Environment URLs](#environment-urls)
- [Local Development Checks](#local-development-checks)
- [Running MegaLinter Locally](#running-megalinter-locally)
- [Makefile Usage](#makefile-usage)
- [GitHub Actions](#github-actions)

## Project Overview

EcoVibe is a platform that encourages users to adopt a more environmentally conscious lifestyle. It provides information, resources, and a community space for individuals who are passionate about sustainability.

## Project Diagram

```mermaid
graph TD
    A[Client] -->|HTTP Requests| B(Server);
    B -->|HTTP Responses| A;

    subgraph Client
        direction LR
        C[React] --> D[Vite];
        D --> E[Firebase Hosting];
    end

    subgraph Server
        direction LR
        F[Flask] --> G[Gunicorn];
        G --> H[Python];
    end
```

## Folder Structure

```bash
/
├── client/
│   ├── src/            # Contains the client-side source code.
│   │   ├── components/ # Contains the React components.
│   │   ├── css/        # Contains the CSS files.
│   │   ├── hooks/      # Contains the custom React hooks.
│   │   └── utils/      # Contains the utility functions.
│   ├── tests/          # Contains the client-side tests.
│   └── public/         # Contains the public assets.
├── server/
│   ├── api_design/     # Contains the api design files.
│   ├── models/         # Contains the database models.
│   ├── routes/         # Contains the API routes.
│   └── tests/          # Contains the server-side tests.
├── .github/            # Contains the GitHub Actions workflows.
│   └── workflows/
└── scripts/            # Contains the utility scripts.
```

## Workflow Approach

This project utilizes the GitFlow workflow to manage development and releases. This approach helps to keep the codebase organized and stable.

### Main Branches

- **`main`**: This branch represents the production-ready state of the application. It is always stable and deployable.
- **`develop`**: This is the main development branch where all feature branches are merged. It contains the latest development changes.

### Supporting Branches

- **Feature Branches (`feature/`)**: When you start working on a new feature, create a branch from `develop`. Name it using the convention `feature/<feature-name>` (e.g., `feature/user-authentication`). Once the feature is complete, you will open a pull request to merge it back into `develop`.

- **Release Branches (`release/`)**: When the `develop` branch has enough features for a new release, a `release` branch is created from `develop`. This branch is used for final testing, bug fixes, and preparing for the production release. No new features are added to this branch. Once the release is ready, the `release` branch is merged into both `main` and `develop`.

- **Hotfix Branches (`hotfix/`)**: If a critical bug is found in production, a `hotfix` branch is created from `main`. This allows you to quickly fix the issue without interrupting the ongoing development in the `develop` branch. Once the fix is complete, the `hotfix` branch is merged into both `main` and `develop`.

### Contribution Steps

1. **Fork the repository:** Create a personal fork of the project on GitHub.
2. **Clone the fork:** Clone your fork to your local machine.
3. **Create a feature branch:** Create a new branch from `develop` for your changes (e.g., `git checkout -b feature/my-new-feature develop`).
4. **Make your changes:** Implement your feature or bug fix.
5. **Commit your changes:** Commit your changes with a clear and descriptive commit message.
6. **Push to your fork:** Push your changes to your fork on GitHub.
7. **Create a pull request:** Create a pull request from your feature branch to the `develop` branch of the main repository.

## Tools Used

### Client (JavaScript/React)

- **Framework:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Bootstrap](https://getbootstrap.com/), [React-Bootstrap](https://react-bootstrap.github.io/), [MUI Icons](https://mui.com/material-ui/material-icons/)
- **Testing:** [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Deployment:** [Firebase Hosting](https://firebase.google.com/docs/hosting)

### Server (Python/Flask)

- **Framework:** [Flask](https://flask.palletsprojects.com/)
- **WSGI Server:** [Gunicorn](https://gunicorn.org/)
- **Dependency Management:** [Pipenv](https://pipenv.pypa.io/)
- **Testing:** [Pytest](https://docs.pytest.org/)

## Setup Instructions

### Client

1. **Navigate to the client directory:**

    ```bash
    cd client
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Run the development server:**

    ```bash
    npm run dev
    ```

4. **Run tests:**

    ```bash
    npm run test
    ```

### Server

1. **Navigate to the server directory:**

    ```bash
    cd server
    ```

2. **Install dependencies using Pipenv:**

    ```bash
    pipenv install --dev
    ```

3. **Activate the virtual environment:**

    ```bash
    pipenv shell
    ```

4. **Run the development server:**

    ```bash
    flask run
    ```

5. **Run tests:**

    ```bash
    pytest
    ```

## Environment Variables

For any sensitive information or configuration that should not be hardcoded, environment variables are used. Below are the instructions for setting up environment variables for both the client and server applications. Ask the `project manager / team lead` for the actual values to use. You can always use dummy values for local development and testing.

### Client-Side

The client-side application uses Vite for environment configuration. Settings are managed through `.env` files located in the `client/` directory.

The application supports the following environments:

- **`local`**: (`development`) For local development.
- **`develop`**: (`integration`) Contains all features merged into the `develop` branch.
- **`staging`**: For intermediate builds before a release.
- **`production`**: The live application.

1. **Create environment files:**
    You will need to create the following files in the `client/` directory:
    - `.env.development` (for local development)
    - `.env.integration` (for the develop environment)
    - `.env.staging` (for the staging environment)
    - `.env.production` (for the production environment)

2. **Add variables:**
    In each file, define the necessary environment variables. The variable names should be the same across all files, but their values will differ.

    **Example for `.env.development` (local):**

    ```ini
    # Used for local development
    VITE_SERVER_BASE_URL=http://127.0.0.1:5555
    VITE_FIREBASE_API_KEY=your-dev-firebase-api-key
    VITE_REACT_APP_RECAPTCHA_SITE_KEY=your-dev-google-recaptcha-site-key
    ```

    **Example for `.env.integration` (develop):**

    ```ini
    # Used for the develop environment
    VITE_SERVER_BASE_URL=https://ecovibe-develop.up.railway.app
    VITE_FIREBASE_API_KEY=your-dev-firebase-api-key
    VITE_REACT_APP_RECAPTCHA_SITE_KEY=your-dev-google-recaptcha-site-key
    ```

    **Example for `.env.staging`:**

    ```ini
    # Used for the staging environment
    VITE_SERVER_BASE_URL=https://ecovibe-staging.onrender.com/
    VITE_FIREBASE_API_KEY=your-staging-firebase-api-key
    VITE_REACT_APP_RECAPTCHA_SITE_KEY=your-staging-google-recaptcha-site-key
    ```

    **Example for `.env.production`:**

    ```ini
    # Used for the production environment
    VITE_SERVER_BASE_URL=https://your-production-api-url.com/
    VITE_FIREBASE_API_KEY=your-production-firebase-api-key
    VITE_REACT_APP_RECAPTCHA_SITE_KEY=your-production-google-recaptcha-site-key
    ```

### Server-Side

The server-side application configuration is managed through a single `.env` file in the `server` directory. This file defines the settings for all environments. The active environment is determined by the `FLASK_APP_ENV` variable.

The application supports the following environments:

- **`development`**: For local development.
- **`testing`**: For running tests.
- **`integration`**: Contains all features merged into the `develop` branch.
- **`staging`**: For intermediate builds before a release.
- **`production`**: The live application.

1. Create a new file named `.env` in the `server` directory.
2. Add your configuration variables to this file. The active environment is determined by the `FLASK_APP_ENV` variable.

Here is an example structure for your `.env` file.

```ini
# -- Environment Selection --
# Sets the active environment. Options: development, testing, integration, staging, production
FLASK_APP_ENV=development

# -- Secret Key --
# Generate a secure secret key. You can use: openssl rand -hex 32
FLASK_SECRET_KEY='a_very_long_and_random_secret_key'

# -- Database URIs --
# Used when FLASK_APP_ENV=development
FLASK_SQLALCHEMY_DATABASE_URI='postgresql://user:pass@localhost/ecovibe_dev'

# Used when FLASK_APP_ENV=testing
FLASK_TEST_SQLALCHEMY_DATABASE_URI='postgresql://user:pass@localhost/ecovibe_test'

# Used when FLASK_APP_ENV=integration
FLASK_INTEGRATION_DATABASE_URI='postgresql://user:pass@integration_host/ecovibe_integration'

# Used when FLASK_APP_ENV=staging
FLASK_STAGING_DATABASE_URI='postgresql://user:pass@staging_host/ecovibe_staging'

# Used when FLASK_APP_ENV=production
FLASK_PROD_DATABASE_URI='postgresql://user:pass@production_host/ecovibe_prod'

# -- CORS Origins --
FLASK_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# -- Other Flask Variables --
FLASK_SMTP_REPLY_EMAIL= # Email address that will appear as the reply-to address
FLASK_SMTP_SERVER= # SMTP server hostname (e.g., smtp.gmail.com, smtp.office365.com)
FLASK_SMTP_PORT= # SMTP server port (e.g., 587 for TLS, 465 for SSL)
FLASK_SMTP_USER= # SMTP authentication username
FLASK_ADMIN_EMAIL= # Admin email address for system notifications and contact
FLASK_SMTP_PASS= # SMTP authentication password
FLASK_API= # API route prefix (e.g., "/api" - all routes will be prefixed with this)
```

## Environment URLs

### Client URLs

| Environment | URL |
| :--- | :--- |
| Local | <http://localhost:5173> |
| Develop | [https://ecovibe-develop.netlify.app/](https://ecovibe-develop.netlify.app/) |
| Staging | [https://ecovibe-staging.web.app/](https://ecovibe-staging.web.app/) |
| Production | Not Deployed |

### Server URLs

| Environment | URL |
| :--- | :--- |
| Local | <http://localhost:5555> |
| Develop | [https://ecovibe-develop.up.railway.app](https://ecovibe-develop.up.railway.app) |
| Staging | [https://ecovibe-staging.onrender.com/](https://ecovibe-staging.onrender.com/) |
| Production | Not Deployed |

Remember to update the client to point to the correct server URL in the appropriate places, and ensure CORS settings are configured on the server.

## Local Development Checks

Before creating a pull request, it is recommended to run all local checks to ensure your code is clean and passes all tests. The `make propose` command automates this, but you can also run the checks manually.

### Client-Side Checks

From the `client` directory, run the following commands:

- **Run tests:**

  ```bash
  npm test
  ```

- **Check for linting and formatting issues:**

  ```bash
  npx eslint "src/**/*.{js,jsx,ts,tsx}"
  npx prettier --check "src/**/*.{js,jsx,ts,tsx,json,css,md}"
  ```

- **Fix linting and formatting issues:**

  ```bash
  npx eslint --fix "src/**/*.{js,jsx,ts,tsx}"
  npx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"
  ```

### Server-Side Checks

From the `server` directory, and with the `pipenv` shell activated, run the following commands:

- **Run tests:**

  ```bash
  pytest
  ```

- **Check for linting and formatting issues:**

  ```bash
  flake8 .
  black --check .
  ```

- **Fix linting and formatting issues:**

  ```bash
  flake8 .
  black .
  ```

## Running MegaLinter Locally

This project uses MegaLinter to ensure code quality. You can run MegaLinter locally using Docker to check your code before pushing it.

1. **Install Docker:** If you don't have Docker installed, follow the official installation instructions for your operating system.
2. **Run MegaLinter:** Open your terminal in the root of the project and run the following command:

    ```bash
    docker run -v $(pwd):/tmp/lint oxsecurity/megalinter:v8
    ```

This will mount your project directory into the Docker container and run all the relevant linters. The output will show you any issues that need to be fixed.

## Makefile Usage

This project includes a `Makefile` to streamline common development tasks.

### Operating System Compatibility

- **macOS:** Fully compatible.
- **Linux:** Fully compatible.
- **WSL (Windows Subsystem for Linux):** Fully compatible.
- **Windows (without WSL):** Requires a bash-like environment (e.g., Git Bash) for the `propose` command. The `help` command will work in the standard Windows Command Prompt or PowerShell.

### Available Commands

#### `make help`

Displays a list of available commands and their usage.

#### `make propose m="<commit-message>"`

This command automates the process of preparing your code for a pull request. It performs the following steps:

1. **Validates Input**: Checks that you've provided a commit message.
2. **Branch Check**: Ensures you are not on the `main` or `develop` branch.
3. **Backend Linting & Formatting**:
    - Formats Python code in the `server/` directory using `black`.
    - Lints Python code with `flake8` to catch errors and style issues.
4. **Frontend Linting & Formatting**:
    - Formats JavaScript/React code in the `client/` directory using `prettier`.
    - Lints and fixes issues in the frontend code with `eslint`.
5. **Run Tests**:
    - Runs server-side tests with `pytest`.
    - Runs client-side tests with `npm test`.
6. **Commits Changes**:
    - Stages all modified files (`git add .`).
    - Commits the changes with your provided message.
7. **Syncs with Remote**: Pulls the latest changes from the `develop` branch to keep your branch up-to-date.
8. **Pushes to GitHub**: Pushes your feature branch to the remote repository.
9. **Next Steps**: Reminds you to create a pull request on GitHub.

### Example

To propose a new feature, you would run:

```bash
make propose m="feat: implement user authentication"
```

## GitHub Actions

This project uses GitHub Actions to automate testing, linting, and deployment. Here is an overview of the workflows:

### Client Workflows

- **`Client Merge PR/Push CI` (`client-merge.yaml`)**: Triggered on pushes to `main` and `develop`. Runs the full client-side test suite against multiple Node.js versions to ensure compatibility.

- **`Client Pull Request CI` (`client-pull-request.yml`)**: Triggered on pull requests to `main` and `develop`. This workflow runs the client-side tests, calculates test coverage, and posts a summary on the pull request. It will fail the check if the coverage drops below a predefined threshold, ensuring code quality is maintained.

### Server Workflows

- **`Flask application CI` (`server.yaml`)**: Triggered on pushes and pull requests to `main` and `develop`. It runs the server-side Python tests against multiple Python versions. It also calculates test coverage and adds a report to the pull request, highlighting coverage for only the changed files.

### Deployment Workflows

- **`Deploy to Firebase Hosting on merge` (`firebase-hosting-merge.yml`)**: Automatically deploys the client application to the live Firebase Hosting environment when code is merged into the `main` branch.

- **`Deploy to Firebase Hosting on PR` (`firebase-hosting-pull-request.yml`)**: When a pull request is opened against `main` or `develop`, this workflow builds the client application and deploys it to a temporary preview URL. This allows for reviewing the changes in a live-like environment before they are merged.

### Code Quality Workflow

- **`MegaLinter` (`megalinter.yaml`)**: This workflow runs on every pull request to `main` and `develop`. It uses MegaLinter, a powerful tool that bundles many linters, to analyze the entire codebase for style issues, potential bugs, and inconsistencies.
It is configured to automatically fix many of the issues it finds and commit them directly to the pull request branch, helping to maintain a clean and consistent codebase.
