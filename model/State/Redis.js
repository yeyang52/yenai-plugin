import { formatDuration } from "../../tools/index.js"
import { getFileSize } from "./utils.js"
import { Config } from "../../components/index.js"
import os from "os"

// 全局变量存储连接数据（最近一小时，60分钟）
let connectionData = []

let connectionDataInterval = setInterval(async() => {
  try {
    const data = parseInfo(await redis.info("clients"))
    const timestamp = Date.now()

    // 添加新数据
    connectionData.push([ timestamp, data.Clients.connected_clients ])
    // console.log(connectionData)
    // 保持最近60分钟数据（一小时）
    if (connectionData.length > 60) {
      connectionData.shift()
    }
  } catch (error) {
    logger.error("收集Redis连接数据失败:", error)
    clearInterval(connectionDataInterval)
  }
}, 60 * 1000)

export default async function getRedisInfo(isPro) {
  const { showRedisInfo } = Config.state
  if (!showRedisInfo) return false
  if (showRedisInfo === "pro" && !isPro) return false
  try {
    let data = parseInfo(await redis.info())
    let maxmemory = await redis.configGet("maxmemory").then(res => +res.maxmemory)
    const { used_memory, used_memory_human, used_memory_peak_human } = data.Memory
    const { connected_clients, blocked_clients } = data.Clients
    const { total_connections_received, total_commands_processed } = data.Stats
    const { redis_version, process_id } = data.Server
    const memoryUsage = (used_memory / (maxmemory || os.totalmem()) * 100).toFixed(2) + "%"
    return {
      uptime: formatDuration(data.Server.uptime_in_seconds, "dd天 hh:mm:ss"),
      connectionData: JSON.stringify(connectionData),
      redis_version,
      process_id,
      memoryUsage,
      used_memory_peak_human,
      used_memory_human,
      connected_clients,
      blocked_clients,
      total_connections_received,
      total_commands_processed,
      Keyspace: data.Keyspace,
      maxmemory: maxmemory === 0 ? false : getFileSize(maxmemory)
    }
  } catch (error) {
    logger.error(error)
    return false
  }
}

function parseInfo(info) {
  const sections = {}
  let currentSection = null

  info.split("\r\n").forEach((line) => {
    if (line.startsWith("#")) {
      currentSection = line.slice(1).trim()
      sections[currentSection] = {}
    } else if (currentSection && line.includes(":")) {
      const [ key, value ] = line.split(":").map(s => s.trim())
      if (currentSection === "Keyspace") {
        sections[currentSection][key] = parseKeyspace(value)
      } else {
        sections[currentSection][key] = value
      }
    }
  })
  return sections
}

// 解析 Keyspace 信息的函数
function parseKeyspace(value) {
  const keyValuePairs = value.split(",")
  const keyspaceData = {}

  keyValuePairs.forEach(pair => {
    const [ key, val ] = pair.split("=").map(s => s.trim())
    keyspaceData[key] = val
  })

  return keyspaceData
}
