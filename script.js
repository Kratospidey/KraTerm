function escapeText(value) { return String(value).replace(/[&<>"\']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#39;"}[c])); }
const startTime = Date.now();

const ASCII_REST_PIECES = Object.fromEntries([
	["tokyo-rain", "Tokyo Rain", 5],
	["kyoto-dusk", "Kyoto Dusk", 7],
	["lantern-lake", "Lantern Lake", 8],
	["marine-drive", "Marine Drive", 9],
	["snow-train", "Snow Train", 6],
	["aurora-fjord", "Aurora Fjord", 8],
	["varanasi-ghats", "Varanasi Ghats", 7],
	["taj-dawn", "Taj Dawn", 9],
	["kite-festival", "Kite Festival", 5],
	["night-highway", "Night Highway", 6],
	["deep-reef", "Deep Reef", 8],
].map(([slug, name, still]) => {
	const command = slug.replaceAll("-", "");
	return [command, {command, slug, name, still, source: "ascii.rest · @bas3line"}];
}));

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
	"uptime",
	"projects",
	"research",
	"ascii",
	"cowsay",
	"critters",
	"blackhole",
	"nighttide",
	"catknight",
	"eiffel",
	"universe",
	"art",
	...Object.keys(ASCII_REST_PIECES),
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
	"atom-dark": "Atom Dark Theme",
	ayu: "Ayu Theme",
	material: "Material Theme",
	zenburn: "Zenburn Theme",
	"tomorrow-night": "Tomorrow Night Theme",
	"oceanic-next": "Oceanic Next Theme",

	"solarized-light": "Solarized Light Theme",
	"github-light": "GitHub Light Theme",
	"atom-light": "Atom Light Theme",
	// ... add any other themes here
};


