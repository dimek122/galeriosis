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

let filteredPhotos = [...photos]; // Copy dari photos.js
let currentView = 'grid'; // 'grid' atau 'list'
let currentLightboxIndex = null;

// Music Player - Fitur pilih lagu
const audioPlayer = document.getElementById('audioPlayer');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicSelect = document.getElementById('musicSelect');

// Daftar lagu lokal (sesuaikan dengan file di folder music/)
const musicTracks = [
  { value: 'kenangan.mp3', label: 'Kenangan (Default)' },
  { value: 'nostalgia.mp3', label: 'Nostalgia' },
  { value: 'inspirasi.mp3', label: 'Inspirasi' }
  // Tambah lagu baru: { value: 'namafile.mp3', label: 'Nama Lagu' }
];

// Inisialisasi select lagu
function initMusicSelect() {
  musicSelect.innerHTML = '<option value="">Pilih Lagu</option>';
  musicTracks.forEach(track => {
    const option = document.createElement('option');
    option.value = track.value;
    option.textContent = track.label;
    musicSelect.appendChild(option);
  });
  // Set default lagu pertama
  if (musicTracks.length > 0) {
    musicSelect.value = musicTracks[0].value;
    audioPlayer.src = `music/${musicTracks[0].value}`;
  }
}

// Update src audio berdasarkan select
function updateAudioSrc() {
  const selectedValue = musicSelect.value;
  if (selectedValue) {
    audioPlayer.src = `music/${selectedValue}`;
    audioPlayer.pause(); // Pause jika sedang play
    musicToggleBtn.textContent = '▶️ Putar Musik';
    musicToggleBtn.setAttribute('aria-pressed', 'false');
    musicToggleBtn.setAttribute('aria-label', 'Putar musik kenangan OSIS');
  }
}

// Event listener untuk music select
musicSelect.addEventListener('change', updateAudioSrc);

// Music Player toggle (update dengan check select)
musicToggleBtn.addEventListener('click', () => {
  if (!musicSelect.value) {
    alert('Silakan pilih lagu terlebih dahulu!');
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play().then(() => {
      musicToggleBtn.textContent = '⏸️ Jeda Musik';
      musicToggleBtn.setAttribute('aria-pressed', 'true');
      musicToggleBtn.setAttribute('aria-label', 'Jeda musik kenangan OSIS');
    }).catch(err => {
      console.error('Error playing audio:', err);
      alert('Pemutaran musik diblokir oleh browser. Silakan klik tombol lagi untuk memulai.');
    });
  } else {
    audioPlayer.pause();
    musicToggleBtn.textContent = '▶️ Putar Musik';
    musicToggleBtn.setAttribute('aria-pressed', 'false');
    musicToggleBtn.setAttribute('aria-label', 'Putar musik kenangan OSIS');
  }
});

// Fungsi untuk membuat card foto
function createPhotoCard(photo, index) {
  const card = document.createElement('article');
  card.className = 'photo-card';
  card.setAttribute('tabindex', '0'); // Untuk keyboard navigation
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Lihat foto: ${photo.alt}`);

  // Gambar dengan lazy loading
  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = photo.alt;
  img.loading = 'lazy'; // Lazy loading untuk performa
  img.onerror = () => { img.src = 'images/placeholder.jpg'; }; // Fallback jika gambar error

  // Info foto
  const info = document.createElement('div');
  info.className = 'photo-info';
  info.innerHTML = `
    <h3>${photo.alt}</h3>
    <p>${photo.date} - ${photo.description}</p>
  `;

  card.appendChild(img);
  card.appendChild(info);

  // Event untuk buka lightbox
  card.addEventListener('click', () => openLightbox(index));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(index);
    }
  });

  return card;
}

// Fungsi render galeri
function renderGallery() {
  gallery.innerHTML = '';
  gallery.className = currentView === 'grid' ? 'grid-view' : 'list-view';

  if (filteredPhotos.length === 0) {
    const noResults = document.createElement('p');
    noResults.textContent = 'Tidak ada foto yang ditemukan.';
    noResults.style.textAlign = 'center';
    noResults.style.fontSize = '1.2rem';
    noResults.style.color = '#ffd6ba';
    noResults.style.padding = '2rem';
    gallery.appendChild(noResults);
    return;
  }

  filteredPhotos.forEach((photo, index) => {
    const card = createPhotoCard(photo, index);
    gallery.appendChild(card);
  });

  // Update ARIA live region
  gallery.setAttribute('aria-label', `${filteredPhotos.length} foto ditampilkan`);
}

// Fungsi filter foto (search + category)
function filterPhotos() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.alt.toLowerCase().includes(searchTerm) ||
                          photo.description.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  renderGallery();
}

// Fungsi toggle view (grid/list)
function toggleView() {
  currentView = currentView === 'grid' ? 'list' : 'grid';
  toggleViewBtn.textContent = currentView === 'grid' ? 'Mode List' : 'Mode Grid';
  toggleViewBtn.setAttribute('aria-pressed', currentView === 'list');
  renderGallery();
}

// Fungsi buka lightbox
function openLightbox(index) {
  currentLightboxIndex = index;
  const photo = filteredPhotos[index];
  if (!photo) return;

  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.alt;
  lightboxCaption.textContent = `${photo.alt} - ${photo.date}`;
  lightbox.setAttribute('aria-hidden', 'false');
  lightbox.focus(); // Untuk accessibility

  // Update tombol prev/next
  lightboxPrev.style.display = index > 0 ? 'block' : 'none';
  lightboxNext.style.display = index < filteredPhotos.length - 1 ? 'block' : 'none';
}

// Fungsi tutup lightbox
function closeLightbox() {
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  lightboxCaption.textContent = '';
  currentLightboxIndex = null;
  document.body.style.overflow = ''; // Restore scroll
}

// Fungsi navigasi lightbox
function navigateLightbox(direction) {
  if (currentLightboxIndex === null) return;
  const newIndex = currentLightboxIndex + (direction === 'prev' ? -1 : 1);
  if (newIndex >= 0 && newIndex < filteredPhotos.length) {
    openLightbox(newIndex);
  }
}

// Event listeners untuk controls
searchInput.addEventListener('input', filterPhotos);
categoryFilter.addEventListener('change', filterPhotos);
toggleViewBtn.addEventListener('click', toggleView);

// Event listeners untuk lightbox
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
lightboxNext.addEventListener('click', () => navigateLightbox('next'));

// Keyboard support untuk lightbox
lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
  } else if (e.key === 'ArrowLeft') {
    navigateLightbox('prev');
  } else if (e.key === 'ArrowRight') {
    navigateLightbox('next');
  }
});

// Tutup lightbox saat klik di luar gambar
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

// Inisialisasi saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
  initMusicSelect(); // Inisialisasi music select
  renderGallery(); // Render galeri awal

  // Trap focus di lightbox untuk accessibility
  lightbox.addEventListener('focusin', (e) => {
    if (e.target === lightbox && currentLightboxIndex !== null) {
      lightboxClose.focus();
    }
  });
});

// Handle resize window untuk responsive
window.addEventListener('resize', () => {
  renderGallery(); // Re-render jika perlu
});
