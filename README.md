# Mini Voice AI Assistant

A minimal, full-stack voice-based assistant that listens, understands, and responds — all in one go. Built in a day using browser APIs and OpenAI’s Whisper and GPT models.

## Features

* Record audio from the microphone
    
* Transcribe speech to text using OpenAI Whisper
    
* Send transcript to OpenAI GPT for empathetic, supportive replies
    
* Convert response text to speech using browser TTS
    
* Simple, desktop-friendly UI resembling chat apps (SMS-style)
 

## Setup Instructions

### 1\. Clone the repository

```
git clone <your-repo-url>
cd <project-folder>
```

### 2\. Install dependencies

From the root directory:

```
npm install
```

This installs:

*   **Backend:** `express`, `multer`, `axios`, `form-data`, `dotenv`
   
*   **Frontend** (inside `frontend-voice-ai`): `vite`, `react`, `tailwindcss`, `postcss`, `autoprefixer`
 

### 3\. Create a `.env` file

At the root of the project:

```
OPENAI_API_KEY=YOUR_API_KEY
```


### 4\. Start the backend server

```
node server.js
```

The server will run at:

```
http://localhost:3001
```

### 5\. Start the frontend (React app)

```
cd frontend-voice-ai
npm run dev
```

The frontend UI will be available at:

```
http://localhost:5173
```

If using VS Code Live Server, it may open on port 3001. Please switch manually to `localhost:5173`.

## How It Works

- Click **Vent** to begin recording.
   
- Click **Done** to stop and send the audio.
 
- The backend transcribes the audio using Whisper.
   
- The transcript is passed to GPT-3.5 for a compassionate response.
    
- The GPT response is displayed as a chat message
  
- Played back using browser Text-to-Speech
 
- A **Replay** button lets users hear the GPT response again.
    

## Deliverables

*   Full speech → text → GPT → speech loop
    
*   Responsive chat-style UI
  
*    Well-documented and structured source code
    
*    Secure API key using `.env`
   
*   Setup guide with usage instructions


## Tech Stack

*    **Frontend:** React, Vite, Tailwind CSS
   
*   **Backend:** Node.js, Express
    
*   **APIs:** OpenAI Whisper, GPT-3.5 Turbo
   
*    **Browser APIs:** Web Speech API (TTS), MediaRecorder
 
*  **UI:** SMS-like layout with audio feedback and replay option
