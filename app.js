// Simple SPA router using hash fragments
(function(){
    const pages = {
        '': document.getElementById('page-home'),
        '/': document.getElementById('page-home'),
        '/dashboard': document.getElementById('page-dashboard'),
        '/report': document.getElementById('page-report'),
        '/map': document.getElementById('page-map'),
        '/rewards': document.getElementById('page-rewards'),
        '/learn': document.getElementById('page-learn'),
        '/login/community': document.getElementById('page-login-community'),
        '/login/government': document.getElementById('page-login-government')
    };

    const roleKey = 'mm_role';

    function getRole(){
        try { return localStorage.getItem(roleKey) || 'GUEST'; } catch(_) { return 'GUEST'; }
    }
    function setRole(value){
        try { localStorage.setItem(roleKey, value); } catch(_) {}
        const el = document.getElementById('display-role');
        if(el) el.textContent = value.charAt(0) + value.slice(1).toLowerCase();
    }

    function show(path){
        Object.values(pages).forEach(p => p && p.classList.remove('active'));
        const page = pages[path] || pages['/'];
        if(page) page.classList.add('active');
        setRole(getRole());
        if(path === '/dashboard') window.location.hash = '#/dashboard';
    }

    function parseHash(){
        const h = (window.location.hash || '#/').slice(1);
        return h;
    }

    window.addEventListener('hashchange', () => show(parseHash()));
    document.addEventListener('DOMContentLoaded', () => {
        // Current year
        const y = document.getElementById('year');
        if(y) y.textContent = String(new Date().getFullYear());

        // Delegate nav internal links
        document.body.addEventListener('click', (e) => {
            const target = e.target;
            if(!(target instanceof Element)) return;
            const link = target.closest('[data-route]');
            if(link && link.getAttribute('href') && link.getAttribute('href').startsWith('#/')){
                // allow hash to update normally
            }
        });

        // Toast buttons
        document.body.addEventListener('click', (e) => {
            const t = e.target;
            if(!(t instanceof Element)) return;
            const btn = t.closest('[data-toast]');
            if(btn){
                const msg = btn.getAttribute('data-toast') || 'Action completed';
                toast(msg);
            }
        });

        // Login forms
        const comm = document.getElementById('login-community');
        if(comm){
            comm.addEventListener('submit', (e) => {
                e.preventDefault();
                setRole('COMMUNITY');
                toast('Logged in as Community');
                window.location.hash = '#/dashboard';
            });
        }
        const gov = document.getElementById('login-government');
        if(gov){
            gov.addEventListener('submit', (e) => {
                e.preventDefault();
                setRole('AUTHORITY');
                toast('Logged in as Government');
                window.location.hash = '#/dashboard';
            });
        }

        // Report form
        const reportForm = document.getElementById('report-form');
        if(reportForm){
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const data = new FormData(reportForm);
                const payload = Object.fromEntries(data.entries());
                payload.latitude = parseFloat(payload.latitude);
                payload.longitude = parseFloat(payload.longitude);
                // In a real app, send to API; here we simulate success
                console.log('Report submitted', payload);
                toast('Report submitted for review');
                window.location.hash = '#/dashboard';
            });
            const useLoc = document.getElementById('use-location');
            if(useLoc){
                useLoc.addEventListener('click', async () => {
                    if(!navigator.geolocation){ toast('Geolocation not supported'); return; }
                    navigator.geolocation.getCurrentPosition((pos) => {
                        const { latitude, longitude } = pos.coords;
                        reportForm.querySelector('input[name="latitude"]').value = String(latitude.toFixed(6));
                        reportForm.querySelector('input[name="longitude"]').value = String(longitude.toFixed(6));
                        toast('Location filled');
                    }, () => toast('Could not get location'));
                });
            }
        }

        // Cursor shadow follow
        const halo = document.querySelector('.cursor-shadow');
        if(halo){
            window.addEventListener('pointermove', (e) => {
                halo.style.left = e.clientX + 'px';
                halo.style.top = e.clientY + 'px';
            }, { passive: true });
        }

        // Initial route
        show(parseHash());
    });

    // Toast helper
    function toast(message){
        const root = document.getElementById('toast-root');
        if(!root) return;
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = message;
        root.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(4px)';
            setTimeout(() => el.remove(), 250);
        }, 1800);
    }
})();

