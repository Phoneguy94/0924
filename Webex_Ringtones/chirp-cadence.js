const originalPlayTone = playTone;

playTone = function (r) {
  if (r && r.number === 13 && r.file && !r.pending) {
    if (playingNumber === r.number) {
      stopAudio();
      return;
    }

    stopAudio();
    const token = ++playToken;
    const repeats = 3;
    const pauseMs = 4000;
    let count = 0;

    audio.src = r.file;
    audio.loop = false;
    setPlaying(r.number);

    const playOnce = () => {
      if (token !== playToken) return;
      count += 1;
      audio.currentTime = 0;
      audio.onended = () => {
        if (token !== playToken) return;
        if (count >= repeats) {
          audio.onended = null;
          setPlaying(null);
          return;
        }
        schedule(playOnce, pauseMs);
      };
      audio.play().catch((err) => {
        console.warn('Chirp 2 playback failed', err);
        stopAudio();
      });
    };

    playOnce();
    return;
  }

  originalPlayTone(r);
};
