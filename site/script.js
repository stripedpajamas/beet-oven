const ARCHIVE_KEY = 'dat://92838f99f1081237eeab9c6cad1839995428e2a6464896d2a6bb83beb6587b2e'

async function getRandomSong () {
  const archive = await DatArchive.load(ARCHIVE_KEY)
  const toc = JSON.parse(await archive.readFile('toc.json') || '[]')
  return toc[Math.floor(Math.random() * toc.length)]
}

function getAudioFilePath ({ filename }) {
  return `${ARCHIVE_KEY}/${filename}`
}

async function playRandomSong (elements, firstTime) {
  const { audio, title, composer, performer } = elements
  console.log('Getting random song')
  const song = await getRandomSong()
  console.log('Got', song)
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

  playRandomSong(elements, true)

  audio.addEventListener('ended', () => {
    console.log('Playback finished, getting another song')
    playRandomSong(elements, false)
  })
})


