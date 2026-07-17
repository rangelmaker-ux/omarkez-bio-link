// Marx Bio Link - Dynamic Content Database

const DB_VERSION = "v18_self_heal";

const DEFAULT_PROFILES = {
  luts: {
    id: "luts",
    name: "LUTs",
    avatarType: "custom",
    avatarUrl: "assets/luts_cover.jpg",
    avatarPosition: "center",
    avatarFit: "cover",
    bio: "Pacotes de LUTs cinemáticos para câmeras e celular.",
    links: [
      {
        id: "lut-essential",
        title: "Essential LUT Pack (Sony & Mobile)",
        desc: "Graduação de cor profissional para S-Log3, D-Cinelike e perfis Flat de celular.",
        banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=95", // Sharp cinema neon projection light
        url: "https://hotmart.com.br",
        btnText: "Adquirir LUT Pack"
      },
      {
        id: "lut-orange-teal",
        title: "LUT Orange & Teal (Grátis)",
        desc: "Look clássico de cinema com tons dourados e azulados profundos. Baixe grátis.",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=95", // Sunset anamorphic graded scene
        url: "https://drive.google.com",
        btnText: "Baixar Grátis"
      }
    ]
  },
  mobile: {
    id: "mobile",
    name: "Config. Mobile",
    avatarType: "custom",
    avatarUrl: "assets/mobile_cover.png",
    avatarPosition: "center",
    avatarFit: "cover",
    bio: "Dicas de gravação e configurações para iPhone & Android (Blackmagic App).",
    links: [
      {
        id: "mob-blackmagic",
        title: "Guia Completo: App Blackmagic Camera",
        desc: "Como configurar codecs, FPS, shutter e exposição manual para qualidade máxima.",
        banner: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop&q=95", // Sharp camera lens close up
        url: "https://youtube.com",
        btnText: "Assistir Vídeo Tutorial"
      },
      {
        id: "mob-rig",
        title: "Meu Setup Mobile (Equipamentos)",
        desc: "Lista de lentes anamórficas, microfone sem fio e suporte de alumínio para iPhone.",
        banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=95", // Professional mobile rig kit
        url: "https://amazon.com.br",
        btnText: "Ver Setup Completo"
      }
    ]
  },
  sony: {
    id: "sony",
    name: "Sony ZV-E10 II",
    avatarType: "custom",
    avatarUrl: "assets/sony_zv10_cover.jpg",
    avatarPosition: "center",
    avatarFit: "cover",
    bio: "Configurações, lentes e acessórios para a Sony ZV-E10 Mark II.",
    links: [
      {
        id: "sony-setup",
        title: "Melhor Perfil de Cor (Sony ZV-E10 II)",
        desc: "Minha configuração de S-Cinetone e HLG para gravação rápida com cores excelentes.",
        banner: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=1200&auto=format&fit=crop&q=95", // Ultra-sharp Sony camera close up
        url: "https://youtube.com",
        btnText: "Ver Configuração"
      },
      {
        id: "sony-lens",
        title: "Lente Sigma 18-50mm f/2.8 DC DN",
        desc: "A melhor lente zoom leve e luminosa para a câmera Sony APS-C.",
        banner: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=1200&auto=format&fit=crop&q=95", // Lens elements detail shot
        url: "https://amazon.com.br",
        btnText: "Ver na Amazon"
      }
    ]
  }
};

// Sync DB version tag in local storage
const localVersion = localStorage.getItem("marx_db_version");
if (localVersion !== DB_VERSION) {
  localStorage.setItem("marx_db_version", DB_VERSION);
}

function getProfilesData() {
  let localData = localStorage.getItem("marx_profiles_data");
  let parsed = null;
  
  if (localData && localData !== "undefined" && localData !== "null") {
    try {
      parsed = JSON.parse(localData);
    } catch (e) {
      console.error("Error parsing local storage profiles:", e);
    }
  }
  
  // If parsed data is empty, null, or not an object, fallback to DEFAULT_PROFILES
  if (!parsed || typeof parsed !== "object" || Object.keys(parsed).length === 0) {
    localStorage.setItem("marx_profiles_data", JSON.stringify(DEFAULT_PROFILES));
    return DEFAULT_PROFILES;
  }
  
  return parsed;
}

let supabaseClient = null;

function getSupabaseConfig() {
  const url = "https://cvgagkbiyqtqhullgdya.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Z2Fna2JpeXF0cWh1bGxnZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTM2MjEsImV4cCI6MjA5OTgyOTYyMX0.JLWc1sml-i0EE_R51Ru4CoSwz9D-AFQKE-dCON7ulI4";
  return { url, key };
}

function initSupabase() {
  const { url, key } = getSupabaseConfig();
  if (url && key && typeof supabase !== "undefined") {
    try {
      supabaseClient = supabase.createClient(url, key);
      console.log("Supabase client initialized successfully!");
      return true;
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
    }
  }
  return false;
}

