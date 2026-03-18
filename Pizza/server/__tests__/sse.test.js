import { describe, it, expect, beforeEach } from 'vitest';
import { createSSEManager } from '../sse.js';

describe('SSE Manager', () => {
  let sse;

  beforeEach(() => {
    sse = createSSEManager();
  });

  it('adds and removes subscribers', () => {
    const mockRes = {
      writeHead: () => {},
      write: () => {},
      on: () => {},
    };
    sse.addSubscriber(mockRes);
    expect(sse.subscriberCount()).toBe(1);
    sse.removeSubscriber(mockRes);
    expect(sse.subscriberCount()).toBe(0);
  });

  it('broadcasts event to all subscribers', () => {
    const written = [];
    const mockRes = {
      writeHead: () => {},
      write: (data) => written.push(data),
      on: () => {},
    };
    sse.addSubscriber(mockRes);
    sse.broadcast({ type: 'order_created', order: { id: 1 } });
    expect(written.length).toBe(1);
    expect(written[0]).toContain('"type":"order_created"');
  });

  it('removes subscriber on close', () => {
    let closeHandler;
    const mockRes = {
      writeHead: () => {},
      write: () => {},
      on: (event, handler) => {
        if (event === 'close') closeHandler = handler;
      },
    };
    sse.addSubscriber(mockRes);
    expect(sse.subscriberCount()).toBe(1);
    closeHandler();
    expect(sse.subscriberCount()).toBe(0);
  });
});