// Neofetch-style profile card: local ASCII portrait (left) + verified profile fields (right).
// Portrait generated locally from the owner's approved photo; no external services involved.
const portraitFull = "=+**#**%%%%@@@@%@*  ::...         ...::::...   .       ..::............=*####**####**+++++**#***\n=+++**+*%####@@*-:.--::---:::::.                  ...:.........        ..:-=+*#****+++++**+*****\n++++**+#%%*===:. .::-=-:.     .::.....          . ... ...      . .  ..    .:::==++++++**+#**+++*\n+=+*++==-::--.    . .                                                 ..    .:-=+*+++=+++*++++++\n++==-=----:..                                                           .      .:-=++====+===+++\n===-=-::::.                                                                        ..::---======\n==-:::=:..                                                                            .:-::----:\n-: :.-.                                              ...                              .:----=-=-\n.  :..                       ...                                                       :-==++*++\n                    ..         .        .... ..                                             ....\n                     .--.                .....     .:--::                                       \n                .:.    .:-.            .     .        .----...                               .  \n                 .::--:.  ..             .                .::.......                       .=+*+\n                   ...--.   ..         .::...          ..  ........::.                       =+=\n.                      .....          .-::::.....     .. ..  .   ... ......       .           :=\n                        .              .::.       .   ...::.       .......:...     .          .=\n                .:.         .        .   .:.:      ::.. ..--.         ..   .        .          .\n.               .....            .. .:-:. ..:.       .....:-:    .  .      .    .    .          \n               .:.....     .   .  ::-----:::::.:..    .:::.:-.. ..  :..    .          .         \n::           ..:.:....... :-:::-.   :-::==-:::---:. .. :-:::.... :. .... ..  .  .     .      .  \n=-. .  .     ..:. ..       ...:-==:. .. .-==:::---: ....::::. .:.......:.:. ... ..  ...         \n=-: .   :.... .:-..:  .. . .....:-=-::.   :=-::==+-. ...::::...--.....:--- .:::..: ..:.         \n+=: .    :::. .:.=. .  . ...:::-...::::... .:. -*+*-.:..---:  -==-....=--=  .....- :..         :\n++-..  .  .::  : .--.   ...::===-::.:-:.... :.. :=+=:.: :::::.--==-.. ::::       :.            +\n+*-.   .:. ... .-..--... :-:::-+=-:...-:.    ..: ::==..  :-+++=**-...                          =\n*+=.   :=:. ..  --.::--:::::--:.-==-:  ..      .::. .:   .-*##+++=.                            -\n===:.. .==-:... .+-::--==--:...  ..:--.           .:     .+@%%+==-:.                   ..      -\n=++=:=--=+---:::.:=-:----::-:.       ...         .+%#*:  -@@@%=-...   .                       .:\n:==--=====+:-=-:-:.::.:-:. .:::.. .  ...:::...:-=*@@@@@*#@@@#=:....:.:----===:.              .-.\n ..--+--=-:. .=-:::.          :.          -*%@@@@@@@@@@@%#*+=--===:.......:-==-.                \n  :.:=:... :  :*+:..  ..::.:-:::::--:::..      .:+@@@%%#*+++==+-:.   .....:---=++=-:::.:.       \n  :  -: :.    :*+=..--+-.... .:--:... ..=+--=##+:..*@%*==-:.--   .==-::...+-:-+#%*-     .-+     \n  .   :.       +=::=*+++:...  .%@@%*:   ++. .+@@@@% -#-:::  .  :-+@=.:.:=:@-  :+*#+.      -*    \n     -%*      =##+.-@@@@@*=#-.:+*%@+    .    -*###@= :     .   .  ..    .--:::-+**+=:    .:*  :-\n     %*+:. . -@@@@-+@@@@@@@@%%%###*++-=-..::-=+**+#= . -   -  .... .:-==+====++=+++=-   ::.*    \n     %@@@:   -@%%@=+@@@@@@@@@@@@@@@@@%#+-----=+++*%: :*=-::.   ...:::-=+**++*+**+====. .-:-*  .=\n     :@#*.   -%%%%=#%@@%@@@@@@@@@@@%%%#*+=--=+**#*+ .%#+=---.  :-:-===++*****++++==-=.    :-    \n      +@.    =%%%@+=@@%%*+#+**#%@@@@@@#++++*####+= .#%*+=---:   =*+===++**++++====---.  . =.    \n       #:    =%#%%#=@@%%##*+#%#%##**##**+**%%%#*= .###*+=----:   ======+++*#*#*+==---.   .=     \n       ..    =########@%@@######*+++**+**##%%@#=.-#***+*+=---::   :=====+++%@@%+--=-=%@@@+:...  \n        ..   -#**##%@##@@@%%%#*####*******#%@#: =%#####%#+===--.:: :=======*@@@%+===#@@%*#@@@@@@\n         *#+-.***##%@%#%@@%%%%#####******+++*-:+%%@@@@%%#**++==-:-----:--==+%@@%*=---*##@@@@@@@@\n         :@@@@*+**#%%@@@@#+**###***+++++=--+#*#@@@@@@@@@%##%#+==::==-----==++**+++-.+@@@@@@@@@@@\n          =@@@%+**#%%%@@@@@%%###**++++=+++++*@@@@@##@@@@@%%#**#*+=-========++==+=--:@@@@@@@@@@@@\n           #@@@****#%@@@@@%%%%####**++======+%@@*. -#@@@%#+. =@@*--=============-::-@@@@@@@@@@@@\n            =@@%#*#%%@@@%%%%%%#****++=========+*+*%@@@@%+==:.:==:---===========--::#@@@@@@@@@@@@\n              :*%#*%%@@@@%%%%%%###*++=-=======-==+#@%+*%%+-:. ..:-----==+==++===---.#@@@@@@@@@@@\n               .#@#%@@@@@@@@%%###**++=-======---=+*%*-:*@+-:....:::----==++++===--:   .=**#%@@@@\n                :@%%@@@@@@@@@@%%##***+======-----=++-. .*+-:.....::::-:--=+++===-=              \n               . %@@@@%%@@@@@@@@%##**++++***++=++*##*-. :==---:::------:-==+++===:              \n               : .@@@@@@%@@@@@@@%###**#*#%%%%%@@%%%%@%#*---==++=+**+++=--=++++===               \n               :  =@@@@@@%@@@@@@%####%@%%@@@@#**#*#*#%@#=-===-:-=***%%#*+=+++==+.               \n               -   +@@@@@@@@%@@@@%%#%%*:........:.. .-+=......      -+##*+++==+:                \n               -    +@@@@@@@%@@@@@@%#=:     :::--:...:::::::.....   .-+****+=+=                 \n               =     %@@@@@@%@@@@@@#*==+#*+====++*#*+++=+*+==+=:.:-===+*#**++- =-               \n               +     ##%@@@@@%@@@@@%###%%%%%%#%#####*+=-===++=--==++******+*-   -*              \n      ..       +     *###%%%@@%@%@%%%%@@@@@@%@@@@@@%%##**##*++++++***+***+*-     =#             \n     =-        *    .*#%###%%%%%%%@@@%%@%%@@@@%####**+*++***+**+****+****+:       %=            \n    #= ...     *     +####*##%%%@@@@%%%%%%%@@%%%#####**++*+*##****++****+.         @            \n   =%.......   *     =###%%##*##%@@@%@%%%@@@%@@%%#%##*++==+***********+-.          *#           \n   %+.::::...  *:    :####%%%##**#%@@@@%@@@@@@@@@@%**+=++==++++******=.            .@           \n   @+.:::::::: ==    .+#####%%##***#%@@@@@@@@@@@@@%##*++++++++++*+**:  .            @=          \n   %* ..::::::.-#     :+#####%%%##*+*#@@@@@@@@@@%#####****++++=+*#+.   .            =@          \n   @: ...:---:::%      :+##########**++#@@@%@@@@@@%%#*###*+++==++-    :             .@:         \n  *@    ..:----:%:     .-+*************+*#%%%%%%%%%#*+*###****+-.    :.              @+         \n .@-     ...:-=-%-      .-=+*******++++++===+**##*****###**+=:       -               %%         \n +@      ...:-==%+       .:-++++++*++====-------===+++==--:.        =                *@.        \n.@#     ....::--%*:       .:-====+++====------========--:.         ::                =@.        ";
const portraitMid = "=+****%%%@@@@%* .:...    .   ....:..         ...:..........-+**##*###**++++*****\n=+++*+#%#**%*:..--:--:.:::..            . .::........        .-=+*+++++++****++*\n++***+++=--:   :.:.       ....                           ..   ..:==+++++*+**++++\n+++==--:::.                                                      .-=+++===+==+++\n==---:::.                                                            .::---=====\n=-:::-:.                                                                :-::--::\n-..::.                                       ..                         :-======\n. .                      ..      ..                                      .::--=-\n                 .:.              .....   .::..                                 \n             ..    .::                      .:--:..                             \n              ..:-:. ..           .             .::......                   :=+=\n                 ..:.  ..       .:::....      .  ..........                  .==\n.                   ..          .::..        .....     ........      .        .=\n              .                   :..     .. ...::.      ...  ..      .        :\n              ..           .. .::  ..:     ......-:   .        .   .   .        \n            .:......  .     .:----:.::.:.    .::.::.  . .:.            .        \n-.         ..... . .  ::::-.  :-:-+-:::--:... ::::... ...... .  .  .   .        \n=-    ..   .:: ..      ..:-+=:..  :==::==-. ...:::. .:.....::. .:. .  .:        \n=-     .::  ::-..  . .....:.:-::.. .-:.-++-...:--: .-=:...--=: .::.:....       .\n+=..    .:. ...-:   ..::---:..:-:.. .:..-++::..-::..--=:. .--:     ::          =\n++:   .. .:  :..-:.. :-::-==-...:.    ...:-=:. .-=+=+*-...                     -\n++:   :=. .. .-.::-::::::..---:  .      ..  .   -*##++=.                       :\n===::.:+=::.. =-::-==-:...   .::.         =:.   +@@#=-::.               ..     :\n=+=-=====-=-::::-:--:..::.     ....    ..+@@@*:=@@%+:.  ..:.:::..             ::\n .:-=-=--:.--:-..  ..   .:.       .=+#%@@@@@@@@@#*=----:::::::=+=:            . \n  :.=:.: .  =+:.   ....::::::::..   ...:-#@@%%*+++===-:   .....--===-:....      \n .. :. .    =+-.:-==... .:=-::.  -*-:+#*-.:%%+==:.-:  :*=-::.-*.:+##+.    :=    \n     +:     -+:.+#**=::. :%@@#.  :=  :#@@@= +:..     :-*:...:+*  :+**-     --  .\n    +%=    =%@#:*@@@@%%*=++*#=....  .:+***%   .  :  .   ....:---==+*++:   .--  .\n    #%@*   +@@@=*@@@@@@@@@@@@@%#+----==++** .==:.:  .....-=+*+++++++==-  -:==  -\n    :@%-   +%%%=#@@%%@@@@@@@@@%%*+=--=+***. ##=--:. .::-===+**+*+++==--    -:  .\n     *#    *%%%+*@@%***+##%@@@@%*+++*###*: +%*+=--:  :*+===+**+++===---    -    \n      +    +##%#*@%%%#+*%##*+****+*#%%%*: +#*++----:  :=====++*##*==---.::::    \n      .   .+#*##%##@@@###*#********#%@*::*#****+=---:. .-=====+@@%+===#@@@*+**++\n       :=:.:#*##%%*%@@%%%####*******#*.:#%%@%%%*+===-:-:-----==%@@%+--+%##@@@@@@\n        @@@#+**#%@@@@***###**++++=--+**%@@@@@@@##%#==-:==----=++**++-.=@@@@@@@@@\n        .@@@*+*#%%@@@@%%###*+++=+++++%@@@%+%@@@@%#+*#+=-===========--:@@@@@@@@@@\n         -@@@***%%@@@@%%%###**+======+@@+.-#@@%**: +@*--===========-:=@@@@@@@@@@\n          .#@#**%@@@%%%%%##**++=-=======+#@@%@%+=-..:::---====+===--:+@@@@@@@@@@\n             *%*%@@%@@@%%###*++-======--=+%#==%#=:. .::----=++++===-- .=#@@@@@@@\n             :@%%@%@@@@@%%#***+======----=+=. -#=:. ..:::---==++====:         ..\n            . +@@@%%@@@@@@%##**++++*++=++*#*-..-=--:::-----:-=+++===            \n            .  @@@@@%@@@@@@%##*###@@@@@%%%%@%%+--==+=+#***+===+++=+.            \n            :  :@@@@@@%@@@@%##%@#*+**+-=+==-*%+:---:..--+###+=++=+-             \n            :   -@@@@@@%@@@@%%%+.    ...:.  .::....      :+**++=+=              \n            -    +@@@@@%@@@@@%+--++---=++*+===-++===-..:--=***++=.-             \n            -.   -%%@@@@%@@@@%###%%%%#####%#+===+++=--=+*****++=   +.           \n     :.     -.   -###%%%%%@%%%%@@@@@@@@@@@%%#***#*+++++**+**+*=     %           \n   .+.      -:   -###*#%%%%%%@@%%%%%@@%###**++++********+****-      :%          \n   #:....   :-   :########%@@@%%%%%@@@@%%###**+++*#***++***+:        #-         \n  :#.::.... :=    *###%##**#%@@@%%@@@@@@@%#*+++==+++******-          .@         \n  =#..::::...*    -####%%##**#%@@@@@@@@@@@#**++++++++*+*+. .          @:        \n  -% ..:::::.#    .=#####%%#*+*#@@@@@@@@%####***+++==**-   .          +#        \n  #=  ..:---:#:    :=*#***###**++#@@%@@@@@%#**#**++++=.   :           .@        \n :@    ..:--:*=     :=*******++++++**##%%##***###*+-.    ..            @:       \n #*    ...:--*+      :-++++++++===----==++++*++=-:       -             @+       \n.@:    ...::-**.      .:===+++===------======--:.       -              %#       ";
const portraitSmall = "=+***%%@@@%+.:.::. ..  .....        ..:....... :=**####*++++****\n+++*+%#+++..:--:.. .....          ....           .:=++++++***++*\n++++=--::                                          .:=++++++++++\n==--:::                                                .::--====\n=:::-.                                                   .:-----\n. ..                .                                     :-==++\n              .            ....   ...                           \n           .   .:.                 .:-:..                     . \n           ..::: ..        ..         ........               :++\n               ..        .:::. ..   ...    .......            .=\n           .               :..    . ..::     ... ..     .      :\n           ..         ...:. .:.    ....-:    .    .             \n.        ....... .:... .----:::::   .::::. ....          .      \n=.   .   .:..     ..:=-..:.-=::--:...:::. ........ ...  ..      \n=:   .:. .::..    ...::-::  .-.-++...:-: .=:..:-=  :......     .\n+-.    .. ..::   .:-=-..:-.. ...-+=:.:-:.:==:..::     :        :\n*=   -. . .:.-:..:::-==:...    ..:::  :+*+*=.                  :\n==:. -=:.. --:-=-::.. .::.       ..   :%@*=-.             .    :\n=+--==+---.:-::-:.::.    ...   .:*@@+:#@%=. .....::.          .:\n .:=---: --:.   .  .:. .    -=+#@@@@@%%*=-=-...:::==:.          \n . -..   .*-..::...::::::.::.:-::=@@*+=-=-..:....:--+*+: ..:.   \n .  -.    +-:**+:.. :%#+.  +..#@@*.*-:. . .-#:..:*: -**:    =  .\n   =%:   +%#:%@@@%#=+#%*:..  .=**@: .  .  .  ...-=--=+*+:  .=. .\n   +@@: .%@@=%@@@@@@@@@@%#+---=++# .*-::  ..:-=+*++*++==- .:=. :\n    @+  .#%%+%@%#%#%%@@@@#*+=+*##: %#=--. :====+**++++=--   -   \n    :-   ##%*#@%#*+###**#*+*#%%#:.*#+=---. :====+*##+==--.:::   \n     .  .*###%#@@@%##******##@#:-##***=---. .-====%@%+==#@@#****\n      **-+*##%%%@%%####***+++*-=%@@@@%**+=-------=*@@*=:+%%@@@@@\n      .@@%+*#%@@@####**++++==*%@@@@@@@%%**+-======+++==.%@@@@@@@\n       -@@**#%@@@@%%##**+==+==%@*:+@@%#-.#%=-=========:=@@@@@@@@\n        .*%##%@@%%%%##**========+#@#%#=-..::--====+==-:=@@@@@@@@\n          :@#@@@@@@%%#**+=====--=*#-:%+:. .:::-==++===-  .-=+*##\n           +@@@@@@@@@%#*++=++====**: :=-:..::--:-=+===:         \n            @@@@@@@@@%##*##@@@@%%%@%#=-====***+==+++==          \n          . :@@@@@@@@@%#%%=-==---::=#-:::...:=##+++==           \n          :  :@@@@%@@@@%*:.. .::-:.:-:-:::.  .=***++-           \n          :   #%@@@@@@@%**%%##*##%#+==+++=--+*+***+. -:         \n    .     -   *##%%%%@%%%@@@@@@@@%%#****++++*****+.   =:        \n  .=..    -   *####%%@@@%%%%@@%###**++**********=      #        \n  *-....  =   +##%####@@@%%@@@@@%%#*++=+******+:       -+       \n  %:.:::. +   :###%%#**#@@@@@@@@@%#*++++++***=          %       \n  %..::::.+.   =####%##**#@@@@@@%%##**+++=+*:  .        *-      \n -*  .:--:+=   .=*#***#**+*%%%%@@%#**##*++-   .         -#      \n %:   ..:-++    .=+++**+++====++*++***+=:    ..         .@      \n-%   ...:-+#.    .:==+++===-----=====:.      :           @.     ";
const artistAccents = [
    ["Tame Impala", '<span style="color:#e8722a">Tame Impala</span>'],
    ["TV Girl", '<span style="color:#ff6eb4">TV</span> <span style="color:#b967ff">Girl</span>'],
    ["Vansire", '<span style="color:#6fc3df">Vansire</span>'],
    ["Radiohead", '<span style="color:#a3b8c2">Radiohead</span>'],
    ["Nirvana", '<span style="color:#e6c229">Nirvana</span>'],
    ["Elden Ring", '<span style="color:#d4af37">Elden Ring</span>'],
    ["Deadlock", '<span style="color:#f2734c">Deadlock</span>'],
    ["Clair Obscur: Expedition 33", '<span style="color:#e0a899">Clair Obscur: Expedition 33</span>'],
    ["Dazz Cam", '<span style="color:#ff8fa3">Dazz Cam</span>'],
    ["CachyOS", '<span style="color:#3fc7a1">CachyOS</span>'],
    ["VS Code", '<span style="color:#3794e8">VS Code</span>'],
    ["JavaScript/TypeScript", '<span style="color:#f0db4f">JavaScript/TypeScript</span>'],
    ["Python", '<span style="color:#5a9fd4">Python</span>'],
    ["Java", '<span style="color:#e8833a">Java</span>'],
    ["C/C++", '<span style="color:#7ea0c4">C/C++</span>'],
    ["SQL", '<span style="color:#c586c0">SQL</span>'],
    ["niri + DankMaterialShell", '<span style="color:#8b9ef0">niri + DankMaterialShell</span>'],
    ["zsh", '<span style="color:#89e051">zsh</span>'],
    ["AI, gaming", '<span style="color:#b57edc">AI</span><span style="color:white">, </span><span style="color:#4ade80">gaming</span>'],
    ["Cooking, photography", '<span style="color:#f08c42">Cooking</span><span style="color:white">, </span><span style="color:#9db2c9">photography</span>'],
    ["KratosSpidey", '<span style="color:#66c0f4">KratosSpidey</span>'],
];
function colorizeArtists(v) {
    for (const [n, h] of artistAccents) {
        v = v.split(/(<span[^>]*>[\s\S]*?<\/span>)/g).map(p => p.startsWith("<span") ? p : p.split(n).join(h)).join("");
    }
    return v;
}

