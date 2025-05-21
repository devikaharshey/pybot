import os
import json
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from uuid import uuid4
from appwrite.client import Client
from appwrite.services.databases import Databases

app = Flask(__name__)
CORS(app)
load_dotenv()

API_KEY = os.getenv("API_KEY")  
APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")
APPWRITE_DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")
APPWRITE_COLLECTION_ID = os.getenv("APPWRITE_COLLECTION_ID")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")

# Appwrite client
client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)

database = Databases(client)

# Helper Functions

def search_google(query, num_results=10):
    trusted_sites = [
        "docs.python.org",
        "realpython.com",
        "youtube.com",
        "stackoverflow.com/questions/tagged/python"
    ]
    site_filter = " OR ".join(f"site:{site}" for site in trusted_sites)
    full_query = f"{query} {site_filter}"

    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_API_KEY,
        "cx": GOOGLE_CSE_ID,
        "q": full_query,
        "num": num_results,
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        results = response.json().get("items", [])

        filtered_results = []
        for item in results:
            link = item.get("link", "")
            if any(site in link for site in trusted_sites):
                filtered_results.append(item)

        if not filtered_results:
            return "No trusted Python resource results found."

        links = [f"- [{item['title']}]({item['link']})" for item in filtered_results]
        return "\n".join(links)

    except Exception as e:
        print(f"Google Search Error: {e}")
        return "Failed to fetch search results."

def load_chats(user_id=None):
    try:
        documents = database.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_COLLECTION_ID
        )
        chats = {}
        for doc in documents["documents"]:
            if user_id and doc.get("user_id") != user_id:
                continue
            chat_data = doc.get("chat", "[]")
            if isinstance(chat_data, str):
                chat_data = json.loads(chat_data)
            chats[doc["$id"]] = {
                "name": doc.get("name", ""),
                "chat": chat_data
            }
        return chats
    except Exception as e:
        print(f"Error loading chats: {e}")
        return {}

def save_chat(session_id, chat_data):
    try:
        if isinstance(chat_data["chat"], list):
            chat_data["chat"] = json.dumps(chat_data["chat"])
        database.update_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_COLLECTION_ID,
            document_id=session_id,
            data=chat_data
        )
    except Exception as e:
        print(f"Error saving chat: {e}")

def create_chat(session_id, chat_data):
    try:
        if isinstance(chat_data["chat"], list):
            chat_data["chat"] = json.dumps(chat_data["chat"])
        database.create_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_COLLECTION_ID,
            document_id=session_id,
            data=chat_data
        )
    except Exception as e:
        print(f"Error creating chat: {e}")

def delete_chat(session_id):
    try:
        database.delete_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=APPWRITE_COLLECTION_ID,
            document_id=session_id
        )
    except Exception as e:
        print(f"Error deleting chat: {e}")


def ask_bot(messages):
    user_input = messages[-1]["content"].lower()

    resource_keywords = ["resource", "documentation", "docs", "tutorial", "learn", "guide", "reference", "link"]
    if "python" in user_input and any(keyword in user_input for keyword in resource_keywords):
        search_results = search_google(user_input)
        return f"""### 🔍 Python Resources You Might Find Useful

{search_results}

*(Results provided using Google Search)*"""

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "PyTutor"
    }

    data = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": '''
You are PyBot, a helpful and knowledgeable assistant focused on the Python programming language.

You are created and developed by Devika Harshey, who is aiming to help others learn Python programming.

Always follow these formatting rules:
- Use markdown for all responses.
- Always use bullet points (with "-" or "*") for lists.
- Use headings (###) to organize sections.
- Always wrap code examples inside proper markdown code blocks, specifying the language (```python).
- Keep answers beginner-friendly, concise, and clear.
- Break down explanations into short paragraphs for better readability.
- Add emojis to enhance engagement (but avoid slang).
- Include clickable links to official Python documentation or trusted resources when useful.

Important:
- Never respond with large blocks of unformatted text.
- Every answer must be neatly organized with markdown formatting.
- If user asks about Devika Harshey (your creator and developer), say "Devika Harshey is my creator, who is learning Python and wants to help others learn too."

Exception:
If the user specifically asks for help with **creating a resume**, you are allowed to assist:
- Suggest resume structures and formats.
- Provide templates or examples.
- Give advice tailored to tech jobs, especially Python-related roles.

For any other non-Python, non-resume topics, politely respond that you can only help with Python programming and resume writing.
'''
            }
        ] + messages
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.status_code} - {response.text}"

# API Routes

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    question = data.get("question")
    session_id = data.get("session_id")
    user_id = data.get("user_id") 

    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    chats = load_chats(user_id)

    if session_id and session_id in chats:
        chat_history = chats[session_id]["chat"]
    else:
        session_id = str(uuid4())
        chat_history = []

    chat_history.append({"sender": "user", "text": question})

    message_history = [
        {"role": "user" if msg["sender"] == "user" else "assistant", "content": msg["text"]}
        for msg in chat_history
    ]

    bot_response = ask_bot(message_history)

    chat_history.append({"sender": "bot", "text": bot_response})

    chat_data = {
        "chat": chat_history,
        "name": chats.get(session_id, {}).get("name", ""),
        "user_id": user_id  
    }

    if session_id in chats:
        save_chat(session_id, chat_data)
    else:
        create_chat(session_id, chat_data)

    return jsonify({"answer": bot_response, "session_id": session_id})

@app.route("/api/chats", methods=["GET"])
def get_chats():
    user_id = request.args.get("user_id") 
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    chats = load_chats(user_id)
    return jsonify(chats)

@app.route("/api/chats/<session_id>", methods=["PATCH"])
def rename_chat(session_id):
    data = request.get_json()
    new_name = data.get("name", "")

    chats = load_chats()

    if session_id not in chats:
        return jsonify({"error": "Session not found"}), 404

    chats[session_id]["name"] = new_name
    save_chat(session_id, chats[session_id])

    return jsonify({"message": "Chat renamed successfully"})

@app.route("/api/chats/<session_id>", methods=["DELETE"])
def delete_chat_route(session_id):
    delete_chat(session_id)
    return jsonify({"message": "Chat deleted successfully"})

@app.route("/api/save-transcript", methods=["POST"])
def save_transcript():
    data = request.get_json()
    session_id = data.get('session_id')
    transcript = data.get('transcript')
    user_id = data.get('user_id')

    if not all([session_id, transcript, user_id]):
        return jsonify({'error': 'Missing data'}), 400

    chats = load_chats(user_id)
    chat_history = chats.get(session_id, {}).get('chat', [])
    chat_history.append({'sender': 'user', 'text': transcript})

    chat_data = {
        'chat': chat_history,
        'name': chats.get(session_id, {}).get('name', ''),
        'user_id': user_id
    }

    if session_id in chats:
        save_chat(session_id, chat_data)
    else:
        create_chat(session_id, chat_data)

    return jsonify({'message': 'Transcript saved successfully'}), 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)
