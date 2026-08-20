// RemitCompare — Live Remittance Rate Comparison
//
// Pulls the live mid-market exchange rate from a free public API, then
// applies a set of illustrative provider margins/fees to approximate what
// each provider might offer. IMPORTANT: real remittance providers don't
// publish free, CORS-open rate APIs, so the "provider" figures here are
// modeled — not live quotes. Swap PROVIDER_PROFILES for real partner
// integrations to turn this into a production tool. See readme.md.

const PROVIDER_PROFILES = [
  { name: 'Wise', sub: 'Mid-market + small transparent fee', marginPct: 0.004, flatFeePct: 0.006 },
  { name: 'Remitly (Economy)', sub: '3–5 day transfer', marginPct: 0.012, flatFeePct: 0.003 },
  { name: 'WorldRemit', sub: 'Instant to e-wallet', marginPct: 0.018, flatFeePct: 0.010 },
  { name: 'Western Union', sub: 'Cash pickup available', marginPct: 0.028, flatFeePct: 0.012 },
  { name: 'Bank wire transfer', sub: 'Traditional bank rail', marginPct: 0.035, flatFeePct: 0.015 },
];

const form = document.getElementById('convert-form');
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from-currency');
const toSelect = document.getElementById('to-currency');
const btn = document.getElementById('compare-btn');
const status = document.getElementById('status-line');
const results = document.getElementById('results');
const midMarketEl = document.getElementById('mid-market');
const providersEl = document.getElementById('providers');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  run();
});

async function run() {
  const amount = parseFloat(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (!amount || amount <= 0) {
    setStatus('Enter an amount greater than zero.', true);
    return;
  }
  if (from === to) {
    setStatus('Choose two different currencies to compare.', true);
    return;
  }

  setBusy(true);
  setStatus('Fetching the live mid-market rate…', false);
  results.classList.add('hidden');

  try {
    const rate = await fetchRate(from, to);
    render(amount, from, to, rate);
    setStatus(`Comparison ready — rate refreshed just now.`, false);
  } catch (err) {
    setStatus(err.message || 'Could not fetch a live rate right now.', true);
  } finally {
    setBusy(false);
  }
}

async function fetchRate(from, to) {
  const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
  if (!res.ok) throw new Error('Exchange rate service is unavailable right now.');
  const data = await res.json();
  if (data.result !== 'success' || !data.rates || !data.rates[to]) {
    throw new Error('Could not find a rate for that currency pair.');
  }
  return data.rates[to];
}

function render(amount, from, to, midRate) {
  midMarketEl.textContent = `Live mid-market rate: 1 ${from} = ${midRate.toFixed(4)} ${to}`;

  const quotes = PROVIDER_PROFILES.map((p) => {
    const effectiveRate = midRate * (1 - p.marginPct);
    const grossReceive = amount * effectiveRate;
    const fee = grossReceive * p.flatFeePct;
    const netReceive = grossReceive - fee;
    return { ...p, netReceive, fee };
  }).sort((a, b) => b.netReceive - a.netReceive);

  providersEl.innerHTML = '';
  quotes.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = `provider-card${i === 0 ? ' best' : ''}`;
    card.innerHTML = `
      <div>
        <div class="provider-name">${q.name}</div>
        <div class="provider-sub">${q.sub}</div>
      </div>
      <div class="provider-amount">
        <span class="big">${formatMoney(q.netReceive, to)}</span>
        <span class="fee">≈ ${formatMoney(q.fee, to)} in fees/margin</span>
      </div>
    `;
    providersEl.appendChild(card);
  });

  results.classList.remove('hidden');
}

function formatMoney(value, currency) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function setBusy(busy) {
  btn.disabled = busy;
}

function setStatus(msg, isError) {
  status.textContent = msg;
  status.classList.toggle('error', !!isError);
}
