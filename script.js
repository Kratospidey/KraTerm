console.log("Hello world");

document.getElementById("input").addEventListener("keydown", function (event) {
	if (event.key === "Enter") {
		event.preventDefault(); // Prevents the default "Enter" key behavior

		// Get the input text
		let input = event.target.innerText.trim();
		let output = document.getElementById("output");

		// Execute the command
		output.innerHTML += `<div class="input-line">${this.previousElementSibling.outerHTML}<div>${input}</div></div>`;

		// Process the command and display the output
		let commandOutput = processCommand(input);
		if (commandOutput !== undefined) {
			output.innerHTML += `<div>${commandOutput}</div>`;
		}

		// Clear the input
		event.target.innerText = "";

		// Scroll to the bottom of the terminal output
		let terminal = document.getElementById("terminal");
		terminal.scrollTop = terminal.scrollHeight;
	}
});

function processCommand(command) {
	// Split the command and its arguments
	let tokens = command.split(" ");
	let cmd = tokens[0].toLowerCase();

	switch (cmd) {
		case "echo":
			// Join the arguments back into a string and return
			return tokens.slice(1).join(" ");
		default:
			return `Command '${command}' not found`;
	}
}
