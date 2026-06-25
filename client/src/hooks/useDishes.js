import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import { fetchDishes, toggleDishPublished } from '../api/dishes';

export function useDishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    fetchDishes()
      .then((data) => {
        if (isMounted) {
          setDishes(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load dishes');
          setLoading(false);
        }
      });

    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnectionStatus('live'));
    socket.on('disconnect', () => setConnectionStatus('offline'));
    socket.on('connect_error', () => setConnectionStatus('offline'));

    socket.on('dish:created', (dish) => {
      setDishes((prev) => {
        if (prev.some((d) => d.dishId === dish.dishId)) return prev;
        return [...prev, dish].sort((a, b) => a.dishId.localeCompare(b.dishId));
      });
    });

    socket.on('dish:updated', (dish) => {
      setDishes((prev) => prev.map((d) => (d.dishId === dish.dishId ? dish : d)));
      setPendingIds((prev) => {
        if (!prev.has(dish.dishId)) return prev;
        const next = new Set(prev);
        next.delete(dish.dishId);
        return next;
      });
    });

    socket.on('dish:deleted', ({ dishId }) => {
      setDishes((prev) => prev.filter((d) => d.dishId !== dishId));
    });

    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, []);

  const toggleDish = useCallback(async (dishId) => {
    setPendingIds((prev) => new Set(prev).add(dishId));
    try {
      // The socket broadcast (dish:updated) is what actually commits the
      // new state to the UI - this call just kicks off the change.
      await toggleDishPublished(dishId);
    } catch (err) {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(dishId);
        return next;
      });
      throw err;
    }
  }, []);

  return { dishes, loading, error, connectionStatus, pendingIds, toggleDish };
}
