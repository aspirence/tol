/**
 * =============================================
 *  TREE OF LIFE RESORT — INVESTOR PLAN
 *  script.js  |  Rudraksh Presents
 * =============================================
 *  Features:
 *  1. Interactive Investment Calculator (sliders)
 *  2. Live analytics charts (bar, SVG line, donut)
 *  3. Animated counter (count-up on scroll)
 *  4. Scroll-reveal animations
 *  5. Timeline tooltip hover
 *  6. Progress-bar analytics
 * ============================================= */

/* ─── CONSTANTS ─── */
const CURRENCY = '₹';
const LAKH = 100000;
const CR   = 10000000;

/* ─── UTILITY HELPERS ─── */
function formatINR(value) {
  if (value >= CR)   return `${CURRENCY}${(value / CR).toFixed(2)}Cr`;
  if (value >= LAKH) return `${CURRENCY}${(value / LAKH).toFixed(1)}L`;
  return `${CURRENCY}${value.toLocaleString('en-IN')}`;
}

function formatINRPrecise(value) {
  if (value >= CR)   return `${CURRENCY}${(value / CR).toFixed(2)} Cr`;
  if (value >= LAKH) return `${CURRENCY}${(value / LAKH).toFixed(2)} L`;
  return `${CURRENCY}${Math.round(value).toLocaleString('en-IN')}`;
}

function lerp(a, b, t) { return a + (b - a) * t; }

/* ─── 1. SCROLL REVEAL ─── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
}

/* ─── 2. COUNTER ANIMATION ─── */
function animateCounter(el, target, duration = 1800, prefix = '', suffix = '') {
  const start = performance.now();
  const startVal = 0;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
    const current = Math.round(lerp(startVal, target, ease));
    el.textContent = prefix + current.toLocaleString('en-IN') + suffix;
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* Stats strip counters */
function initStatCounters() {
  const stats = [
    { id: 'stat-roi',     val: 17,    prefix: '',   suffix: '%',   decimals: false },
    { id: 'stat-monthly', val: 35000, prefix: '₹',  suffix: '',    decimals: false },
    { id: 'stat-total',   val: 1.01,  prefix: '₹',  suffix: 'Cr',  isFloat: true   },
    { id: 'stat-years',   val: 7,     prefix: '',    suffix: ' Yrs',decimals: false },
  ];

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sid = e.target.dataset.statId;
      const s   = stats.find(x => x.id === sid);
      if (!s) return;

      if (s.isFloat) {
        // Animate float
        const duration = 1800;
        const start = performance.now();
        const animFloat = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          const cur  = (ease * s.val).toFixed(2);
          e.target.textContent = s.prefix + cur + s.suffix;
          if (t < 1) requestAnimationFrame(animFloat);
        };
        requestAnimationFrame(animFloat);
      } else {
        animateCounter(e.target, s.val, 1800, s.prefix, s.suffix);
      }
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  stats.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) {
      el.dataset.statId = s.id;
      io.observe(el);
    }
  });
}

