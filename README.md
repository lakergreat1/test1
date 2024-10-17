
## Key Components

1. `main.py`: The main FastAPI application file. It contains the API routes and core logic for transcription and report generation.

2. `reports.py`: Defines the Pydantic models for the report structures (CrownBrief and GeneralOccurrence).

3. `narrative_guidelines.py`: Contains the guidelines for different report types, used in report generation.

4. `static/js/app.js`: Client-side JavaScript for handling audio recording, UI updates, and API interactions.

5. `templates/index.html`: The main HTML template for the web interface.

## Functionality

1. **Audio Recording**: Users can record audio in chunks, allowing them to pause and resume recording.

2. **Transcription**: Each audio chunk is immediately transcribed using OpenAI's Whisper API and displayed in an editable text area.

3. **Report Generation**: Users can select an occurrence type and report type, then generate a structured report based on the transcription.

4. **Report Editing**: Generated reports can be further edited using AI-assisted instructions.

## API Endpoints

- `GET /`: Serves the main application page.
- `POST /transcribe`: Transcribes uploaded audio files.
- `POST /generate_report`: Generates a structured report based on the transcription and selected report type.
- `POST /edit_report`: Edits an existing report based on user instructions.

## Setup and Running

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up your OpenAI API key as an environment variable:
   ```
   export OPENAI_API_KEY=your_api_key_here
   ```

3. Run the application:
   ```
   uvicorn main:app --reload
   ```

The application will be available at `http://localhost:8000`.

## Deployment

The application is configured for deployment on platforms like Heroku or Railway. The `Procfile` specifies the command to run the application in a production environment.

## CORS Configuration

CORS is configured to allow requests from localhost (for development) and the production URL (`https://pd-report-production.up.railway.app/`).

## Note for Developers

- The application uses OpenAI's GPT-4 model for report generation and editing. Ensure you have the necessary API access and credits.
- Audio files are temporarily saved on the server during transcription. The code includes safeguards to remove these files, but monitor your server's storage if deploying to a production environment.
- The frontend uses DaisyUI components. Refer to the DaisyUI documentation for styling and component usage.
