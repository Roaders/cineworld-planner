# Cineworld Planner

An Angular application and Node/Express API for planning multi-film visits to Cineworld.

## Architecture

- `src/app` contains the Angular frontend.
- `src/node/server` contains the API, which retrieves and maps Cineworld data.
- The frontend and API are deployed separately. The production frontend uses the API URL configured in `src/constants/constants.ts`.

## Requirements

- Node.js 26.x and npm
- Docker, only when building or running the API container

The required Node version is declared in `package.json` and used by CI and the Docker image.

## Local development

Install the locked dependencies:

```sh
npm ci
```

Start the API in one terminal. It listens on `http://localhost:3000` and restarts when server source files change:

```sh
npm run watch-node
```

Start the Angular development server in another terminal:

```sh
npm run start-app
```

The browser opens at `http://localhost:4200`. This origin is allowed by the API's CORS policy and the local frontend configuration points to port 3000.

## Configuration

### API environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port. Defaults to `3000`. |
| `HTTPS_CERTIFICATES_PATH` | No | Enables HTTPS. The directory must contain readable `cert.pem` and `privkey.pem` files. The server fails to start if either file cannot be read. |

The API only accepts browser requests from the origins listed in `src/node/server/index.ts`. Update that list deliberately when adding a frontend host.

The frontend API endpoint is selected at build time:

| Configuration | Command | API target |
| --- | --- | --- |
| Local | `npm run start-app` | `http://localhost:3000` |
| Ring | `npm run start-app-ring` | `http://ring:43000` |
| Production | `npm run build-prod` | `https://api.kingshill.cineworld-planner.co.uk:43000` |

These URLs are defined in `src/constants/constants.ts` rather than runtime environment variables.

## Verification and builds

Run the same quality gate used by GitHub Actions:

```sh
npm run verify-release
```

This cleans generated output, lints the TypeScript and Angular templates, builds the API, runs the unit tests once, and creates an optimized frontend build.

Useful individual commands:

| Command | Result |
| --- | --- |
| `npm run lint` | Lint application and server source. |
| `npm test` | Run the Vitest suite once. |
| `npm run watch-test` | Run tests in watch mode. |
| `npm run build-node` | Compile the API to `dist/node`. |
| `npm run build-prod` | Build static frontend files in `dist/cineworld-planner/browser`. |
| `npm run start-node` | Run the previously compiled API. |

## Deployment

Pushes and pull requests to `master` run `npm run verify-release` with Node 26 in GitHub Actions. They do not deploy the website or publish a container.

A version tag triggers the release workflow. It verifies the application, publishes the website to GitHub Pages, and pushes versioned and `latest` API images to Docker Hub. A separate GitHub Release page is not required.

Before the first release:

1. In the repository's **Settings → Pages**, set the source to **GitHub Actions**.
2. Add a repository Actions secret named `DOCKERHUB_TOKEN` containing a Docker Hub access token with permission to write `roaders/cineworldplanner`.
3. If the `github-pages` environment restricts deployment sources, allow tags matching `v*`.

### API container

Build the application before the image because the Dockerfile packages the compiled `dist/node` output:

```sh
npm run verify-release
docker build -t roaders/cineworldplanner:latest .
docker run --name cineworldplanner --rm \
  --read-only \
  --cap-drop=ALL \
  --security-opt=no-new-privileges \
  --pids-limit=100 \
  --memory=256m \
  --cpus=1 \
  -p 127.0.0.1:3000:3000 \
  roaders/cineworldplanner:latest
```

The image runs as the unprivileged `node` user. Keep the filesystem read-only, do not use `--privileged`, and do not mount host paths unless the service needs them. The loopback port binding prevents direct network access; a reverse proxy on the host can reach it locally.

To serve HTTPS, mount the certificate directory read-only and configure it:

```sh
docker run --name cineworldplanner --rm \
  --read-only \
  --cap-drop=ALL \
  --security-opt=no-new-privileges \
  --pids-limit=100 \
  --memory=256m \
  --cpus=1 \
  -p 127.0.0.1:3000:3000 \
  -e HTTPS_CERTIFICATES_PATH=/certificates \
  -v /path/to/certificates:/certificates:ro \
  roaders/cineworldplanner:latest
```

### Frontend

The release workflow publishes `dist/cineworld-planner/browser` to GitHub Pages. Until a custom domain is configured, the site is available at `https://roaders.github.io/cineworld-planner/`.

### Versioning

To publish a patch release from a clean `master` branch:

```sh
npm run release
```

This increments the patch version, creates the version commit and `vX.Y.Z` tag, and pushes them to `origin`. Pushing the tag starts the release workflow; normal branch pushes never deploy. The workflow rejects tags that are not on `master` or do not match the version in `package.json`.
