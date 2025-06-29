

An interactive drag-and-drop visual programming environment where users can:

Create sprites

Attach behavior blocks (like move, turn, say, think)

Execute logic step-by-step

And activate Hero Mode to make sprites smartly exchange behaviors upon collision

<!-- Optional: Add actual gif or screenshot path -->

🚀 Features
🎯 Drag-and-drop programming blocks: Easily attach move, turn, say, think, or goto blocks to each sprite.

🤖 Hero Mode: When enabled, sprites smartly detect collisions and exchange matching blocks (e.g., swap a say "hello" block with think "hmm").

🧱 Looks + Motion Blocks: Mix and match looks (say/think) and motion (move/turn/goto) commands.

🎬 Program execution: Click “Play All” to run each sprite's program with smooth animation.

🔄 Repeat logic support: Loops within sprite logic for dynamic behaviors.

🗨️ Speech bubbles: say and think blocks show dynamic bubbles on the sprite.

🧩 Scratch-like experience: Inspired by MIT Scratch — but simplified and built with React.

🧰 Built With
React 18 (Vite setup)

Tailwind CSS – For responsive styling

Heroicons & Lucide Icons – Clean icons for UI

JavaScript – Full control over state, logic, collision, etc.

📦 How to Run Locally
bash
Copy
Edit
# 1. Clone the repo
git clone  https://github.com/anubhavg23/Assignment_juspay.git
cd Assignment_juspay

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
Then open http://localhost:5173 in your browser.

🧠 Hero Mode – Smart Value Swapping
When Hero Mode is ON:

Sprites continuously check for radial collision

On match, if both sprites have the same type of block (say/think/move/etc)

🎉 Their values are swapped in real time

The updated blocks are immediately executed, so you see the new bubble or movement instantly

📸 Screenshots
Sprite Programming	Hero Mode in Action

(Replace with actual screenshots from your project)

🧪 Optional Enhancements
Want to make this project shine even more?

🔊 Add sound on collision swap

💾 Enable program export/import via JSON

📦 Persist sprite positions using localStorage

🌗 Add dark mode toggle
