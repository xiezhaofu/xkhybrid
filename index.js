(function () {
  if (window.Xk) {
    return
  }
  const receiveMessageQueue = []
  const messageHandlers = {}
  const responseCallbacks = {}
  let uniqueId = 1

  const doc = document
  const readyEvent = doc.createEvent('Events')
  readyEvent.initEvent('XkReady')
  readyEvent.bridge = window.Xk
  doc.dispatchEvent(readyEvent)

  // function init(messageHandler) {
  //     if (Xk._messageHandler) {
  //         throw new Error('Xk.init called twice');
  //     }
  //     Xk._messageHandler = messageHandler;
  //     var receivedMessages = receiveMessageQueue;
  //     receiveMessageQueue = null;
  //     for (var i = 0; i < receivedMessages.length; i++) {
  //         _dispatchMessageFromNative(receivedMessages[i])
  //     }
  // }

  // function send(responseCallback) {
  //     callHandler('send', {}, responseCallback)
  //     //_doSend('jsbridge', 'send', data = {}, responseCallback)
  // }

  // 计算表达式的值
  function evil (fn) {
    var Fn = Function // 一个变量指向Function，防止有些前端编译工具报错
    return new Fn('return ' + fn)()
  }

  function registerHandler (handlerName, handler) {
    messageHandlers[handlerName] = handler
  }

  function callHandler (handlerName, data, responseCallback) {
    _doSend('jsbridge', handlerName, data, responseCallback)
  }

  function callHandlerWithModule (moduleName, handlerName, data, responseCallback) {
    _doSend(moduleName, handlerName, data, responseCallback)
  }

  function _doSend (moduleName, handlerName, message, responseCallback) {
    let callbackId
    if (typeof responseCallback === 'string') {
      callbackId = responseCallback
    } else if (responseCallback) {
      callbackId = 'cb_' + (uniqueId++) + '_' + new Date().getTime()
      responseCallbacks[callbackId] = responseCallback
    } else {
      callbackId = ''
    }
    let evalStr1 = 'window.' + moduleName + '.'
    try {
      if (moduleName === 'jsbridge' && handlerName !== 'response') {
        evalStr1 += 'handler'
      } else {
        evalStr1 += handlerName
      }
    } catch (e) {
      console.log(e)
    }
    const fn = evil(evalStr1) // JSON.parse(evalStr1) // eval(evalStr1)
    if (typeof fn === 'function') {
      const evalStr = 'window.' + moduleName
      const fnWindow = evil(evalStr) // JSON.parse(evalStr) // eval(evalStr)
      let responseData
      if (moduleName === 'jsbridge' && handlerName !== 'response') {
        responseData = fn.call(fnWindow, handlerName, JSON.stringify(message), callbackId)
      } else {
        responseData = fn.call(fnWindow, JSON.stringify(message), callbackId)
      }
      if (responseData) {
        responseCallback = responseCallbacks[callbackId]
        if (!responseCallback) {
          return
        }
        responseCallback(JSON.parse(responseData))
        delete responseCallbacks[callbackId]
      }
    }
  }

  function _dispatchMessageFromNative (messageJSON) {
    setTimeout(function () {
      const message = JSON.parse(messageJSON)
      let responseCallback
      if (message.responseId) {
        responseCallback = responseCallbacks[message.responseId]
        if (!responseCallback) {
          return
        }
        responseCallback(JSON.parse(message.responseData))
        delete responseCallbacks[message.responseId]
      } else {
        if (message.callbackId) {
          var callbackResponseId = message.callbackId
          responseCallback = function (responseData) {
            _doSend('jsbridge', 'response', responseData, callbackResponseId)
          }
        }
        let handler = Xk._messageHandler
        if (message.handlerName) {
          handler = messageHandlers[message.handlerName]
        }
        try {
          handler(JSON.parse(message.data), responseCallback)
        } catch (exception) {
          if (typeof console !== 'undefined') {
            console.log('Xk: WARNING: javascript handler threw.', message, exception)
          }
        }
      }
    })
  }

  function _handleMessageFromNative (messageJSON) {
    if (receiveMessageQueue) {
      receiveMessageQueue.push(messageJSON)
    }
    _dispatchMessageFromNative(messageJSON)
  }

  function connectXk (callback) {
    if (window.Xk) {
      callback(Xk)
    } else {
      document.addEventListener(
        'XkReady',
        function () {
          callback(Xk)
        },
        false
      )
    }
  }

  function close () { // 关闭安卓浏览器
    callHandler('close', {}, null)
  }

  function getLocation (responseCallback) { // 获取安卓定位
    callHandler('getLocation', {}, responseCallback)
  }

  function share (shareJson = {}, responseCallback) {
    // 调用安卓分享
    callHandler('share', shareJson, responseCallback)
  }

  function getVersion (responseCallback) { // 获取版本号
    callHandler('getVersion', {}, responseCallback)
  }

  function getStatusBarHeight (responseCallback) {
    // 获取app顶上的距离
    callHandler('getStatusBarHeight', {}, responseCallback)
  }

  function checkUpdate () {
    // 检查更新
    callHandler('checkUpdate', {}, null)
  }

  function go (url) {
    // 调用安卓新开页面
    callHandler('go', {
      action: url
    }, null)
  }

  function refreshToken (responseCallback) {
    callHandler('refreshToken', {}, responseCallback)
  }

  function getToken (responseCallback) {
    callHandler('getToken', {}, responseCallback)
  }

  function setToolbar (data = {}) {
    callHandler('setToolbar', data, null)
  }

  function reqCamera (responseCallback) {
    callHandler('reqCamera', {}, responseCallback)
  }

  function authentication (url = '') {
    callHandler('authentication', { redirect: url }, null)
  }

  function setStatusBar (data = {}) {
    callHandler('setStatusBar', data, null)
  }

  const Xk = window.Xk = {
    register: registerHandler,
    call: callHandler,
    callModule: callHandlerWithModule,
    _handleMessageFromNative: _handleMessageFromNative,
    init: connectXk,
    close: close,
    getLocation: getLocation,
    share: share,
    go: go,
    getVersion: getVersion,
    checkUpdate: checkUpdate,
    refreshToken: refreshToken,
    getToken: getToken,
    setToolbar: setToolbar,
    setStatusBar: setStatusBar,
    reqCamera: reqCamera,
    getStatusBarHeight: getStatusBarHeight,
    authentication: authentication
  }
})()
