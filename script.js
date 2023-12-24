console.log("Hello world");

const commands = [
	"echo",
	"clear",
	"uname",
	"history",
	"help",
	"socials",
	"whoami",
	"about",
	"email",
	"pwd",
	"welcome",
	"themes",
];

const themes = {
	default: "Default Theme",
	monokai: "Monokai Theme",
	"solarized-dark": "Solarized Dark Theme",
	dracula: "Dracula Theme",
	"gruvbox-dark": "Gruvbox Dark Theme",
	nord: "Nord Theme",
	catppuccin: "Catppuccin Theme",
	"tokyo-night": "Tokyo Night Theme",
	"one-dark": "One Dark Theme",
	ubuntu: "Ubuntu Theme",
	espresso: "Espresso Theme",
	"solarized-light": "Solarized Light Theme",
	"github-light": "GitHub Light Theme",
	"atom-light": "Atom Light Theme",
	// ... add any other themes here
};

const aboutText = `
<pre class="error-text">
Hey, I'm Param Makwana! 
I'm a third year student at Mukesh Patel School of Technology Management & Engineering, currently pursuing a BTECH degree in information technology. 
My major interests are creating cools stuff such as bots, interactive websites and tools to name a few. I plan to do a lot more stuff in future!
</pre>`;

const autocompleteWords = commands;

const terminal = document.querySelector(".terminal");

const socialLinks = {
	github: "https://github.com/kratospidey",
	devto: "https://dev.to/kratospidey",
	linkedin: "https://www.linkedin.com/in/kratospidey",
};

let commandHistory = [];
let historyIndex = -1; // Will track the current position in the command history

const helpText = `
<pre>
    <span class="keyword-text">echo [text]</span>  - <span class="normal-text">Prints [text] to the terminal.</span>
    <span class="keyword-text">clear</span>        - <span class="normal-text">Clears the terminal.</span>
    <span class="keyword-text">history</span>      - <span class="normal-text">Shows your history of entered commands.</span>
    <span class="keyword-text">uname [name]</span> - <span class="normal-text">Sets your username to [name] for this session.</span>
    <span class="keyword-text">socials</span>      - <span class="normal-text">check out my social accounts</span>
    <span class="keyword-text">whoami</span>       - <span class="normal-text">who am i?</span>
    <span class="keyword-text">about</span>        - <span class="normal-text">about me!</span>
    <span class="keyword-text">email</span>        - <span class="normal-text">send me an email</span>
    <span class="keyword-text">pwd</span>          - <span class="normal-text">prints the working directory</span>
    <span class="keyword-text">welcome</span>      - <span class="normal-text">prints the hero section (!NOT WORKING YET)</span>
    <span class="keyword-text">themes</span>       - <span class="normal-text">check available themes</span>


    <span class="error-text">Up Arrow</span>      => <span class="normal-text">Go up in history.</span>
    <span class="error-text">Down Arrow</span>    => <span class="normal-text">Go down in history.</span>
    <span class="error-text">Ctrl + l</span>      => <span class="normal-text">Clear the terminal.</span>
    <span class="error-text">Ctrl + c</span>      => <span class="normal-text">Reset input.</span>
</pre>
`;

const unameErrorText = `<span class="error-text">Use</span> <span class="keyword-text">uname &lt;name&gt;</span> <span class="error-text">to set your username</span>`;

document.getElementById("input").addEventListener("keydown", function (event) {
	// autocomplete function
	if (event.key === "Tab") {
		event.preventDefault(); // Prevent the default tab behavior
		autocomplete(this); // Call the autocomplete function
	}

	// Check if Ctrl or Command is pressed along with the 'L' key
	if ((event.ctrlKey || event.metaKey) && event.key === "l") {
		event.preventDefault(); // Prevent the default action of the browser
		clearTerminal();
	}

	if ((event.ctrlKey || event.metaKey) && event.key === "c") {
		event.preventDefault(); // Prevent the default action of the browser
		resetTerminal();
		historyIndex = commandHistory.length; // Reset history index to the end
	}

	if (event.key === "ArrowUp") {
		event.preventDefault(); // Prevent the default action to avoid scrolling the page
		if (historyIndex > 0) {
			historyIndex--; // Move up in the history
			this.innerText = commandHistory[historyIndex]; // Set the input to the command
			placeCaretAtEnd(this); // Move the cursor to the end of the input
		}
	} else if (event.key === "ArrowDown") {
		event.preventDefault();
		if (historyIndex < commandHistory.length - 1) {
			historyIndex++; // Move down in the history
			this.innerText = commandHistory[historyIndex];
			placeCaretAtEnd(this);
		} else if (historyIndex === commandHistory.length - 1) {
			// If at the end of the history, clear the input
			historyIndex = commandHistory.length; // Reset the history index
			this.innerText = "";
		}
	}

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

		terminal.scrollTop = terminal.scrollHeight;
	}
	terminal.scrollTop = terminal.scrollHeight;
});
function processCommand(command) {
	// Split the command and its arguments
	let tokens = command.split(" ");
	let cmd = tokens[0].toLowerCase();
	let argument = tokens.slice(1).join(" ");

	switch (cmd) {
		case "help":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return helpText;

		case "echo":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return tokens.slice(1).join(" ");
		case "clear":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			clearTerminal();
			return "";
		case "uname":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			if (tokens[1]) {
				// Call the setUsername function with the new username
				return setUsername(tokens.slice(1).join(" "));
			} else {
				return unameErrorText;
			}

		case "history":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return displayHistory();

		case "socials":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return handleSocialsCommand(argument);

		case "whoami":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return `<span class="normal-text">${document
				.querySelector(".username")
				.innerText.trim()}</span>`;

		case "email":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return sendEmail();

		case "pwd":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return `<span class="keyword-text">/home/kratospidey</span>`;

		case "about":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return aboutText;

		case "themes":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return handleThemesCommand(argument);

		default:
			return `<span class="error-text">Command</span> <span class="keyword-text">${command}</span> <span class="error-text">not found.</span> 
            <span class="error-text">For a list of commands, type</span> <span class="keyword-text">help</span><span class="error-text">.</span>`;
	}
}

