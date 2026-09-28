# Cloud Architect Learning Lab

Interactive guided learning portal for building hands-on Cloud Solutions Architect skills.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## MVP features

- Module 1.1 Linux CLI Foundations
- Lesson navigation
- Architect-focused explanations
- Hands-on commands
- Per-lesson completion tracking
- Module and overall progress
- Learning journal saved in localStorage
- Responsive dashboard

## Roadmap

The same application will later be used for the learning program itself:

1. Git workflow
2. Dockerize the app
3. Build CI pipeline
4. Deploy to Kubernetes
5. Package with Helm
6. Implement automated CD
7. Add Prometheus/Grafana observability
8. Add logging and OpenTelemetry
9. Deploy to a managed cloud Kubernetes platform

## v0.1.2 learning UX update
Hands-on lab commands are now displayed as guided steps with:
- the command to run
- what the command does
- an example / expected result or caution
- separate instruction steps for multi-terminal labs

Future modules should follow the same command-guide format.

## Git Learning Progress

### Module 1.2 — Git Basics

Status: Completed
Score: 92/100 — Architect Ready

Completed skills:

- Staging and committing changes
- Inspecting staged and unstaged differences
- Restoring and unstaging files
- Configuring GitHub SSH authentication
- Pushing and establishing upstream tracking
- Explaining local and remote-tracking branches
- Diagnosing an accidentally nested repository

### Module 1.3 — Branching and Pull Requests

Status: Completed
Score: 91/100 — Architect Ready

Completed skills:

- Create and rename feature branches
- Keep changes isolated from `main`
- Push a feature branch to GitHub
- Open and review a Pull Request
- Merge changes safely
- Synchronize local `main` after the merge

## Docker Learning Progress

### Module 2.1 — Docker Foundation

Status: In Progress

Completed skills:

- Created a multi-stage production Dockerfile
- Used `.dockerignore` to reduce the build context
- Generated a standalone Next.js production build
- Built and tagged a Docker image
- Published a container port to the host
- Tested the application with `curl`
- Ran the application as a non-root user
- Inspected image layers and cleaned up the test container

Current image:

`cloud-architect-learning-lab:docker-foundation`
