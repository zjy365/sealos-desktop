/* eslint-disable @next/next/no-img-element */
import useAppStore from '@/stores/app';
import { TApp } from '@/types';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import clsx from 'clsx';
import { MouseEvent, useMemo, useState } from 'react';
import Draggable from 'react-draggable';
import styles from './index.module.scss';

export default function Index(props: any) {
  const { installedApps: apps } = useAppStore((state) => state);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });

  const [degree, contentSkewDegree, contentRotateDegree] = useMemo(() => {
    const temp = 360 / apps.length;
    const skewDegree = -(90 - temp);
    const rotateDegree = -(90 - temp / 2);
    return [temp, skewDegree, rotateDegree];
  }, [apps.length]);

  if (apps?.length === 0) return null;

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

  // const handleDragBoundary: DraggableEventHandler = (e, position) => {
  //   const { x, y } = position;
  //   const appHeaderHeight = dragDom.current?.querySelector('.windowHeader')?.clientHeight || 30;
  //   const appHeaderWidth = dragDom.current?.querySelector('.windowHeader')?.clientWidth || 3000;

  //   if (currentApp?.size === 'maxmin') {
  //     let upperBoundary = -desktopHeight * 0.1;
  //     let lowerBoundary = desktopHeight * 0.9 - appHeaderHeight;
  //     setPosition({
  //       x:
  //         x < 0
  //           ? x < -1.1 * appHeaderWidth // (0.8width + width/0.6*0.2)
  //             ? 0
  //             : x
  //           : x > 1.1 * appHeaderWidth
  //           ? 0
  //           : x,
  //       y: y < upperBoundary ? upperBoundary : y > lowerBoundary ? 0 : y
  //     });
  //   } else {
  //     setPosition({
  //       x: x < 0 ? (x < -0.8 * appHeaderWidth ? 0 : x) : x > 0.8 * appHeaderWidth ? 0 : x,
  //       y: y < 0 ? 0 : y > desktopHeight - appHeaderHeight ? 0 : y
  //     });
  //   }
  // };

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
        // handleDragBoundary(e, position);
        setDragging(false);
        setEndPosition(position);
      }}
      handle="#centerButton"
      // nodeRef={dragDom}
      // position={position}
    >
      <div className={styles.container}>
        <div className={styles.floatBtn}>
          <div className={styles.innerBtn}>
            <div id="centerButton" className={styles.centerBtn} onClick={handleCenterButton}></div>
          </div>
        </div>

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
                  mt="8px"
                  className={styles.subItem}
                  transform={`skew(${contentSkewDegree}deg) rotate(${contentRotateDegree}deg)`}
                >
                  <Flex
                    w="32px"
                    h="32px"
                    backgroundColor={'rgba(244, 246, 248, 0.9)'}
                    borderRadius={'50%'}
                    p={'4px'}
                  >
                    <img src={item?.icon} alt={item?.name} />
                  </Flex>
                </Flex>
              </Box>
            );
          })}
        </Box>
      </div>
    </Draggable>
  );
}
