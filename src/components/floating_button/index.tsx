/* eslint-disable @next/next/no-img-element */
import useAppStore from '@/stores/app';
import { TApp } from '@/types';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import clsx from 'clsx';
import { MouseEvent, useMemo, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import styles from './index.module.scss';

export default function Index(props: any) {
  const { installedApps: apps, openApp } = useAppStore((state) => state);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });
  const [suction, isSuction] = useState(false);

  const [degree, contentSkewDegree, contentRotateDegree] = useMemo(() => {
    const len = apps?.length < 6 ? 6 : apps?.length;
    const temp = 360 / len;
    const skewDegree = -(90 - temp);
    const rotateDegree = -(90 - temp / 2);
    return [temp, skewDegree, rotateDegree];
  }, [apps.length]);

  const [floatCricleNavHeight, floatCricleNavWidth] = useMemo(() => {
    const w = document?.getElementById('floatCricleNav')?.clientHeight || 64;
    const h = document?.getElementById('floatCricleNav')?.clientHeight || 64;
    return [w, h];
  }, []);

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
      const { x, y } = position;
      const browserWidth = window.innerWidth;
      const browserHeight = window.innerHeight;
      console.log(position, floatCricleNavHeight, floatCricleNavWidth);

      // 120 is absolute positioning
      const leftBoundary = -browserWidth + floatCricleNavWidth + 120;
      const rightBoundary = 120;
      const topBoundary = -browserHeight + floatCricleNavHeight + 120;
      const bottomBoundary = 120;

      setPosition({
        x: x < leftBoundary ? leftBoundary : x > rightBoundary ? rightBoundary : x,
        y: y < topBoundary ? topBoundary : y > bottomBoundary ? bottomBoundary : y
      });
    } catch (error) {}
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
      // nodeRef={dragDom}
      position={position}
    >
      <div id="floatCricleNav" className={styles.container} data-isopen={isOpen}>
        <div className={styles.floatBtn}>
          <div className={styles.innerBtn}>
            <div id="centerButton" className={styles.centerBtn} onClick={handleCenterButton}></div>
          </div>
        </div>

        {/* menu */}
        <Box
          className={clsx(styles.cricleNav, isOpen && styles.openedNav)}
          data-open={isOpen}
          userSelect={'none'}
        >
          {apps?.map((item: TApp, index: number) => {
            return (
              <Box
                className={styles.navItem}
                color={'white'}
                key={item?.name}
                backgroundColor={'#727C88'}
                border={'1px solid #626E80'}
                transform={
                  isOpen
                    ? `rotate(${degree * (index + 1)}deg) skew(${90 - degree}deg)`
                    : `rotate(75deg) skew(60deg)`
                }
              >
                <Flex
                  justifyContent={'center'}
                  pt="8px"
                  className={styles.subItem}
                  // The icon is perpendicular to the center of the circle
                  transform={`skew(${contentSkewDegree}deg) rotate(${contentRotateDegree}deg)`}
                >
                  <Flex
                    w="32px"
                    h="32px"
                    backgroundColor={'rgba(244, 246, 248, 0.9)'}
                    borderRadius={'50%'}
                    p={'4px'}
                    // The icon is perpendicular to the x-axis of the page
                    transform={calculateDegree(index + 1)}
                    onClick={() => openApp(item)}
                  >
                    <img src={item?.icon} alt={item?.name} />
                  </Flex>
                </Flex>
              </Box>
            );
          })}
        </Box>
        {/* Button Suction State */}
      </div>
    </Draggable>
  );
}
