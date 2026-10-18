/* SkyBound Works - interactions: menu, filters, FAQ, reveal, form */
(function () {
        // CONTACT FORM SETUP: paste your Formspree URL (https://formspree.io/f/xxxx) here,
        // or use Web3Forms: endpoint 'https://api.web3forms.com/submit' + your access key below.
        const FORM_ENDPOINT = '';
        const FORM_ACCESS_KEY = '';
        const $ = (q, c = document) => c.querySelector(q);
        const $$ = (q, c = document) => [...c.querySelectorAll(q)];

        // Mobile menu
        const btn = $('#mobileMenuBtn'), menu = $('#mobileMenu');
        const setMenu = open => {
            menu.classList.toggle('hidden', !open);
            menu.classList.toggle('flex', open);
            btn.setAttribute('aria-expanded', open);
            btn.innerHTML = '<i class="fa-solid ' + (open ? 'fa-xmark' : 'fa-bars') + ' text-sm"></i>';
        };
        btn.setAttribute('aria-expanded', 'false');
        btn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
        $$('.mobile-link').forEach(l => l.addEventListener('click', () => setMenu(false)));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

        // Portfolio filter
        const filters = $$('.filter-btn'), items = $$('.portfolio-item');
        filters.forEach(b => b.addEventListener('click', () => {
            filters.forEach(f => {
                const on = f === b;
                f.classList.toggle('active', on);
                f.classList.toggle('bg-slate-900', on); f.classList.toggle('text-white', on);
                f.classList.toggle('bg-slate-100', !on); f.classList.toggle('text-slate-600', !on);
            });
            const key = b.dataset.filter;
            items.forEach(it => it.classList.toggle('hide', key !== 'all' && !it.classList.contains(key)));
        }));

        // Accessible FAQ accordion
        const acc = $$('.accordion-item');
        acc.forEach((item, n) => {
            const head = $('.accordion-header', item), body = $('.accordion-content', item);
            head.setAttribute('role', 'button'); head.tabIndex = 0;
            head.setAttribute('aria-expanded', 'false');
            body.id = 'faq-' + n; head.setAttribute('aria-controls', body.id);
            const toggle = () => {
                const open = !item.classList.contains('active');
                acc.forEach(o => { o.classList.remove('active'); $('.accordion-header', o).setAttribute('aria-expanded', 'false'); });
                if (open) { item.classList.add('active'); head.setAttribute('aria-expanded', 'true'); }
            };
            item.addEventListener('click', toggle);
            head.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        });

        // Scroll reveal
        const targets = $$('section .interactive-hover-card, section h2, section .grid > div, #about .grid');
        const seen = new Set();
        const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
            if (e.isIntersecting) { const t = e.target; t.classList.add('in'); io.unobserve(t); setTimeout(() => { t.classList.remove('reveal', 'in'); t.style.transitionDelay = ''; }, 700); }
        }), { threshold: 0.12 }) : null;
        targets.forEach((t, i) => {
            if (seen.has(t) || t.closest('#home')) return; seen.add(t);
            t.classList.add('reveal');
            t.style.transitionDelay = (i % 3) * 40 + 'ms';
            io ? io.observe(t) : t.classList.add('in');
        });

        // Scroll progress, active nav, floating CTA
        const bar = $('#scrollBar'), cta = $('#floatCta');
        const secs = $$('main section[id], section[id]');
        const links = $$('header nav a');
        const onScroll = () => {
            const h = document.documentElement;
            bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
            cta.classList.toggle('show', h.scrollTop > 700 && !(location.hash === '#contact'));
            let cur = '';
            secs.forEach(sec => { if (sec.getBoundingClientRect().top < 140) cur = sec.id; });
            links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
        };
        addEventListener('scroll', onScroll, { passive: true }); onScroll();

        // Contact form: validate, then open a pre-filled email (swap for Formspree/Web3Forms later)
        const form = $('#contactForm'), err = $('#formError');
        form.addEventListener('submit', e => {
            e.preventDefault();
            const d = Object.fromEntries(new FormData(form));
            const bad = !d.name.trim() ? 'Please enter your name.'
                : !/^\S+@\S+\.\S+$/.test(d.email.trim()) ? 'Please enter a valid email address.'
                : !d.company.trim() ? 'Please enter your company name.' : '';
            err.textContent = bad; err.classList.toggle('hidden', !bad);
            if (bad) return;
            const done = () => { form.classList.add('hidden'); $('#formSuccess').classList.remove('hidden'); };
            if (FORM_ENDPOINT) {
                // Sends the inquiry straight to your inbox (Formspree / Web3Forms)
                const payload = Object.assign({ subject: 'New inquiry from ' + d.company }, FORM_ACCESS_KEY ? { access_key: FORM_ACCESS_KEY } : {}, d);
                fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
                    .then(r => r.ok ? done() : Promise.reject())
                    .catch(() => { err.textContent = 'Something went wrong. Please email hello@skyboundworks.com directly.'; err.classList.remove('hidden'); });
            } else {
                // Fallback: opens the visitor's email app with the details filled in
                const body = `Name: ${d.name}\nEmail: ${d.email}\nCompany: ${d.company}\nLink: ${d.link || '-'}\n\nGoals:\n${d.goals || '-'}`;
                window.location.href = 'mailto:hello@skyboundworks.com?subject=' + encodeURIComponent('New inquiry from ' + d.company) + '&body=' + encodeURIComponent(body);
                done();
            }
        });
    })();
