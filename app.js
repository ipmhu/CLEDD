
// ============================================================
// CLED – Aplicación principal (versión robusta)
// ============================================================

// --- Configuración Supabase (¡CAMBIA ESTO CON TUS DATOS!) ---
const SUPABASE_URL = 'https://qbtwbzvdmpshcullonfp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidHdienZkbXBzaGN1bGxvbmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODA3MTUsImV4cCI6MjA5OTQ1NjcxNX0._tbQQ1Tz7ML9HWTzVXH2-3LuyDcvHcK1-jrBxxWtqUU';

// --- Esperar a que la librería Supabase esté disponible ---
function initSupabase(callback) {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    callback();
  } else {
    document.getElementById('app').innerHTML = '<p style="text-align:center;padding:2rem;">Cargando...</p>';
    setTimeout(() => initSupabase(callback), 100);
  }
}

// --- Inicializar cuando el DOM esté listo ---
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// --- Inicio real ---
ready(() => {
  initSupabase(() => {
    // Ahora sí podemos crear el cliente
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // Arrancar la app
    main();
  });
});

// --- Estado global ---
let currentUser = null;
let currentTheme = localStorage.getItem('theme') || 'light';

// --- Función principal ---
function main() {
  // Aplicar tema
  document.documentElement.classList.toggle('dark', currentTheme === 'dark');
  // Escuchar cambios de hash
  window.addEventListener('hashchange', render);
  // Render inicial
  render();
}

// --- Obtener referencia al cliente Supabase ---
const supabase = () => window.supabaseClient;

// --- Renderizar según la ruta ---
async function render() {
  const hash = window.location.hash || '#home';
  const app = document.getElementById('app');
  if (!app) return;

  // Verificar sesión
  try {
    const { data: { user } } = await supabase().auth.getUser();
    if (user) {
      const { data: profile } = await supabase()
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      currentUser = { ...user, profile };
    } else {
      currentUser = null;
    }
  } catch (e) {
    currentUser = null;
  }

  // Si ya está logueado y va a login, redirigir al dashboard
  if (hash === '#login' && currentUser) {
    window.location.hash = '#dashboard';
    return;
  }

  // Proteger dashboard
  if (hash === '#dashboard' && !currentUser) {
    window.location.hash = '#login';
    return;
  }

  // Renderizar la vista correspondiente
  switch (hash) {
    case '#login':
      renderLogin();
      break;
    case '#dashboard':
      renderDashboard();
      break;
    default:
      renderPublicHome();
  }
}

// --- Toggle tema ---
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
  document.documentElement.classList.toggle('dark', currentTheme === 'dark');
}

// --- Componente Logo ---
function logoHTML() {
  return `
    <div class="logo" onclick="window.location.hash='#home'" style="cursor:pointer;">
      <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" fill="#0A3D91"/>
        <path d="M30 70 L50 30 L70 70" stroke="#D4AF37" stroke-width="6" fill="none"/>
      </svg>
      <span>CLED</span>
    </div>`;
}

// --- Página pública ---
function renderPublicHome() {
  document.getElementById('app').innerHTML = `
    <nav class="public-nav" id="publicNav">
      ${logoHTML()}
      <div class="nav-links">
        <a href="#home">Inicio</a>
        <a href="#home">Clubes</a>
        <a href="#home">Eventos</a>
        <a href="#home">Contacto</a>
      </div>
      <div style="display:flex;gap:0.5rem;align-items:center;">
        <button class="btn btn-outline theme-toggle" onclick="toggleTheme()">🌓</button>
        <button class="btn btn-primary" onclick="window.location.hash='#login'">Campus CLED</button>
      </div>
    </nav>
    <section class="hero animate-fadeinup">
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
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('publicNav');
    if (nav) nav.classList.toggle('nav-scrolled', window.scrollY > 50);
  });
}

// --- Página Login ---
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="login-container">
      <div class="login-left">
        <div style="text-align:center;">
          ${logoHTML()}
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
        </div>
      </div>
    </div>
  `;
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.hash = '#dashboard';
  });
}

async function sendMagicLink() {
  const email = prompt('Ingresa tu correo para recibir el enlace mágico:');
  if (email) {
    const { error } = await supabase().auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Revisa tu correo.');
  }
}

// --- Dashboard ---
function renderDashboard() {
  document.getElementById('app').innerHTML = `
    <div class="dashboard-layout">
      <aside class="sidebar" id="sidebar">
        ${logoHTML()}
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
          <span>${currentUser?.profile?.first_name || 'Usuario'}</span>
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
  loadActivity();
}

async function loadActivity() {
  const { data } = await supabase()
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  const feed = document.getElementById('activityFeed');
  if (feed && data) {
    feed.innerHTML = data.map(log => 
      `<p>• ${log.action} - ${new Date(log.created_at).toLocaleString()}</p>`
    ).join('');
  }
}

async function signOut() {
  await supabase().auth.signOut();
  window.location.hash = '#home';
}
