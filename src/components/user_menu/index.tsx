import { Box, Flex } from '@chakra-ui/react';
import Iconfont from '../iconfont';
import Notification from '@/components/notification';
import { useState } from 'react';

export default function Index(props: any) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationAmount, setNotificationAmount] = useState(0);

  return (
    <Flex alignItems={'center'} position={'absolute'} top={'48px'} right={'48px'}>
      <Flex
        w="32px"
        h="32px"
        mx="8px"
        borderRadius={'50%'}
        background={'rgba(244, 246, 248, 0.7)'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Iconfont iconName="icon-user" width={20} height={20} color="#24282C"></Iconfont>
        {showNotification && (
          <Notification
            isShow={showNotification}
            onClose={() => setShowNotification(false)}
            onAmount={(amount) => setNotificationAmount(amount)}
          />
        )}
      </Flex>
      <Flex
        w="32px"
        h="32px"
        borderRadius={'50%'}
        background={'rgba(244, 246, 248, 0.7)'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Iconfont iconName="icon-notifications" width={20} height={20} color="#24282C"></Iconfont>
      </Flex>
    </Flex>
  );
}
