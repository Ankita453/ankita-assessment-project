AI Playground

An interactive AI Playground UI prototype built with React + Vite + TypeScript + Tailwind + Framer Motion.
It simulates multiple AI models, allows prompt editing, model selection, theme toggling, and provides a responsive, polished chat experience.

🔗 Live Demo: https://ankita-assessment-project-link.netlify.app

🔗 Figma Mockup: https://www.figma.com/design/H20Fumo8y3syDfImKss124/AI-Playground?node-id=0-1&t=9MdIu3n5E1BY9tZX-1

🔗 GitHub: https://github.com/Ankita453/ankita-assessment-project.git

📌 Features

Model Selector: Choose between simulated models (GPT-4 Turbo, Claude 3 Opus, Gemini 2.5 Flash).

Prompt Editor: Enter prompts with Enter-to-send, Shift+Enter for newlines, and template quick insert.

Parameters Panel: Adjust temperature and max tokens with sliders.

Chat/Output Area: Animated chat bubbles with AI/User distinction, copy-to-clipboard, and JSON download.

Theme Toggle: Persistent Light/Dark mode with smooth transitions.

Responsive Layout: Optimized for mobile → desktop.

Data & State: Models and templates fetched from a mock data source with loading/error handling.

Accessibility & UX: Keyboard navigable, ARIA labels, focus states, hover animations.

📖 Research

We reviewed existing AI playground UIs to extract standout features:

OpenAI Playground – clear parameter controls, JSON download.

Hugging Face Spaces – community-driven apps with responsive layouts.

Anthropic Claude UI – clean chat interface with focus on context.

Microsoft Copilot Lab – strong prompt templates & usability focus.

Chosen Features for this Project (4–6):

Model selector (drop-down).

Prompt editor with template quick insert.

Adjustable parameters (temperature, tokens).

Download chat as JSON.

Theme toggle (persistent).

Responsive, animated chat interface.

🎨 Design

Mockup created in Figma → AI Playground Mockup

Tailwind tokens mapped for spacing, typography, and color system.

Framer Motion used for animations (hover, chat bubbles, theme toggle).

README “Design” section aligns mockup → implemented code.

⚙️ Development
Tech Stack

Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion.

Icons: Lucide React.

State Management: React Context for Theme + App State.
