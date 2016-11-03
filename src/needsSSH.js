
const REMOTE = "remote";

const isRemote = function (command) { return command.location === REMOTE };

const needsSSH = function (upload, commands) {
  return upload ||
          (commands &&
            (commands.pre && commands.pre.some(isRemote) || commands.post && commands.post.some(isRemote))
          );
};

export default needsSSH;
