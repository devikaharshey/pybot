import os
import json
import fitz
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from uuid import uuid4
import google.generativeai as genai
from appwrite.client import Client
from appwrite.query import Query
from appwrite.services.databases import Databases
from appwrite.id import ID

app = Flask(__name__)
CORS(app)
load_dotenv()

APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")
APPWRITE_DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")
APPWRITE_COLLECTION_ID = os.getenv("APPWRITE_COLLECTION_ID")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Appwrite client
client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)

database = Databases(client)

# Initialize Google Generative AI
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

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

    resource_keywords = ["resource", "documentation", "docs", "tutorial", "learn", "guide", "reference", "link", "channel", "youtube"]
    use_search = "python" in user_input and any(keyword in user_input for keyword in resource_keywords)
    search_results = search_google(user_input) if use_search else ""

    full_prompt = """
You are PyBot, a helpful and knowledgeable assistant focused on teaching Python programming in a fun, clear, and engaging way.

You were created by Devika Harshey, who is learning Python and wants to help others learn too.

### Responsibilities:
- Help users understand Python programming concepts.
- Support users with Python-related tools, documentation, and tutorials.
- Provide assistance with resume writing for tech roles (Python-focused).

### Real-time Data:
- If search results are provided, ALWAYS use and reference them when answering questions about external resources (e.g., YouTube channels, documentation, or tools).
- These are real-time results and MUST be treated as factual references.
- Do not say you lack access to real-time information when such results are provided.

### Response Formatting Rules:
- Use **markdown** for all responses.
- Always use **bullet points** (`-` or `*`) for lists.
- Use **headings** (`###`) to organize sections.
- Wrap all code examples in proper markdown code blocks (```python).
- Use **bold** for important terms and concepts.
- Keep answers **beginner-friendly**, **concise**, and **clearly structured**.
- Break down explanations into **short paragraphs**.
- Add **emojis** to enhance engagement (avoid slang).
- Include **clickable links** to official Python documentation or trusted resources when helpful.
- Never respond with large blocks of unformatted text.

### Personality & Rules:
- Only greet the user (e.g., "Hi there!") if they begin the conversation with a greeting like “hi”, “hello”, “hey”, etc.
- When greeting, include the line:  
  _“Devika Harshey is my creator, who is learning Python and wants to help others learn too.”_
- Do **not** include greetings or the creator line in other responses.
- Never repeat greetings after the first one.
- Always refer to Devika Harshey as:  
  _“Devika Harshey is my creator, who is learning Python and wants to help others learn too.”_
- If the user asks about non-Python or non-resume topics, politely say:  
  _“I can only assist with Python programming and resume writing.”_
"""

    if search_results:
        full_prompt += f"""

### 🔎 Real-time Search Results (from Google CSE):
{search_results}

You MUST use these results to help answer the user's question above.
"""

    for msg in messages[:-1]:  
        role = msg["role"]
        content = msg["content"]
        full_prompt += f"\n\n{role.capitalize()}: {content}"

    full_prompt += f"\n\nUser: {messages[-1]['content']}"

    try:
        response = gemini_model.generate_content(full_prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "Sorry, there was an error getting a response from Gemini."

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
    user_id = request.args.get("user_id")
    delete_chat(session_id)

    if user_id:
        def delete_all_docs_by_user(collection_name):
            try:
                all_docs = database.list_documents(
                    database_id=APPWRITE_DATABASE_ID,
                    collection_id=collection_name,
                    queries=[Query.equal("user_id", user_id)]
                )
                print(f"{collection_name} matched docs:", [d["$id"] for d in all_docs["documents"]])
                for doc in all_docs["documents"]:
                    database.delete_document(
                        database_id=APPWRITE_DATABASE_ID,
                        collection_id=collection_name,
                        document_id=doc["$id"]
                    )
            except Exception as e:
                print(f"Failed to delete from {collection_name}:", e)

        delete_all_docs_by_user("quiz_cache")
        delete_all_docs_by_user("quiz_scores")
    else:
        print("NO USER_ID FOUND IN QUERY PARAMS")

    return jsonify({"message": "Chat and all related data deleted."})

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

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard_data():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    chats = load_chats(user_id)
    all_texts = []

    for chat in chats.values():
        for msg in chat["chat"]:
            if msg["sender"] == "user":
                all_texts.append(msg["text"])

    if not all_texts:
        return jsonify({
            "resources": [],
            "questions": [],
            "analysis": "Not enough data to analyze."
        })

    history_summary = "\n".join(all_texts[-20:])  

    gemini_prompt = f"""
You're an AI analyst. Given this conversation history from a user learning Python:

\"\"\"
{history_summary}
\"\"\"

### Tasks:
1. Personalized DSA Questions: Suggest 3-5 personalized DSA questions from Leetcode or GFG (titles only).
2. Trusted Resources: List trusted resources for their weak areas (YouTube, docs, RealPython, etc.).
3. Analysis: Summarize their Python knowledge level briefly.

Use markdown format. Provide spaces between above mentioned tasks but don't print the <br> tag or # within response. Use emojis. Do give the links.

"""

    try:
        response = gemini_model.generate_content(gemini_prompt)
        return jsonify({"markdown": response.text.strip()})
    except Exception as e:
        print(f"Dashboard generation error: {e}")
        return jsonify({"error": "Failed to generate dashboard data."}), 500
    
@app.route("/api/analyze-resume", methods=["POST"])
def analyze_resume():
    file = request.files.get("resume")
    user_id = request.form.get("user_id")

    if not file or not user_id:
        return jsonify({"error": "Missing file or user_id"}), 400

    try:
        file_ext = file.filename.split('.')[-1]
        if file_ext != "pdf":
            return jsonify({"error": "Only PDF resumes are supported."}), 400

        text = ""
        with fitz.open(stream=file.read(), filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()

        prompt = f"""
You are an ATS resume analyzer for Python developer roles.

Analyze this resume text and:
1. Score it out of 100 for ATS compatibility.
2. Highlight missing key sections (skills, experience, links).
3. Suggest 3 improvements.
4. Mention if it matches DSA + Python job expectations.

### Resume Text:
{text}
"""

        result = gemini_model.generate_content(prompt)
        return jsonify({"feedback": result.text.strip()})
    except Exception as e:
        print("Resume analysis error:", e)
        return jsonify({"error": "Failed to analyze resume."}), 500
    
@app.route("/api/generate-quiz", methods=["GET"])
def generate_quiz():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"questions": []})

    chats = load_chats(user_id)
    all_user_msgs = [
        msg["text"]
        for chat in chats.values()
        for msg in chat["chat"]
        if msg["sender"] == "user"
    ]
    context = "\n".join(all_user_msgs[-20:])

    prompt = f"""
Generate a 5-question multiple choice quiz based on the user's recent Python and DSA conversations.

\"\"\"{context}\"\"\"

Each question must follow this exact format:

1. Question text goes here  
A) Option A  
B) Option B  
C) Option C  
D) Option D  
**Correct Answer: C**

Repeat for 5 questions.
Avoid markdown headings or formatting. Use plain text only.
"""

    response = gemini_model.generate_content(prompt).text.strip()

    import re
    questions = []
    for block in response.split("\n\n"):
        if "**Correct Answer:" not in block:
            continue
        lines = block.strip().split("\n")
        q_line = lines[0]
        opts = lines[1:5]
        correct_line = next((l for l in lines if "Correct Answer" in l), "")
        match = re.search(r"Correct Answer:\s*([A-D])", correct_line)
        correct_letter = match.group(1) if match else "A"

        questions.append({
            "question": q_line,
            "options": [re.sub(r"^[A-D]\W+\s*", "", opt).strip() for opt in opts],
            "correct": correct_letter
        })

    try:
        existing_docs = database.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id="quiz_cache",
            queries=[Query.equal("user_id", user_id)]
        )

        if existing_docs["total"] > 0:
            doc_id = existing_docs["documents"][0]["$id"]
            database.update_document(
                database_id=APPWRITE_DATABASE_ID,
                collection_id="quiz_cache",
                document_id=doc_id,
                data={"quiz_json": json.dumps(questions)}
            )
        else:
            database.create_document(
                database_id=APPWRITE_DATABASE_ID,
                collection_id="quiz_cache",
                document_id=user_id,
                data={
                    "user_id": user_id,
                    "quiz_json": json.dumps(questions)
                }
            )
    except Exception as e:
        print("Error saving quiz to Appwrite:", e)
        return jsonify({"error": "Failed to save quiz"}), 500

    return jsonify({"questions": questions})

