const STATUS_COPY = {
  live: 'Live',
  connecting: 'Connecting',
  offline: 'Offline',
};

export default function ConnectionPulse({ status }) {
  return (
    <div className="pulse" data-status={status} role="status" aria-live="polite">
      <span className="pulse__dot" aria-hidden="true">
        <span className="pulse__ring" />
      </span>
      <span className="pulse__label">{STATUS_COPY[status] ?? 'Connecting'}</span>
    </div>
  );
}
