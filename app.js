// Marx Bio Link - Application Controller Logic

document.addEventListener("DOMContentLoaded", () => {
  // --- State Variables ---
  let activeProfileKey = "luts"; // Default active profile
  let pendingDownload = null; // Holds { btnElement, targetUrl, originalText }
  
  // Helper to convert standard Google Drive sharing links into raw image hotlinks
  function convertGoogleDriveLink(url) {
    if (!url) return url;
    let cleanUrl = url.trim();
    
    if (cleanUrl.includes("drive.google.com") || cleanUrl.includes("docs.google.com")) {
      let fileId = "";
      
      // Match /file/d/FILE_ID
      const fileMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch && fileMatch[1]) {
        fileId = fileMatch[1];
      } else {
        // Match id=FILE_ID
        const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
          fileId = idMatch[1];
        }
      }
      
      if (fileId) {
        // Serve direct image stream through the Google User Content server
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    }
    return url;
  }
  const profileScreen = document.getElementById("profile-screen");
  const profileGrid = document.getElementById("profile-grid");
  const tudumIntro = document.getElementById("tudum-intro");
  const mainApp = document.getElementById("main-app");
  
  const scrollContent = document.getElementById("scroll-content");
  const homeView = document.getElementById("home-view");
  const searchView = document.getElementById("search-view");
  const downloadsView = document.getElementById("downloads-view");
  
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const searchTrigger = document.getElementById("search-trigger");
  
  const headerAvatarBox = document.getElementById("header-avatar-box");
  const verticalLinkContainer = document.getElementById("vertical-link-container");
  
  // Lead Modal Elements
  const leadModalBackdrop = document.getElementById("lead-modal-backdrop");
  const leadModal = document.getElementById("lead-modal");
  const closeLeadModalBtn = document.getElementById("close-lead-modal");
  const leadForm = document.getElementById("lead-form");
  const leadInstagramInput = document.getElementById("lead-instagram");
  const leadEmailInput = document.getElementById("lead-email");
  
  // Admin Elements
  const manageProfilesBtn = document.getElementById("manage-profiles-btn");
  const adminOverlay = document.getElementById("admin-overlay");
  const adminCloseBtn = document.getElementById("admin-close");
  const adminProfileSelect = document.getElementById("admin-profile-select");
  const adminLinksList = document.getElementById("admin-links-list");
  
  // Admin Links Form
  const adminLinkTitle = document.getElementById("admin-link-title");
  const adminLinkDesc = document.getElementById("admin-link-desc");
  const adminLinkUrl = document.getElementById("admin-link-url");
  const adminLinkBanner = document.getElementById("admin-link-banner");
  const adminAddLinkBtn = document.getElementById("admin-add-link-btn");
  
  // Admin Profiles CMS Form
  const adminManageProfileSelect = document.getElementById("admin-manage-profile-select");
  const adminProfileName = document.getElementById("admin-profile-name");
  const adminProfileBio = document.getElementById("admin-profile-bio");
  const adminProfileIconSelect = document.getElementById("admin-profile-icon-select");
  const adminProfileAvatarUrlLabel = document.getElementById("admin-profile-avatar-url-label");
  const adminProfileAvatarUrl = document.getElementById("admin-profile-avatar-url");
  const adminProfileAlignLabel = document.getElementById("admin-profile-align-label");
  const adminProfileAlignSelect = document.getElementById("admin-profile-align-select");
  const adminProfileFitLabel = document.getElementById("admin-profile-fit-label");
  const adminProfileFitSelect = document.getElementById("admin-profile-fit-select");
  const adminSaveProfileBtn = document.getElementById("admin-save-profile-btn");
  const adminDeleteProfileBtn = document.getElementById("admin-delete-profile-btn");
  
  // Admin Leads Section
  const adminLeadsTitle = document.getElementById("admin-leads-title");
  const adminLeadsList = document.getElementById("admin-leads-list");
  const adminExportLeadsBtn = document.getElementById("admin-export-leads-btn");
  const adminClearLeadsBtn = document.getElementById("admin-clear-leads-btn");
  
  const downloadTriggerBtn = document.getElementById("download-trigger-btn");
  
  // Audio setup
  const tudumAudio = new Audio(window.defaultProfileSound);
  tudumAudio.volume = 0.5;

  // --- Initial Setup ---
  renderProfilesGrid();
  populateAdminSelects();

  // --- Render Profiles Selection Grid ---
  function renderProfilesGrid() {
    profileGrid.innerHTML = "";
    const profiles = window.getProfilesData();
    let index = 0;
    
    Object.keys(profiles).forEach(key => {
      const profile = profiles[key];
      const card = document.createElement("div");
      card.className = "profile-card";
      card.setAttribute("data-profile", profile.id);
      card.style.animationDelay = `${index * 0.1}s`;
      
      const avatarWrapper = document.createElement("div");
      avatarWrapper.className = "profile-avatar-wrapper";
      
      if (profile.avatarType === "gradient") {
        avatarWrapper.innerHTML = `<div class="avatar-gradient-style"></div>`;
      } else if (profile.avatarType === "phone") {
        avatarWrapper.innerHTML = `
          <div class="avatar-phone-style">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          </div>`;
      } else if (profile.avatarType === "camera") {
        avatarWrapper.innerHTML = `
          <div class="avatar-camera-style">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>`;
      } else if (profile.avatarType === "custom" && profile.avatarUrl) {
        avatarWrapper.innerHTML = `<img class="profile-avatar" src="${convertGoogleDriveLink(profile.avatarUrl)}" alt="${profile.name}" style="object-fit: ${profile.avatarFit || 'cover'}; object-position: ${profile.avatarPosition || 'center'}; background-color: #000;">`;
      } else {
        avatarWrapper.innerHTML = `<div class="avatar-phone-style" style="background-color: #555555;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </div>`;
      }
      
      const nameLabel = document.createElement("div");
      nameLabel.className = "profile-name";
      nameLabel.textContent = profile.name;
      
      card.appendChild(avatarWrapper);
      card.appendChild(nameLabel);
      
      card.addEventListener("click", () => {
        loginToProfile(profile.id);
      });
      
      profileGrid.appendChild(card);
      index++;
    });
    
    // Add "Adicionar Perfil" dynamic card
    const addCard = document.createElement("div");
    addCard.className = "profile-card";
    addCard.style.animationDelay = `${index * 0.1}s`;
    addCard.innerHTML = `
      <div class="profile-avatar-wrapper profile-add">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </div>
      <div class="profile-name">Adicionar</div>
    `;
    
    addCard.addEventListener("click", () => {
      triggerAdminAuth(true);
    });
    profileGrid.appendChild(addCard);
  }

  // --- Profile Header Avatar Sync ---
  function updateHeaderAvatar(profileKey) {
    const profiles = window.getProfilesData();
    const profile = profiles[profileKey];
    if (!profile) return;
    
    headerAvatarBox.className = "header-profile-avatar";
    headerAvatarBox.style.backgroundImage = "";
    headerAvatarBox.style.backgroundSize = "";
    headerAvatarBox.style.backgroundPosition = "";
    headerAvatarBox.innerHTML = "";
    
    if (profile.avatarType === "gradient") {
      headerAvatarBox.classList.add("gradient");
    } else if (profile.avatarType === "phone") {
      headerAvatarBox.classList.add("phone");
      headerAvatarBox.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
    } else if (profile.avatarType === "camera") {
      headerAvatarBox.classList.add("camera");
      headerAvatarBox.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
    } else if (profile.avatarType === "custom" && profile.avatarUrl) {
      headerAvatarBox.style.backgroundImage = `url('${convertGoogleDriveLink(profile.avatarUrl)}')`;
      headerAvatarBox.style.backgroundSize = profile.avatarFit || "cover";
      headerAvatarBox.style.backgroundPosition = profile.avatarPosition || "center";
      headerAvatarBox.style.backgroundColor = "#000";
    } else {
      headerAvatarBox.style.backgroundColor = "#555555";
    }
  }

  // --- Profile Login Handler ---
  function loginToProfile(profileKey) {
    const profiles = window.getProfilesData();
    const profile = profiles[profileKey];
    if (!profile) return;
    
    activeProfileKey = profileKey;
    updateHeaderAvatar(profileKey);
    
    tudumAudio.play().catch(e => console.log("Audio play blocked by browser:", e));
    
    profileScreen.classList.add("hide");
    tudumIntro.classList.add("active");
    
    setTimeout(() => {
      tudumIntro.classList.remove("active");
      mainApp.classList.add("show");
      renderVerticalLinks(profileKey);
    }, 1800);
  }

  // --- Populate Dropdowns dynamically ---
  function populateAdminSelects(selectedProfileKey = null, selectedManageKey = null) {
    const profiles = window.getProfilesData();
    
    adminProfileSelect.innerHTML = "";
    adminManageProfileSelect.innerHTML = "";
    
    Object.keys(profiles).forEach(key => {
      const profile = profiles[key];
      
      const optLink = document.createElement("option");
      optLink.value = profile.id;
      optLink.textContent = profile.name;
      adminProfileSelect.appendChild(optLink);
      
      const optManage = document.createElement("option");
      optManage.value = profile.id;
      optManage.textContent = profile.name;
      adminManageProfileSelect.appendChild(optManage);
    });
    
    const optNew = document.createElement("option");
    optNew.value = "[new]";
    optNew.textContent = "(+) Criar Novo Perfil";
    adminManageProfileSelect.appendChild(optNew);
    
    if (selectedProfileKey) {
      adminProfileSelect.value = selectedProfileKey;
    }
    if (selectedManageKey) {
      adminManageProfileSelect.value = selectedManageKey;
    }
  }

  // --- Simulated Download / Acessar Loader Action ---
  function triggerSimulatedAction(btnElement, targetUrl, originalText, bypassLead = false) {
    const isDownload = originalText.toLowerCase().includes("baixar") || 
                       originalText.toLowerCase().includes("luts") ||
                       originalText.toLowerCase().includes("download");
                       
    // Intercept with Lead Capture Form first if it is a download and we haven't bypassed it yet
    if (isDownload && !bypassLead) {
      pendingDownload = { btnElement, targetUrl, originalText };
      openLeadModal();
      return;
    }

    if (isDownload) {
      btnElement.classList.add("loading");
      btnElement.innerHTML = `Baixando...`;
      
      setTimeout(() => {
        btnElement.classList.remove("loading");
        btnElement.innerHTML = `✓ Concluído!`;
        
        setTimeout(() => {
          window.open(targetUrl, "_blank");
          setTimeout(() => {
            btnElement.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> ${originalText}`;
          }, 1000);
        }, 300);
      }, 1200);
    } else {
      btnElement.classList.add("loading");
      btnElement.innerHTML = `Abrindo...`;
      setTimeout(() => {
        btnElement.classList.remove("loading");
        btnElement.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> ${originalText}`;
        window.open(targetUrl, "_blank");
      }, 600);
    }
  }

  // --- Lead Modal Control ---
  function openLeadModal() {
    leadInstagramInput.value = "";
    leadEmailInput.value = "";
    leadModalBackdrop.classList.add("show");
    leadModal.classList.add("show");
  }

  function closeLeadModal() {
    leadModalBackdrop.classList.remove("show");
    leadModal.classList.remove("show");
    pendingDownload = null;
  }

  closeLeadModalBtn.addEventListener("click", closeLeadModal);
  leadModalBackdrop.addEventListener("click", closeLeadModal);

  // Submit Lead Form
  leadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let insta = leadInstagramInput.value.trim();
    const email = leadEmailInput.value.trim();
    
    if (!insta) {
      alert("Por favor, preencha o seu Instagram!");
      return;
    }
    
    // Formatting Instagram Handle
    if (!insta.startsWith("@")) {
      insta = "@" + insta;
    }
    
    // Save lead to LocalStorage
    const leads = JSON.parse(localStorage.getItem("marx_captured_leads")) || [];
    const newLead = {
      id: Date.now(),
      instagram: insta,
      email: email || "Não informado",
      item: pendingDownload ? pendingDownload.originalText : "Download Geral",
      date: new Date().toLocaleDateString("pt-BR")
    };
    leads.push(newLead);
    localStorage.setItem("marx_captured_leads", JSON.stringify(leads));
    
    // Close modal
    leadModalBackdrop.classList.remove("show");
    leadModal.classList.remove("show");
    
    // Run the pending download animation and redirect
    if (pendingDownload) {
      const { btnElement, targetUrl, originalText } = pendingDownload;
      pendingDownload = null;
      triggerSimulatedAction(btnElement, targetUrl, originalText, true); // bypassLead = true to execute download
    }
  });

  // --- Render Vertical Links in Home ---
  function renderVerticalLinks(profileKey) {
    verticalLinkContainer.innerHTML = "";
    
    const profiles = window.getProfilesData();
    const currentProfile = profiles[profileKey];
    
    if (!currentProfile) return;
    
    // 1. Profile Bio Intro Card
    const introCard = document.createElement("div");
    introCard.className = "profile-intro-banner";
    introCard.innerHTML = `
      <div class="profile-intro-name">${currentProfile.name}</div>
      <div class="profile-intro-bio">${currentProfile.bio || ""}</div>
    `;
    verticalLinkContainer.appendChild(introCard);
    
    // 2. Link Cards Stack
    if (!currentProfile.links || currentProfile.links.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.style.textAlign = "center";
      emptyMsg.style.color = "var(--text-sub)";
      emptyMsg.style.padding = "40px 0";
      emptyMsg.style.fontSize = "0.9rem";
      emptyMsg.textContent = "Nenhum link cadastrado para este perfil.";
      verticalLinkContainer.appendChild(emptyMsg);
      return;
    }
    
    currentProfile.links.forEach((link, index) => {
      const card = document.createElement("div");
      card.className = "link-card";
      card.style.animationDelay = `${index * 0.08}s`;
      
      const banner = document.createElement("div");
      banner.className = "link-card-banner";
      if (link.banner) {
        banner.style.backgroundImage = `url('${convertGoogleDriveLink(link.banner)}')`;
      }
      card.appendChild(banner);
      
      const body = document.createElement("div");
      body.className = "link-card-body";
      
      const title = document.createElement("h3");
      title.className = "link-card-title";
      title.textContent = link.title;
      body.appendChild(title);
      
      const desc = document.createElement("p");
      desc.className = "link-card-desc";
      desc.textContent = link.desc;
      body.appendChild(desc);
      
      const btn = document.createElement("button");
      btn.className = "link-card-btn";
      btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> ${link.btnText || "Acessar Link"}`;
      
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        triggerSimulatedAction(btn, link.url, link.btnText || "Acessar Link");
      });
      
      body.appendChild(btn);
      card.appendChild(body);
      
      card.addEventListener("click", () => {
        btn.click();
      });
      
      verticalLinkContainer.appendChild(card);
    });
  }

  // --- Bottom Nav Tab Routing ---
  const navItems = document.querySelectorAll(".bottom-nav .nav-item");
  navItems.forEach(navBtn => {
    navBtn.addEventListener("click", () => {
      const targetTab = navBtn.getAttribute("data-tab");
      
      navItems.forEach(btn => btn.classList.remove("active"));
      navBtn.classList.add("active");
      
      homeView.style.display = "none";
      searchView.classList.remove("active");
      downloadsView.classList.remove("active");
      
      if (targetTab === "home") {
        homeView.style.display = "block";
        renderVerticalLinks(activeProfileKey);
        scrollContent.scrollTop = 0;
      } else if (targetTab === "search") {
        searchView.classList.add("active");
        searchInput.focus();
        renderSearchResults(searchInput.value);
      } else if (targetTab === "downloads") {
        downloadsView.classList.add("active");
      } else if (targetTab === "profiles") {
        mainApp.classList.remove("show");
        profileScreen.classList.remove("hide");
        setTimeout(() => {
          navItems.forEach(btn => btn.classList.remove("active"));
          document.querySelector('[data-tab="home"]').classList.add("active");
          homeView.style.display = "block";
        }, 500);
      }
    });
  });

  // Header quick triggers
  searchTrigger.addEventListener("click", () => {
    document.querySelector('[data-tab="search"]').click();
  });
  
  downloadTriggerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    triggerSimulatedAction(downloadTriggerBtn, "#", "LUTs & Presets");
  });

  // --- Inline Search Logic ---
  function getFlatLinksList() {
    const profiles = window.getProfilesData();
    const flatList = [];
    Object.keys(profiles).forEach(key => {
      if (profiles[key].links) {
        profiles[key].links.forEach(link => {
          if (!flatList.some(item => item.id === link.id)) {
            flatList.push(link);
          }
        });
      }
    });
    return flatList;
  }

  function renderSearchResults(query) {
    searchResults.innerHTML = "";
    const links = getFlatLinksList();
    
    const filtered = links.filter(link => {
      const matchTitle = link.title.toLowerCase().includes(query.toLowerCase());
      const matchDesc = link.desc.toLowerCase().includes(query.toLowerCase());
      return matchTitle || matchDesc;
    });
    
    if (filtered.length === 0) {
      searchResults.innerHTML = `<div style="text-align: center; color: var(--text-sub); padding: 40px 0; font-size: 0.85rem;">Nenhum link encontrado para "${query}"</div>`;
      return;
    }
    
    filtered.forEach(link => {
      const row = document.createElement("div");
      row.className = "result-row";
      
      const thumb = document.createElement("div");
      thumb.className = "result-thumb";
      if (link.banner) {
        thumb.style.backgroundImage = `url('${convertGoogleDriveLink(link.banner)}')`;
      }
      
      const title = document.createElement("div");
      title.className = "result-title";
      title.textContent = link.title;
      
      const playBtn = document.createElement("button");
      playBtn.className = "result-play-btn";
      playBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
      
      row.appendChild(thumb);
      row.appendChild(title);
      row.appendChild(playBtn);
      
      row.addEventListener("click", () => {
        triggerSimulatedAction(playBtn, link.url, link.title);
      });
      
      searchResults.appendChild(row);
    });
  }
  
  searchInput.addEventListener("input", (e) => {
    renderSearchResults(e.target.value);
  });


  // --- SUPER USER (ADMIN PANEL) CONTROLLER ---
  
  // SHA-256 Hashing helper
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  
  // Gate check
  manageProfilesBtn.addEventListener("click", () => {
    triggerAdminAuth(false);
  });

  async function triggerAdminAuth(focusOnNewProfile = false) {
    const pwd = prompt("Digite a senha do Super Usuário:");
    if (pwd !== null) {
      const hash = await sha256(pwd);
      if (hash === "7daa1b2b4e91b247ae0fecb856e9a08f00d1e1a7193273419e9819504b73152e") {
        openAdminPanel(focusOnNewProfile);
      } else {
        alert("Senha incorreta!");
      }
    }
  }

  function openAdminPanel(focusOnNewProfile = false) {
    adminOverlay.classList.add("show");
    
    populateAdminSelects();
    renderAdminLinksList();
    renderAdminLeadsList(); // Load leads
    
    if (focusOnNewProfile) {
      adminManageProfileSelect.value = "[new]";
    } else {
      adminManageProfileSelect.value = "luts";
    }
    syncManageProfileFields();
  }

  function closeAdminPanel() {
    adminOverlay.classList.remove("show");
    renderProfilesGrid();
    renderVerticalLinks(activeProfileKey);
  }

  adminCloseBtn.addEventListener("click", closeAdminPanel);

  // --- Profile Editor CMS Actions ---
  adminManageProfileSelect.addEventListener("change", syncManageProfileFields);
  adminProfileIconSelect.addEventListener("change", toggleAvatarUrlField);
  
  function syncManageProfileFields() {
    const selectedKey = adminManageProfileSelect.value;
    const profiles = window.getProfilesData();
    const profile = profiles[selectedKey];
    
    if (selectedKey === "[new]") {
      adminProfileName.value = "";
      adminProfileBio.value = "";
      adminProfileIconSelect.value = "custom";
      adminProfileAvatarUrl.value = "";
      adminProfileAlignSelect.value = "center";
      adminProfileFitSelect.value = "cover";
      
      adminDeleteProfileBtn.style.display = "none";
      toggleAvatarUrlField();
    } else if (profile) {
      adminProfileName.value = profile.name;
      adminProfileBio.value = profile.bio || "";
      adminProfileIconSelect.value = profile.avatarType || "custom";
      adminProfileAvatarUrl.value = profile.avatarUrl || "";
      adminProfileAlignSelect.value = profile.avatarPosition || "center";
      adminProfileFitSelect.value = profile.avatarFit || "cover";
      
      const isCore = (profile.id === "luts" || profile.id === "mobile" || profile.id === "sony");
      adminDeleteProfileBtn.style.display = isCore ? "none" : "block";
      
      toggleAvatarUrlField();
    }
  }
  
  function toggleAvatarUrlField() {
    const isCustom = (adminProfileIconSelect.value === "custom");
    if (isCustom) {
      adminProfileAvatarUrl.style.display = "block";
      adminProfileAvatarUrlLabel.style.display = "block";
      adminProfileAlignSelect.style.display = "block";
      adminProfileAlignLabel.style.display = "block";
      adminProfileFitSelect.style.display = "block";
      adminProfileFitLabel.style.display = "block";
    } else {
      adminProfileAvatarUrl.style.display = "none";
      adminProfileAvatarUrlLabel.style.display = "none";
      adminProfileAlignSelect.style.display = "none";
      adminProfileAlignLabel.style.display = "none";
      adminProfileFitSelect.style.display = "none";
      adminProfileFitLabel.style.display = "none";
    }
  }
  
  adminSaveProfileBtn.addEventListener("click", () => {
    const nameVal = adminProfileName.value.trim();
    const bioVal = adminProfileBio.value.trim();
    const iconVal = adminProfileIconSelect.value;
    const avatarUrlVal = adminProfileAvatarUrl.value.trim();
    const alignVal = adminProfileAlignSelect.value;
    const fitVal = adminProfileFitSelect.value;
    
    if (!nameVal) {
      alert("Por favor, digite o nome do perfil!");
      return;
    }
    
    const selectedKey = adminManageProfileSelect.value;
    const profiles = window.getProfilesData();
    
    if (selectedKey === "[new]") {
      const newKey = "profile_" + Date.now();
      profiles[newKey] = {
        id: newKey,
        name: nameVal,
        bio: bioVal,
        avatarType: iconVal,
        avatarUrl: iconVal === "custom" ? convertGoogleDriveLink(avatarUrlVal) : "",
        avatarPosition: iconVal === "custom" ? alignVal : "center",
        avatarFit: iconVal === "custom" ? fitVal : "cover",
        links: []
      };
      
      window.saveProfilesData(profiles);
      alert("Perfil criado com sucesso!");
      
      populateAdminSelects(newKey, newKey);
      syncManageProfileFields();
    } else if (profiles[selectedKey]) {
      profiles[selectedKey].name = nameVal;
      profiles[selectedKey].bio = bioVal;
      profiles[selectedKey].avatarType = iconVal;
      profiles[selectedKey].avatarUrl = iconVal === "custom" ? convertGoogleDriveLink(avatarUrlVal) : "";
      profiles[selectedKey].avatarPosition = iconVal === "custom" ? alignVal : "center";
      profiles[selectedKey].avatarFit = iconVal === "custom" ? fitVal : "cover";
      
      window.saveProfilesData(profiles);
      alert("Perfil atualizado com sucesso!");
      
      populateAdminSelects(selectedKey, selectedKey);
      syncManageProfileFields();
      
      if (selectedKey === activeProfileKey) {
        updateHeaderAvatar(activeProfileKey);
      }
    }
    
    renderProfilesGrid();
  });
  
  adminDeleteProfileBtn.addEventListener("click", () => {
    const selectedKey = adminManageProfileSelect.value;
    
    if (selectedKey === "luts" || selectedKey === "mobile" || selectedKey === "sony") {
      alert("Este é um perfil do sistema e não pode ser excluído.");
      return;
    }
    
    if (confirm("Tem certeza que deseja excluir permanentemente este perfil e todos os links dele?")) {
      const profiles = window.getProfilesData();
      delete profiles[selectedKey];
      
      window.saveProfilesData(profiles);
      alert("Perfil excluído com sucesso!");
      
      populateAdminSelects("luts", "luts");
      syncManageProfileFields();
      renderProfilesGrid();
    }
  });

  // --- Links Editor Actions ---
  adminProfileSelect.addEventListener("change", () => {
    renderAdminLinksList();
  });

  function renderAdminLinksList() {
    adminLinksList.innerHTML = "";
    const selectedProfile = adminProfileSelect.value;
    const profiles = window.getProfilesData();
    const profile = profiles[selectedProfile];
    
    if (!profile || !profile.links || profile.links.length === 0) {
      adminLinksList.innerHTML = `<div style="text-align: center; color: var(--text-sub); font-size: 0.8rem; padding: 20px 0;">Nenhum link cadastrado neste perfil.</div>`;
      return;
    }
    
    profile.links.forEach(link => {
      const item = document.createElement("div");
      item.className = "admin-link-item";
      
      const thumb = document.createElement("div");
      thumb.className = "admin-link-item-thumb";
      if (link.banner) {
        thumb.style.backgroundImage = `url('${convertGoogleDriveLink(link.banner)}')`;
      }
      
      const title = document.createElement("div");
      title.className = "admin-link-item-title";
      title.textContent = link.title;
      
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "admin-link-delete-btn";
      deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
      
      deleteBtn.addEventListener("click", () => {
        deleteLink(selectedProfile, link.id);
      });
      
      item.appendChild(thumb);
      item.appendChild(title);
      item.appendChild(deleteBtn);
      
      adminLinksList.appendChild(item);
    });
  }

  function deleteLink(profileKey, linkId) {
    const profiles = window.getProfilesData();
    const profile = profiles[profileKey];
    
    if (profile && profile.links) {
      profile.links = profile.links.filter(l => l.id !== linkId);
      window.saveProfilesData(profiles);
      renderAdminLinksList();
    }
  }

  adminAddLinkBtn.addEventListener("click", () => {
    const titleVal = adminLinkTitle.value.trim();
    const descVal = adminLinkDesc.value.trim();
    const urlVal = adminLinkUrl.value.trim();
    const bannerVal = adminLinkBanner.value.trim();
    
    if (!titleVal || !urlVal) {
      alert("Por favor, preencha Título e URL!");
      return;
    }
    
    const selectedProfile = adminProfileSelect.value;
    const profiles = window.getProfilesData();
    
    const newLink = {
      id: "link_" + Date.now(),
      title: titleVal,
      desc: descVal,
      url: urlVal,
      banner: convertGoogleDriveLink(bannerVal),
      btnText: "Acessar Link"
    };
    
    if (!profiles[selectedProfile].links) {
      profiles[selectedProfile].links = [];
    }
    
    profiles[selectedProfile].links.push(newLink);
    window.saveProfilesData(profiles);
    
    adminLinkTitle.value = "";
    adminLinkDesc.value = "";
    adminLinkUrl.value = "";
    adminLinkBanner.value = "";
    
    renderAdminLinksList();
  });


  // --- SUPER USER: LEADS TRACKER CMS ---
  
  function renderAdminLeadsList() {
    adminLeadsList.innerHTML = "";
    const leads = JSON.parse(localStorage.getItem("marx_captured_leads")) || [];
    
    adminLeadsTitle.textContent = `Leads Capturados (${leads.length})`;
    
    if (leads.length === 0) {
      adminLeadsList.innerHTML = `<div style="text-align: center; color: var(--text-sub); font-size: 0.8rem; padding: 20px 0;">Nenhum lead capturado ainda.</div>`;
      return;
    }
    
    // Render descending (most recent first)
    [...leads].reverse().forEach(lead => {
      const item = document.createElement("div");
      item.className = "admin-link-item";
      item.style.flexDirection = "column";
      item.style.alignItems = "flex-start";
      item.style.gap = "4px";
      item.style.padding = "10px 12px";
      
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; width:100%; font-size:0.8rem; font-weight:700;">
          <span style="color:var(--netflix-red);">${lead.instagram}</span>
          <span style="color:var(--text-sub); font-weight:400; font-size:0.7rem;">${lead.date}</span>
        </div>
        <div style="font-size:0.75rem; color:#dddddd; word-break:break-all;">E-mail: ${lead.email}</div>
        <div style="font-size:0.7rem; color:var(--text-sub);">Baixou: ${lead.item}</div>
      `;
      adminLeadsList.appendChild(item);
    });
  }

  // Clear leads database
  adminClearLeadsBtn.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja apagar permanentemente toda a lista de leads capturados?")) {
      localStorage.removeItem("marx_captured_leads");
      renderAdminLeadsList();
      alert("Lista de leads limpa!");
    }
  });

  // Export leads to CSV (Copy to Clipboard)
  adminExportLeadsBtn.addEventListener("click", () => {
    const leads = JSON.parse(localStorage.getItem("marx_captured_leads")) || [];
    if (leads.length === 0) {
      alert("Nenhum lead disponível para exportação!");
      return;
    }
    
    // Build CSV Content
    let csvContent = "Data,Instagram,Email,Item Baixado\n";
    leads.forEach(lead => {
      // Escape commas to avoid shifting columns in Excel
      const cleanInsta = lead.instagram.replace(/"/g, '""');
      const cleanEmail = lead.email.replace(/"/g, '""');
      const cleanItem = lead.item.replace(/"/g, '""');
      csvContent += `"${lead.date}","${cleanInsta}","${cleanEmail}","${cleanItem}"\n`;
    });
    
    // Copy to clipboard
    navigator.clipboard.writeText(csvContent)
      .then(() => {
        alert("Lista de leads copiada com sucesso no formato CSV!\n\nAbra o Excel ou Bloco de Notas e aperte CTRL+V para colar.");
      })
      .catch(err => {
        console.error("Clipboard copy failed:", err);
        alert("Erro ao copiar CSV para a área de transferência. Veja o console.");
      });
  });
});
