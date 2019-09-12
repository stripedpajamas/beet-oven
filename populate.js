const fetch = require('node-fetch')
const { ulid } = require('ulid')
const path = require('path')
const fs = require('fs')

const url = 'https://imslp.org/wiki/Special:GR/getchannel'
const opts = {
  method: 'post',
  headers: {
    cookie: `imslp_wiki_session=${process.env.imslp}`
  },
  body: "[\"Recordings\", 10, false]"
}

async function getList () {
  const res = await fetch(url, opts)
  return res.json()
}

function parse (list) {
  // convert imslp output into b.o. input
  const output = []
  for (let album of list) {
    const composer = (album.wrk.match(/\((.+)\)/) || [])[1]
    const performer = album.art
    output.push(...album.trs.map((tr) => ({
      title: tr.dsc,
      composer,
      performer,
      filename: `${ulid()}${path.extname(tr.url)}`,
      url: tr.url
    })))
  }
  return output
}

async function deref (track) {
  console.log('Downloading track to temp-assets:', track.url)
  const res = await fetch(track.url)
  res.body.pipe(fs.createWriteStream(`temp-assets/${track.filename}`))
}

function updateToc (tracks) {
  const payload = tracks.map(({ title, composer, performer, filename }) => (
    { title, composer, performer, filename }
  ))
  const tempTocFile = fs.readFileSync('temp-toc.json', 'utf8')
  const tempToc = JSON.parse(tempTocFile || '[]')
  const newToc = tempToc.concat(payload)
  fs.writeFileSync('temp-toc.json', JSON.stringify(newToc))
  console.log('Updated TOC written to temp-toc.json')
}

async function main () {
  const list = await getList()
  const [id, playlist] = list
  const seenChannels = fs.createWriteStream('./seen')
  seenChannels.write(id + '\n')
  const tracks = parse(playlist)
  await Promise.all(tracks.map(deref))
  updateToc(tracks)
}

main()
