document.addEventListener('DOMContentLoaded', function() {
    // Initialize state
    let currentDate = new Date(2024, 2); // March 2024
    let monthlyBalance = 4000.00;
    let transactions = [];
    
    // Initialize transaction balances
    let transactionBalances = {
        'Flex-Spending': 1000.00,
        'Rent': 1000.00,
        'Gas': 1000.00,
        'Groceries': 1000.00
    };
    
    // Get DOM elements
    const monthDisplay = document.querySelector('.march-2024');
    const balanceDisplay = document.querySelector('.b');
    const previousButtons = document.querySelectorAll('.previous-icon, .previous-icon1');
    const ctx = document.getElementById('budgetPieChart').getContext('2d');
    
    // Define colors and icons
    const categoryColors = {
        'Groceries': '#4ECDC4',
        'Rent': '#96CEB4',
        'Gas': '#45B7D1',
        'Entertainment': '#FFEEAD',
        'Flex-Spending': '#FF6B6B'
    };
    
    const categoryIcons = {
        'Groceries': 'Grocery.png',
        'Rent': 'House.png',
        'Gas': 'gas station.png',
        'Entertainment': 'Party Hat.png',
        'Flex-Spending': 'Party Hat.png'
    };
    
    // Initialize pie chart
    let pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryColors),
            datasets: [{
                data: Object.values(transactionBalances),
                backgroundColor: Object.values(categoryColors),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Format currency function
    const formatCurrency = (amount) => {
        return `-$${Math.abs(parseFloat(amount)).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };
    
    // Update month display
    const updateMonth = () => {
        const monthYear = currentDate.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
        });
        monthDisplay.textContent = monthYear;
    };
    
    // Format date
    function formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }
    
    // Create category element
    function createCategoryElement(category) {
        return `
            <div class="flex-spending">
                <div class="ellipse-parent">
                    <div class="group-child" style="background-color: ${categoryColors[category]}"></div>
                    <img class="party-hat-icon" alt="" src="${categoryIcons[category]}">
                </div>
                <b class="${category.toLowerCase().replace('-', '')}">${category}</b>
            </div>
        `;
    }
    
    // Update recent transactions
    function updateRecentTransactions(newTransaction) {
        // Get containers
        const datesContainer = document.querySelector('.dates');
        const namesContainer = document.querySelector('.name');
        const categoriesContainer = document.querySelector('.category');
        const amountsContainer = document.querySelector('.amounts');
    
        // Create new elements
        const dateDiv = document.createElement('div');
        dateDiv.className = 'march-22-2024';
        dateDiv.textContent = formatDate(newTransaction.date);
    
        const nameDiv = document.createElement('div');
        nameDiv.className = 'bowlero-fun-station';
        nameDiv.textContent = newTransaction.name;
    
        const categoryDiv = document.createElement('div');
        categoryDiv.innerHTML = createCategoryElement(newTransaction.category);
    
        const amountDiv = document.createElement('div');
        amountDiv.className = 'amount';
        amountDiv.innerHTML = `
            <div class="amount-child"></div>
            <b class="b">${formatCurrency(newTransaction.amount)}</b>
        `;
    
        // Insert after header function
        function insertAfterHeader(container, newElement) {
            const header = container.querySelector('b');
            if (header && header.nextSibling) {
                container.insertBefore(newElement, header.nextSibling);
            } else {
                container.appendChild(newElement);
            }
        }
    
        // Insert new elements
        insertAfterHeader(datesContainer, dateDiv);
        insertAfterHeader(namesContainer, nameDiv);
        insertAfterHeader(categoriesContainer, categoryDiv);
        insertAfterHeader(amountsContainer, amountDiv);
    
        // Remove oldest if more than 5
        const maxTransactions = 5;
        [datesContainer, namesContainer, categoriesContainer, amountsContainer].forEach(container => {
            const items = container.children;
            if (items.length > maxTransactions + 1) {
                container.removeChild(items[items.length - 1]);
            }
        });
    }
    
    // Update pie chart
    function updatePieChart(transaction) {
        const categoryIndex = Object.keys(categoryColors).indexOf(transaction.category);
        if (categoryIndex !== -1) {
            pieChart.data.datasets[0].data[categoryIndex] += parseFloat(transaction.amount);
            pieChart.update();
            
            // Update transaction balances
            transactionBalances[transaction.category] += parseFloat(transaction.amount);
        }
    }
    
    // Update balance display
    const updateBalanceDisplay = () => {
        const totalTransactions = Object.values(transactionBalances)
            .reduce((acc, curr) => acc + curr, 0);
        monthlyBalance = 4000 - totalTransactions;
        balanceDisplay.textContent = formatCurrency(monthlyBalance);
    };
    
    // Show transaction detail popup
    const showTransactionDetail = (category, amount, date) => {
        const popup = document.createElement('div');
        popup.className = 'transaction-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        `;
        
        popup.innerHTML = `
            <h3>${category}</h3>
            <p>Amount: ${amount}</p>
            <p>Date: ${formatDate(date)}</p>
            <button onclick="this.parentElement.remove()">Close</button>
        `;
        
        document.body.appendChild(popup);
    };
    
    // Handle form submission
    const submitButton = document.querySelector('.submit');
    submitButton.addEventListener('click', function(e) {
        e.preventDefault();
    
        // Get form values
        const dateInput = document.querySelector('input[type="date"]');
        const amountInput = document.querySelector('input[type="number"]');
        const nameInput = document.querySelector('.name-input-child');
        const categorySelect = document.querySelector('.cateogry-input select');
    
        // Validate form
        if (!dateInput.value || !amountInput.value || !nameInput.value || !categorySelect.value) {
            alert('Please fill in all fields');
            return;
        }
    
        // Create transaction object
        const newTransaction = {
            date: dateInput.value,
            amount: parseFloat(amountInput.value),
            name: nameInput.value,
            category: categorySelect.value
        };
    
        // Add to transactions array
        transactions.push(newTransaction);
    
        // Update displays
        updateRecentTransactions(newTransaction);
        updatePieChart(newTransaction);
        updateBalanceDisplay();
    
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Transaction added successfully!';
        successMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 4px;
            z-index: 1000;
            animation: fadeOut 3s forwards;
        `;
        document.body.appendChild(successMessage);
    
        // Remove success message after animation
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    
        // Clear form
        dateInput.value = '';
        amountInput.value = '';
        nameInput.value = '';
        categorySelect.value = '';
    });
    
    // Set up month navigation
    previousButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            if (index === 0) {
                currentDate.setMonth(currentDate.getMonth() - 1);
            } else {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            updateMonth();
        });
    });
    
    // Style right arrow
    const rightArrow = document.querySelector('.previous-icon1');
    if (rightArrow) {
        rightArrow.style.transform = 'rotate(180deg)';
    }
    
    // Add necessary styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; }
        }
    
        @keyframes slideIn {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    
        .success-message {
            animation: fadeOut 3s forwards;
        }
    
        #pieChartContainer {
            width: 300px;
            height: 300px;
            margin: 0 auto;
            position: relative;
        }
    
        .amount, .march-22-2024, .bowlero-fun-station, .flex-spending {
            transition: all 0.3s ease;
        }
    
        .amount:hover, .march-22-2024:hover, .bowlero-fun-station:hover, .flex-spending:hover {
            transform: translateX(5px);
            background-color: rgba(0, 0, 0, 0.05);
        }
    `;
    document.head.appendChild(style);
    
    function updateTotal() {
        const total = Array.from(inputs).reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
        totalDisplay.textContent = `$${total.toFixed(2)}`;
    }
    
    inputs.forEach(input => {
        input.addEventListener('input', updateTotal);
    });
    
    // Handle form submission
    const form = modal.querySelector('#budget-setup-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    
        // Get values from form
        const budgetAmounts = {
            'Groceries': parseFloat(document.getElementById('groceries').value),
            'Rent': parseFloat(document.getElementById('rent').value),
            'Gas': parseFloat(document.getElementById('gas').value),
            'Flex-Spending': parseFloat(document.getElementById('flex-spending').value),
            'Entertainment': parseFloat(document.getElementById('entertainment').value)
        };
    
        // Store in localStorage
        localStorage.setItem('budgetAmounts', JSON.stringify(budgetAmounts));
        localStorage.setItem('initialSetupComplete', 'true');
    
        // Initialize dashboard with these values
        initializeDashboard(budgetAmounts);
    });
    
    });