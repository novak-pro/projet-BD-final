import toast from 'react-hot-toast';

export const notifySuccess = (msg: string) => toast.success(msg, {
  style: { background: '#16a34a', color: '#fff', fontSize: '14px', borderRadius: '12px', padding: '12px 20px' },
  iconTheme: { primary: '#fff', secondary: '#16a34a' },
  duration: 3000,
});

export const notifyError = (msg: string) => toast.error(msg, {
  style: { background: '#dc2626', color: '#fff', fontSize: '14px', borderRadius: '12px', padding: '12px 20px' },
  iconTheme: { primary: '#fff', secondary: '#dc2626' },
  duration: 4000,
});
