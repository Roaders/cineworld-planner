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

Pushes and pull requests to `master` run `npm run verify-release` with Node 26 in GitHub Actions.

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

`npm run build-release` has an external side effect: after verification it builds both `latest` and versioned image tags and pushes all tags to Docker Hub. Only run it when authenticated and intending to publish.

### Frontend

Run `npm run build-prod`, then publish the contents of `dist/cineworld-planner/browser` to the static web host.

A legacy FTP uploader remains available through `npm run run-release` and reads `FTP_HOST`, `FTP_USER`, and `FTP_PASSWORD`. It predates the current Angular output layout, so review its destination and paths before using it.

### Versioning

`npm run push` increments the patch version, creates the corresponding Git commit and tag, and pushes the branch and tags to `origin`. Run it only when the release is ready to publish.
