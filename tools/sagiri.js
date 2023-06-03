/* eslint-disable no-void */
const DoujinMangaLexicon = {
  name: 'The Doujinshi & Manga Lexicon',
  index: 3,
  urlMatcher: /(?:http:\/\/)?doujinshi\.mugimugi\.org\/index\.php?p=book&id=\d+/i,
  backupUrl: ({ data: { ddb_id } }) => `http://doujinshi.mugimugi.org/index.php?P=BOOK&ID=${ddb_id}`
}
const Pixiv = {
  name: 'Pixiv',
  index: 5,
  urlMatcher: /(?:https?:\/\/)?(?:www\.)?pixiv\.net\/member_illust\.php\?mode=.+&illust_id=\d+/i,
  backupUrl: ({ data: { pixiv_id } }) => `https://www.pixiv.net/artworks/${pixiv_id}`,
  authorData: ({ member_id, member_name }) => ({
    authorName: member_name,
    authorUrl: `https://www.pixiv.net/users/${member_id}`
  })
}
const NicoNicoSeiga = {
  name: 'Nico Nico Seiga',
  index: 8,
  urlMatcher: /(?:http:\/\/)?seiga\.nicovideo\.jp\/seiga\/im\d+/i,
  backupUrl: ({ data: { seiga_id } }) => `http://seiga.nicovideo.jp/seiga/im${seiga_id}`
}
const Danbooru = {
  name: 'Danbooru',
  index: 9,
  urlMatcher: /(?:https?:\/\/)?danbooru\.donmai\.us\/(?:posts|post\/show)\/\d+/i,
  backupUrl: ({ data: { danbooru_id } }) => `https://danbooru.donmai.us/posts/${danbooru_id}`
}
const Drawr = {
  name: 'drawr',
  index: 10,
  urlMatcher: /(?:http:\/\/)?(?:www\.)?drawr\.net\/show\.php\?id=\d+/i,
  backupUrl: ({ data: { drawr_id } }) => `http://drawr.net/show.php?id=${drawr_id}`
}
const Nijie = {
  name: 'Nijie',
  index: 11,
  urlMatcher: /(?:http:\/\/)?nijie\.info\/view\.php\?id=\d+/i,
  backupUrl: (data) => `http://nijie.info/view.php?id=${data.data.nijie_id}`
}
const Yandere = {
  name: 'Yande.re',
  index: 12,
  urlMatcher: /(?:https?:\/\/)?yande\.re\/post\/show\/\d+/i,
  backupUrl: (data) => `https://yande.re/post/show/${data.data.yandere_id}`
}
const OpeningsMoe = {
  name: 'Openings.moe',
  index: 13,
  urlMatcher: /(?:https?:\/\/)?openings\.moe\/\?video=.*/,
  backupUrl: (data) => `https://openings.moe/?video=${data.data.file}`
}
const Fakku = {
  name: 'FAKKU',
  index: 16,
  urlMatcher: /(?:https?:\/\/)?(www\.)?fakku\.net\/hentai\/[a-z-]+\d+}/i,
  backupUrl: (data) => { let _a; return `https://www.fakku.net/hentai/${(_a = data.data.source) === null || _a === void 0 ? void 0 : _a.toLowerCase().replace(' ', '-')}` }
}
const NHentai = {
  name: 'nHentai',
  index: 18,
  urlMatcher: /https?:\/\/nhentai.net\/g\/\d+/i,
  backupUrl: (data) => { let _a; return `https://nhentai.net/g/${(_a = data.header.thumbnail.match(/nhentai\/(\d+)/)) === null || _a === void 0 ? void 0 : _a[1]}` }
}
const TwoDMarket = {
  name: '2D-Market',
  index: 19,
  urlMatcher: /https?:\/\/2d-market\.com\/comic\/\d+/i,
  backupUrl: (data) => {
    let _a, _b
    return `http://2d-market.com/Comic/${(_a = data.header.thumbnail.match(/2d_market\/(\d+)/i)) === null || _a === void 0 ? void 0 : _a[1]}-${(_b = data.data.source) === null || _b === void 0 ? void 0 : _b.replace(' ', '-')}`
  }
}
const MediBang = {
  name: 'MediBang',
  index: 20,
  urlMatcher: /(?:https?:\/\/)?medibang\.com\/picture\/[\da-z]+/i,
  backupUrl: (data) => data.data.url
}
const AniDB = {
  name: 'AniDB',
  index: 21,
  urlMatcher: /(?:https?:\/\/)?anidb\.net\/perl-bin\/animedb\.pl\?show=.+&aid=\d+/i,
  backupUrl: (data) => `https://anidb.net/perl-bin/animedb.pl?show=anime&aid=${data.data.anidb_aid}`
}
const IMDb = {
  name: 'IMDb',
  index: 23,
  urlMatcher: /(?:https?:\/\/)?(?:www\.)?imdb\.com\/title\/.+/i,
  backupUrl: (data) => `https://www.imdb.com/title/${data.data.imdb_id}`
}
const Gelbooru = {
  name: 'Gelbooru',
  index: 25,
  urlMatcher: /(?:https?:\/\/)gelbooru\.com\/index\.php\?page=post&s=view&id=\d+/i,
  backupUrl: (data) => `https://gelbooru.com/index.php?page=post&s=view&id=${data.data.gelbooru_id}`
}
const Konachan = {
  name: 'Konachan',
  index: 26,
  urlMatcher: /(?:http:\/\/)?konachan\.com\/post\/show\/\d+/i,
  backupUrl: (data) => `https://konachan.com/post/show/${data.data.konachan_id}`
}
const SankakuChannel = {
  name: 'Sankaku Channel',
  index: 27,
  urlMatcher: /(?:https?:\/\/)?chan\.sankakucomplex\.com\/post\/show\/\d+/i,
  backupUrl: (data) => `https://chan.sankakucomplex.com/post/show/${data.data.sankaku_id}`
}
const AnimePictures = {
  name: 'Anime-Pictures',
  index: 28,
  urlMatcher: /(?:https?:\/\/)?anime-pictures\.net\/pictures\/view_post\/\d+/i,
  backupUrl: (data) => `https://anime-pictures.net/pictures/view_post/${data.data['anime-pictures_id']}`
}
const E621 = {
  name: 'e621',
  index: 29,
  urlMatcher: /(?:https?:\/\/)?e621\.net\/post\/show\/\d+/i,
  backupUrl: (data) => `https://e621.net/post/show/${data.data.e621_id}`
}
const IdolComplex = {
  name: 'Idol Complex',
  index: 30,
  urlMatcher: /(?:https?:\/\/)?idol\.sankakucomplex\.com\/post\/show\/\d+/i,
  backupUrl: (data) => `https://idol.sankakucomplex.com/post/show/${data.data.idol_id}`
}
const bcyIllust = {
  name: 'bcy.net Illust',
  index: 31,
  urlMatcher: /(?:http:\/\/)?bcy.net\/illust\/detail\/\d+/i,
  backupUrl: (data) => `https://bcy.net/${data.data.bcy_type}/detail/${data.data.member_link_id}/${data.data.bcy_id}`,
  authorData: ({ member_id, member_name }) => ({
    authorName: member_name,
    authorUrl: `https://bcy.net/u/${member_id}`
  })
}
const bcyCosplay = {
  name: 'bcy.net Cosplay',
  index: 32,
  urlMatcher: /(?:http:\/\/)?bcy.net\/coser\/detail\/\d{5}/i,
  backupUrl: (data) => `https://bcy.net/${data.data.bcy_type}/detail/${data.data.member_link_id}/${data.data.bcy_id}`
}
const PortalGraphics = {
  name: 'PortalGraphics',
  index: 33,
  urlMatcher: /(?:http:\/\/)?web\.archive\.org\/web\/http:\/\/www\.portalgraphics\.net\/pg\/illust\/\?image_id=\d+/i,
  backupUrl: (data) => `http://web.archive.org/web/http://www.portalgraphics.net/pg/illust/?image_id=${data.data.pg_id}`
}
const DeviantArt = {
  name: 'deviantArt',
  index: 34,
  urlMatcher: /(?:https:\/\/)?deviantart\.com\/view\/\d+/i,
  backupUrl: (data) => `https://deviantart.com/view/${data.data.da_id}`,
  authorData: ({ author_name: authorName, author_url: authorUrl }) => ({
    authorName,
    authorUrl
  })
}
const Pawoo = {
  name: 'Pawoo',
  index: 35,
  urlMatcher: /(?:https?:\/\/)?pawoo\.net\/@.+/i,
  backupUrl: (data) => `https://pawoo.net/@${data.data.user_acct}/${data.data.pawoo_id}`
}
const MangaUpdates = {
  name: 'Manga Updates',
  index: 36,
  urlMatcher: /(?:https:\/\/)?www\.mangaupdates\.com\/series\.html\?id=\d+/gi,
  backupUrl: (data) => `https://www.mangaupdates.com/series.html?id=${data.data.mu_id}`
}
const MangaDex = {
  name: 'MangaDex',
  index: 37,
  urlMatcher: /(?:https?:\/\/)?mangadex\.org\/chapter\/(\w|-)+\/(?:\d+)?/gi,
  backupUrl: (data) => `https://mangadex.org/chapter/${data.data.md_id}`,
  authorData: (data) => ({
    authorName: data.author,
    authorUrl: null
  })
}
const ArtStation = {
  name: 'FurAffinity',
  index: 39,
  urlMatcher: /(?:https?:\/\/)?www\.artstation\.com\/artwork\/\w+/i,
  backupUrl: (data) => `https://www.artstation.com/artwork/${data.data.as_project}`,
  authorData: (data) => ({
    authorName: data.author_name,
    authorUrl: data.author_url
  })
}
const FurAffinity = {
  name: 'FurAffinity',
  index: 40,
  urlMatcher: /(?:https?:\/\/)?furaffinity\.net\/view\/\d+/i,
  backupUrl: (data) => `https://furaffinity.net/view/${data.data.fa_id}`,
  authorData: (data) => ({
    authorName: data.author_name,
    authorUrl: data.author_url
  })
}
const Twitter = {
  name: 'Twitter',
  index: 41,
  urlMatcher: /(?:https?:\/\/)?twitter\.com\/.+/i,
  backupUrl: (data) => `https://twitter.com/i/web/status/${data.data.tweet_id}`,
  authorData: (data) => ({
    authorName: data.twitter_user_handle,
    authorUrl: `https://twitter.com/i/user/${data.twitter_user_id}`
  })
}
const FurryNetwork = {
  name: 'Furry Network',
  index: 42,
  urlMatcher: /(?:https?:\/\/)?furrynetwork\.com\/artwork\/\d+/i,
  backupUrl: (data) => `https://furrynetwork.com/artwork/${data.data.fn_id}`,
  authorData: (data) => ({
    authorName: data.author_name,
    authorUrl: data.author_url
  })
}
const Kemono = {
  name: 'Kemono',
  index: 43,
  urlMatcher: /|(?:(?:https?:\/\/)?fantia\.jp\/posts\/\d+)|(?:(?:https?:\/\/)?subscribestar\.adult\/posts\/\d+)|(?:(?:https?:\/\/)?gumroad\.com\/l\/\w+)|(?:(?:https?:\/\/)?patreon\.com\/posts\/\d+)|(?:(?:https?:\/\/)?pixiv\.net\/fanbox\/creator\/\d+\/post\/\d+)|(?:(?:https?:\/\/)?dlsite\.com\/home\/work\/=\/product_id\/\w+\.\w+)/i,
  backupUrl: (data) => {
    switch (data.data.service) {
      case 'fantia':
        return `https://fantia.jp/posts/${data.data.id}`
      case 'subscribestar':
        return `https://subscribestar.adult/posts/${data.data.id}`
      case 'gumroad':
        return `https://gumroad.com/l/${data.data.id}`
      case 'patreon':
        return `https://patreon.com/posts/${data.data.id}`
      case 'fanbox':
        return `https://pixiv.net/fanbox/creator/${data.data.user_id}/post/${data.data.id}`
      case 'dlsite':
        return `https://dlsite.com/home/work/=/${data.data.id}`
      default:
        // throw new errors_1.SagiriClientError(999, `Unknown service type for Kemono: ${data.data.service}`)
        logger.error(999, `Unknown service type for Kemono: ${data.data.service}`)
    }
  },
  authorData: (data) => {
    switch (data.service) {
      case 'fantia':
        return {
          authorName: data.user_name,
          authorUrl: `https://fantia.jp/fanclubs/${data.user_id}`
        }
      case 'subscribestar':
        return {
          authorName: data.user_name,
          authorUrl: `https://subscribestar.adult/${data.user_id}`
        }
      case 'gumroad':
        return {
          authorName: data.user_name,
          authorUrl: `https://gumroad.com/${data.user_id}`
        }
      case 'patreon':
        return {
          authorName: data.user_name,
          authorUrl: `https://patreon.com/user?u=${data.user_id}`
        }
      case 'fanbox':
        return {
          authorName: data.user_name,
          authorUrl: `https://pixiv.net/fanbox/creator/${data.user_id}`
        }
      case 'dlsite':
        return {
          authorName: data.user_name,
          authorUrl: `https://dlsite.com/eng/cicrle/profile/=/marker_id/${data.user_id}`
        }
      default:
        // throw new errors_1.SagiriClientError(999, `Unknown service type for Kemono: ${data.service}`)
        logger.error(999, `Unknown service type for Kemono: ${data.service}`)
    }
  }
}
const Skeb = {
  name: 'Skeb',
  index: 44,
  urlMatcher: /(?:(?:https?:\/\/)?skeb\.jp\/@\w+\/works\/\d+)/i,
  backupUrl: (data) => `https://skeb.jp${data.data.path}`,
  authorData: (data) => ({
    authorName: data.creator_name,
    authorUrl: data.author_url
  })
}
// #endregion
const sites = {
  3: DoujinMangaLexicon,
  4: DoujinMangaLexicon,
  5: Pixiv,
  6: Pixiv,
  8: NicoNicoSeiga,
  9: Danbooru,
  10: Drawr,
  11: Nijie,
  12: Yandere,
  13: OpeningsMoe,
  16: Fakku,
  18: NHentai,
  19: TwoDMarket,
  20: MediBang,
  21: AniDB,
  22: AniDB,
  23: IMDb,
  24: IMDb,
  25: Gelbooru,
  26: Konachan,
  27: SankakuChannel,
  28: AnimePictures,
  29: E621,
  30: IdolComplex,
  31: bcyIllust,
  32: bcyCosplay,
  33: PortalGraphics,
  34: DeviantArt,
  35: Pawoo,
  36: MangaUpdates,
  37: MangaDex,
  371: MangaDex,
  // 38
  39: ArtStation,
  40: FurAffinity,
  41: Twitter,
  42: FurryNetwork,
  43: Kemono,
  44: Skeb
}
const resolveResult = item => {
  const { data, header } = item
  const id = header.index_id
  if (!sites[id]) {
    throw new Error(`Cannot resolve data for unknown index ${id}`)
  }
  const { name, urlMatcher, backupUrl, authorData } = sites[id]
  let url
  if (data.ext_urls && data.ext_urls.length > 1) {
    url = data.ext_urls.filter((url) => urlMatcher.test(url))
  } else if (data.ext_urls) {
    url = data.ext_urls
  }
  if (!url) url = backupUrl(item)
  const author = authorData?.(item.data) ?? { authorName: null, authorUrl: null }
  return { id, url, name, ...author }
  // return Object.assign({
  //   id,
  //   url,
  //   name
  // }, ((_a = authorData === null || authorData === void 0 ? void 0 : authorData(item.data)) !== null && _a !== void 0 ? _a : { authorName: null, authorUrl: null }))
}

const sagiri = (response) => {
  const unknownIds = new Set(response.results.filter((result) => !sites[result.header.index_id]).map((result) => result.header.index_id))
  const results = response.results
    .filter((result) => !unknownIds.has(result.header.index_id))
    .sort((a, b) => b.header.similarity - a.header.similarity)

  return results.map((result) => {
    const { url, name, id, authorName, authorUrl } = resolveResult(result)
    const { header: { similarity, thumbnail } } = result
    return {
      url,
      site: name,
      index: id,
      similarity: Number(similarity),
      thumbnail,
      authorName,
      authorUrl,
      raw: result
    }
  })
}
export default sagiri
// # sourceMappingURL=sites.js.map
