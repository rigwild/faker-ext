# Faker Extension

A browser extension to host your social network content externally.

LinkedIn will be focused first as a proof of concept.

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

### Install

1. Head over to [chrome://extensions](chrome://extensions)
1. Toggle "Developper mode" on
1. Click "Load unpacked" and select the [extension](./extension) directory

Faker is now installed and working!

## Self-hosted server

### Install

Prerequisites:

- [Node.js](https://nodejs.org/) v14+

```sh
pnpm install
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
