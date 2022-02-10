import 'qrjs2'
import { chrome } from '../config'
import { filetoBase64, generateQRCode, loadingSvg, QRCodeGenerator } from '../utils'

let selectionObj: Selection = null
let selectionEle: Element = null

// Should we watch for new file inputs?
let monitorFileInputs = false
// Are we currently uploading a file? (to prevent multiple uploads)
let isUploadingFileLock = false

const QRCode = (window as any).QRCode as QRCodeGenerator

function sendMessage(message: any): Promise<any> {
  return new Promise(resolve => chrome.runtime.sendMessage(message, {}, (response: any) => resolve(response)))
}

/**
 * Replace the selected text with the given text
 *
 * Supports custom editable elements (like paragraphs) and input/textarea elements
 * @param str New text to replace the selected text with
 */
function replaceSelectionWithStr(str: string) {
  // Check if the element is an input/textarea
  // (the Selection API doesn't work on inputs/textareas)
  // See https://stackoverflow.com/a/20427804
  if ((selectionEle as any).value !== undefined) {
    const ele = selectionEle as HTMLInputElement
    ele.value = ele.value.slice(0, ele.selectionStart) + str + ele.value.slice(ele.selectionEnd)
  }
  // Element is not an input/textarea, but is editable using the Selection API
  else {
    const newNode = document.createTextNode(str)

    // Remove currently selected text
    selectionObj.deleteFromDocument()

    // Insert new text
    const range = selectionObj.getRangeAt(0)
    range.insertNode(newNode)

    // Move the cursor to the end of the inserted text
    selectionObj.collapse(newNode, 1)
  }
}

/**
 * Hook a file input element to upload the selected file to the self-hosted server
 * before it is submitted then send a QR code image pointing to the uploaded file URI
 * to the input element instead
 * @param e Event
 */
async function fileInputHookHandler(e: Event): Promise<void> {
  if (isUploadingFileLock) {
    console.log('[Faker] Uploading file is locked')
    return
  }
  if (!monitorFileInputs) {
    console.log('[Faker] File input hook disabled')
    return
  }

  const ele = e.target as HTMLInputElement
  // Prevent subsequent change event listeners from being triggered
  e.stopImmediatePropagation()
  console.log('[Faker] Intercepting a file upload')

  const file = ele.files[0]
  if (!file) return

  // Upload the media to the self-hosted server and get its URI
  isUploadingFileLock = true
  const fullExternalUri: string = await sendMessage({
    action: 'ASK_UPLOAD_FILE',
    fileBase64: await filetoBase64(file), // File is not auto-serializable
    websiteUrl: new URL(location.href)
  })

  const qrCode = generateQRCode(QRCode, fullExternalUri)
  console.log(`[Faker] External link generated by the server for media: ${fullExternalUri}`)

  // Replacing the file with `ele.files[0]` is not possible as FileList is read-only
  const newFilesKey = new DataTransfer()
  newFilesKey.items.add(qrCode)
  ele.files = newFilesKey.files

  isUploadingFileLock = false
  ele.dispatchEvent(e)
}

function showWaitingForUploadOverlay() {
  const overlay = document.createElement('div')
  overlay.id = 'faker-listening-for-upload-overlay'
  overlay.innerHTML = `
    <div style="
        z-index: 999;
        position: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        bottom: 40px;
        right: 50px;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 16px;
        background-color: #4158D0;
        background-image: linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);
        padding: 5px 10px 5px 0px;
        border-radius: 50px;
        box-shadow: rgb(0 0 0 / 35%) 0px 5px 15px;
        opacity: 0.9;
      "
    >
      ${loadingSvg}
      <span>Faker is listening for file uploads... </span>
      <button id="faker-listening-for-upload-overlay-stop-button" style=" 
          font-family: Arial, sans-serif;
          font-size: 12px;
          padding: 7px 10px;
          margin-left: 20px;
          border-radius: 50px;
          border: none;
          box-shadow: rgb(0 0 0 / 35%) 0px 2px 5px;
          cursor: pointer;
          background: #ffffff;
        "
      >
        Stop
      </button>
    </div>
  `.replace(/\n/g, '')

  const svg = overlay.querySelector('svg')
  svg.style.width = '40px'
  svg.style.height = '40px'
  svg.style.margin = '0 10px'

  overlay.querySelector('button').addEventListener('click', e => {
    monitorFileInputs = false
    console.log('[Faker] Stopped the file uploads listener')
    overlay.remove()
  })
  document.body.appendChild(overlay)
}

// We periodically check for new file input elements as some website like LinkedIn
// create the input element dynamically
// We don't care about adding multiple listeners to the same element as when the same
// listener (function) is already applied to an element, it will not be added by the browser
setInterval(() => {
  if (monitorFileInputs && !isUploadingFileLock) {
    // console.log(document.querySelectorAll('input[type="file"]'))
    document.querySelectorAll('input[type="file"]').forEach((ele: HTMLInputElement) => {
      ele.addEventListener('change', fileInputHookHandler, {
        capture: true,
        once: true
      })
    })
  }
}, 500)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[Faker] Message from the background script:', message)
  if (message?.action === 'UPLOAD_TEXT_POST_START') {
    // TODO: Apply global loading screen
    console.log('[Faker] LOADING SCREEN START')

    selectionObj = window.getSelection()
    selectionEle = document.activeElement
    sendResponse()
  } else if (message?.action === 'UPLOAD_TEXT_POST_END') {
    // TODO: Stop global loading screen
    console.log('[Faker] LOADING SCREEN STOP')

    // Replace selected text with URI
    replaceSelectionWithStr(message.fullExternalUri)
    sendResponse()
  } else if (message?.action === 'LISTEN_FOR_FILE_UPLOAD') {
    if (!monitorFileInputs) {
      monitorFileInputs = true
      console.log('[Faker] Listening for file uploads')
      showWaitingForUploadOverlay()
    }
    sendResponse()
  } else {
    sendResponse({ error: 'Unknown action' })
  }
})
