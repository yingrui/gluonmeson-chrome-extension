export const parseCommand = (
  userInput: string,
  commands: CommandOption[],
): [string, string] => {
  const matchedCommand = commands.find((command) =>
    userInput.match(new RegExp(`(?:^|\\s)/${command.value}\\s+`)),
  );

  if (matchedCommand) {
    // Use regex group match to extract the input after the command
    const input = userInput.match(
      new RegExp(`(?:^|\\s)/${matchedCommand.value}\\s+(.*)`),
    )[1];
    return [matchedCommand.value, input];
  }
  return ["chat", userInput];
};
