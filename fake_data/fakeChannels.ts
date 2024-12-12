import { faker } from "@faker-js/faker/.";

const randomeChannelSchema = () => {
  return {
    channelName: faker.string.sample(),
    messages: faker.string.sample(),
  };
};

export const createChannels = (count: number) => {
  const channels = faker.helpers.multiple(randomeChannelSchema, {
    count: count,
  });
  return channels;
};
