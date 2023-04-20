/* eslint-disable @next/next/no-img-element */
import Draggable from 'react-draggable';
import styles from './index.module.scss';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import clsx from 'clsx';
import useAppStore from '@/stores/app';
import { TApp } from '@/types';
import { useMemo } from 'react';

export default function Index(props: any) {
  const { installedApps: apps } = useAppStore((state) => state);
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const apps = [1, 2, 3, 4, 5, 6];

  const [degree, contentSkewDegree, contentRotateDegree] = useMemo(() => {
    const temp = 360 / apps.length;
    const skewDegree = -(90 - temp);
    const rotateDegree = -(90 - temp / 2);
    return [temp, skewDegree, rotateDegree];
  }, [apps.length]);

  if (apps?.length === 0) return null;

  return (
    <Draggable
    // onStart={() => {
    //   setDragging(true);
    // }}
    // onDrag={(e, position) => {
    //   setPosition(position);
    // }}
    // onStop={(e, position) => {
    //   handleDragBoundary(e, position);
    // setDragging(false);
    // }}
    // handle=".windowHeader"
    // nodeRef={dragDom}
    // position={position}
    >
      <div className={styles.container}>
        <div className={styles.floatBtn}>
          <div className={styles.innerBtn}>
            <div className={styles.centerBtn} onClick={isOpen ? onClose : onOpen}></div>
          </div>
        </div>

        <Box className={clsx(styles.cricleNav, isOpen && styles.openedNav)}>
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