/* ─── 3. INVESTMENT CALCULATOR (FIXED PLAN) ─── */
function initCalculator() {
  /* Yearly breakdown bar-chart (for visual breakdown section) */
  const yearlyBars = document.getElementById('yearly-bars');

  // Fixed Plan Values
  const invest  = 55 * LAKH;     // ₹55 Lakhs
  const monthly = 35000;         // ₹35,000 / month
  const years   = 7;             // 7 Years

  const buybackPerYear = invest / years;        // capital returned each year
  const rentalMonths   = Math.max(0, years * 12 - 6); // rental starts at month 6
  const totalRental    = monthly * rentalMonths;
  const totalCapital   = buybackPerYear * years;
  const totalReturns   = totalRental + totalCapital;

  function updateYearlyBars(buybackPerYear, monthly, years) {
    if (!yearlyBars) return;
    yearlyBars.innerHTML = '';

    let cumulativeRental  = 0;
    let cumulativeCapital = 0;

    for (let y = 1; y <= years; y++) {
      const rentalThisYear   = monthly * (y === 1 ? 6 : 12); // first year = 6 months
      cumulativeRental  += rentalThisYear;
      cumulativeCapital += buybackPerYear;
      const total = cumulativeRental + cumulativeCapital;

      const bar = document.createElement('div');
      bar.className = 'mini-bar';
      bar.style.height = `${Math.min(100, (total / (monthly * 12 * years + buybackPerYear * years)) * 100)}%`;

      const tip = document.createElement('div');
      tip.className = 'mini-bar-tip';
      tip.textContent = `Y${y}: ${formatINR(total)}`;
      bar.appendChild(tip);
      yearlyBars.appendChild(bar);
    }

    // X-axis labels
    const labels = document.getElementById('yearly-labels');
    if (labels) {
      labels.innerHTML = '';
      for (let y = 1; y <= years; y++) {
        const lbl = document.createElement('span');
        lbl.style.cssText = 'flex:1;text-align:center;font-size:9px;color:var(--text-muted);letter-spacing:1px;';
        lbl.textContent = `Y${y}`;
        labels.appendChild(lbl);
      }
    }
  }

  // Draw Fixed Yearly Bars
  updateYearlyBars(buybackPerYear, monthly, years);

  // Update Analytics Section (Progress bars, SVG charts, etc.)
  updateAnalytics(invest, monthly, years, totalRental, totalCapital, totalReturns, 17.0);
}

/* ─── 4. ANALYTICS PANEL ─── */
function updateAnalytics(invest, monthly, years, totalRental, totalCapital, totalReturns, roi) {
  // Progress bars
  const capitalPct = Math.min(100, (totalCapital / totalReturns) * 100);
  const rentalPct  = Math.min(100, (totalRental  / totalReturns) * 100);

  const capBar = document.getElementById('prog-capital');
  const renBar = document.getElementById('prog-rental');

  if (capBar) capBar.style.width = capitalPct.toFixed(1) + '%';
  if (renBar) renBar.style.width = rentalPct.toFixed(1) + '%';

  // Labels
  const capLblPct = document.getElementById('lbl-capital-pct');
  const renLblPct = document.getElementById('lbl-rental-pct');
  if (capLblPct) capLblPct.textContent = capitalPct.toFixed(0) + '%';
  if (renLblPct) renLblPct.textContent = rentalPct.toFixed(0) + '%';

  // KPI chips
  const kpiYield     = document.getElementById('kpi-yield');
  const kpiBreakeven = document.getElementById('kpi-breakeven');
  const kpiMonthly   = document.getElementById('kpi-monthly');
  const kpiMultiple  = document.getElementById('kpi-multiple');

  const breakEvenMonths = Math.ceil(invest / monthly);
  const multiple        = (totalReturns / invest).toFixed(2);

  if (kpiYield)     kpiYield.textContent     = roi.toFixed(1) + '%';
  if (kpiBreakeven) kpiBreakeven.textContent = breakEvenMonths + ' mo';
  if (kpiMonthly)   kpiMonthly.textContent   = formatINR(monthly);
  if (kpiMultiple)  kpiMultiple.textContent  = multiple + 'x';

  // Update SVG line chart
  updateLineChart(invest, monthly, years);
}