function clearTerminal() {
	// Get the terminal output element
	const output = document.getElementById("output");
	// Set the innerHTML of the output element to an empty string, effectively clearing it
	output.innerHTML = "";
}

function resetTerminal() {
	const input = document.getElementById("input");
	input.innerHTML = "";
}

function setUsername(newUsername) {
	if (newUsername) {
		// Update the username in the prompt for all instances
		let usernameSpans = document.querySelectorAll(".username");
		usernameSpans.forEach((span) => (span.innerText = newUsername.trim()));

		// Update the username in the prompt for future input lines
		const currentPrompt = document.querySelector(".prompt");
		if (currentPrompt) {
			currentPrompt.innerHTML = `<span class="username keyword-text">${newUsername.trim()}</span><span style="color: white;">@</span><span class="normal-text">terminal.kratospidey.dev</span>:~$`;
		}

		return `<span class="normal-text">Username changed to </span> <span class="keyword-text">${newUsername.trim()}</span>`;
	} else {
		return unameErrorText; // Error message if no username is provided
	}
}

// Function to return the current prompt with the updated username
function getCurrentPrompt() {
	return document.querySelector(".prompt").outerHTML;
}

let currentSuggestionIndex = -1; // -1 indicates that no suggestion is selected

function autocomplete(inputElement) {
	let currentText = inputElement.innerText.trim(); // Trimmed current text
	let matches = autocompleteWords.filter((word) =>
		word.toLowerCase().startsWith(currentText.toLowerCase())
	);

	// Clear any previous autocomplete suggestions
	clearAutocomplete();

	if (matches.length === 1) {
		// If there's exactly one match, fill it in completely
		inputElement.innerText = matches[0] + " "; // Update the input field with the new word
		placeCaretAtEnd(inputElement);
		currentSuggestionIndex = -1; // Reset the suggestion index
	} else if (matches.length > 1) {
		// If there are multiple matches, display them in the terminal
		displayAutocomplete(matches);
	}
}

function displayAutocomplete(matches) {
	let inputLine = document.getElementById("input-line"); // Get the input line
	let suggestionHTML = "<div class='autocomplete-suggestions'>";

	matches.forEach((match) => {
		suggestionHTML += `<div class="suggestion-item">${match}</div>`;
	});
	suggestionHTML += "</div>";

	// Append the suggestions to the terminal after the input line
	inputLine.insertAdjacentHTML("afterend", suggestionHTML);

	// Scroll the terminal to the latest output
	terminal.scrollTop = terminal.scrollHeight;
}

function clearAutocomplete() {
	// Remove previous autocomplete suggestions from output
	let suggestions = document.querySelector(".autocomplete-suggestions");
	if (suggestions) {
		suggestions.remove();
	}
}

// ! understand
function placeCaretAtEnd(el) {
	const range = document.createRange();
	const sel = window.getSelection();

	range.selectNodeContents(el);
	range.collapse(false);

	sel.removeAllRanges();
	sel.addRange(range);

	el.focus();
}

function displayHistory() {
	let historyString = "<div class='error-text'>";
	commandHistory.forEach((cmd) => {
		historyString += `<div>${cmd}</div>`;
	});
	historyString += "</div>";
	return historyString;
}

function handleSocialsCommand(argument) {
	if (argument && socialLinks[argument.toLowerCase()]) {
		// Open the specific social media profile
		window.open(socialLinks[argument.toLowerCase()], "_blank");
		return `<span class="normal-text">Opening ${argument} profile...</span>`;
	} else {
		// Display all social media links
		return displayAllSocials();
	}
}

function displayAllSocials() {
	let socialsText = "Here are my social links:<br>";
	for (const [platform, url] of Object.entries(socialLinks)) {
		socialsText += `<span class="keyword-text">${platform}</span> - <a href="${url}" target="_blank">${url}</a><br>`;
	}
	socialsText += `<br>Usage: socials [platform]<br>eg: socials github<br>`;
	return socialsText;
}

function sendEmail() {
	const emailAddress = "contact@kratospidey.com"; // Replace with your actual email address
	const subject = encodeURIComponent("Inquiry from Terminal Portfolio");
	const emailBody = encodeURIComponent("Hello, I'd like to discuss...");

	// Construct the mailto link
	const mailtoLink = `mailto:${emailAddress}?subject=${subject}&body=${emailBody}`;

	// Open the default email client with a new email draft
	window.open(mailtoLink, "_blank");
	return `<span class="normal-text">Opening email client...</span>`;
}

function handleThemesCommand(argument) {
	if (argument && themes[argument.toLowerCase()]) {
		// Change the theme
		document.body.setAttribute("data-theme", argument.toLowerCase());
		return `<span class="normal-text">Theme changed to ${
			themes[argument.toLowerCase()]
		}</span>`;
	} else {
		// List all themes
		let themeList = "Available Themes:<br>";
		for (const [themeKey, themeName] of Object.entries(themes)) {
			themeList += `<span class="keyword-text">${themeKey}</span> - <span class="normal-text">${themeName}</span><br>`;
		}
		themeList += `<br>Usage: themes [theme-name]<br>eg: themes monokai<br>`;
		return themeList;
	}
}
