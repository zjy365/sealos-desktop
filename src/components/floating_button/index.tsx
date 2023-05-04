/* eslint-disable @next/next/no-img-element */
import useAppStore, { AppInfo } from '@/stores/app';
import { TApp } from '@/types';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import clsx from 'clsx';
import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import Iconfont from '../iconfont';
import styles from './index.module.scss';
import { debounce, throttle, fill, times } from 'lodash';

enum Suction {
  None,
  Left = 'left',
  Right = 'right'
}

export default function Index(props: any) {
  const {
    installedApps: apps,
    openApp,
    runningInfo,
    setToHighestLayer,
    currentAppPid,
    switchApp
  } = useAppStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });
  const [suction, setSuction] = useState(Suction.None);
  const [lockSuction, setLockSuction] = useState(true);
  const timeoutRef = useRef(null);
  // const fillApps = useMemo(() => {
  //   if (apps.length < 6) {
  //     apps.concat(Array(6 - length).fill(0));
  //   }
  // }, [apps]);

  const [degree, contentSkewDegree, contentRotateDegree] = useMemo(() => {
    const len = apps?.length < 6 ? 6 : apps?.length;
    const temp: number = 360 / len;
    const skewDegree = -(90 - temp);
    const rotateDegree = -(90 - temp / 2);
    return [temp, skewDegree, rotateDegree];
  }, [apps.length]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     console.log('resize');
  //     const floatButtonNav = document?.getElementById('floatButtonNav');
  //     if (floatButtonNav && suction === Suction.Left) {
  //       const distanceLeft = floatButtonNav.getBoundingClientRect().left;
  //       console.log(distanceLeft, position);
  //       setPosition({ x: position.x - distanceLeft + 10, y: position.y });
  //     }
  //   };
  //   console.log('1');
  //   window.addEventListener('resize', debounce(handleResize, 2000));
  //   return () => window.removeEventListener('resize', handleResize);
  // }, [suction]);

  if (apps?.length === 0) return null;

  // Determine whether to drag or click
  const handleCenterButton = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const d = Math.sqrt(
      (startPosition.x - endPosition.x) * (startPosition.x - endPosition.x) +
        (startPosition.y - endPosition.y) * (startPosition.y - endPosition.y)
    );
    if (d <= 5) {
      return isOpen ? onClose() : onOpen();
    }
  };

  // Calculate the correct orientation of the icon
  const calculateDegree = (index: number) => {
    const temp = -(degree * index + contentRotateDegree);
    return `rotate(${temp}deg)`;
  };

  // drag boundary calculation
  const handleDragBoundary: DraggableEventHandler = (e, position) => {
    try {
      setLockSuction(true);
      const { x, y } = position;
      const browserWidth = window.innerWidth;
      const browserHeight = window.innerHeight;
      const floatButtonNav = document?.getElementById('floatButtonNav');
      if (!floatButtonNav) return;

      const distanceLeft = floatButtonNav.getBoundingClientRect().left;
      const floatButtonNavWidth = floatButtonNav.clientHeight || 64;
      const floatButtonNavHeight = floatButtonNav.clientHeight || 64;
      // 120 is absolute positioning; 10 Boundary distance;
      const leftBoundary = -browserWidth + floatButtonNavWidth + 120 + 10;
      const rightBoundary = 120 - 10;
      const topBoundary = -browserHeight + floatButtonNavHeight + 120;
      const bottomBoundary = 120;
      const isLeft = distanceLeft < browserWidth / 2;

      setPosition({
        x: x < leftBoundary ? leftBoundary : x > rightBoundary ? rightBoundary : x,
        y: y < topBoundary ? topBoundary : y > bottomBoundary ? bottomBoundary : y
      });

      // The method of dealing with suction edge
      const handleSuction = (suction: Suction) => {
        onClose();
        setSuction(suction);
        setTimeout(() => {
          setLockSuction(false);
        }, 1000);
      };
      // Handle the suction edge
      x < leftBoundary
        ? handleSuction(Suction.Left)
        : x > rightBoundary
        ? handleSuction(Suction.Right)
        : null;

      // 1 minute no operation, automatic edge Suction
      // if (timeoutRef.current) {
      //   clearTimeout(timeoutRef.current);
      // }
      // // @ts-ignore
      // timeoutRef.current = setTimeout(() => {
      //   isLeft ? handleSuction(Suction.Left) : handleSuction(Suction.Right);
      // }, 1 * 1000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Draggable
      onStart={(e, position) => {
        setDragging(true);
        setStartPosition(position);
      }}
      onDrag={(e, position) => {
        setPosition(position);
      }}
      onStop={(e, position) => {
        handleDragBoundary(e, position);
        setDragging(false);
        setEndPosition(position);
      }}
      handle="#centerButton"
      position={position}
    >
      <div
        id="floatButtonNav"
        className={clsx(styles.container, dragging ? styles.notrans : '')}
        data-open={isOpen}
      >
        <div
          className={clsx(styles.floatBtn, dragging ? styles.notrans : '')}
          data-suction={suction}
          // onMouseEnter={dragging ? () => {} : onOpen}
          // onMouseLeave={dragging ? () => {} : onClose}
        >
          <div className={styles.innerBtn}>
            <div id="centerButton" className={styles.centerBtn} onClick={handleCenterButton}></div>
          </div>
        </div>

        {/* menu */}
        <Box
          className={styles.cricleNav}
          data-open={isOpen}
          userSelect={'none'}
          // onMouseEnter={onOpen}
          // onMouseLeave={onClose}
          style={{ display: suction === Suction.None ? 'block' : 'none' }}
        >
          {runningInfo?.map((item: AppInfo, index: number) => {
            return (
              <Box
                cursor={'pointer'}
                className={styles.navItem}
                color={'white'}
                key={item?.name}
                transform={
                  isOpen
                    ? `rotate(${degree * (index + 1)}deg) skew(${90 - degree}deg)`
                    : `rotate(75deg) skew(60deg)`
                }
                _hover={{ bg: 'rgba(21, 37, 57, 0.8)' }}
                onClick={(e) => {
                  // switchApp(item.pid);
                  openApp(item);
                  setToHighestLayer(item.pid);
                }}
              >
                <Flex
                  justifyContent={'center'}
                  pt="12px"
                  className={styles.subItem}
                  // The icon is perpendicular to the center of the circle
                  transform={`skew(${contentSkewDegree}deg) rotate(${contentRotateDegree}deg)`}
                >
                  <Flex
                    w="40px"
                    h="40px"
                    background={currentAppPid === item.pid ? 'rgba(244, 246, 248, 0.6)' : ''}
                    borderRadius={'50%'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <Flex
                      w="32px"
                      h="32px"
                      backgroundColor={'rgba(244, 246, 248, 0.9)'}
                      border={'1px solid #FFFFFF'}
                      borderRadius={'50%'}
                      boxShadow={'0px 0.5px 1px rgba(0, 0, 0, 0.2)'}
                      p={'4px'}
                      // The icon is perpendicular to the x-axis of the page
                      transform={calculateDegree(index + 1)}
                    >
                      <img src={item?.icon} alt={item?.name} />
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            );
          })}
        </Box>
        {/* Button Suction State */}
        <Flex
          alignItems={'center'}
          justifyContent={suction === Suction.Left ? 'end' : 'start'}
          userSelect={'none'}
          className={styles.suctionState}
          data-suction={suction}
          onClick={() => {
            onClose();
            setSuction(Suction.None);
          }}
          onMouseEnter={() => {
            if (!lockSuction) {
              setSuction(Suction.None);
            }
          }}
        >
          <Iconfont
            iconName={suction === Suction.Left ? 'icon-more-left' : 'icon-more-right'}
            color="#FFFFFF"
            width={24}
            height={24}
          />
        </Flex>
      </div>
    </Draggable>
  );
}
