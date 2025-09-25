const API_URL = 'http://localhost:3000/api';
const bookingList = document.getElementById('booking-list');
const historyMessage = document.getElementById('history-message');
const backBtn = document.getElementById('back-to-dashboard');

const user = JSON.parse(localStorage.getItem('healthnova_user'));
const token = localStorage.getItem('healthnova_token');

// Check if user is logged in
if (!token || !user) {
    window.location.href = 'index.html';
}

backBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

async function fetchHistory() {
    try {
        const res = await fetch(`${API_URL}/hospitals/history/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message);
        }

        const data = await res.json();
        displayHistory(data.bookings);

    } catch (error) {
        historyMessage.textContent = `Failed to fetch history: ${error.message}`;
        historyMessage.style.color = 'red';
    }
}

function displayHistory(bookings) {
    bookingList.innerHTML = '';
    if (bookings.length === 0) {
        historyMessage.textContent = 'You have no past bookings.';
        return;
    }
    historyMessage.textContent = '';

    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        // Format the date to be more readable
        const bookingDate = new Date(booking.date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
            <h3>${booking.hospitalName}</h3>
            <p><strong>Specialty Area:</strong> ${booking.specialties.split(',')[0]}</p> <p><strong>Booked on:</strong> ${bookingDate}</p>
        `;
        bookingList.appendChild(card);
    });
}

// Fetch history on page load
fetchHistory();