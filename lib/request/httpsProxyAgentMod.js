import HttpsProxyAgentOrig from "https-proxy-agent"

export class HttpsProxyAgent extends HttpsProxyAgentOrig.HttpsProxyAgent {
  constructor(opts) {
    super(opts)
    this.tlsConnectionOptions = opts.tls
    const connect = this.connect.bind(this)
    this.connect = (req, opts) => connect(req, Object.assign(opts, this.tlsConnectionOptions))
  }
}
