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

      // Create dot indicators
      const dotsContainer = document.getElementById('slider-dots');
      if (dotsContainer) {
        slides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
          dot.addEventListener('click', () => { slideIndex = i; showSlide(slideIndex); startAuto(); });
          dotsContainer.appendChild(dot);
        });
      }

      const updateDots = (index) => {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        const trueIndex = ((index % slides.length) + slides.length) % slides.length;
        dots.forEach((d, i) => d.classList.toggle('active', i === trueIndex));
      };

      const showSlide = (index) => {
        slidesAll.forEach(s => s.style.display = 'none');
        const trueIndex = ((index % slides.length) + slides.length) % slides.length;
        slides[trueIndex].style.display = 'block';
        updateDots(trueIndex);
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

      // Prev/Next button wiring
      const prevBtn = document.querySelector('.slider-btn.prev');
      const nextBtn = document.querySelector('.slider-btn.next');
      if (prevBtn) prevBtn.addEventListener('click', () => { slideIndex--; showSlide(slideIndex); startAuto(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { slideIndex++; showSlide(slideIndex); startAuto(); });
    }
  }



  const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Clear all user-related localStorage items
    localStorage.removeItem('healthnova_token');
    localStorage.removeItem('healthnova_user');
    localStorage.removeItem('healthnova_user_name');
    // Optionally clear other session info here

    // Redirect to login page
    window.location.href = '../login/login.html';
  });
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

  // --- Card HTML (adds Book button when not rendering history) ---
  // IMPORTANT: Add hospital.id to data attributes for booking!
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

    // Hospital ID is needed for backend booking!
    const dataAttrs = hospital.id ? 
      `data-id="${hospital.id}" data-name="${name}" data-city="${city}" data-specialties="${specialties}" data-cost="${cost}" data-description="${description}" data-rating="${rating}"` :
      `data-name="${name}" data-city="${city}" data-specialties="${specialties}" data-cost="${cost}" data-description="${description}" data-rating="${rating}"`;

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

  // --- Staggered card entrance animation helper ---
  const animateCards = (container) => {
    const cards = container.querySelectorAll('.hospital-card');
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 100);
    });
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
    animateCards(hospitalListContainer);
  };

  // --- Updated history renderer for backend response ---
  const renderHistoryList = (historyArr) => {
    if (!historyList) return;
    historyList.innerHTML = '';
    if (!historyArr || historyArr.length === 0) {
      historyList.innerHTML = '<p class="message">No booking history yet.</p>';
      return;
    }
    historyList.innerHTML = historyArr.map(item => {
      return createHospitalCardHTML({
        name: item.hospitalName,
        specialties: item.specialties,
        bookingDate: item.date
      }, { isHistory: true, bookingDate: item.date });
    }).join('');
    animateCards(historyList);
  };

  // --- Toast helper ---
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'booking-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  // --- Event delegation for Book buttons inside results ---
  if (hospitalListContainer) {
    hospitalListContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-book');
      if (!btn || btn.disabled) return;

      // Get hospitalId from data attribute
      const hospitalId = btn.getAttribute('data-id');
      if (!hospitalId) {
        alert('Hospital ID missing. Cannot book.');
        return;
      }
      const token = localStorage.getItem('healthnova_token');

      // Show loading state on button
      const originalText = btn.textContent;
      btn.innerHTML = '<span class="loading-spinner"></span>Booking…';
      btn.disabled = true;

      // POST booking to backend
      fetch('http://localhost:5500/api/hospitals/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hospitalId: hospitalId })
      })
      .then(res => res.json())
      .then(data => {
        btn.textContent = 'Booked ✓';
        btn.disabled = true;

        // Refresh history panel from backend if open
        if (historySection && historySection.classList.contains('open')) {
          const user = JSON.parse(localStorage.getItem('healthnova_user'));
          fetch(`http://localhost:5500/api/hospitals/history/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => {
              renderHistoryList(data.bookings);
            })
            .catch(() => {
              historyList.innerHTML = '<p class="message">Failed to load booking history.</p>';
            });
        }

        showToast(`Booked ${btn.getAttribute('data-name')}`);
      })
      .catch(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        alert('Booking failed. Please try again.');
      });
    });
  }

  // --- History panel show/hide wiring (fetch from backend) ---
  if (viewHistoryBtn && historySection && closeHistoryBtn) {
    viewHistoryBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('healthnova_token');
      const user = JSON.parse(localStorage.getItem('healthnova_user'));
      if (!token || !user) return alert('Please log in again.');

      // Show loading state on button
      viewHistoryBtn.innerHTML = '<span class="loading-spinner"></span>Loading…';
      viewHistoryBtn.disabled = true;

      try {
        const res = await fetch(`http://localhost:5500/api/hospitals/history/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        renderHistoryList(data.bookings); // Use backend response
      } catch (err) {
        console.error('Failed to fetch history', err);
        historyList.innerHTML = '<p class="message">Failed to load booking history.</p>';
      }
      viewHistoryBtn.textContent = 'View History';
      viewHistoryBtn.disabled = false;
      historySection.classList.add('open');
      historySection.scrollIntoView({ behavior: 'smooth' });
    });

    closeHistoryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      historySection.classList.remove('open');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } else {
    if (!viewHistoryBtn) console.warn('viewHistoryBtn not found (id="view-history-btn")');
    if (!historySection) console.warn('historySection not found (id="history-section")');
    if (!closeHistoryBtn) console.warn('closeHistoryBtn not found (id="close-history")');
  }

  // --- Search form submit (with loading state) ---
  if (searchForm) {
    const searchBtn = searchForm.querySelector('button[type="submit"]');
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

      // Show loading state
      if (searchBtn) { searchBtn.innerHTML = '<span class="loading-spinner"></span>Searching…'; searchBtn.disabled = true; }
      if (hospitalListContainer) {
        hospitalListContainer.style.display = 'none';
        hospitalListContainer.innerHTML = '';
      }
      if (searchMessage) {
        searchMessage.innerHTML = '<div class="search-loading"><span class="loading-spinner"></span><br>Searching hospitals…</div>';
        searchMessage.style.display = 'block';
      }

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
      } finally {
        if (searchBtn) { searchBtn.textContent = 'Search'; searchBtn.disabled = false; }
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

// logout button handler

// verify if above logout handler is correctly placed
