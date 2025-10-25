console.log("script.js running...");

// Elements
const form = document.getElementById('registrationForm');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

const studentBtn = document.getElementById('studentBtn');
const facultyBtn = document.getElementById('facultyBtn');
const studentForm = document.getElementById('registrationForm');
const facultyForm = document.getElementById('facultyRegistrationForm');
const facultyId = document.getElementById('facultyId');
const department = document.getElementById('department');
const facultyEmail = document.getElementById('facultyEmail');
const facultyPassword = document.getElementById('facultyPassword');
const facultyPassword2 = document.getElementById('facultyPassword2');

const submittedRecords = document.getElementById('submittedRecords');
const noRecordsMessage = document.getElementById('noRecordsMessage');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const successMessage = document.getElementById('successMessage');

// Helpers
function showError(input, message) {
    const formControl = input.parentElement;
    formControl.className = 'form-control error';
    formControl.querySelector('small').innerText = message;
}

function showSuccess(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
    formControl.querySelector('small').innerText = '';
}

function getFieldName(input) {
    return input.id.charAt(0).toUpperCase() + input.id.slice(1);
}

// =======================================================
// ✅ NEW VALIDATION FUNCTIONS
// =======================================================

// 1. Check Username Format (Starts with letter, allows only A-Z, 0-9, _, @)
function checkUsername(input) {
    // Regex: Must start with a letter (a-zA-Z) followed by any combination of letters, numbers, _, or @.
    const re = /^[a-zA-Z][a-zA-Z0-9_@]*$/;
    if (re.test(input.value.trim())) {
        showSuccess(input);
        return true;
    } else {
        showError(input, 'Username must start with a letter and contain only letters, numbers, _, or @.');
        return false;
    }
}

// 2. Check Password Length (min 6, max 8)
function checkPasswordLength(input, min, max) {
    if (input.value.length < min) {
        showError(input, `Password must be at least ${min} characters`);
        return false;
    } else if (input.value.length > max) {
        showError(input, `Password cannot be more than ${max} characters`);
        return false;
    } else {
        showSuccess(input);
        return true;
    }
}

// =======================================================
// EXISTING VALIDATION FUNCTIONS
// =======================================================

function checkRequired(inputs) {
    let valid = true;
    inputs.forEach(input => {
        if (input.value.trim() === '') {
            showError(input, `${getFieldName(input)} is required`);
            valid = false;
        } else {
            // We don't call showSuccess here as other checks might fail, leading to confusing green/red states.
        }
    });
    return valid;
}

function checkEmail(input) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (re.test(input.value.trim())) {
        showSuccess(input);
        return true;
    } else {
        showError(input, 'Email is not valid');
        return false;
    }
}

function checkPasswordsMatch(p1, p2) {
    if (p1.value !== p2.value) {
        showError(p2, 'Passwords do not match');
        return false;
    } else {
        showSuccess(p2);
        return true;
    }
}

// Storage
function getStoredRecords() {
    const records = localStorage.getItem('registrationRecords');
    return records ? JSON.parse(records) : [];
}

function saveRecord(record) {
    const records = getStoredRecords();
    records.push({ ...record, id: Date.now(), submittedAt: new Date().toLocaleString() });
    localStorage.setItem('registrationRecords', JSON.stringify(records));
}

function displayRecords() {
    const records = getStoredRecords();
    submittedRecords.innerHTML = '';

    if (records.length === 0) {
        noRecordsMessage.classList.remove('hidden');
        return;
    }
    noRecordsMessage.classList.add('hidden');

    records.forEach((record, i) => {
        const card = document.createElement('div');
        card.className = 'p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm flex justify-between items-center';
        card.innerHTML = `
            <div>
                <h4 class="font-semibold text-indigo-700 mb-1">${record.type === 'faculty' ? 'Faculty' : 'Student'} Record #${i + 1}</h4>
                ${record.type === 'faculty'
                    ? `<p><strong>ID:</strong> ${record.facultyId}</p><p><strong>Dept:</strong> ${record.department}</p>`
                    : `<p><strong>Username:</strong> ${record.username}</p>`}
                <p><strong>Email:</strong> ${record.email}</p>
                <p class="text-xs text-gray-500 mt-1">Submitted: ${record.submittedAt}</p>
            </div>
            <button class="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600">Delete</button>
        `;
        card.querySelector('button').addEventListener('click', () => {
            const updated = getStoredRecords().filter(r => r.id !== record.id);
            localStorage.setItem('registrationRecords', JSON.stringify(updated));
            displayRecords();
        });
        submittedRecords.appendChild(card);
    });
}

deleteAllBtn.addEventListener('click', () => {
    if (confirm('Delete all records?')) {
        localStorage.removeItem('registrationRecords');
        displayRecords();
    }
});

// =======================================================
// ✅ UPDATED SUBMIT HANDLERS
// =======================================================

// Student submit
form.addEventListener('submit', e => {
    e.preventDefault();
    
    // Run all validations and check if ALL are true
    const isRequired = checkRequired([username, email, password, password2]);
    const isUsernameValid = checkUsername(username); // NEW!
    const isEmailValid = checkEmail(email);
    const isPasswordLengthValid = checkPasswordLength(password, 6, 8); // NEW! (6 to 8 chars)
    const isPasswordMatch = checkPasswordsMatch(password, password2);

    if (isRequired && isUsernameValid && isEmailValid && isPasswordLengthValid && isPasswordMatch) {
        saveRecord({ type: 'student', username: username.value, email: email.value });
        form.reset();
        alert('Student registered successfully!');
        displayRecords();
    }
});

// Faculty submit
facultyForm.addEventListener('submit', e => {
    e.preventDefault();

    // Run all validations and check if ALL are true
    const isRequired = checkRequired([facultyId, department, facultyEmail, facultyPassword, facultyPassword2]);
    // NOTE: Faculty ID and Department do not have custom validation yet, so we only validate facultyEmail and passwords.
    const isEmailValid = checkEmail(facultyEmail);
    const isPasswordLengthValid = checkPasswordLength(facultyPassword, 6, 8); // NEW! (6 to 8 chars)
    const isPasswordMatch = checkPasswordsMatch(facultyPassword, facultyPassword2);

    // NOTE: For simplicity, we are skipping checkUsername for Faculty for now. If you need it, we can add it!

    if (isRequired && isEmailValid && isPasswordLengthValid && isPasswordMatch) {
        saveRecord({ type: 'faculty', facultyId: facultyId.value, department: department.value, email: facultyEmail.value });
        facultyForm.reset();
        alert('Faculty registered successfully!');
        displayRecords();
    }
});

// =======================================================
// Form Toggle Logic
// =======================================================

function setActiveForm(activeBtn, inactiveBtn, activeForm, inactiveForm) {
    // 1. Show active form and hide inactive form
    activeForm.classList.remove('hidden');
    inactiveForm.classList.add('hidden');

    // 2. Set active button style (Blue/Indigo background, white text)
    activeBtn.classList.add('bg-indigo-600', 'text-white');
    activeBtn.classList.remove('bg-gray-300', 'text-gray-700'); 

    // 3. Set inactive button style (Gray background, gray text)
    inactiveBtn.classList.add('bg-gray-300', 'text-gray-700');
    inactiveBtn.classList.remove('bg-indigo-600', 'text-white');
}

// Student button click handler
studentBtn.addEventListener('click', () => {
    setActiveForm(studentBtn, facultyBtn, studentForm, facultyForm);
});

// Faculty button click handler
facultyBtn.addEventListener('click', () => {
    setActiveForm(facultyBtn, studentBtn, facultyForm, studentForm);
});

displayRecords();