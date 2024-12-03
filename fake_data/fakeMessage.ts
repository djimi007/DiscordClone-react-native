import { faker } from "@faker-js/faker";

const randomeMessageSchema = () => {
  return {
    senderId: faker.string.uuid(),
    reciverId: faker.string.uuid(),
    message: faker.string.sample(),
  };
};

export const createMessages = (count: number) => {
  const messages = faker.helpers.multiple(randomeMessageSchema, {
    count: count,
  });
  return messages;
};
