import { Pid, TApp } from '@/types';
import { useMemo } from 'react';
import styles from './index.module.scss';
import useAppStore from '@/stores/app';

export default function Iframe_window({ pid }: { pid: Pid }) {
  const findAppInfo = useAppStore((state) => state.findAppInfo);
  const app = findAppInfo(pid);
  const url = useMemo(() => app?.data?.url || '', [app?.data?.url]);

  return (
    <div className={styles.iframeContainer}>
      {!!url && (
        <iframe
          className={styles.iframeContainer}
          src={url}
          allow="camera;microphone;clipboard-write;"
          id={`app-window-${app?.key}`}
        />
      )}
    </div>
  );
}
