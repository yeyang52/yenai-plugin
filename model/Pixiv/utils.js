import moment from 'moment'

export function timeToSeconds (time) {
  let seconds = 0
  let timeArray = time.split(' ')
  for (let i = 0; i < timeArray.length; i++) {
    let unit = timeArray[i].charAt(timeArray[i].length - 1)
    let value = parseInt(timeArray[i].substring(0, timeArray[i].length - 1))
    switch (unit) {
      case 's':
        seconds += value
        break
      case 'm':
        seconds += value * 60
        break
      case 'h':
        seconds += value * 60 * 60
        break
      case 'd':
        seconds += value * 60 * 60 * 24
        break
      default:
        break
    }
  }
  return seconds
}

export function getNoonTomorrow () {
  const now = moment() // 获取当前时间
  const noonToday = moment().startOf('day').add(12, 'hours') // 获取今天中午12点的时间
  const noonTomorrow = moment().add(1, 'day').startOf('day').add(12, 'hours') // 获取明天中午12点的时间
  let time = now < noonToday
    ? noonToday.diff(now, 'hours')
    : noonTomorrow.diff(now, 'hours')
  if (time > 12) time = 12
  return time + 'h'
}
