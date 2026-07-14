# Deploying Express MVC Auth API to Vercel

This guide outlines step-by-step instructions to deploy your Node.js, Express, and MongoDB MVC Auth API to Vercel as serverless functions.

---

## Prerequisites & External Setup

Before deploying, ensure you have:
1. **MongoDB Atlas Account**: A cloud MongoDB instance since localhost (`mongodb://localhost:27017`) will not be reachable from Vercel's serverless environment.
   - Set up a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Whitelist all IP addresses (`0.0.0.0/0`) in Atlas Network Access, as Vercel serverless function IPs are dynamic.
   - Copy the Connection String (e.g., `mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname?retryWrites=true&w=majority`).
2. **Social Credentials (Optional for testing, required for production)**:
   - **Google**: Obtain your Client ID from [Google Cloud Console](https://console.cloud.google.com/).
   - **Apple**: Obtain your Client ID (Services ID) from the [Apple Developer Portal](https://developer.apple.com/).

---

## Deploying Using Vercel CLI (Fastest Local Method)

1. **Install Vercel CLI globally**:
   ```bash
   npm install -g vercel
   ```
2. **Log in to your Vercel account**:
   ```bash
   vercel login
   ```
3. **Deploy from your project directory**:
   - Run the deploy command from the project root (`c:\backend-learning\apis-development`):
     ```bash
     vercel
     ```
   - Follow the CLI prompts:
     - Set up and deploy? **Yes**
     - Which scope? **Select your personal/team account**
     - Link to existing project? **No**
     - What's your project's name? **apis-development** (or your preferred name)
     - In which directory is your code located? **./**
     - Want to modify your build settings? **No** (Vercel will detect `vercel.json` and deploy it automatically).
4. **Configure Environment Variables**:
   Go to your [Vercel Dashboard](https://vercel.com/dashboard) -> Select your Project -> **Settings** -> **Environment Variables**, and add the following keys:
   - `MONGO_URI` (Your MongoDB Atlas connection URL)
   - `JWT_SECRET` (A strong random string)
   - `JWT_EXPIRES_IN` (e.g., `7d`)
   - `GOOGLE_CLIENT_ID` (If using Google Auth)
   - `APPLE_CLIENT_ID` (If using Apple Auth)
   - `NODE_ENV` (Set to `production`)
5. **Promote to Production**:
   Once you verify the deployment preview works, deploy to production:
   ```bash
   vercel --prod
   ```

---

## Deploying Using GitHub Integration (Recommended for CI/CD)

Vercel provides automatic deployments on every `git push`.

1. **Push your code to a Git repository**:
   - Initialize git in your project directory:
     ```bash
     git init
     git add .
     git commit -m "Initial commit of MVC Express API"
     ```
   - Push to a private or public repository on GitHub, GitLab, or Bitbucket.
2. **Connect to Vercel**:
   - Open your [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New...** -> **Project**.
   - Import your Git repository from the list.
3. **Configure Settings**:
   - Keep framework preset as **Other** (it will auto-detect configurations).
   - Expand the **Environment Variables** section and enter the credentials (`MONGO_URI`, `JWT_SECRET`, etc.).
   - Click **Deploy**.
4. **Automatic Updates**:
   - Every time you push to the `main` or `master` branch, Vercel will automatically trigger a new production deployment.
   - Pushes to other branches will create preview deployments for testing.

---

## Testing Your Deployed Vercel API

Once deployed, Vercel will generate a public URL (e.g., `https://apis-development-xxxxxx.vercel.app`).
- **Base Route check**: Visit `https://apis-development-xxxxxx.vercel.app/` in your browser. You should receive the welcome JSON:
  ```json
  {
    "success": true,
    "message": "Welcome to the MVC Auth API.",
    "docs": "/api-docs"
  }
  ```
- **Swagger Documentation**: Visit `https://apis-development-xxxxxx.vercel.app/api-docs` to access the interactive documentation and run live tests on your deployed APIs!

---

## Media Storage on Vercel (Production Uploads)

Vercel functions are stateless and read-only. Files saved locally to the `/uploads` directory will be deleted shortly after upload when the serverless container recycles. 

To enable persistent profile picture uploads in production:

### Recommended: Cloudinary Integration
1. Install Cloudinary and Multer-Storage-Cloudinary:
   ```bash
   npm install cloudinary multer-storage-cloudinary
   ```
2. Set up Cloudinary credentials in Vercel Environment Variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Modify `src/middlewares/uploadMiddleware.js` to upload directly to Cloudinary:
   ```javascript
   const cloudinary = require('cloudinary').v2;
   const { CloudinaryStorage } = require('multer-storage-cloudinary');
   const multer = require('multer');

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });

   const storage = new CloudinaryStorage({
     cloudinary: cloudinary,
     params: {
       folder: 'buildmate-avatars',
       allowed_formats: ['jpg', 'jpeg', 'png']
     }
   });

   const upload = multer({ storage: storage });
   module.exports = upload;
   ```
4. Update `src/controllers/profileController.js` to use Cloudinary's URL:
   ```javascript
   // In Cloudinary, multer-storage-cloudinary stores the public URL directly in req.file.path (or req.file.secure_url)
   const fileUrl = req.file.path || req.file.secure_url; 
   ```
