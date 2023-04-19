import { TApp } from '@/types';
import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';

export default function IframApp({ appItem, isShow }: { appItem: TApp; isShow: boolean }) {
  const Iframe = useRef<HTMLIFrameElement>(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const loadingTimer = useRef<any>(null);
  const [url, setUrl] = useState(appItem.data?.url || '');

  useEffect(() => {
    // open timer
    loadingTimer.current = setInterval(() => {
      setLoadingTime((state) => state + 1);
    }, 1000);

    // listen desktop keydown refresh
    const listenDesktopKeyDown = (event: KeyboardEvent) => {
      if (
        (event.keyCode === 116 || (event.ctrlKey && event.keyCode === 82)) &&
        isShow &&
        appItem.data?.url
      ) {
        setLoading(true);
        setUrl('');
        setTimeout(() => {
          setUrl(appItem.data.url);
        }, 100);
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', listenDesktopKeyDown);

    return () => {
      clearInterval(loadingTimer.current);
      window.removeEventListener('keydown', listenDesktopKeyDown);
    };
  }, [appItem.data.url, isShow]);

  return (
    <Box h="100%">
      {loading && (
        <Flex h="100%" justifyContent={'center'}>
          loading
          {/* <Spinner label={'应用启动中... ' + loadingTime + ' 秒'} size={'large'} /> */}
        </Flex>
      )}

      {!!url && (
        <iframe
          className={styles.iframeContainer}
          ref={Iframe}
          src={url}
          allow="camera;microphone;clipboard-write;"
          id={`app-window-${appItem.key}`} // key format sealos.image.hub
          onLoad={() => {
            clearInterval(loadingTimer.current);
            setLoading(false);
            setLoadingTime(0);
          }}
        />
      )}
    </Box>
  );
}
