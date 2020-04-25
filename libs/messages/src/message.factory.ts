import { MessageTypes } from '@deliveryapp/common';
import { Message } from '@deliveryapp/core';

import { isNil } from 'lodash';

const messageText = {
  [MessageTypes.ORDER_CREATE]: (id: number) => `New order # ${id} created`,
  [MessageTypes.ORDER_UPDATE]: (id: number) => `Order # ${id} has been updated`,
  [MessageTypes.PAYMENT_CREATE]: (id: number) => `New invoice created # ${id}`,
  [MessageTypes.PAYMENT_UPDATE]: (id: number) =>
    `Invoice # ${id} has been updated`,
};

export const createMessage = (
  type: keyof typeof MessageTypes,
  data: { id: number; recipientId?: number },
): Message => {
  const { id, recipientId } = data;

  return {
    text: messageText[type](id),
    recipientId: recipientId,
    forEmployee: isNil(recipientId),
  };
};
