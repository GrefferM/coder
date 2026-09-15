// Plain JavaScript: Electron loads a preload script directly, before bootstrap.js's ts-node registration.
// One generic bridge over every domain's channels.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronApi", {
  // A channel answers with a value, never by rejecting; a refusal or failure becomes an error here, in the window.
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
  // The other direction: the main process speaks first; the listener hears what was said, not the event.
  subscribe: (channel, listener) => {
    const relay = (_event, payload) => listener(payload);

    ipcRenderer.on(channel, relay);

    return () => {
      ipcRenderer.off(channel, relay);
    };
  },
});
