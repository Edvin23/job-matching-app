from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore
from openai import OpenAI
import os

# Set OpenAI API key (from env or directly for local testing)
openai_api_key = os.getenv("OPENAI_API_KEY")  # or hardcode: "sk-..." (not safe for production)
client = OpenAI(api_key=openai_api_key)

# Initialize Firebase
initialize_app()
db = firestore.client()

@https_fn.on_call()  # ← Removed secrets argument
def generate_completion(req: https_fn.CallableRequest) -> dict:
    try:
        if not req.auth:
            return {"error": "Authentication required."}

        uid = req.auth.uid
        if not uid:
            return {"error": "User UID not found."}

        user_prompt = req.data.get("userPrompt", "")
        if not user_prompt:
            return {"error": "userPrompt is required"}

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_prompt}
            ]
        )

        assistant_message = response.choices[0].message.content.strip()
        print(f"OpenAI Response: {assistant_message}")

        user_doc_ref = db.collection('users').document(uid)
        user_doc_ref.update({
            'AIanswers': firestore.ArrayUnion([assistant_message])
        })

        return {"message": assistant_message}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}
