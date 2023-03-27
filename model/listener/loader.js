import fs from 'fs'
export default new class {
  async load () {
    // 加载监听事件
    let eventsPath = './plugins/yenai-plugin/model/listener/events'

    const events = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))
    for (let File of events) {
      try {
        await import(`./events/${File}`)
      } catch (e) {
        logger.mark(`监听事件错误：${File}`)
        logger.error(e)
      }
    }
  }
}()
