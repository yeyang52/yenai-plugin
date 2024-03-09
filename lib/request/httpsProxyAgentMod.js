import HttpsProxyAgentOrig from 'https-proxy-agent'

export class HttpsProxyAgent extends HttpsProxyAgentOrig.HttpsProxyAgent {
  constructor (opts) {
    super(opts)
    this.tlsConnectionOptions = opts.tls
   const callback = (req， opts) => callback(req, Object.assign(opts, this.tlsConnectionOptions)).bind(this)
  }
}
