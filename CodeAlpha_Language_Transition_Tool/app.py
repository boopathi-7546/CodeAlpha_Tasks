# ============================================================
# Language Translation Tool - Flask Backend
# CodeAlpha AI Internship - Task 1
# Author: Boopathi
# ============================================================

from flask import Flask, render_template, request, jsonify
from deep_translator import GoogleTranslator

app = Flask(__name__)

# ─── Supported Languages ────────────────────────────────────
# Full list of languages supported by GoogleTranslator
LANGUAGES = {
    "auto":  "Auto Detect",
    "en":    "English",
    "ta":    "Tamil",
    "hi":    "Hindi",
    "fr":    "French",
    "de":    "German",
    "es":    "Spanish",
    "it":    "Italian",
    "pt":    "Portuguese",
    "ru":    "Russian",
    "ja":    "Japanese",
    "ko":    "Korean",
    "zh-CN": "Chinese (Simplified)",
    "zh-TW": "Chinese (Traditional)",
    "ar":    "Arabic",
    "bn":    "Bengali",
    "te":    "Telugu",
    "ml":    "Malayalam",
    "kn":    "Kannada",
    "mr":    "Marathi",
    "gu":    "Gujarati",
    "pa":    "Punjabi",
    "ur":    "Urdu",
    "tr":    "Turkish",
    "nl":    "Dutch",
    "pl":    "Polish",
    "sv":    "Swedish",
    "da":    "Danish",
    "fi":    "Finnish",
    "no":    "Norwegian",
    "vi":    "Vietnamese",
    "th":    "Thai",
    "id":    "Indonesian",
    "ms":    "Malay",
    "fa":    "Persian",
    "he":    "Hebrew",
    "uk":    "Ukrainian",
    "cs":    "Czech",
    "ro":    "Romanian",
    "hu":    "Hungarian",
    "el":    "Greek",
}


# ─── Home Route ─────────────────────────────────────────────
@app.route("/")
def index():
    """Render the main translation page with language options."""
    return render_template("index.html", languages=LANGUAGES)


# ─── Translation API Endpoint ────────────────────────────────
@app.route("/translate", methods=["POST"])
def translate():
    """
    POST /translate
    Body (JSON): { text, source_lang, target_lang }
    Returns:     { translated_text } or { error }
    """
    try:
        data = request.get_json()

        text        = data.get("text", "").strip()
        source_lang = data.get("source_lang", "auto")
        target_lang = data.get("target_lang", "en")

        # ── Validation ──────────────────────────────────────
        if not text:
            return jsonify({"error": "Please enter text to translate."}), 400

        if len(text) > 5000:
            return jsonify({"error": "Text too long. Max 5000 characters allowed."}), 400

        if target_lang == "auto":
            return jsonify({"error": "Please select a valid target language."}), 400

        # ── Perform Translation ─────────────────────────────
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated  = translator.translate(text)

        return jsonify({"translated_text": translated})

    except Exception as e:
        # Return a clean error message to the frontend
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500


# ─── Run Server ──────────────────────────────────────────────
import os

if __name__ == "__main__":
    print("🌐 Language Translation Tool is running!")

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)