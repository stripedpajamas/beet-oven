const ARCHIVE_KEY = 'dat://92838f99f1081237eeab9c6cad1839995428e2a6464896d2a6bb83beb6587b2e'

function getAudioFilePath ({ filename }) {
  return `${ARCHIVE_KEY}/${filename}`
}

async function playRandomSong (elements, toc, firstTime) {
  const { audio, title, composer, performer } = elements
  const song = toc[Math.floor(Math.random() * toc.length)]
  if (!song) return
  audio.src = getAudioFilePath(song)
  if (!firstTime) audio.play()

  title.textContent = `${song.title}`
  composer.textContent = `${song.composer}`
  performer.textContent = `Performed by ${song.performer}`
}

window.addEventListener('DOMContentLoaded', async () => {
  const audio = document.getElementById('audio')
  const title = document.getElementById('audio-info-title')
  const composer = document.getElementById('audio-info-composer')
  const performer = document.getElementById('audio-info-performer')
  const elements = { audio, title, composer, performer }

  const archive = await DatArchive.load(ARCHIVE_KEY)
  const toc = JSON.parse(await archive.readFile('toc.json') || '[]')

  playRandomSong(elements, toc, true)

  audio.addEventListener('ended', () => {
    playRandomSong(elements, toc, false)
  })
})


