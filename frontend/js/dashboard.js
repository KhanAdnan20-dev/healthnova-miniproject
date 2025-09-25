const API_URL = 'http://localhost:3000/api';

const userGreeting = document.getElementById('user-greeting');
const logoutBtn = document.getElementById('logout-btn');
const historyBtn = document.getElementById('history-btn');
const searchForm = document.getElementById('search-form');
const hospitalList = document.getElementById('hospital-list');
const searchMessage = document.getElementById('search-message');

const user = JSON.parse(localStorage.getItem('healthnova_user'));
const token = localStorage.getItem('healthnova_token');

// Check if user is logged in
if (!token || !user) {
    window.location.href = 'index.html';
} else {
    userGreeting.textContent = `Welcome, ${user.name}!`;
}

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('healthnova_user');
    localStorage.removeItem('healthnova_token');
    window.location.href = 'index.html';
});

// Go to history page
historyBtn.addEventListener('click', () => {
    window.location.href = 'history.html';
});

// Search for hospitals
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('city').value;
    const specialties = document.getElementById('specialties').value;
    const avg_cost_category = document.getElementById('avg_cost_category').value;

    const query = new URLSearchParams({ city, specialties, avg_cost_category }).toString();

    try {
        const res = await fetch(`${API_URL}/hospitals/search?${query}`);
        const hospitals = await res.json();
        displayHospitals(hospitals);
    } catch (error) {
        searchMessage.textContent = 'Failed to fetch hospitals.';
        searchMessage.style.color = 'red';
    }
});

function displayHospitals(hospitals) {
    hospitalList.innerHTML = '';
    if (hospitals.length === 0) {
        searchMessage.textContent = 'No hospitals found matching your criteria.';
        return;
    }
    searchMessage.textContent = '';

    hospitals.forEach(hospital => {
        const card = document.createElement('div');
        card.className = 'hospital-card';
        card.innerHTML = `
            <h3>${hospital.name}</h3>
            <p><strong>City:</strong> ${hospital.city}</p>
            <p><strong>Specialties:</strong> ${hospital.specialties}</p>
            <p><strong>Budget:</strong> ${hospital.avg_cost_category}</p>
            <p><strong>Rating:</strong> ${hospital.rating} / 5.0</p>
            <button class="book-btn" data-hospital-id="${hospital.id}">Book Now</button>
        `;
        hospitalList.appendChild(card);
    });
}

// Handle booking
hospitalList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('book-btn')) {
        const hospitalId = e.target.dataset.hospitalId;
        
        try {
            const res = await fetch(`${API_URL}/hospitals/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ hospitalId })
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Booking confirmed for ${data.hospitalName}! (Booking ID: ${data.bookingId})`);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            alert(`Booking failed: ${error.message}`);
        }
    }
});