const assert = require('assert');
const Module = require('module');

// ---- Stub out mongoose's Dish model before the route file requires it ----
const seedDishes = [
  { dishId: 'D001', dishName: 'Margherita Pizza', imageUrl: 'http://x/1.jpg', isPublished: true },
  { dishId: 'D003', dishName: 'Caesar Salad', imageUrl: 'http://x/3.jpg', isPublished: false },
];

function makeFakeDoc(data) {
  return {
    ...data,
    save: async function save() {
      return this;
    },
  };
}

const fakeDb = new Map(seedDishes.map((d) => [d.dishId, makeFakeDoc(d)]));

const FakeDish = {
  find: () => ({
    sort: async () => Array.from(fakeDb.values()),
  }),
  findOne: async ({ dishId }) => fakeDb.get(dishId) || null,
};

// Intercept require('../models/Dish') to return our fake
const originalResolve = Module._resolveFilename;
const path = require('path');
const dishModelPath = path.resolve(__dirname, '../src/models/Dish.js');

const originalRequire = Module.prototype.require;
Module.prototype.require = function patchedRequire(id) {
  const resolved = (() => {
    try {
      return Module._resolveFilename(id, this);
    } catch {
      return null;
    }
  })();
  if (resolved === dishModelPath) {
    return FakeDish;
  }
  return originalRequire.apply(this, arguments);
};

const router = require('../src/routes/dishes');

Module.prototype.require = originalRequire; // restore

function getHandler(method, routePath) {
  const layer = router.stack.find(
    (l) => l.route && l.route.path === routePath && l.route.methods[method]
  );
  assert.ok(layer, `No handler registered for ${method.toUpperCase()} ${routePath}`);
  return layer.route.stack[0].handle;
}

function makeRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

async function run() {
  {
    const handler = getHandler('get', '/');
    const res = makeRes();
    await handler({}, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.length, 2);
    console.log('PASS: GET / returns all dishes');
  }

  {
    const handler = getHandler('patch', '/:dishId/toggle');
    const res = makeRes();
    await handler({ params: { dishId: 'D001' } }, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.isPublished, false, 'expected D001 to flip true -> false');
    console.log('PASS: PATCH toggle flips true -> false');
  }

  {
    const handler = getHandler('patch', '/:dishId/toggle');
    const res = makeRes();
    await handler({ params: { dishId: 'D003' } }, res);
    assert.strictEqual(res.body.data.isPublished, true, 'expected D003 to flip false -> true');
    console.log('PASS: PATCH toggle flips false -> true');
  }

  {
    const handler = getHandler('patch', '/:dishId/toggle');
    const res = makeRes();
    await handler({ params: { dishId: 'DOES_NOT_EXIST' } }, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.success, false);
    console.log('PASS: PATCH toggle on unknown dish returns 404');
  }

  console.log('\nAll smoke tests passed.');
}

run().catch((err) => {
  console.error('SMOKE TEST FAILED:', err);
  process.exit(1);
});
