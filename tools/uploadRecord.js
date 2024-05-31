/* eslint-disable import/no-unresolved */
/* eslint-disable no-void */
import querystring from "querystring"
import fetch from "node-fetch"
import fs from "fs"
import path from "path"
import os from "os"
import crypto from "crypto"
import child_process from "child_process"
let errors = {}
let core = null
let Contactable = null

try {
  Contactable = (await import("icqq"))?.default
  core = (await import("icqq"))?.core
} catch (error) {
}

/**
 *
 * @param record_url
 * @param seconds
 * @param transcoding
 */
async function uploadRecord(record_url, seconds = 0, transcoding = true) {
  if (!Contactable) return segment.record(record_url)
  const result = await getPttBuffer(record_url, Bot.config.ffmpeg_path, transcoding)
  if (!result.buffer) {
    return false
  }
  let buf = result.buffer
  if (seconds == 0 && result.time) seconds = result.time.seconds
  const hash = (0, md5)(buf)
  const codec = String(buf.slice(0, 7)).includes("SILK") ? (transcoding ? 1 : 0) : 0
  const body = core.pb.encode({
    1: 3,
    2: 3,
    5: {
      1: Contactable.target,
      2: Bot.uin,
      3: 0,
      4: hash,
      5: buf.length,
      6: hash,
      7: 5,
      8: 9,
      9: 4,
      11: 0,
      10: Bot.apk.version,
      12: 1,
      13: 1,
      14: codec,
      15: 1
    }
  })
  const payload = await Bot.sendUni("PttStore.GroupPttUp", body)
  const rsp = core.pb.decode(payload)[5]
  rsp[2] && (0, errors.drop)(rsp[2], rsp[3])
  const ip = rsp[5]?.[0] || rsp[5]; const port = rsp[6]?.[0] || rsp[6]
  const ukey = rsp[7].toHex(); const filekey = rsp[11].toHex()
  const params = {
    ver: 4679,
    ukey,
    filekey,
    filesize: buf.length,
    bmd5: hash.toString("hex"),
    mType: "pttDu",
    voice_encodec: codec
  }
  const url = `http://${(0, int32ip2str)(ip)}:${port}/?` + querystring.stringify(params)
  const headers = {
    "User-Agent": `QQ/${Bot.apk.version} CFNetwork/1126`,
    "Net-Type": "Wifi"
  }
  await fetch(url, {
    method: "POST", // post请求
    headers,
    body: buf
  })
  // await axios.post(url, buf, { headers });

  const fid = rsp[11].toBuffer()
  const b = core.pb.encode({
    1: 4,
    2: Bot.uin,
    3: fid,
    4: hash,
    5: hash.toString("hex") + ".amr",
    6: seconds,
    11: 1,
    18: fid,
    19: seconds,
    30: Buffer.from([ 8, 0, 40, 0, 56, 0 ])
  })
  return {
    type: "record", file: "protobuf://" + Buffer.from(b).toString("base64")
  }
}

export default uploadRecord

/**
 *
 * @param file
 * @param ffmpeg
 * @param transcoding
 */