function neofetchCard(portraitText) {
    const fields = [
    [
        "param@kraterm",
        ""
    ],
    [
        "-------------------------------",
        ""
    ],
    [
        "Name",
        "Param Singh Makwana"
    ],
    [
        "Location",
        "Mumbai, India"
    ],
    [
        "College",
        "MPSTME, NMIMS"
    ],
    [
        "Education",
        "Integrated B.Tech, Information Technology"
    ],
    [
        "Study",
        "Final year | May 2021 - May 2027"
    ],
    [
        "-------------------------------",
        ""
    ],
    [
        "OS / distro",
        "CachyOS"
    ],
    [
        "WM / desktop",
        "niri + DankMaterialShell"
    ],
    [
        "Shell",
        "zsh"
    ],
    [
        "Editor",
        "VS Code"
    ],
    [
        "Building",
        "IDH brain-tumour MRI project"
    ],
    [
        "Research",
        "LLM security, reliability & backdoors"
    ],
    [
        "",
        "Medical imaging & phishing detection"
    ],
    [
        "Languages",
        "Python, JavaScript/TypeScript, Java"
    ],
    [
        "",
        "C/C++, SQL"
    ],
    [
        "Hobbies.Software",
        "AI, gaming"
    ],
    [
        "Hobbies.Offline",
        "Cooking, photography"
    ],
    [
        "Games",
        "Elden Ring, Deadlock"
    ],
    [
        "",
        "Clair Obscur: Expedition 33"
    ],
    [
        "Camera app",
        "Dazz Cam"
    ],
    [
        "Music",
        "Tame Impala, TV Girl, Vansire"
    ],
    [
        "",
        "Radiohead, Nirvana"
    ],
    [
        "-------------------------------",
        ""
    ],
    [
        "Contact",
        "contact@kratospidey.com"
    ],
    [
        "Website",
        "github.com/kratospidey"
    ],
    [
        "LinkedIn",
        "linkedin.com/in/kratospidey"
    ],
    [
        "Steam",
        "KratosSpidey"
    ],
    [
        "-------------------------------",
        ""
    ],
    [
        "Published",
        "IEEE GCAT 2024 | Progressive Round Robin"
    ],
    [
        "Presented",
        "DACS 2025 | PhisDOM"
    ],
    [
        "Ongoing",
        "LLM backdoor auditing & partial recovery"
    ],
    [
        "In preparation",
        "IDH classification from brain MRI"
    ]
];
    const links = {Contact:"mailto:contact@kratospidey.com",Website:"https://github.com/kratospidey",LinkedIn:"https://www.linkedin.com/in/kratospidey"};
    const text = fields.map(([k,v]) => `<span class="keyword-text">${k}${v && k ? ":" : ""}</span> ${links[k] ? `<a class="active-text" href="${links[k]}">${v}</a>` : `<span style="color:white">${colorizeArtists(v)}</span>`}`).join("\n");
    const narrow = window.innerWidth < 900;
    const size = narrow ? 6 : 7;
    return `<span style="display:${narrow ? "block" : "inline-block"};vertical-align:top;font-size:${size}px;line-height:${size * 1.15}px;white-space:pre;color:white;" role="img" aria-label="ASCII portrait of Param Singh Makwana">${portraitText}</span>${narrow ? "\n" : "   "}<span style="display:inline-block;vertical-align:top;font-size:${narrow ? 10 : 13}px;line-height:${narrow ? 15 : 14}px;white-space:pre-wrap;max-width:100%;">${text}</span>\n`;
}

const welcomeText = `
<pre class="enter-text" style="max-width:100%;overflow-x:auto;">
    __ __            __                   _     __          
   / //_/_________ _/ /_____  _________  (_)___/ /__  __  __
  / ,<  / ___/ __ \`/ __/ __ \\/ ___/ __ \\/ / __  / _ \\/ / / /
 / /| |/ /  / /_/ / /_/ /_/ (__  ) /_/ / / /_/ /  __/ /_/ / 
/_/ |_/_/   \\__,_/\\__/\\____/____/ .___/_/\\__,_/\\___/\\__, /  
                               /_/                 /____/   

${neofetchCard(portraitFull)}
<span style="color: white">Welcome to KraTerm!</span>
<span style="color: white">---</span>
<span style="color: white">This project's source code can be found in this project's </span><a class="active-text" href="https://github.com/Kratospidey/KraTerm">Github repo</a>.
<span style="color: white">---</span>
<span style="color: white">For a list of available commands, type </span><span class="keyword-text">'help'</span>.
</pre>
`;

const midWelcomeText = `
<pre class="enter-text" style="max-width:100%;overflow-x:auto;">
    __ __            __                   _     __          
   / //_/_________ _/ /_____  _________  (_)___/ /__  __  __
  / ,<  / ___/ __ \`/ __/ __ \\/ ___/ __ \\/ / __  / _ \\/ / / /
 / /| |/ /  / /_/ / /_/ /_/ (__  ) /_/ / / /_/ /  __/ /_/ / 
/_/ |_/_/   \\__,_/\\__/\\____/____/ .___/_/\\__,_/\\___/\\__, /  
                               /_/                 /____/   

${neofetchCard(portraitMid)}
<span style="color: white">Welcome to KraTerm!</span>
<span style="color: white">---</span>
<span style="color: white">This project's source code can be found in this project's </span><a class="active-text" href="https://github.com/Kratospidey/KraTerm">Github repo</a>.
<span style="color: white">---</span>
<span style="color: white">For a list of available commands, type </span><span class="keyword-text">'help'</span>.
</pre>
`;

const smallWelcomeText = `
<pre class="enter-text" style="font-size: clamp(0.5rem, 2.9vw, 1rem);">
    __ __            __                   _     __          
   / //_/_________ _/ /_____  _________  (_)___/ /__  __  __
  / ,<  / ___/ __ \`/ __/ __ \\/ ___/ __ \\/ / __  / _ \\/ / / /
 / /| |/ /  / /_/ / /_/ /_/ (__  ) /_/ / / /_/ /  __/ /_/ / 
/_/ |_/_/   \\__,_/\\__/\\____/____/ .___/_/\\__,_/\\___/\\__, /  
                               /_/                 /____/   

${neofetchCard(portraitSmall)}
<span style="color: white">Welcome to KraTerm!</span>
<span style="color: white">---</span>
<span style="color: white">project's source code - </span><a class="active-text" href="https://github.com/Kratospidey/KraTerm">Github repo</a>.
<span style="color: white">---</span>
<span style="color: white">For a list of available commands, type </span><span class="keyword-text">'help'</span>.
</pre>
`;

// Use welcomeText in your code where appropriate

const aboutText = `
<pre class="error-text" style="white-space:pre-wrap;overflow-wrap:anywhere;">
Hey, I'm Param Singh Makwana! 
I'm a final-year Integrated B.Tech Information Technology student at Mukesh Patel School of Technology Management & Engineering, NMIMS, Mumbai. 
I study LLM security and reliability, work on medical imaging, and build practical software tools.
My major interests are creating cool stuff such as bots, interactive websites and tools to name a few. I plan to do a lot more stuff in future!
</pre>`;

const autocompleteWords = commands;

const terminal = document.querySelector(".terminal");

const socialLinks = {
	github: "https://github.com/kratospidey",
	devto: "https://dev.to/kratospidey",
	linkedin: "https://www.linkedin.com/in/kratospidey",
};

