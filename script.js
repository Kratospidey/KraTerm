console.log("Hello world");

document.getElementById("input").addEventListener("keydown", function (event) {
	if (event.key === "Enter") {
		event.preventDefault();

		let input = event.target.innerText.trim();
		let output = document.getElementById("output");

		// Create the input line with the updated prompt
		output.innerHTML += `<div class="input-line">${getCurrentPrompt()}<div>${input}</div></div>`;

		let commandOutput = processCommand(input);
		if (commandOutput !== undefined) {
			output.innerHTML += `<div>${commandOutput}</div>`;
		}

		event.target.innerText = "";
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
		case "clear":
			clearTerminal();
			return "";
		case "uname":
			if (tokens[1]) {
				// Call the setUsername function with the new username
				return setUsername(tokens.slice(1).join(" "));
			} else {
				return "Usage: uname <newUsername>";
			}
		default:
			return `Command '${command}' not found`;
	}
}

function clearTerminal() {
	// Get the terminal output element
	const output = document.getElementById("output");

	// Set the innerHTML of the output element to an empty string, effectively clearing it
	output.innerHTML = "";
}

document.addEventListener("keydown", function (event) {
	// Check if Ctrl or Command is pressed along with the 'L' key
	if ((event.ctrlKey || event.metaKey) && event.key === "l") {
		event.preventDefault(); // Prevent the default action of the browser
		clearTerminal();
	}
});

function setUsername(newUsername) {
	if (newUsername) {
		// Update the username in the prompt for all instances
		let usernameSpans = document.querySelectorAll("#username");
		usernameSpans.forEach((span) => (span.innerText = newUsername.trim()));

		// Update the username in the prompt for future input lines
		const currentPrompt = document.querySelector(".prompt");
		if (currentPrompt) {
			currentPrompt.innerHTML = `<span id="username">${newUsername.trim()}</span>@terminal.kratospidey.dev:~$`;
		}

		return `Username changed to ${newUsername.trim()}`;
	} else {
		return "Usage: uname <newUsername>"; // Error message if no username is provided
	}
}

// Function to return the current prompt with the updated username
function getCurrentPrompt() {
	return document.querySelector(".prompt").outerHTML;
}
