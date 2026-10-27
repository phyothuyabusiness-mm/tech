# PTY-TECH Repair AI — Windows desktop source

## Build the Windows installer

1. Install Node.js LTS on a Windows PC.
2. Copy the current web app `repair-ai/index.html` to `repair-ai/windows/public/index.html`.
3. Download/clone the repository, open a terminal in `repair-ai/windows`.
4. Run `npm install`.
5. Test with `npm start`.
6. Build the installer with `npm run dist`.
7. The setup EXE should appear in `dist/`.

The local app server runs on 127.0.0.1:8788 so the offline fault database works without internet. Online AI requires a deployed HTTPS backend URL configured in the app. The source project is not itself a compiled EXE; build it on Windows.

Do not put provider API keys into the HTML or package. The AI Worker should keep its AI access on the backend.
