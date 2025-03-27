//
//                                        Chat, Edit, and Autocomplete tutorial
//

// ————————————————————————————————————————————————     Setup      ————————————————————————————————————————————————-

// First, open the Epico Pilot sidebar by pressing [Cmd + L] or clicking the Epico Pilot icon.

// See an example at https://docs.epico-pilot.dev/getting-started/install

// Follow the instructions in the sidebar to set up a Chat/Edit modela and an Autocomplete model.

// —————————————————————————————————————————————————     Chat      —————————————————————————————————————————————————

// Highlight the code below
// Press [Cmd + L] to add to Chat
// Try asking Epico Pilot "what sorting algorithm is this?"
public static int[] sortingAlgorithm(int[] x) {
    for (int i = 0; i < x.length; i++) {
        for (int j = 0; j < x.length - 1; j++) {
            if (x[j] > x[j + 1]) {
                int temp = x[j];
                x[j] = x[j + 1];
                x[j + 1] = temp;
            }
        }
    }
    return x;
}

// [Cmd + L] always starts a new chat. Now, try the same thing using [Cmd + Shift + L].
// This will add the code into the current chat

// —————————————————————————————————————————————————     Edit      ————————————————————————————————————————————————— 

// Highlight the code below
// Press [Cmd + I] to Edit
// Try asking Epico Pilot to "make this more readable"
public static int[] sortingAlgorithm2(int[] x) {
    for (int i = 0; i < x.length; i++) {
        for (int j = 0; j < x.length - 1; j++) {
            if (x[j] > x[j + 1]) {
                int temp = x[j];
                x[j] = x[j + 1];
                x[j + 1] = temp;
            }
        }
    }
    return x;
}

// —————————————————————————————————————————————     Autocomplete     ——————————————————————————————————————————————

// Place cursor after `sortingAlgorithm:` below and press [Enter]
// Press [Tab] to accept the Autocomplete suggestion

// Basic assertion for sortingAlgorithm:



// —————————————————————————————————————————————-     Learn More     -——————————————————————————————————————————————

// Visit the Epico Pilot Docs at https://docs.epico-pilot.dev/getting-started/overview
