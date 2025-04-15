-- Enable RLS
ALTER TABLE IF EXISTS resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS analyses;
DROP TABLE IF EXISTS job_descriptions;
DROP TABLE IF EXISTS resumes;

-- Create tables
CREATE TABLE resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE job_descriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    resume_id UUID REFERENCES resumes(id),
    job_description_id UUID REFERENCES job_descriptions(id),
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_resumes_session_id ON resumes(session_id);
CREATE INDEX idx_job_descriptions_session_id ON job_descriptions(session_id);
CREATE INDEX idx_analyses_session_id ON analyses(session_id);

-- Create policies for resumes
CREATE POLICY "Enable anonymous insert access" ON resumes
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable anonymous select access" ON resumes
    FOR SELECT
    USING (true);

-- Create policies for job descriptions
CREATE POLICY "Enable anonymous insert access" ON job_descriptions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable anonymous select access" ON job_descriptions
    FOR SELECT
    USING (true);

-- Create policies for analyses
CREATE POLICY "Enable anonymous insert access" ON analyses
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable anonymous select access" ON analyses
    FOR SELECT
    USING (true);

-- Create function to set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
DROP TRIGGER IF EXISTS update_job_descriptions_updated_at ON job_descriptions;
DROP TRIGGER IF EXISTS update_analyses_updated_at ON analyses;

-- Create triggers for updated_at
CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_descriptions_updated_at
    BEFORE UPDATE ON job_descriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at
    BEFORE UPDATE ON analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 