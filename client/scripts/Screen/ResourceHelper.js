class ResourceHelper {
  /**
   * Load all videos
   */
  loadVideos (config) {
    const promises = []
    config.forEach(c => promises.push(this.loadVideo(c)))

    Promise.all(promises)
  }

  /**
   * Load a video
   * @param configItem
   * @returns {Promise.<TResult>}
   */
  loadVideo (configItem) {
    return fetch(configItem.resourceUrl)
      .then(data => data.blob())
      .then(data => {
        configItem.url = window.URL.createObjectURL(data)
      })
  }
}

export default new ResourceHelper()