async function getPttBuffer(file, ffmpeg = "ffmpeg", transcoding = true) {
  let buffer
  let time
  if (file instanceof Buffer || file.startsWith("base64://")) {
    // Buffer或base64
    const buf = file instanceof Buffer ? file : Buffer.from(file.slice(9), "base64")
    const head = buf.slice(0, 7).toString()
    if (head.includes("SILK") || head.includes("AMR") || !transcoding) {
      const tmpfile = path.join(TMP_DIR, (0, uuid)())
      await fs.promises.writeFile(tmpfile, buf)
      let result = await getAudioTime(tmpfile, ffmpeg)
      if (result.code == 1) time = result.data
      fs.unlink(tmpfile, NOOP)
      buffer = buf
    } else {
      const tmpfile = path.join(TMP_DIR, (0, uuid)())
      let result = await getAudioTime(tmpfile, ffmpeg)
      if (result.code == 1) time = result.data
      await fs.promises.writeFile(tmpfile, buf)
      buffer = await audioTrans(tmpfile, ffmpeg)
    }
  } else if (file.startsWith("http://") || file.startsWith("https://")) {
    // 网络文件
    // const readable = (await axios.get(file, { responseType: "stream" })).data;
    try {
      const headers = {
        "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 12; MI 9 Build/SKQ1.211230.001)"
      }
      let response = await fetch(file, {
        method: "GET", // post请求
        headers
      })
      const buf = Buffer.from(await response.arrayBuffer())
      const tmpfile = path.join(TMP_DIR, (0, uuid)())
      await fs.promises.writeFile(tmpfile, buf)
      // await (0, pipeline)(readable.pipe(new DownloadTransform), fs.createWriteStream(tmpfile));
      const head = await read7Bytes(tmpfile)
      let result = await getAudioTime(tmpfile, ffmpeg)
      if (result.code == 1) time = result.data
      if (head.includes("SILK") || head.includes("AMR") || !transcoding) {
        // const buf = await fs.promises.readFile(tmpfile);
        fs.unlink(tmpfile, NOOP)
        buffer = buf
      } else {
        buffer = await audioTrans(tmpfile, ffmpeg)
      }
    } catch (err) {}
  } else {
    // 本地文件
    file = String(file).replace(/^file:\/{2}/, "")
    IS_WIN && file.startsWith("/") && (file = file.slice(1))
    const head = await read7Bytes(file)
    let result = await getAudioTime(file, ffmpeg)
    if (result.code == 1) time = result.data
    if (head.includes("SILK") || head.includes("AMR") || !transcoding) {
      buffer = await fs.promises.readFile(file)
    } else {
      buffer = await audioTrans(file, ffmpeg)
    }
  }
  return { buffer, time }
}

/**
 *
 * @param file
 * @param ffmpeg
 */
async function getAudioTime(file, ffmpeg = "ffmpeg") {
  return new Promise((resolve, _reject) => {
    (0, child_process.exec)(`${ffmpeg} -i "${file}"`, async(_error, _stdout, stderr) => {
      try {
        let time = stderr.split("Duration:")[1]?.split(",")[0].trim()
        let arr = time?.split(":")
        arr.reverse()
        let n = 1
        let s = 0
        for (let val of arr) {
          if (parseInt(val) > 0) s += parseInt(val) * n
          n *= 60
        }
        resolve({
          code: 1,
          data: {
            time,
            seconds: s,
            exec_text: stderr
          }
        })
      } catch {
        resolve({ code: -1 })
      }
    })
  })
}

/**
 *
 * @param file
 * @param ffmpeg
 */
async function audioTrans(file, ffmpeg = "ffmpeg") {
  return new Promise((resolve, reject) => {
    const tmpfile = path.join(TMP_DIR, (0, uuid)());
    (0, child_process.exec)(`${ffmpeg} -y -i "${file}" -ac 1 -ar 8000 -f amr "${tmpfile}"`, async(_error, _stdout, _stderr) => {
      try {
        const amr = await fs.promises.readFile(tmpfile)
        resolve(amr)
      } catch {
        reject(new core.ApiRejection(errors.ErrorCode.FFmpegPttTransError, "音频转码到amr失败，请确认你的ffmpeg可以处理此转换"))
      } finally {
        fs.unlink(tmpfile, NOOP)
      }
    })
  })
}

/**
 *
 * @param file
 */
async function read7Bytes(file) {
  const fd = await fs.promises.open(file, "r")
  const buf = (await fd.read(Buffer.alloc(7), 0, 7, 0)).buffer
  fd.close()
  return buf
}

/**
 *
 */
function uuid() {
  let hex = crypto.randomBytes(16).toString("hex")
  return hex.substr(0, 8) + "-" + hex.substr(8, 4) + "-" + hex.substr(12, 4) + "-" + hex.substr(16, 4) + "-" + hex.substr(20)
}

/**
 *
 * @param ip
 */
