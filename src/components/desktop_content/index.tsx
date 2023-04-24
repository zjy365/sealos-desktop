/* eslint-disable @next/next/no-img-element */
import AppWindow from '@/components/app_window';
import MoreButton from '@/components/more_button';
import UserMenu from '@/components/user_menu';
import useAppStore from '@/stores/app';
import { APPTYPE, TApp } from '@/types';
import { Box, Flex, Grid, GridItem, Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { MouseEvent, useMemo } from 'react';
import IframeWindow from './iframe_window';
import styles from './index.module.scss';

const TimeComponent = dynamic(() => import('./time'), {
  ssr: false
});

export default function DesktopContent(props: any) {
  const {
    installedApps: apps,
    openedApps,
    openApp,
    updateAppOrder,
    updateAppsMousedown
  } = useAppStore((state) => state);

  const isBrowser = typeof window !== 'undefined';
  const DesktopDom = useMemo(
    () => (isBrowser ? document.getElementById('desktop') : null),
    [isBrowser]
  );

  const desktopWidth = DesktopDom?.offsetWidth || 0;
  const desktopHeight = DesktopDom?.offsetHeight || 0;

  function renderApp(appItem: TApp) {
    switch (appItem.type) {
      case APPTYPE.APP:
        return null;

      case APPTYPE.IFRAME:
        return <IframeWindow appItem={appItem} isShow={appItem.size !== 'minimize'} />;

      default:
        break;
    }
  }

  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>, item: TApp) => {
    e.preventDefault();
    if (item?.name) {
      openApp(item);
    }
  };

  return (
    <div id="desktop" className={styles.desktop}>
      <Flex w="100%" h="100%" alignItems={'center'} flexDirection={'column'}>
        <Box mt="140px" minW={'508px'}>
          <TimeComponent />
        </Box>
        {/* desktop apps */}
        <Grid
          mt="50px"
          minW={'508px'}
          maxH={'300px'}
          templateRows={'repeat(2, 100px)'}
          templateColumns={'repeat(5, 72px)'}
          gap={'36px'}
        >
          {apps &&
            apps.map((item: TApp, index) => (
              <GridItem w="72px" h="100px" key={index} userSelect="none" cursor={'pointer'}>
                <Box
                  w="72px"
                  h="72px"
                  p={'15px'}
                  borderRadius={8}
                  backgroundColor={'rgba(244, 246, 248, 0.9)'}
                  onClick={(e) => handleDoubleClick(e, item)}
                  // onDoubleClick={(e) => handleDoubleClick(e, item)}
                >
                  <img width={'100%'} height={'100%'} alt="app" src={item?.icon}></img>
                </Box>
                <Text
                  textAlign={'center'}
                  mt="8px"
                  color={'#FFFFFF'}
                  fontWeight={500}
                  fontSize={'10px'}
                  lineHeight={'16px'}
                >
                  {item?.name}
                </Text>
              </GridItem>
            ))}
        </Grid>
        <MoreButton />
        <UserMenu />
      </Flex>

      {/* opened apps */}
      {openedApps.map((appItem) => {
        return (
          <AppWindow
            key={appItem?.name}
            style={{ height: '100vh' }}
            app={appItem}
            desktopWidth={desktopWidth}
            desktopHeight={desktopHeight}
          >
            {renderApp(appItem)}
          </AppWindow>
        );
      })}
    </div>
  );
}
