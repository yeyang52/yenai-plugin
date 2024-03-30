// 直接回复错误类型
global.ReplyError = class ReplyError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ReplyError'
  }
}

throw new ReplyError('a')
