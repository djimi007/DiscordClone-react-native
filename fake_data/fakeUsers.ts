import { faker } from "@faker-js/faker";

function randomUserSchema() {
  return {
    userId: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
  };
}

export const createUsers = (count: number) => {
  return faker.helpers.multiple(randomUserSchema, {
    count,
  });
};
