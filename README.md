# Faker Browser Extension

Faker is a browser extension that allows its users to regain control of their data by hosting their social network content on their own server. I was the tech lead on this project.

Using Faker, social networks will receive simple links that are only accessible by users of the Faker browser extension instead of your actualcontent, preventing tracking and profiling.

This is done transparently for the user, the extension will upload text, images or videos on demand to their server, and automatically load it when browsing the social network. Thus, the user can easily choose to delete content whenever they want as they have control of their own server.

**Note:** This is a research experiment and is not recommended for real-word usage yet.

<p align="center">
  <img src="./screenshot.webp" alt="screenshot of faker on linkedin" width="600"  />
</p>

## Specifications

See [Specifications](./specifications.md).

## Demo

[Video of Faker running on LinkedIn](./faker_demo.mp4) ([Youtube link](https://www.youtube.com/watch?v=UnMiL9gg_AY))

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

Build with hot-reload

```sh
npm run build:watch
```

### Run

#### Run with Docker

```sh
npm run build

docker compose --env-file default.env up
# or
npm run docker:up
```

To hot-reload on changes, run this in another terminal

```sh
npm run build:watch
```

#### Run with Node.js

```sh
npm start
```