@app.route("/api/submit-quiz", methods=["POST"])
def submit_quiz():
    data = request.get_json()
    user_id = data.get("user_id")
    answers = data.get("answers")

    if not user_id or not answers:
        return jsonify({"error": "Missing data"}), 400

    try:
        quiz_doc = database.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id="quiz_cache",
            queries=[Query.equal("user_id", user_id)]
        )
        if quiz_doc["total"] == 0:
            raise Exception("No quiz found")

        quiz = json.loads(quiz_doc["documents"][0]["quiz_json"])
    except Exception as e:
        print("Error loading quiz:", e)
        return jsonify({"error": "Quiz not found"}), 404

    score = 0
    for i, q in enumerate(quiz):
        submitted = answers.get(str(i)) or answers.get(i)
        if submitted and submitted.strip().upper() == q["correct"].strip().upper():
            score += 1

    try:
        database.create_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id="quiz_scores",
            document_id=ID.unique(),
            data={
                "user_id": user_id,
                "score": score,
                "total": len(quiz)
            }
        )
    except Exception as e:
        print("Error saving score to history:", e)

    return jsonify({"score": score})
    
@app.route("/api/progress-chart", methods=["GET"])
def progress_chart():
    user_id = request.args.get("user_id")

    try:
        docs = database.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id="quiz_scores",
            queries=[Query.equal("user_id", user_id)]
        )
        correct = sum(doc["score"] for doc in docs["documents"])
        incorrect = sum(doc["total"] - doc["score"] for doc in docs["documents"])
    except Exception as e:
        print("Error fetching progress:", e)
        correct, incorrect = 0, 0

    return jsonify({
        "labels": ["Correct", "Incorrect"],
        "values": [correct, incorrect]
    })

@app.route("/api/reset-quiz", methods=["POST"])
def reset_quiz():
    return jsonify({"message": "Frontend reset complete"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
