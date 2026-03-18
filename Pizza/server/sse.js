export function createSSEManager() {
  const subscribers = new Set();

  function addSubscriber(res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    subscribers.add(res);
    res.on('close', () => subscribers.delete(res));
  }

  function removeSubscriber(res) {
    subscribers.delete(res);
  }

  function broadcast(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of subscribers) {
      res.write(payload);
    }
  }

  function subscriberCount() {
    return subscribers.size;
  }

  return { addSubscriber, removeSubscriber, broadcast, subscriberCount };
}
