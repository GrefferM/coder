// Plain JavaScript: Electron loads a preload in the window's process, where bootstrap.js never registered ts-node.
// One generic bridge over every domain's channels.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronApi", {
  // A refusal or failure answer becomes an error here, in the window.
  invoke: async (channel, payload) => {
    const answer = await ipcRenderer.invoke(channel, payload);

    if (answer.refusal !== null) {
      throw new Error(answer.refusal);
    }

    if (answer.failure !== null) {
      throw new Error(answer.failure);
    }

    return answer.value;
  },
  // Main-to-renderer direction; the listener gets the message, not the event.
  subscribe: (channel, listener) => {
    const relay = (_event, payload) => listener(payload);

    ipcRenderer.on(channel, relay);

    return () => {
      ipcRenderer.off(channel, relay);
    };
  },
});
