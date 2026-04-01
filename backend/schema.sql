-- Users table
CREATE TABLE public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  role text DEFAULT 'user'::text CHECK (role IN ('user', 'admin')),
  subscription_status text DEFAULT 'inactive'::text CHECK (subscription_status IN ('active', 'inactive', 'expired')),
  subscription_id uuid, -- Foreign key to subscriptions (added later)
  charity_id uuid, -- Foreign key to charities (added later)
  charity_percentage numeric DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Charities table
CREATE TABLE public.charities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  image text,
  images text[] DEFAULT '{}',
  events jsonb DEFAULT '[]'::jsonb,
  is_spotlight boolean DEFAULT false,
  total_donations numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add charity_id foreign key constraint to users
ALTER TABLE public.users
  ADD CONSTRAINT fk_users_charity FOREIGN KEY (charity_id) REFERENCES public.charities(id) ON DELETE SET NULL;

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  stripe_session_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'created'::text CHECK (status IN ('created', 'active', 'canceled', 'expired', 'payment_failed')),
  amount numeric NOT NULL,
  currency text DEFAULT 'usd',
  expiry_date timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  charity_amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add subscription_id foreign key constraint to users
ALTER TABLE public.users
  ADD CONSTRAINT fk_users_subscription FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- Scores table
CREATE TABLE public.scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 45),
  date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Draws table
CREATE TABLE public.draws (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  month text NOT NULL,
  type text DEFAULT 'algorithm'::text CHECK (type IN ('random', 'algorithm')),
  status text DEFAULT 'pending'::text CHECK (status IN ('pending', 'simulated', 'published')),
  total_pool numeric DEFAULT 0,
  breakdown jsonb DEFAULT '{}'::jsonb,
  winning_numbers integer[] DEFAULT '{}',
  participants_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Tracks which users were entered for each draw (for dashboard participation metrics)
CREATE TABLE public.draw_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id uuid NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(draw_id, user_id)
);

-- Winners table
CREATE TABLE public.winners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  draw_id uuid NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  match_type text NOT NULL CHECK (match_type IN ('3-number', '4-number', '5-number')),
  prize_amount numeric NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status IN ('pending', 'paid', 'rejected')),
  proof_image text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Donations table
CREATE TABLE public.donations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  charity_id uuid NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status IN ('pending', 'completed')),
  source text DEFAULT 'subscription'::text CHECK (source IN ('subscription', 'independent')),
  stripe_payment_id text,
  stripe_session_id text,
  created_at timestamp with time zone DEFAULT now()
);
