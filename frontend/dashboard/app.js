// frontend/dashboard/app.js

// --- SIMPLE SLIDER (works with your #slider-main .slide images) ---
document.addEventListener('DOMContentLoaded', () => {
  const sliderMain = document.getElementById('slider-main');
  if (sliderMain) {
    const slidesAll = Array.from(sliderMain.querySelectorAll('.slide'));
    const slides = slidesAll.filter(s => !s.classList.contains('clone'));
    if (slides.length > 0) {
      let slideIndex = 0;
      const AUTO_SLIDE_DELAY = 3000;
      let autoSlideTimer = null;

      const showSlide = (index) => {
        slidesAll.forEach(s => s.style.display = 'none');
        const trueIndex = ((index % slides.length) + slides.length) % slides.length;
        slides[trueIndex].style.display = 'block';
      };

      const startAuto = () => {
        clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(() => {
          slideIndex++;
          showSlide(slideIndex);
        }, AUTO_SLIDE_DELAY);
      };

      showSlide(slideIndex);
      startAuto();
      sliderMain.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
      sliderMain.addEventListener('mouseleave', startAuto);
    }
  }

  // --- DASHBOARD / SEARCH / HISTORY / BOOKING LOGIC ---
  const token = localStorage.getItem('healthnova_token');
  if (!token) {
    alert('Please log in to access the dashboard.');
    window.location.href = '../login/login.html';
    return;
  }

  const searchForm = document.getElementById('search-form');
  const hospitalListContainer = document.getElementById('hospital-list');
  const searchMessage = document.getElementById('search-message');

  const viewHistoryBtn = document.getElementById('view-history-btn');
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  const closeHistoryBtn = document.getElementById('close-history');

  const userGreetingSpan = document.getElementById('user-greeting');
  const storedUserName = localStorage.getItem('healthnova_user_name');
  if (userGreetingSpan) userGreetingSpan.textContent = `Hello, ${storedUserName || 'User'}!`;

  // --- Helpers: local history storage ---
  const HISTORY_KEY = 'healthnova_history';
  const MAX_HISTORY_ITEMS = 200;

  const loadHistoryFromLocal = () => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn('Failed to parse history from localStorage', e);
      return [];
    }
  };

  const saveHistoryToLocal = (arr) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, MAX_HISTORY_ITEMS)));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  };

  const addBookingToHistory = (hospital) => {
    const hist = loadHistoryFromLocal();
    hist.unshift(hospital); // newest first
    saveHistoryToLocal(hist);
  };

  // --- Card HTML (adds Book button when not rendering history) ---
  const escapeHtml = (str = '') => String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const createHospitalCardHTML = (hospital, options = {}) => {
    // If options.isHistory is true, don't include Book button
    const isHistory = !!options.isHistory;
    const name = escapeHtml(hospital.name || 'Unnamed Hospital');
    const city = escapeHtml(hospital.city || '');
    const specialties = escapeHtml(hospital.specialties || 'General');
    const cost = escapeHtml(hospital.avg_cost_category || 'N/A');
    const rating = escapeHtml(hospital.rating || 'N/A');
    const description = escapeHtml(hospital.description || 'A leading hospital providing excellent care.');
    const bookingInfo = options.bookingDate ? `<p><strong>Booked on:</strong> ${escapeHtml(options.bookingDate)}</p>` : '';

    // Data attributes on Book button to reconstruct hospital object on click
    const dataAttrs = `data-name="${name}" data-city="${city}" data-specialties="${specialties}" data-cost="${cost}" data-description="${description}" data-rating="${rating}"`;

    return `
      <div class="hospital-card">
        <div class="hospital-image">
          <img src="https://placehold.co/600x400/007bff/ffffff?text=${encodeURIComponent(name)}" alt="Image of ${name}">
        </div>
        <div class="hospital-info">
          <h3>${name}${city ? `, ${city}` : ''}</h3>
          <p><strong>Specialty:</strong> ${specialties}</p>
          <p><strong>Cost Category:</strong> ${cost}</p>
          <p><strong>Rating:</strong> ${rating}</p>
          <p class="description">${description}</p>
          ${bookingInfo}
          ${!isHistory ? `<div class="hospital-actions"><button class="btn-book btn-dash" ${dataAttrs}>Book</button></div>` : ''}
        </div>
      </div>
    `;
  };

  // --- Renderers ---
  const renderHospitalList = (hospitals) => {
    if (!hospitalListContainer || !searchMessage) return;
    hospitalListContainer.innerHTML = '';
    if (!hospitals || hospitals.length === 0) {
      searchMessage.textContent = 'No hospitals found matching your criteria.';
      searchMessage.style.display = 'block';
      hospitalListContainer.style.display = 'none';
      return;
    }
    searchMessage.style.display = 'none';
    hospitalListContainer.style.display = 'grid';
    hospitalListContainer.innerHTML = hospitals.map(h => createHospitalCardHTML(h, { isHistory: false })).join('');
  };

  const renderHistoryList = (historyArr) => {
    if (!historyList) return;
    historyList.innerHTML = '';
    if (!historyArr || historyArr.length === 0) {
      historyList.innerHTML = '<p class="message">No booking history yet.</p>';
      return;
    }
    historyList.innerHTML = historyArr.map(item => {
      return createHospitalCardHTML(item, { isHistory: true, bookingDate: item.bookingDate });
    }).join('');
  };

  // --- Event delegation for Book buttons inside results ---
  if (hospitalListContainer) {
    hospitalListContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-book');
      if (!btn) return;
      // Reconstruct hospital object from data- attributes
      const hospital = {
        name: btn.getAttribute('data-name') || 'Unnamed Hospital',
        city: btn.getAttribute('data-city') || '',
        specialties: btn.getAttribute('data-specialties') || 'General',
        avg_cost_category: btn.getAttribute('data-cost') || 'N/A',
        description: btn.getAttribute('data-description') || '',
        rating: btn.getAttribute('data-rating') || 'N/A',
        bookingDate: new Date().toLocaleString()
      };

      // Save to local history
      addBookingToHistory(hospital);

      // Provide immediate feedback to the user
      btn.textContent = 'Booked ✓';
      btn.disabled = true;

      // If history panel visible, refresh it
      if (historySection && historySection.style.display !== 'none') {
        const hist = loadHistoryFromLocal();
        renderHistoryList(hist);
      }

      // Small unobtrusive toast (temporary DOM)
      const toast = document.createElement('div');
      toast.className = 'booking-toast';
      toast.textContent = `Booked ${hospital.name}`;
      Object.assign(toast.style, {
        position: 'fixed',
        right: '1rem',
        bottom: '1rem',
        background: '#222',
        color: '#fff',
        padding: '0.6rem 0.9rem',
        borderRadius: '6px',
        zIndex: 9999,
        opacity: 0.95
      });
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    });
  }

  // --- History panel show/hide wiring ---
  if (viewHistoryBtn && historySection && closeHistoryBtn) {
    viewHistoryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const hist = loadHistoryFromLocal();
      renderHistoryList(hist);
      historySection.style.display = 'block';
      historySection.scrollIntoView({ behavior: 'smooth' });
    });

    closeHistoryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      historySection.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } else {
    if (!viewHistoryBtn) console.warn('viewHistoryBtn not found (id="view-history-btn")');
    if (!historySection) console.warn('historySection not found (id="history-section")');
    if (!closeHistoryBtn) console.warn('closeHistoryBtn not found (id="close-history")');
  }

  // --- Search form submit (unchanged logic, safe checks included) ---
  if (searchForm) {
    searchForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const cityEl = document.getElementById('city');
      const specialtiesEl = document.getElementById('specialties');
      const avgCostEl = document.getElementById('avg_cost_category');

      const city = cityEl ? cityEl.value : 'any';
      const specialties = specialtiesEl ? specialtiesEl.value : 'any';
      const avg_cost_category = avgCostEl ? avgCostEl.value : 'any';

      const query = new URLSearchParams({ city, specialties, avg_cost_category }).toString();
      const API_URL = `http://localhost:5500/api/hospitals/search?${query}`;

      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const hospitals = await res.json();
        renderHospitalList(hospitals);
      } catch (error) {
        console.error("Search Error:", error);
        if (searchMessage) {
          searchMessage.textContent = 'Failed to fetch hospital data. Please try again.';
          searchMessage.style.display = 'block';
        }
      }
    });
  }

  // Init UI state
  if (hospitalListContainer) hospitalListContainer.style.display = 'none';
  if (searchMessage) {
    searchMessage.textContent = 'Please use the filters above to find personalized hospital recommendations.';
    searchMessage.style.display = 'block';
  }
}); // end DOMContentLoaded
