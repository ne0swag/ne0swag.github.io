const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  canvas: document.getElementById('canvas3d'), 
  alpha: true,
  antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);

const particles = new THREE.BufferGeometry();
const pCount = 3500;
const positions = new Float32Array(pCount * 3);
const colors = new Float32Array(pCount * 3);

for(let i = 0; i < pCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 250;
  positions[i + 1] = (Math.random() - 0.5) * 250;
  positions[i + 2] = (Math.random() - 0.5) * 250;
  
  const c = new THREE.Color();
  c.setHSL(0.65 + Math.random() * 0.1, 0.65, 0.55);
  colors[i] = c.r;
  colors[i + 1] = c.g;
  colors[i + 2] = c.b;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const pMaterial = new THREE.PointsMaterial({
  size: 1.2,
  vertexColors: true,
  transparent: true,
  opacity: 0.7,
  blending: THREE.AdditiveBlending
});

const pMesh = new THREE.Points(particles, pMaterial);
scene.add(pMesh);

const geo = new THREE.IcosahedronGeometry(12, 1);
const mat = new THREE.MeshStandardMaterial({
  color: 0x667eea,
  wireframe: true,
  emissive: 0x667eea,
  emissiveIntensity: 0.25
});
const ico = new THREE.Mesh(geo, mat);
scene.add(ico);

const light1 = new THREE.PointLight(0x667eea, 1.8, 90);
light1.position.set(25, 25, 25);
scene.add(light1);

const light2 = new THREE.PointLight(0x764ba2, 1.8, 90);
light2.position.set(-25, -25, 25);
scene.add(light2);

camera.position.z = 65;

let mx = 0, my = 0;

document.addEventListener('mousemove', e => {
  mx = (e.clientX / window.innerWidth) * 2 - 1;
  my = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate3D() {
  requestAnimationFrame(animate3D);
  ico.rotation.x += 0.002;
  ico.rotation.y += 0.004;
  pMesh.rotation.y += 0.0004;
  camera.position.x += (mx * 8 - camera.position.x) * 0.04;
  camera.position.y += (my * 8 - camera.position.y) * 0.04;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

animate3D();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

async function loopTitleChange() {
  const names = ["n", "ne", "neo"];
  let idx = 0;
  let fwd = true;

  while (true) {
    document.title = names[idx];
    await new Promise(r => setTimeout(r, 160));
    if (fwd) {
      idx++;
      if (idx === names.length - 1) fwd = false;
    } else {
      idx--;
      if (idx === 0) fwd = true;
    }
  }
}

loopTitleChange();

const texts = [
  "Learning More About Website Security",
  "Yeat Is Better",
  "Orion Drift Basketball",
  "Cool People: Polar, Pine"
];
let txtIdx = 0;
let charIdx = 0;
let isDel = false;
let typeSpeed = 90;

function typeEffect() {
  const cur = texts[txtIdx];
  const el = document.getElementById('typingText');
  
  if (isDel) {
    el.innerHTML = cur.substring(0, charIdx - 1) + '<span class="typing-cursor"></span>';
    charIdx--;
    typeSpeed = 45;
  } else {
    el.innerHTML = cur.substring(0, charIdx + 1) + '<span class="typing-cursor"></span>';
    charIdx++;
    typeSpeed = 90;
  }

  if (!isDel && charIdx === cur.length) {
    typeSpeed = 1800;
    isDel = true;
  } else if (isDel && charIdx === 0) {
    isDel = false;
    txtIdx = (txtIdx + 1) % texts.length;
    typeSpeed = 450;
  }
  
  setTimeout(typeEffect, typeSpeed);
}

let spotifyUpdateInterval = null;

async function updateDiscordPresence() {
  try {
    const resp = await fetch('https://api.lanyard.rest/v1/users/1363253536095211531');
    const data = await resp.json();
    if (!data.success) return;
    const d = data.data;

    const status = d.discord_status;
    document.getElementById('statusBadge').className = `status-badge ${status}`;
    document.getElementById('discordStatusDot').className = `discord-status-dot ${status}`;

    if (d.discord_user) {
      const username = d.discord_user.username;
      const display = d.discord_user.display_name || username;
      document.getElementById('username').textContent = display;
      document.getElementById('discordName').textContent = display;
      document.getElementById('discordHandle').textContent = `@${username}`;

      const uid = d.discord_user.id;
      const avatarHash = d.discord_user.avatar;
      const avatarUrl = `https://cdn.discordapp.com/avatars/${uid}/${avatarHash}.png?size=256`;
      document.getElementById('avatar').style.backgroundImage = `url('${avatarUrl}')`;
      document.getElementById('discordAvatar').style.backgroundImage = `url('${avatarUrl}')`;
    }

    const custom = d.activities.find(a => a.type === 4);
    const customCard = document.getElementById('customStatusCard');
    const customContent = document.getElementById('customStatusContent');
    
    if (custom) {
      let html = '';
      if (custom.emoji) {
        if (custom.emoji.id) {
          const url = `https://cdn.discordapp.com/emojis/${custom.emoji.id}.${custom.emoji.animated ? 'gif' : 'png'}`;
          html += `<img src="${url}" alt="${custom.emoji.name}">`;
        } else {
          html += `<span style="font-size: 26px;">${custom.emoji.name}</span>`;
        }
      }
      if (custom.state) html += `<span>${custom.state}</span>`;
      customContent.innerHTML = html;
      customCard.style.display = 'block';
    } else {
      customCard.style.display = 'none';
    }

    const container = document.getElementById('activitiesContainer');
    container.innerHTML = '';

    if (spotifyUpdateInterval) {
      clearInterval(spotifyUpdateInterval);
      spotifyUpdateInterval = null;
    }

    if (d.listening_to_spotify && d.spotify) {
      const sp = d.spotify;
      const card = document.createElement('div');
      card.className = 'activity-card';
      card.innerHTML = `
        <div class="spotify-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Spotify
        </div>
        <div class="activity-header">
          <img src="${sp.album_art_url}" class="activity-icon" alt="Album">
          <div class="activity-info">
            <div class="activity-name">${sp.song}</div>
            <div class="activity-details">${sp.artist}</div>
            <div class="activity-state">${sp.album}</div>
          </div>
        </div>
        <div class="activity-time">
          <span class="spotify-elapsed">0:00</span>
          <div class="time-bar">
            <div class="time-progress" style="width: 0%"></div>
          </div>
          <span class="spotify-total">${formatTime(sp.timestamps.end - sp.timestamps.start)}</span>
        </div>
      `;
      container.appendChild(card);

      const updateSpotify = () => {
        const elapsed = Date.now() - sp.timestamps.start;
        const total = sp.timestamps.end - sp.timestamps.start;
        const progress = Math.min((elapsed / total) * 100, 100);
        
        const progressBar = card.querySelector('.time-progress');
        const elapsedSpan = card.querySelector('.spotify-elapsed');
        
        if (progressBar) progressBar.style.width = progress + '%';
        if (elapsedSpan) elapsedSpan.textContent = formatTime(elapsed);
        
        if (progress >= 100) updateDiscordPresence();
      };

      updateSpotify();
      spotifyUpdateInterval = setInterval(updateSpotify, 1000);
    }

    const otherActivities = d.activities.filter(a => a.type !== 4 && a.name !== 'Spotify');
    otherActivities.forEach(activity => {
      const card = document.createElement('div');
      card.className = 'activity-card';
      
      let iconUrl = '';
      if (activity.assets && activity.assets.large_image) {
        if (activity.assets.large_image.startsWith('mp:')) {
          iconUrl = `https://media.discordapp.net/${activity.assets.large_image.slice(3)}`;
        } else if (activity.application_id) {
          iconUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
        }
      }

      let timeHtml = '';
      if (activity.timestamps && activity.timestamps.start) {
        const elapsed = Date.now() - activity.timestamps.start;
        timeHtml = `<div class="activity-time">${formatTime(elapsed)} elapsed</div>`;
      }

      card.innerHTML = `
        <div class="activity-header">
          ${iconUrl ? `<img src="${iconUrl}" class="activity-icon" alt="${activity.name}">` : '<div class="activity-icon"></div>'}
          <div class="activity-info">
            <div class="activity-name">${activity.name}</div>
            ${activity.details ? `<div class="activity-details">${activity.details}</div>` : ''}
            ${activity.state ? `<div class="activity-state">${activity.state}</div>` : ''}
          </div>
        </div>
        ${timeHtml}
      `;
      container.appendChild(card);
    });

    document.getElementById('desktopIcon').classList.toggle('active', d.active_on_discord_desktop);
    document.getElementById('mobileIcon').classList.toggle('active', d.active_on_discord_mobile);
    document.getElementById('webIcon').classList.toggle('active', d.active_on_discord_web);

  } catch (err) {
    console.error('Discord presence error:', err);
  }
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

typeEffect();
updateDiscordPresence();
setInterval(updateDiscordPresence, 3000);
