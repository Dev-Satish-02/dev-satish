export default {
  img: (props) => (
    <img
      {...props}
      style={{
        width: '100%',
        display: 'block',
        margin: '24px 0',
        border: '3px solid #1b1b1c',
      }}
    />
  ),
  table: (props) => (
    <div style={{ overflowX: 'auto', margin: '24px 0' }}>
      <table {...props} style={{ width: '100%', borderCollapse: 'collapse' }} />
    </div>
  ),
  th: (props) => (
    <th
      {...props}
      style={{
        border: '1px solid #1b1b1c',
        padding: '12px 14px',
        textAlign: 'left',
        background: '#fcf8f9',
      }}
    />
  ),
  td: (props) => (
    <td
      {...props}
      style={{
        border: '1px solid #1b1b1c',
        padding: '12px 14px',
        verticalAlign: 'top',
      }}
    />
  ),
  a: (props) => (
    <a {...props} style={{ color: '#e51152', textDecoration: 'underline' }} />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      style={{
        borderLeft: '3px solid #e51152',
        paddingLeft: '16px',
        margin: '24px 0',
        color: '#5c3f42',
      }}
    />
  ),
  pre: (props) => (
    <pre
      {...props}
      style={{
        overflowX: 'auto',
        border: '3px solid #1b1b1c',
        background: '#f8f0f1',
        padding: '18px',
        margin: '24px 0',
      }}
    />
  ),
};
