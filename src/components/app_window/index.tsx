import useAppStore from '@/stores/app';
import { TApp } from '@/types';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import Image from 'next/image';
import styles from './index.module.scss';
import { Box, Flex } from '@chakra-ui/react';

export default function AppWindow(props: {
  style?: React.CSSProperties;
  app: TApp;
  children: any;
  desktopHeight: number;
  desktopWidth: number;
}) {
  const { app: wnapp, desktopHeight, desktopWidth } = props;
  const { closeApp, updateOpenedAppInfo, switchApp, currentApp, openedApps } = useAppStore(
    (state) => state
  );
  const dragDom = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDragBoundary: DraggableEventHandler = (e, position) => {
    const { x, y } = position;
    const appHeaderHeight = dragDom.current?.querySelector('.windowHeader')?.clientHeight || 30;
    const appHeaderWidth = dragDom.current?.querySelector('.windowHeader')?.clientWidth || 3000;

    if (currentApp?.size === 'maxmin') {
      let upperBoundary = -desktopHeight * 0.1;
      let lowerBoundary = desktopHeight * 0.9 - appHeaderHeight;
      setPosition({
        x:
          x < 0
            ? x < -1.1 * appHeaderWidth // (0.8width + width/0.6*0.2)
              ? 0
              : x
            : x > 1.1 * appHeaderWidth
            ? 0
            : x,
        y: y < upperBoundary ? upperBoundary : y > lowerBoundary ? 0 : y
      });
    } else {
      setPosition({
        x: x < 0 ? (x < -0.8 * appHeaderWidth ? 0 : x) : x > 0.8 * appHeaderWidth ? 0 : x,
        y: y < 0 ? 0 : y > desktopHeight - appHeaderHeight ? 0 : y
      });
    }
  };

  return (
    <Draggable
      onStart={() => {
        setDragging(true);
      }}
      onDrag={(e, position) => {
        setPosition(position);
      }}
      onStop={(e, position) => {
        handleDragBoundary(e, position);
        setDragging(false);
      }}
      handle=".windowHeader"
      nodeRef={dragDom}
      position={position}
    >
      <Box
        ref={dragDom}
        className={clsx(styles.floatTab, dragging ? styles.notrans : '')}
        data-size={wnapp.size}
        data-hide={!wnapp.isShow}
        id={wnapp.icon + 'App'}
        style={{
          zIndex: wnapp.zIndex
        }}
        background={'#fff'}
      >
        <Box
          className={'windowHeader'}
          onDoubleClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            updateOpenedAppInfo({
              ...wnapp,
              size: wnapp.size === 'maxmin' ? 'maximize' : 'maxmin',
              cacheSize: wnapp.size === 'maxmin' ? 'maximize' : 'maxmin'
            });
            setPosition({ x: 0, y: 0 });
          }}
        >
          <Flex
            flexShrink={0}
            h={'28px'}
            justifyContent={'space-between'}
            alignItems={'center'}
            position={'relative'}
            borderRadius={'6px 6px 0 0'}
            background={'#F7F8FA'}
            className={styles.toolbar}
            onClick={(e) => {
              switchApp({ ...wnapp, mask: false }, 'clickMask');
            }}
          >
            {/* <div className={clsx(styles.topInfo, 'flex flex-grow items-center ml-4')}>
              <img src={wnapp.icon} alt={wnapp.name} width={14} />
              <div className={clsx('ml-2')} style={{ color: wnapp.menuData?.nameColor }}>
                {wnapp.name}
              </div>
              {wnapp.menuData?.helpDropDown && <HelpDropDown />}
              {!!wnapp.menuData?.helpDocs && (
                <HelpDocs
                  url={typeof wnapp.menuData?.helpDocs === 'string' ? wnapp.menuData?.helpDocs : ''}
                />
              )}
            </div> */}

            <Flex alignItems={'center'} className={clsx(styles.actbtns)}>
              <div
                className={styles.uicon}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  updateOpenedAppInfo({
                    ...wnapp,
                    size: 'minimize'
                  });
                }}
              >
                <Image src={'/icons/minimize.png'} width={12} height={12} alt="minimize" />
              </div>

              <Box
                h="100%"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  updateOpenedAppInfo({
                    ...wnapp,
                    size: wnapp.size === 'maxmin' ? 'maximize' : 'maxmin',
                    cacheSize: wnapp.size === 'maxmin' ? 'maximize' : 'maxmin'
                  });
                  setPosition({ x: 0, y: 0 });
                }}
              >
                <div className={styles.uicon}>
                  <Image
                    src={wnapp.size === 'maximize' ? '/icons/maximize.png' : '/icons/maxmin.png'}
                    width={12}
                    height={12}
                    alt="minimize"
                  />
                </div>
              </Box>
              <div
                className={clsx(styles.uicon)}
                data-type={'close'}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  updateOpenedAppInfo({
                    ...wnapp,
                    isShow: false
                  });
                  closeApp(wnapp.name);
                }}
              >
                <Image src={'/icons/close.png'} width={12} height={12} alt="close" />
              </div>
            </Flex>
          </Flex>
        </Box>
        <Box flexGrow={1} overflow={'hidden'}>
          {wnapp.mask && (
            <div
              className={styles.appMask}
              onClick={() => {
                switchApp({ ...wnapp, mask: false }, 'clickMask');
              }}
            ></div>
          )}
          {props.children}
        </Box>
        {/* <Flex position={'relative'} w={'100%'} borderRadius={'0 0 6px 6px'} overflow={'hidden'}>
          <div className="restWindow flex-grow flex flex-col relative">
            <div className="flex-grow overflow-hidden">
              {wnapp.mask && (
                <div
                  className={styles.appMask}
                  onClick={() => {
                    switchApp({ ...wnapp, mask: false }, 'clickMask');
                  }}
                ></div>
              )}
              {props.children}
            </div>
          </div>
        </Flex> */}
      </Box>
    </Draggable>
  );
}
