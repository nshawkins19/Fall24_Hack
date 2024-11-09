document.addEventListener('DOMContentLoaded', function() {
    // Initialize state
    let currentDate = new Date(2024, 2); // March 2024
    let transactions = [];
    let pieChart = null;
    
    // Define colors and icons (keep existing definitions)
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

    // Create custom tooltip div if it doesn't exist
    let tooltipEl = document.getElementById('chartTooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartTooltip';
        tooltipEl.style.cssText = `
            opacity: 0;
            background: rgba(255, 255, 255, 0.95);
            position: absolute;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #ddd;
            font-family: Manrope;
            pointer-events: none;
            transition: opacity 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 300px;
            margin-top: 16px;
        `;
        document.querySelector('.pie-chart').appendChild(tooltipEl);
    }

    function initializePieChart() {
        const ctx = document.getElementById('budgetPieChart').getContext('2d');
        const savedBudgets = JSON.parse(localStorage.getItem('categoryBudgets')) || {};
        
        // Calculate spending for each category
        const categorySpending = {};
        transactions.forEach(transaction => {
            if (!categorySpending[transaction.category]) {
                categorySpending[transaction.category] = 0;
            }
            categorySpending[transaction.category] += parseFloat(transaction.amount);
        });

        // Prepare data for the chart
        const labels = Object.keys(savedBudgets);
        const data = {
            labels: labels,
            datasets: [{
                data: labels.map((category, index) => savedBudgets[category]),
                backgroundColor: Object.values(categoryColors),
                borderWidth: 1
            }]
        };

        // Destroy existing chart if it exists
        if (pieChart) {
            pieChart.destroy();
        }

        // Create new chart with custom tooltip
        pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        enabled: false, // Disable default tooltip
                        external: function(context) {
                            const {chart, tooltip} = context;
                            
                            if (tooltip.opacity === 0) {
                                tooltipEl.style.opacity = 0;
                                return;
                            }

                            const category = tooltip.title[0];
                            const totalBudget = savedBudgets[category];
                            const spent = categorySpending[category] || 0;
                            const remaining = totalBudget - spent;
                            
                            // Position below "Total Spent" text
                            const totalSpentEl = document.getElementById('totalSpent');
                            const chartContainer = document.querySelector('.pie-chart');
                            const containerRect = chartContainer.getBoundingClientRect();
                            const totalSpentRect = totalSpentEl.getBoundingClientRect();
                            
                            tooltipEl.style.left = '50%';
                            tooltipEl.style.transform = 'translateX(-50%)';
                            tooltipEl.style.top = `${totalSpentEl.offsetTop + totalSpentRect.height}px`;

                            // Update tooltip content
                            tooltipEl.innerHTML = `
                                <div style="margin-bottom: 8px;">
                                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                        <div style="width: 12px; height: 12px; background: ${categoryColors[category]}; margin-right: 8px; border-radius: 2px;"></div>
                                        <span style="font-size: 16px; font-weight: bold; color: #333;">${category}</span>
                                    </div>
                                    <div style="color: #555; font-size: 14px; margin-left: 20px;">
                                        <div style="margin-bottom: 4px;">Budget: $${totalBudget.toFixed(2)}</div>
                                        <div style="margin-bottom: 4px;">Spent: $${spent.toFixed(2)}</div>
                                        <div>Remaining: $${remaining.toFixed(2)}</div>
                                    </div>
                                </div>
                            `;

                            tooltipEl.style.opacity = 1;
                        }
                    }
                },
                onHover: function(event, elements) {
                    const chartContainer = document.querySelector('.pie-chart');
                    if (elements && elements.length) {
                        chartContainer.style.cursor = 'pointer';
                    } else {
                        chartContainer.style.cursor = 'default';
                        tooltipEl.style.opacity = 0;
                    }
                }
            }
        });

        // Update total spent display
        const totalSpent = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
        const totalBudget = Object.values(savedBudgets).reduce((sum, val) => sum + val, 0);
        document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)} / $${totalBudget.toFixed(2)}`;
    }

    // Handle form submission
    const submitButton = document.querySelector('.submit');
    const transactionForm = {
        date: document.querySelector('.date-inpurt input[type="date"]'),
        amount: document.querySelector('.amount-input input[type="number"]'),
        name: document.querySelector('.name-input input'),
        category: document.querySelector('.cateogry-input select')
    };

    submitButton.addEventListener('click', function(e) {
        e.preventDefault();

        // Log form values for debugging
        console.log('Form Values:', {
            date: transactionForm.date.value,
            amount: transactionForm.amount.value,
            name: transactionForm.name.value,
            category: transactionForm.category.value
        });

        // Validate form
        if (!transactionForm.date.value || 
            !transactionForm.amount.value || 
            !transactionForm.name.value || 
            !transactionForm.category.value) {
            alert('Please fill in all fields');
            return;
        }

        // Create transaction object
        const newTransaction = {
            date: transactionForm.date.value,
            amount: parseFloat(transactionForm.amount.value),
            name: transactionForm.name.value,
            category: transactionForm.category.value
        };

        // Add to transactions array
        transactions.push(newTransaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));

        // Update displays
        updateRecentTransactions(newTransaction);
        initializePieChart();

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

        // Reset form
        transactionForm.date.value = '';
        transactionForm.amount.value = '';
        transactionForm.name.value = '';
        transactionForm.category.value = '';
    });

    // Update recent transactions display
    function updateRecentTransactions(newTransaction) {
        const datesContainer = document.querySelector('.dates');
        const namesContainer = document.querySelector('.name');
        const categoriesContainer = document.querySelector('.category');
        const amountsContainer = document.querySelector('.amounts');

        // Create new elements
        const dateDiv = document.createElement('div');
        dateDiv.className = 'march-22-2024';
        dateDiv.textContent = new Date(newTransaction.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        const nameDiv = document.createElement('div');
        nameDiv.className = 'bowlero-fun-station';
        nameDiv.textContent = newTransaction.name;

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'flex-spending';
        categoryDiv.innerHTML = `
            <div class="ellipse-parent">
                <div class="group-child"></div>
                <img class="party-hat-icon" alt="" src="icons/${categoryIcons[newTransaction.category]}">
            </div>
            <b class="flex-spending1">${newTransaction.category}</b>
        `;

        const amountDiv = document.createElement('div');
        amountDiv.className = 'amount';
        amountDiv.innerHTML = `
            <div class="amount-child"></div>
            <b class="b">-$${Math.abs(newTransaction.amount).toFixed(2)}</b>
        `;

        // Insert new elements at the top (after the header)
        function insertAfterHeader(container, newElement) {
            const header = container.querySelector('b');
            if (header && header.nextSibling) {
                container.insertBefore(newElement, header.nextSibling);
            }
        }

        insertAfterHeader(datesContainer, dateDiv);
        insertAfterHeader(namesContainer, nameDiv);
        insertAfterHeader(categoriesContainer, categoryDiv);
        insertAfterHeader(amountsContainer, amountDiv);

        // Remove oldest entries if more than 5 transactions
        const maxTransactions = 5;
        [datesContainer, namesContainer, categoriesContainer, amountsContainer].forEach(container => {
            while (container.children.length > maxTransactions + 1) { // +1 for the header
                container.removeChild(container.lastChild);
            }
        });
    }

    // Load saved transactions on page load
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
        transactions.forEach(transaction => {
            updateRecentTransactions(transaction);
        });
        initializePieChart();
    }

    // Listen for budget updates
    window.addEventListener('budgetsSaved', function() {
        initializePieChart();
    });

    // Initialize chart if budgets exist
    const savedBudgets = localStorage.getItem('categoryBudgets');
    if (savedBudgets) {
        initializePieChart();
    }
});