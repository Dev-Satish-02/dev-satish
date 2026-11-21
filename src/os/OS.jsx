import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PROFILE } from '../data/content';
import { NOTES } from './notes';
import Desktop from './Desktop';
import Phone from './Phone';

const PHONE = '(max-width: 760px)';
const subscribe = (cb) => {
  const m = window.matchMedia(PHONE);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
const usePhone = () => useSyncExternalStore(subscribe, () => window.matchMedia(PHONE).matches);

// the résumé appears only once public/resume.pdf exists
const resumeHref = `${import.meta.env.BASE_URL}${PROFILE.resume}`;
function useResume() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(resumeHref, { method: 'HEAD' })
      .then((r) => alive && setOk(r.ok && (r.headers.get('content-type') || '').includes('pdf')))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return ok ? resumeHref : null;
}

// a link into the site (/blog/strategy/gtm-playbook, or an old #experience) names a note
function noteFromLocation({ pathname, hash }) {
  const post = NOTES.find((n) => n.path && pathname.endsWith(n.path));
  if (post) return post.id;
  const h = hash.replace('#', '');
  return NOTES.find((n) => n.id === h)?.id || null;
}

export default function OS() {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = usePhone();
  const resume = useResume();
  const [linked] = useState(() => noteFromLocation(location));
  const [noteId, setNoteId] = useState(linked || (phone ? null : 'about'));

  const openNote = useCallback(
    (id) => {
      setNoteId(id);
      const path = NOTES.find((n) => n.id === id)?.path || '/';
      if (path !== location.pathname || location.hash) navigate(path, { replace: true });
    },
    [navigate, location.pathname, location.hash]
  );

  // the desk always has a note open; the phone starts on its home screen
  const deskNote = noteId || 'about';

  // the tab is always just the name
  useEffect(() => {
    document.title = PROFILE.name;
  }, []);

  return phone ? (
    <Phone noteId={noteId} openNote={openNote} resume={resume} startApp={linked ? 'notes' : null} />
  ) : (
    <Desktop noteId={deskNote} openNote={openNote} resume={resume} />
  );
}
