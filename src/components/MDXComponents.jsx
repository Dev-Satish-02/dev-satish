// Styling lives in `.prose` (index.css); these only add structure.
export default {
  table: (props) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
  a: ({ href = '', ...props }) =>
    href.startsWith('http') ? <a href={href} target="_blank" rel="noreferrer" {...props} /> : <a href={href} {...props} />,
};
