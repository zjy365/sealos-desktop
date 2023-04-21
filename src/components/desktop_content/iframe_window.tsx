import { TApp } from '@/types';
import { useMemo } from 'react';
import styles from './index.module.scss';

export default function Iframe_window({ appItem, isShow }: { appItem: TApp; isShow: boolean }) {
  const url = useMemo(() => appItem?.data?.url || '', [appItem?.data?.url]);

  return (
    <div className={styles.iframeContainer}>
      {!!url && (
        <iframe
          className={styles.iframeContainer}
          src={url}
          allow="camera;microphone;clipboard-write;"
          id={`app-window-${appItem.key}`}
        />
      )}
    </div>
  );
}
