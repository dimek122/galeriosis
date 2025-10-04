// Ambil elemen DOM utama
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const toggleViewBtn = document.getElementById('toggleViewBtn');

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let filteredPhotos = [...photos];
let currentView = 'grid'; // 'grid' atau 'list'
let currentLightboxIndex = null;

// Fungsi untuk membuat elemen foto (photo card)
function createPhotoCard(photo) {
  const card = document.createElement('article');
  card.className = 'photo-card';
  card.tabIndex = 0;
  card.setAttribute('data-id', photo.id);
  card.setAttribute('data-category', photo.category);
  card.setAttribute('data-alt', photo.alt.toLowerCase());
  card.setAttribute('data-desc', photo.description.toLowerCase());
  card.setAttribute('data-date', photo.date);

  // Gambar dengan lazy loading
  const img = document.createElement('img');
  img.dataset.src = photo.src; // untuk lazy loading
  img.alt = photo.alt;
  img.loading = 'lazy'; // fallback browser

  card.appendChild(img);

  if (currentView === 'list') {
    const info = document.createElement('div');
    info.className = 'photo-info';

    const title = document.createElement('h3');
    title.textContent = photo.alt;

    const desc = document.createElement('p');
    desc.textContent = `${photo.date} - ${photo.description}`;

    info.appendChild(title);
    info.appendChild(desc);
    card.appendChild(info);
  }

  // Event klik dan keyboard enter untuk buka lightbox
  card.addEventListener('click', () => openLightbox(photo.id));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(photo.id);
    }
  });

  return card;
}

// Render galeri berdasarkan filteredPhotos dan currentView
function renderGallery() {
  gallery.innerHTML = '';
  gallery.className = currentView === 'grid' ? 'grid-view' : 'list-view';

  filteredPhotos.forEach(photo => {
    const card = createPhotoCard(photo);
    gallery.appendChild(card);
  });

  // Setelah render, jalankan lazy loading manual
  lazyLoadImages();
}

// Lazy loading manual menggunakan IntersectionObserver
function lazyLoadImages() {
  const images = gallery.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });

    images.forEach(img => observer.observe(img));
  } else {
    // Fallback: muat semua gambar langsung
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// Filter dan pencarian
function filterPhotos() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  filteredPhotos = photos.filter(photo => {
    const matchesCategory = category === 'all' || photo.category === category;
    const matchesSearch =
      photo.alt.toLowerCase().includes(searchTerm) ||
      photo.description.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  renderGallery();
}

// Toggle mode tampilan grid/list
function toggleView() {
  if (currentView === 'grid') {
    currentView = 'list';
    toggleViewBtn.textContent = 'Mode Grid';
    toggleViewBtn.setAttribute('aria-pressed', 'true');
  } else {
    currentView = 'grid';
    toggleViewBtn.textContent = 'Mode List';
    toggleViewBtn.setAttribute('aria-pressed', 'false');
  }
  renderGallery();
}

// Lightbox functions
function openLightbox(photoId) {
  currentLightboxIndex = filteredPhotos.findIndex(p => p.id === photoId);
  if (currentLightboxIndex === -1) return;

  updateLightbox();
  lightbox.setAttribute('aria-hidden', 'false');
  lightbox.style.display = 'flex';
  lightbox.focus();
  document.body.style.overflow = 'hidden'; // disable scroll
}

function closeLightbox() {
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.style.display = 'none';
  document.body.style.overflow = '';
}

function updateLightbox() {
  const photo = filteredPhotos[currentLightboxIndex];
  if (!photo) return;

  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.alt;
  lightboxCaption.textContent = `${photo.date} - ${photo.description}`;
}

function showPrevPhoto() {
  if (currentLightboxIndex === null) return;
  currentLightboxIndex =
    (currentLightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
  updateLightbox();
}

function showNextPhoto() {
  if (currentLightboxIndex === null) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % filteredPhotos.length;
  updateLightbox();
}

// Event Listeners
searchInput.addEventListener('input', filterPhotos);
categoryFilter.addEventListener('change', filterPhotos);
toggleViewBtn.addEventListener('click', toggleView);

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrevPhoto);
lightboxNext.addEventListener('click', showNextPhoto);

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
  if (lightbox.getAttribute('aria-hidden') === 'false') {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showPrevPhoto();
    } else if (e.key === 'ArrowRight') {
      showNextPhoto();
    }
  }
});

// Inisialisasi galeri saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
  renderGallery();
});

// Music Player
const audioPlayer = document.getElementById('audioPlayer');
const musicToggleBtn = document.getElementById('musicToggleBtn');

musicToggleBtn.addEventListener('click', () => {
  if (audioPlayer.paused) {
    audioPlayer.play().then(() => {
      musicToggleBtn.textContent = '⏸️ Jeda Musik';
      musicToggleBtn.setAttribute('aria-pressed', 'true');
      musicToggleBtn.setAttribute('aria-label', 'Jeda musik kenangan OSIS');
    }).catch(err => {
      // Jika autoplay diblokir, beri tahu pengguna
      alert('Pemutaran musik otomatis diblokir oleh browser. Silakan klik tombol lagi untuk memulai.');
    });
  } else {
    audioPlayer.pause();
    musicToggleBtn.textContent = '▶️ Putar Musik';
    musicToggleBtn.setAttribute('aria-pressed', 'false');
    musicToggleBtn.setAttribute('aria-label', 'Putar musik kenangan OSIS');
  }
});

// Jika musik selesai (tidak loop), reset tombol (opsional)
// audioPlayer.addEventListener('ended', () => {
//   musicToggleBtn.textContent = '▶️ Putar Musik';
//   musicToggleBtn.setAttribute('aria-pressed', 'false');
//   musicToggleBtn.setAttribute('aria-label', 'Putar musik kenangan OSIS');
// });