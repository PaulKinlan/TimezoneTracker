document.addEventListener('DOMContentLoaded', function() {
    const currentTimeElement = document.getElementById('current-time');
    const timezoneList = document.getElementById('timezone-list');
    const timezoneInput = document.getElementById('timezone-input');
    const timezoneOptions = document.getElementById('timezone-options');
    const addTimezoneBtn = document.getElementById('add-timezone-btn');

    let currentTimezones = [];
    let initialTimezones = [];

    function updateCurrentTime() {
        const now = moment();
        currentTimeElement.textContent = `Current Time: ${now.format('YYYY-MM-DD HH:mm:ss')} (${now.format('Z')})`;
    }

    function addTimezone(timezone) {
        if (!currentTimezones.includes(timezone)) {
            currentTimezones.push(timezone);
            renderTimezones();
            if (!arraysEqual(currentTimezones, initialTimezones)) {
                saveTimezones();
            }
        }
    }

    function removeTimezone(timezone) {
        const index = currentTimezones.indexOf(timezone);
        if (index > -1) {
            currentTimezones.splice(index, 1);
            renderTimezones();
            if (!arraysEqual(currentTimezones, initialTimezones)) {
                saveTimezones();
            }
        }
    }

    function renderTimezones() {
        timezoneList.innerHTML = '';
        currentTimezones.forEach(timezone => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${timezone}</span>
                <span class="time"></span>
                <span class="dst-info"></span>
                <button class="remove-btn">Remove</button>
            `;
            timezoneList.appendChild(li);

            li.querySelector('.remove-btn').addEventListener('click', function() {
                removeTimezone(timezone);
            });
        });
        updateTimezones();
    }

    function updateTimezones() {
        const timezones = timezoneList.querySelectorAll('li');
        timezones.forEach(li => {
            const timezone = li.querySelector('span').textContent;
            const timeElement = li.querySelector('.time');
            const dstInfoElement = li.querySelector('.dst-info');
            const time = moment().tz(timezone);
            timeElement.textContent = time.format('YYYY-MM-DD HH:mm:ss');
            
            const isDST = time.isDST();
            const dstOffset = time.utcOffset() / 60;
            
            if (isDST) {
                dstInfoElement.textContent = `DST: Yes (UTC${dstOffset >= 0 ? '+' : ''}${dstOffset})`;
                dstInfoElement.style.color = 'green';
            } else {
                dstInfoElement.textContent = `DST: No (UTC${dstOffset >= 0 ? '+' : ''}${dstOffset})`;
                dstInfoElement.style.color = 'red';
            }
        });
    }

    function populateTimezoneOptions() {
        const timezones = moment.tz.names();
        timezones.forEach(timezone => {
            const option = document.createElement('option');
            option.value = timezone;
            timezoneOptions.appendChild(option);
        });
    }

    function saveTimezones() {
        fetch('/save_timezones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ timezones: currentTimezones })
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('User not authenticated');
            }
            return response.json();
        })
        .then(result => {
            console.log(result.message);
            initialTimezones = [...currentTimezones];
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function loadTimezones() {
        if (!document.getElementById('timezone-list')) {
            return;
        }
        fetch('/get_timezones')
        .then(response => {
            if (response.status === 401) {
                throw new Error('User not authenticated');
            }
            return response.json();
        })
        .then(timezones => {
            currentTimezones = timezones;
            initialTimezones = [...timezones];
            renderTimezones();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    if (addTimezoneBtn) {
        addTimezoneBtn.addEventListener('click', function() {
            const newTimezone = timezoneInput.value.trim();
            if (newTimezone && moment.tz.zone(newTimezone)) {
                addTimezone(newTimezone);
                timezoneInput.value = '';
            } else {
                alert('Please enter a valid timezone from the list.');
            }
        });
    }

    populateTimezoneOptions();
    loadTimezones();

    setInterval(() => {
        updateCurrentTime();
        updateTimezones();
    }, 1000);

    updateCurrentTime();
});
