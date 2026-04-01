import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SubscriptionReturn() {
  const { refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        await refreshUser();
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to refresh subscription status.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-deep-900 text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border border-surface-border bg-white/5 p-8 text-center">
        {error ? (
          <>
            <AlertCircle className="mx-auto text-rose-400 mb-4" size={44} />
            <h1 className="text-2xl font-bold mb-2">We couldn&apos;t confirm your subscription yet</h1>
            <p className="text-sm text-gray-300 mb-6">
              {error} You can refresh your dashboard in a moment—webhooks can take a few seconds.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto text-emerald-400 mb-4" size={44} />
            <h1 className="text-2xl font-bold mb-2">Thanks—checkout completed</h1>
            <p className="text-sm text-gray-300 mb-6">
              {loading ? 'Updating your account…' : 'Your account has been updated.'}
              {sessionId ? ` (session: ${sessionId})` : null}
            </p>
          </>
        )}

        <div className="flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/#pricing"
            className="px-4 py-2 rounded-lg border border-surface-border text-gray-200 hover:bg-white/5 transition-colors"
          >
            Back to pricing
          </Link>
        </div>
      </div>
    </div>
  );
}

