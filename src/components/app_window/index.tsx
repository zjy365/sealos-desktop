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
  console.log('asdas');

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
      <div className={styles.floatTab}>12321</div>
    </Draggable>
  );
}
