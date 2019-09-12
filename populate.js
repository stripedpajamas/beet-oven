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
}

async function getList (lastId = false) {
  if (!process.env.imslp) throw new Error('Need IMSLP session id in env')
  const body = `["Recordings", 10, ${lastId}]`
  console.log('Requesting recordings with id %d', lastId)
  const res = await fetch(url, { ...opts, body })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch (e) {
    console.error('Not valid JSON:', text)
    throw e
  }
  return json
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
  return new Promise(async (resolve) => {
    console.log('Downloading track to temp-assets:', track.url)
    const res = await fetch(track.url)
    const stream = res.body.pipe(fs.createWriteStream(`temp-assets/${track.filename}`))
    stream.on('finish', () => resolve())
  })
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

async function getChannel (lastId) {
  const list = await getList(lastId)
  const [id, playlist] = list
  const tracks = parse(playlist)
  await Promise.all(tracks.map(deref))
  updateToc(tracks)
  return id
}

async function main () {
  const count = Number(process.argv[2])
  const inputLastId = Number(process.argv[3])
  if (!count || !inputLastId) {
    console.log('Usage: populate.js <count> <inputLastId>')
    process.exit(0)
  }
  console.log('Getting %d channels', count)
  let lastId = inputLastId
  for (let i = 0; i < count; i++) {
    lastId = await getChannel(lastId)
  }
  console.log('')
  console.log('Done. Downloaded %d lists, starting from id %d. Last id processed was %d.', count, inputLastId, lastId)
  console.log('')
  console.log('You can now copy assets from temp-assets to site/assets and merge temp-toc.json with site/toc.json.')
}

main()
