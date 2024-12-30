import { fileURLToPath } from "node:url"
import { join, dirname, basename } from "node:path"

export const Path = process.cwd()
export const Plugin_Path = join(dirname(fileURLToPath(import.meta.url)), "..").replace(/\\/g, "/")
export const Plugin_Name = basename(Plugin_Path)
