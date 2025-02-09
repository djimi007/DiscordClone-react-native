import { createChannels } from "./fakeChannels";
import { createMessages } from "./fakeMessage";
import { createServers } from "./fakeServers";
import { createUsers } from "./fakeUsers";

const servers = createServers(20);
const users = createUsers(10);
const messages = createMessages(10);
const channels = createChannels(10);

export { servers, users, messages, channels };
