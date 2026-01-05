const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 120;
const mouse = { x: 0, y: 0 };

class Particle {
  constructor() {
    this.reset();
    this.y = Math.random() * canvas.height;
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.speed = Math.random() * 0.5 + 0.2;
    this.size = Math.random() * 2 + 1;
    this.opacity = Math.random() * 0.5 + 0.3;
  }

  update() {
    this.y += this.speed;
    
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 100) {
      const angle = Math.atan2(dy, dx);
      this.x -= Math.cos(angle) * 0.5;
      this.y -= Math.sin(angle) * 0.5;
    }

    if (this.y > canvas.height) this.reset();
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(139, 92, 246, ${this.opacity})`;
    ctx.fill();
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

const bioTexts = [
  "Contact Me @ neoswag@neoswag.win"
  "Discord Server: https://discord.gg/odbc",
  "Yeat & Hi-C ",
  "Cool People: Polar"
];
let bioIdx = 0;
let charIdx = 0;
let isDeleting = false;
let typeSpeed = 80;

function typeBio() {
  const el = document.getElementById('bioText');
  const current = bioTexts[bioIdx];
  
  if (isDeleting) {
    el.textContent = current.substring(0, charIdx - 1);
    charIdx--;
    typeSpeed = 40;
  } else {
    el.textContent = current.substring(0, charIdx + 1);
    charIdx++;
    typeSpeed = 80;
  }

  if (!isDeleting && charIdx === current.length) {
    typeSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    bioIdx = (bioIdx + 1) % bioTexts.length;
    typeSpeed = 500;
  }
  
  setTimeout(typeBio, typeSpeed);
}

const titles = ["n", "ne", "neo"];
let titleIdx = 0;
let titleFwd = true;

function animateTitle() {
  document.title = titles[titleIdx];
  
  if (titleFwd) {
    titleIdx++;
    if (titleIdx === titles.length - 1) titleFwd = false;
  } else {
    titleIdx--;
    if (titleIdx === 0) titleFwd = true;
  }
  
  setTimeout(animateTitle, 150);
}

let spotifyInterval = null;

async function updatePresence() {
  try {
    const res = await fetch('https://api.lanyard.rest/v1/users/1363253536095211531');
    const data = await res.json();
    if (!data.success) return;
    
    const d = data.data;
    const status = d.discord_status;
    
    document.getElementById('statusIndicator').className = `status-indicator ${status}`;

    if (d.discord_user) {
      const user = d.discord_user;
      const display = user.display_name || user.username;
      const avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
      
      document.getElementById('username').textContent = display;
      document.getElementById('handle').textContent = `@${user.username}`;
      document.getElementById('avatar').style.backgroundImage = `url('${avatar}')`;
    }

    const customActivity = d.activities.find(a => a.type === 4);
    const customEl = document.getElementById('customStatus');
    const contentEl = document.getElementById('statusContent');
    
    if (customActivity) {
      let html = '';
      if (customActivity.emoji) {
        if (customActivity.emoji.id) {
          html += `<img src="https://cdn.discordapp.com/emojis/${customActivity.emoji.id}.${customActivity.emoji.animated ? 'gif' : 'png'}" alt="">`;
        } else {
          html += `<span style="font-size:24px">${customActivity.emoji.name}</span>`;
        }
      }
      if (customActivity.state) html += `<span>${customActivity.state}</span>`;
      contentEl.innerHTML = html;
      customEl.style.display = 'block';
    } else {
      customEl.style.display = 'none';
    }

    const container = document.getElementById('activities');
    container.innerHTML = '';

    if (spotifyInterval) {
      clearInterval(spotifyInterval);
      spotifyInterval = null;
    }

    if (d.listening_to_spotify && d.spotify) {
      const sp = d.spotify;
      const card = document.createElement('div');
      card.className = 'activity-card';
      
      const total = sp.timestamps.end - sp.timestamps.start;
      
      card.innerHTML = `
        <div class="spotify-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Spotify
        </div>
        <div class="activity-header">
          <img src="${sp.album_art_url}" class="activity-icon" alt="">
          <div class="activity-info">
            <div class="activity-name">${sp.song}</div>
            <div class="activity-details">${sp.artist}</div>
            <div class="activity-state">${sp.album}</div>
          </div>
        </div>
        <div class="progress-bar">
          <span class="time-start">0:00</span>
          <div class="bar">
            <div class="bar-fill" style="width:0%"></div>
          </div>
          <span class="time-end">${formatTime(total)}</span>
        </div>
      `;
      
      container.appendChild(card);

      const updateSpotify = () => {
        const elapsed = Date.now() - sp.timestamps.start;
        const progress = Math.min((elapsed / total) * 100, 100);
        
        const fill = card.querySelector('.bar-fill');
        const start = card.querySelector('.time-start');
        
        if (fill) fill.style.width = progress + '%';
        if (start) start.textContent = formatTime(elapsed);
        
        if (progress >= 100) updatePresence();
      };

      updateSpotify();
      spotifyInterval = setInterval(updateSpotify, 1000);
    }

    const activities = d.activities.filter(a => a.type !== 4 && a.name !== 'Spotify');
    
    activities.forEach(act => {
      const card = document.createElement('div');
      card.className = 'activity-card';
      
      let icon = '';
      if (act.assets?.large_image) {
        if (act.assets.large_image.startsWith('mp:')) {
          icon = `https://media.discordapp.net/${act.assets.large_image.slice(3)}`;
        } else if (act.application_id) {
          icon = `https://cdn.discordapp.com/app-assets/${act.application_id}/${act.assets.large_image}.png`;
        }
      }

      let elapsed = '';
      if (act.timestamps?.start) {
        const time = Date.now() - act.timestamps.start;
        elapsed = `<div class="activity-state">${formatTime(time)} elapsed</div>`;
      }

      card.innerHTML = `
        <div class="activity-header">
          ${icon ? `<img src="${icon}" class="activity-icon" alt="">` : '<div class="activity-icon"></div>'}
          <div class="activity-info">
            <div class="activity-name">${act.name}</div>
            ${act.details ? `<div class="activity-details">${act.details}</div>` : ''}
            ${act.state && !act.timestamps?.start ? `<div class="activity-state">${act.state}</div>` : elapsed}
          </div>
        </div>
      `;
      
      container.appendChild(card);
    });

    document.getElementById('desktopIcon').classList.toggle('active', d.active_on_discord_desktop);
    document.getElementById('mobileIcon').classList.toggle('active', d.active_on_discord_mobile);
    document.getElementById('webIcon').classList.toggle('active', d.active_on_discord_web);

  } catch (err) {
    console.error(err);
  }
}

function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min}:${s.toString().padStart(2, '0')}`;
}

typeBio();
animateTitle();
updatePresence();
setInterval(updatePresence, 3000);