/* ─── 5. SVG LINE CHART (cumulative returns over time) ─── */
function updateLineChart(invest, monthly, years) {
  const svg = document.getElementById('line-chart-svg');
  if (!svg) return;

  const W = 400, H = 180, PAD = 30;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width',   '100%');
  svg.setAttribute('height',  H);

  // Clear previous
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  const grad = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
  grad.id = 'lgLine';
  grad.setAttribute('x1','0'); grad.setAttribute('y1','0');
  grad.setAttribute('x2','0'); grad.setAttribute('y2','1');
  const s1 = document.createElementNS('http://www.w3.org/2000/svg','stop');
  s1.setAttribute('offset','0%');      s1.setAttribute('stop-color','#C9A84C'); s1.setAttribute('stop-opacity','0.4');
  const s2 = document.createElementNS('http://www.w3.org/2000/svg','stop');
  s2.setAttribute('offset','100%');    s2.setAttribute('stop-color','#C9A84C'); s2.setAttribute('stop-opacity','0');
  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  // Collect data points (monthly)
  const totalMonths = years * 12;
  const buybackMonthly = invest / years / 12;
  const points = [];

  for (let m = 0; m <= totalMonths; m++) {
    const rentalEarned  = m <= 6 ? 0 : monthly * (m - 6);
    const capitalBack   = buybackMonthly * m;
    const cumulative    = rentalEarned + capitalBack;
    points.push(cumulative);
  }

  const maxVal = Math.max(...points);

  // Map to SVG coords
  function px(m) { return PAD + (m / totalMonths) * (W - PAD * 2); }
  function py(v) { return H - PAD - (v / maxVal) * (H - PAD * 2); }

  // Fill area
  const areaPath = document.createElementNS('http://www.w3.org/2000/svg','path');
  let areaD = `M ${px(0)} ${py(0)}`;
  points.forEach((v, i) => { areaD += ` L ${px(i)} ${py(v)}`; });
  areaD += ` L ${px(totalMonths)} ${H - PAD} L ${px(0)} ${H - PAD} Z`;
  areaPath.setAttribute('d', areaD);
  areaPath.setAttribute('fill', 'url(#lgLine)');
  svg.appendChild(areaPath);

  // Line
  const linePath = document.createElementNS('http://www.w3.org/2000/svg','path');
  let lineD = `M ${px(0)} ${py(0)}`;
  points.forEach((v, i) => { lineD += ` L ${px(i)} ${py(v)}`; });
  linePath.setAttribute('d', lineD);
  linePath.setAttribute('fill', 'none');
  linePath.setAttribute('stroke', '#C9A84C');
  linePath.setAttribute('stroke-width', '2');
  svg.appendChild(linePath);

  // Investment line (break-even reference)
  const refLine = document.createElementNS('http://www.w3.org/2000/svg','line');
  refLine.setAttribute('x1', px(0));       refLine.setAttribute('y1', py(invest));
  refLine.setAttribute('x2', px(totalMonths)); refLine.setAttribute('y2', py(invest));
  refLine.setAttribute('stroke', 'rgba(201,168,76,0.25)');
  refLine.setAttribute('stroke-width', '1');
  refLine.setAttribute('stroke-dasharray', '4 4');
  svg.appendChild(refLine);

  // Label "Invested"
  const refTxt = document.createElementNS('http://www.w3.org/2000/svg','text');
  refTxt.setAttribute('x', px(0) + 4);
  refTxt.setAttribute('y', py(invest) - 5);
  refTxt.setAttribute('fill', 'rgba(201,168,76,0.5)');
  refTxt.setAttribute('font-size', '9');
  refTxt.textContent = 'Capital Invested';
  svg.appendChild(refTxt);

  // Year markers
  for (let y = 1; y <= years; y++) {
    const m = y * 12;
    const circ = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circ.setAttribute('cx', px(m));
    circ.setAttribute('cy', py(points[m]));
    circ.setAttribute('r',  '4');
    circ.setAttribute('fill', '#C9A84C');
    svg.appendChild(circ);

    const ytxt = document.createElementNS('http://www.w3.org/2000/svg','text');
    ytxt.setAttribute('x', px(m));
    ytxt.setAttribute('y', H - PAD + 14);
    ytxt.setAttribute('text-anchor', 'middle');
    ytxt.setAttribute('fill', 'rgba(138,128,112,0.8)');
    ytxt.setAttribute('font-size', '9');
    ytxt.textContent = `Y${y}`;
    svg.appendChild(ytxt);
  }

  // Axes
  const axisX = document.createElementNS('http://www.w3.org/2000/svg','line');
  axisX.setAttribute('x1', px(0));          axisX.setAttribute('y1', H - PAD);
  axisX.setAttribute('x2', px(totalMonths));axisX.setAttribute('y2', H - PAD);
  axisX.setAttribute('stroke', 'rgba(201,168,76,0.2)'); axisX.setAttribute('stroke-width','1');
  svg.appendChild(axisX);

  const axisY = document.createElementNS('http://www.w3.org/2000/svg','line');
  axisY.setAttribute('x1', px(0)); axisY.setAttribute('y1', PAD);
  axisY.setAttribute('x2', px(0)); axisY.setAttribute('y2', H - PAD);
  axisY.setAttribute('stroke', 'rgba(201,168,76,0.2)'); axisY.setAttribute('stroke-width','1');
  svg.appendChild(axisY);
}

