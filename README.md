# TimeKeepR Discord Bot

Your Discord companion for effortless time tracking and attendance management. Stay organized and focused with seamless timekeeping features!

## Installation

1. Clone the repository: `git clone https://github.com/LightAndy1/TimeKeepR.git`
2. Install dependencies: `npm install`
3. Set up your environment variables in a `.env` file (see [`.env.example`](https://github.com/LightAndy1/TimeKeepR/blob/main/.env.example) for reference).
4. Start the bot: `npm run start`

## Usage

### Invite my bot

You can either invite my existing bot using this [Invite Link](https://discord.com/api/oauth2/authorize?client_id=1194633859518705714&permissions=68608&scope=bot+applications.commands) or just run your own by following the [installation](#installation) and the [usage](#run-your-own) processes.

### Run your own

1. Invite the bot to your Discord server using the following link and replacing <YOUR_BOT_ID> with your bot's ID: [Invite Link](https://discord.com/api/oauth2/authorize?client_id=<YOUR_BOT_ID>&permissions=68608&scope=bot+applications.commands)
2. Use the following commands to interact with the bot:
   - `/shifts setup add`: Adds the setup to the mongo database.
   - `/shifts setup remove`: Removes the setup from the mongo database.
   - `/shifts start`: Start your shift.
   - `/shifts stop`: Stop your shift.
   - `/shifts stats`: View your shift statistics.

## Contributing

Contributions are welcome! If you have any suggestions or found a bug, please open an issue or submit a pull request.

## License

This project is licensed under the [GNU General Public License (GPL-3.0)](LICENSE). You can find the full license text in the [LICENSE](LICENSE) file.

## Contact

For any inquiries or questions, feel free to reach out to the author, LightAndy, via email at [lightandy@example.com](mailto:andreimulte+gitcontact@gmail.com).
