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
  };

  // --- Event delegation for Book buttons inside results ---
  if (hospitalListContainer) {
    hospitalListContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-book');
      if (!btn) return;

      // Get hospitalId from data attribute
      const hospitalId = btn.getAttribute('data-id');
      if (!hospitalId) {
        alert('Hospital ID missing. Cannot book.');
        return;
      }
      const token = localStorage.getItem('healthnova_token');

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
        if (historySection && historySection.style.display !== 'none') {
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

        // Toast
        const toast = document.createElement('div');
        toast.className = 'booking-toast';
        toast.textContent = `Booked ${btn.getAttribute('data-name')}`;
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
      })
      .catch(() => {
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

// logout button handler

// verify if above logout handler is correctly placed
