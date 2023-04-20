import { Background } from '@/components/background';
import DesktopContent from '@/components/desktop_content';
import useAppStore from '@/stores/app';
import useSessionStore from '@/stores/session';
import Head from 'next/head';
import { useEffect } from 'react';
import { createMasterAPP } from 'sealos-desktop-sdk/master';
import styles from './index.module.scss';
import FloatButton from '@/components/floating_button';

export default function Layout(props: any) {
  const { init } = useAppStore((state) => state);
  const session = useSessionStore((s) => s.session);

  useEffect(() => {
    (async () => {
      // Initialize, get user information, install application information, etc.
      await init();
    })();
  }, [init]);

  useEffect(() => {
    return createMasterAPP();
  }, [session]);

  return (
    <>
      <Head>
        <title>sealos Cloud</title>
        <meta name="description" content="sealos cloud dashboard" />
      </Head>
      <div className={styles.desktopContainer}>
        <Background />
        <DesktopContent />
        <FloatButton />
      </div>
    </>
  );
}
