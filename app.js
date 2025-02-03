const firebaseConfig = {
    apiKey: "AIzaSyCQ5sPjHDG-09oKvBNOVV4KaVJ_rfLVZ9w",
    authDomain: "expensetracker-2af6e.firebaseapp.com",
    projectId: "expensetracker-2af6e",
    storageBucket: "expensetracker-2af6e.firebasestorage.app",
    messagingSenderId: "325179168136",
    appId: "1:325179168136:web:b285fb780df845a268163d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        return db.collection("users").doc(user.uid).set({
            email: user.email,
            uid: user.uid
        });
    })
    .then(() => {
        alert("User registered successfully!");
    })
    .catch((error) => {
        alert(error.message);
    });
}


function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("tracker-section").style.display = "block";
        })
        .catch(error => alert(error.message));
}

function logout() {
    auth.signOut().then(() => {
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("tracker-section").style.display = "none";
    });
}

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("tracker-section").style.display = "block";
    } else {
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("tracker-section").style.display = "none";
    }
});

function saveIncome() {
    const income = document.getElementById("income").value;
    db.collection("income").doc(auth.currentUser.uid).set({
        amount: parseFloat(income),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
}

function addCategory() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Please log in first.");
        return;
    }

    const categoryName = document.getElementById("category").value;
    const budget = parseFloat(prompt("Enter budget for this category:"));

    db.collection("categories").add({
        userId: user.uid,
        name: categoryName,
        budget: budget
    })
    .then(() => {
        alert("Category added!");
        loadCategories();
    })
    .catch((error) => {
        alert(error.message);
    });
}

function loadCategories() {
    db.collection("categories").doc(auth.currentUser.uid).get().then(doc => {
        if (doc.exists) {
            const categories = doc.data();
            const select = document.getElementById("category-select");
            select.innerHTML = "";
            Object.keys(categories).forEach(cat => {
                const option = document.createElement("option");
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });
        }
    });
}

function addExpense() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Please log in first.");
        return;
    }

    const date = document.getElementById("date").value;
    const category = document.getElementById("category-select").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const description = document.getElementById("description").value;

    db.collection("expenses").add({
        userId: user.uid,
        date: firebase.firestore.Timestamp.fromDate(new Date(date)),
        category: category,
        amount: amount,
        description: description
    })
    .then(() => {
        alert("Expense added!");
        loadExpenses(); // Refresh the dashboard
    })
    .catch((error) => {
        alert(error.message);
    });
}


// Function to load expenses into dashboard
function loadExpenses() {
    db.collection("expenses").where("userId", "==", auth.currentUser.uid).orderBy("timestamp", "desc").onSnapshot(snapshot => {
        const table = document.getElementById("expenseTable");
        table.innerHTML = "<tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr>";
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = table.insertRow();
            row.insertCell(0).textContent = data.date;
            row.insertCell(1).textContent = data.category;
            row.insertCell(2).textContent = data.description;
            row.insertCell(3).textContent = data.amount;
        });
    });
}

auth.onAuthStateChanged(user => {
    if (user) {
        loadCategories();
        loadExpenses();
    }
});
