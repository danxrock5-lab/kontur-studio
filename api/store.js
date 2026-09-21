const tableUrl = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Lead storage is not configured');
  }
  return `${process.env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/leads`;
};

const headers = () => ({
  apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
});

export async function createSubmission(submission) {
  const response = await fetch(tableUrl(), {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify(submission)
  });
  if (!response.ok) throw new Error(`Lead storage failed: ${response.status}`);
}

export async function listSubmissions() {
  const response = await fetch(`${tableUrl()}?select=id,name,telegram,message,created_at&order=created_at.desc`, {
    headers: headers()
  });
  if (!response.ok) throw new Error(`Lead storage failed: ${response.status}`);
  return (await response.json()).map((lead) => ({
    id: lead.id,
    name: lead.name,
    telegram: lead.telegram,
    message: lead.message,
    createdAt: lead.created_at
  }));
}
