# Faker Extension

A browser extension to host your social network content externally.

LinkedIn will be focused first as a proof of concept.

## Specifications

See [Specifications.md](./specifications.md).

## Supported Social Networks

- LinkedIn
  - [x] Post
  - [x] Image
  - [x] Video
- Facebook
  - [x] Post
  - [ ] Image
  - [ ] Video
- Twitter
  - [ ] Post
  - [ ] Image
  - [ ] Video
- Instagram
  - [ ] Image
  - [ ] Video
- Reddit
  - [ ] Post
  - [ ] Image
  - [ ] Video

## Browser Extension

```sh
cd extension
```

### Install dependencies

```sh
npm i -D
```

### Build

**MacOS & Linux**

```sh
npm run build
```

Automatically rebuild on changes

```sh
npm run dev
```

**Note** You still need to reload the extension in your browser.

**Windows**

Execute with git bash (from extension directory)

```sh
cd extension
./win.sh
```

### Browser install

1. Head over to `chrome://extensions`
2. Toggle "Developper mode" on
3. Click "Load unpacked" and select the generated `extension/dist` directory

Faker is now installed and working!

## Self-hosted server

```sh
cd server
```

### Run with Docker

```sh
docker compose --env-file default.env up
```

To hot-reload on changes, run this in another terminal.

```sh
npm run build:watch
```

### Install dependencies

Prerequisites:

- [Node.js](https://nodejs.org/) v14+

```sh
npm i -D
```

### Build

```sh
npm run build
```

### Run

```sh
npm start
```

### Run in development mode

Running with hot-reload support

```sh
npm run dev
```

## TODO

- Browser Extension
  - [x] Replace post content with link to an external provider
  - [x] Load post content from external provider
  - [x] Configure the extension options
  - [x] Render a link as a QR code image
  - [x] Render a link as a QR code video
- External Provider
  - Self-hosted server
    - [x] Post
    - [x] Image
    - [x] Video
  - [ ] IPFS
