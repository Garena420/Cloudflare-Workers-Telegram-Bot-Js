const TOKEN = "bot token"
const WEBHOOK = '/endpoint'
const SECRET = "Garena_420" 

addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (url.pathname === WEBHOOK) {
    event.respondWith(handleWebhook(event))
  } else if (url.pathname === '/registerWebhook') {
    event.respondWith(registerWebhook(event, url, WEBHOOK, SECRET))
  } else if (url.pathname === '/unRegisterWebhook') {
    event.respondWith(unRegisterWebhook(event))
  } else {
    event.respondWith(new Response('Not Available'))
  }
})

async function handleWebhook (event) {
  if (event.request.headers.get('X-Telegram-Bot-Api-Secret-Token') 
  !== SECRET) {
    return new Response('Unauthorized', { status: 403 })
  }
  const update = await event.request.json()
  event.waitUntil(onUpdate(update))
  return new Response('Ok')
}

async function onUpdate (update) {
  if ('message' in update) {
    await onMessage(update.message)
  }
}

async function onMessage (message) {
    return sendPlainTextWithReply(message.chat.id,
     'Your Message:' +message.text ,message.message_id)
}

async function sendPlainTextWithReply (chatId, 
text,reply_to_message_id) {
    return (await fetch(apiUrl('sendMessage', {
      chat_id: chatId,
      reply_to_message_id:reply_to_message_id,
      text
    }))).json()
 }
 
async function sendPlainText (chatId, text) {
    return (await fetch(apiUrl('sendMessage', {
      chat_id: chatId,
      text
    }))).json()
}


async function editPlainText (chatId, msg_id,text) {
    return (await fetch(apiUrl('editMessageText', {
      chat_id:chatId,
      message_id:msg_id,
      text
    }))).json()
}

async function registerWebhook (event, requestUrl, 
suffix, secret) {
  const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`
  const r = await (await fetch(apiUrl('setWebhook', 
  { url: webhookUrl, secret_token: secret }))).json()
  return new Response('done' in r && r.ok 
  ? 'Done' : JSON.stringify(r, null, 2))
}

async function unRegisterWebhook (event) {
  const r = await (await fetch(apiUrl('setWebhook',
   { url: '' }))).json()
  return new Response('done' in r && r.ok 
  ? 'Done' : JSON.stringify(r, null, 2))
}

function apiUrl (methodName, params = null) {
  let query = ''
  if (params) {
    query = '?' + new URLSearchParams(params).toString()
  }
  return `https://api.telegram.org/bot${TOKEN}/${methodName}${query}`
}
