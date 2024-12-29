import { formatDuration } from "../../tools/index.js"
import { Config } from "../../components/index.js"
export default async function getRedisInfo(isPro) {
  const { showRedisInfo } = Config.state
  if (!showRedisInfo) return false
  if (showRedisInfo === "pro" && !isPro) return false
  try {
    let data = parseInfo(await redis.info())
    const { used_memory_human, used_memory_peak_human, used_memory_lua_human } = data.Memory
    const { connected_clients } = data.Clients
    const { total_connections_received, total_commands_processed } = data.Stats
    return {
      uptime: formatDuration(data.Server.uptime_in_seconds, "dd天hh小时mm分", false),
      used_memory_human,
      used_memory_peak_human,
      used_memory_lua_human,
      connected_clients,
      total_connections_received,
      total_commands_processed,
      Keyspace: data.Keyspace
    }
  } catch (error) {
    logger.log(error)
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
