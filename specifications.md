# Specifications

This document includes specifications for each components of the Faker extension.

## What is Faker

This project is an in-depth PoC allowing social networks users to reclaim control over their content.

When you post a comment on Facebook, its content is uploaded on Facebook's servers: you don't have control on it anymore. Faker proposes to give it back to you by intercepting the upload and replacing the actual content by a link to the data on your own self-hosted server.

For example, with Faker, Facebook will only receive the link to the content on your server instead of your text content: you are then the only owner of what you post.

Links are then replaced with the remote content when they are displayed on the webpage. You don't see any difference with a normal use of the social network.

## What we do not keep from the previous project and why

### Previously developed Extension

The previous implementation was trying to be generic by hooking directly on `<form>` tags. This is an interesting idea that would, in theory, work with any website.

The downside is that nowadays most webapp are using Single Page Applications (SPA) and do not rely on `<form>`. They instead listen to click events then send the result using the `fetch` API.

Thus, this would not work on these type of websites. Furthermore, Faker is aimed at the big Social Networks, which are now all using SPAs, and it would not work.

We then do not keep the previous developed extension.

### Previously developed Storage self-hosted server

The server code is quite minimal. We could keep it but the team is better-versed in Node.js than Python so it is a natural choice to quickly rewrite it in TypeScript.

### Previously developed Demo Instagram Service

We settled on first focusing on LinkedIn directly. We do not keep the demo Instagram service because we want the plugin to work on a real social network to prove the concept.

We chose LinkedIn for educational/professional purposes; it is not as intrusive as facebook or another personal social network.

## Extension

As mentioned in the [What we do not keep from the previous project and why](#what-we-do-not-keep-from-the-previous-project-and-why) section, webapp are now working as SPAs with the data sent using `fetch` instead of `<form>` submits. This means that a generic approach cannot work.

We have to develop **specific code for each of the social networks**.

To control who can add or remove posts from the [Storage self-hosted server](#storage-self-hosted-server), a user-configured user/password will be included in each of these requests to authenticate.
If another Faker users tries to do these operations with an invalid user/password combination, the operation will be rejected.

### Tech Stack

The extension is developed in TypeScript. Its configuration page is using [petite-vue](https://github.com/vuejs/petite-vue).

### Configuration

The extension lets the user configure the URI to its [Storage self-hosted server](#storage-self-hosted-server) and its configured user/password combination.

It also let the user enable/disable the extension for each of the social networks.

### Post publish

1. Add an event listener on the post `Publish` button that will fire before the original click handler (see [`EventTarget.addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) `useCapture` parameter that registers an event listener before it bubbling up to the next already-registered DOM listeners, and `once` for a one-time fired event listener)
2. Copy the content of the `<textarea>` containing the future post
3. Upload the post content to the [Storage self-hosted server](#storage-self-hosted-server) with credentials which returns its content URI
4. Replace the posts's content with the URI
5. Click the publish button (the faker event listener is destroyed after 1 usage so it won't trigger it again)

### Post render

1. Periodically check the page content for new posts containing a header indicating the post is a Faker-handled post.
2. Fetch the content using the uri included in the post
3. Replace the post with the retrieved content
4. Show on the post that is was pulled from a Faker server

### Other tested methods

#### Intercept and modify the body of posts publish requests

The extension would play the role of a MITM (man in the middle) between the user and the social network. This would have the benefit of being quite generic, we would only have to specifiy the path of the content of the post in the body in the request and the API route to intercept.

The problem is that browser extension are not allowed to inspect **then** edit the body of a request before it being sent to the destination server. They can only edit the headers.

A trick was tried:

1. Copy the request headers and body (including cookies)
2. Abort the request
3. Send a new request from the extension with the body modified and cookies included

This works and the post is successfully created. The issue is that, because the initial request was aborted, an error is show on the frontend. We could fix this by modifying the request's response but it is not permitted for browser extensions.

## Storage self-hosted server

The server stores the content the user posts on a social network (posts and comments), and returns a link to retrieve it.

### Tech Stack

The server is developed in TypeScript with [Express](https://expressjs.com/). The used database is PostgreSQL.

### API

TODO
