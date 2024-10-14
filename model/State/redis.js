import { formatDuration } from "../../tools/index.js"
import { getFileSize } from "./utils.js"

export default async function getRedisInfo(isPro) {
  if (!isPro) return false
  try {
    let data = parseInfo(await redis.info())
    const { used_memory_human, used_memory_peak_human, used_memory_lua_human, used_memory_dataset } = data.Memory
    const { connected_clients } = data.Clients
    const { total_connections_received, total_commands_processed } = data.Stats
    let res = [
      {
        first: "redis已用内存",
        tail: used_memory_human
      },
      {
        first: "redis内存占用峰值",
        tail: used_memory_peak_human
      },
      {
        first: "redisLua占用内存",
        tail: used_memory_lua_human
      },
      {
        first: "redis数据集大小",
        tail: getFileSize(used_memory_dataset)
      },
      {
        first: "redis客户端连接数",
        tail: connected_clients
      },
      {
        first: "redis历史连接数",
        tail: total_connections_received
      },
      {
        first: "redis历史命令数",
        tail: total_commands_processed
      }
    ]
    for (const key in data.Keyspace) {
      res.push({
        first: key,
        tail: data.Keyspace[key].replace(/,/g, " ")
      })
    }
    return {
      uptime: formatDuration(data.Server.uptime_in_seconds, "dd天hh小时mm分", false),
      data: res
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
      //   if (currentSection === "Keyspace") {
      //     sections[currentSection][key] = parseKeyspace(value)
      //   } else {
      //     sections[currentSection][key] = value
      //   }
      sections[currentSection][key] = value
    }
  })
  return sections
}

// // 解析 Keyspace 信息的函数
// function parseKeyspace(value) {
//   const keyValuePairs = value.split(",")
//   const keyspaceData = {}

//   keyValuePairs.forEach(pair => {
//     const [ key, val ] = pair.split("=").map(s => s.trim())
//     keyspaceData[key] = val
//   })

//   return keyspaceData
// }
