// ============================================================
// CLED – Aplicación principal (renderizado inmediato)
// ============================================================

// ---- CONFIGURACIÓN (Cámbiala cuando tengas tu proyecto) -----
const SUPABASE_URL = 'https://qbtwbzvdmpshcullonfp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidHdienZkbXBzaGN1bGxvbmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODA3MTUsImV4cCI6MjA5OTQ1NjcxNX0._tbQQ1Tz7ML9HWTzVXH2-3LuyDcvHcK1-jrBxxWtqUU';

// ---- Cliente Supabase (se inicializará solo cuando se necesite) ----
let supabaseClient = null;
function getSupabase() {
  if (!supabaseClient && typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// ---- Tema ----
let currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.classList.toggle('dark', currentTheme === 'dark');
window.toggleTheme = function() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
  document.documentElement.classList.toggle('dark', currentTheme === 'dark');
};

// ---- Router y renderizado principal ----
window.addEventListener('hashchange', render);
window.addEventListener('load', () => {
  // Si no hay hash, forzamos #home
  if (!window.location.hash) window.location.hash = '#home';
  else render();
});

function render() {
  const hash = window.location.hash || '#home';
  const app = document.getElementById('app');
  if (!app) return;

  switch(hash) {
    case '#home':   renderPublicHome(); break;
    case '#login':  renderLogin(); break;
    case '#dashboard':
      // Verificar si hay sesión antes de entrar al dashboard
      checkAuth().then(user => {
        if (user) renderDashboard(user);
        else window.location.hash = '#login';
      });
      break;
    default:
      renderPublicHome();
  }
}

// ---- Verificar autenticación (asíncrona) ----
async function checkAuth() {
  try {
    const client = getSupabase();
    if (!client) return null;
    const { data: { user } } = await client.auth.getUser();
    if (user) {
      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return { ...user, profile };
    }
  } catch(e) { /* no hay sesión o error */ }
  return null;
}

// ---- Página pública (se muestra al instante) ----
function renderPublicHome() {
  document.getElementById('app').innerHTML = `
    <nav class="public-nav" id="publicNav">
      <div class="logo" onclick="window.location.hash='#home'" style="cursor:pointer;">
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#0A3D91"/>
          <path d="M30 70 L50 30 L70 70" stroke="#D4AF37" stroke-width="6" fill="none"/>
        </svg>
        <span>CLED</span>
      </div>
      <div class="nav-links">
        <a href="#home">Inicio</a>
        <a href="#home">Clubes</a>
        <a href="#home">Eventos</a>
        <a href="#home">Contacto</a>
      </div>
      <div style="display:flex;gap:0.5rem;align-items:center;">
        <button class="btn btn-outline" onclick="toggleTheme()">🌓</button>
        <button class="btn btn-primary" onclick="window.location.hash='#login'">Campus CLED</button>
      </div>
    </nav>
    <section class="hero">
      <div>
        <h1 style="font-size:3rem;margin-bottom:1rem;">Club de Liderazgo<br>Estudiantil y Desarrollo</h1>
        <p style="font-size:1.25rem;opacity:0.9;margin-bottom:2rem;">Formando líderes en República Dominicana.</p>
        <button class="btn btn-gold" style="font-size:1.2rem;padding:1rem 2rem;" onclick="window.location.hash='#login'">
          Ingresar al Campus →
        </button>
      </div>
    </section>
    <section style="padding:4rem 1.5rem;background:var(--bg-card);">
      <div class="container">
        <h2 style="text-align:center;margin-bottom:2rem;">Nuestra Esencia</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;">
          <div class="card"><h3>Comunicación</h3><p>Expresión oral y escrita.</p></div>
          <div class="card"><h3>Liderazgo</h3><p>Inspirar y transformar.</p></div>
          <div class="card"><h3>Desarrollo</h3><p>Crecimiento personal.</p></div>
        </div>
      </div>
    </section>
    <section style="padding:4rem 1.5rem;background:var(--primary);color:white;text-align:center;">
      <h2>¿Listo para unirte?</h2>
      <button class="btn btn-gold" onclick="window.location.hash='#login'">Solicitar ingreso</button>
    </section>
  `;
  // Efecto scroll navbar
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('publicNav');
    if (nav) nav.classList.toggle('nav-scrolled', window.scrollY > 50);
  });
}

