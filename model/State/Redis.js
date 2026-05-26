import { formatDuration } from "../../tools/index.js"
import { getFileSize } from "./utils.js"
import { Config, Log_Prefix } from "../../components/index.js"
import os from "os"

// 全局变量存储连接数据（最近一小时，60分钟）
let connectionData = []
const REDIS_PERFIX = `${Log_Prefix}[Steat][Redis]`

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
    logger.error(`${REDIS_PERFIX} 收集Redis连接数据失败:`, error)
    clearInterval(connectionDataInterval)
  }
}, 60 * 1000)

export default async function getRedisInfo(isPro) {
  const { showRedisInfo } = Config.state
  if (!showRedisInfo) return false
  if (showRedisInfo === "pro" && !isPro) return false

  try {
    // 并行执行两个独立的 Redis 操作以提升性能
    const [ infoResult, maxmemoryConfig ] = await Promise.all([
      redis.info(),
      redis.configGet("maxmemory")
    ])

    let data = parseInfo(infoResult)
    let maxmemory = +maxmemoryConfig.maxmemory

    // 防御性检查：确保必要的数据结构存在
    if (!data.Memory || !data.Clients || !data.Stats || !data.Server) {
      logger.error(`${REDIS_PERFIX} Redis info 数据格式异常`)
      return false
    }

    const { used_memory, used_memory_human, used_memory_peak_human } = data.Memory
    const { connected_clients, blocked_clients } = data.Clients
    const { total_connections_received, total_commands_processed } = data.Stats
    const { redis_version, process_id } = data.Server

    // 改进除零处理：仅当 maxmemory 为 0 时使用系统总内存
    const effectiveMaxMemory = maxmemory > 0 ? maxmemory : os.totalmem()
    const memoryUsage = (used_memory / effectiveMaxMemory * 100).toFixed(2) + "%"

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
    logger.error(`${REDIS_PERFIX} 获取 Redis 信息失败:`, error)
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
