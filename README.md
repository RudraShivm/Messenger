# Messenger Clone

**Absolutely Original Messenger Clone** is a seamless, real-time messaging app built using the **MERN stack**. Whether you're chatting with friends or inviting new people to your circle, this app makes it easy with invite links and QR codes. 🚀

## 🔗 Features

- **Seamless Messaging**: Real-time chat with automatic synchronization across multiple users using **Socket.io**.
- **Invite via Link or QR Code**: Quickly add someone to your chat by sharing an invite link or scanning a QR code.
- **Secure Authentication**: 
  - **JWT** for session management and token security.
  - **OAuth2** for a smooth **Google Login** experience.
  - Access tokens are cached and refreshed regularly for enhanced security. 🔒
- **Media Storage**: Uploaded media files are stored securely in **Supabase Buckets** (a free alternative).
- **IndexedDB for User-End Storage**: Chats are cached locally on the user's device using **IndexedDB** for a better offline experience. 📥
- **Account Setup Required**: Users must create an account before they can start chatting.

## 🛠 Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT, OAuth2
- **Real-Time Communication**: Socket.io
- **Media Storage**: Supabase Buckets
- **Local Storage**: IndexedDB for caching user data

## 🚀 Getting Started

To try out the app, head over to our live demo:

👉 **[Absolutely Original Messenger](https://absolutelyoriginalmessenger.netlify.app/auth)**

## 📝 Contributing

Found a bug? 🐛 Have a feature suggestion? ✨ Feel free to [open an issue](https://github.com/yourusername/absolutely-original-messenger/issues) and let us know. Your feedback is invaluable!

## ⚙️ Installation & Setup

If you'd like to run the app locally, follow these steps:

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/absolutely-original-messenger.git
   // server-side
   cd ./server
   npm start
   // client-side
   cd ./client
   npm run dev
