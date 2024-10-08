export function formatDuration(durationInSeconds) {
    const totalSeconds = Math.round(durationInSeconds);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }