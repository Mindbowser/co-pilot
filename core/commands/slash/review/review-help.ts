import { SlashCommand } from "../../../index.js";

const ReviewHelpCommand: SlashCommand = {
  name: "review:help",
  description: "List all the available review commands with description",
  run: async function* ({ ide, params }) {

    yield `
			Available Review Commands:

			1. review:stage
				Description: Review stage difference code and give feedback\n

					a. review:stage:naming-convention\n
							Description: Review naming convention in stage difference code and give feedback\n
					b. review:stage:duplications\n
							Description: Review duplications in stage difference code and give feedback\n
					c. review:stage:comments\n
							Description: Review comments in stage difference code and give feedback\n
					d. review:stage:memory-leaks\n
							Description: Review memory leaks in stage difference code and give feedback\n
					e. review:stage:compliance\n
							Description: Review compliance in stage difference code and give feedback\n
					f. review:stage:logging\n
							Description: Review logging in stage difference code and give feedback\n
					g. review:stage:refactoring\n
							Description: Review refactoring in stage difference code and give feedback\n

			2. review:codebase\n
				Description: Review entire codebase and give feedback\n
				Note: This command may not work properly for large codebase for now, we are working on it\n
    `;
  },
};

export default ReviewHelpCommand;