const projects = {
	"llm-backdoor": "https://github.com/Kratospidey/llm-backdoor-capstone",
	"idh-glioma-mri": "https://github.com/Kratospidey/idh-glioma-mri",
	phisdomjs: "https://github.com/Kratospidey/phisdomjs",
	corneal_ulcer: "https://github.com/Kratospidey/corneal_ulcer",
	"smart-round-robin": "https://github.com/Kratospidey/improved-smart-round-robin",
	ion: "https://github.com/Kratospidey/ion",
	kraterm: "https://github.com/Kratospidey/KraTerm",
	termidash: "https://github.com/Kratospidey/TermiDash",
	"dms-airdrop": "https://github.com/Kratospidey/dms-airdrop",
	"monster-tracker": "https://github.com/Kratospidey/monster-tracker",
	"investwise-india": "https://github.com/Kratospidey/investwise-india",
	sasta_dmart: "https://github.com/Kratospidey/sasta_dmart",
	duck: "https://github.com/Kratospidey/DUCK",
};

let commandHistory = [];
let historyIndex = -1; // Will track the current position in the command history


const roboticsText = `
<pre style="white-space:pre-wrap;overflow-wrap:anywhere;">
<span class="keyword-text">Arduino Mega-Centric Fire-Fighting Robot</span>
<span style="color:white">Team project | Robotics &amp; embedded systems</span>

I worked on a team fire-fighting robot using an Arduino Mega 2560,
IR flame and MQ-series smoke sensing, DHT11 temperature/humidity,
ultrasonic ranging, servo sensor/nozzle aiming, and a water pump.
An ESP32-CAM provides video telemetry for remote monitoring.

The report describes a detect-approach-suppress controller and controlled
indoor trials. This is a student prototype, not a certified emergency
response system. Learned vision is a proposed upgrade, not an implemented
AI capability.

<span class="normal-text">Team:</span> Param Singh Makwana, Shrijesh Yadav, Deven Yewale,
Yash Vyas, Samik Singh Rajput.
</pre>`;

const researchText = `
<pre style="white-space:pre-wrap;overflow-wrap:anywhere;">
    <span class="keyword-text">papers</span>

    <span class="keyword-text">1. Progressive Round Robin CPU Scheduling Algorithm for Operating Systems</span>
       <span class="normal-text">Co-author · </span><span style="color: white">PUBLISHED - IEEE GCAT 2024, on IEEE Xplore</span>
       <a class="active-text" href="https://ieeexplore.ieee.org/document/10923888" target="_blank">ieeexplore.ieee.org/document/10923888</a>
       <span class="normal-text">code: </span><a class="active-text" href="https://github.com/Kratospidey/improved-smart-round-robin" target="_blank">github.com/Kratospidey/improved-smart-round-robin</a>

    <span class="keyword-text">2. PhisDOM: Leak-safe, Multimodal Phishing Detection</span>
       <span class="normal-text">Lead author · </span><span style="color: white">Presented at DACS 2025</span><span class="normal-text"> (Springer conference; publication/indexing not verified)</span>
       <span class="normal-text">paper: </span><a class="active-text" href="https://drive.google.com/file/d/1hqDu8lcDDRHoJLPFzg0Hqsv7-BeDAV8a" target="_blank">PhisDOM PDF</a>
       <span class="normal-text">code: </span><a class="active-text" href="https://github.com/Kratospidey/phisdomjs" target="_blank">github.com/Kratospidey/phisdomjs</a>

    <span class="keyword-text">3. Beyond Backdoor Detection: Lightweight Auditing and Functional Recovery in Backdoored Language Models</span>
       <span class="normal-text">Lead author, with Yash Kalbhor and Shrijesh Yadav</span>
       <span class="normal-text">ONGOING / UNPUBLISHED MANUSCRIPT - NMIMS Capstone, 2026</span>
       <span class="normal-text">Functional recovery is partial; several repair approaches did not restore correct triggered answers.</span>
       <a class="active-text" href="https://github.com/Kratospidey/llm-backdoor-capstone" target="_blank">Research code</a>

    <span class="keyword-text">ongoing</span>

    <span class="keyword-text">IDH mutation classification from multi-sequence brain MRI</span>
       <span class="normal-text">In preparation - unpublished. Research use only, not a clinical diagnostic tool.</span>
       <span class="normal-text">code: </span><a class="active-text" href="https://github.com/Kratospidey/idh-glioma-mri" target="_blank">github.com/Kratospidey/idh-glioma-mri</a>
</pre>
`;

