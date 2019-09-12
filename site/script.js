async function getToc () {
  return JSON.parse(await fetch('toc.json').then(res => res.text()) || '[]')
}

async function playRandomSong (elements, toc, firstTime) {
  const { audio, title, composer, performer } = elements
  const song = toc[Math.floor(Math.random() * toc.length)]
  if (!song) return
  audio.src = `/assets/${song.filename}`
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

  const toc = await getToc()

  playRandomSong(elements, toc, true)

  audio.addEventListener('ended', () => {
    playRandomSong(elements, toc, false)
  })
})


