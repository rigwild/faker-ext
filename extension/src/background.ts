import { loadConfiguration, chrome } from './config'
import { dataURLtoFile, uploadMediaToServer, uploadTextPostToServer } from './utils'

function sendMessage(tab: { id: number }, message: any): Promise<any> {
  return new Promise(resolve => chrome.tabs.sendMessage(tab.id, message, (response: any) => resolve(response)))
}

async function contextMenuReplaceTextHandler(
  info: Record<string, any> & { editable: boolean; pageUrl: string; selectionText: string },
  tab: Record<string, any> & { id: number }
) {
  // Upload the selected text only if the element is editable (an input/textarea)
  if (info.editable && info.selectionText) {
    await sendMessage(tab, { action: 'UPLOAD_TEXT_POST_START' })
    const fullExternalUri = await uploadTextPostToServer(info.selectionText, new URL(info.pageUrl))
    await sendMessage(tab, { action: 'UPLOAD_TEXT_POST_END', fullExternalUri })
  }
}

async function contextMenuUploadFileHandler(
  info: Record<string, any> & { editable: boolean; pageUrl: string; selectionText: string },
  tab: Record<string, any> & { id: number }
) {
  await sendMessage(tab, { action: 'LISTEN_FOR_FILE_UPLOAD' })
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Faker] Message from the content script:', message)
  if (message?.action === 'ASK_UPLOAD_FILE') {
    const file = dataURLtoFile(message.fileBase64, 'file.png')
    uploadMediaToServer(file, message.websiteUrl).then(fullExternalUri => sendResponse(fullExternalUri))
    // Opt-in to answer asynchronously
    return true
  } else {
    sendResponse({ error: 'Unknown action' })
  }
})

loadConfiguration().then(() => {
  chrome.contextMenus.create({
    title: 'Replace text using Faker',
    contexts: ['editable'],
    onclick: contextMenuReplaceTextHandler
  })

  chrome.contextMenus.create({
    title: 'Upload a file using Faker',
    contexts: ['all'],
    onclick: contextMenuUploadFileHandler
  })
})
