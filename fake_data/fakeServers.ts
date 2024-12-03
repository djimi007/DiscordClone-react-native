import { faker } from "@faker-js/faker";
import { createUsers } from "./fakeUsers";
import { createMessages } from "./fakeMessage";

function randomServersSchema() {
  return {
    serverCreator: faker.string.uuid(),
    serverIcon: faker.image.url(),
    serverName: faker.company.name(),
    members: createUsers(9),
    chat: createMessages(9),
  };
}

export const createServers = (count: number) => {
  const servers = faker.helpers.multiple(randomServersSchema, {
    count: count,
  });

  return servers;
};