// Call on startup
initSupabase();

function updateSyncStatus(text, color) {
  const label = document.getElementById("admin-sync-status");
  if (label) {
    label.textContent = text;
    label.style.color = color;
  }
}

function saveProfilesData(data) {
  localStorage.setItem("marx_profiles_data", JSON.stringify(data));
  updateSyncStatus("🟡 Sincronizando...", "#ff9f0a");
  
  if (supabaseClient) {
    // Primary sync with Supabase config table
    supabaseClient
      .from("profiles_config")
      .upsert({ id: "global", data: data })
      .then(({ error }) => {
        if (error) {
          console.error("Supabase upsert error:", error);
          updateSyncStatus("🔴 Erro de Sincronização", "#e50914");
        } else {
          updateSyncStatus("🟢 Supabase Conectado", "#24b47e");
        }
      })
      .catch(e => {
        console.error("Supabase upsert catch error:", e);
        updateSyncStatus("🔴 Erro de Sincronização", "#e50914");
      });
  } else {
    // Fallback sync with kvdb.io
    fetch("https://kvdb.io/ESoMeanvVB1XNDmJosDzE1/profiles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(() => {
      updateSyncStatus("🟢 Nuvem Sincronizada", "#46d369");
    })
    .catch(e => {
      console.log("Failed to sync save to cloud:", e);
      updateSyncStatus("🔴 Erro de Sincronização", "#e50914");
    });
  }
}

// Asynchronous Cloud Syncing
async function syncFromCloud() {
  updateSyncStatus("🟡 Sincronizando...", "#ff9f0a");
  
  if (supabaseClient) {
    // Primary sync from Supabase config table
    try {
      const { data: row, error } = await supabaseClient
        .from("profiles_config")
        .select("data")
        .eq("id", "global")
        .single();
        
      if (error) {
        if (error.code === "PGRST116") {
          // Row doesn't exist, initialize it
          const currentLocal = getProfilesData();
          await supabaseClient.from("profiles_config").insert({ id: "global", data: currentLocal });
          updateSyncStatus("🟢 Supabase Conectado", "#24b47e");
        } else {
          console.error("Supabase fetch error:", error);
          updateSyncStatus("🔴 Erro de Sincronização", "#e50914");
        }
      } else {
        const cloudData = row ? row.data : null;
        if (cloudData && typeof cloudData === "object" && Object.keys(cloudData).length > 0) {
          localStorage.setItem("marx_profiles_data", JSON.stringify(cloudData));
          if (window.onCloudSyncComplete) {
            window.onCloudSyncComplete();
          }
          updateSyncStatus("🟢 Supabase Conectado", "#24b47e");
        } else {
          // Self-heal: Cloud database exists but is empty or null!
          // Push our local profiles (which are guaranteed valid) to initialize the cloud database.
          const currentLocal = getProfilesData();
          await supabaseClient.from("profiles_config").upsert({ id: "global", data: currentLocal });
          
          // Also save locally and trigger render in case local was empty
          localStorage.setItem("marx_profiles_data", JSON.stringify(currentLocal));
          if (window.onCloudSyncComplete) {
            window.onCloudSyncComplete();
          }
          updateSyncStatus("🟢 Supabase Conectado", "#24b47e");
        }
      }
    } catch (e) {
      console.error("Supabase sync try error:", e);
      updateSyncStatus("🔴 Offline (Usando Cache)", "#8c8c8c");
    }
  } else {
    // Fallback sync from kvdb.io
    try {
      const res = await fetch("https://kvdb.io/ESoMeanvVB1XNDmJosDzE1/profiles");
      if (res.status === 200) {
        const cloudData = await res.json();
        if (cloudData && typeof cloudData === "object" && Object.keys(cloudData).length > 0) {
          localStorage.setItem("marx_profiles_data", JSON.stringify(cloudData));
          if (window.onCloudSyncComplete) {
            window.onCloudSyncComplete();
          }
          updateSyncStatus("🟢 Nuvem Sincronizada", "#46d369");
        }
      } else if (res.status === 404) {
        const currentLocal = getProfilesData();
        await fetch("https://kvdb.io/ESoMeanvVB1XNDmJosDzE1/profiles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentLocal)
        });
        updateSyncStatus("🟢 Nuvem Sincronizada", "#46d369");
      } else {
        updateSyncStatus("🔴 Erro de Sincronização", "#e50914");
      }
    } catch (e) {
      console.log("Cloud sync failed, using cached local data.", e);
      updateSyncStatus("🔴 Offline (Usando Cache)", "#8c8c8c");
    }
  }
}

// Make available globally
window.getProfilesData = getProfilesData;
window.saveProfilesData = saveProfilesData;
window.syncFromCloud = syncFromCloud;
window.initSupabase = initSupabase;
window.defaultProfileSound = "https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav"; // Synth sweep
