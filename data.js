// Marx Bio Link - Dynamic Content Database

const DB_VERSION = "v14_cloud_sync_fixed";

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

// LocalStorage Management
function getProfilesData() {
  const localData = localStorage.getItem("marx_profiles_data");
  if (!localData) {
    localStorage.setItem("marx_profiles_data", JSON.stringify(DEFAULT_PROFILES));
    return DEFAULT_PROFILES;
  }
  return JSON.parse(localData);
}

function saveProfilesData(data) {
  localStorage.setItem("marx_profiles_data", JSON.stringify(data));
  // Push save to cloud asynchronously
  fetch("https://kvdb.io/ESoMeanvVB1XNDmJosDzE1/profiles", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(e => console.log("Failed to sync save to cloud:", e));
}

// Asynchronous Cloud Syncing
async function syncFromCloud() {
  try {
    const res = await fetch("https://kvdb.io/ESoMeanvVB1XNDmJosDzE1/profiles");
    if (res.status === 200) {
      const cloudData = await res.json();
      if (cloudData && typeof cloudData === "object" && Object.keys(cloudData).length > 0) {
        localStorage.setItem("marx_profiles_data", JSON.stringify(cloudData));
        // Callback to app.js if registered
        if (window.onCloudSyncComplete) {
          window.onCloudSyncComplete();
        }
      }
    } else if (res.status === 404) {
      // Uninitialized bucket, push local data to cloud
      const currentLocal = getProfilesData();
      await fetch("https://kvdb.io/ESoMeanvVB1XNDmJosDzE1/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentLocal)
      });
    }
  } catch (e) {
    console.log("Cloud sync failed, using cached local data.", e);
  }
}

// Run cloud sync automatically in the background
syncFromCloud();

// Make available globally
window.getProfilesData = getProfilesData;
window.saveProfilesData = saveProfilesData;
window.defaultProfileSound = "https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav"; // Synth sweep
