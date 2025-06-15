
-- 1. Create profiles table with the specified fields, using the auth.users id as PK
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  date_of_birth date,
  company text
);

-- 2. Function to handle new user sign-ups (auto-profile row creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger for the function on user sign up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Policy for user to read/update their own profile
CREATE POLICY "User can see own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "User can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

