'use client';

import { useState } from 'react';

export default function Home() {
  const [started, setStarted] = useState(false);
  return (
    <main className="page">
      <header className="topbar">
        <a className="logo" href="#home"><span className="logo-mark">N<span>X</span></span><span><b>NIBRAS X</b><small>TAIF UNIVERSITY</small></span></a>
        <span className="top-label">A NEW WAY TO DISCOVER</span>
      </header>

      <section className="hero" id="home">
        <div className="copy">
          <div className="eyebrow"><i /> تجربة واقع معزز</div>
          <h1>مرحبًا بكِ في<br/><em>مبنى 12</em></h1>
          <p>بوابتك الرقمية لاكتشاف مبنى كلية الحاسبات وتقنية المعلومات بجامعة الطائف، بتجربة تفاعلية تجمع الواقع بالتقنية.</p>
          <button className="primary" onClick={() => setStarted(true)}>{started ? 'بدأت التجربة' : 'ابدئي التجربة'} <span>↗</span></button>
          <div className="meta"><span>⌖</span> كلية الحاسبات وتقنية المعلومات · جامعة الطائف</div>
        </div>
        <div className="visual">
          <div className="photo-frame"><img src="/building-12.jpeg" alt="واجهة مبنى 12، كلية الحاسبات"/><div className="photo-shade"/><div className="photo-caption"><b>12</b><span>COLLEGE OF COMPUTERS</span></div><div className="scan-line"/></div>
          <div className="float-chip chip-a"><i/> BUILDING 12</div>
          <div className="float-chip chip-b">AR READY <span>✦</span></div>
          <div className="ring ring-a"/><div className="ring ring-b"/>
        </div>
      </section>

      {started && <section className="welcome" aria-live="polite"><div className="camera-icon">◎</div><div><h2>أهلًا بكِ في مبنى 12</h2><p>هذه بوابة البداية. تفعيل الكاميرا وتجربة الواقع المعزز ستكون في المرحلة التالية.</p></div><button className="close" onClick={() => setStarted(false)} aria-label="إغلاق">×</button></section>}

      <footer><span>NIBRAS X © 2026</span><span>TAIF UNIVERSITY</span></footer>
    </main>
  );
}
