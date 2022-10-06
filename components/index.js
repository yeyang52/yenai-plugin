const Path = process.cwd();
const Plugin_Name = 'yenai-plugin'
const Plugin_Path = `${Path}/plugins/${Plugin_Name}`;
import Version from './Version.js'
import Data from './Data.js'
import Cfg from './Cfg.js'
import Common from './Common.js'
import Config from './Config.js'

export { Cfg, Common, Config, Data, Version, Path, Plugin_Name, Plugin_Path }