import { TApp } from '@/types';
import { Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import styles from './index.module.scss';

export default function Iframe_window({ appItem, isShow }: { appItem: TApp; isShow: boolean }) {
  const url = useMemo(() => appItem?.data?.url || '', [appItem?.data?.url]);

  return (
    <Box h="100%">
      {!!url && (
        <iframe
          className={styles.iframeContainer}
          src={url}
          allow="camera;microphone;clipboard-write;"
          id={`app-window-${appItem.key}`}
        />
      )}
    </Box>
  );
}
