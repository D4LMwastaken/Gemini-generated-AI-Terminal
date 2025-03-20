import os
import google.generativeai as genai
from rich.console import Console
from rich.markdown import Markdown
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Configuration (Replace with your actual API key) ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize Gemini API client
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    print("Error: Google API key not found. Please set the GOOGLE_API_KEY environment variable.")
    exit(1)

# --- Function to List Available Models (for debugging) ---
def list_available_models():
    """Lists available models and their supported methods."""
    console = Console()
    console.print("[bold yellow]Listing available models:[/bold yellow]")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:  # Check for method support
            console.print(f"  [green]Model:[/green] {m.name}")
            console.print(f"  [green]Display Name:[/green] {m.display_name}")
            console.print(f"  [green]Supported Methods:[/green] {m.supported_generation_methods}")
            console.print("-" * 20)

# --- Choose a Gemini model (after checking with list_available_models) ---
MODEL_NAME = "models/gemini-2.0-pro-exp"  # This is a likely correct name, BUT VERIFY!
#Or, if you have access and it is listed:
#MODEL_NAME = "models/gemini-1.5-pro-002"

console = Console()

def get_llm_response(chat_session, prompt: str) -> str:
    """Gets a response from the Gemini API in a chat session."""
    try:
        response = chat_session.send_message(prompt)
        return response.text
    except Exception as e:
        if hasattr(e, 'message'):
             # Check for 'blocked' status
            if "response.prompt_feedback" in str(e):
                return f"Gemini API Error: {e.message}.  Prompt blocked due to safety settings."
            return f"Gemini API Error: {e.message}"
        else:
            return f"An unexpected error occurred: {type(e).__name__}: {e}"

def main():
    """Main loop for the terminal AI (with chat history)."""
    console.print("Terminal AI Assistant (Gemini API, Chat Mode) (Type 'exit' or 'quit' to end)")

    # --- Uncomment the next line to list available models the FIRST time you run this ---
    # list_available_models()

    # Use correct Model name here
    model = genai.GenerativeModel(MODEL_NAME)
    chat = model.start_chat(history=[])  # Initialize an empty chat history

    while True:
        try:
            user_input = console.input("[bold cyan]You:[/bold cyan] ")
            if user_input.lower() in ("exit", "quit"):
                break

            response = get_llm_response(chat, user_input)

            # Display the response
            md = Markdown(response)
            console.print(md)

        except KeyboardInterrupt:
            console.print("\n[bold yellow]Exiting...[/bold yellow]")
            break
        except Exception as e:
            console.print(f"[bold red]An error occurred: {e}[/bold red]")

if __name__ == "__main__":
    main()