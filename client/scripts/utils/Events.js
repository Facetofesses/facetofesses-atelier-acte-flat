class Events {
  commit (eventType, detail) {
    const event = new CustomEvent(eventType, {detail})
    window.dispatchEvent(event)
  }
}

export default new Events()
