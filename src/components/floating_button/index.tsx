/* eslint-disable @next/next/no-img-element */
import useAppStore from '@/stores/app';
import { TApp } from '@/types';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import clsx from 'clsx';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import styles from './index.module.scss';
import Iconfont from '../iconfont';
enum Suction {
  None,
  Left = 'left',
  Right = 'right'
}

export default function Index(props: any) {
  const { installedApps: apps, openApp } = useAppStore((state) => state);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });
  const [suction, setSuction] = useState(Suction.None);
  const [lockSuction, setLockSuction] = useState(true);

  const [degree, contentSkewDegree, contentRotateDegree] = useMemo(() => {
    const len = apps?.length < 6 ? 6 : apps?.length;
    const temp = 360 / len;
    const skewDegree = -(90 - temp);
    const rotateDegree = -(90 - temp / 2);
    return [temp, skewDegree, rotateDegree];
  }, [apps.length]);

  // useEffect(() => {
  //   window.addEventListener('resize', function () {
  //     console.log(1);
  //   });
  // }, []);

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
      const floatButtonNavWidth = document?.getElementById('floatButtonNav')?.clientHeight || 64;
      const floatButtonNavHeight = document?.getElementById('floatButtonNav')?.clientHeight || 64;
      console.log(position, floatButtonNavHeight, floatButtonNavWidth);

      // 120 is absolute positioning; 10 Boundary distance;
      const leftBoundary = -browserWidth + floatButtonNavWidth + 120 + 10;
      const rightBoundary = 120 - 10;
      const topBoundary = -browserHeight + floatButtonNavHeight + 120;
      const bottomBoundary = 120;

      setPosition({
        x: x < leftBoundary ? leftBoundary : x > rightBoundary ? rightBoundary : x,
        y: y < topBoundary ? topBoundary : y > bottomBoundary ? bottomBoundary : y
      });

      // Button Suction State
      if (x < leftBoundary) {
        setSuction(Suction.Left);
        setTimeout(() => {
          setLockSuction(false);
        }, 1000);
      } else if (x > rightBoundary) {
        setSuction(Suction.Right);
        setTimeout(() => {
          setLockSuction(false);
        }, 1000);
      }
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
      // nodeRef={dragDom}
      position={position}
    >
      <div
        id="floatButtonNav"
        className={clsx(styles.container, dragging ? styles.notrans : '')}
        data-isopen={isOpen}
      >
        <div
          className={clsx(styles.floatBtn, dragging ? styles.notrans : '')}
          data-suction={suction}
        >
          <div className={styles.innerBtn}>
            <div id="centerButton" className={styles.centerBtn} onClick={handleCenterButton}></div>
          </div>
        </div>

        {/* menu */}
        <Box
          className={clsx(styles.cricleNav, isOpen && styles.openedNav)}
          data-open={isOpen}
          userSelect={'none'}
          style={{ display: suction === Suction.None ? 'block' : 'none' }}
        >
          {apps?.map((item: TApp, index: number) => {
            return (
              <Box
                cursor={'pointer'}
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
                  >
                    <img src={item?.icon} alt={item?.name} />
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
