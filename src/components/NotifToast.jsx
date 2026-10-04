import { useEffect } from 'react';

function NotifToast({ msg, type = 'positive', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="notif-toast-wrap">
      <div className={`notif-toast ${type === 'negative' ? 'notif-toast-negative' : ''}`}>
        <div className="notif-toast-brand">WHEW</div>
        {msg}
        <button onClick={onClose} className="notif-toast-close">×</button>
      </div>
    </div>
  );
}

export default NotifToast;