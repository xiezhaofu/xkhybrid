export default function setPrice (price, num) {
  let money = price// 金额

  if (money !== '' && money.substr(0, 1) === '.') {
    money = ''
  }
  money = money.replace(/^0*(0\.|[1-9])/, '$1')// 粘贴不生效
  money = money.replace(/[^\d.]/g, '') // 清除“数字”和“.”以外的字符
  money = money.replace(/\.{2,}/g, '.') // 只保留第一个. 清除多余的
  money = money.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
  money = money.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')// 只能输入两个小数
  if (money.indexOf('.') < 0 && money !== '') { // 以上已经过滤，若无小数点，首位不能为类似于 01、02的金额
    if (money.substr(0, 1) === '0' && money.length === 2) {
      money = money.substr(1, money.length)
    }
    if (num && money.length > num) {
      money = money.substring(0, num)
    }
  } else if (num && money.substring(0, money.indexOf('.')).length > num) {
    money = money.substring(0, money.indexOf('.')).substring(0, num)
  }

  return money
}
