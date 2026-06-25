const Dish = require('./models/Dish');

const POLL_INTERVAL_MS = 2000;

function startRealtimeSync(io) {
  let usingChangeStream = false;

  try {
    const changeStream = Dish.watch([], { fullDocument: 'updateLookup' });
    usingChangeStream = true;

    changeStream.on('change', (change) => {
      handleChange(io, change);
    });

    changeStream.on('error', (err) => {
      console.error('[realtime] change stream error, falling back to polling:', err.message);
      usingChangeStream = false;
      startPolling(io);
    });

    console.log('[realtime] watching dishes collection via MongoDB Change Streams');
  } catch (err) {
    console.warn('[realtime] change streams unavailable, falling back to polling:', err.message);
  }

  if (!usingChangeStream) {
    startPolling(io);
  }
}

function handleChange(io, change) {
  switch (change.operationType) {
    case 'insert':
      io.emit('dish:created', change.fullDocument);
      break;
    case 'update':
    case 'replace':
      if (change.fullDocument) {
        io.emit('dish:updated', change.fullDocument);
      }
      break;
    case 'delete':
      io.emit('dish:deleted', { dishId: change.documentKey._id });
      break;
    default:
      break;
  }
}


function startPolling(io) {
  console.log(`[realtime] polling every ${POLL_INTERVAL_MS}ms as fallback`);
  let lastSnapshot = new Map();

  const tick = async () => {
    try {
      const dishes = await Dish.find().lean();
      const currentSnapshot = new Map(dishes.map((d) => [d.dishId, d]));

      for (const [dishId, dish] of currentSnapshot) {
        const previous = lastSnapshot.get(dishId);
        if (!previous) {
          io.emit('dish:created', dish);
        } else if (previous.isPublished !== dish.isPublished || previous.dishName !== dish.dishName) {
          io.emit('dish:updated', dish);
        }
      }

      for (const dishId of lastSnapshot.keys()) {
        if (!currentSnapshot.has(dishId)) {
          io.emit('dish:deleted', { dishId });
        }
      }

      lastSnapshot = currentSnapshot;
    } catch (err) {
      console.error('[realtime] polling tick failed:', err.message);
    }
  };

  tick();
  setInterval(tick, POLL_INTERVAL_MS);
}

module.exports = startRealtimeSync;
