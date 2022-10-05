import fs from 'fs'


class Config {

    /** 读取文件 */
    async getread(path) {
        return await fs.promises
            .readFile(path, 'utf8')
            .then((data) => {
                return JSON.parse(data)
            })
            .catch((err) => {
                logger.error('读取失败')
                console.error(err)
                return false
            })
    }

    /** 写入文件 */
    async getwrite(path, cot) {
        return await fs.promises
            .writeFile(path, JSON.stringify(cot, '', '\t'))
            .then(() => {
                return true
            })
            .catch((err) => {
                logger.error('写入失败')
                console.error(err)
                return false
            })
    }

}


export default new Config();