-- Add archived column to habits table
ALTER TABLE public.habits ADD COLUMN archived boolean DEFAULT false;