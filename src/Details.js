import React from 'react';

export default function Details({
  summary,
  children,
  style,
  summaryStyle,
  startOpen,
}) {
  const [open, setOpen] = React.useState(startOpen);

  const onToggle = React.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!open);
    },
    [open]
  );

  return (
    <details open={open} style={style}>
      <summary onClick={onToggle} style={summaryStyle}>
        {summary}
      </summary>
      {open && children}
    </details>
  );
}
