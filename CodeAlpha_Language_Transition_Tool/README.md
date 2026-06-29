# 🌐 Language Translation Tool

**CodeAlpha AI Internship — Task 1**

A modern, responsive web application that translates text between 40+ languages using the Google Translate API via the `deep-translator` Python library.

---

## ✨ Features

- 🌍 Translate between **40+ languages** including Tamil, Hindi, Japanese, Arabic, and more
- ⚡ **Auto-detect** source language
- 🔄 **Swap languages** with one click
- 📋 **Copy to clipboard** button
- 🔢 **Character counter** (max 5000 chars)
- ⏳ **Loading animation** while translating
- ❌ **Error messages** with clear feedback
- 📱 **Mobile-responsive** design
- 🎨 **Glassmorphism dark UI** with gradient accents

---

## 🛠 Technologies Used

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | HTML5, CSS3, JavaScript |
| Backend   | Python Flask            |
| AI/API    | deep-translator (Google)|
| Icons     | Font Awesome 6          |
| Fonts     | Google Fonts (Inter)    |

---

## 📁 Project Structure

```
Language_Translation_Tool/
│
├── app.py                  # Flask backend + translation API
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Main HTML template
├── static/
│   ├── style.css           # Glassmorphism UI styles
│   └── script.js           # Frontend interaction logic
└── README.md               # This file
```

---

## 🚀 Installation & Setup

### 1. Clone / Download the project
```bash
git clone https://github.com/boopathi-7546/CodeAlpha_Language_Translation_Tool
cd Language_Translation_Tool
```

### 2. Install dependencies
```bash
pip install flask deep-translator
```

Or use the requirements file:
```bash
pip install -r requirements.txt
```

### 3. Run the application
```bash
python app.py
```

### 4. Open in browser
```
http://127.0.0.1:5000
```

---

## 📸 Screenshots

> *(Add screenshots here after running the project)*

| Feature | Screenshot |
|---------|-----------|
| Main UI | `screenshots/main.png` |
| Translation Result | `screenshots/result.png` |
| Mobile View | `screenshots/mobile.png` |

---

## 🔗 GitHub Upload Instructions

```bash
# 1. Initialize repo
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "CodeAlpha AI Internship - Task 1: Language Translation Tool"

# 4. Add remote origin
git remote add origin https://github.com/boopathi-7546/CodeAlpha_Language_Translation_Tool.git

# 5. Push
git push -u origin main
```

---

## 📌 API Endpoint

**POST** `/translate`

**Request Body (JSON):**
```json
{
  "text": "Hello World",
  "source_lang": "auto",
  "target_lang": "ta"
}
```

**Response:**
```json
{
  "translated_text": "வணக்கம் உலகம்"
}
```

---

## 👨‍💻 Author

**Boopathi** | V.S.B Engineering College, Karur  
CodeAlpha AI Internship — June 2026  
GitHub: [github.com/boopathi-7546](https://github.com/boopathi-7546)  
LinkedIn: [linkedin.com/in/boopathi-boopathi-141b3132b](https://www.linkedin.com/in/boopathi-boopathi-141b3132b)
