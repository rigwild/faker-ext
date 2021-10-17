// @ts-check

const fakerServerEndpoint = 'http://localhost:3000'

console.log('[Faker] Extension initialized!')

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
const delay = ms => new Promise(res => setTimeout(res, ms))

/**
 * @param {string} content
 * @returns {Promise<string>}
 */
const getContentExternalUri = async content => {
  const summary = content.length > 50 ? `${content.slice(0, 50)}...` : content
  console.log(`[Faker] Getting external link for post "${summary}"...`)

  const res = await fetch(`${fakerServerEndpoint}/api/upload`, {
    method: 'POST',
    body: JSON.stringify({ content }),
    headers: {
      'User-Agent': 'faker-ext v0.1',
      'Content-Type': 'application/json'
    }
  })
  const resJson = await res.json()
  if (!res.ok) throw new Error(resJson.message)

  const { externalUri } = resJson
  const fullExternalUri = `${fakerServerEndpoint}${externalUri}`
  console.log(`[Faker] Replacing post with external link ${fullExternalUri}`)
  return fullExternalUri
}

const transformPost = async () => {
  const textarea = document.querySelector('.editor-content > div > p')
  const content = textarea.textContent
  const contentExternalUri = await getContentExternalUri(content)
  textarea.textContent = contentExternalUri
}

/** @returns {HTMLButtonElement} */
const getPostBtn = () => document.querySelector('.share-actions__primary-action')

/** Lock to not re-register the click event handler if the post is currently being replaced */
let isPostingLock = false

/** @param {Event} e */
const postBtnEventHandler = async e => {
  try {
    isPostingLock = true

    // Prevent subsequent click event listeners from being triggered
    e.stopImmediatePropagation()

    console.log('[Faker] Editing post content')
    await transformPost()

    // Minimum time to wait after replace (if the post content replace is done too soon before
    // posting, the replace will not be taken into account!)
    const minWaitTimeMs = 500
    await delay(minWaitTimeMs)

    console.log('[Faker] Publishing replaced post')
    getPostBtn().click()
  } catch (error) {
    error.message = `[Faker] Failed to replace post content - ${error.message}`
    throw error
  } finally {
    isPostingLock = false
  }
}

setInterval(() => {
  const postBtn = getPostBtn()
  if (!isPostingLock && postBtn) {
    postBtn.addEventListener('click', postBtnEventHandler, { capture: true, once: true })
  }
}, 1000)
