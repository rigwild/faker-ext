import { chrome } from './config'

let selectionObj: Selection = null
let selectionEle: Element = null

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

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Message from the background script:', request)
  if (request?.action === 'UPLOAD_START') {
    // TODO: Apply global loading screen
    console.log('LOADING SCREEN START')

    selectionObj = window.getSelection()
    selectionEle = document.activeElement
    sendResponse()
  } else if (request?.action === 'UPLOAD_END') {
    // TODO: Stop global loading screen
    console.log('LOADING SCREEN STOP')

    // Replace selected text with URI
    replaceSelectionWithStr(request.fullExternalUri)
    sendResponse()
  } else {
    sendResponse({ error: 'Unknown action' })
  }
})
