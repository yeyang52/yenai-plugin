/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "7c8196661630d86a357d71793eb689a9"
  },
  {
    "url": "about.html",
    "revision": "01b64c57f73158940f3cddd3b7e383b2"
  },
  {
    "url": "assets/css/0.styles.a35552dd.css",
    "revision": "154f1ebd9d5eedb9bd72d9299b242cb7"
  },
  {
    "url": "assets/fonts/iconfont.938fa69e.woff",
    "revision": "938fa69ea89bccb0f20d643cc5f07cbe"
  },
  {
    "url": "assets/fonts/iconfont.ecabaf00.ttf",
    "revision": "ecabaf00c2c5be9907d524bb21a0f0dc"
  },
  {
    "url": "assets/img/alipay.8701cc62.svg",
    "revision": "8701cc6229ab9a0b625126cdc1838777"
  },
  {
    "url": "assets/img/bg.2cfdbb33.svg",
    "revision": "2cfdbb338a1d44d700b493d7ecbe65d3"
  },
  {
    "url": "assets/img/github.23fc8f81.svg",
    "revision": "23fc8f81f92bb2981d8f9e089d7df14a"
  },
  {
    "url": "assets/img/iconfont.36767f3e.svg",
    "revision": "36767f3efa2e4c880f42a42e8b2075b0"
  },
  {
    "url": "assets/img/love.335eff6a.svg",
    "revision": "335eff6a0aefd9ce25d8624c9cae2f54"
  },
  {
    "url": "assets/img/paypal.0614c8ec.svg",
    "revision": "0614c8ec69152b15a48a6508c9ab7373"
  },
  {
    "url": "assets/img/qq.63e39c8c.svg",
    "revision": "63e39c8cb5ba4f6931ea28f722e0f065"
  },
  {
    "url": "assets/img/sakura.5e4a2cfb.png",
    "revision": "5e4a2cfbc3aae83420146d71ee06ba17"
  },
  {
    "url": "assets/img/wechat.702bca7b.svg",
    "revision": "702bca7befb1db3ac5dace5bb9912188"
  },
  {
    "url": "assets/js/1.9511e192.js",
    "revision": "262ef4592f2f1454436faaebc8b7797f"
  },
  {
    "url": "assets/js/10.27cb0150.js",
    "revision": "f6e521656860c3a0eb24b703e61cdcb9"
  },
  {
    "url": "assets/js/11.49f9773d.js",
    "revision": "38596b380498f31087245fdbf9e95284"
  },
  {
    "url": "assets/js/12.5807041f.js",
    "revision": "964ea26ae7a8e74fa55220a9360a3b77"
  },
  {
    "url": "assets/js/13.0acb47cf.js",
    "revision": "a593cebe0eed1c034bc09ad95e47b72d"
  },
  {
    "url": "assets/js/14.04648f33.js",
    "revision": "cfa231c75f8701eb16f6582496514890"
  },
  {
    "url": "assets/js/15.aea9288f.js",
    "revision": "599513e2168f937305e9588c2beb7633"
  },
  {
    "url": "assets/js/16.bf423c38.js",
    "revision": "3d48f23a65abeef79c902b1e0c5ee9e7"
  },
  {
    "url": "assets/js/17.88817bfe.js",
    "revision": "7bc30184eb87b3ec46122687946397df"
  },
  {
    "url": "assets/js/18.7225a6f0.js",
    "revision": "a143bd7c9af4794ac195e89a6c293542"
  },
  {
    "url": "assets/js/19.0685dbd4.js",
    "revision": "e6a671cccff38a2c89e481f6d1350c76"
  },
  {
    "url": "assets/js/20.6ab4626b.js",
    "revision": "226dc2f642d0df79b1ca3b4bdac2ee85"
  },
  {
    "url": "assets/js/21.e252e1f1.js",
    "revision": "d5c5f1adbfecdc9f760de128a5db811f"
  },
  {
    "url": "assets/js/22.855bbefc.js",
    "revision": "553f0bd777988b1bb35b52cec63c8c37"
  },
  {
    "url": "assets/js/23.1140e69b.js",
    "revision": "9ac962796b3472f205264b416db183cd"
  },
  {
    "url": "assets/js/24.1e9b2361.js",
    "revision": "d7ae53e4bc2b8ec7e67e2f5407f7e8df"
  },
  {
    "url": "assets/js/25.a8910176.js",
    "revision": "bfbe218d59da7469995f3eca366493a4"
  },
  {
    "url": "assets/js/26.2180a728.js",
    "revision": "42da47e980d2c7c2bbd16e180ac0d8bd"
  },
  {
    "url": "assets/js/27.e00a802f.js",
    "revision": "bf4065c80d1aecad0248d05b86ae826b"
  },
  {
    "url": "assets/js/4.5538edf1.js",
    "revision": "65726062678db6e9e44220468cfae262"
  },
  {
    "url": "assets/js/5.925553b8.js",
    "revision": "d552c512ab8c7f9833f1b0561c5d51b6"
  },
  {
    "url": "assets/js/6.4275cbc8.js",
    "revision": "8e4f5755f83ccd61e51886d0cb2bc983"
  },
  {
    "url": "assets/js/7.ec2bbd6c.js",
    "revision": "0ae28104dec0715d21cca92a13b5b215"
  },
  {
    "url": "assets/js/8.8bed3624.js",
    "revision": "84a5391ee6fbe5c4de7c0c4ccf7bc4cf"
  },
  {
    "url": "assets/js/9.08ecc214.js",
    "revision": "556d3605d14c0d1a6fd32e34273abd91"
  },
  {
    "url": "assets/js/app.3bb67841.js",
    "revision": "69c7842e62ffcd9e8afba8d60ab2b3ed"
  },
  {
    "url": "assets/js/vendors~docsearch.e65bccb1.js",
    "revision": "2f99cd91da275dcdf2fb86dff4f13bc0"
  },
  {
    "url": "categories/bika/index.html",
    "revision": "147049e5c7c2c2a6bfaed4a98f4a58a1"
  },
  {
    "url": "categories/config/index.html",
    "revision": "a486ce508c720d42f65b5f53c274741a"
  },
  {
    "url": "categories/FAQ/index.html",
    "revision": "d274a8d5251cd9f6cd687de55a973680"
  },
  {
    "url": "categories/index.html",
    "revision": "3a760d0b3bf9c895d7f4c6713ea98ca4"
  },
  {
    "url": "categories/pixiv/index.html",
    "revision": "f2d21a6627d932f9557aef8dabae2b5d"
  },
  {
    "url": "categories/proxy/index.html",
    "revision": "63beb2a285580c2ace4c4f3599aa3898"
  },
  {
    "url": "config/bika.html",
    "revision": "892e9b24aab86a3eab24c73938130ebb"
  },
  {
    "url": "config/pixiv.html",
    "revision": "8bc87ca5bce052c64aee6905023f9a61"
  },
  {
    "url": "config/proxy.html",
    "revision": "721dac49bfe69776ce09b92cfd80ee87"
  },
  {
    "url": "donate.html",
    "revision": "12d7a4f84108bfa2190290ef1c38d25f"
  },
  {
    "url": "faq.html",
    "revision": "3f08ebfb5a26f70e90ba84df9c1fa9a7"
  },
  {
    "url": "features/Assistant.html",
    "revision": "a3586a7d98b9702f8cfc5015a636122d"
  },
  {
    "url": "features/Bika.html",
    "revision": "00ed7afa0d268b240835124e55102266"
  },
  {
    "url": "features/GroupAdmin.html",
    "revision": "f50b0e3b3d624a03f8e9fc1c7fa642e0"
  },
  {
    "url": "features/Notice.html",
    "revision": "69c23e508a4e3e3ad446975c701cb309"
  },
  {
    "url": "features/PicSearch.html",
    "revision": "2b6c47be78dbf04056bb807f3d227105"
  },
  {
    "url": "features/Pixiv.html",
    "revision": "e76ff6f12071264594accd6fba7d1607"
  },
  {
    "url": "features/State.html",
    "revision": "6ff54236a6e3cba764ef1c586a5094c7"
  },
  {
    "url": "help.html",
    "revision": "0abf23b09b8447a750a9bf1023a2b171"
  },
  {
    "url": "icons/favicon144.png",
    "revision": "c3258ba800a02ed0d788e99c72a2f377"
  },
  {
    "url": "icons/favicon192.png",
    "revision": "80afc1e17911532c93cb8637268d1bbb"
  },
  {
    "url": "icons/favicon48.png",
    "revision": "811da0e0a83246091d2cc380fe84a186"
  },
  {
    "url": "icons/favicon512.png",
    "revision": "ce21c96aceea3078edbb17160f44195f"
  },
  {
    "url": "icons/favicon72.png",
    "revision": "774b55d2b580031b720e7c03867ee2ad"
  },
  {
    "url": "icons/favicon96.png",
    "revision": "05df80e0bd02da9d7d6c0dae2a1e1821"
  },
  {
    "url": "img/hero.png",
    "revision": "abf3416c55d2fb966064d1f14eb29dbc"
  },
  {
    "url": "img/SauceNAO.png",
    "revision": "7c96dc5254055628a50e71feb8fa64c1"
  },
  {
    "url": "img/状态.png",
    "revision": "23f18717ef352a21452c2320319db7b7"
  },
  {
    "url": "index.html",
    "revision": "be070e40733e72563f7084509346fc8c"
  },
  {
    "url": "logo.png",
    "revision": "0cc478288d7f216ad5b9ee3730aaf6a3"
  },
  {
    "url": "pixiv-token/cmd.png",
    "revision": "8378543e981cfa8c637e4143028e936f"
  },
  {
    "url": "pixiv-token/filter.png",
    "revision": "8d49e7a36ec73320cc088f24040bd9f8"
  },
  {
    "url": "pixiv-token/request.png",
    "revision": "19fb2103681a50b2d694820d1f983f0f"
  },
  {
    "url": "sponsor-qrcode/qrcode-alipay.png",
    "revision": "a6128053f374aea2a8877d478f44d300"
  },
  {
    "url": "sponsor-qrcode/qrcode-qq.png",
    "revision": "82b629dbc521ce9013ea68b38b464a9b"
  },
  {
    "url": "sponsor-qrcode/qrcode-wechat.png",
    "revision": "012bb035d7d8e93633a3ddecb5ca66ed"
  },
  {
    "url": "tag/index.html",
    "revision": "ec9ba70fc9f951a7778c1a3b4ec239dd"
  },
  {
    "url": "timeline/index.html",
    "revision": "3cac5a11a358c21aefebe0a3fda3a6f9"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
