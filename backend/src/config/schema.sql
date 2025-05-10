-- Supabase SQL Schema for Testcraft AI

-- Users (Tutors) Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- This will store hashed passwords
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tests/Assignments Table
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('test', 'assignment')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
    pass_mark INTEGER,
    shuffle_answers BOOLEAN DEFAULT false,
    result_text TEXT,
    access_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uploads Table
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('text', 'doc', 'pdf', 'image')),
    gemini_analysis_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions Table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('mcq', 'true_false', 'short', 'select', 'fill_gap', 'media')),
    content TEXT NOT NULL,
    options JSONB,
    answer TEXT,
    difficulty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learner Submissions Table
CREATE TABLE learner_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    learner_id TEXT NOT NULL, -- This could be an email or any identifier
    answers JSONB,
    score INTEGER,
    passed BOOLEAN,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tests_tutor_id ON tests(tutor_id);
CREATE INDEX idx_uploads_test_id ON uploads(test_id);
CREATE INDEX idx_questions_test_id ON questions(test_id);
CREATE INDEX idx_learner_submissions_test_id ON learner_submissions(test_id);

-- Create a function to generate random access codes
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 6-character code
        code := UPPER(SUBSTRING(MD5(random()::TEXT) FROM 1 FOR 6));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM tests WHERE access_code = code) INTO exists_already;
        
        -- Exit loop if code doesn't exist yet
        EXIT WHEN NOT exists_already;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate access codes for new tests
CREATE OR REPLACE FUNCTION set_access_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.access_code IS NULL THEN
        NEW.access_code := generate_access_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_access_code
BEFORE INSERT ON tests
FOR EACH ROW
EXECUTE FUNCTION set_access_code();
