"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

(async () => {
  const events = {};
  const stores = new Map();
  let claimed = false;
  const root = path.join(__dirname, "..");
  const cache = {
    addAll: async (urls) => {
      for (const url of urls) {
        assert.ok(
          fs.existsSync(path.join(root, url === "./" ? "index.html" : url)),
          url,
        );
        stores.set(url, { cached: url });
      }
    },
    put: async (request, response) => stores.set(request.url, response),
  };
  let deleted;
  const caches = {
    open: async () => cache,
    keys: async () => ["mathe-schatzreise-v3", "mathe-schatzreise-v4"],
    delete: async (key) => {
      deleted = key;
    },
    match: async (request) =>
      stores.get(typeof request === "string" ? request : request.url),
  };
  let offline = false;
  const context = {
    URL,
    Promise,
    caches,
    fetch: async () => {
      if (offline) throw Error("offline");
      return {
        status: 200,
        type: "basic",
        clone() {
          return this;
        },
      };
    },
    self: {
      location: { origin: "https://example.test" },
      addEventListener: (name, handler) => {
        events[name] = handler;
      },
      skipWaiting: async () => {},
      clients: {
        claim: async () => {
          claimed = true;
        },
      },
    },
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(root, "service-worker.js"), "utf8"),
    context,
  );
  let pending;
  events.install({
    waitUntil: (promise) => {
      pending = promise;
    },
  });
  await pending;
  assert.equal(stores.size, 9);
  events.activate({
    waitUntil: (promise) => {
      pending = promise;
    },
  });
  await pending;
  assert.equal(deleted, "mathe-schatzreise-v3");
  assert.ok(claimed);
  let response;
  const request = {
    method: "GET",
    url: "https://example.test/app.js",
    mode: "same-origin",
  };
  events.fetch({
    request,
    respondWith: (promise) => {
      response = promise;
    },
  });
  assert.equal((await response).status, 200);
  await new Promise((resolve) => setImmediate(resolve));
  offline = true;
  events.fetch({
    request,
    respondWith: (promise) => {
      response = promise;
    },
  });
  assert.equal((await response).status, 200);
  events.fetch({
    request: {
      ...request,
      url: "https://example.test/new-route",
      mode: "navigate",
    },
    respondWith: (promise) => {
      response = promise;
    },
  });
  assert.equal((await response).cached, "./index.html");
  for (const ignored of [
    { ...request, method: "POST" },
    { ...request, url: "https://other.test/" },
  ])
    events.fetch({
      request: ignored,
      respondWith: () => {
        throw Error("must ignore");
      },
    });
  console.log(
    "Offline tests passed: assets, upgrade, cache fallback, navigation, request isolation.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
