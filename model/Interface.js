import fetch from "node-fetch";
import md5 from "md5";
import lodash from "lodash";

export default new class Interface {
    /**有道翻译 */
    async youdao(msg) {
        // 翻译结果为空的提示
        const RESULT_ERROR = "找不到翻译结果";
        // API 请求错误提示
        const API_ERROR = "出了点小问题，待会再试试吧";
        const qs = (obj) => {
            let res = "";
            for (const [k, v] of Object.entries(obj))
                res += `${k}=${encodeURIComponent(v)}&`;
            return res.slice(0, res.length - 1);
        };
        const appVersion = "5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4750.0";
        const payload = {
            from: "AUTO",
            to: "AUTO",
            bv: md5(appVersion),
            client: "fanyideskweb",
            doctype: "json",
            version: "2.1",
            keyfrom: "fanyi.web",
            action: "FY_BY_DEFAULT",
            smartresult: "dict"
        };
        const headers = {
            Host: "fanyi.youdao.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/98.0.4758.102",
            Referer: "https://fanyi.youdao.com/",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Cookie: `OUTFOX_SEARCH_USER_ID_NCOO=133190305.98519628; OUTFOX_SEARCH_USER_ID="2081065877@10.169.0.102";`
        };
        const api = "https://fanyi.youdao.com/translate_o?smartresult=dict&smartresult=rule";
        const key = "Ygy_4c=r#e#4EX^NUGUc5";

        const i = msg; // 翻译的内容
        const lts = "" + new Date().getTime();
        const salt = lts + parseInt(String(10 * Math.random()), 10);
        const sign = md5(payload.client + i + salt + key);
        const postData = qs(Object.assign({ i, lts, sign, salt }, payload))
        try {
            let { errorCode, translateResult } = await fetch(api, {
                method: "POST",
                body: postData,
                headers
            }).then(res => res.json()).catch(err => console.error(err));
            if (errorCode != 0) return API_ERROR;
            translateResult = lodash.flattenDeep(translateResult)[0].tgt
            if (!translateResult) return RESULT_ERROR
            return translateResult
        } catch (e) {
            console.log(e);
            return API_ERROR
        }
    }
}