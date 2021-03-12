
export default function getUrl (data = {}) {
  let dataStr = '' // 数据拼接字符串
  let dataStrs = ''
  Object.keys(data).forEach(key => {
    if (data[key] !== '') {
      dataStr += key + '=' + data[key] + '&'
    }/*  else {
      id = data[key]
    }
    dataStr += key + '=' + data[key] + '&' */
  })
  if (dataStr !== '') {
    dataStrs = '?' + dataStr.substring(0, dataStr.lastIndexOf('&'))
  }
  return dataStrs
}
