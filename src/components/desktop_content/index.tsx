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
import useDesktopGlobalConfig from '@/stores/desktop';

const TimeComponent = dynamic(() => import('./time'), {
  ssr: false
});

export default function DesktopContent(props: any) {
  const {
    installedApps: apps,
    runningInfo,
    openApp,
  } = useAppStore((state) => state);

  const isBrowser = typeof window !== 'undefined';
  // set DesktopHeight from globalconfig
  const { setDesktopHeight } = useDesktopGlobalConfig();
  
  useMemo(
    () => isBrowser && setDesktopHeight(document.getElementById('desktop')?.clientHeight || 0),
    [isBrowser, setDesktopHeight]
  );

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
                  border={'1px solid #FFFFFF'}
                  borderRadius={8}
                  boxShadow={'0px 1.16667px 2.33333px rgba(0, 0, 0, 0.2)'}
                  backgroundColor={'rgba(244, 246, 248, 0.9)'}
                  onClick={(e) => handleDoubleClick(e, item)}
                  // onDoubleClick={(e) => handleDoubleClick(e, item)}
                >
                  <img width={'100%'} height={'100%'} alt="app" src={item?.icon}></img>
                </Box>
                <Text
                  textShadow={'0px 1px 2px rgba(0, 0, 0, 0.4)'}
                  textAlign={'center'}
                  mt="8px"
                  color={'#FFFFFF'}
                  // fontWeight={400}
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
      {runningInfo.map((process) => {
        return (
          <AppWindow
            key={process.pid}
            style={{ height: '100vh' }}
            pid={process.pid}
          >
            <IframeWindow pid={process.pid} />
          </AppWindow>
        );
      })}
    </div>
  );
}
