// Simulated "is this email already taken?" check.
// Shaped like the call a real backend will answer later (for example a
// unique constraint on users.email in Aurora, or Cognito rejecting a duplicate sign-up).
const SIMULATED_TAKEN_EMAILS = ['taken@example.com', 'test@whew.com'];

// Emails are case-insensitive in practice, so compare them in one normalized form.
export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function checkEmailAvailable(email) {
  const normalized = normalizeEmail(email);

  // REAL VERSION: uncomment this and delete the simulation below once the API exists.
  // const res = await fetch(
  //   `${import.meta.env.VITE_API_URL}/users/email-available?email=${encodeURIComponent(normalized)}`
  // );
  // if (!res.ok) throw new Error('Email check failed');
  // const data = await res.json();
  // return data.available;

  // Simulation: wait a moment, like a network call would.
  await new Promise((resolve) => setTimeout(resolve, 400));
  return !SIMULATED_TAKEN_EMAILS.includes(normalized);
}