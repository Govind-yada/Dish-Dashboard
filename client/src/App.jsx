import { useMemo, useState } from 'react';
import { useDishes } from './hooks/useDishes';
import ConnectionPulse from './components/ConnectionPulse';
import DishTicket from './components/DishTicket';
import './App.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
];

export default function App() {
  const { dishes, loading, error, connectionStatus, pendingIds, toggleDish } = useDishes();
  const [filter, setFilter] = useState('all');
  const [toggleError, setToggleError] = useState(null);

  const counts = useMemo(() => {
    const published = dishes.filter((d) => d.isPublished).length;
    return { total: dishes.length, published, draft: dishes.length - published };
  }, [dishes]);

  const visibleDishes = useMemo(() => {
    if (filter === 'published') return dishes.filter((d) => d.isPublished);
    if (filter === 'draft') return dishes.filter((d) => !d.isPublished);
    return dishes;
  }, [dishes, filter]);

  const handleToggle = async (dishId) => {
    setToggleError(null);
    try {
      await toggleDish(dishId);
    } catch {
      setToggleError(`Couldn't update ${dishId}. Check the server and try again.`);
    }
  };

  return (
    <div className="board">
      <header className="board__header">
        <div className="board__title-block">
          <p className="board__eyebrow">Kitchen pass · Menu control</p>
          <h1 className="board__title">The Pass</h1>
        </div>
        <ConnectionPulse status={connectionStatus} />
      </header>

      <div className="board__rail">
        <nav className="board__filters" aria-label="Filter dishes">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className="board__filter-btn"
              data-active={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="board__filter-count">
                {f.key === 'all' ? counts.total : f.key === 'published' ? counts.published : counts.draft}
              </span>
            </button>
          ))}
        </nav>
        <p className="board__summary">
          <strong>{counts.published}</strong> published · <strong>{counts.draft}</strong> in draft
        </p>
      </div>

      {toggleError && <p className="board__error" role="alert">{toggleError}</p>}

      <main className="board__main">
        {loading && <p className="board__status">Loading the pass…</p>}

        {!loading && error && (
          <p className="board__status board__status--error">
            Couldn't reach the kitchen: {error}
          </p>
        )}

        {!loading && !error && visibleDishes.length === 0 && (
          <p className="board__status">No dishes here yet. Try a different filter.</p>
        )}

        {!loading && !error && visibleDishes.length > 0 && (
          <ul className="board__grid">
            {visibleDishes.map((dish) => (
              <DishTicket
                key={dish.dishId}
                dish={dish}
                isPending={pendingIds.has(dish.dishId)}
                onToggle={handleToggle}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