const helpText = `
<pre>
    <span class="keyword-text">echo [text]</span>  - <span class="normal-text">Prints [text] to the terminal.</span>
    <span class="keyword-text">clear</span>        - <span class="normal-text">Clears the terminal.</span>
    <span class="keyword-text">critters</span>     - <span class="normal-text">Ambient ASCII animals behind the terminal. Try: critters koi | critters off | critters tweaks</span>
    <span class="keyword-text">history</span>      - <span class="normal-text">Shows your history of entered commands.</span>
    <span class="keyword-text">uname [name]</span> - <span class="normal-text">Sets your username to [name] for this session.</span>
    <span class="keyword-text">socials</span>      - <span class="normal-text">check out my social accounts</span>
    <span class="keyword-text">whoami</span>       - <span class="normal-text">who am i?</span>
    <span class="keyword-text">about</span>        - <span class="normal-text">about me!</span>
    <span class="keyword-text">email</span>        - <span class="normal-text">send me an email</span>
    <span class="keyword-text">pwd</span>          - <span class="normal-text">prints the working directory</span>
    <span class="keyword-text">welcome</span>      - <span class="normal-text">prints the hero section</span>
    <span class="keyword-text">themes</span>       - <span class="normal-text">check available themes</span>
    <span class="keyword-text">uptime</span>       - <span class="normal-text">shows runtime duration of the website on your browser</span>
    <span class="keyword-text">projects</span>     - <span class="normal-text">check out my projects</span>
    <span class="keyword-text">research</span>     - <span class="normal-text">my papers and ongoing research</span>
    <span class="keyword-text">ascii</span>        - <span class="normal-text">converts image to ascii text</span>
    <span class="keyword-text">cowsay</span>        - <span class="normal-text">cow says :D</span>

    <span class="keyword-text">ascii art</span> - <span class="normal-text">type one by itself:</span>
    <span class="keyword-text">blackhole</span>    - <span class="normal-text">JIN2's accretion disk, drawn in letters.</span>
    <span class="keyword-text">nighttide</span>    - <span class="normal-text">JIN2's moonlit sea and breaking waves.</span>
    <span class="keyword-text">catknight</span>    - <span class="normal-text">JIN2's Cat Knight, 600 frames of ASCII art.</span>
    <span class="keyword-text">eiffel</span>       - <span class="normal-text">@dwcminh.ascii's Eiffel Tower: it rises, lights up, fireworks.</span>
    <span class="keyword-text">universe</span>     - <span class="normal-text">@dwcminh.ascii's rocket to the Milky Way in one unbroken shot.</span>
    <span class="keyword-text">art</span>          - <span class="normal-text">Browse all fullscreen ASCII art.</span>
${Object.values(ASCII_REST_PIECES).map(({command, name}) =>
	`    <span class="keyword-text">${command}</span>${" ".repeat(14 - command.length)}- <span class="normal-text">${name} by @bas3line / ascii.rest.</span>`).join("\n")}
    <span class="normal-text">esc exit · space pause · r restart (tap to exit on touch)</span>

    <span class="error-text">Up Arrow</span>      => <span class="normal-text">Go up in history.</span>
    <span class="error-text">Down Arrow</span>    => <span class="normal-text">Go down in history.</span>
    <span class="error-text">Ctrl + l</span>      => <span class="normal-text">Clear the terminal.</span>
    <span class="error-text">Ctrl + c</span>      => <span class="normal-text">Reset input.</span>
    <span class="error-text">Tab</span>           => <span class="normal-text">Autocompletes commands (lists them if multiple completions)</span>
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
		output.innerHTML += `<div class="input-line">${getCurrentPrompt()}<div>${escapeText(input)}</div></div>`;

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
	command = command.trim();
	let tokens = command.split(" ");
	let cmd = tokens[0].toLowerCase();
	let argument = tokens.slice(1).join(" ");
	console.log(argument);
	clearAutocomplete();

	switch (cmd) {
		case "help":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return helpText;

		case "echo":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return escapeText(tokens.slice(1).join(" "));
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
				return setUsername(tokens.slice(1).join("_"));
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

		case "projects":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return handleProjectsCommand(argument);

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

		case "research":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return researchText;

		case "ascii":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			return triggerImageUpload();

		case "welcome":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			if (command === "welcome") {
				let welcomeOutput;
				if (window.innerWidth <= 320) {
					welcomeOutput = smallWelcomeText; // Use smallWelcomeText for very narrow screens
				} else if (window.innerWidth <= 1210) {
					welcomeOutput = midWelcomeText; // Use midWelcomeText for medium screens
				} else {
					welcomeOutput = welcomeText; // Use the default welcomeText for larger screens
				}
				return welcomeOutput;
			}

		case "uptime":
			commandHistory.push(command);
			historyIndex = commandHistory.length; // Reset history index to the end
			const currentTime = Date.now();
			const uptime = currentTime - startTime;
			return `Uptime: ${formatUptime(uptime)}`;
		case "critters":
			commandHistory.push(command);
			historyIndex = commandHistory.length;
			return crittersCommand(argument);
		case "blackhole":
		case "nighttide":
		case "catknight":
			commandHistory.push(command);
			historyIndex = commandHistory.length;
			return jin2Command(cmd);
		case "eiffel":
		case "universe":
			commandHistory.push(command);
			historyIndex = commandHistory.length;
			return dwcCommand(cmd);
		case "art":
			commandHistory.push(command);
			historyIndex = commandHistory.length;
			setTimeout(() => asciiRestLoad().then(module => module.gallery(artGalleryPieces(), launchArt))
				.catch(asciiRestError), 0);
			return;
		case "cowsay":
			commandHistory.push(command);
			historyIndex = commandHistory.length;
			if (argument) {
				return processCowsayCommand(argument);
			}
			return processCowsayCommand("moo");

		default:
			if (Object.hasOwn(ASCII_REST_PIECES, cmd)) {
				commandHistory.push(command);
				historyIndex = commandHistory.length;
				return asciiRestCommand(cmd);
			}
			return `<span class="error-text">Command</span> <span class="keyword-text">${escapeText(command)}</span> <span class="error-text">not found.</span> 
            <span class="error-text">For a list of commands, type</span> <span class="keyword-text">help</span><span class="error-text">.</span>`;
	}
}

function clearTerminal() {
	const output = document.getElementById("output");
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
			currentPrompt.innerHTML = `<span class="username keyword-text">${escapeText(newUsername.trim())}</span><span class="prompt-symbol">@</span><span class="normal-text">terminal.kratospidey.com</span>:~$`;
		}

		return `<span class="normal-text">Username changed to </span> <span class="keyword-text">${escapeText(newUsername.trim())}</span>`;
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
		historyString += `<div>${escapeText(cmd)}</div>`;
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

function handleProjectsCommand(argument) {
    if (["robo", "robotics", "fire-fighting-robot"].includes(argument.toLowerCase())) return roboticsText;

	if (argument && projects[argument.toLowerCase()]) {
		// Open the specific project repo
		window.open(projects[argument.toLowerCase()], "_blank");
		return `<span class="normal-text">Opening ${argument} repo...</span>`;
	} else {
		// Display all social media links
		return displayAllPojects();
	}
}

function displayAllSocials() {
	let socialsText = "Here are my social links:<br>";
	for (const [platform, url] of Object.entries(socialLinks)) {
		socialsText += `<span class="keyword-text">${platform}</span> - <a class="error-text" href="${url}" target="_blank">${url}</a><br>`;
	}
	socialsText += `<br>Usage: socials [platform]<br>eg: socials github<br>`;
	return socialsText;
}

function displayAllPojects() {
	let projectsText = "Here are my projects:<br>";
	for (const [project, url] of Object.entries(projects)) {
		projectsText += `<span class="keyword-text">${project === "ion" ? "ion (Ion Chat App)" : project}</span> - <a class="error-text" href="${url}" target="_blank">${url}</a><br>`;
	}
	projectsText += `<br><span class="keyword-text">fire-fighting-robot</span> - Arduino Mega fire-fighting robot (team project).<br>Use <span class="keyword-text">projects robo</span> for details.<br>`;
	projectsText += `<br>Usage: projects [project name]<br>eg: projects duck<br>`;
	return projectsText;
}

function sendEmail() {
	const emailAddress = "contact@kratospidey.com"; // Replace with your actual email address

	// Construct the mailto link
	const mailtoLink = `mailto:${emailAddress}`;

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

document.addEventListener("DOMContentLoaded", (event) => {
	const input = document.getElementById("input"); // The input element where commands are typed
	const output = document.getElementById("output"); // The output element where results are displayed
	const terminal = document.querySelector(".terminal"); // The terminal container

	const commandToType = "welcome";
	let index = 0;

	// Function to simulate typing
	function typeCommand() {
		if (index < commandToType.length) {
			input.textContent += commandToType.charAt(index);
			index++;
			setTimeout(typeCommand, 100); // Adjust typing speed as necessary
		} else {
			// Once typing is finished, append the command to the output
			output.innerHTML +=
				document.querySelector(".prompt").innerHTML +
				`<span class="active-text">welcome</span>`;
			displayWelcomeMessage(); // Display the welcome message after typing is done
			input.textContent = ""; // Clear the input
		}
	}

	// Function to display the welcome message
	function displayWelcomeMessage() {
		const welcomeOutput = processCommand("welcome");
		output.innerHTML += welcomeOutput; // Append the welcome message to the output
		terminal.scrollTop = 0; // Keep the welcome banner visible; commands still scroll normally.
	}

	// Start typing the command
	typeCommand();
});

let initialWidth = window.innerWidth; // Store the initial width

window.addEventListener("resize", function () {
	let currentWidth = window.innerWidth; // Get the new width
	// Keep the art overlay open while its full-window canvas resizes.
	if (window.KraJin2 && window.KraJin2.isOpen()) {
		initialWidth = currentWidth;
		return;
	}
	if (window.KraDwc && window.KraDwc.isOpen()) {
		initialWidth = currentWidth;
		return;
	}

	if (currentWidth !== initialWidth) {
		location.reload(); // Reload only if the width has changed
	}
});

function formatUptime(milliseconds) {
	let seconds = Math.floor(milliseconds / 1000);
	let minutes = Math.floor(seconds / 60);
	seconds = seconds % 60;
	let hours = Math.floor(minutes / 60);
	minutes = minutes % 60;

	return `${hours}h ${minutes}m ${seconds}s`; // Format as "Xh Xm Xs"
}

function triggerImageUpload() {
	document.getElementById("imageInput").click();
}

// Local image-to-ASCII conversion: everything runs in the browser via canvas.
// No uploads, no external services, no API keys.
const ASCII_RAMP = " .:-=+*#%@";
const ASCII_OUTPUT_WIDTH = 96;

document
	.getElementById("imageInput")
	.addEventListener("change", function (event) {
		const file = event.target.files[0];
		if (file) {
			convertFileToAsciiLocally(file);
            event.target.value = "";
		}
	});

function convertFileToAsciiLocally(file) {
	if (file.size > 20 * 1024 * 1024) { displayAsciiArt("Please choose an image smaller than 20 MB."); return; }
    if (!file.type.startsWith("image/")) {
		displayAsciiArt("Please choose an image file.");
		return;
	}
	const img = new Image();
	img.onload = function () {
		const width = ASCII_OUTPUT_WIDTH;
		const height = Math.min(200, Math.max(1, Math.round(width * (img.height / img.width) * 0.5)));
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, width, height);
		const data = ctx.getImageData(0, 0, width, height).data;
		const lines = [];
		for (let y = 0; y < height; y++) {
			let line = "";
			for (let x = 0; x < width; x++) {
				const i = (y * width + x) * 4;
				const alpha = data[i + 3] / 255;
                const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) * alpha + 255 * (1 - alpha);
				line += ASCII_RAMP[Math.min(ASCII_RAMP.length - 1, Math.floor((lum / 256) * ASCII_RAMP.length))];
			}
			lines.push(line);
		}
		displayAsciiArt(lines.join("\n"));
		URL.revokeObjectURL(img.src);
	};
	img.onerror = function () {
		displayAsciiArt("Could not read that image locally.");
		URL.revokeObjectURL(img.src);
	};
	img.src = URL.createObjectURL(file);
}

function displayAsciiArt(asciiArt) {
    const pre = document.createElement("pre");
    pre.className = "ascii-art";
    pre.textContent = asciiArt;
    pre.style.cssText = "max-width:100%;overflow-x:auto;";
    document.getElementById("output").append(pre);
    terminal.scrollTop = terminal.scrollHeight;
}

function processCowsayCommand(message) {
	// Split the input text to extract the message
	return createCowsayMessage(escapeText(message));
}

function createCowsayMessage(message) {
	// Handle wrapping and formatting of message
	const bubbleWrappedMessage = wrapMessageInSpeechBubble(message);

	const cowAscii = `
<pre>
         \\   ^__^
          \\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||