/* ─── 6. DONUT SVG UPDATE ─── */
function initDonutChart() {
  // Donut is static in HTML; we make it interactive on hover
  const donutSVGs = document.querySelectorAll('.donut-container svg');
  donutSVGs.forEach(svg => {
    const circles = svg.querySelectorAll('circle[stroke-dasharray]');
    circles.forEach(c => {
      c.style.transition = 'stroke-opacity 0.3s, stroke-width 0.3s';
      c.addEventListener('mouseenter', () => {
        c.style.strokeWidth = String(parseInt(c.getAttribute('stroke-width') || '24') + 4);
        c.style.strokeOpacity = '1';
      });
      c.addEventListener('mouseleave', () => {
        c.style.strokeWidth = '';
        c.style.strokeOpacity = '';
      });
    });
  });
}

/* ─── 7. COMPARISON TABLE — HIGHLIGHT ON HOVER ─── */
function initComparisonTable() {
  const rows = document.querySelectorAll('.compare-table tbody tr');
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.background = 'rgba(201,168,76,0.04)';
      row.style.transition  = 'background 0.3s';
    });
    row.addEventListener('mouseleave', () => {
      if (!row.classList.contains('highlight-row')) {
        row.style.background = '';
      }
    });
  });
}

/* ─── 8. TIMELINE TOOLTIP ─── */
function initTimeline() {
  const items = document.querySelectorAll('.tl-item');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const dot = item.querySelector('.tl-dot');
      if (dot) dot.style.transform = 'scale(1.15)';
    });
    item.addEventListener('mouseleave', () => {
      const dot = item.querySelector('.tl-dot');
      if (dot) dot.style.transform = '';
    });
  });
}

/* ─── 9. SCROLL PROGRESS BAR ─── */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id    = 'scroll-progress';
  Object.assign(bar.style, {
    position: 'fixed',
    top: '0', left: '0',
    height: '3px',
    background: 'linear-gradient(to right, #C9A84C, #E8C97A)',
    zIndex: '9999',
    width: '0%',
    transition: 'width 0.1s ease',
    pointerEvents: 'none',
  });
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = Math.min(100, (scrolled / total) * 100) + '%';
  }, { passive: true });
}

/* ─── 10. CTA BUTTON ─── */
function initCTA() {
  const btn = document.getElementById('cta-button');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Simple modal/alert for demo
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0',
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: '10000', animation: 'fadeUp 0.3s ease forwards',
    });

    overlay.innerHTML = `
      <div style="background:#1C1C1C;border:1px solid rgba(201,168,76,0.3);padding:48px 40px;max-width:420px;width:90%;text-align:center;position:relative;border-radius:4px;">
        <div style="font-size:36px;margin-bottom:16px;">🏨</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:28px;color:#C9A84C;margin-bottom:12px;">Reserve Your Villa</div>
        <div style="font-size:12px;color:#8A8070;line-height:1.8;margin-bottom:28px;">
          Contact our investment team to secure your unit at<br>
          <strong style="color:#E8E0D0">Tree of Life Resort & Spa, Alibag</strong>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <a href="tel:+911234567890" style="display:block;background:#C9A84C;color:#0D0D0D;padding:14px;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;border-radius:4px;font-family:'Montserrat',sans-serif;">📞 Call Now</a>
          <a href="mailto:invest@rudraksh.com" style="display:block;border:1px solid rgba(201,168,76,0.4);color:#C9A84C;padding:14px;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;border-radius:4px;font-family:'Montserrat',sans-serif;">✉ Email Us</a>
        </div>
        <button onclick="this.closest('[data-modal]').remove()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#8A8070;font-size:20px;cursor:pointer;">✕</button>
      </div>`;

    overlay.dataset.modal = '1';
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  });
}

/* ─── 11. NUMBER FORMATTING in flow table ─── */
function initFlowTable() {
  // Monthly values linked to calculator
  // (already updated via updateAnalytics)
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initScrollReveal();
  initStatCounters();
  initCalculator();
  initDonutChart();
  initComparisonTable();
  initTimeline();
  initCTA();
});
