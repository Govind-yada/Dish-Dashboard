export default function DishTicket({ dish, isPending, onToggle }) {
  const { dishName, imageUrl, isPublished, dishId } = dish;

  return (
    <li className="ticket" data-published={isPublished}>
      <div className="ticket__photo">
        <img
          src={imageUrl}
          alt={dishName}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
        <div className="ticket__photo-fallback" aria-hidden="true">
          {dishName.charAt(0)}
        </div>
        <span className={`ticket__stamp ticket__stamp--${isPublished ? 'live' : 'draft'}`}>
          {isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="ticket__body">
        <p className="ticket__id">{dishId}</p>
        <h3 className="ticket__name">{dishName}</h3>
      </div>

      <button
        type="button"
        className="ticket__toggle"
        data-published={isPublished}
        disabled={isPending}
        onClick={() => onToggle(dishId)}
        aria-pressed={isPublished}
      >
        <span className="ticket__toggle-track">
          <span className="ticket__toggle-thumb" />
        </span>
        <span className="ticket__toggle-label">
          {isPending ? 'Updating…' : isPublished ? 'Unpublish' : 'Publish'}
        </span>
      </button>
    </li>
  );
}
