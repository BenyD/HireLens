# HireLens - AI Resume Analyzer

HireLens is an AI-powered resume analyzer that helps job seekers optimize their resumes for specific job descriptions. It provides personalized feedback, keyword suggestions, and generates improved versions of resumes tailored to specific job applications.

## Features

- **Resume Parsing**: Upload your resume in PDF format
- **Job Description Analysis**: Submit job descriptions via text or file upload
- **ATS Compatibility Check**: Measure how well your resume will pass through Applicant Tracking Systems
- **Keyword Optimization**: Identify missing keywords from the job description
- **AI-Powered Suggestions**: Get tailored recommendations to improve your resume
- **Improved Resume Generation**: Receive an optimized version of your resume for the specific job

## Technology Stack

- **Next.js 15**: React framework for the frontend and API routes
- **TypeScript**: Type-safe code
- **LangChain**: Framework for AI/LLM applications
- **Hugging Face**: Integration with open-source language models
- **Vercel Blob Storage**: Cloud storage for uploaded files
- **Tailwind CSS**: Utility-first CSS framework for styling
- **PDF Processing**: PDF parsing and text extraction

## File Storage Architecture

HireLens uses a dual-storage approach for handling uploaded files:

1. **Primary Storage**: Files are first saved to local temporary disk storage
2. **Secondary Storage**: Files are then uploaded to Vercel Blob for cloud persistence (if configured)
3. **Parsing**: Document parsing is always done from local storage for speed and reliability
4. **Cleanup**: Files are automatically cleaned up from both storages after processing

This approach ensures reliable operation in development environments while providing secure cloud storage in production.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Hugging Face account (for API key)
- Vercel account (for Blob storage)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/hirelens.git
   cd hirelens
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   - Copy `.env.local.example` to `.env.local`
   - Update with your Hugging Face API key (get it from https://huggingface.co/settings/tokens)
   - Add your Vercel Blob token for production (get it from Vercel dashboard)

4. Start the development server

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploying to Vercel

1. Push your repository to GitHub
2. Import your repository in the Vercel dashboard
3. Add the required environment variables:
   - `HF_API_KEY` - Your Hugging Face API key
   - `HF_MODEL_NAME` - The model name to use (e.g., "mistralai/Mixtral-8x7B-Instruct-v0.1")
   - `BLOB_READ_WRITE_TOKEN` - Your Vercel Blob storage token
   - `NODE_ENV` - Set to "production"
4. Deploy your application

## Usage

1. **Upload Resume**: On the homepage, upload your resume (PDF format)
2. **Add Job Description**: Paste the job description text or upload a file
3. **View Analysis**: Get detailed feedback on your resume's compatibility with the job
4. **Get Improved Resume**: Download the AI-optimized version of your resume

## Local Fallbacks

The application includes local fallback mechanisms for resume parsing and analysis when external API calls fail, ensuring a smooth user experience even when connectivity issues arise.

## Development Notes

- The application uses Next.js API routes for server-side functionality
- Resume processing happens on the server to maintain privacy
- Session data is temporarily stored in-memory (consider using Redis for production)

## License

MIT

## Acknowledgements

- [LangChain](https://js.langchain.com/) for AI/LLM tools
- [Hugging Face](https://huggingface.co/) for open-source language models
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for cloud storage
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF processing
- [Tailwind CSS](https://tailwindcss.com/) for styling
