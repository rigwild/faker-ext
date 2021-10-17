// @ts-check

console.log('[Faker] Extension initialized!')

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
const delay = ms => new Promise(res => setTimeout(res, ms))

/**
 * @param {string} postContent
 * @returns {Promise<string>}
 */
const getContentExternalUri = async postContent => {
  const postSummary = postContent.length > 50 ? `${postContent.slice(0, 50)}...` : postContent
  console.log(`[Faker] Getting external link for post "${postSummary}"...`)
  await delay(Math.floor(Math.random() * 2000))
  const externalUri = `https://example.com/${Math.floor(Math.random() * 100000)}`
  console.log(`[Faker] Replacing post with external link ${externalUri}`)
  return externalUri
}

const transformPost = async () => {
  const textarea = document.querySelector('.editor-content > div > p')
  const postContent = textarea.textContent
  const contentExternalUri = await getContentExternalUri(postContent)
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
    const minWaitTimeMs = 300
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
