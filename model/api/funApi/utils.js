export const API_ERROR = "出了点小问题，待会再试试吧"

let cheerio = null

/**
 *
 */
export async function _importDependency() {
  if (cheerio) return cheerio
  cheerio = await import("cheerio")
    .catch(() => {
      throw new ReplyError("未检测到依赖cheerio，请安装后再使用该功能，安装命令：pnpm add cheerio -w 或 pnpm install -P")
    })
  return cheerio
}
