-- 1. Enable RLS on profiles table (usually already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Ensure users can view their own profile (Standard Policy)
-- Drop if exists to avoid conflict, or use "IF NOT EXISTS" logic isn't standard in CREATE POLICY
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING ( auth.uid() = id );

-- 3. Allow Admins to View (SELECT) all profiles
-- We use a simplified check or a subquery. 
-- Note: Be careful of infinite recursion if the admin check relies on querying the same table with RLS.
-- This policy allows access if the user's ID matches a profile that has role='admin'
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- 4. Allow Admins to Update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- 5. Allow Admins to Delete profiles (if needed)
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);
