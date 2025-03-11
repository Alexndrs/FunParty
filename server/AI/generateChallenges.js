require("dotenv").config();
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function main() {
    const chatCompletion = await getGroqChatCompletion();
    // Print the completion returned by the LLM.
    console.log(chatCompletion.choices[0]?.message?.content || "");
}


const OUTPUT_JSON_FORMAT = JSON.stringify({
    challenges: [
        {
            id: 1,
            title: "Dance off",
            description: "You will challenge someone to a dance off",
            points: 200,
        },
        {
            id: 2,
            title: "The Clone",
            description: "You will find someone that looks like you and take a picture with them",
            points: 150,
        },
        {
            id: 3,
            title: "Drink off",
            description: "You will challenge someone to a drink off",
            points: 100,
        },
        {
            id: 4,
            title: "Cool",
            description: "You will find with sunglasses and take a picture with them",
            points: 100,
        }
    ]
});


export const getGroqChatCompletion = async () => {
    return groq.chat.completions.create({
        //
        // Required parameters
        //
        messages: [
            // Set an optional system message. This sets the behavior of the
            // assistant and can be used to provide specific instructions for
            // how it should behave throughout the conversation.
            {
                role: "system",
                content: "you are a funny extrovert guy that like to make jokes and have very funny side quest during party that help you to make friends and have fun",
            },
            // Set a user message for the assistant to respond to.
            {
                role: "user",
                content: `You will give a list of 6 challenges/Side quest, to do during a party like a college party you will use the following JSON format ${OUTPUT_JSON_FORMAT}, try to find funny title or play of world for the challenges, give simple but funny challenges that help to connect with other people and have fun. Do not use the exact same challenges as the example, be original.`,
            },
        ],

        // The language model which will generate the completion.
        model: "mistral-saba-24b",
        //
        // Optional parameters
        //

        // Controls randomness: lowering results in less random completions.
        // As the temperature approaches zero, the model will become deterministic
        // and repetitive.
        temperature: 0.999,

        // The maximum number of tokens to generate. Requests can use up to
        // 2048 tokens shared between prompt and completion.
        max_completion_tokens: 1024,

        // Controls diversity via nucleus sampling: 0.5 means half of all
        // likelihood-weighted options are considered.
        top_p: 1,

        // A stop sequence is a predefined or user-specified text string that
        // signals an AI to stop generating content, ensuring its responses
        // remain focused and concise. Examples include punctuation marks and
        // markers like "[end]".
        stop: null,

        // If set, partial message deltas will be sent.
        stream: false,
        response_format: { type: "json_object" },
    });
};


main();