function int32ip2str(ip) {
  if (typeof ip === "string") { return ip }
  ip = ip & 0xffffffff
  return [
    ip & 0xff,
    (ip & 0xff00) >> 8,
    (ip & 0xff0000) >> 16,
    (ip & 0xff000000) >> 24 & 0xff
  ].join(".")
}

const IS_WIN = os.platform() === "win32"
/** 系统临时目录，用于临时存放下载的图片等内容 */
const TMP_DIR = os.tmpdir()

/** no operation */
const NOOP = () => { }

/**
 * md5 hash
 * @param data
 */
const md5 = (data) => (0, crypto.createHash)("md5").update(data).digest()

errors.LoginErrorCode = errors.drop = errors.ErrorCode = void 0
let ErrorCode;
(function(ErrorCode) {
  /** 客户端离线 */
  ErrorCode[ErrorCode.ClientNotOnline = -1] = "ClientNotOnline"
  /** 发包超时未收到服务器回应 */
  ErrorCode[ErrorCode.PacketTimeout = -2] = "PacketTimeout"
  /** 用户不存在 */
  ErrorCode[ErrorCode.UserNotExists = -10] = "UserNotExists"
  /** 群不存在(未加入) */
  ErrorCode[ErrorCode.GroupNotJoined = -20] = "GroupNotJoined"
  /** 群员不存在 */
  ErrorCode[ErrorCode.MemberNotExists = -30] = "MemberNotExists"
  /** 发消息时传入的参数不正确 */
  ErrorCode[ErrorCode.MessageBuilderError = -60] = "MessageBuilderError"
  /** 群消息被风控发送失败 */
  ErrorCode[ErrorCode.RiskMessageError = -70] = "RiskMessageError"
  /** 群消息有敏感词发送失败 */
  ErrorCode[ErrorCode.SensitiveWordsError = -80] = "SensitiveWordsError"
  /** 上传图片/文件/视频等数据超时 */
  ErrorCode[ErrorCode.HighwayTimeout = -110] = "HighwayTimeout"
  /** 上传图片/文件/视频等数据遇到网络错误 */
  ErrorCode[ErrorCode.HighwayNetworkError = -120] = "HighwayNetworkError"
  /** 没有上传通道 */
  ErrorCode[ErrorCode.NoUploadChannel = -130] = "NoUploadChannel"
  /** 不支持的file类型(没有流) */
  ErrorCode[ErrorCode.HighwayFileTypeError = -140] = "HighwayFileTypeError"
  /** 文件安全校验未通过不存在 */
  ErrorCode[ErrorCode.UnsafeFile = -150] = "UnsafeFile"
  /** 离线(私聊)文件不存在 */
  ErrorCode[ErrorCode.OfflineFileNotExists = -160] = "OfflineFileNotExists"
  /** 群文件不存在(无法转发) */
  ErrorCode[ErrorCode.GroupFileNotExists = -170] = "GroupFileNotExists"
  /** 获取视频中的图片失败 */
  ErrorCode[ErrorCode.FFmpegVideoThumbError = -210] = "FFmpegVideoThumbError"
  /** 音频转换失败 */
  ErrorCode[ErrorCode.FFmpegPttTransError = -220] = "FFmpegPttTransError"
})(ErrorCode = errors.ErrorCode || (errors.ErrorCode = {}))
const ErrorMessage = {
  [ErrorCode.UserNotExists]: "查无此人",
  [ErrorCode.GroupNotJoined]: "未加入的群",
  [ErrorCode.MemberNotExists]: "幽灵群员",
  [ErrorCode.RiskMessageError]: "群消息发送失败，可能被风控",
  [ErrorCode.SensitiveWordsError]: "群消息发送失败，请检查消息内容",
  10: "消息过长",
  34: "消息过长",
  120: "在该群被禁言",
  121: "AT全体剩余次数不足"
}
/**
 *
 * @param code
 * @param message
 */
function drop(code, message) {
  if (!message || !message.length) { message = ErrorMessage[code] }
  throw new core.ApiRejection(code, message)
}
errors.drop = drop
