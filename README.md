# Faker Extension

A browser extension to host your social network content externally.

LinkedIn will be focused first as a proof of concept.

## Specifications

See [Specifications.md](./specifications.md).

## Supported Social Networks

- LinkedIn
  - [x] Post
  - [ ] Image
- Facebook
  - [ ] Post
  - [ ] Image
- Twitter
  - [ ] Post
  - [ ] Image
- Instagram
  - [ ] Image
- Reddit
  - [ ] Post
  - [ ] Image

## Browser Extension

### Install dependencies

```sh
pnpm install
```

### Build

```sh
pnpm build
```

Automatically rebuild on changes

```sh
pnpm build:watch
```

**Note** You still need to reload the extension in your browser.

### Browser install

1. Head over to `chrome://extensions`
1. Toggle "Developper mode" on
1. Click "Load unpacked" and select the generated `extension/dist` directory

Faker is now installed and working!

## Self-hosted server

```sh
docker compose up --env-file default.env
```

### Install dependencies

Prerequisites:

- [Node.js](https://nodejs.org/) v14+

```sh
pnpm install
```

### Build

```sh
pnpm build
```

### Run

```sh
pnpm start
```

### Run in devlopment mode

Running with hot-reload support

```sh
pnpm dev
```

## TODO

- Browser Extension
  - [x] Replace post content with link to an external provider
  - [ ] Load post content from external provider
- External Provider
  - Self-hosted server
    - [x] Post
    - [ ] Image
  - [ ] IPFS
