import { Link } from 'react-router-dom';

// Section links point at the home page hash; route links are plain routes.
export default function SiteLink({ item, className, onClick, children }) {
  const to = item.to || { pathname: '/', hash: `#${item.hash}` };
  return (
    <Link to={to} className={className} onClick={onClick} data-hash={item.hash}>
      {children}
    </Link>
  );
}