// ---- Página Login ----
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="login-container">
      <div class="login-left">
        <div style="text-align:center;">
          <div class="logo" style="color:white;">CLED</div>
          <h2 style="margin-top:2rem;">Campus CLED</h2>
        </div>
      </div>
      <div class="login-right">
        <div style="width:100%;max-width:400px;">
          <h1>Iniciar Sesión</h1>
          <form id="loginForm" style="margin-top:2rem;">
            <div class="form-group">
              <label>Correo electrónico</label>
              <input type="email" id="email" required placeholder="tu@correo.com">
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" id="password" required placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Ingresar</button>
          </form>
          <p style="margin-top:1rem;text-align:center;">
            <a href="#" onclick="event.preventDefault();sendMagicLink()">Acceder con enlace mágico</a>
          </p>
          <p style="margin-top:1rem;text-align:center;">
            <a href="#home">← Volver al inicio</a>
          </p>
        </div>
      </div>
    </div>
  `;
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const client = getSupabase();
    if (!client) return alert('Error de conexión con Supabase.');
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.hash = '#dashboard';
  });
}

window.sendMagicLink = async function() {
  const email = prompt('Ingresa tu correo para recibir el enlace mágico:');
  if (email) {
    const client = getSupabase();
    if (!client) return alert('Error de conexión.');
    const { error } = await client.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Revisa tu correo.');
  }
};

// ---- Dashboard (solo se muestra si hay sesión) ----
function renderDashboard(user) {
  document.getElementById('app').innerHTML = `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="logo" style="cursor:pointer;" onclick="window.location.hash='#home'">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" fill="#0A3D91"/>
            <path d="M30 70 L50 30 L70 70" stroke="#D4AF37" stroke-width="6" fill="none"/>
          </svg>
          <span>CLED</span>
        </div>
        <nav style="margin-top:2rem;display:flex;flex-direction:column;gap:0.5rem;">
          <a href="#dashboard" class="active">📊 Dashboard</a>
          <a href="#dashboard">📅 Calendario</a>
          <a href="#dashboard">📚 Recursos</a>
          <a href="#dashboard">👥 Equipos</a>
          <a href="#dashboard">⚙️ Configuración</a>
        </nav>
        <button class="btn btn-outline" style="margin-top:auto;" onclick="toggleTheme()">🌓</button>
        <button class="btn btn-outline" onclick="signOut()">Cerrar sesión</button>
      </aside>
      <main class="main-content">
        <div class="topbar">
          <h1>Dashboard</h1>
          <span>${user.profile?.first_name || 'Usuario'}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:2rem;">
          <div class="card"><h3>Próximo Evento</h3><p>Feria de Clubes</p></div>
          <div class="card"><h3>Próxima Reunión</h3><p>Debate - 3:00 PM</p></div>
          <div class="card"><h3>Promedio</h3><p>92.5</p></div>
          <div class="card"><h3>Equipo</h3><p>Equipo Alpha</p></div>
        </div>
        <div class="card">
          <h3>Actividad Reciente</h3>
          <div id="activityFeed">Cargando...</div>
        </div>
      </main>
    </div>
  `;
  // Cargar actividad desde Supabase (si hay conexión)
  const client = getSupabase();
  if (client) {
    client.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => {
        const feed = document.getElementById('activityFeed');
        if (feed && data) {
          feed.innerHTML = data.map(log => 
            `<p>• ${log.action} - ${new Date(log.created_at).toLocaleString()}</p>`
          ).join('');
        }
      });
  }
}

window.signOut = async function() {
  const client = getSupabase();
  if (client) await client.auth.signOut();
  window.location.hash = '#home';
};
