export class Video {
  public startTime = 0;
  public startedAt = 0;
  public isPlaying = false;

  public get timestamp() {
    const now = Date.now();

    // console.log((now - this.startedAt) / 1000 + this.startTime);

    return {
      timestamp: (now - this.startedAt) / 1000 + this.startTime,
      at: now,
    };
  }

  public reset() {
    this.startTime = 0;
    this.startedAt = 0;
    this.isPlaying = false;
  }

  public skipBy(by: number) {
    this.startedAt -= by;
    return this.timestamp;
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.startTime = this.timestamp.timestamp;
      this.isPlaying = false;
    } else {
      this.isPlaying = true;
      this.startedAt = Date.now();
    }

    return this.timestamp;
  }
}