</pre>`;

	// Use <pre> tags to preserve whitespace and line breaks
	return `<pre>${bubbleWrappedMessage}</pre>` + cowAscii;
}

function wrapMessageInSpeechBubble(message) {
	if (message.length >= 40) {
		let maxLength = 40; // max characters per line
		let lines = [];
		while (message.length > maxLength) {
			let spaceIndex = message.lastIndexOf(" ", maxLength);
			// Ensure we don't get an infinite loop
			if (spaceIndex === -1) spaceIndex = maxLength;
			let line = message.substring(0, spaceIndex);
			lines.push(line);
			message = message.substring(spaceIndex + 1);
		}
		lines.push(message); // add remaining part if any

		let bubbleLines = lines.map((line) => `| ${line.padEnd(maxLength, " ")} |`);
		let bubbleTopBottom = `+${"-".repeat(maxLength + 2)}+`;
		let bubbleText = bubbleLines.join("\n");

		return `${bubbleTopBottom}\n${bubbleText}\n${bubbleTopBottom}`;
	} else {
		let messageLength = message.length + 2; // 2 for padding spaces inside the bubble

		// Top of the speech bubble
		let bubbleTop = " " + "_".repeat(messageLength) + " ";
		let bubbleBottom = " " + "-".repeat(messageLength) + " ";
		let textLine = `< ${message} >`;

		// Combine parts to form the speech bubble
		return bubbleTop + "\n" + textLine + "\n" + bubbleBottom;
	}
}

/* --- KraTerm retro FX: boot sequence, keyboard sounds, mute toggle (local-only) --- */
(function kraTermFx() {
	"use strict";
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* sound state */
	let soundOn = localStorage.getItem("kraterm-sound") !== "off";
	let actx = null;
	function ac() {
		if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
		return actx;
	}
	function bus() {
		const c = ac();
		if (!c.__ktBus) { const g = c.createGain(); g.gain.value = soundOn ? 1 : 0; g.connect(c.destination); c.__ktBus = g; }
		return c.__ktBus;
	}
	window.__ktBus = bus;
	window.__ktACState = () => (actx ? actx.state : "none");

	/* ---- keyboard clack: 5 distinct variants, random pick with no immediate repeat ---- */
	let lastClick = 0;
	let lastVariant = -1;
	const clackVariants = [
		/* thock: low, rounded */
		{ bp: 850,  q: 1.3, dur: 0.045, decay: 2.2, nGain: 0.26, osc: "triangle", oF: 120, oEnd: 70,  oDur: 0.07,  oGain: 0.14 },
		/* click: bright, short */
		{ bp: 2600, q: 1.0, dur: 0.02,  decay: 1.4, nGain: 0.2,  osc: "square",   oF: 190, oEnd: 120, oDur: 0.035, oGain: 0.05 },
		/* clack: mid, snappy body */
		{ bp: 1700, q: 1.6, dur: 0.032, decay: 1.8, nGain: 0.24, osc: "square",   oF: 150, oEnd: 90,  oDur: 0.05,  oGain: 0.1 },
		/* snap: very high, tiny tick */
		{ bp: 3400, q: 2.0, dur: 0.015, decay: 1.2, nGain: 0.16, osc: "square",   oF: 240, oEnd: 160, oDur: 0.025, oGain: 0.03 },
		/* thud: deep, soft tail */
		{ bp: 600,  q: 1.1, dur: 0.055, decay: 2.6, nGain: 0.3,  osc: "sine",     oF: 95,  oEnd: 55,  oDur: 0.09,  oGain: 0.17 }
	];
	window.__ktClackPicks = [];
	function keyClick(isEnter) {
		if (!soundOn) return;
		const c = ac();
		if (c.state === "suspended") { c.resume(); }
		const t = c.currentTime;
		if (t - lastClick < 0.02) return;
		lastClick = t;
		let vi = Math.floor(Math.random() * clackVariants.length);
		if (vi === lastVariant) vi = (vi + 1 + Math.floor(Math.random() * (clackVariants.length - 1))) % clackVariants.length;
		lastVariant = vi;
		if (window.__ktClackPicks.length < 500) window.__ktClackPicks.push(vi);
		const v = clackVariants[vi];
		const jit = () => 0.85 + Math.random() * 0.3;
		const gBoost = isEnter ? 1.25 : 1;
		const dur = v.dur * jit();
		const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
		const d = buf.getChannelData(0);
		for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, v.decay);
		const src = c.createBufferSource(); src.buffer = buf;
		const bp = c.createBiquadFilter(); bp.type = "bandpass";
		bp.frequency.value = v.bp * jit() * (isEnter ? 0.75 : 1); bp.Q.value = v.q;
		const g = c.createGain();
		g.gain.setValueAtTime(v.nGain * gBoost * jit(), t);
		g.gain.exponentialRampToValueAtTime(0.001, t + dur);
		src.connect(bp); bp.connect(g); g.connect(bus());
		src.start(t);
		const o = c.createOscillator(); o.type = v.osc;
		o.frequency.setValueAtTime(v.oF * jit(), t);
		o.frequency.exponentialRampToValueAtTime(v.oEnd, t + v.oDur);
		const g2 = c.createGain();
		g2.gain.setValueAtTime(v.oGain * gBoost * jit(), t);
		g2.gain.exponentialRampToValueAtTime(0.001, t + v.oDur + 0.005);
		o.connect(g2); g2.connect(bus());
		o.start(t); o.stop(t + v.oDur + 0.01);
	}
	document.addEventListener("keydown", (e) => {
		musicStart();
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		keyClick(e.key === "Enter");
	}, true);

	/* ---- boot sound: whirr up, beep, hum ---- */
	function bootSound() {
		if (!soundOn) return;
		const c = ac();
		if (c.state === "suspended") { c.resume().then(() => { if (c.state === "running") bootSoundNow(c); }); return; }
		bootSoundNow(c);
	}
	function bootSoundNow(c) {
		const t0 = c.currentTime + 0.05;
		/* fan/disk whirr: filtered noise rising then settling */
		const dur = 1.5;
		const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
		const d = buf.getChannelData(0);
		for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
		const noise = c.createBufferSource(); noise.buffer = buf;
		const lp = c.createBiquadFilter(); lp.type = "lowpass";
		lp.frequency.setValueAtTime(220, t0);
		lp.frequency.exponentialRampToValueAtTime(1400, t0 + 0.9);
		lp.frequency.exponentialRampToValueAtTime(500, t0 + dur);
		const ng = c.createGain();
		ng.gain.setValueAtTime(0.0001, t0);
		ng.gain.exponentialRampToValueAtTime(0.16, t0 + 0.5);
		ng.gain.exponentialRampToValueAtTime(0.02, t0 + dur);
		noise.connect(lp); lp.connect(ng); ng.connect(bus());
		noise.start(t0); noise.stop(t0 + dur);
		/* spin-up whine */
		const o = c.createOscillator(); o.type = "sawtooth";
		o.frequency.setValueAtTime(70, t0);
		o.frequency.exponentialRampToValueAtTime(340, t0 + 1.1);
		const og = c.createGain();
		og.gain.setValueAtTime(0.0001, t0);
		og.gain.exponentialRampToValueAtTime(0.05, t0 + 0.6);
		og.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
		o.connect(og); og.connect(bus());
		o.start(t0); o.stop(t0 + 1.5);
		/* power beep */
		const b = c.createOscillator(); b.type = "square"; b.frequency.value = 880;
		const bg = c.createGain();
		const tb = t0 + 1.55;
		bg.gain.setValueAtTime(0.0001, tb);
		bg.gain.exponentialRampToValueAtTime(0.12, tb + 0.01);
		bg.gain.exponentialRampToValueAtTime(0.0001, tb + 0.11);
		b.connect(bg); bg.connect(bus());
		b.start(tb); b.stop(tb + 0.12);
		/* mains hum settling in */
		const h = c.createOscillator(); h.type = "triangle"; h.frequency.value = 120;
		const h2 = c.createOscillator(); h2.type = "sine"; h2.frequency.value = 60;
		const hg = c.createGain();
		const th = t0 + 1.7;
		hg.gain.setValueAtTime(0.0001, th);
		hg.gain.exponentialRampToValueAtTime(0.045, th + 0.25);
		hg.gain.exponentialRampToValueAtTime(0.0001, th + 2.9);
		h.connect(hg); h2.connect(hg); hg.connect(bus());
		h.start(th); h2.start(th); h.stop(th + 3.0); h2.stop(th + 3.0);
	}

	/* ---- boot overlay animation ---- */
	const bootLines = [
		"KraTerm BIOS v2.11 - kratospidey systems",
		"Memory check ......... 65536K OK",
		"Warming up phosphors ...",
		"Loading /dev/tty ..... OK",
		"",
		"[ OK ] display ready",
	];
	function runBoot() {
		if (reducedMotion) { bootSound(); return; }
		const overlay = document.createElement("div");
		overlay.id = "kraterm-boot";
		const pre = document.createElement("pre");
		overlay.append(pre);
		document.body.append(overlay);
		let i = 0;
		const step = () => {
			if (i < bootLines.length) {
				pre.textContent = bootLines.slice(0, i + 1).join("\n") + (i < bootLines.length - 1 ? "\n_" : "");
				i++;
				setTimeout(step, i === 1 ? 900 : 750);
			} else {
				setTimeout(() => {
					overlay.classList.add("boot-done");
					const term = document.querySelector(".terminal");
					if (term) term.classList.add("crt-on");
					setTimeout(() => overlay.remove(), 450);
				}, 1100);
			}
		};
		step();
		bootSound();
	}

	/* ---- background music: synthesized chill loop, zero assets (local-only) ---- */
	let musicOn = localStorage.getItem("kraterm-music") !== "off";
	let musicLive = null;
	function musicStart() {
		if (!musicOn || musicLive) return;
		const c = ac();
		if (c.state === "suspended") c.resume();
		const out = c.createGain();
		out.gain.setValueAtTime(0.0001, c.currentTime);
		out.gain.exponentialRampToValueAtTime(0.8, c.currentTime + 5);
		out.connect(c.destination);
		const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 720; lp.Q.value = 0.5;
		lp.connect(out);
		const lfo = c.createOscillator(); lfo.frequency.value = 0.05;
		const lfoG = c.createGain(); lfoG.gain.value = 160;
		lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
		const dly = c.createDelay(1); dly.delayTime.value = 0.42;
		const fb = c.createGain(); fb.gain.value = 0.3;
		const wet = c.createGain(); wet.gain.value = 0.22;
		lp.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(wet); wet.connect(out);

		const chords = [
			[110.0, 130.81, 164.81],  /* Am */
			[87.31, 110.0, 130.81],   /* F  */
			[130.81, 164.81, 196.0],  /* C  */
			[98.0, 123.47, 146.83],   /* G  */
		];
		/* pad: three detuned triangle voices with portamento between chords */
		const padGain = c.createGain(); padGain.gain.value = 0.05; padGain.connect(lp);
		const voices = chords[0].map((f, i) => {
			const o = c.createOscillator(); o.type = "triangle";
			o.frequency.value = f; o.detune.value = (i - 1) * 4;
			o.connect(padGain); o.start();
			return o;
		});
		/* arp: soft square plucks on chord tones, 8th notes at 72bpm */
		let chordIx = 0, tick = 0;
		const pattern = [0, 1, 2, 1, 0, 2, 1, 2];
		const timer = setInterval(() => {
			const t = c.currentTime + 0.06;
			if (tick % 16 === 0) {
				chordIx = (tick / 16) % chords.length;
				voices.forEach((o, i) => {
					o.frequency.exponentialRampToValueAtTime(chords[chordIx][i], t + 0.09);
				});
			}
			const f = chords[chordIx][pattern[tick % 8]] * 2;
			const o = c.createOscillator(); o.type = "square"; o.frequency.value = f;
			const g = c.createGain();
			g.gain.setValueAtTime(0.045, t);
			g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
			o.connect(g); g.connect(lp);
			o.start(t); o.stop(t + 0.26);
			tick++;
		}, 417);
		musicLive = { out, stop() {
			clearInterval(timer);
			const t = c.currentTime;
			out.gain.cancelScheduledValues(t);
			out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), t);
			out.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
			setTimeout(() => {
				voices.forEach((o) => { try { o.stop(); } catch (e) {} });
				try { lfo.stop(); } catch (e) {}
				out.disconnect(); lp.disconnect(); dly.disconnect(); fb.disconnect(); wet.disconnect();
			}, 700);
		} };
	}
	function musicStop() {
		if (musicLive) { musicLive.stop(); musicLive = null; }
	}
	window.__ktMusic = { state: () => (musicLive ? "on" : "off"), out: () => (musicLive ? musicLive.out : null) };
	document.addEventListener("pointerdown", musicStart, true);

	function musicToggle() {
		const el = document.createElement("div");
		el.id = "kt-music-toggle";
		el.setAttribute("role", "button");
		el.setAttribute("tabindex", "0");
		const label = () => { el.textContent = musicOn ? "[ music: on ]" : "[ music: off ]"; };
		label();
		const flip = () => {
			musicOn = !musicOn;
			localStorage.setItem("kraterm-music", musicOn ? "on" : "off");
			if (musicOn) musicStart(); else musicStop();
			label();
		};
		el.addEventListener("click", flip);
		el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
		document.body.append(el);
	}

	/* ---- mute toggle ---- */
	function soundToggle() {
		const el = document.createElement("div");
		el.id = "kt-sound-toggle";
		el.setAttribute("role", "button");
		el.setAttribute("tabindex", "0");
		const label = () => { el.textContent = soundOn ? "[ snd: on ]" : "[ snd: off ]"; };
		label();
		const flip = () => {
			soundOn = !soundOn;
			localStorage.setItem("kraterm-sound", soundOn ? "on" : "off");
			if (actx && actx.__ktBus) actx.__ktBus.gain.value = soundOn ? 1 : 0;
			label();
		};
		el.addEventListener("click", flip);
		el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
		document.body.append(el);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => { runBoot(); soundToggle(); musicToggle(); });
	} else {
		runBoot(); soundToggle(); musicToggle();
	}
})();
// oneko.js: https://github.com/adryd325/oneko.js

(function oneko() {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  if (isReducedMotion) return;

  const nekoEl = document.createElement("div");
  let persistPosition = true;

  let nekoPosX = 32;
  let nekoPosY = 32;
  
  let mousePosX = 0;
  let mousePosY = 0;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  const nekoSpeed = 10;
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function init() {
    let nekoFile = "data:image/gif;base64,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"
    const curScript = document.currentScript
    if (curScript && curScript.dataset.cat) {
      nekoFile = curScript.dataset.cat
    }
    if (curScript && curScript.dataset.persistPosition) {
      if (curScript.dataset.persistPosition === "") {
        persistPosition = true;
      } else {
        persistPosition = JSON.parse(curScript.dataset.persistPosition.toLowerCase());
      }
    }
  
    if (persistPosition) {
      let storedNeko = JSON.parse(window.localStorage.getItem("oneko"));
      if (storedNeko !== null) {
        nekoPosX = storedNeko.nekoPosX;
        nekoPosY = storedNeko.nekoPosY;
        mousePosX = storedNeko.mousePosX;
        mousePosY = storedNeko.mousePosY;
        frameCount = storedNeko.frameCount;
        idleTime = storedNeko.idleTime;
        idleAnimation = storedNeko.idleAnimation;
        idleAnimationFrame = storedNeko.idleAnimationFrame;
        nekoEl.style.backgroundPosition = storedNeko.bgPos;
      }
    }
  
    nekoEl.id = "oneko";
    nekoEl.ariaHidden = true;
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "fixed";
    nekoEl.style.pointerEvents = "none";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    nekoEl.style.zIndex = 2147483647;

    nekoEl.style.backgroundImage = `url(${nekoFile})`;
    
    document.body.appendChild(nekoEl);

    document.addEventListener("mousemove", function (event) {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });
    
    if (persistPosition) {
      window.addEventListener("beforeunload", function (event) {
        window.localStorage.setItem("oneko", JSON.stringify({
          nekoPosX: nekoPosX,
          nekoPosY: nekoPosY,
          mousePosX: mousePosX,
          mousePosY: mousePosY,
          frameCount: frameCount,
          idleTime: idleTime,
          idleAnimation: idleAnimation,
          idleAnimationFrame: idleAnimationFrame,
          bgPos: nekoEl.style.backgroundPosition
        }));
      });
    }
    
    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;

  function onAnimationFrame(timestamp) {
    // Stops execution if the neko element is removed from DOM
    if (!nekoEl.isConnected) {
      return;
    }
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // every ~ 20 seconds
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];
      if (nekoPosX < 32) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (nekoPosY < 32) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (nekoPosX > window.innerWidth - 32) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (nekoPosY > window.innerHeight - 32) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        avalibleIdleAnimations[
          Math.floor(Math.random() * avalibleIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      // count down after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  init();
})();

/* --- click pixel burst: small theme-matched particle pop (local-only) --- */
(function kraTermClickBurst() {
	"use strict";
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
	const COLORS = ["#8fffb0", "#8fffb0", "#8fffb0", "#5adfff", "#02120a"];
	let live = 0;
	document.addEventListener("pointerdown", (e) => {
		if (live > 40) return;
		const n = 8;
		for (let i = 0; i < n; i++) {
			const el = document.createElement("div");
			el.className = "kt-pixel";
			el.style.background = COLORS[i % COLORS.length];
			el.style.left = e.clientX - 2 + "px";
			el.style.top = e.clientY - 2 + "px";
			document.body.append(el);
			live++;
			const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
			const dist = 18 + Math.random() * 26;
			const dx = Math.cos(ang) * dist;
			const dy = Math.sin(ang) * dist - 8;
			const anim = el.animate(
				[
					{ transform: "translate(0, 0)", opacity: 1 },
					{ transform: "translate(" + dx + "px, " + (dy + 14) + "px)", opacity: 0 },
				],
				{ duration: 340 + Math.random() * 120, easing: "cubic-bezier(.17,.67,.4,1)" }
			);
			anim.onfinish = () => { el.remove(); live--; };
		}
	}, true);
})();


/* --- critters: ambient ASCII animals behind the terminal ---
   Animation engine from github.com/DesignerStephen1/ascii-animals (MIT, see LICENSE-ascii-animals), bundled in critters.js. Butterflies by default, loaded on demand. */
const CRITTER_NAMES = {
	butterflies: "butterflies", butterfly: "butterflies",
	koi: "koi",
	jellyfish: "jellyfish",
	dragonflies: "dragonflies", dragonfly: "dragonflies",
	frogs: "frogs", frog: "frogs",
	cranes: "cranes", crane: "cranes",
	crabs: "crabs", crab: "crabs",
};
const critters = { engine: null, canvas: null, loading: null, animal: null };
function crittersLoad() {
	if (window.KraCritters) return Promise.resolve();
	if (critters.loading) return critters.loading;
	critters.loading = new Promise((resolve, reject) => {
		const el = document.createElement("script");
		el.src = "critters.js?v=1";
		el.onload = resolve;
		el.onerror = () => { critters.loading = null; reject(new Error("load failed")); };
		document.head.appendChild(el);
	});
	return critters.loading;
}
function crittersIsLight() {
	const m = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
	if (!m) return false;
	return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) > 150;
}
function crittersApplyTheme() {
	if (!critters.canvas) return;
	const light = crittersIsLight();
	critters.canvas.classList.toggle("light", light);
	if (critters.engine) critters.engine.setTheme(light ? "light" : "dark");
}
new MutationObserver(crittersApplyTheme).observe(document.body, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
function crittersStart(animal) {
	return crittersLoad().then(() => {
		const K = window.KraCritters;
		if (!critters.canvas) {
			const c = document.createElement("canvas");
			c.id = "critters-canvas";
			c.setAttribute("aria-hidden", "true");
			document.body.insertBefore(c, document.body.firstChild);
			critters.canvas = c;
		}
		const tuning = { grid: 0 };
		if (critters.engine) {
			critters.engine.setAnimal(animal, tuning);
		} else {
			critters.engine = new K.AnimalEngine(critters.canvas, { animal, theme: crittersIsLight() ? "light" : "dark", tuning });
		}
		critters.animal = animal;
		crittersApplyTheme();
		localStorage.setItem("kraterm-critters", animal);
	});
}
function crittersStop() {
	if (critters.engine) { critters.engine.destroy(); critters.engine = null; }
	if (critters.canvas) { critters.canvas.remove(); critters.canvas = null; }
	critters.animal = null;
	localStorage.setItem("kraterm-critters", "off");
}
function crittersCommand(arg) {
	const parts = arg.trim().toLowerCase().split(/\s+/).filter(Boolean);
	const sub = parts[0];
	const names = "butterflies, koi, jellyfish, dragonflies, frogs, cranes, crabs";
	const usage = `<span class="normal-text">Usage: critters &lt;${names}&gt; | off | tweaks | set &lt;knob&gt; &lt;value&gt;</span>`;
	if (!sub) {
		return (critters.animal ? `<span class="normal-text">Critters: ${critters.animal}. </span>` : `<span class="normal-text">Critters are off. </span>`) + usage;
	}
	if (sub === "off") { crittersStop(); return `<span class="normal-text">Critters off.</span>`; }
	if (CRITTER_NAMES[sub]) {
		const name = CRITTER_NAMES[sub];
		crittersStart(name).then(() => {
			const out = document.getElementById("output");
			out.innerHTML += `<div><span class="normal-text">Critters: ${name}. Type </span><span class="keyword-text">critters tweaks</span><span class="normal-text"> to adjust them.</span></div>`;
			terminal.scrollTop = terminal.scrollHeight;
		}).catch(() => {
			const out = document.getElementById("output");
			out.innerHTML += `<div><span class="error-text">Could not load critters.</span></div>`;
		});
		return `<span class="normal-text">Summoning ${name}...</span>`;
	}
	if (sub === "tweaks") {
		if (!critters.engine) return `<span class="normal-text">Start some first, e.g. </span><span class="keyword-text">critters koi</span>`;
		const t = critters.engine.tuning;
		const rows = Object.keys(t).filter(k => typeof t[k] === "number" || typeof t[k] === "boolean").map(k => `<span class="keyword-text">${escapeText(k)}</span> = <span class="normal-text">${escapeText(t[k])}</span>`);
		return rows.join("<br>") + `<br><span class="normal-text">Change one: critters set speed 1.5</span>`;
	}
	if (sub === "set") {
		if (!critters.engine) return `<span class="normal-text">Start some first, e.g. </span><span class="keyword-text">critters koi</span>`;
		const key = parts[1];
		const t = critters.engine.tuning;
		if (!key || !(key in t) || parts[2] === undefined) return usage;
		let v = parts[2];
		if (typeof t[key] === "boolean") v = v === "on" || v === "true" || v === "1";
		else { v = parseFloat(v); if (!isFinite(v)) return usage; }
		critters.engine.set(key, v);
		return `<span class="normal-text">${escapeText(key)} = ${escapeText(v)}</span>`;
	}
	return usage;
}
(function crittersRestore() {
	// Butterflies are the default for fresh visitors; an explicit saved choice (including "off") wins.
	let saved = localStorage.getItem("kraterm-critters");
	if (saved === null) {
		saved = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "off" : "butterflies";
	}
	if (saved && saved !== "off" && CRITTER_NAMES[saved]) {
		const go = () => crittersStart(CRITTER_NAMES[saved]).catch(() => {});
		if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
	}
})();

// Safari can ignore the viewport scale limits for touch gestures.
const coarsePointer = matchMedia("(any-pointer: coarse)");
for (const type of ["gesturestart", "gesturechange"]) {
	document.addEventListener(type, event => {
		if (coarsePointer.matches) event.preventDefault();
	}, {passive: false});
}
document.addEventListener("touchmove", event => {
	if (event.touches.length > 1) event.preventDefault();
}, {passive: false});

// All fullscreen players use the same tap rules.
function bindArtPointerControls(canvas, close, restart) {
	const activePointers = new Set();
	let tap;

	canvas.addEventListener("pointerdown", event => {
		event.preventDefault();
		event.stopPropagation();
		activePointers.add(event.pointerId);
		if (activePointers.size > 1) {
			tap = null;
		} else if (event.pointerType === "mouse") {
			restart();
		} else if (event.isPrimary) {
			tap = event;
		}
		canvas.setPointerCapture(event.pointerId);
	});

	function movedTooFar(event) {
		return Math.hypot(event.clientX - tap.clientX, event.clientY - tap.clientY) >= 10;
	}

	canvas.addEventListener("pointermove", event => {
		if (tap?.pointerId === event.pointerId && movedTooFar(event)) tap = null;
	});

	canvas.addEventListener("pointerup", event => {
		activePointers.delete(event.pointerId);
		if (tap?.pointerId !== event.pointerId) return;
		const isTap = !movedTooFar(event) && event.timeStamp - tap.timeStamp <= 300;
		tap = null;
		if (isTap) close();
	});

	for (const type of ["pointercancel", "lostpointercapture"]) {
		canvas.addEventListener(type, event => {
			activePointers.delete(event.pointerId);
			if (tap?.pointerId === event.pointerId) tap = null;
		});
	}
}

/* JIN2 ASCII code art: loaded only by these commands or the screenshot query. */
const JIN2_SCRIPT = "jin2.js?v=mobile-fix1";
const JIN2_PIECES = { blackhole: "black hole", nighttide: "night tide", catknight: "cat knight" };
let jin2Loading;
function jin2Load() {
	if (window.KraJin2) return Promise.resolve();
	if (jin2Loading) return jin2Loading;
	jin2Loading = new Promise((resolve, reject) => {
		const el = document.createElement("script");
		el.src = JIN2_SCRIPT;
		el.onload = resolve;
		el.onerror = () => { el.remove(); jin2Loading = null; reject(new Error("load failed")); };
		document.head.appendChild(el);
	});
	return jin2Loading;
}
function jin2Command(piece, options) {
	const credit = `${JIN2_PIECES[piece]} — ASCII art by JIN2 (@jin_22ee), adapted under his personal-use license`;
	// Defer even cached opens so the command's credit is printed first.
	setTimeout(() => jin2Load().then(() => window.KraJin2.open(piece, options)).catch(() => {
		const line = document.createElement("div");
		line.className = "error-text";
		line.textContent = "Could not load JIN2 ASCII art. Run the command to retry.";
		document.getElementById("output").appendChild(line);
	}), 0);
	return `<span class="normal-text">${credit}</span>`;
}

/* @dwcminh.ascii ASCII art (Eiffel Tower, Universe): loaded only by these commands or the screenshot query. */
const DWC_SCRIPT = "dwcminh.js?v=mobile-fix1";
const DWC_PIECES = { eiffel: "eiffel tower", universe: "universe" };
let dwcLoading;
function dwcLoad() {
	if (window.KraDwc) return Promise.resolve();
	if (dwcLoading) return dwcLoading;
	dwcLoading = new Promise((resolve, reject) => {
		const el = document.createElement("script");
		el.src = DWC_SCRIPT;
		el.onload = resolve;
		el.onerror = () => { el.remove(); dwcLoading = null; reject(new Error("load failed")); };
		document.head.appendChild(el);
	});
	return dwcLoading;
}
function dwcCommand(piece, options) {
	const credit = `${DWC_PIECES[piece]} — ASCII art by @dwcminh.ascii, adapted under his personal-use license`;
	// Defer even cached opens so the command's credit is printed first.
	setTimeout(() => dwcLoad().then(() => window.KraDwc.open(piece, options)).catch(() => {
		const line = document.createElement("div");
		line.className = "error-text";
		line.textContent = "Could not load the ASCII art. Run the command to retry.";
		document.getElementById("output").appendChild(line);
	}), 0);
	return `<span class="normal-text">${credit}</span>`;
}
function asciiRestLoad() {
	return import("./ascii-rest.js?v=mobile-fix1");
}

function asciiRestError(error) {
	console.error(error);
	const line = document.createElement("div");
	line.className = "error-text";
	line.textContent = "Could not load the ASCII art. Run the command to retry.";
	document.getElementById("output").appendChild(line);
}

function asciiRestCommand(command, options) {
	const piece = ASCII_REST_PIECES[command];
	setTimeout(() => asciiRestLoad().then(module => module.open(piece, options)).catch(asciiRestError), 0);
	return `<span class="normal-text">${piece.name} - animated ASCII art by @bas3line / ascii.rest, MIT license</span>`;
}

function artGalleryPieces() {
	const legacy = (command, name, still, source, script, player, width, height) =>
		({command, name, still, source, legacy: {script, player, width, height}});
	return [
		...Object.values(ASCII_REST_PIECES),
		legacy("blackhole", "Black Hole", 13, "JIN2 · @jin_22ee", JIN2_SCRIPT, "KraJin2", 1288, 960),
		legacy("nighttide", "Night Tide", 13, "JIN2 · @jin_22ee", JIN2_SCRIPT, "KraJin2", 1080, 960),
		legacy("catknight", "Cat Knight", 13, "JIN2 · @jin_22ee", JIN2_SCRIPT, "KraJin2", 1080, 960),
		legacy("eiffel", "Eiffel Tower", 16, "@dwcminh.ascii", DWC_SCRIPT, "KraDwc", 792, 1036),
		legacy("universe", "Universe", 20, "@dwcminh.ascii", DWC_SCRIPT, "KraDwc", 792, 1036),
	];
}

function launchArt(command) {
	const output = document.getElementById("output");
	const prompt = document.createElement("div");
	prompt.className = "input-line";
	prompt.innerHTML = `${getCurrentPrompt()}<div>${escapeText(command)}</div>`;
	const line = document.createElement("div");
	line.innerHTML = processCommand(command);
	output.append(prompt, line);
	terminal.scrollTop = terminal.scrollHeight;
}

(function artReviewQuery() {
	const query = new URLSearchParams(location.search), piece = query.get("art");
	const isJin2 = Object.prototype.hasOwnProperty.call(JIN2_PIECES, piece);
	const isDwc = Object.prototype.hasOwnProperty.call(DWC_PIECES, piece);
	const isAsciiRest = Object.hasOwn(ASCII_REST_PIECES, piece);
	if (!isJin2 && !isDwc && !isAsciiRest) return;
	const start = () => {
		const rawTime = Number(query.get("t") || 0);
		const line = document.createElement("div");
		const options = {time: Number.isFinite(rawTime) ? rawTime : 0, paused: true};
		const run = isAsciiRest ? asciiRestCommand : isDwc ? dwcCommand : jin2Command;
		line.innerHTML = run(piece, options);
		document.getElementById("output").appendChild(line);
	};
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* Click or tap anywhere on the terminal to focus the prompt (not on links, buttons or a text selection). */
(function inputFocusArea() {
	const terminal = document.querySelector(".terminal");
	const input = document.getElementById("input");
	if (!terminal || !input) return;
	terminal.addEventListener("click", (event) => {
		if (window.KraJin2 && window.KraJin2.isOpen()) return;
		if (window.KraDwc && window.KraDwc.isOpen()) return;
		if (event.target.closest("a, button, input, [contenteditable='true']")) return;
		const selection = window.getSelection();
		if (selection && !selection.isCollapsed) return;
		const y = terminal.scrollTop;
		input.focus({ preventScroll: true });
		const range = document.createRange();
		range.selectNodeContents(input);
		range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);
		terminal.scrollTop = y;
	});
})();
